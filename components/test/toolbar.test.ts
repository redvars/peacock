/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Toolbar } from '../src/toolbar/toolbar.js';

if (!customElements.get('wc-toolbar')) {
  customElements.define('wc-toolbar', Toolbar);
}

function press(target: Element, key: string) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    composed: true,
    cancelable: true,
  });
  target.dispatchEvent(event);
  return event;
}

function buttons(el: Toolbar) {
  return Array.from(el.querySelectorAll('button'));
}

function tabIndexes(el: Toolbar) {
  return buttons(el).map(b => b.tabIndex);
}

async function toolbarWithButtons(orientation = 'horizontal') {
  const el = await fixture<Toolbar>(html`
    <wc-toolbar orientation=${orientation}>
      <button>One</button>
      <button>Two</button>
      <button>Three</button>
    </wc-toolbar>
  `);
  await el.updateComplete;
  return el;
}

describe('Toolbar', () => {
  it('renders with default properties', async () => {
    const el = await fixture<Toolbar>(html`<wc-toolbar></wc-toolbar>`);
    await el.updateComplete;

    expect(el.variant).to.equal('floating');
    expect(el.orientation).to.equal('horizontal');
    expect(el.elevated).to.equal(false);
  });

  it('sets role="toolbar" and aria-orientation on the host', async () => {
    const el = await fixture<Toolbar>(html`<wc-toolbar></wc-toolbar>`);
    await el.updateComplete;

    expect(el.getAttribute('role')).to.equal('toolbar');
    expect(el.getAttribute('aria-orientation')).to.equal('horizontal');

    el.orientation = 'vertical';
    await el.updateComplete;
    expect(el.getAttribute('aria-orientation')).to.equal('vertical');
  });

  it('reflects variant and orientation attributes', async () => {
    const el = await fixture<Toolbar>(
      html`<wc-toolbar variant="flat" orientation="vertical"></wc-toolbar>`,
    );
    await el.updateComplete;

    expect(el.getAttribute('variant')).to.equal('flat');
    expect(el.getAttribute('orientation')).to.equal('vertical');
    const container = el.shadowRoot?.querySelector('.toolbar');
    expect(container?.classList.contains('variant-flat')).to.be.true;
    expect(container?.classList.contains('orientation-vertical')).to.be.true;
  });

  it('renders an elevation only for the floating variant', async () => {
    const el = await fixture<Toolbar>(html`<wc-toolbar></wc-toolbar>`);
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('wc-elevation')).to.exist;

    el.variant = 'flat';
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('wc-elevation')).to.not.exist;
  });

  it('applies the elevated class only to the floating variant', async () => {
    const el = await fixture<Toolbar>(html`<wc-toolbar elevated></wc-toolbar>`);
    await el.updateComplete;
    const container = () => el.shadowRoot?.querySelector('.toolbar');
    expect(container()?.classList.contains('elevated')).to.be.true;

    el.variant = 'flat';
    await el.updateComplete;
    expect(container()?.classList.contains('elevated')).to.be.false;
  });

  it('projects its children through the default slot', async () => {
    const el = await toolbarWithButtons();
    const slot = el.shadowRoot?.querySelector<HTMLSlotElement>(
      '.toolbar-content slot:not([name])',
    );
    expect(slot?.assignedElements()).to.have.length(3);
  });

  describe('roving focus', () => {
    it('makes only the first item a tab stop', async () => {
      const el = await toolbarWithButtons();
      expect(tabIndexes(el)).to.deep.equal([0, -1, -1]);
    });

    it('moves focus and the tab stop with ArrowRight and ArrowLeft', async () => {
      const el = await toolbarWithButtons();
      const [one, two] = buttons(el);
      one.focus();

      const event = press(one, 'ArrowRight');
      expect(event.defaultPrevented).to.be.true;
      expect(document.activeElement).to.equal(two);
      expect(tabIndexes(el)).to.deep.equal([-1, 0, -1]);

      press(two, 'ArrowLeft');
      expect(document.activeElement).to.equal(one);
      expect(tabIndexes(el)).to.deep.equal([0, -1, -1]);
    });

    it('wraps around at both ends', async () => {
      const el = await toolbarWithButtons();
      const [one, , three] = buttons(el);
      one.focus();

      press(one, 'ArrowLeft');
      expect(document.activeElement).to.equal(three);

      press(three, 'ArrowRight');
      expect(document.activeElement).to.equal(one);
    });

    it('jumps to the ends with Home and End', async () => {
      const el = await toolbarWithButtons();
      const [one, , three] = buttons(el);
      one.focus();

      press(one, 'End');
      expect(document.activeElement).to.equal(three);

      press(three, 'Home');
      expect(document.activeElement).to.equal(one);
    });

    it('uses ArrowDown and ArrowUp when vertical', async () => {
      const el = await toolbarWithButtons('vertical');
      const [one, two] = buttons(el);
      one.focus();

      const ignored = press(one, 'ArrowRight');
      expect(ignored.defaultPrevented).to.be.false;
      expect(document.activeElement).to.equal(one);

      press(one, 'ArrowDown');
      expect(document.activeElement).to.equal(two);

      press(two, 'ArrowUp');
      expect(document.activeElement).to.equal(one);
    });

    it('skips disabled items and dividers', async () => {
      const el = await fixture<Toolbar>(html`
        <wc-toolbar>
          <button id="a">A</button>
          <button id="b" disabled>B</button>
          <hr />
          <button id="c" aria-disabled="true">C</button>
          <button id="d">D</button>
        </wc-toolbar>
      `);
      await el.updateComplete;
      const a = el.querySelector<HTMLButtonElement>('#a');
      const d = el.querySelector<HTMLButtonElement>('#d');
      a?.focus();

      if (a) press(a, 'ArrowRight');
      expect(document.activeElement).to.equal(d);
    });

    it('moves the tab stop to an item that is clicked or focused', async () => {
      const el = await toolbarWithButtons();
      const [, , three] = buttons(el);

      // Dispatch focusin directly: a real focus() fires no focus events when
      // the test page does not have window focus (parallel runs).
      three.dispatchEvent(
        new FocusEvent('focusin', { bubbles: true, composed: true }),
      );
      expect(tabIndexes(el)).to.deep.equal([-1, -1, 0]);
    });

    it('updates tab stops when items are added', async () => {
      const el = await fixture<Toolbar>(html`<wc-toolbar></wc-toolbar>`);
      await el.updateComplete;

      const first = document.createElement('button');
      const second = document.createElement('button');
      el.append(first, second);
      // slotchange fires asynchronously
      await new Promise(resolve => {
        setTimeout(resolve);
      });

      expect(tabIndexes(el)).to.deep.equal([0, -1]);
    });
  });
});
