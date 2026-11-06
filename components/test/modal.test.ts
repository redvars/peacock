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

describe('Modal', () => {
  afterEach(() => {
    document.body.style.overflow = '';
  });

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
    expect(document.body.style.overflow).to.equal('hidden');
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

    setTimeout(() => el.hide());
    const event = await oneEvent(el, 'modal-close');
    expect(event.detail.reason).to.equal('programmatic');

    await el.updateComplete;
    await Promise.all(
      panel(el)
        .getAnimations()
        .map(animation => animation.finished),
    );
    expect(nativeDialog(el).open).to.equal(false);
    expect(document.body.style.overflow).to.equal('');
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

  it('closes on a scrim click unless no-scrim-close is set', async () => {
    const el = await fixture<Modal>(html`<wc-modal open>Body</wc-modal>`);
    await el.updateComplete;
    const wrapper =
      el.shadowRoot?.querySelector<HTMLElement>('.dialog-wrapper');
    if (!wrapper) throw new Error('missing wrapper');

    panel(el).click();
    expect(el.open).to.equal(true);

    el.noScrimClose = true;
    wrapper.click();
    expect(el.open).to.equal(true);

    el.noScrimClose = false;
    setTimeout(() => wrapper.click());
    const event = await oneEvent(el, 'modal-close');
    expect(event.detail.reason).to.equal('scrim');
  });
});
