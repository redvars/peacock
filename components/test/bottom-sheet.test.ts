/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, oneEvent } from '@open-wc/testing';
// Import modules directly: src/index.js pulls in html-editor's CommonJS js-beautify, which the
// test server cannot load.
import { BottomSheet } from '../src/bottom-sheet/index.js';
import { overlayState } from '../src/__internal/controllers/overlay-controller.js';

if (!customElements.get('wc-bottom-sheet')) {
  customElements.define('wc-bottom-sheet', BottomSheet);
}

function nativeDialog(el: BottomSheet): HTMLDialogElement {
  const dialog = el.shadowRoot?.querySelector('dialog');
  if (!dialog) throw new Error('wc-bottom-sheet renders no <dialog>');
  return dialog;
}

function sheet(el: BottomSheet): HTMLElement {
  const container = el.shadowRoot?.querySelector<HTMLElement>('.sheet');
  if (!container) throw new Error('wc-bottom-sheet renders no .sheet');
  return container;
}

function scrim(el: BottomSheet): HTMLElement {
  const element = el.shadowRoot?.querySelector<HTMLElement>('.scrim');
  if (!element) throw new Error('wc-bottom-sheet renders no .scrim');
  return element;
}

function handle(el: BottomSheet): HTMLButtonElement {
  const button =
    el.shadowRoot?.querySelector<HTMLButtonElement>('.handle-area');
  if (!button) throw new Error('wc-bottom-sheet renders no drag handle');
  return button;
}

async function settle(el: BottomSheet) {
  await el.updateComplete;
  await Promise.all(
    sheet(el)
      .getAnimations()
      .map(animation => animation.finished),
  );
}

function pressEscape() {
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
  );
}

function pointer(type: string, clientY: number) {
  return new PointerEvent(type, {
    clientY,
    pointerId: 1,
    bubbles: true,
    composed: true,
  });
}

