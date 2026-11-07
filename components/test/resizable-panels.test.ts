/// <reference types="mocha" />
import { html } from 'lit';
import { expect, fixtureSync } from '@open-wc/testing';
import { Panel, ResizablePanels } from '../src/resizable-panels/index.js';
import type { ResizablePanelsChangeDetail } from '../src/resizable-panels/index.js';

for (const [tag, element] of [
  ['wc-panel', Panel],
  ['wc-resizable-panels', ResizablePanels],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

function panelsOf(el: ResizablePanels) {
  return Array.from(el.querySelectorAll<Panel>(':scope > wc-panel'));
}

async function settle(el: ResizablePanels) {
  for (let round = 0; round < 3; round += 1) {
    // eslint-disable-next-line no-await-in-loop
    await el.updateComplete;
    // eslint-disable-next-line no-await-in-loop
    await Promise.all(panelsOf(el).map(panel => panel.updateComplete));
  }
}

async function split(template: ReturnType<typeof html>) {
  const el = fixtureSync<ResizablePanels>(template);
  await settle(el);
  return { el, panels: panelsOf(el) };
}

function dividers(el: ResizablePanels) {
  return Array.from(
    el.shadowRoot!.querySelectorAll<HTMLElement>('[role="separator"]'),
  );
}

function press(target: Element, key: string, shiftKey = false) {
  const event = new KeyboardEvent('keydown', {
    key,
    shiftKey,
    bubbles: true,
    composed: true,
    cancelable: true,
  });
  target.dispatchEvent(event);
  return event;
}

function pointer(target: Element, type: string, clientX: number, clientY = 0) {
  target.dispatchEvent(
    new PointerEvent(type, {
      pointerId: 7,
      button: 0,
      clientX,
      clientY,
      bubbles: true,
      composed: true,
      cancelable: true,
    }),
  );
}

function lastDetail(el: ResizablePanels, type: 'input' | 'change') {
  const details: ResizablePanelsChangeDetail[] = [];
  el.addEventListener(type, event =>
    details.push((event as CustomEvent<ResizablePanelsChangeDetail>).detail),
  );
  return details;
}

function twoPanels(dir = 'ltr') {
  return split(html`
    <wc-resizable-panels dir=${dir} style="width: 1001px; height: 200px">
      <wc-panel size="30" min-size="20" max-size="70" label="Folders"
        >Folders</wc-panel
      >
      <wc-panel min-size="10">Messages</wc-panel>
    </wc-resizable-panels>
  `);
}

function twoPanelsSaved() {
  return split(html`
    <wc-resizable-panels autosave="test-layout">
      <wc-panel size="30" min-size="20" max-size="70"></wc-panel>
      <wc-panel></wc-panel>
    </wc-resizable-panels>
  `);
}

describe('ResizablePanels', () => {
  afterEach(() => {
    try {
      localStorage.removeItem('peacock:resizable-panels:test-layout');
    } catch {
      // ignore
    }
  });

  describe('layout', () => {
    it('gives panels without a size what the others leave', async () => {
      const { el, panels } = await twoPanels();
      expect(panels[1].size).to.equal(70);
      expect(el.sizes.map(Math.round)).to.deep.equal([30, 70]);
    });

    it('lays panels out by their sizes', async () => {
      const { panels } = await twoPanels();
      const first = panels[0].getBoundingClientRect().width;
      const second = panels[1].getBoundingClientRect().width;
      expect(Math.round(first)).to.equal(300);
      expect(Math.round(second)).to.equal(700);
    });

    it('renders one divider between each pair of panels', async () => {
      const { el } = await split(html`
        <wc-resizable-panels style="width: 600px; height: 100px">
          <wc-panel></wc-panel>
          <wc-panel></wc-panel>
          <wc-panel></wc-panel>
        </wc-resizable-panels>
      `);
      expect(dividers(el)).to.have.length(2);
      expect(el.sizes.map(Math.round)).to.deep.equal([33, 33, 33]);
    });

    it('stacks panels when vertical', async () => {
      const { el, panels } = await split(html`
        <wc-resizable-panels
          orientation="vertical"
          style="width: 300px; height: 401px"
        >
          <wc-panel size="25"></wc-panel>
          <wc-panel></wc-panel>
        </wc-resizable-panels>
      `);
      expect(Math.round(panels[0].getBoundingClientRect().height)).to.equal(
        100,
      );
      expect(dividers(el)[0].getAttribute('aria-orientation')).to.equal(
        'horizontal',
      );
    });

    it('only manages its own panels when nested', async () => {
      const { el } = await split(html`
        <wc-resizable-panels style="width: 600px; height: 200px">
          <wc-panel>
            <wc-resizable-panels orientation="vertical">
              <wc-panel></wc-panel>
              <wc-panel></wc-panel>
            </wc-resizable-panels>
          </wc-panel>
          <wc-panel></wc-panel>
        </wc-resizable-panels>
      `);
      expect(dividers(el)).to.have.length(1);
      const inner = el.querySelector<ResizablePanels>(
        'wc-panel wc-resizable-panels',
      )!;
      await settle(inner);
      expect(dividers(inner)).to.have.length(1);
      expect(inner.sizes.map(Math.round)).to.deep.equal([50, 50]);
    });

    it('adds a divider when a panel is added', async () => {
      const { el } = await twoPanels();
      el.append(document.createElement('wc-panel'));
      await settle(el);
      await settle(el);
      expect(dividers(el)).to.have.length(2);
    });
  });

  describe('separator semantics', () => {
    it('exposes the size of the panel before it', async () => {
      const { el } = await twoPanels();
      const divider = dividers(el)[0];
      expect(divider.tabIndex).to.equal(0);
      expect(divider.getAttribute('aria-orientation')).to.equal('vertical');
      expect(divider.getAttribute('aria-valuenow')).to.equal('30');
      expect(divider.getAttribute('aria-valuemin')).to.equal('20');
      expect(divider.getAttribute('aria-valuemax')).to.equal('70');
      expect(divider.getAttribute('aria-label')).to.equal('Resize Folders');
    });

    it('names unlabelled dividers generically', async () => {
      const { el } = await split(html`
        <wc-resizable-panels>
          <wc-panel></wc-panel>
          <wc-panel></wc-panel>
        </wc-resizable-panels>
      `);
      expect(dividers(el)[0].getAttribute('aria-label')).to.equal(
        'Resize panels',
      );
    });

    it('points the divider at the panel it resizes', async () => {
      const { el, panels } = await twoPanels();
      const divider = dividers(el)[0] as HTMLElement & {
        ariaControlsElements?: Element[];
      };
      if (!('ariaControlsElements' in Element.prototype)) return;
      expect(divider.ariaControlsElements).to.deep.equal([panels[0]]);
    });
  });

  describe('keyboard', () => {
    it('moves by 1% with the arrows and 10% with Shift', async () => {
      const { el, panels } = await twoPanels();
      const changes = lastDetail(el, 'change');
      const divider = dividers(el)[0];
      press(divider, 'ArrowRight');
      await settle(el);
      expect(Math.round(panels[0].size!)).to.equal(31);
      press(divider, 'ArrowLeft', true);
      await settle(el);
      expect(Math.round(panels[0].size!)).to.equal(21);
      expect(divider.getAttribute('aria-valuenow')).to.equal('21');
      expect(changes).to.have.length(2);
      expect(changes[1].value).to.deep.equal([21, 79]);
    });

    it('stops at min-size and max-size', async () => {
      const { el, panels } = await twoPanels();
      const divider = dividers(el)[0];
      press(divider, 'Home');
      await settle(el);
      expect(panels[0].size).to.equal(20);
      press(divider, 'ArrowLeft', true);
      await settle(el);
      expect(panels[0].size).to.equal(20);
      press(divider, 'End');
      await settle(el);
      expect(panels[0].size).to.equal(70);
    });

    it('mirrors horizontal arrows in right-to-left layouts', async () => {
      const { el, panels } = await twoPanels('rtl');
      press(dividers(el)[0], 'ArrowRight');
      await settle(el);
      expect(Math.round(panels[0].size!)).to.equal(29);
    });

    it('uses the up and down arrows when vertical', async () => {
      const { el, panels } = await split(html`
        <wc-resizable-panels orientation="vertical">
          <wc-panel size="50"></wc-panel>
          <wc-panel></wc-panel>
        </wc-resizable-panels>
      `);
      const divider = dividers(el)[0];
      press(divider, 'ArrowRight');
      press(divider, 'ArrowDown');
      await settle(el);
      expect(Math.round(panels[0].size!)).to.equal(51);
    });

    it('collapses and restores a collapsible panel with Enter', async () => {
      const { el, panels } = await split(html`
        <wc-resizable-panels style="width: 1001px; height: 100px">
          <wc-panel size="30" min-size="20" collapsible>Side</wc-panel>
          <wc-panel>Main</wc-panel>
        </wc-resizable-panels>
      `);
      const changes = lastDetail(el, 'change');
      const divider = dividers(el)[0];
      press(divider, 'Enter');
      await settle(el);
      expect(panels[0].collapsed).to.be.true;
      expect(panels[0].getBoundingClientRect().width).to.equal(0);
      expect(changes[0]).to.deep.equal({
        value: [0, 100],
        collapsed: [true, false],
      });
      expect(divider.getAttribute('aria-valuenow')).to.equal('0');
      press(divider, 'Enter');
      await settle(el);
      expect(panels[0].collapsed).to.be.false;
      expect(Math.round(panels[0].size!)).to.equal(30);
      expect(el.sizes.map(Math.round)).to.deep.equal([30, 70]);
    });

    it('collapses the panel after the divider when only it is collapsible', async () => {
      const { el, panels } = await split(html`
        <wc-resizable-panels>
          <wc-panel size="60"></wc-panel>
          <wc-panel collapsible collapsed-size="5"></wc-panel>
        </wc-resizable-panels>
      `);
      dividers(el)[0].dispatchEvent(
        new MouseEvent('dblclick', { bubbles: true, composed: true }),
      );
      await settle(el);
      expect(panels[1].collapsed).to.be.true;
      expect(el.sizes.map(Math.round)).to.deep.equal([95, 5]);
    });

    it('hides a panel collapsed to nothing from focus', async () => {
      const { el, panels } = await split(html`
        <wc-resizable-panels>
          <wc-panel size="30" collapsible collapsed></wc-panel>
          <wc-panel></wc-panel>
        </wc-resizable-panels>
      `);
      await settle(el);
      const content = panels[0].shadowRoot!.querySelector('.content')!;
      expect(content.hasAttribute('inert')).to.be.true;
    });
  });

  describe('pointer', () => {
    it('resizes while dragging and fires change on release', async () => {
      const { el, panels } = await twoPanels();
      const inputs = lastDetail(el, 'input');
      const changes = lastDetail(el, 'change');
      const divider = dividers(el)[0];
      const x = divider.getBoundingClientRect().left;
      pointer(divider, 'pointerdown', x);
      pointer(divider, 'pointermove', x + 100);
      await settle(el);
      expect(Math.round(panels[0].size!)).to.equal(40);
      expect(inputs).to.have.length(1);
      expect(changes).to.have.length(0);
      pointer(divider, 'pointerup', x + 100);
      expect(changes).to.have.length(1);
      expect(changes[0].value.map(Math.round)).to.deep.equal([40, 60]);
    });

    it('mirrors horizontal drags in right-to-left layouts', async () => {
      const { el, panels } = await twoPanels('rtl');
      const divider = dividers(el)[0];
      const x = divider.getBoundingClientRect().left;
      pointer(divider, 'pointerdown', x);
      pointer(divider, 'pointermove', x - 100);
      pointer(divider, 'pointerup', x - 100);
      await settle(el);
      expect(Math.round(panels[0].size!)).to.equal(40);
    });

    it('collapses a panel dragged well past its minimum', async () => {
      const { el, panels } = await split(html`
        <wc-resizable-panels style="width: 1001px; height: 100px">
          <wc-panel size="30" min-size="20" collapsible>Side</wc-panel>
          <wc-panel>Main</wc-panel>
        </wc-resizable-panels>
      `);
      const divider = dividers(el)[0];
      const x = divider.getBoundingClientRect().left;
      pointer(divider, 'pointerdown', x);
      // 15%: under the minimum but not past half way to collapsed: it stops at the minimum.
      pointer(divider, 'pointermove', x - 150);
      await settle(el);
      expect(panels[0].collapsed).to.be.false;
      expect(Math.round(panels[0].size!)).to.equal(20);
      pointer(divider, 'pointermove', x - 250);
      pointer(divider, 'pointerup', x - 250);
      await settle(el);
      expect(panels[0].collapsed).to.be.true;
      expect(el.sizes.map(Math.round)).to.deep.equal([0, 100]);
    });

    it('does not collapse a panel that is not collapsible', async () => {
      const { el, panels } = await twoPanels();
      const divider = dividers(el)[0];
      const x = divider.getBoundingClientRect().left;
      pointer(divider, 'pointerdown', x);
      pointer(divider, 'pointermove', x - 290);
      pointer(divider, 'pointerup', x - 290);
      await settle(el);
      expect(panels[0].collapsed).to.be.false;
      expect(panels[0].size).to.equal(20);
    });
  });

  describe('autosave', () => {
    it('keeps the layout and restores it', async () => {
      const first = await twoPanelsSaved();
      press(dividers(first.el)[0], 'End');
      await settle(first.el);
      first.el.remove();
      const second = await twoPanelsSaved();
      expect(second.panels[0].size).to.equal(70);
      expect(second.el.sizes.map(Math.round)).to.deep.equal([70, 30]);
    });

    it('ignores a saved layout for a different number of panels', async () => {
      localStorage.setItem(
        'peacock:resizable-panels:test-layout',
        JSON.stringify({ sizes: [10, 10, 80], collapsed: [] }),
      );
      const { panels } = await twoPanelsSaved();
      expect(panels[0].size).to.equal(30);
    });

    it('survives unreadable storage', async () => {
      localStorage.setItem('peacock:resizable-panels:test-layout', '{oops');
      const { panels } = await twoPanelsSaved();
      expect(panels[0].size).to.equal(30);
    });
  });
});
