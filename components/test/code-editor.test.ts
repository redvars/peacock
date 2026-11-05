/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, oneEvent } from '@open-wc/testing';
import { CodeEditor } from '../src/code-editor/index.js';
import { Field } from '../src/field/index.js';
import { Icon } from '../src/icon/index.js';
import { IconButton } from '../src/button/index.js';
import { Tag } from '../src/chip/tag/index.js';

// Monaco is a large chunk with workers, which the test server does not build;
// these tests cover the component shell around it.
CodeEditor.prototype.initializeMonaco = async function initializeMonaco() {};

for (const [tag, element] of [
  ['wc-field', Field],
  ['wc-icon', Icon],
  ['wc-icon-button', IconButton],
  ['wc-tag', Tag],
  ['wc-code-editor', CodeEditor],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

describe('CodeEditor', () => {
  it('shows a copy button by default', async () => {
    const el = await fixture<CodeEditor>(html`<wc-code-editor></wc-code-editor>`);
    expect(el.shadowRoot!.querySelector('.copy-button')).to.exist;
  });

  it('hides the copy button with hide-copy', async () => {
    const el = await fixture<CodeEditor>(html`<wc-code-editor hide-copy></wc-code-editor>`);
    expect(el.hideCopy).to.equal(true);
    expect(el.shadowRoot!.querySelector('.copy-button')).to.not.exist;
  });

  it('fires copied with the value when the copy button is clicked', async () => {
    const el = await fixture<CodeEditor>(
      html`<wc-code-editor language="css" .value=${':root { --x: 1px; }'}></wc-code-editor>`,
    );
    const button = el.shadowRoot!.querySelector('.copy-button') as HTMLElement;
    setTimeout(() => button.click());
    const event = (await oneEvent(el, 'copied')) as CustomEvent<{ value: string }>;
    expect(event.detail.value).to.equal(':root { --x: 1px; }');
  });

  it('accepts css as a language', async () => {
    const el = await fixture<CodeEditor>(html`<wc-code-editor language="css"></wc-code-editor>`);
    expect(el.language).to.equal('css');
    el.language = 'scss';
    await el.updateComplete;
    expect(el.language).to.equal('scss');
  });

  it('shows the read-only badge only when asked', async () => {
    const plain = await fixture<CodeEditor>(html`<wc-code-editor readonly></wc-code-editor>`);
    expect(plain.shadowRoot!.querySelector('.read-only-tag')).to.not.exist;

    const badged = await fixture<CodeEditor>(
      html`<wc-code-editor readonly show-readonly-badge></wc-code-editor>`,
    );
    expect(badged.shadowRoot!.querySelector('.read-only-tag')).to.exist;
  });

  it('accepts typescript as a language', async () => {
    const el = await fixture<CodeEditor>(html`<wc-code-editor language="typescript"></wc-code-editor>`);
    expect(el.language).to.equal('typescript');
  });

  it('takes its container\'s height with fill, without a field around it', async () => {
    const el = await fixture<CodeEditor>(html`<div style="height: 240px"><wc-code-editor fill></wc-code-editor></div>`);
    const editor = el.querySelector('wc-code-editor') as CodeEditor;
    await editor.updateComplete;
    expect(editor.hasAttribute('fill')).to.equal(true);
    expect(editor.shadowRoot!.querySelector('wc-field')).to.not.exist;
    const pane = editor.shadowRoot!.querySelector('.editor') as HTMLElement;
    expect(pane.getBoundingClientRect().height).to.equal(240);
  });

  it('keeps breakpoints, the current line and markers as given', async () => {
    const el = await fixture<CodeEditor>(
      html`<wc-code-editor breakpoint-gutter current-line="3" .breakpoints=${[1, 3]} .markers=${[{ line: 2, message: 'Nope' }]}></wc-code-editor>`,
    );
    expect(el.breakpointGutter).to.equal(true);
    expect(el.currentLine).to.equal(3);
    expect(el.breakpoints).to.deep.equal([1, 3]);
    expect(el.markers[0].message).to.equal('Nope');
  });

  it('does not dim the field when read-only', async () => {
    const el = await fixture<CodeEditor>(html`<wc-code-editor readonly></wc-code-editor>`);
    const field = el.shadowRoot!.querySelector('wc-field') as Field;
    expect(field.readonly).to.equal(false);
  });
});
