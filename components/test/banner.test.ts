/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Banner } from '../src/banner/banner.js';

if (!customElements.get('wc-banner')) {
  customElements.define('wc-banner', Banner);
}

describe('Banner', () => {
  it('renders default note label and description', async () => {
    const el = await fixture<Banner>(html`
      <wc-banner description="Use semantic roles with adequate contrast."></wc-banner>
    `);
    await el.updateComplete;

    const root = el.shadowRoot;
    const label = root?.querySelector('.fr-banner-label')?.textContent ?? '';
    const description = root?.querySelector('.fr-banner-description')?.textContent ?? '';

    expect(label.trim()).to.equal('Note:');
    expect(description.trim()).to.equal('Use semantic roles with adequate contrast.');
  });

  it('applies variant class for styling', async () => {
    const el = await fixture<Banner>(html`
      <wc-banner variant="warning" description="Careful with destructive actions."></wc-banner>
    `);
    await el.updateComplete;

    const surface = el.shadowRoot?.querySelector('.fr-banner');
    expect(surface?.classList.contains('warning')).to.equal(true);
  });

  it('supports custom slot content', async () => {
    const el = await fixture<Banner>(html`
      <wc-banner>
        <span slot="label">Heads up:</span>
        <span slot="icon">priority_high</span>
        Custom description via slot
      </wc-banner>
    `);
    await el.updateComplete;

    const label = el.shadowRoot?.querySelector('.fr-banner-label')?.textContent ?? '';
    const icon = el.shadowRoot?.querySelector('.fr-banner-icon')?.textContent ?? '';
    const description = el.shadowRoot?.querySelector('.fr-banner-description')?.textContent ?? '';

    expect(label.trim()).to.equal('Heads up:');
    expect(icon.trim()).to.equal('priority_high');
    expect(description.trim()).to.equal('Custom description via slot');
  });
});
