/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, aTimeout } from '@open-wc/testing';
// Import the module directly; wc-code-editor is left undefined so Monaco is not loaded, and
// the tests talk to the source view through the events the editor listens for.
import { MarkdownEditor } from '../src/markdown-editor/index.js';

if (!customElements.get('wc-markdown-editor')) {
  customElements.define('wc-markdown-editor', MarkdownEditor);
}

function sourceEditor(el: MarkdownEditor): HTMLElement {
  return el.shadowRoot?.querySelector('wc-code-editor') as HTMLElement;
}

/** Types `value` into the source view, as wc-code-editor reports it. */
function typeInSource(el: MarkdownEditor, value: string) {
  sourceEditor(el).dispatchEvent(
    new CustomEvent('input', {
      detail: { value },
      bubbles: true,
      composed: true,
    }),
  );
}

describe('MarkdownEditor', () => {
  it('is invalid while required and empty', async () => {
    const el = await fixture<MarkdownEditor>(
      html`<wc-markdown-editor required></wc-markdown-editor>`,
    );
    expect(el.checkValidity()).to.equal(false);
    expect(el.validity.valueMissing).to.equal(true);

    el.value = '# Notes';
    await el.updateComplete;
    expect(el.checkValidity()).to.equal(true);
  });

  it('shows the validation message once the form is submitted', async () => {
    const form = await fixture<HTMLFormElement>(
      html`<form><wc-markdown-editor required></wc-markdown-editor></form>`,
    );
    const el = form.querySelector('wc-markdown-editor') as MarkdownEditor;
    form.requestSubmit();
    await el.updateComplete;
    const field = el.shadowRoot?.querySelector('wc-field');
    expect(field?.hasAttribute('error')).to.equal(true);
    expect(field?.getAttribute('error-text')).to.not.equal('');
  });

  it('fires a debounced input with the value, and stops the inner events', async () => {
    const el = await fixture<MarkdownEditor>(
      html`<wc-markdown-editor .debounce=${0}></wc-markdown-editor>`,
    );
    const inputs: unknown[] = [];
    const changes: unknown[] = [];
    el.addEventListener('input', event =>
      inputs.push((event as CustomEvent).detail),
    );
    el.addEventListener('change', event =>
      changes.push((event as CustomEvent).detail),
    );

    typeInSource(el, '# Hi');
    sourceEditor(el).dispatchEvent(
      new CustomEvent('change', {
        detail: { value: '# Hi' },
        bubbles: true,
        composed: true,
      }),
    );
    expect(el.value).to.equal('# Hi');
    expect(inputs).to.deep.equal([]);
    await aTimeout(10);
    expect(inputs).to.deep.equal([{ value: '# Hi' }]);
    expect(changes).to.deep.equal([]);
  });

  it('fires change when focus leaves after an edit', async () => {
    const el = await fixture<MarkdownEditor>(
      html`<wc-markdown-editor .debounce=${1000}></wc-markdown-editor>`,
    );
    const events: [string, unknown][] = [];
    for (const type of ['input', 'change']) {
      el.addEventListener(type, event =>
        events.push([type, (event as CustomEvent).detail]),
      );
    }

    el.dispatchEvent(new FocusEvent('focusin'));
    el.dispatchEvent(new FocusEvent('focusout'));
    expect(events).to.deep.equal([]);

    el.dispatchEvent(new FocusEvent('focusin'));
    typeInSource(el, 'Done');
    el.dispatchEvent(new FocusEvent('focusout'));
    // The pending input is flushed first.
    expect(events).to.deep.equal([
      ['input', { value: 'Done' }],
      ['change', { value: 'Done' }],
    ]);
  });

  it('reflects size and passes it to the source editor', async () => {
    const el = await fixture<MarkdownEditor>(
      html`<wc-markdown-editor size="sm"></wc-markdown-editor>`,
    );
    expect(el.getAttribute('size')).to.equal('sm');
    expect(sourceEditor(el).getAttribute('size')).to.equal('sm');
  });
});
