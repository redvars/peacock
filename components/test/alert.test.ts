/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Alert } from '../src/alert/alert.js';

if (!customElements.get('wc-alert')) {
  customElements.define('wc-alert', Alert);
}

describe('Alert', () => {
  it('renders default note label and description', async () => {
    const el = await fixture<Alert>(html`
      <wc-alert description="Use semantic roles with adequate contrast."></wc-alert>
    `);
    await el.updateComplete;

    const root = el.shadowRoot;
    const label = root?.querySelector('.alert-label')?.textContent ?? '';
    const description = root?.querySelector('.alert-description')?.textContent ?? '';

    expect(label.trim()).to.equal('Note:');
    expect(description.trim()).to.equal('Use semantic roles with adequate contrast.');
  });

  it('applies variant class for styling', async () => {
    const el = await fixture<Alert>(html`
      <wc-alert variant="warning" description="Careful with destructive actions."></wc-alert>
    `);
    await el.updateComplete;

    const surface = el.shadowRoot?.querySelector('.alert');
    expect(surface?.classList.contains('warning')).to.equal(true);
  });

  it('supports custom slot content', async () => {
    const el = await fixture<Alert>(html`
      <wc-alert>
        <span slot="label">Heads up:</span>
        <span slot="icon">priority_high</span>
        Custom description via slot
      </wc-alert>
    `);
    await el.updateComplete;

    const label = el.shadowRoot?.querySelector('.alert-label')?.textContent ?? '';
    const icon = el.shadowRoot?.querySelector('.alert-icon')?.textContent ?? '';
    const description = el.shadowRoot?.querySelector('.alert-description')?.textContent ?? '';

    expect(label.trim()).to.equal('Heads up:');
    expect(icon.trim()).to.equal('priority_high');
    expect(description.trim()).to.equal('Custom description via slot');
  });
});
