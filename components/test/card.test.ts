import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Card } from '../src/card/card.js';

if (!customElements.get('wc-card')) {
  customElements.define('wc-card', Card);
}

describe('Card (Lit)', () => {
  it('defaults to elevated variant with elevation 1', async () => {
    const el = await fixture<Card>(html`<wc-card>Content</wc-card>`);
    expect(el.variant).to.equal('elevated');
    expect(el.elevation).to.equal(1);
  });

  it('respects variant attribute', async () => {
    const el = await fixture<Card>(html`<wc-card variant="outlined"></wc-card>`);
    expect(el.variant).to.equal('outlined');
  });

  it('supports filled variant', async () => {
    const el = await fixture<Card>(html`<wc-card variant="filled"></wc-card>`);
    expect(el.variant).to.equal('filled');
  });

  it('reflects elevation attribute values', async () => {
    const el = await fixture<Card>(html`<wc-card elevation="3"></wc-card>`);
    expect(el.elevation).to.equal(3);
  });
});
