/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, oneEvent } from '@open-wc/testing';
import type { Editor } from '@tiptap/core';
// wc-code-editor is left undefined so Monaco is not loaded.
import { HtmlEditor } from '../src/html-editor/index.js';

if (!customElements.get('wc-html-editor')) {
  customElements.define('wc-html-editor', HtmlEditor);
}

function tiptap(el: HtmlEditor): Editor {
  return (el as unknown as { editor: Editor }).editor;
}

function tool(el: HtmlEditor, label: string): HTMLElement | null {
  return el.shadowRoot?.querySelector(
    `.toolbar [aria-label="${label}"]`,
  ) as HTMLElement | null;
}

describe('HtmlEditor', () => {
  it('leaves only View source in the toolbar while read-only', async () => {
    const el = await fixture<HtmlEditor>(
      html`<wc-html-editor readonly .value=${'<p>Hi</p>'}></wc-html-editor>`,
    );
    await el.updateComplete;
    expect(tiptap(el).isEditable).to.equal(false);
    expect(el.shadowRoot?.querySelector('wc-tag')).to.equal(null);
    expect(tool(el, 'Underline')).to.equal(null);
    expect(tool(el, 'View source')?.hasAttribute('disabled')).to.equal(false);
  });

  it('has an empty value and is invalid while required and empty', async () => {
    const el = await fixture<HtmlEditor>(
      html`<wc-html-editor required></wc-html-editor>`,
    );
    expect(el.value).to.equal('');
    expect(el.validity.valueMissing).to.equal(true);
    el.value = '<p>Hello</p>';
    await el.updateComplete;
    expect(el.checkValidity()).to.equal(true);
  });

  it('reads and writes HTML, dropping what it does not support', async () => {
    const el = await fixture<HtmlEditor>(
      html`<wc-html-editor
        .value=${'<p>Hi <u>there</u><script>alert(1)</script></p><p onclick="x()">Two</p>'}
      ></wc-html-editor>`,
    );
    const prose = el.shadowRoot?.querySelector('.ProseMirror') as HTMLElement;
    expect(prose.querySelector('script')).to.equal(null);
    expect(prose.querySelector('[onclick]')).to.equal(null);
    expect(prose.querySelector('u')?.textContent).to.equal('there');

    const input = oneEvent(el, 'input');
    el.debounce = 0;
    tiptap(el).chain().focus('end').insertContent('!').run();
    await input;
    expect(el.value).to.equal('<p>Hi <u>there</u></p><p>Two!</p>');
  });

  it('offers underline, which HTML can store', async () => {
    const el = await fixture<HtmlEditor>(
      html`<wc-html-editor .value=${'<p>word</p>'}></wc-html-editor>`,
    );
    tiptap(el).chain().focus().selectAll().run();
    tool(el, 'Underline')?.click();
    expect(el.value).to.equal('<p><u>word</u></p>');
  });

  it('stores mentions as data attributes', async () => {
    const el = await fixture<HtmlEditor>(
      html`<wc-html-editor
        .value=${'<p><span data-type="mention" data-id="usr_1" data-label="Ana Lima">@Ana Lima</span></p>'}
      ></wc-html-editor>`,
    );
    const mention = el.shadowRoot?.querySelector('.ProseMirror .mention');
    expect(mention?.textContent).to.equal('@Ana Lima');
    expect(el.value).to.contain('data-id="usr_1"');
  });

  it('shows the HTML in the source view', async () => {
    const el = await fixture<HtmlEditor>(
      html`<wc-html-editor .value=${'<p>Hi</p>'}></wc-html-editor>`,
    );
    tool(el, 'View source')?.click();
    await el.updateComplete;
    const source = el.shadowRoot?.querySelector('wc-code-editor') as
      | (HTMLElement & { value: string })
      | null;
    expect(source?.getAttribute('language')).to.equal('html');
    expect(source?.value).to.equal('<p>Hi</p>');
  });
});
