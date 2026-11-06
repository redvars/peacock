/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, oneEvent } from '@open-wc/testing';
// Import modules directly: src/index.js pulls in html-editor's CommonJS js-beautify, which the
// test server cannot load.
import { Modal } from '../src/modal/index.js';

if (!customElements.get('wc-modal')) {
  customElements.define('wc-modal', Modal);
}

function nativeDialog(el: Modal): HTMLDialogElement {
  const dialog = el.shadowRoot?.querySelector('dialog');
  if (!dialog) throw new Error('wc-modal renders no <dialog>');
  return dialog;
}

function panel(el: Modal): HTMLElement {
  const container = el.shadowRoot?.querySelector<HTMLElement>('.dialog');
  if (!container) throw new Error('wc-modal renders no .dialog container');
  return container;
}

function silenceWarnings() {
  const original = console.warn;
  console.warn = () => {};
  return () => {
    console.warn = original;
  };
}

describe('Modal', () => {
  it('opens a native dialog in the top layer', async () => {
    const el = await fixture<Modal>(
      html`<wc-modal heading="Hello">Body</wc-modal>`,
    );
    expect(nativeDialog(el).open).to.equal(false);

    el.show();
    await el.updateComplete;

    const dialog = nativeDialog(el);
    expect(dialog.open).to.equal(true);
    expect(dialog.matches(':modal')).to.equal(true);
    expect(document.documentElement.style.overflow).to.equal('hidden');

    el.hide();
    await el.updateComplete;
    expect(document.documentElement.style.overflow).to.equal('');
  });

  it('draws above a high z-index sticky header and a trapping stacking context', async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div>
        <header
          id="sticky"
          style="position: fixed; inset: 0; z-index: 2147483647; background: white;"
        >
          Sticky header
        </header>
        <section
          style="position: relative; z-index: 0; transform: translateZ(0);"
        >
          <wc-modal heading="Above everything" open>
            <button id="inside">Inside</button>
          </wc-modal>
        </section>
      </div>
    `);
    const el = wrapper.querySelector<Modal>('wc-modal');
    if (!el) throw new Error('missing wc-modal');
    await el.updateComplete;

    // The scrim corner and the centre both hit the modal, not the fixed header on top of the page.
    const corner = document.elementFromPoint(2, 2);
    expect(corner).to.equal(el);

    const inside = wrapper.querySelector<HTMLButtonElement>('#inside');
    if (!inside) throw new Error('missing button');
    const box = inside.getBoundingClientRect();
    const hit = document.elementFromPoint(
      box.left + box.width / 2,
      box.top + box.height / 2,
    );
    expect(hit).to.equal(inside);
  });

  it('keeps no transform on the open container, so fixed menus inside it position against the viewport', async () => {
    const el = await fixture<Modal>(html`<wc-modal open>Body</wc-modal>`);
    await el.updateComplete;
    await Promise.all(
      panel(el)
        .getAnimations()
        .map(animation => animation.finished),
    );

    expect(getComputedStyle(panel(el)).transform).to.equal('none');

    const menu = document.createElement('div');
    menu.style.cssText =
      'position: fixed; top: 0; left: 0; width: 10px; height: 10px;';
    el.append(menu);
    const rect = menu.getBoundingClientRect();
    expect(rect.top).to.equal(0);
    expect(rect.left).to.equal(0);
  });

  it('closes the native dialog when hidden', async () => {
    const el = await fixture<Modal>(html`<wc-modal open>Body</wc-modal>`);
    await el.updateComplete;

    let legacyReason = '';
    el.addEventListener('modal-close', e => {
      legacyReason = (e as CustomEvent).detail.reason;
    });
    setTimeout(() => el.hide());
    const event = await oneEvent(el, 'close');
    expect(event.detail.reason).to.equal('api');
    expect(legacyReason).to.equal('programmatic');

    await el.updateComplete;
    await Promise.all(
      panel(el)
        .getAnimations()
        .map(animation => animation.finished),
    );
    expect(nativeDialog(el).open).to.equal(false);
    expect(document.documentElement.style.overflow).to.equal('');
  });

  it('closes on Escape through the dialog cancel event', async () => {
    const el = await fixture<Modal>(html`<wc-modal open>Body</wc-modal>`);
    await el.updateComplete;

    setTimeout(() =>
      nativeDialog(el).dispatchEvent(new Event('cancel', { cancelable: true })),
    );
    const event = await oneEvent(el, 'modal-close');
    expect(event.detail.reason).to.equal('escape');
    expect(el.open).to.equal(false);
  });

  it('closes on a scrim click unless no-light-dismiss is set', async () => {
    const el = await fixture<Modal>(html`<wc-modal open>Body</wc-modal>`);
    await el.updateComplete;
    const wrapper =
      el.shadowRoot?.querySelector<HTMLElement>('.dialog-wrapper');
    if (!wrapper) throw new Error('missing wrapper');

    panel(el).click();
    expect(el.open).to.equal(true);

    el.noLightDismiss = true;
    wrapper.click();
    expect(el.open).to.equal(true);

    el.noLightDismiss = false;
    setTimeout(() => wrapper.click());
    const event = await oneEvent(el, 'close');
    expect(event.detail.reason).to.equal('light-dismiss');
  });

  it('still honours the deprecated no-scrim-close', async () => {
    const restore = silenceWarnings();
    try {
      const el = await fixture<Modal>(
        html`<wc-modal open no-scrim-close>Body</wc-modal>`,
      );
      await el.updateComplete;
      el.shadowRoot!.querySelector<HTMLElement>('.dialog-wrapper')!.click();
      expect(el.open).to.equal(true);
    } finally {
      restore();
    }
  });

  it('closes on an Escape keypress, and only the topmost of two modals', async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div>
        <wc-modal id="a" open>A</wc-modal>
        <wc-modal id="b" open>B</wc-modal>
      </div>
    `);
    const [a, b] = Array.from(wrapper.querySelectorAll<Modal>('wc-modal'));
    await a.updateComplete;
    await b.updateComplete;

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    await b.updateComplete;

    expect(b.open).to.equal(false);
    expect(a.open).to.equal(true);
  });

  it('keeps the page locked until the last of two open modals closes', async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div>
        <wc-modal open>A</wc-modal>
        <wc-modal open>B</wc-modal>
      </div>
    `);
    const [a, b] = Array.from(wrapper.querySelectorAll<Modal>('wc-modal'));
    await a.updateComplete;
    await b.updateComplete;

    b.hide();
    await b.updateComplete;
    expect(document.documentElement.style.overflow).to.equal('hidden');

    a.hide();
    await a.updateComplete;
    expect(document.documentElement.style.overflow).to.equal('');
  });

  it('focuses an autofocus element, fires open, and returns focus on close', async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div>
        <button id="opener">Open</button>
        <wc-modal><button id="ok" autofocus>OK</button></wc-modal>
      </div>
    `);
    const opener = wrapper.querySelector<HTMLButtonElement>('#opener')!;
    const el = wrapper.querySelector<Modal>('wc-modal')!;
    opener.focus();

    setTimeout(() => el.show());
    await oneEvent(el, 'open');
    expect(document.activeElement?.id).to.equal('ok');

    el.hide();
    await el.updateComplete;
    expect(document.activeElement).to.equal(opener);
  });
});
