/// <reference types="mocha" />
import { html } from 'lit';
import { fixtureSync, expect, oneEvent, waitUntil } from '@open-wc/testing';
// Import modules directly: src/index.js pulls in html-editor's CommonJS js-beautify, which the
// test server cannot load.
import { Button } from '../src/button/button/button.js';
import { Input } from '../src/input/index.js';
import {
  ConfirmDialog,
  confirmDialog,
  type ConfirmDialogCloseDetail,
} from '../src/confirm-dialog/index.js';

if (!customElements.get('wc-button')) {
  customElements.define('wc-button', Button);
}

if (!customElements.get('wc-input')) {
  customElements.define('wc-input', Input);
}

if (!customElements.get('wc-confirm-dialog')) {
  customElements.define('wc-confirm-dialog', ConfirmDialog);
}

type TestButton = HTMLElement & {
  disabled: boolean;
  loading: boolean;
  color: string;
  updateComplete: Promise<boolean>;
};

function part<T extends Element>(el: ConfirmDialog, selector: string): T {
  const found = el.shadowRoot?.querySelector<T>(selector);
  if (!found) throw new Error(`wc-confirm-dialog renders no ${selector}`);
  return found;
}

const nativeDialog = (el: ConfirmDialog) =>
  part<HTMLDialogElement>(el, 'dialog');
const confirmButton = (el: ConfirmDialog) =>
  part<TestButton>(el, '.confirm-button');
const cancelButton = (el: ConfirmDialog) =>
  part<TestButton>(el, '.cancel-button');
const field = (el: ConfirmDialog) => part<Input>(el, '.confirm-field');

/** Types into the type-to-confirm field the way a person would. */
async function type(el: ConfirmDialog, text: string) {
  const input = field(el);
  await input.updateComplete;
  const native = input.shadowRoot?.querySelector('input');
  if (!native) throw new Error('wc-input renders no <input>');
  native.value = text;
  native.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  await el.updateComplete;
}

async function openDialog(template: ReturnType<typeof html>) {
  const el = fixtureSync<ConfirmDialog>(template);
  el.show();
  await el.updateComplete;
  return el;
}

