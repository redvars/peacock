/// <reference types="mocha" />
import { html } from 'lit';
import { expect, fixtureSync } from '@open-wc/testing';
import { StatusIndicator } from '../src/status-indicator/index.js';

if (!customElements.get('wc-status-indicator')) {
  customElements.define('wc-status-indicator', StatusIndicator);
}

async function setup(template: ReturnType<typeof html>) {
  const el = fixtureSync<StatusIndicator>(template);
  await el.updateComplete;
  return el;
}

function shape(el: StatusIndicator) {
  return el.shadowRoot!.querySelector('.shape')!.firstElementChild!;
}

describe('StatusIndicator', () => {
  it('shows the label as plain text with a decorative dot', async () => {
    const el = await setup(
      html`<wc-status-indicator
        intent="success"
        label="Operational"
      ></wc-status-indicator>`,
    );
    expect(el.shadowRoot!.querySelector('.label')!.textContent).to.equal(
      'Operational',
    );
    expect(
      el.shadowRoot!.querySelector('.dot')!.getAttribute('aria-hidden'),
    ).to.equal('true');
    expect(el.hasAttribute('role')).to.be.false;
    expect(el.size).to.equal('sm');
    expect(el.getAttribute('size')).to.equal('sm');
  });

  it('draws a different shape per intent, so color is not the only signal', async () => {
    const el = await setup(
      html`<wc-status-indicator label="Status"></wc-status-indicator>`,
    );
    const shapes = [shape(el).outerHTML];
    for (const intent of ['info', 'success', 'warning', 'danger'] as const) {
      el.intent = intent;
      // Each intent is checked in turn, so the updates must run one after the other.
      // eslint-disable-next-line no-await-in-loop
      await el.updateComplete;
      shapes.push(shape(el).outerHTML);
    }
    expect(new Set(shapes).size).to.equal(5);
  });

  it('treats an unknown intent as neutral', async () => {
    const el = await setup(
      html`<wc-status-indicator
        intent=${'bogus' as never}
        label="Unknown"
      ></wc-status-indicator>`,
    );
    expect(shape(el).getAttribute('fill')).to.equal('none');
  });

  it('hides the label with dot-only but keeps it as accessible text and tooltip', async () => {
    const el = await setup(
      html`<wc-status-indicator
        intent="danger"
        label="Offline"
        dot-only
      ></wc-status-indicator>`,
    );
    expect(el.shadowRoot!.querySelector('.label')).to.be.null;
    expect(
      el.shadowRoot!.querySelector('.screen-reader-only')!.textContent,
    ).to.equal('Offline');
    expect(
      el.shadowRoot!.querySelector('.status-indicator')!.getAttribute('title'),
    ).to.equal('Offline');
  });

  it('names a dot-only indicator without a label after its intent', async () => {
    const el = await setup(
      html`<wc-status-indicator
        intent="warning"
        dot-only
      ></wc-status-indicator>`,
    );
    expect(
      el.shadowRoot!.querySelector('.screen-reader-only')!.textContent,
    ).to.equal('Warning');
    el.intent = undefined;
    await el.updateComplete;
    expect(
      el.shadowRoot!.querySelector('.screen-reader-only')!.textContent,
    ).to.equal('Status');
  });

  it('has no tooltip without dot-only', async () => {
    const el = await setup(
      html`<wc-status-indicator label="Online"></wc-status-indicator>`,
    );
    expect(
      el.shadowRoot!.querySelector('.status-indicator')!.hasAttribute('title'),
    ).to.be.false;
  });

  it('becomes a polite live region only with live', async () => {
    const el = await setup(
      html`<wc-status-indicator
        label="Syncing"
        intent="info"
        live
      ></wc-status-indicator>`,
    );
    expect(el.getAttribute('role')).to.equal('status');
    el.label = 'Synced';
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.label')!.textContent).to.equal(
      'Synced',
    );
    el.live = false;
    await el.updateComplete;
    expect(el.hasAttribute('role')).to.be.false;
  });

  it('reflects pulse, intent and size for styling', async () => {
    const el = await setup(
      html`<wc-status-indicator
        label="Recording"
        intent="danger"
        size="lg"
        pulse
      ></wc-status-indicator>`,
    );
    expect(el.hasAttribute('pulse')).to.be.true;
    expect(el.getAttribute('intent')).to.equal('danger');
    expect(el.getAttribute('size')).to.equal('lg');
  });

  it('stops the pulse animation under reduced motion', async () => {
    const el = await setup(
      html`<wc-status-indicator label="Live" pulse></wc-status-indicator>`,
    );
    const dot = el.shadowRoot!.querySelector('.dot')!;
    const animation = getComputedStyle(dot, '::after').animationName;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    expect(animation).to.equal(
      reduced.matches ? 'none' : 'status-indicator-pulse',
    );
  });
});
