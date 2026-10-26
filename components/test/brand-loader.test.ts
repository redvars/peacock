/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { BrandLoader } from '../src/brand-loader/brand-loader.js';

if (!customElements.get('wc-brand-loader')) {
  customElements.define('wc-brand-loader', BrandLoader);
}

describe('BrandLoader', () => {
  it('renders the build variant by default as an indeterminate progressbar', async () => {
    const el = await fixture<BrandLoader>(
      html`<wc-brand-loader></wc-brand-loader>`,
    );
    const bar = el.shadowRoot?.querySelector('[role="progressbar"]');

    expect(el.getAttribute('variant')).to.equal('build');
    expect(bar?.classList.contains('build')).to.be.true;
    expect(bar?.getAttribute('aria-label')).to.equal('Loading');
    expect(bar?.hasAttribute('aria-valuenow')).to.be.false;
    expect(el.shadowRoot?.querySelector('.stem')).to.exist;
    expect(el.shadowRoot?.querySelector('.arm')).to.exist;
  });

  it('swaps the mark when the variant changes', async () => {
    const el = await fixture<BrandLoader>(
      html`<wc-brand-loader variant="trace"></wc-brand-loader>`,
    );
    expect(
      el.shadowRoot?.querySelector('.mark')?.getAttribute('pathLength'),
    ).to.equal('1');

    el.variant = 'orbit';
    await el.updateComplete;

    expect(el.shadowRoot?.querySelector('.runner')).to.exist;
    expect(
      el.shadowRoot?.querySelector('svg')?.getAttribute('viewBox'),
    ).to.equal('-40 -40 336 336');
  });

  it('fills to value and reports it, clamped to 0..100', async () => {
    const el = await fixture<BrandLoader>(
      html`<wc-brand-loader value="40" label="Uploading"></wc-brand-loader>`,
    );
    const bar = () =>
      el.shadowRoot?.querySelector<HTMLElement>('[role="progressbar"]');

    expect(bar()?.classList.contains('progress')).to.be.true;
    expect(bar()?.getAttribute('aria-valuenow')).to.equal('40');
    expect(bar()?.getAttribute('aria-label')).to.equal('Uploading');
    expect(bar()?.style.getPropertyValue('--brand-loader-progress')).to.equal(
      '0.4',
    );

    el.value = 140;
    await el.updateComplete;
    expect(bar()?.getAttribute('aria-valuenow')).to.equal('100');

    el.value = undefined;
    await el.updateComplete;
    expect(bar()?.classList.contains('build')).to.be.true;
    expect(bar()?.hasAttribute('aria-valuenow')).to.be.false;
  });
});
