/// <reference types="mocha" />
import { html } from 'lit';
import { expect, fixture, oneEvent } from '@open-wc/testing';
import { Diagram } from '../src/diagram/diagram.js';
import type {
  DiagramChangeDetail,
  DiagramConnectDetail,
  DiagramDeleteDetail,
  DiagramEdge,
  DiagramNode,
  DiagramNodeMoveDetail,
  DiagramSelectDetail,
  DiagramViewportDetail,
} from '../src/diagram/diagram.js';
import { Flow } from '../src/diagram/flow.js';
import type { FlowNode } from '../src/diagram/flow.js';
import { resetDeprecationWarnings } from '../src/__internal/utils/deprecate.js';

if (!customElements.get('wc-diagram'))
  customElements.define('wc-diagram', Diagram);
if (!customElements.get('wc-flow')) customElements.define('wc-flow', Flow);

function makeNodes(): DiagramNode[] {
  return [
    { id: 'a', position: { x: 0, y: 0 }, headline: 'Alpha' },
    { id: 'b', position: { x: 300, y: 0 }, headline: 'Beta' },
  ];
}

async function mount(nodes: DiagramNode[]): Promise<Diagram> {
  const el = await fixture<Diagram>(
    html`<wc-diagram style="height: 400px" .nodes=${nodes}></wc-diagram>`,
  );
  await el.updateComplete;
  return el;
}

function nodeEl(el: Diagram, id: string): HTMLElement {
  return el.shadowRoot?.querySelector(
    `.diagram-node[data-id="${id}"]`,
  ) as HTMLElement;
}

function pointer(
  target: HTMLElement,
  type: string,
  clientX: number,
  clientY: number,
  pointerId = 7,
) {
  target.dispatchEvent(
    new PointerEvent(type, {
      pointerId,
      button: 0,
      clientX,
      clientY,
      bubbles: true,
      composed: true,
    }),
  );
}

function key(
  target: HTMLElement,
  name: string,
  shiftKey = false,
  altKey = false,
) {
  target.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: name,
      shiftKey,
      altKey,
      bubbles: true,
      composed: true,
    }),
  );
}

async function settle(el: Diagram) {
  await el.updateComplete;
  await new Promise(resolve => {
    requestAnimationFrame(resolve);
  });
  await el.updateComplete;
}

function viewportEl(el: Diagram): HTMLElement {
  return el.shadowRoot?.querySelector('.diagram-viewport') as HTMLElement;
}

/** Resolves on the next settled `viewport-change`, after an animated move. */
function waitForSettled(el: Diagram): Promise<void> {
  return new Promise(resolve => {
    const onChange = (e: Event) => {
      if ((e as CustomEvent<DiagramViewportDetail>).detail.settled) {
        el.removeEventListener('viewport-change', onChange);
        resolve();
      }
    };
    el.addEventListener('viewport-change', onChange);
  });
}

