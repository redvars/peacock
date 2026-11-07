/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Divider } from '../src/divider/index.js';

if (!customElements.get('wc-divider')) {
  customElements.define('wc-divider', Divider);
}

describe('Divider', () => {
  it('is a horizontal separator by default', async () => {
    const el = await fixture<Divider>(html`<wc-divider></wc-divider>`);
    expect(el.getAttribute('role')).to.equal('separator');
    expect(el.orientation).to.equal('horizontal');
    expect(el.getAttribute('orientation')).to.equal('horizontal');
    expect(el.getAttribute('aria-orientation')).to.equal('horizontal');
  });

  it('follows orientation', async () => {
    const el = await fixture<Divider>(
      html`<wc-divider orientation="vertical"></wc-divider>`,
    );
    expect(el.getAttribute('aria-orientation')).to.equal('vertical');
    expect(
      el.shadowRoot?.querySelector('.divider')?.classList.contains('vertical'),
    ).to.equal(true);

    el.orientation = 'horizontal';
    await el.updateComplete;
    expect(el.getAttribute('aria-orientation')).to.equal('horizontal');
    expect(
      el.shadowRoot?.querySelector('.divider')?.classList.contains('vertical'),
    ).to.equal(false);
  });

  it('keeps a role the consumer set', async () => {
    const el = await fixture<Divider>(
      html`<wc-divider role="presentation"></wc-divider>`,
    );
    expect(el.getAttribute('role')).to.equal('presentation');
  });

  it('passes the a11y audit', async () => {
    const el = await fixture<Divider>(html`<wc-divider>or</wc-divider>`);
    await expect(el).to.be.accessible();
  });
});
