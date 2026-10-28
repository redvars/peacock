/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Toolbar } from '../src/toolbar/toolbar.js';

if (!customElements.get('wc-toolbar')) {
  customElements.define('wc-toolbar', Toolbar);
}

describe('Toolbar', () => {
  it('renders with default properties', async () => {
    const el = await fixture<Toolbar>(html`<wc-toolbar></wc-toolbar>`);
    await el.updateComplete;

    expect(el.variant).to.equal('docked');
    expect(el.orientation).to.equal('horizontal');
    expect(el.size).to.equal('sm');
    expect(el.elevated).to.equal(false);
  });

  it('reflects variant attribute', async () => {
    const el = await fixture<Toolbar>(
      html`<wc-toolbar variant="floating"></wc-toolbar>`,
    );
    await el.updateComplete;

    expect(el.variant).to.equal('floating');
    expect(el.getAttribute('variant')).to.equal('floating');
  });

  it('reflects orientation attribute', async () => {
    const el = await fixture<Toolbar>(
      html`<wc-toolbar variant="floating" orientation="vertical"></wc-toolbar>`,
    );
    await el.updateComplete;

    expect(el.orientation).to.equal('vertical');
    expect(el.getAttribute('orientation')).to.equal('vertical');
  });

  it('reflects size attribute', async () => {
    const el = await fixture<Toolbar>(
      html`<wc-toolbar size="lg"></wc-toolbar>`,
    );
    await el.updateComplete;

    expect(el.size).to.equal('lg');
    expect(el.getAttribute('size')).to.equal('lg');
  });

  it('still accepts the deprecated long size names', async () => {
    const el = await fixture<Toolbar>(
      html`<wc-toolbar size="large"></wc-toolbar>`,
    );
    await el.updateComplete;

    const container = el.shadowRoot!.querySelector('.toolbar');
    expect(container?.classList.contains('size-lg')).to.be.true;
  });

  it('reflects elevated attribute', async () => {
    const el = await fixture<Toolbar>(html`<wc-toolbar elevated></wc-toolbar>`);
    await el.updateComplete;

    expect(el.elevated).to.equal(true);
    const container = el.shadowRoot!.querySelector('.toolbar');
    expect(container?.classList.contains('elevated')).to.be.true;
  });

  it('applies variant-docked class for docked toolbar', async () => {
    const el = await fixture<Toolbar>(
      html`<wc-toolbar variant="docked"></wc-toolbar>`,
    );
    await el.updateComplete;

    const container = el.shadowRoot!.querySelector('.toolbar');
    expect(container?.classList.contains('variant-docked')).to.be.true;
  });

  it('applies variant-floating class for floating toolbar', async () => {
    const el = await fixture<Toolbar>(
      html`<wc-toolbar variant="floating"></wc-toolbar>`,
    );
    await el.updateComplete;

    const container = el.shadowRoot!.querySelector('.toolbar');
    expect(container?.classList.contains('variant-floating')).to.be.true;
  });

  it('applies orientation-vertical class', async () => {
    const el = await fixture<Toolbar>(
      html`<wc-toolbar variant="floating" orientation="vertical"></wc-toolbar>`,
    );
    await el.updateComplete;

    const container = el.shadowRoot!.querySelector('.toolbar');
    expect(container?.classList.contains('orientation-vertical')).to.be.true;
  });

  it('applies size-md class', async () => {
    const el = await fixture<Toolbar>(
      html`<wc-toolbar size="md"></wc-toolbar>`,
    );
    await el.updateComplete;

    const container = el.shadowRoot!.querySelector('.toolbar');
    expect(container?.classList.contains('size-md')).to.be.true;
  });

  // The toolbar lays its actions out in a single default slot.
  for (const variant of ['docked', 'floating'] as const) {
    it(`projects its children through the default slot (${variant})`, async () => {
      const el = await fixture<Toolbar>(
        html`<wc-toolbar variant=${variant}>
          <span>One</span>
          <span>Two</span>
        </wc-toolbar>`,
      );
      await el.updateComplete;

      const defaultSlot = el.shadowRoot!.querySelector<HTMLSlotElement>(
        '.toolbar-content slot:not([name])',
      );
      expect(defaultSlot).to.exist;
      expect(defaultSlot!.assignedElements()).to.have.length(2);
    });
  }

  it('has role="toolbar"', async () => {
    const el = await fixture<Toolbar>(html`<wc-toolbar></wc-toolbar>`);
    await el.updateComplete;

    const container = el.shadowRoot!.querySelector('[role="toolbar"]');
    expect(container).to.exist;
  });
});
