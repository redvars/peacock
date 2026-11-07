/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, oneEvent } from '@open-wc/testing';
import type { Editor } from '@tiptap/core';
import {
  CommentComposer,
  type CommentComposerSubmitDetail,
} from '../src/comment-composer/index.js';

if (!customElements.get('wc-comment-composer')) {
  customElements.define('wc-comment-composer', CommentComposer);
}

function tiptap(el: CommentComposer): Editor {
  return (el as unknown as { editor: Editor }).editor;
}

function part<T extends HTMLElement = HTMLElement>(
  el: CommentComposer,
  selector: string,
): T {
  return el.shadowRoot?.querySelector(selector) as T;
}

async function composer(
  markup = html`<wc-comment-composer></wc-comment-composer>`,
) {
  const el = await fixture<CommentComposer>(markup);
  await el.updateComplete;
  return el;
}

function press(el: CommentComposer, init: { key: string; ctrlKey?: boolean }) {
  tiptap(el).view.dom.dispatchEvent(
    new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init }),
  );
}

describe('CommentComposer', () => {
  it('starts closed and opens when focused', async () => {
    const el = await composer();
    expect(part(el, '.footer').hidden).to.equal(true);
    expect(tiptap(el).view.dom.getAttribute('aria-label')).to.equal(
      'Add a comment',
    );
    el.dispatchEvent(new FocusEvent('focusin'));
    await el.updateComplete;
    expect(part(el, '.footer').hidden).to.equal(false);
  });

  it('sends the Markdown and its mentions, then empties', async () => {
    const el = await composer();
    tiptap(el)
      .chain()
      .focus()
      .insertContent('Thanks ')
      .insertContent({
        type: 'mention',
        attrs: { id: 'usr_1', label: 'Ana Lima', mentionSuggestionChar: '@' },
      })
      .run();
    await el.updateComplete;
    const sent = oneEvent(el, 'submit');
    part(el, '.send').click();
    const event = (await sent) as CustomEvent<CommentComposerSubmitDetail>;
    expect(event.detail.value).to.equal('Thanks [@Ana Lima](mention:usr_1)');
    expect(event.detail.mentions).to.deep.equal([
      { id: 'usr_1', label: 'Ana Lima', trigger: '@' },
    ]);
    await el.updateComplete;
    expect(el.value).to.equal('');
    expect(tiptap(el).getText()).to.equal('');
  });

  it('keeps the text when submit is cancelled', async () => {
    const el = await composer();
    el.addEventListener('submit', event => event.preventDefault());
    tiptap(el).chain().focus().insertContent('Draft').run();
    el.submit();
    await el.updateComplete;
    expect(el.value).to.equal('Draft');
  });

  it('sends with Ctrl+Enter', async () => {
    const el = await composer();
    tiptap(el).chain().focus().insertContent('Quick note').run();
    const sent = oneEvent(el, 'submit');
    press(el, { key: 'Enter', ctrlKey: true });
    const event = (await sent) as CustomEvent<CommentComposerSubmitDetail>;
    expect(event.detail.value).to.equal('Quick note');
  });

  it('does not send while empty or loading', async () => {
    const el = await composer(
      html`<wc-comment-composer expanded></wc-comment-composer>`,
    );
    let sent = 0;
    el.addEventListener('submit', () => {
      sent += 1;
    });
    expect(part(el, '.send').hasAttribute('disabled')).to.equal(true);
    el.submit();

    el.value = 'Ready';
    el.loading = true;
    await el.updateComplete;
    expect(part(el, '.send').hasAttribute('disabled')).to.equal(true);
    el.submit();
    expect(sent).to.equal(0);

    el.loading = false;
    await el.updateComplete;
    expect(part(el, '.send').hasAttribute('disabled')).to.equal(false);
  });

  it('cancels with Escape or Cancel when dismissible', async () => {
    const el = await composer(
      html`<wc-comment-composer dismissible></wc-comment-composer>`,
    );
    tiptap(el).chain().focus().insertContent('Never mind').run();
    await el.updateComplete;
    expect(part(el, '.cancel')).to.exist;
    const cancelled = oneEvent(el, 'cancel');
    press(el, { key: 'Escape' });
    await cancelled;
    await el.updateComplete;
    expect(el.value).to.equal('');
  });

  it('ignores Escape when not dismissible', async () => {
    const el = await composer();
    tiptap(el).chain().focus().insertContent('Keep me').run();
    press(el, { key: 'Escape' });
    await el.updateComplete;
    expect(el.value).to.equal('Keep me');
    expect(part(el, '.cancel')).to.equal(null);
  });

  it('allows comment formatting only', async () => {
    const el = await composer(
      html`<wc-comment-composer expanded></wc-comment-composer>`,
    );
    const { schema } = tiptap(el);
    expect(schema.nodes.heading).to.equal(undefined);
    expect(schema.nodes.table).to.equal(undefined);
    expect(schema.nodes.taskList).to.not.equal(undefined);
    const labels = Array.from(
      el.shadowRoot?.querySelectorAll('.toolbar [aria-label]') ?? [],
    ).map(tool => tool.getAttribute('aria-label'));
    expect(labels).to.include('Bold');
    expect(labels).to.include('Mention someone');
    expect(labels).to.not.include('Divider');
    expect(labels).to.not.include('View source');
    expect(el.shadowRoot?.querySelector('.block-handle')).to.equal(null);
  });

  it('is invalid while required and empty', async () => {
    const el = await composer(
      html`<wc-comment-composer required></wc-comment-composer>`,
    );
    expect(el.validity.valueMissing).to.equal(true);
    el.value = 'Filled';
    await el.updateComplete;
    expect(el.checkValidity()).to.equal(true);
  });
});
