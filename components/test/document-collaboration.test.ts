/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, oneEvent, waitUntil } from '@open-wc/testing';
import type { Editor } from '@tiptap/core';
import * as Y from 'yjs';
import {
  Awareness,
  applyAwarenessUpdate,
  encodeAwarenessUpdate,
} from 'y-protocols/awareness';
import {
  DocumentEditor,
  type DocumentCollaboration,
  type DocumentCommentAddDetail,
} from '../src/document-editor/index.js';
import { normalizeDocument } from '../src/document-editor/document-model.js';

if (!customElements.get('wc-document-editor')) {
  customElements.define('wc-document-editor', DocumentEditor);
}

function body(el: DocumentEditor): Editor {
  return (el as unknown as { _body: Editor })._body;
}

function root(el: DocumentEditor): ShadowRoot {
  return el.shadowRoot as ShadowRoot;
}

async function documentEditor(
  markup = html`<wc-document-editor></wc-document-editor>`,
) {
  const el = await fixture<DocumentEditor>(markup);
  await el.updateComplete;
  return el;
}

/** Selects the first occurrence of `text` in the body. */
function select(el: DocumentEditor, text: string) {
  const editor = body(el);
  let from = -1;
  editor.state.doc.descendants((node, pos) => {
    if (from < 0 && node.isText && node.text?.includes(text)) {
      from = pos + (node.text?.indexOf(text) ?? 0);
    }
  });
  editor
    .chain()
    .focus()
    .setTextSelection({ from, to: from + text.length })
    .run();
}

describe('DocumentEditor comments', () => {
  it('comments on the selection and places the thread beside it', async () => {
    const el = await documentEditor();
    el.importMarkdown(
      'First paragraph.\n\nThe retention period is seven years.',
    );
    select(el, 'seven years');
    const added = oneEvent(el, 'comment-add');
    (
      root(el).querySelector('.toolbar [aria-label="Comment"]') as HTMLElement
    ).click();
    const event = (await added) as CustomEvent<DocumentCommentAddDetail>;
    expect(event.detail.quote).to.equal('seven years');
    expect(el.comments).to.deep.equal([
      { threadId: event.detail.threadId, quote: 'seven years' },
    ]);

    const thread = document.createElement('div');
    thread.slot = 'comments';
    thread.setAttribute('thread-id', event.detail.threadId);
    thread.textContent = 'Is this right?';
    el.append(thread);
    await waitUntil(() => thread.style.top !== '', 'thread not placed');

    const canvas = root(el).querySelector('.canvas') as HTMLElement;
    const mark = root(el).querySelector('.comment-mark') as HTMLElement;
    const anchor =
      mark.getBoundingClientRect().top -
      canvas.getBoundingClientRect().top +
      canvas.scrollTop;
    expect(parseFloat(thread.style.top)).to.be.closeTo(anchor, 3);
    expect(thread.hasAttribute('data-active')).to.equal(true);
    expect(
      root(el).querySelector('.comments')?.hasAttribute('hidden'),
    ).to.equal(false);
  });

  it('removes the highlight when comment-add is cancelled', async () => {
    const el = await documentEditor();
    el.importMarkdown('Some text');
    el.addEventListener('comment-add', event => event.preventDefault());
    select(el, 'Some');
    (
      root(el).querySelector('.toolbar [aria-label="Comment"]') as HTMLElement
    ).click();
    expect(el.comments).to.deep.equal([]);
  });

  it('selects the thread under the caret', async () => {
    const el = await documentEditor();
    el.importMarkdown('Alpha beta gamma');
    select(el, 'beta');
    body(el).commands.setComment('t1');
    const thread = document.createElement('div');
    thread.slot = 'comments';
    thread.setAttribute('thread-id', 't1');
    el.append(thread);
    body(el).commands.setTextSelection(1);
    await el.updateComplete;
    expect(thread.hasAttribute('data-active')).to.equal(false);

    const selected = oneEvent(el, 'comment-select');
    select(el, 'et');
    expect(
      ((await selected) as CustomEvent<{ threadId: string }>).detail.threadId,
    ).to.equal('t1');
    expect(thread.hasAttribute('data-active')).to.equal(true);
    expect(root(el).querySelector('.comment-active')?.textContent).to.equal(
      'beta',
    );
  });

  it('marks a thread whose text was deleted, and clears resolved ones', async () => {
    const el = await documentEditor();
    el.importMarkdown('Keep this. Drop that.');
    select(el, 'that');
    body(el).commands.setComment('t2');
    select(el, 'Keep');
    body(el).commands.setComment('t3');
    const orphan = document.createElement('div');
    orphan.slot = 'comments';
    orphan.setAttribute('thread-id', 't2');
    el.append(orphan);

    // The commented word is a text node of its own now.
    select(el, 'that');
    body(el).commands.deleteSelection();
    await waitUntil(() => orphan.hasAttribute('data-orphan'), 'not an orphan');

    el.removeComment('t3');
    expect(el.comments).to.deep.equal([]);
    expect(el.getMarkdown()).to.equal('Keep this. Drop .');
  });
});

