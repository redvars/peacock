/// <reference types="mocha" />
import { html } from 'lit';
import { expect, fixture, oneEvent } from '@open-wc/testing';
import { Flow } from '../src/flow/flow.js';
import type {
  FlowNode,
  FlowNodeMoveDetail,
  FlowSelectDetail,
} from '../src/flow/flow.js';

if (!customElements.get('wc-flow')) customElements.define('wc-flow', Flow);

function makeNodes(): FlowNode[] {
  return [
    { id: 'a', position: { x: 0, y: 0 }, data: { label: 'Alpha' } },
    { id: 'b', position: { x: 300, y: 0 }, data: { label: 'Beta' } },
  ];
}

async function mount(nodes: FlowNode[]): Promise<Flow> {
  const el = await fixture<Flow>(
    html`<wc-flow style="height: 400px" .nodes=${nodes}></wc-flow>`,
  );
  await el.updateComplete;
  return el;
}

function nodeEl(el: Flow, id: string): HTMLElement {
  return el.shadowRoot?.querySelector(
    `.flow-node[data-id="${id}"]`,
  ) as HTMLElement;
}

function pointer(
  target: HTMLElement,
  type: string,
  clientX: number,
  clientY: number,
) {
  target.dispatchEvent(
    new PointerEvent(type, {
      pointerId: 7,
      button: 0,
      clientX,
      clientY,
      bubbles: true,
      composed: true,
    }),
  );
}

function key(target: HTMLElement, name: string, shiftKey = false) {
  target.dispatchEvent(
    new KeyboardEvent('keydown', { key: name, shiftKey, bubbles: true }),
  );
}

describe('wc-flow', () => {
  it('drags a node with pointer events and fires node-drag-end once', async () => {
    const nodes = makeNodes();
    const el = await mount(nodes);
    const a = nodeEl(el, 'a');
    const drags: FlowNodeMoveDetail[] = [];
    const ends: FlowNodeMoveDetail[] = [];
    el.addEventListener('node-drag', e =>
      drags.push((e as CustomEvent<FlowNodeMoveDetail>).detail),
    );
    el.addEventListener('node-drag-end', e =>
      ends.push((e as CustomEvent<FlowNodeMoveDetail>).detail),
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
    )) as CustomEvent<FlowNodeMoveDetail>;
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
    )) as CustomEvent<FlowSelectDetail>;
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

    const ends: FlowNodeMoveDetail[] = [];
    el.addEventListener('node-drag-end', e =>
      ends.push((e as CustomEvent<FlowNodeMoveDetail>).detail),
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
    )) as CustomEvent<FlowSelectDetail>;
    expect(event.detail.id).to.equal('b');
    expect(event.bubbles).to.equal(true);
    expect(event.composed).to.equal(true);
  });

  it('draws a connection preview while an output handle is dragged', async () => {
    const el = await mount(makeNodes());
    const handle = el.shadowRoot?.querySelector(
      '.flow-node[data-id="a"] .handle-output',
    ) as HTMLElement;
    pointer(handle, 'pointerdown', 10, 10);
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('.flow-edge-preview')).to.not.equal(
      null,
    );
    pointer(handle, 'pointerup', -1000, -1000);
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('.flow-edge-preview')).to.equal(null);
  });
});