describe('wc-diagram', () => {
  it('drags a node with pointer events and fires node-drag-end once', async () => {
    const nodes = makeNodes();
    const el = await mount(nodes);
    const a = nodeEl(el, 'a');
    const drags: DiagramNodeMoveDetail[] = [];
    const ends: DiagramNodeMoveDetail[] = [];
    el.addEventListener('node-drag', e =>
      drags.push((e as CustomEvent<DiagramNodeMoveDetail>).detail),
    );
    el.addEventListener('node-drag-end', e =>
      ends.push((e as CustomEvent<DiagramNodeMoveDetail>).detail),
    );

    pointer(a, 'pointerdown', 100, 100);
    pointer(a, 'pointermove', 120, 110);
    pointer(a, 'pointermove', 140, 130);
    pointer(a, 'pointerup', 140, 130);
    // A stray move after the drag ended does nothing.
    pointer(a, 'pointermove', 200, 200);
    await el.updateComplete;

    expect(drags.length).to.equal(2);
    expect(ends).to.deep.equal([{ id: 'a', position: { x: 40, y: 30 } }]);
    expect(el.nodes.find(n => n.id === 'a')?.position).to.deep.equal({
      x: 40,
      y: 30,
    });
    expect(nodeEl(el, 'a').style.left).to.equal('40px');
  });

  it('never mutates the nodes it was given', async () => {
    const nodes = makeNodes();
    const original = nodes[0];
    const originalPosition = nodes[0].position;
    const el = await mount(nodes);
    const a = nodeEl(el, 'a');

    pointer(a, 'pointerdown', 0, 0);
    pointer(a, 'pointermove', 50, 0);
    pointer(a, 'pointerup', 50, 0);
    await el.updateComplete;

    expect(el.nodes).to.not.equal(nodes);
    expect(el.nodes[0]).to.not.equal(original);
    expect(el.nodes[1]).to.equal(nodes[1]);
    expect(original.position).to.equal(originalPosition);
    expect(originalPosition).to.deep.equal({ x: 0, y: 0 });
    expect(el.nodes[0].data).to.equal(original.data);
  });

  it('scales the drag by the zoom', async () => {
    const el = await mount(makeNodes());
    el.zoom = 2;
    await el.updateComplete;
    const a = nodeEl(el, 'a');
    setTimeout(() => {
      pointer(a, 'pointerdown', 0, 0);
      pointer(a, 'pointermove', 40, 20);
      pointer(a, 'pointerup', 40, 20);
    });
    const end = (await oneEvent(
      el,
      'node-drag-end',
    )) as CustomEvent<DiagramNodeMoveDetail>;
    expect(end.detail.position).to.deep.equal({ x: 20, y: 10 });
  });

  it('selects on a press without movement instead of dragging', async () => {
    const el = await mount(makeNodes());
    const b = nodeEl(el, 'b');
    let ended = false;
    el.addEventListener('node-drag-end', () => {
      ended = true;
    });
    setTimeout(() => {
      pointer(b, 'pointerdown', 10, 10);
      pointer(b, 'pointermove', 11, 10);
      pointer(b, 'pointerup', 11, 10);
    });
    const event = (await oneEvent(
      el,
      'select',
    )) as CustomEvent<DiagramSelectDetail>;
    await el.updateComplete;
    expect(event.detail.id).to.equal('b');
    expect(el.selected).to.equal('b');
    expect(ended).to.equal(false);
    expect(nodeEl(el, 'b').getAttribute('aria-current')).to.equal('true');
  });

  it('makes nodes focusable and moves the focused node with arrow keys', async () => {
    const nodes = makeNodes();
    const el = await mount(nodes);
    const a = nodeEl(el, 'a');
    expect(a.getAttribute('tabindex')).to.equal('0');
    expect(a.getAttribute('aria-label')).to.equal('Alpha');

    const ends: DiagramNodeMoveDetail[] = [];
    el.addEventListener('node-drag-end', e =>
      ends.push((e as CustomEvent<DiagramNodeMoveDetail>).detail),
    );

    key(a, 'ArrowRight');
    await el.updateComplete;
    key(nodeEl(el, 'a'), 'ArrowDown');
    await el.updateComplete;
    key(nodeEl(el, 'a'), 'ArrowLeft', true);
    await el.updateComplete;

    expect(ends.map(e => e.position)).to.deep.equal([
      { x: 20, y: 0 },
      { x: 20, y: 20 },
      { x: -80, y: 20 },
    ]);
    expect(el.nodes[0].position).to.deep.equal({ x: -80, y: 20 });
    expect(nodes[0].position).to.deep.equal({ x: 0, y: 0 });
    // The same element stays rendered, so focus is not lost.
    expect(nodeEl(el, 'a')).to.equal(a);
  });

  it('selects the focused node with Enter or Space', async () => {
    const el = await mount(makeNodes());
    setTimeout(() => key(nodeEl(el, 'b'), ' '));
    const event = (await oneEvent(
      el,
      'select',
    )) as CustomEvent<DiagramSelectDetail>;
    expect(event.detail.id).to.equal('b');
    expect(event.bubbles).to.equal(true);
    expect(event.composed).to.equal(true);
  });

  it('draws a connection preview while an output handle is dragged', async () => {
    const el = await mount(makeNodes());
    const handle = el.shadowRoot?.querySelector(
      '.diagram-node[data-id="a"] .handle-output',
    ) as HTMLElement;
    pointer(handle, 'pointerdown', 10, 10);
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('.diagram-edge-preview')).to.not.equal(
      null,
    );
    pointer(handle, 'pointerup', -1000, -1000);
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('.diagram-edge-preview')).to.equal(
      null,
    );
  });

  describe('infinite canvas', () => {
    it('starts by fitting content far from the origin, never above 100%', async () => {
      const el = await mount([
        { id: 'far', position: { x: 5000, y: -3000 }, headline: 'Far' },
      ]);
      await settle(el);
      const { zoom } = el.view;
      expect(zoom).to.be.at.most(1);
      const box = nodeEl(el, 'far').getBoundingClientRect();
      const frame = el.getBoundingClientRect();
      expect(box.left).to.be.at.least(frame.left);
      expect(box.right).to.be.at.most(frame.right);
      expect(box.top).to.be.at.least(frame.top);
      expect(box.bottom).to.be.at.most(frame.bottom);
    });

    it('starts at the origin or at an exact start-view', async () => {
      const origin = await fixture<Diagram>(
        html`<wc-diagram
          style="height: 400px"
          start-position="origin"
          .nodes=${makeNodes()}
        ></wc-diagram>`,
      );
      await settle(origin);
      expect(origin.view).to.deep.equal({ x: 0, y: 0, zoom: 1 });

      const exact = await fixture<Diagram>(
        html`<wc-diagram
          style="height: 400px"
          .startView=${{ x: -120, y: 40, zoom: 0.5 }}
          .nodes=${makeNodes()}
        ></wc-diagram>`,
      );
      await settle(exact);
      expect(exact.view).to.deep.equal({ x: -120, y: 40, zoom: 0.5 });
    });

    it('pans with the wheel and zooms around the pointer with Ctrl + wheel', async () => {
      const el = await mount(makeNodes());
      await settle(el);
      const start = el.view;
      const vp = viewportEl(el);
      vp.dispatchEvent(
        new WheelEvent('wheel', {
          deltaX: 30,
          deltaY: 100,
          bubbles: true,
          cancelable: true,
        }),
      );
      expect(el.view.x).to.equal(start.x - 30);
      expect(el.view.y).to.equal(start.y - 100);

      const rect = vp.getBoundingClientRect();
      const before = el.view;
      vp.dispatchEvent(
        new WheelEvent('wheel', {
          deltaY: -40,
          ctrlKey: true,
          clientX: rect.left + 10,
          clientY: rect.top + 10,
          bubbles: true,
          cancelable: true,
        }),
      );
      expect(el.view.zoom).to.be.greaterThan(before.zoom);
      // The canvas point under the pointer stays put.
      const cx = (10 - before.x) / before.zoom;
      expect((10 - el.view.x) / el.view.zoom).to.be.closeTo(cx, 0.001);
      await el.updateComplete;
      expect(el.zoom).to.equal(el.view.zoom);
    });

    it('pans when the background is dragged, without limits, and reports the view', async () => {
      const el = await mount(makeNodes());
      await settle(el);
      const start = el.view;
      const details: DiagramViewportDetail[] = [];
      el.addEventListener('viewport-change', e =>
        details.push((e as CustomEvent<DiagramViewportDetail>).detail),
      );
      const vp = viewportEl(el);
      pointer(vp, 'pointerdown', 100, 100);
      pointer(vp, 'pointermove', 5100, 4100);
      pointer(vp, 'pointerup', 5100, 4100);
      expect(el.view.x).to.equal(start.x + 5000);
      expect(el.view.y).to.equal(start.y + 4000);
      const last = details[details.length - 1];
      expect(last.settled).to.equal(true);
      expect(last.x).to.equal(start.x + 5000);
    });

    it('shows "Back to content" when nothing is in view and flies home', async () => {
      const el = await mount(makeNodes());
      await settle(el);
      const home = el.view;
      el.view = { x: 20000, y: 20000, zoom: 1 };
      await el.updateComplete;
      const back = el.shadowRoot?.querySelector(
        '.back-to-content',
      ) as HTMLElement;
      expect(back).to.not.equal(null);

      setTimeout(() => el.home());
      await waitForSettled(el);
      expect(el.view.x).to.be.closeTo(home.x, 0.01);
      expect(el.view.y).to.be.closeTo(home.y, 0.01);
      expect(el.view.zoom).to.be.closeTo(home.zoom, 0.0001);
      await el.updateComplete;
      expect(el.shadowRoot?.querySelector('.back-to-content')).to.equal(null);
    });

    it('zooms with the zoom property and with the keyboard', async () => {
      const el = await mount(makeNodes());
      await settle(el);
      el.zoom = 2;
      await el.updateComplete;
      expect(el.view.zoom).to.equal(2);
      el.zoom = 50;
      await el.updateComplete;
      expect(el.view.zoom).to.equal(el.maxZoom);

      setTimeout(() =>
        viewportEl(el).dispatchEvent(
          new KeyboardEvent('keydown', {
            key: '-',
            bubbles: true,
            composed: true,
          }),
        ),
      );
      await waitForSettled(el);
      expect(el.view.zoom).to.be.closeTo(el.maxZoom / 1.25, 0.001);
    });

    it('renders only nodes near the view', async () => {
      const el = await fixture<Diagram>(
        html`<wc-diagram
          style="height: 400px"
          start-position="origin"
          .nodes=${[
            { id: 'near', position: { x: 20, y: 20 }, headline: 'Near' },
            { id: 'away', position: { x: 9000, y: 9000 }, headline: 'Away' },
          ]}
        ></wc-diagram>`,
      );
      await settle(el);
      expect(nodeEl(el, 'near')).to.not.equal(null);
      expect(nodeEl(el, 'away')).to.equal(null);
      setTimeout(() => el.zoomTo('away'));
      await waitForSettled(el);
      await el.updateComplete;
      expect(nodeEl(el, 'away')).to.not.equal(null);
    });
  });

  describe('nodes and ports', () => {
    it('draws ports where the node says, and the built-in card', async () => {
      const el = await mount([
        {
          id: 'a',
          position: { x: 0, y: 0 },
          headline: 'Review',
          supportingText: 'Approval',
          icon: 'how_to_reg',
          ports: [
            { id: 'in', side: 'top', type: 'target' },
            { id: 'yes', side: 'bottom', type: 'source' },
            { id: 'no', side: 'bottom', type: 'source' },
          ],
        },
      ]);
      const ports = Array.from(
        nodeEl(el, 'a').querySelectorAll<HTMLElement>('.handle'),
      );
      expect(ports.map(p => p.dataset.port)).to.deep.equal(['in', 'yes', 'no']);
      expect(ports[1].classList.contains('handle-position-bottom')).to.equal(
        true,
      );
      expect(ports[1].style.getPropertyValue('--_offset')).to.equal(
        `${(1 / 3) * 100}%`,
      );
      expect(nodeEl(el, 'a').textContent).to.contain('Approval');
    });

    it('shows slotted content in place of the built-in card', async () => {
      const el = await fixture<Diagram>(
        html`<wc-diagram style="height: 400px" .nodes=${makeNodes()}>
          <div slot="node:a">Custom card</div>
        </wc-diagram>`,
      );
      await el.updateComplete;
      const slot = nodeEl(el, 'a').querySelector('slot') as HTMLSlotElement;
      expect(slot.assignedElements()[0]?.textContent).to.equal('Custom card');
      expect(
        nodeEl(el, 'a').classList.contains('diagram-node-custom'),
      ).to.equal(true);
    });

    it('warns once about deprecated inputs and outputs, and still draws them', async () => {
      resetDeprecationWarnings();
      const warnings: string[] = [];
      const original = console.warn;
      console.warn = (m: string) => warnings.push(m);
      try {
        const el = await mount([
          {
            id: 'a',
            position: { x: 0, y: 0 },
            headline: 'A',
            outputs: ['bottom'],
          },
        ]);
        expect(
          nodeEl(el, 'a').querySelector(
            '.handle-output.handle-position-bottom',
          ),
        ).to.not.equal(null);
      } finally {
        console.warn = original;
      }
      expect(warnings.some(w => w.includes('`ports`'))).to.equal(true);
    });

    it('moves focus to the nearest node with Alt + arrow', async () => {
      const el = await mount(makeNodes());
      await settle(el);
      key(nodeEl(el, 'a'), 'ArrowRight', false, true);
      await el.updateComplete;
      await el.updateComplete;
      expect(el.shadowRoot?.activeElement).to.equal(nodeEl(el, 'b'));
      expect(el.nodes[0].position).to.deep.equal({ x: 0, y: 0 });
    });
  });

  describe('editing', () => {
    async function mountEditable(
      nodes = makeNodes(),
      edges: DiagramEdge[] = [],
    ) {
      const el = await fixture<Diagram>(
        html`<wc-diagram
          style="height: 400px"
          editable
          .nodes=${nodes}
          .edges=${edges}
        ></wc-diagram>`,
      );
      await settle(el);
      return el;
    }

    function dragConnection(el: Diagram, from: string, to: string) {
      const out = el.shadowRoot?.querySelector(
        `.diagram-node[data-id="${from}"] .handle-output`,
      ) as HTMLElement;
      const target = el.shadowRoot?.querySelector(
        `.diagram-node[data-id="${to}"] .handle-input`,
      ) as HTMLElement;
      const a = out.getBoundingClientRect();
      const b = target.getBoundingClientRect();
      pointer(out, 'pointerdown', a.left + a.width / 2, a.top + a.height / 2);
      pointer(out, 'pointermove', b.left + b.width / 2, b.top + b.height / 2);
      pointer(out, 'pointerup', b.left + b.width / 2, b.top + b.height / 2);
    }

    it('fires connect without adding the edge unless editable', async () => {
      const el = await mount(makeNodes());
      await settle(el);
      const events: DiagramConnectDetail[] = [];
      el.addEventListener('connect', e =>
        events.push((e as CustomEvent<DiagramConnectDetail>).detail),
      );
      dragConnection(el, 'a', 'b');
      expect(events).to.deep.equal([
        {
          source: 'a',
          target: 'b',
          sourceHandle: 'right',
          targetHandle: 'left',
        },
      ]);
      expect(el.edges).to.deep.equal([]);
    });

    it('adds the edge on connect when editable, unless the event is canceled', async () => {
      const el = await mountEditable();
      const changes: DiagramChangeDetail[] = [];
      el.addEventListener('change', e =>
        changes.push((e as CustomEvent<DiagramChangeDetail>).detail),
      );
      dragConnection(el, 'a', 'b');
      expect(el.edges).to.have.length(1);
      expect(el.edges[0]).to.include({ source: 'a', target: 'b' });
      expect(changes.map(c => c.reason)).to.deep.equal(['connect']);

      el.addEventListener('connect', e => e.preventDefault(), { once: true });
      dragConnection(el, 'b', 'a');
      expect(el.edges).to.have.length(1);
    });

    it('selects an edge and deletes it, with undo and redo', async () => {
      const el = await mountEditable(makeNodes(), [
        { id: 'e1', source: 'a', target: 'b', label: 'next' },
      ]);
      await el.updateComplete;
      const hit = el.shadowRoot?.querySelector(
        '.diagram-edge-group[data-id="e1"]',
      ) as SVGGElement;
      setTimeout(() =>
        pointer(hit as unknown as HTMLElement, 'pointerdown', 0, 0),
      );
      const select = (await oneEvent(
        el,
        'select',
      )) as CustomEvent<DiagramSelectDetail>;
      expect(select.detail).to.include({ id: 'e1', kind: 'edge' });
      expect(el.selectedEdges).to.deep.equal(['e1']);
      expect(
        el.shadowRoot
          ?.querySelector('.diagram-edge-label')
          ?.textContent?.trim(),
      ).to.equal('next');

      setTimeout(() => el.deleteSelection());
      const change = (await oneEvent(
        el,
        'change',
      )) as CustomEvent<DiagramChangeDetail>;
      expect(change.detail.reason).to.equal('delete');
      expect(el.edges).to.deep.equal([]);
      expect(el.canUndo).to.equal(true);

      el.undo();
      expect(el.edges.map(e => e.id)).to.deep.equal(['e1']);
      el.redo();
      expect(el.edges).to.deep.equal([]);
    });

    it('deletes a node and its edges with Delete; a canceled delete keeps them', async () => {
      const el = await mountEditable(makeNodes(), [
        { id: 'e1', source: 'a', target: 'b' },
      ]);
      el.addEventListener('delete', e => e.preventDefault(), { once: true });
      key(nodeEl(el, 'a'), 'Delete');
      await el.updateComplete;
      expect(el.nodes).to.have.length(2);

      const changed = oneEvent(el, 'change');
      setTimeout(() => key(nodeEl(el, 'a'), 'Delete'));
      const del = (await oneEvent(
        el,
        'delete',
      )) as CustomEvent<DiagramDeleteDetail>;
      expect(del.detail).to.deep.equal({ nodes: ['a'], edges: ['e1'] });
      await changed;
      expect(el.nodes.map(n => n.id)).to.deep.equal(['b']);
      expect(el.edges).to.deep.equal([]);
    });

    it('selects with a Shift + drag marquee and copies and pastes', async () => {
      const el = await mountEditable();
      const vp = viewportEl(el);
      const r = vp.getBoundingClientRect();
      vp.dispatchEvent(
        new PointerEvent('pointerdown', {
          pointerId: 3,
          button: 0,
          shiftKey: true,
          clientX: r.left + 2,
          clientY: r.top + 2,
          bubbles: true,
          composed: true,
        }),
      );
      pointer(vp, 'pointermove', r.right - 2, r.bottom - 2, 3);
      await el.updateComplete;
      expect(el.shadowRoot?.querySelector('.diagram-marquee')).to.not.equal(
        null,
      );
      pointer(vp, 'pointerup', r.right - 2, r.bottom - 2, 3);
      expect(el.selectedNodes.sort()).to.deep.equal(['a', 'b']);

      const ctrl = (k: string) =>
        vp.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: k,
            ctrlKey: true,
            bubbles: true,
            composed: true,
          }),
        );
      ctrl('c');
      ctrl('v');
      expect(el.nodes.map(n => n.id)).to.deep.equal([
        'a',
        'b',
        'a-copy',
        'b-copy',
      ]);
      expect(el.nodes[2].position).to.deep.equal({ x: 40, y: 40 });
      expect(el.selectedNodes.sort()).to.deep.equal(['a-copy', 'b-copy']);
      ctrl('z');
      expect(el.nodes).to.have.length(2);
    });

    it('moves every selected node together and records one undo step', async () => {
      const el = await mountEditable([
        { id: 'a', position: { x: 0, y: 0 }, headline: 'A' },
        { id: 'b', position: { x: 300, y: 300 }, headline: 'B' },
      ]);
      el.selectAll();
      await el.updateComplete;
      const a = nodeEl(el, 'a');
      const z = el.view.zoom;
      pointer(a, 'pointerdown', 0, 0);
      pointer(a, 'pointermove', 50 * z, 20 * z);
      pointer(a, 'pointerup', 50 * z, 20 * z);
      expect(el.nodes.map(n => n.position)).to.deep.equal([
        { x: 50, y: 20 },
        { x: 350, y: 320 },
      ]);
      el.undo();
      expect(el.nodes.map(n => n.position)).to.deep.equal([
        { x: 0, y: 0 },
        { x: 300, y: 300 },
      ]);
    });
  });
});

