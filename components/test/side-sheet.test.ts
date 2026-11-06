/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, oneEvent } from '@open-wc/testing';
// Import modules directly: src/index.js pulls in html-editor's CommonJS js-beautify, which the
// test server cannot load.
import { SideSheet } from '../src/side-sheet/index.js';
import { overlayState } from '../src/__internal/controllers/overlay-controller.js';

if (!customElements.get('wc-side-sheet')) {
  customElements.define('wc-side-sheet', SideSheet);
}

function nativeDialog(el: SideSheet): HTMLDialogElement {
  const dialog = el.shadowRoot?.querySelector('dialog');
  if (!dialog) throw new Error('wc-side-sheet renders no <dialog>');
  return dialog;
}

function sheet(el: SideSheet): HTMLElement {
  const container = el.shadowRoot?.querySelector<HTMLElement>('.sheet');
  if (!container) throw new Error('wc-side-sheet renders no .sheet');
  return container;
}

function scrim(el: SideSheet): HTMLElement {
  const element = el.shadowRoot?.querySelector<HTMLElement>('.scrim');
  if (!element) throw new Error('wc-side-sheet renders no .scrim');
  return element;
}

async function settle(el: SideSheet) {
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

function silenceWarnings() {
  const original = console.warn;
  const messages: string[] = [];
  console.warn = (message: string) => {
    messages.push(message);
  };
  return {
    messages,
    restore: () => {
      console.warn = original;
    },
  };
}

describe('SideSheet', () => {
  it('opens a modal native dialog in the top layer and locks scrolling', async () => {
    const el = await fixture<SideSheet>(
      html`<wc-side-sheet>Body</wc-side-sheet>`,
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
    const el = await fixture<SideSheet>(
      html`<wc-side-sheet variant="standard" open>Body</wc-side-sheet>`,
    );
    await el.updateComplete;
    expect(nativeDialog(el).open).to.equal(true);
    expect(nativeDialog(el).matches(':modal')).to.equal(false);
    expect(el.shadowRoot?.querySelector('.scrim')).to.equal(null);
    expect(document.documentElement.style.overflow).to.equal('');

    pressEscape();
    await el.updateComplete;
    expect(el.open).to.equal(true);

    el.hide();
    await settle(el);
    expect(nativeDialog(el).open).to.equal(false);
  });

  it('closes on Escape with reason escape and the legacy event', async () => {
    const el = await fixture<SideSheet>(
      html`<wc-side-sheet open>Body</wc-side-sheet>`,
    );
    await el.updateComplete;

    let legacyReason = '';
    el.addEventListener('side-sheet-close', e => {
      legacyReason = (e as CustomEvent).detail.reason;
    });
    setTimeout(pressEscape);
    const event = await oneEvent(el, 'close');
    expect(event.detail.reason).to.equal('escape');
    expect(legacyReason).to.equal('escape');
    expect(el.open).to.equal(false);
    await settle(el);
    expect(document.documentElement.style.overflow).to.equal('');
  });

  it('closes on a scrim click unless no-light-dismiss is set', async () => {
    const el = await fixture<SideSheet>(
      html`<wc-side-sheet open no-light-dismiss>Body</wc-side-sheet>`,
    );
    await el.updateComplete;

    sheet(el).click();
    scrim(el).click();
    expect(el.open).to.equal(true);

    el.noLightDismiss = false;
    let legacyReason = '';
    el.addEventListener('side-sheet-close', e => {
      legacyReason = (e as CustomEvent).detail.reason;
    });
    setTimeout(() => scrim(el).click());
    const event = await oneEvent(el, 'close');
    expect(event.detail.reason).to.equal('light-dismiss');
    expect(legacyReason).to.equal('scrim');
  });

  it('fires close with api for hide() and action for the close button', async () => {
    const el = await fixture<SideSheet>(
      html`<wc-side-sheet heading="Filters" open>Body</wc-side-sheet>`,
    );
    await el.updateComplete;

    let legacyReason = '';
    el.addEventListener('side-sheet-close', e => {
      legacyReason = (e as CustomEvent).detail.reason;
    });
    setTimeout(() => el.hide());
    const apiEvent = await oneEvent(el, 'close');
    expect(apiEvent.detail.reason).to.equal('api');
    expect(legacyReason).to.equal('programmatic');

    el.show();
    await el.updateComplete;
    const close = el.shadowRoot?.querySelector<HTMLElement>('.close');
    if (!close) throw new Error('missing close button');
    setTimeout(() => close.click());
    const actionEvent = await oneEvent(el, 'close');
    expect(actionEvent.detail.reason).to.equal('action');
    expect(legacyReason).to.equal('close-button');

    el.hideClose = true;
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('.close')).to.equal(null);
  });

  it('names the dialog by its heading, else label, else the default string', async () => {
    const el = await fixture<SideSheet>(
      html`<wc-side-sheet heading="Filters">Body</wc-side-sheet>`,
    );
    const dialog = nativeDialog(el);
    expect(dialog.getAttribute('aria-labelledby')).to.equal(
      'side-sheet-heading',
    );
    expect(
      el.shadowRoot?.getElementById('side-sheet-heading')?.textContent,
    ).to.equal('Filters');
    expect(dialog.hasAttribute('aria-label')).to.equal(false);

    el.heading = '';
    el.label = 'Settings';
    await el.updateComplete;
    expect(dialog.hasAttribute('aria-labelledby')).to.equal(false);
    expect(dialog.getAttribute('aria-label')).to.equal('Settings');

    el.label = '';
    await el.updateComplete;
    expect(dialog.getAttribute('aria-label')).to.equal('Side sheet');
  });

  it('focuses an autofocus element, fires open, and returns focus on close', async () => {
    // The sheet moves focus to [autofocus] itself; that is the behaviour under test.
    /* eslint-disable lit-a11y/no-autofocus */
    const wrapper = await fixture<HTMLDivElement>(html`
      <div>
        <button id="opener">Open</button>
        <wc-side-sheet><button id="ok" autofocus>OK</button></wc-side-sheet>
      </div>
    `);
    /* eslint-enable lit-a11y/no-autofocus */
    const opener = wrapper.querySelector<HTMLButtonElement>('#opener');
    const el = wrapper.querySelector<SideSheet>('wc-side-sheet');
    if (!opener || !el) throw new Error('missing fixture elements');
    opener.focus();

    setTimeout(() => el.show());
    await oneEvent(el, 'open');
    expect(document.activeElement?.id).to.equal('ok');

    el.hide();
    await el.updateComplete;
    expect(document.activeElement).to.equal(opener);
  });

  it('places the sheet at the end by default and at the start on request', async () => {
    const el = await fixture<SideSheet>(
      html`<wc-side-sheet open>Body</wc-side-sheet>`,
    );
    await settle(el);
    expect(el.placement).to.equal('end');
    let box = sheet(el).getBoundingClientRect();
    expect(Math.round(box.right)).to.equal(window.innerWidth);

    el.placement = 'start';
    await settle(el);
    box = sheet(el).getBoundingClientRect();
    expect(Math.round(box.left)).to.equal(0);
  });

  it('puts the end placement on the left edge in right-to-left pages', async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div dir="rtl"><wc-side-sheet open>Body</wc-side-sheet></div>
    `);
    const el = wrapper.querySelector<SideSheet>('wc-side-sheet');
    if (!el) throw new Error('missing wc-side-sheet');
    await settle(el);
    const box = sheet(el).getBoundingClientRect();
    expect(Math.round(box.left)).to.equal(0);
  });

  it('maps the deprecated position to placement and warns', async () => {
    const warnings = silenceWarnings();
    try {
      const el = await fixture<SideSheet>(
        html`<wc-side-sheet position="left">Body</wc-side-sheet>`,
      );
      expect(el.placement).to.equal('start');
      expect(sheet(el).classList.contains('placement-start')).to.equal(true);

      el.position = 'right';
      await el.updateComplete;
      expect(el.placement).to.equal('end');
      expect(
        warnings.messages.some(message => message.includes('`position`')),
      ).to.equal(true);
    } finally {
      warnings.restore();
    }
  });
});
