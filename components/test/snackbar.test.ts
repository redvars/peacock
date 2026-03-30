/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Snackbar } from '../src/snackbar/snackbar.js';

if (!customElements.get('wc-snackbar')) {
  customElements.define('wc-snackbar', Snackbar);
}

describe('Snackbar', () => {
  it('renders message and optional action', async () => {
    const el = await fixture<Snackbar>(html`
      <wc-snackbar open message="File deleted" action-label="Undo"></wc-snackbar>
    `);
    await el.updateComplete;

    const label = el.shadowRoot?.querySelector('.label')?.textContent ?? '';
    const action = el.shadowRoot?.querySelector('.action')?.textContent ?? '';
    expect(label.trim()).to.equal('File deleted');
    expect(action.trim()).to.equal('Undo');
  });

  it('emits action and close events on action click', async () => {
    const el = await fixture<Snackbar>(html`
      <wc-snackbar open action-label="Undo"></wc-snackbar>
    `);
    await el.updateComplete;

    let actionEventCount = 0;
    let closeReason = '';
    el.addEventListener('snackbar-action', () => {
      actionEventCount += 1;
    });
    el.addEventListener('snackbar-close', (event: Event) => {
      closeReason = (event as CustomEvent<{ reason: string }>).detail.reason;
    });

    (el.shadowRoot?.querySelector('.action') as HTMLButtonElement).click();
    await el.updateComplete;

    expect(actionEventCount).to.equal(1);
    expect(closeReason).to.equal('action');
    expect(el.open).to.equal(false);
  });

  it('auto closes after duration', async () => {
    const el = await fixture<Snackbar>(html`
      <wc-snackbar open message="Saved" .duration=${50}></wc-snackbar>
    `);
    await el.updateComplete;

    let closeReason = '';
    el.addEventListener('snackbar-close', (event: Event) => {
      closeReason = (event as CustomEvent<{ reason: string }>).detail.reason;
    });

    await new Promise(resolve => {
      setTimeout(resolve, 80);
    });
    await el.updateComplete;

    expect(closeReason).to.equal('timeout');
    expect(el.open).to.equal(false);
  });
});