describe('wc-flow (deprecated alias of wc-diagram)', () => {
  it('renders like wc-diagram and warns once to use wc-diagram', async () => {
    resetDeprecationWarnings();
    const warnings: string[] = [];
    const original = console.warn;
    console.warn = (m: string) => warnings.push(m);
    let el: Flow;
    try {
      const nodes: FlowNode[] = makeNodes();
      el = await fixture<Flow>(
        html`<wc-flow style="height: 400px" .nodes=${nodes}></wc-flow>`,
      );
      await fixture(html`<wc-flow style="height: 200px"></wc-flow>`);
      await el.updateComplete;
    } finally {
      console.warn = original;
    }
    expect(el).to.be.instanceOf(Diagram);
    expect(
      el.shadowRoot?.querySelectorAll('.diagram-node[data-id]').length,
    ).to.equal(2);
    const tagWarnings = warnings.filter(w => w.includes('`wc-flow` tag'));
    expect(tagWarnings.length).to.equal(1);
    expect(tagWarnings[0]).to.include('`wc-diagram`');
    expect(tagWarnings[0]).to.include('5.0');
  });

  it('still reads the deprecated --flow-* custom properties', async () => {
    const el = await fixture<Flow>(
      html`<wc-flow
        style="height: 200px; --flow-background: rgb(1, 2, 3)"
      ></wc-flow>`,
    );
    await el.updateComplete;
    expect(
      getComputedStyle(el).getPropertyValue('--diagram-background').trim(),
    ).to.equal('rgb(1, 2, 3)');
  });
});
