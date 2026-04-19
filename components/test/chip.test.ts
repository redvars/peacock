/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Chip } from '../src/chip/chip/chip.js';

if (!customElements.get('wc-chip')) {
  customElements.define('wc-chip', Chip);
}

describe('Chip', () => {
  it('renders a plain container by default', async () => {
    const el = await fixture<Chip>(html`<wc-chip>Chip</wc-chip>`);
    await el.updateComplete;

    const action = el.shadowRoot!.querySelector('.chip-action');
    const container = el.shadowRoot!.querySelector('.chip');

    expect(action).to.not.exist;
    expect(container).to.exist;
  });

  it('renders a button when actionable is true', async () => {
    const el = await fixture<Chip>(
      html`<wc-chip actionable>Actionable chip</wc-chip>`,
    );
    await el.updateComplete;

    const action = el.shadowRoot!.querySelector('.chip-action');

    expect(action).to.exist;
    expect(action?.tagName).to.equal('BUTTON');
  });

  it('renders an anchor when href is provided', async () => {
    const el = await fixture<Chip>(
      html`<wc-chip href="/docs">Linked chip</wc-chip>`,
    );
    await el.updateComplete;

    const action = el.shadowRoot!.querySelector('.chip-action');

    expect(action).to.exist;
    expect(action?.tagName).to.equal('A');
    expect(action?.getAttribute('href')).to.equal('/docs');
  });
});