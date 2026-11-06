/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Divider } from '../src/divider/index.js';
import { resetDeprecationWarnings } from '../src/__internal/utils/deprecate.js';

if (!customElements.get('wc-divider')) {
  customElements.define('wc-divider', Divider);
}

describe('Divider', () => {
  let warnings: string[];
  let original: typeof console.warn;

  beforeEach(() => {
    resetDeprecationWarnings();
    warnings = [];
    original = console.warn;
    console.warn = (message: string) => {
      warnings.push(message);
    };
  });

  afterEach(() => {
    console.warn = original;
  });

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

  it('keeps the deprecated vertical attribute working, with a warning', async () => {
    const el = await fixture<Divider>(html`<wc-divider vertical></wc-divider>`);
    expect(el.orientation).to.equal('vertical');
    expect(el.getAttribute('orientation')).to.equal('vertical');
    expect(el.getAttribute('aria-orientation')).to.equal('vertical');
    expect(warnings).to.have.length(1);
    expect(warnings[0]).to.contain('wc-divider');
    expect(warnings[0]).to.contain('orientation');
  });

  it('does not warn without the deprecated attribute', async () => {
    await fixture<Divider>(
      html`<wc-divider orientation="vertical"></wc-divider>`,
    );
    expect(warnings).to.have.length(0);
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
