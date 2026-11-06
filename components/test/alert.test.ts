/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Alert } from '../src/alert/alert.js';
import { resetDeprecationWarnings } from '../src/__internal/utils/deprecate.js';

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

    // Slotted content is projected, so read what each slot was assigned rather than the
    // shadow DOM's fallback text.
    const assignedText = (selector: string) =>
      (
        el.shadowRoot?.querySelector<HTMLSlotElement>(selector)?.assignedNodes() ?? []
      )
        .map(node => node.textContent ?? '')
        .join('')
        .trim();

    expect(assignedText('slot[name="label"]')).to.equal('Heads up:');
    expect(assignedText('slot[name="icon"]')).to.equal('priority_high');
    expect(assignedText('slot:not([name])')).to.equal('Custom description via slot');
  });

  describe('intent', () => {
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

    it('styles and labels each intent', async () => {
      const el = await fixture<Alert>(html`
        <wc-alert intent="danger" description="Could not save."></wc-alert>
      `);
      const surface = el.shadowRoot?.querySelector('.alert');
      expect(surface?.classList.contains('danger')).to.equal(true);
      const label = el.shadowRoot?.querySelector('.alert-label')?.textContent;
      expect(label?.trim()).to.equal('Error:');
      expect(
        el.shadowRoot?.querySelector('wc-icon')?.getAttribute('name'),
      ).to.equal('error');
      expect(warnings).to.have.length(0);
    });

    it('maps the deprecated meaning variant to intent and warns once', async () => {
      const el = await fixture<Alert>(html`
        <wc-alert variant="error" description="Could not save."></wc-alert>
      `);
      const surface = el.shadowRoot?.querySelector('.alert');
      expect(surface?.classList.contains('danger')).to.equal(true);
      expect(warnings).to.have.length(1);
      expect(warnings[0]).to.contain('wc-alert');
      expect(warnings[0]).to.contain('`intent`');

      await fixture<Alert>(html`<wc-alert variant="info"></wc-alert>`);
      expect(warnings).to.have.length(1);
    });

    it('prefers intent over the deprecated variant', async () => {
      const el = await fixture<Alert>(html`
        <wc-alert intent="success" variant="error"></wc-alert>
      `);
      const surface = el.shadowRoot?.querySelector('.alert');
      expect(surface?.classList.contains('success')).to.equal(true);
      expect(surface?.classList.contains('danger')).to.equal(false);
    });
  });

  describe('live region', () => {
    it('has no live role by default', async () => {
      const el = await fixture<Alert>(html`<wc-alert description="x"></wc-alert>`);
      const surface = el.shadowRoot?.querySelector('.alert');
      expect(surface?.hasAttribute('role')).to.equal(false);
      expect(surface?.hasAttribute('aria-live')).to.equal(false);
    });

    it('is a status for live="polite" and an alert for live="assertive"', async () => {
      const el = await fixture<Alert>(html`<wc-alert live="polite"></wc-alert>`);
      const surface = () => el.shadowRoot?.querySelector('.alert');
      expect(surface()?.getAttribute('role')).to.equal('status');

      el.live = 'assertive';
      await el.updateComplete;
      expect(surface()?.getAttribute('role')).to.equal('alert');
      expect(surface()?.hasAttribute('aria-live')).to.equal(false);
    });
  });

  describe('dismissible', () => {
    it('renders no close button unless dismissible', async () => {
      const el = await fixture<Alert>(html`<wc-alert></wc-alert>`);
      expect(el.shadowRoot?.querySelector('.alert-close')).to.equal(null);
    });

    it('fires close with reason action and hides itself', async () => {
      const el = await fixture<Alert>(html`<wc-alert dismissible></wc-alert>`);
      let reason = '';
      el.addEventListener('close', event => {
        reason = (event as CustomEvent<{ reason: string }>).detail.reason;
      });

      const close = el.shadowRoot?.querySelector<HTMLElement>('.alert-close');
      expect(close?.getAttribute('aria-label')).to.equal('Dismiss alert');
      close?.click();

      expect(reason).to.equal('action');
      expect(el.hidden).to.equal(true);
      expect(getComputedStyle(el).display).to.equal('none');
    });

    it('stays visible when close is cancelled', async () => {
      const el = await fixture<Alert>(html`<wc-alert dismissible></wc-alert>`);
      el.addEventListener('close', event => event.preventDefault());

      el.shadowRoot?.querySelector<HTMLElement>('.alert-close')?.click();
      expect(el.hidden).to.equal(false);
    });
  });

  it('shows the action area only when the action slot has content', async () => {
    const el = await fixture<Alert>(html`
      <wc-alert>
        <button slot="action">Retry</button>
      </wc-alert>
    `);
    await el.updateComplete;
    const actions = el.shadowRoot?.querySelector<HTMLElement>('.alert-actions');
    expect(actions?.hidden).to.equal(false);

    const empty = await fixture<Alert>(html`<wc-alert></wc-alert>`);
    await empty.updateComplete;
    expect(
      empty.shadowRoot?.querySelector<HTMLElement>('.alert-actions')?.hidden,
    ).to.equal(true);
  });

  it('keeps the description visible next to an action', async () => {
    const el = await fixture<Alert>(html`
      <wc-alert description="Add a payment method.">
        <button slot="action">Upgrade</button>
      </wc-alert>
    `);
    await el.updateComplete;
    expect(
      el.shadowRoot?.querySelector('.alert-description')?.textContent,
    ).to.contain('Add a payment method.');
  });
});
