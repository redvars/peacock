/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, aTimeout } from '@open-wc/testing';
import { resetDeprecationWarnings } from '../src/__internal/utils/deprecate.js';
import type { HtmlEditor } from '../src/html-editor/index.js';

// wc-code-editor is left undefined so Monaco is not loaded; the tests talk to the source view
// through the events the editor listens for.
//
// html-editor imports js-beautify, which is CommonJS; the test server cannot load it without a
// CommonJS plugin (@rollup/plugin-commonjs through @web/dev-server-rollup). The module is loaded
// dynamically so the suite is skipped, rather than failing the run, until the server can.
let loaded = false;

before(async () => {
  try {
    const module = await import('../src/html-editor/index.js');
    if (!customElements.get('wc-html-editor')) {
      customElements.define('wc-html-editor', module.HtmlEditor);
    }
    loaded = true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(`html-editor tests skipped: ${error}`);
    loaded = false;
  }
});

beforeEach(function skipUnlessLoaded() {
  if (!loaded) this.skip();
});

type MentionRequester = {
  _requestManagedMentions(query: string): Promise<string[]>;
};

function sourceEditor(el: HtmlEditor): HTMLElement {
  return el.shadowRoot?.querySelector('wc-code-editor') as HTMLElement;
}

/** Collects the console warnings logged while `run` runs. */
async function warningsOf(run: () => Promise<void>): Promise<string[]> {
  resetDeprecationWarnings();
  const warnings: string[] = [];
  const { warn } = console;
  console.warn = (message: string) => warnings.push(message);
  try {
    await run();
  } finally {
    console.warn = warn;
  }
  return warnings;
}

describe('HtmlEditor', () => {
  it('has an empty value and is invalid while required and empty', async () => {
    const el = await fixture<HtmlEditor>(
      html`<wc-html-editor required></wc-html-editor>`,
    );
    expect(el.value).to.equal('');
    expect(el.checkValidity()).to.equal(false);
    expect(el.validity.valueMissing).to.equal(true);

    el.value = '<p>Hello</p>';
    await el.updateComplete;
    expect(el.checkValidity()).to.equal(true);

    // An empty paragraph is still empty.
    el.value = '<p></p>';
    await el.updateComplete;
    expect(el.checkValidity()).to.equal(false);
  });

  it('fires a debounced input, then change when focus leaves after an edit', async () => {
    const el = await fixture<HtmlEditor>(
      html`<wc-html-editor .debounce=${0}></wc-html-editor>`,
    );
    const events: [string, unknown][] = [];
    for (const type of ['input', 'change']) {
      el.addEventListener(type, event =>
        events.push([type, (event as CustomEvent).detail]),
      );
    }

    el.dispatchEvent(new FocusEvent('focusin'));
    sourceEditor(el).dispatchEvent(
      new CustomEvent('input', {
        detail: { value: '<p>Hi</p>' },
        bubbles: true,
        composed: true,
      }),
    );
    expect(el.value).to.equal('<p>Hi</p>');
    await aTimeout(10);
    expect(events).to.deep.equal([['input', { value: '<p>Hi</p>' }]]);

    el.dispatchEvent(new FocusEvent('focusout'));
    expect(events).to.deep.equal([
      ['input', { value: '<p>Hi</p>' }],
      ['change', { value: '<p>Hi</p>' }],
    ]);
  });

  it('shows the toolbar unless hide-toolbar is set', async () => {
    const el = await fixture<HtmlEditor>(
      html`<wc-html-editor></wc-html-editor>`,
    );
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('.html-editor-toolbar')).to.exist;

    const hidden = await fixture<HtmlEditor>(
      html`<wc-html-editor hide-toolbar></wc-html-editor>`,
    );
    await hidden.updateComplete;
    expect(hidden.shadowRoot?.querySelector('.html-editor-toolbar')).to.not
      .exist;
  });

  it('still hides the toolbar with the deprecated showToolbar = false', async () => {
    const warnings = await warningsOf(async () => {
      const el = await fixture<HtmlEditor>(
        html`<wc-html-editor .showToolbar=${false}></wc-html-editor>`,
      );
      await el.updateComplete;
      expect(el.shadowRoot?.querySelector('.html-editor-toolbar')).to.not.exist;
    });
    expect(warnings.some(message => message.includes('hide-toolbar'))).to.be
      .true;
  });

  it('fires mention-search and resolves with the mentions set in response', async () => {
    const el = await fixture<HtmlEditor>(
      html`<wc-html-editor mentions-search="managed"></wc-html-editor>`,
    );
    let query = '';
    el.addEventListener('mention-search', event => {
      query = (event as CustomEvent<{ query: string }>).detail.query;
      el.mentions = [{ label: 'Alex', value: 'alex' }];
    });

    const values = await (
      el as unknown as MentionRequester
    )._requestManagedMentions('al');
    expect(query).to.equal('al');
    expect(values).to.deep.equal(['alex']);
  });

  it('still answers the deprecated search callback, with a warning', async () => {
    const el = await fixture<HtmlEditor>(
      html`<wc-html-editor mentions-search="managed"></wc-html-editor>`,
    );
    el.addEventListener('search', event => {
      const { callback } = (
        event as CustomEvent<{
          callback: (mentions: { label: string; value: string }[]) => void;
        }>
      ).detail;
      callback([{ label: 'Sam', value: 'sam' }]);
    });

    let values: string[] = [];
    const warnings = await warningsOf(async () => {
      values = await (
        el as unknown as MentionRequester
      )._requestManagedMentions('s');
    });
    expect(values).to.deep.equal(['sam']);
    expect(warnings.some(message => message.includes('mention-search'))).to.be
      .true;
  });

  it('reflects size and passes it to the source editor', async () => {
    const el = await fixture<HtmlEditor>(
      html`<wc-html-editor size="sm"></wc-html-editor>`,
    );
    expect(el.getAttribute('size')).to.equal('sm');
    expect(sourceEditor(el).getAttribute('size')).to.equal('sm');
  });
});