describe('BottomSheet', () => {
  it('opens a modal native dialog in the top layer and locks scrolling', async () => {
    const el = await fixture<BottomSheet>(
      html`<wc-bottom-sheet>Body</wc-bottom-sheet>`,
    );
    expect(nativeDialog(el).open).to.equal(false);

    el.show();
    await el.updateComplete;
    expect(nativeDialog(el).open).to.equal(true);
    expect(nativeDialog(el).matches(':modal')).to.equal(true);
    expect(document.documentElement.style.overflow).to.equal('hidden');

    el.hide();
    await settle(el);
    expect(nativeDialog(el).open).to.equal(false);
    expect(document.documentElement.style.overflow).to.equal('');
    expect(overlayState()).to.deep.equal({ open: 0, scrollLocks: 0 });
  });

  it('opens the standard variant as a non-modal dialog without a scroll lock', async () => {
    const el = await fixture<BottomSheet>(
      html`<wc-bottom-sheet variant="standard" open>Body</wc-bottom-sheet>`,
    );
    await el.updateComplete;
    expect(nativeDialog(el).open).to.equal(true);
    expect(nativeDialog(el).matches(':modal')).to.equal(false);
    expect(document.documentElement.style.overflow).to.equal('');
    el.hide();
    await settle(el);
  });

  it('closes on Escape with reason escape', async () => {
    const el = await fixture<BottomSheet>(
      html`<wc-bottom-sheet open>Body</wc-bottom-sheet>`,
    );
    await el.updateComplete;

    setTimeout(pressEscape);
    const event = await oneEvent(el, 'close');
    expect(event.detail.reason).to.equal('escape');
    await settle(el);
    expect(document.documentElement.style.overflow).to.equal('');
  });

  it('closes on a scrim click unless no-light-dismiss is set', async () => {
    const el = await fixture<BottomSheet>(
      html`<wc-bottom-sheet open no-light-dismiss>Body</wc-bottom-sheet>`,
    );
    await el.updateComplete;

    sheet(el).click();
    scrim(el).click();
    expect(el.open).to.equal(true);

    el.noLightDismiss = false;
    setTimeout(() => scrim(el).click());
    const event = await oneEvent(el, 'close');
    expect(event.detail.reason).to.equal('light-dismiss');
  });

  it('fires close with api for hide()', async () => {
    const el = await fixture<BottomSheet>(
      html`<wc-bottom-sheet open>Body</wc-bottom-sheet>`,
    );
    await el.updateComplete;
    setTimeout(() => el.hide());
    const event = await oneEvent(el, 'close');
    expect(event.detail.reason).to.equal('api');
  });

  it('focuses an autofocus element, fires open, and returns focus on close', async () => {
    // The sheet moves focus to [autofocus] itself; that is the behaviour under test.
    /* eslint-disable lit-a11y/no-autofocus */
    const wrapper = await fixture<HTMLDivElement>(html`
      <div>
        <button id="opener">Open</button>
        <wc-bottom-sheet><button id="ok" autofocus>OK</button></wc-bottom-sheet>
      </div>
    `);
    /* eslint-enable lit-a11y/no-autofocus */
    const opener = wrapper.querySelector<HTMLButtonElement>('#opener');
    const el = wrapper.querySelector<BottomSheet>('wc-bottom-sheet');
    if (!opener || !el) throw new Error('missing fixture elements');
    opener.focus();

    setTimeout(() => el.show());
    await oneEvent(el, 'open');
    expect(document.activeElement?.id).to.equal('ok');

    el.hide();
    await el.updateComplete;
    expect(document.activeElement).to.equal(opener);
  });

  it('names the dialog by label, else the default string', async () => {
    const el = await fixture<BottomSheet>(
      html`<wc-bottom-sheet label="Share">Body</wc-bottom-sheet>`,
    );
    expect(nativeDialog(el).getAttribute('aria-label')).to.equal('Share');
    el.label = '';
    await el.updateComplete;
    expect(nativeDialog(el).getAttribute('aria-label')).to.equal(
      'Bottom sheet',
    );
  });

  it('has a keyboard-accessible drag handle that closes the sheet', async () => {
    const el = await fixture<BottomSheet>(
      html`<wc-bottom-sheet open>Body</wc-bottom-sheet>`,
    );
    await el.updateComplete;
    const button = handle(el);
    expect(button.tagName).to.equal('BUTTON');
    expect(button.getAttribute('aria-label')).to.equal('Close sheet');

    button.focus();
    expect(el.shadowRoot?.activeElement).to.equal(button);

    // Enter and Space on a focused native button activate it as a click.
    setTimeout(() => button.click());
    const event = await oneEvent(el, 'close');
    expect(event.detail.reason).to.equal('action');
  });

  it('closes when the handle is dragged down far enough, and not on a short drag', async () => {
    const el = await fixture<BottomSheet>(
      html`<wc-bottom-sheet open>Body</wc-bottom-sheet>`,
    );
    await settle(el);
    const button = handle(el);

    button.dispatchEvent(pointer('pointerdown', 100));
    button.dispatchEvent(pointer('pointermove', 130));
    button.dispatchEvent(pointer('pointerup', 130));
    // The click after a moved press is not a click.
    button.click();
    await el.updateComplete;
    expect(el.open).to.equal(true);
    expect(sheet(el).style.transform).to.equal('');

    setTimeout(() => {
      button.dispatchEvent(pointer('pointerdown', 100));
      button.dispatchEvent(pointer('pointermove', 250));
      button.dispatchEvent(pointer('pointerup', 250));
    });
    const event = await oneEvent(el, 'close');
    expect(event.detail.reason).to.equal('action');
  });

  it('hides the handle with hide-handle', async () => {
    const el = await fixture<BottomSheet>(
      html`<wc-bottom-sheet hide-handle>Body</wc-bottom-sheet>`,
    );
    expect(el.shadowRoot?.querySelector('.handle-area')).to.equal(null);
  });
});
