/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, oneEvent } from '@open-wc/testing';
import { Chip } from '../src/chip/chip/chip.js';

if (!customElements.get('wc-chip')) {
  customElements.define('wc-chip', Chip);
}

describe('Chip', () => {
  it('renders a button by default', async () => {
    const el = await fixture<Chip>(html`<wc-chip>Chip</wc-chip>`);

    const action = el.shadowRoot!.querySelector('.chip');

    expect(action).to.exist;
    expect(action?.tagName).to.equal('BUTTON');
    expect(el.shadowRoot!.querySelector('.close-btn')).to.not.exist;
  });

  it('renders an anchor when href is provided', async () => {
    const el = await fixture<Chip>(
      html`<wc-chip href="/docs">Linked chip</wc-chip>`,
    );

    const action = el.shadowRoot!.querySelector('.chip');

    expect(action?.tagName).to.equal('A');
    expect(action?.getAttribute('href')).to.equal('/docs');
  });

  it('reflects the selected state', async () => {
    const el = await fixture<Chip>(html`<wc-chip selected>Chip</wc-chip>`);

    expect(el.hasAttribute('selected')).to.be.true;
    expect(el.shadowRoot!.querySelector('.chip.selected')).to.exist;
    expect(el.shadowRoot!.querySelector('.selected-icon')).to.exist;
  });

  it('fires dismiss, and the deprecated tag--dismiss, from the close button', async () => {
    const el = await fixture<Chip>(html`<wc-chip dismissible>Chip</wc-chip>`);
    const close = el.shadowRoot!.querySelector<HTMLButtonElement>('.close-btn');
    expect(close).to.exist;

    let legacyFired = false;
    el.addEventListener('tag--dismiss', () => {
      legacyFired = true;
    });

    setTimeout(() => close!.click());
    await oneEvent(el, 'dismiss');

    expect(legacyFired).to.be.true;
  });
});