describe('ConfirmDialog', () => {
  afterEach(() => {
    document
      .querySelectorAll('wc-confirm-dialog')
      .forEach(dialog => dialog.remove());
  });

  it('opens a modal alertdialog named by the headline and described by the message', async () => {
    const el = await openDialog(
      html`<wc-confirm-dialog headline="Discard changes?"
        >Your edits are not saved.</wc-confirm-dialog
      >`,
    );
    const dialog = nativeDialog(el);
    expect(dialog.open).to.equal(true);
    expect(dialog.matches(':modal')).to.equal(true);
    expect(dialog.getAttribute('role')).to.equal('alertdialog');

    const labelId = dialog.getAttribute('aria-labelledby') ?? '';
    const describedId = dialog.getAttribute('aria-describedby') ?? '';
    expect(
      el.shadowRoot?.getElementById(labelId)?.textContent?.trim(),
    ).to.equal('Discard changes?');
    const message = el.shadowRoot?.getElementById(describedId);
    const slot = message?.querySelector('slot');
    const text = slot
      ?.assignedNodes()
      .map(node => node.textContent)
      .join('')
      .trim();
    expect(text).to.equal('Your edits are not saved.');
  });

  it('uses the default labels and the intent color', async () => {
    const el = await openDialog(
      html`<wc-confirm-dialog intent="danger">Sure?</wc-confirm-dialog>`,
    );
    expect(confirmButton(el).textContent?.trim()).to.equal('Confirm');
    expect(cancelButton(el).textContent?.trim()).to.equal('Cancel');
    expect(confirmButton(el).color).to.equal('danger');

    el.confirmLabel = 'Delete';
    el.cancelLabel = 'Keep';
    el.intent = undefined;
    await el.updateComplete;
    expect(confirmButton(el).textContent?.trim()).to.equal('Delete');
    expect(cancelButton(el).textContent?.trim()).to.equal('Keep');
    expect(confirmButton(el).color).to.equal('primary');
  });

  it('fires confirm, then close with reason action and confirmed true', async () => {
    const el = await openDialog(
      html`<wc-confirm-dialog>Sure?</wc-confirm-dialog>`,
    );
    let confirmed = 0;
    el.addEventListener('confirm', () => {
      confirmed += 1;
    });
    setTimeout(() => confirmButton(el).click());
    const event = await oneEvent(el, 'close');
    expect(confirmed).to.equal(1);
    expect(event.detail).to.deep.equal({ reason: 'action', confirmed: true });
    expect(el.open).to.equal(false);
  });

  it('closes with reason action and confirmed false from the cancel button', async () => {
    const el = await openDialog(
      html`<wc-confirm-dialog>Sure?</wc-confirm-dialog>`,
    );
    let confirmed = false;
    el.addEventListener('confirm', () => {
      confirmed = true;
    });
    setTimeout(() => cancelButton(el).click());
    const event = await oneEvent(el, 'close');
    expect(event.detail).to.deep.equal({ reason: 'action', confirmed: false });
    expect(confirmed).to.equal(false);
  });

  it('closes with reason escape on Escape and the native cancel event', async () => {
    const el = await openDialog(
      html`<wc-confirm-dialog>Sure?</wc-confirm-dialog>`,
    );
    setTimeout(() =>
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      ),
    );
    const event = await oneEvent(el, 'close');
    expect(event.detail).to.deep.equal({ reason: 'escape', confirmed: false });

    el.show();
    await el.updateComplete;
    setTimeout(() =>
      nativeDialog(el).dispatchEvent(new Event('cancel', { cancelable: true })),
    );
    const again = await oneEvent(el, 'close');
    expect(again.detail.reason).to.equal('escape');
  });

  it('closes with reason api from hide() and from open = false', async () => {
    const el = await openDialog(
      html`<wc-confirm-dialog>Sure?</wc-confirm-dialog>`,
    );
    setTimeout(() => el.hide());
    const event = await oneEvent(el, 'close');
    expect(event.detail).to.deep.equal({ reason: 'api', confirmed: false });

    el.show();
    await el.updateComplete;
    const reasons: ConfirmDialogCloseDetail[] = [];
    el.addEventListener('close', e =>
      reasons.push((e as CustomEvent<ConfirmDialogCloseDetail>).detail),
    );
    el.open = false;
    await el.updateComplete;
    expect(reasons).to.deep.equal([{ reason: 'api', confirmed: false }]);
  });

  it('does not close on a scrim click', async () => {
    const el = await openDialog(
      html`<wc-confirm-dialog>Sure?</wc-confirm-dialog>`,
    );
    part<HTMLElement>(el, '.dialog-wrapper').click();
    nativeDialog(el).click();
    await el.updateComplete;
    expect(el.open).to.equal(true);
  });

  it('stays open when confirm is prevented, ignores Escape while loading, and hide() reports confirmed', async () => {
    const el = await openDialog(
      html`<wc-confirm-dialog>Sure?</wc-confirm-dialog>`,
    );
    el.addEventListener('confirm', event => {
      event.preventDefault();
      el.loading = true;
    });
    confirmButton(el).click();
    await el.updateComplete;
    expect(el.open).to.equal(true);
    expect(el.loading).to.equal(true);
    expect(confirmButton(el).loading).to.equal(true);
    expect(cancelButton(el).disabled).to.equal(true);
    expect(nativeDialog(el).getAttribute('aria-busy')).to.equal('true');

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    nativeDialog(el).dispatchEvent(new Event('cancel', { cancelable: true }));
    await el.updateComplete;
    expect(el.open).to.equal(true);

    setTimeout(() => {
      el.loading = false;
      el.hide();
    });
    const event = await oneEvent(el, 'close');
    expect(event.detail).to.deep.equal({ reason: 'api', confirmed: true });
  });

  it('enables Confirm only once the confirm-text is typed exactly, and confirms on Enter', async () => {
    const el = await openDialog(
      html`<wc-confirm-dialog intent="danger" confirm-text="acme-prod"
        >Delete?</wc-confirm-dialog
      >`,
    );
    expect(field(el).label).to.equal('Type acme-prod to confirm');
    expect(confirmButton(el).disabled).to.equal(true);

    let confirms = 0;
    el.addEventListener('confirm', () => {
      confirms += 1;
    });
    const enter = () =>
      field(el).dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
          composed: true,
        }),
      );

    await type(el, 'acme-pro');
    expect(confirmButton(el).disabled).to.equal(true);
    enter();
    confirmButton(el).click();
    expect(confirms).to.equal(0);
    expect(el.open).to.equal(true);

    await type(el, 'ACME-PROD');
    expect(confirmButton(el).disabled).to.equal(true);

    await type(el, 'acme-prod');
    expect(confirmButton(el).disabled).to.equal(false);
    setTimeout(enter);
    const event = await oneEvent(el, 'close');
    expect(confirms).to.equal(1);
    expect(event.detail.confirmed).to.equal(true);
  });

  it('clears the typed text when it opens again', async () => {
    const el = await openDialog(
      html`<wc-confirm-dialog confirm-text="acme-prod"
        >Delete?</wc-confirm-dialog
      >`,
    );
    await type(el, 'acme-prod');
    el.hide();
    await el.updateComplete;
    el.show();
    await el.updateComplete;
    expect(field(el).value).to.equal('');
    expect(confirmButton(el).disabled).to.equal(true);
  });

  it('focuses Confirm by default, Cancel for danger, and the field with confirm-text', async () => {
    const focused = (el: ConfirmDialog) => el.shadowRoot?.activeElement;

    const plain = await openDialog(
      html`<wc-confirm-dialog>Sure?</wc-confirm-dialog>`,
    );
    await waitUntil(() => focused(plain) === confirmButton(plain));
    plain.hide();
    await plain.updateComplete;

    const danger = await openDialog(
      html`<wc-confirm-dialog intent="danger">Sure?</wc-confirm-dialog>`,
    );
    await waitUntil(() => focused(danger) === cancelButton(danger));
    danger.hide();
    await danger.updateComplete;

    const typed = await openDialog(
      html`<wc-confirm-dialog intent="danger" confirm-text="x"
        >Sure?</wc-confirm-dialog
      >`,
    );
    await waitUntil(() => focused(typed) === field(typed));
  });

  it('confirmDialog() resolves true on confirm and removes the element', async () => {
    const result = confirmDialog({
      headline: 'Sign out?',
      message: 'You will need to sign in again.',
      confirmLabel: 'Sign out',
    });
    const el = document.body.querySelector<ConfirmDialog>('wc-confirm-dialog');
    if (!el) throw new Error('confirmDialog() appended no dialog');
    await el.updateComplete;
    expect(el.open).to.equal(true);
    expect(el.headline).to.equal('Sign out?');
    expect(el.textContent).to.equal('You will need to sign in again.');
    expect(confirmButton(el).textContent?.trim()).to.equal('Sign out');

    confirmButton(el).click();
    expect(await result).to.equal(true);
    await waitUntil(() => !el.isConnected, 'dialog was not removed', {
      timeout: 2000,
    });
  });

  it('confirmDialog() resolves false on cancel and on Escape', async () => {
    const cancelled = confirmDialog({ message: 'Sure?', intent: 'danger' });
    const first =
      document.body.querySelector<ConfirmDialog>('wc-confirm-dialog');
    if (!first) throw new Error('confirmDialog() appended no dialog');
    await first.updateComplete;
    expect(first.intent).to.equal('danger');
    cancelButton(first).click();
    expect(await cancelled).to.equal(false);
    await waitUntil(() => !first.isConnected, 'dialog was not removed', {
      timeout: 2000,
    });

    const escaped = confirmDialog({ message: 'Sure?' });
    const second =
      document.body.querySelector<ConfirmDialog>('wc-confirm-dialog');
    if (!second) throw new Error('confirmDialog() appended no dialog');
    await second.updateComplete;
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    expect(await escaped).to.equal(false);
  });
});
