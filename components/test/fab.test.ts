/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Fab } from '../src/button/fab/fab.js';
import { resetWarnOnce } from '../src/__internal/utils/warn-once.js';

if (!customElements.get('wc-fab')) {
  customElements.define('wc-fab', Fab);
}

describe('Fab', () => {
  const warnings: string[] = [];
  let original: typeof console.warn;

  beforeEach(() => {
    resetWarnOnce();
    warnings.length = 0;
    original = console.warn;
    console.warn = (message: string) => {
      warnings.push(message);
    };
  });

  afterEach(() => {
    console.warn = original;
  });

  it('uses its tooltip as the accessible name of an icon-only FAB', async () => {
    const el = await fixture<Fab>(html`<wc-fab tooltip="Compose"></wc-fab>`);
    expect(
      el.shadowRoot!.querySelector('#button')!.getAttribute('aria-label'),
    ).to.equal('Compose');
    expect(warnings).to.have.length(0);
  });

  it('prefers aria-label over the tooltip', async () => {
    const el = await fixture<Fab>(
      html`<wc-fab aria-label="New message" tooltip="Compose"></wc-fab>`,
    );
    expect(
      el.shadowRoot!.querySelector('#button')!.getAttribute('aria-label'),
    ).to.equal('New message');
  });

  it('is named by its label when extended', async () => {
    const el = await fixture<Fab>(
      html`<wc-fab label="Compose" tooltip="Write a message"></wc-fab>`,
    );
    expect(el.shadowRoot!.querySelector('#button')!.hasAttribute('aria-label'))
      .to.be.false;
    expect(warnings).to.have.length(0);
  });

  it('warns once when it has no accessible name', async () => {
    await fixture(html`<wc-fab></wc-fab>`);
    await fixture(html`<wc-fab></wc-fab>`);
    expect(warnings.filter(w => w.includes('accessible name'))).to.have.length(
      1,
    );
  });

  it('toggles selected with aria-pressed and fires change', async () => {
    const el = await fixture<Fab>(
      html`<wc-fab toggle aria-label="Favourite"></wc-fab>`,
    );
    let detail: { selected: boolean } | undefined;
    el.addEventListener('change', event => {
      detail = (event as CustomEvent<{ selected: boolean }>).detail;
    });
    const native = el.shadowRoot!.querySelector<HTMLButtonElement>('#button')!;
    expect(native.getAttribute('aria-pressed')).to.equal('false');

    native.click();
    await el.updateComplete;
    expect(el.selected).to.be.true;
    expect(detail).to.deep.equal({ selected: true });
    expect(native.getAttribute('aria-pressed')).to.equal('true');
  });

  it('shows a spinner, sets aria-busy and blocks clicks while loading', async () => {
    const el = await fixture<Fab>(
      html`<wc-fab loading toggle aria-label="Upload"></wc-fab>`,
    );
    let clicks = 0;
    el.addEventListener('click', () => {
      clicks += 1;
    });
    const native = el.shadowRoot!.querySelector<HTMLButtonElement>('#button')!;
    expect(native.getAttribute('aria-busy')).to.equal('true');
    expect(el.shadowRoot!.querySelector('wc-circular-progress')).to.exist;

    native.click();
    expect(clicks).to.equal(0);
    expect(el.selected).to.be.false;
  });
});
