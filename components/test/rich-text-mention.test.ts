/// <reference types="mocha" />
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { fixture, expect, oneEvent } from '@open-wc/testing';
import { Editor } from '@tiptap/core';

import { I18nController } from '../src/__internal/i18n/i18n-controller.js';
import { buildExtensions } from '../src/__internal/rich-text/extensions.js';
import {
  RichTextMentionController,
  type RichTextMentionDetail,
  type RichTextSearchDetail,
} from '../src/__internal/rich-text/mention-controller.js';
import type { MentionSuggestion } from '../src/mention-input/mention-model.js';

/** The smallest editor that offers mentions, as the rich-text components will. */
class TestMentionHost extends LitElement {
  @property() triggers = '@';

  @property({ attribute: false }) suggestions: MentionSuggestion[] = [];

  @property({ type: Boolean }) suggestionsLoading = false;

  @property({ type: Boolean }) disabled = false;

  @property({ type: Boolean }) readonly = false;

  editor?: Editor;

  readonly i18n = new I18nController(this);

  readonly mentions = new RichTextMentionController(this, {
    editor: () => this.editor,
    i18n: this.i18n,
  });

  protected firstUpdated() {
    this.editor = new Editor({
      element: this.renderRoot.querySelector('.root') as HTMLElement,
      extensions: buildExtensions('markdown', {
        mentions: this.mentions.suggestionOptions(),
      }),
      content: '',
      contentType: 'markdown',
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.editor?.destroy();
  }

  render() {
    return html`<div class="root"></div>
      ${this.mentions.render()}`;
  }
}
customElements.define('test-mention-host', TestMentionHost);

const PEOPLE: MentionSuggestion[] = [
  { id: 'usr_1', label: 'Ana Lima', description: 'Billing' },
  { id: 'usr_2', label: 'Andre Silva' },
];

function list(el: TestMentionHost): HTMLElement {
  return el.shadowRoot?.querySelector('.mention-list') as HTMLElement;
}

function press(el: TestMentionHost, key: string) {
  el.editor?.view.dom.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
  );
}

async function hostWithQuery(text: string) {
  const el = await fixture<TestMentionHost>(
    html`<test-mention-host></test-mention-host>`,
  );
  const search = oneEvent(el, 'search');
  el.editor?.chain().focus().insertContent(text).run();
  const event = (await search) as CustomEvent<RichTextSearchDetail>;
  await el.updateComplete;
  return { el, event };
}

describe('RichTextMentionController', () => {
  it('fires search with the trigger and query, and waits for suggestions', async () => {
    const { el, event } = await hostWithQuery('@an');
    expect(event.detail).to.deep.equal({ trigger: '@', query: 'an' });
    expect(list(el).matches(':popover-open')).to.equal(false);

    el.suggestions = PEOPLE;
    await el.updateComplete;
    expect(list(el).matches(':popover-open')).to.equal(true);
    const options = list(el).querySelectorAll('[role=option]');
    expect(options.length).to.equal(2);
    expect(el.editor?.view.dom.getAttribute('aria-activedescendant')).to.equal(
      options[0].id,
    );
    expect(el.editor?.view.dom.getAttribute('aria-expanded')).to.equal('true');
  });

  it('moves with the arrow keys and inserts a mention on Enter', async () => {
    const { el } = await hostWithQuery('Ask @an');
    el.suggestions = PEOPLE;
    await el.updateComplete;

    press(el, 'ArrowDown');
    await el.updateComplete;
    const options = list(el).querySelectorAll('[role=option]');
    expect(options[1].getAttribute('aria-selected')).to.equal('true');

    const picked = oneEvent(el, 'mention');
    press(el, 'Enter');
    const event = (await picked) as CustomEvent<RichTextMentionDetail>;
    expect(event.detail.mention).to.deep.equal({
      id: 'usr_2',
      label: 'Andre Silva',
      trigger: '@',
    });
    expect(el.editor?.getMarkdown()).to.contain(
      'Ask [@Andre Silva](mention:usr_2)',
    );

    await el.updateComplete;
    expect(list(el).matches(':popover-open')).to.equal(false);
    expect(el.editor?.view.dom.hasAttribute('aria-activedescendant')).to.equal(
      false,
    );
  });

  it('closes on Escape without inserting', async () => {
    const { el } = await hostWithQuery('@an');
    el.suggestions = PEOPLE;
    await el.updateComplete;
    press(el, 'Escape');
    await el.updateComplete;
    expect(list(el).matches(':popover-open')).to.equal(false);
    expect(el.editor?.getMarkdown()).to.equal('@an');
  });

  it('types a trigger for a toolbar button, after a space', async () => {
    const el = await fixture<TestMentionHost>(
      html`<test-mention-host></test-mention-host>`,
    );
    el.editor?.chain().focus().insertContent('Hi').run();
    const search = oneEvent(el, 'search');
    el.mentions.insertTrigger();
    const event = (await search) as CustomEvent<RichTextSearchDetail>;
    expect(event.detail.query).to.equal('');
    expect(el.editor?.getText()).to.equal('Hi @');
  });

  it('offers nothing while read-only', async () => {
    const { el } = await hostWithQuery('@an');
    el.readonly = true;
    el.suggestions = PEOPLE;
    await el.updateComplete;
    expect(list(el).matches(':popover-open')).to.equal(false);
  });
});
