/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, oneEvent, aTimeout } from '@open-wc/testing';
import type { Editor } from '@tiptap/core';
import { CommentComposer } from '../src/comment-composer/index.js';
import {
  Discussion,
  DiscussionActivity,
  DiscussionComment,
  type DiscussionEditDetail,
  type DiscussionSubmitDetail,
} from '../src/discussion/index.js';
import { Markdown } from '../src/markdown/index.js';

const elements: [string, typeof HTMLElement][] = [
  ['wc-comment-composer', CommentComposer],
  ['wc-discussion', Discussion],
  ['wc-discussion-comment', DiscussionComment],
  ['wc-discussion-activity', DiscussionActivity],
  ['wc-markdown', Markdown],
];
for (const [tag, element] of elements) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

function tiptap(el: CommentComposer): Editor {
  return (el as unknown as { editor: Editor }).editor;
}

async function settle(el: HTMLElement & { updateComplete: Promise<unknown> }) {
  await el.updateComplete;
  await aTimeout(0);
}

async function discussion() {
  const el = await fixture<Discussion>(
    html`<wc-discussion>
      <wc-discussion-activity
        author="Ana Lima"
        datetime="2026-11-07T08:00:00Z"
        value="opened the ticket"
      ></wc-discussion-activity>
      <wc-discussion-comment
        comment-id="c1"
        author="Ravi Kumar"
        datetime="2026-11-07T09:00:00Z"
        value="Looking into **it**."
        editable
        deletable
      >
        <wc-discussion-comment
          slot="replies"
          comment-id="c2"
          author="Ana Lima"
          datetime="2026-11-07T09:30:00Z"
          value="Thanks"
        ></wc-discussion-comment>
      </wc-discussion-comment>
    </wc-discussion>`,
  );
  await settle(el);
  return el;
}

function comment(el: Discussion, id: string): DiscussionComment {
  return el.querySelector(`[comment-id="${id}"]`) as DiscussionComment;
}

function builtInComposer(el: Discussion): CommentComposer {
  return el.shadowRoot?.querySelector('.built-in-composer') as CommentComposer;
}

