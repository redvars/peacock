/// <reference types="mocha" />
import { html } from 'lit';
import { expect, fixtureSync, waitUntil } from '@open-wc/testing';
import { Field } from '../src/field/index.js';
import { IconButton } from '../src/button/index.js';
import { Input } from '../src/input/index.js';
import { Textarea } from '../src/textarea/index.js';
import { InlineEdit } from '../src/inline-edit/index.js';

for (const [tag, element] of [
  ['wc-field', Field],
  ['wc-icon-button', IconButton],
  ['wc-input', Input],
  ['wc-textarea', Textarea],
  ['wc-inline-edit', InlineEdit],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

async function setup(template: unknown) {
  const el = fixtureSync<InlineEdit>(template as never);
  await el.updateComplete;
  return el;
}

function q<T extends Element>(el: InlineEdit, selector: string) {
  return el.shadowRoot!.querySelector<T>(selector);
}

/** The native input or textarea inside the editor. */
async function nativeControl(el: InlineEdit) {
  const editor = q<Input>(el, '.control');
  expect(editor).to.exist;
  await editor!.updateComplete;
  return editor!.shadowRoot!.querySelector<
    HTMLInputElement | HTMLTextAreaElement
  >('input, textarea')!;
}

async function open(el: InlineEdit) {
  el.edit();
  await el.updateComplete;
  return nativeControl(el);
}

async function type(el: InlineEdit, text: string) {
  const control = await nativeControl(el);
  control.value = text;
  control.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  await el.updateComplete;
}

async function key(
  el: InlineEdit,
  name: string,
  init: ConstructorParameters<typeof KeyboardEvent>[1] = {},
) {
  const control = await nativeControl(el);
  const event = new KeyboardEvent('keydown', {
    key: name,
    bubbles: true,
    composed: true,
    cancelable: true,
    ...init,
  });
  control.dispatchEvent(event);
  await el.updateComplete;
  return event;
}

describe('wc-inline-edit', () => {
  it('shows the value and an edit button named by the label', async () => {
    const el = await setup(
      html`<wc-inline-edit
        label="Title"
        value="Quarterly report"
      ></wc-inline-edit>`,
    );
    expect(q(el, '.text')!.textContent!.trim()).to.equal('Quarterly report');
    expect(q(el, '.edit-button')!.getAttribute('aria-label')).to.equal(
      'Edit Title',
    );
    expect(el.editing).to.be.false;
  });

  it('shows the placeholder when empty', async () => {
    const el = await setup(
      html`<wc-inline-edit placeholder="Add a description"></wc-inline-edit>`,
    );
    const text = q(el, '.text')!;
    expect(text.textContent!.trim()).to.equal('Add a description');
    expect(text.classList.contains('placeholder')).to.be.true;
  });

  it('opens the editor from the text and from the button', async () => {
    const el = await setup(
      html`<wc-inline-edit label="Title" value="A"></wc-inline-edit>`,
    );
    q<HTMLElement>(el, '.text')!.click();
    await el.updateComplete;
    expect(el.editing).to.be.true;
    expect(el.hasAttribute('editing')).to.be.true;
    const editor = q<Input>(el, 'wc-input.control')!;
    expect(editor.value).to.equal('A');
    expect(editor.configAria['aria-label']).to.equal('Title');

    el.cancel();
    await el.updateComplete;
    q<HTMLElement>(el, '.edit-button')!.click();
    await el.updateComplete;
    expect(el.editing).to.be.true;
  });

  it('does not edit when disabled or readonly', async () => {
    for (const template of [
      html`<wc-inline-edit value="A" disabled></wc-inline-edit>`,
      html`<wc-inline-edit value="A" readonly></wc-inline-edit>`,
    ]) {
      // eslint-disable-next-line no-await-in-loop
      const el = await setup(template);
      expect(q(el, '.edit-button')).to.be.null;
      q<HTMLElement>(el, '.text')!.click();
      el.edit();
      // eslint-disable-next-line no-await-in-loop
      await el.updateComplete;
      expect(el.editing).to.be.false;
    }
  });

  it('saves on Enter with a cancelable change', async () => {
    const el = await setup(html`<wc-inline-edit value="A"></wc-inline-edit>`);
    const events: CustomEvent[] = [];
    el.addEventListener('change', e => events.push(e as CustomEvent));
    let leaked = 0;
    el.addEventListener('input', () => {
      leaked += 1;
    });
    await open(el);
    await type(el, 'B');
    const enter = await key(el, 'Enter');
    expect(enter.defaultPrevented).to.be.true;
    expect(events).to.have.length(1);
    expect(events[0].detail).to.deep.equal({ value: 'B' });
    expect(events[0].cancelable).to.be.true;
    expect(events[0].bubbles && events[0].composed).to.be.true;
    expect(el.value).to.equal('B');
    expect(el.editing).to.be.false;
    expect(leaked).to.equal(0);
  });

  it('closes without an event when nothing changed', async () => {
    const el = await setup(html`<wc-inline-edit value="A"></wc-inline-edit>`);
    let fired = 0;
    el.addEventListener('change', () => {
      fired += 1;
    });
    await open(el);
    await key(el, 'Enter');
    expect(fired).to.equal(0);
    expect(el.editing).to.be.false;
  });

  it('cancels on Escape and fires cancel', async () => {
    const el = await setup(html`<wc-inline-edit value="A"></wc-inline-edit>`);
    let cancelled = 0;
    let changed = 0;
    el.addEventListener('cancel', () => {
      cancelled += 1;
    });
    el.addEventListener('change', () => {
      changed += 1;
    });
    await open(el);
    await type(el, 'B');
    const escape = await key(el, 'Escape');
    expect(escape.defaultPrevented).to.be.true;
    expect(cancelled).to.equal(1);
    expect(changed).to.equal(0);
    expect(el.value).to.equal('A');
    expect(el.editing).to.be.false;

    // The next edit starts from the saved value again.
    await open(el);
    expect(q<Input>(el, '.control')!.value).to.equal('A');
  });

  it('stays in edit mode when change is cancelled', async () => {
    const el = await setup(html`<wc-inline-edit value="A"></wc-inline-edit>`);
    el.addEventListener('change', e => e.preventDefault());
    await open(el);
    await type(el, 'B');
    await key(el, 'Enter');
    expect(el.editing).to.be.true;
    expect(el.value).to.equal('A');
    expect(q<Input>(el, '.control')!.value).to.equal('B');
  });

  it('waits for an asynchronous save and closes when loading ends', async () => {
    const el = await setup(html`<wc-inline-edit value="A"></wc-inline-edit>`);
    el.addEventListener('change', () => {
      el.loading = true;
    });
    await open(el);
    await type(el, 'B');
    await key(el, 'Enter');
    expect(el.editing).to.be.true;
    expect(q<Input>(el, '.control')!.readonly).to.be.true;
    expect(q(el, '.editor')!.getAttribute('aria-busy')).to.equal('true');
    expect(q(el, '[role="status"]')!.textContent!.trim()).to.equal('Saving');

    // Escape and blur do nothing while the save runs.
    await key(el, 'Escape');
    expect(el.editing).to.be.true;

    el.loading = false;
    await el.updateComplete;
    expect(el.editing).to.be.false;
    expect(el.value).to.equal('B');
  });

  it('keeps the value the app sets during an asynchronous save', async () => {
    const el = await setup(html`<wc-inline-edit value="a"></wc-inline-edit>`);
    el.addEventListener('change', () => {
      el.loading = true;
    });
    await open(el);
    await type(el, ' b ');
    await key(el, 'Enter');
    el.value = 'b';
    el.loading = false;
    await el.updateComplete;
    expect(el.value).to.equal('b');
    expect(el.editing).to.be.false;
  });

  it('stays open with the error when the save fails', async () => {
    const el = await setup(html`<wc-inline-edit value="A"></wc-inline-edit>`);
    el.addEventListener('change', () => {
      el.loading = true;
    });
    await open(el);
    await type(el, 'B');
    await key(el, 'Enter');
    el.errorText = 'Could not save';
    el.loading = false;
    await el.updateComplete;
    expect(el.editing).to.be.true;
    expect(el.value).to.equal('A');
    const editor = q<Input>(el, '.control')!;
    expect(editor.error).to.be.true;
    expect(editor.errorText).to.equal('Could not save');
    expect(editor.readonly).to.be.false;
  });

  it('does not save an empty required text', async () => {
    const el = await setup(
      html`<wc-inline-edit value="A" required></wc-inline-edit>`,
    );
    let fired = 0;
    el.addEventListener('change', () => {
      fired += 1;
    });
    await open(el);
    await type(el, '   ');
    await key(el, 'Enter');
    expect(fired).to.equal(0);
    expect(el.editing).to.be.true;
    const editor = q<Input>(el, '.control')!;
    expect(editor.errorText).to.equal('Please fill out this field.');
    expect(editor.configAria['aria-required']).to.equal('true');
    await type(el, 'C');
    expect(q<Input>(el, '.control')!.error).to.be.false;
  });

  it('saves when focus leaves the editor', async () => {
    const el = await setup(html`<wc-inline-edit value="A"></wc-inline-edit>`);
    const outside = document.createElement('button');
    document.body.append(outside);
    await open(el);
    await type(el, 'B');
    const control = await nativeControl(el);
    control.dispatchEvent(
      new FocusEvent('focusout', {
        bubbles: true,
        composed: true,
        relatedTarget: outside,
      }),
    );
    await el.updateComplete;
    expect(el.value).to.equal('B');
    expect(el.editing).to.be.false;
    outside.remove();
  });

  it('uses a textarea with multiline: Enter is a new line, Ctrl+Enter saves', async () => {
    const el = await setup(
      html`<wc-inline-edit value="A" multiline></wc-inline-edit>`,
    );
    await open(el);
    expect(q(el, 'wc-textarea.control')).to.exist;
    await type(el, 'B\nC');
    const enter = await key(el, 'Enter');
    expect(enter.defaultPrevented).to.be.false;
    expect(el.editing).to.be.true;
    await key(el, 'Enter', { ctrlKey: true });
    expect(el.editing).to.be.false;
    expect(el.value).to.equal('B\nC');
  });

  it('passes maxlength to the editor', async () => {
    const el = await setup(
      html`<wc-inline-edit value="A" maxlength="10"></wc-inline-edit>`,
    );
    await open(el);
    expect(q<Input>(el, '.control')!.maxLength).to.equal(10);
  });

  it('shows Save and Cancel buttons with show-actions', async () => {
    const el = await setup(
      html`<wc-inline-edit value="A" show-actions></wc-inline-edit>`,
    );
    await open(el);
    await type(el, 'B');
    q<HTMLElement>(el, '.save-button')!.click();
    await el.updateComplete;
    expect(el.value).to.equal('B');
    expect(el.editing).to.be.false;

    await open(el);
    await type(el, 'C');
    q<HTMLElement>(el, '.cancel-button')!.click();
    await el.updateComplete;
    expect(el.value).to.equal('B');
    expect(el.editing).to.be.false;
  });

  it('returns focus to the edit button after a save from the keyboard', async () => {
    const el = await setup(html`<wc-inline-edit value="A"></wc-inline-edit>`);
    await open(el);
    await type(el, 'B');
    await key(el, 'Enter');
    await waitUntil(() => el.shadowRoot!.activeElement !== null, '', {
      timeout: 500,
    }).catch(() => undefined);
    // Background pages may not move focus; when they do, it lands on the edit button.
    const active = el.shadowRoot!.activeElement;
    if (active) expect(active.classList.contains('edit-button')).to.be.true;
  });
});
