/// <reference types="mocha" />
import { html } from 'lit';
import { expect, fixture } from '@open-wc/testing';
import { Diagram } from '../src/diagram/diagram.js';
import { DiagramControls } from '../src/diagram-controls/diagram-controls.js';
import { DiagramMinimap } from '../src/diagram-minimap/diagram-minimap.js';
import type {
  DiagramNode,
  DiagramViewportDetail,
} from '../src/diagram/diagram.js';

if (!customElements.get('wc-diagram'))
  customElements.define('wc-diagram', Diagram);
if (!customElements.get('wc-diagram-controls')) {
  customElements.define('wc-diagram-controls', DiagramControls);
}
if (!customElements.get('wc-diagram-minimap')) {
  customElements.define('wc-diagram-minimap', DiagramMinimap);
}

const nodes: DiagramNode[] = [
  { id: 'a', position: { x: 0, y: 0 }, headline: 'Alpha' },
  { id: 'b', position: { x: 300, y: 200 }, headline: 'Beta' },
];

async function settle(el: HTMLElement & { updateComplete: Promise<boolean> }) {
  await el.updateComplete;
  await new Promise(resolve => {
    requestAnimationFrame(resolve);
  });
  await el.updateComplete;
}

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

describe('wc-diagram-controls', () => {
  it('shows the zoom level and zooms the canvas it sits in', async () => {
    const diagram = await fixture<Diagram>(html`
      <wc-diagram style="height: 400px" start-position="origin" .nodes=${nodes}>
        <wc-diagram-controls slot="controls"></wc-diagram-controls>
      </wc-diagram>
    `);
    await settle(diagram);
    const controls = diagram.querySelector(
      'wc-diagram-controls',
    ) as DiagramControls;
    await settle(controls);
    const level = controls.shadowRoot?.querySelector(
      '.zoom-level',
    ) as HTMLElement;
    expect(level.textContent?.trim()).to.equal('100%');

    const zoomIn = controls.shadowRoot?.querySelector(
      'wc-icon-button[aria-label="Zoom in"]',
    ) as HTMLElement;
    setTimeout(() => zoomIn.click());
    await waitForSettled(diagram);
    expect(diagram.view.zoom).to.be.closeTo(1.25, 0.001);
    await controls.updateComplete;
    expect(level.textContent?.trim()).to.equal('125%');
  });

  it('adds undo and redo only for an editable canvas, and finds it by id', async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div>
        <wc-diagram
          id="target"
          style="height: 300px"
          .nodes=${nodes}
        ></wc-diagram>
        <wc-diagram-controls for="target"></wc-diagram-controls>
      </div>
    `);
    const diagram = wrapper.querySelector('wc-diagram') as Diagram;
    const controls = wrapper.querySelector(
      'wc-diagram-controls',
    ) as DiagramControls;
    await settle(diagram);
    await settle(controls);
    const undo = () =>
      controls.shadowRoot?.querySelector('wc-icon-button[aria-label="Undo"]');
    expect(undo()).to.equal(null);
    diagram.editable = true;
    await settle(diagram);
    await controls.updateComplete;
    expect(undo()).to.not.equal(null);
    expect(undo()?.hasAttribute('disabled')).to.equal(true);
    expect(controls.shadowRoot?.querySelector('[role="toolbar"]')).to.not.equal(
      null,
    );
  });
});

describe('wc-diagram-minimap', () => {
  it('draws every node and the part of the canvas in view', async () => {
    const diagram = await fixture<Diagram>(html`
      <wc-diagram style="height: 400px" .nodes=${nodes}>
        <wc-diagram-minimap slot="minimap"></wc-diagram-minimap>
      </wc-diagram>
    `);
    await settle(diagram);
    const map = diagram.querySelector('wc-diagram-minimap') as DiagramMinimap;
    await settle(map);
    expect(map.shadowRoot?.querySelectorAll('rect.item').length).to.equal(2);
    const view = map.shadowRoot?.querySelector('rect.view') as SVGRectElement;
    const { visible } = diagram._diagramOverview();
    expect(Number(view.getAttribute('width'))).to.be.closeTo(
      visible.width,
      0.01,
    );

    diagram.view = { x: 5000, y: 5000, zoom: 1 };
    await settle(diagram);
    await map.updateComplete;
    expect(Number(view.getAttribute('x'))).to.be.closeTo(-5000, 0.01);
  });
});
