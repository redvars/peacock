/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Snackbar } from '../src/snackbar/snackbar.js';

if (!customElements.get('wc-snackbar')) {
  customElements.define('wc-snackbar', Snackbar);
}

describe('Snackbar', () => {
  function finishDismissAnimation(el: Snackbar) {
    const snackbar = el.shadowRoot?.querySelector('.snackbar');
    snackbar?.dispatchEvent(new AnimationEvent('animationend', { animationName: 'snackbar-exit' }));
  }

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

    finishDismissAnimation(el);
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
      setTimeout(resolve, 260);
    });
    await el.updateComplete;

    expect(closeReason).to.equal('timeout');
    expect(el.open).to.equal(false);
  });

  it('closes previous snackbar when another one opens', async () => {
    const first = await fixture<Snackbar>(html`
      <wc-snackbar open message="First"></wc-snackbar>
    `);
    await first.updateComplete;

    let firstCloseReason = '';
    first.addEventListener('snackbar-close', (event: Event) => {
      firstCloseReason = (event as CustomEvent<{ reason: string }>).detail.reason;
    });

    const second = await fixture<Snackbar>(html`
      <wc-snackbar message="Second"></wc-snackbar>
    `);
    await second.updateComplete;

    second.show();
    await second.updateComplete;
    await first.updateComplete;

    expect(firstCloseReason).to.equal('programmatic');
    expect(first.open).to.equal(true);

    finishDismissAnimation(first);
    await first.updateComplete;

    expect(first.open).to.equal(false);
    expect(second.open).to.equal(true);
  });

  it('is fixed to the viewport bottom', async () => {
    const el = await fixture<Snackbar>(html`
      <wc-snackbar open message="Saved"></wc-snackbar>
    `);
    await el.updateComplete;

    const hostStyles = getComputedStyle(el);
    expect(hostStyles.position).to.equal('fixed');
    expect(hostStyles.bottom).to.not.equal('auto');
  });
});