/** Two editors on two Y.Docs that relay updates and awareness to each other. */
async function pair() {
  const docA = new Y.Doc();
  const docB = new Y.Doc();
  docA.on('update', (update: Uint8Array, origin: unknown) => {
    if (origin !== 'relay') Y.applyUpdate(docB, update, 'relay');
  });
  docB.on('update', (update: Uint8Array, origin: unknown) => {
    if (origin !== 'relay') Y.applyUpdate(docA, update, 'relay');
  });
  const awarenessA = new Awareness(docA);
  const awarenessB = new Awareness(docB);
  const relay = (from: Awareness, to: Awareness) =>
    from.on(
      'update',
      (
        { added, updated, removed }: Record<string, number[]>,
        origin: unknown,
      ) => {
        if (origin === 'relay') return;
        const changed = added.concat(updated, removed);
        applyAwarenessUpdate(to, encodeAwarenessUpdate(from, changed), 'relay');
      },
    );
  relay(awarenessA, awarenessB);
  relay(awarenessB, awarenessA);

  const a = await documentEditor();
  a.value = normalizeDocument({
    body: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Shared start' }],
        },
      ],
    },
  });
  a.collaboration = {
    document: docA,
    provider: { awareness: awarenessA },
    user: { name: 'Ana', color: '#1a73e8' },
  } as DocumentCollaboration;
  await waitUntil(
    () => body(a)?.getText() === 'Shared start',
    'A did not join',
  );

  const b = await documentEditor();
  b.collaboration = {
    document: docB,
    provider: { awareness: awarenessB },
    user: { name: 'Ravi', color: '#d93025' },
  } as DocumentCollaboration;
  await waitUntil(
    () => body(b)?.getText() === 'Shared start',
    'B did not get the document',
  );
  return { a, b, docA, awarenessA };
}

describe('DocumentEditor collaboration', () => {
  it('shares edits both ways, without input events for remote changes', async () => {
    const { a, b } = await pair();
    let remoteInputs = 0;
    b.addEventListener('input', () => {
      remoteInputs += 1;
    });
    body(a).chain().focus('end').insertContent(' from Ana').run();
    await waitUntil(() => body(b).getText() === 'Shared start from Ana');
    expect(JSON.stringify(b.value.body)).to.contain('from Ana');

    b.debounce = 0;
    body(b).chain().focus('start').insertContent('Ravi: ').run();
    await waitUntil(() => body(a).getText() === 'Ravi: Shared start from Ana');
    await new Promise(resolve => {
      setTimeout(resolve, 20);
    });
    expect(remoteInputs).to.equal(1);
  });

  it('shares the page setup', async () => {
    const { a, b } = await pair();
    const item = document.createElement('div');
    item.setAttribute('value', 'landscape');
    root(a)
      .querySelectorAll('.status-bar wc-dropdown-button')[1]
      .dispatchEvent(
        new CustomEvent('menu-item-activate', { detail: { item } }),
      );
    await waitUntil(() => b.value.page.orientation === 'landscape');
  });

  it('shares comments, and shows who is editing', async () => {
    const { a, b } = await pair();
    select(a, 'Shared');
    body(a).commands.setComment('t9');
    await waitUntil(() => b.comments.length === 1);
    expect(b.comments[0]).to.deep.equal({ threadId: 't9', quote: 'Shared' });

    await waitUntil(
      () => root(a).querySelectorAll('.people wc-avatar').length === 2,
    );
    const names = Array.from(root(a).querySelectorAll('.people wc-avatar')).map(
      avatar => avatar.getAttribute('label'),
    );
    expect(names).to.deep.equal(['Ana (you)', 'Ravi']);
  });
});