describe('Discussion', () => {
  it('lists its entries in a feed', async () => {
    const el = await discussion();
    const feed = el.shadowRoot?.querySelector('[role=feed]');
    expect(feed?.getAttribute('aria-label')).to.equal('Comments');
    expect(el.entries.map(entry => entry.tagName.toLowerCase())).to.deep.equal([
      'wc-discussion-activity',
      'wc-discussion-comment',
      'wc-discussion-comment',
    ]);
    expect(el.shadowRoot?.querySelector('.empty')).to.equal(null);
  });

  it('shows the empty state without entries', async () => {
    const el = await fixture<Discussion>(html`<wc-discussion></wc-discussion>`);
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('.empty')?.textContent).to.contain(
      'No comments yet',
    );
  });

  it('renders comment Markdown and activity text', async () => {
    const el = await discussion();
    const markdown = comment(el, 'c1').shadowRoot?.querySelector(
      'wc-markdown',
    ) as Markdown;
    await markdown.updateComplete;
    expect(markdown.shadowRoot?.querySelector('strong')?.textContent).to.equal(
      'it',
    );
    const activity = el.querySelector(
      'wc-discussion-activity',
    ) as DiscussionActivity;
    expect(activity.shadowRoot?.querySelector('.author')?.textContent).to.equal(
      'Ana Lima',
    );
  });

  it('sends a new comment from its composer with parentId null', async () => {
    const el = await discussion();
    const composer = builtInComposer(el);
    await composer.updateComplete;
    tiptap(composer).chain().focus().insertContent('New comment').run();
    const sent = oneEvent(el, 'submit');
    composer.submit();
    const event = (await sent) as CustomEvent<DiscussionSubmitDetail>;
    expect(event.detail).to.deep.equal({
      value: 'New comment',
      mentions: [],
      parentId: null,
    });
    await composer.updateComplete;
    expect(composer.value).to.equal('');
  });

  it('keeps the text when the app cancels submit', async () => {
    const el = await discussion();
    el.addEventListener('submit', event => event.preventDefault());
    const composer = builtInComposer(el);
    await composer.updateComplete;
    tiptap(composer).chain().focus().insertContent('Retry later').run();
    composer.submit();
    await composer.updateComplete;
    expect(composer.value).to.equal('Retry later');
  });

  it('sends a reply with the comment as parentId', async () => {
    const el = await discussion();
    const parent = comment(el, 'c1');
    (parent.shadowRoot?.querySelector('.reply-button') as HTMLElement).click();
    await settle(parent);
    const reply = parent.shadowRoot?.querySelector(
      '.reply-composer',
    ) as CommentComposer;
    expect(reply).to.exist;
    await reply.updateComplete;
    tiptap(reply).chain().focus().insertContent('On it').run();
    const sent = oneEvent(el, 'submit');
    reply.submit();
    const event = (await sent) as CustomEvent<DiscussionSubmitDetail>;
    expect(event.detail.parentId).to.equal('c1');
    expect(event.detail.value).to.equal('On it');
    await parent.updateComplete;
    expect(parent.shadowRoot?.querySelector('.reply-composer')).to.equal(null);
  });

  it('edits a comment in place', async () => {
    const el = await discussion();
    const target = comment(el, 'c1');
    await target.startEdit();
    const editor = target.shadowRoot?.querySelector(
      '.edit-composer',
    ) as CommentComposer;
    await editor.updateComplete;
    expect(editor.value).to.equal('Looking into **it**.');
    tiptap(editor).chain().focus('end').insertContent(' Fixed').run();
    const edited = oneEvent(el, 'edit');
    editor.submit();
    const event = (await edited) as CustomEvent<DiscussionEditDetail>;
    expect(event.detail.commentId).to.equal('c1');
    expect(event.detail.value).to.equal('Looking into **it**. Fixed');
    await target.updateComplete;
    expect(target.shadowRoot?.querySelector('.edit-composer')).to.equal(null);
  });

  it('passes its suggestions to the composer that searched', async () => {
    const el = await discussion();
    const parent = comment(el, 'c1');
    await parent.openReply();
    const reply = parent.shadowRoot?.querySelector(
      '.reply-composer',
    ) as CommentComposer;
    await reply.updateComplete;
    const search = oneEvent(el, 'search');
    tiptap(reply).chain().focus().insertContent('@ra').run();
    await search;
    const people = [{ id: 'usr_7', label: 'Ravi Kumar' }];
    el.suggestions = people;
    await el.updateComplete;
    expect(reply.suggestions).to.equal(people);
    expect(builtInComposer(el).suggestions).to.deep.equal([]);
  });

  it('fires delete from the actions menu', async () => {
    const el = await discussion();
    const target = comment(el, 'c1');
    const menu = target.shadowRoot?.querySelector('.menu') as HTMLElement;
    const deleted = oneEvent(el, 'delete');
    menu.dispatchEvent(
      new CustomEvent('menu-item-activate', {
        detail: { item: { value: 'delete' } },
      }),
    );
    const event = (await deleted) as CustomEvent<{ commentId: string }>;
    expect(event.detail.commentId).to.equal('c1');
  });

  it('passes readonly down and hides the composer', async () => {
    const el = await discussion();
    el.readonly = true;
    await settle(el);
    expect(builtInComposer(el)).to.equal(null);
    const target = comment(el, 'c1');
    await target.updateComplete;
    expect(target.readonly).to.equal(true);
    expect(target.shadowRoot?.querySelector('.reply-button')).to.equal(null);
  });

  it('moves focus between entries with Page Down', async () => {
    const el = await discussion();
    const [first, second] = el.entries;
    first.focus();
    first.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'PageDown',
        bubbles: true,
        composed: true,
      }),
    );
    expect(document.activeElement).to.equal(second);
  });

  it('marks replies and names entries for screen readers', async () => {
    const el = await discussion();
    expect(comment(el, 'c2').isReply).to.equal(true);
    expect(comment(el, 'c1').isReply).to.equal(false);
    expect(
      comment(el, 'c2').shadowRoot?.querySelector('.reply-button'),
    ).to.equal(null);
  });
});
