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
    expect(el.size).to.equal('small');
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
      html`<wc-toolbar size="large"></wc-toolbar>`,
    );
    await el.updateComplete;

    expect(el.size).to.equal('large');
    expect(el.getAttribute('size')).to.equal('large');
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

  it('applies size-medium class', async () => {
    const el = await fixture<Toolbar>(
      html`<wc-toolbar size="medium"></wc-toolbar>`,
    );
    await el.updateComplete;

    const container = el.shadowRoot!.querySelector('.toolbar');
    expect(container?.classList.contains('size-medium')).to.be.true;
  });

  it('renders start, center, and end slots for docked variant', async () => {
    const el = await fixture<Toolbar>(
      html`<wc-toolbar variant="docked">
        <span slot="start">Start</span>
        <span>Center</span>
        <span slot="end">End</span>
      </wc-toolbar>`,
    );
    await el.updateComplete;

    const startSlot = el.shadowRoot!.querySelector(
      'slot[name="start"]',
    ) as HTMLSlotElement;
    const defaultSlot = el.shadowRoot!.querySelector(
      'slot:not([name])',
    ) as HTMLSlotElement;
    const endSlot = el.shadowRoot!.querySelector(
      'slot[name="end"]',
    ) as HTMLSlotElement;

    expect(startSlot).to.exist;
    expect(defaultSlot).to.exist;
    expect(endSlot).to.exist;
  });

  it('renders start, default, and end slots for floating variant', async () => {
    const el = await fixture<Toolbar>(
      html`<wc-toolbar variant="floating">
        <span slot="start">Start</span>
        <span>Center</span>
        <span slot="end">End</span>
      </wc-toolbar>`,
    );
    await el.updateComplete;

    const startSlot = el.shadowRoot!.querySelector(
      'slot[name="start"]',
    ) as HTMLSlotElement;
    const defaultSlot = el.shadowRoot!.querySelector(
      'slot:not([name])',
    ) as HTMLSlotElement;
    const endSlot = el.shadowRoot!.querySelector(
      'slot[name="end"]',
    ) as HTMLSlotElement;

    expect(startSlot).to.exist;
    expect(defaultSlot).to.exist;
    expect(endSlot).to.exist;
  });

  it('has role="toolbar"', async () => {
    const el = await fixture<Toolbar>(html`<wc-toolbar></wc-toolbar>`);
    await el.updateComplete;

    const container = el.shadowRoot!.querySelector('[role="toolbar"]');
    expect(container).to.exist;
  });
});
