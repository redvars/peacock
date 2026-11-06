/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Notification } from '../src/notification/notification.js';
import { resetDeprecationWarnings } from '../src/__internal/utils/deprecate.js';

if (!customElements.get('wc-notification')) {
  customElements.define('wc-notification', Notification);
}

describe('Notification (deprecated)', () => {
  let warn: typeof console.warn;
  let warnings: string[];

  beforeEach(() => {
    resetDeprecationWarnings();
    warnings = [];
    warn = console.warn;
    console.warn = (message: string) => {
      warnings.push(message);
    };
  });

  afterEach(() => {
    console.warn = warn;
  });

  function surface(el: Notification) {
    return el.shadowRoot?.querySelector('.notification');
  }

  it('warns once per page that it is deprecated', async () => {
    await fixture<Notification>(html`<wc-notification></wc-notification>`);
    await fixture<Notification>(html`<wc-notification></wc-notification>`);
    expect(warnings).to.have.length(1);
    expect(warnings[0]).to.contain('<wc-alert>');
  });

  it('is a status, without aria-live or a variant aria-label', async () => {
    const el = await fixture<Notification>(html`
      <wc-notification variant="success"
        ><span slot="title">Saved</span></wc-notification
      >
    `);
    expect(surface(el)?.getAttribute('role')).to.equal('status');
    expect(surface(el)?.hasAttribute('aria-live')).to.equal(false);
    expect(surface(el)?.hasAttribute('aria-label')).to.equal(false);
    expect(
      el.shadowRoot?.querySelector('.sr-only')?.textContent?.trim(),
    ).to.equal('Success:');
  });

  it('is an alert for variant error', async () => {
    const el = await fixture<Notification>(html`
      <wc-notification variant="error"></wc-notification>
    `);
    expect(surface(el)?.getAttribute('role')).to.equal('alert');
  });
});
