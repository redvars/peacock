/// <reference types="mocha" />
import { html } from 'lit';
import {
  aTimeout,
  expect,
  fixture,
  oneEvent,
  waitUntil,
} from '@open-wc/testing';
import type { Editor } from '@tiptap/core';
import { setPeacockAi } from '../src/__internal/ai/config.js';
import type {
  AiCompleteRequest,
  AiTransformRequest,
} from '../src/__internal/ai/types.js';
import {
  inlineDiff,
  RichTextAiController,
  textToContent,
} from '../src/__internal/rich-text/ai-controller.js';
import { AiBadge } from '../src/ai-badge/index.js';
import { Field } from '../src/field/index.js';
import { Markdown } from '../src/markdown/markdown.js';
import { MarkdownEditor } from '../src/markdown-editor/index.js';
import { Textarea } from '../src/textarea/index.js';
import { mockAi } from './helpers/mock-ai.js';

for (const [tag, element] of [
  ['wc-ai-badge', AiBadge],
  ['wc-field', Field],
  ['wc-markdown', Markdown],
  ['wc-markdown-editor', MarkdownEditor],
  ['wc-textarea', Textarea],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

/** Types into the native textarea as a person would: the value changes and `input` fires. */
function type(el: Textarea, text: string) {
  const textarea = el.shadowRoot!.querySelector(
    'textarea',
  ) as HTMLTextAreaElement;
  textarea.focus();
  textarea.value += text;
  textarea.setSelectionRange(textarea.value.length, textarea.value.length);
  textarea.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  return textarea;
}

const ghostOf = (el: Element) =>
  el.shadowRoot!.querySelector('.ghost-text')?.textContent ?? '';

describe('Ghost text in wc-textarea', () => {
  afterEach(() => setPeacockAi({}));

  it('suggests after a pause at the end of a line, and Tab takes it', async () => {
    const provider = mockAi({
      complete: { chunks: [' The laptop was returned.'] },
    });
    setPeacockAi({ provider });
    const el = await fixture<Textarea>(
      html`<wc-textarea label="Notes" ai-completion></wc-textarea>`,
    );
    const textarea = type(el, 'Replaced the screen.');
    await waitUntil(() => ghostOf(el) !== '', 'ghost text', { timeout: 2000 });
    expect(ghostOf(el)).to.equal(' The laptop was returned.');
    const request = provider.requests[0].request as AiCompleteRequest;
    expect(request.before).to.equal('Replaced the screen.');
    expect(request.after).to.equal('');
    expect(request.context.component).to.equal('wc-textarea');
    const hint = textarea.getAttribute('aria-describedby') ?? '';
    const hintText = hint
      .split(' ')
      .map(id => el.shadowRoot!.getElementById(id)?.textContent ?? '')
      .join(' ');
    expect(hintText).to.contain('Suggestion:  The laptop was returned.');

    const input = oneEvent(el, 'input');
    textarea.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
        cancelable: true,
      }),
    );
    await input;
    expect(el.value).to.equal('Replaced the screen. The laptop was returned.');
    await el.updateComplete;
    expect(ghostOf(el)).to.equal('');
  });

  it('takes one word with Ctrl+→ and dismisses with Escape', async () => {
    setPeacockAi({
      provider: mockAi({ complete: { chunks: [' returned on Thursday'] } }),
    });
    const el = await fixture<Textarea>(
      html`<wc-textarea label="Notes" ai-completion></wc-textarea>`,
    );
    const textarea = type(el, 'It was');
    await waitUntil(() => ghostOf(el) !== '', 'ghost text', { timeout: 2000 });
    textarea.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );
    await el.updateComplete;
    expect(el.value).to.equal('It was returned');
    expect(ghostOf(el)).to.equal(' on Thursday');

    textarea.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      }),
    );
    await el.updateComplete;
    expect(ghostOf(el)).to.equal('');
    expect(el.value).to.equal('It was returned');
  });

  it('asks nothing without ai-completion, while AI is off, or on sensitive fields', async () => {
    const provider = mockAi({ complete: { chunks: ['x'] } });
    setPeacockAi({ provider });
    const plain = await fixture<Textarea>(
      html`<wc-textarea label="A"></wc-textarea>`,
    );
    type(plain, 'Hello');
    const sensitive = await fixture<Textarea>(
      html`<wc-textarea label="B" ai-completion sensitive></wc-textarea>`,
    );
    type(sensitive, 'Hello');
    await aTimeout(800);
    expect(provider.requests.length).to.equal(0);

    setPeacockAi({ enabled: false, provider });
    const off = await fixture<Textarea>(
      html`<wc-textarea label="C" ai-completion></wc-textarea>`,
    );
    type(off, 'Hello');
    await aTimeout(800);
    expect(provider.requests.length).to.equal(0);
    expect(off.shadowRoot!.querySelector('.ghost-mirror')).to.equal(null);
  });

  it('cancels the request when the person keeps typing', async () => {
    const provider = mockAi({ complete: { chunks: ['late'], delay: 400 } });
    setPeacockAi({ provider });
    const el = await fixture<Textarea>(
      html`<wc-textarea label="Notes" ai-completion></wc-textarea>`,
    );
    type(el, 'One');
    await waitUntil(() => provider.requests.length === 1, 'first request', {
      timeout: 2000,
    });
    type(el, ' two');
    await waitUntil(() => provider.aborted === 1, 'aborted', { timeout: 2000 });
    expect(ghostOf(el)).to.equal('');
  });
});

/** The Tiptap editor and the AI controller inside a rich-text editor. */
const tiptap = (el: MarkdownEditor) =>
  (el as unknown as { editor: Editor }).editor;
const ai = (el: MarkdownEditor) =>
  (el as unknown as { ai: RichTextAiController }).ai;
const panel = (el: MarkdownEditor) =>
  el.shadowRoot!.querySelector('.ai-panel') as HTMLElement;

describe('AI actions in rich-text editors', () => {
  afterEach(() => setPeacockAi({}));

  it('turns plain model text into content without parsing it', () => {
    expect(textToContent('One <b>two</b>\nthree\n\nFour')).to.deep.equal([
      { type: 'text', text: 'One <b>two</b> three' },
      { type: 'paragraph', content: [{ type: 'text', text: 'Four' }] },
    ]);
    expect(textToContent('  \n\n ')).to.deep.equal([]);
  });

  it('diffs a rewrite word by word, in reading order', () => {
    expect(
      inlineDiff('the job kept failing today', 'the job failed today'),
    ).to.deep.equal([
      { op: 'equal', text: 'the job ' },
      { op: 'delete', text: 'kept failing ' },
      { op: 'insert', text: 'failed ' },
      { op: 'equal', text: 'today' },
    ]);
  });

  it('offers nothing while AI is off or without a transform provider', async () => {
    const el = await fixture<MarkdownEditor>(
      html`<wc-markdown-editor value="Text"></wc-markdown-editor>`,
    );
    expect(ai(el).actionsAvailable).to.equal(false);
    expect(ai(el).slashActions()).to.deep.equal([]);
    expect(el.shadowRoot!.querySelector('.ai-tool')).to.equal(null);

    setPeacockAi({ provider: mockAi({ transform: { chunks: ['x'] } }) });
    await el.updateComplete;
    expect(ai(el).actionsAvailable).to.equal(true);
    expect(el.shadowRoot!.querySelector('.ai-tool')).to.not.equal(null);

    el.noAi = true;
    await el.updateComplete;
    expect(ai(el).actionsAvailable).to.equal(false);
    expect(el.shadowRoot!.querySelector('.ai-tool')).to.equal(null);
  });

  it('streams a rewrite into the preview and replaces the selection on Accept', async () => {
    const provider = mockAi({
      transform: { chunks: ['The export ', 'job failed.'], delay: 20 },
    });
    setPeacockAi({ provider });
    const el = await fixture<MarkdownEditor>(
      html`<wc-markdown-editor
        value="so basically it broke"
        debounce="0"
      ></wc-markdown-editor>`,
    );
    tiptap(el).chain().focus().selectAll().run();
    ai(el).start('improve');
    await el.updateComplete;
    expect(panel(el).matches(':popover-open')).to.equal(true);
    const request = provider.requests[0].request as AiTransformRequest;
    expect(request.action).to.equal('improve');
    expect(request.text).to.equal('so basically it broke');

    await waitUntil(
      () =>
        panel(el)
          .querySelector('wc-button:not([disabled])')
          ?.textContent?.trim() === 'Accept',
      'Accept enabled',
      { timeout: 3000 },
    );
    const markdown = panel(el).querySelector('wc-markdown') as Markdown;
    expect(markdown.value).to.equal('The export job failed.');
    expect(markdown.streaming).to.equal(false);
    // Nothing has changed in the document yet.
    expect(el.value).to.equal('so basically it broke');

    ai(el).accept();
    await el.updateComplete;
    expect(el.value).to.equal('The export job failed.');
    expect(panel(el).matches(':popover-open')).to.equal(false);
  });

  it('leaves the text alone on Discard, and shows Changes as a diff', async () => {
    setPeacockAi({ provider: mockAi({ transform: { chunks: ['Short.'] } }) });
    const el = await fixture<MarkdownEditor>(
      html`<wc-markdown-editor
        value="A much longer sentence."
      ></wc-markdown-editor>`,
    );
    tiptap(el).chain().focus().selectAll().run();
    ai(el).start('shorten');
    await waitUntil(() => !!panel(el).querySelector('.ai-view'), 'done', {
      timeout: 3000,
    });
    const view = panel(el).querySelector('.ai-view') as HTMLElement;
    view.dispatchEvent(
      new CustomEvent('change', {
        detail: { value: 'changes' },
        bubbles: true,
        composed: true,
      }),
    );
    await el.updateComplete;
    const changes = panel(el).querySelector('.ai-changes') as HTMLElement;
    expect(changes.querySelector('del')?.textContent).to.equal(
      'A much longer sentence.',
    );
    expect(changes.querySelector('ins')?.textContent).to.equal('Short.');

    ai(el).discard();
    await el.updateComplete;
    expect(el.value).to.equal('A much longer sentence.');
    expect(panel(el).matches(':popover-open')).to.equal(false);
  });

  it('asks for an instruction first for Tell it what to change', async () => {
    const provider = mockAi({ transform: { chunks: ['Bonjour'] } });
    setPeacockAi({ provider });
    const el = await fixture<MarkdownEditor>(
      html`<wc-markdown-editor value="Hello"></wc-markdown-editor>`,
    );
    tiptap(el).chain().focus().selectAll().run();
    ai(el).start('custom');
    await el.updateComplete;
    const input = panel(el).querySelector(
      '.ai-instruction',
    ) as HTMLInputElement;
    expect(provider.requests.length).to.equal(0);
    input.value = 'In French';
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
    await waitUntil(() => provider.requests.length === 1, 'request', {
      timeout: 2000,
    });
    const request = provider.requests[0].request as AiTransformRequest;
    expect(request.instruction).to.equal('In French');
  });

  it('shows an error and keeps the text when the provider fails', async () => {
    setPeacockAi({
      provider: mockAi({ transform: { error: new Error('down') } }),
    });
    const el = await fixture<MarkdownEditor>(
      html`<wc-markdown-editor value="Keep me"></wc-markdown-editor>`,
    );
    tiptap(el).chain().focus().selectAll().run();
    ai(el).start('fix');
    await waitUntil(() => !!panel(el).querySelector('.ai-error'), 'error', {
      timeout: 3000,
    });
    expect(el.value).to.equal('Keep me');
  });

  it('lists Continue writing and Summarize above in the slash menu', async () => {
    setPeacockAi({
      provider: mockAi({ transform: { chunks: [' More text.'] } }),
    });
    const el = await fixture<MarkdownEditor>(
      html`<wc-markdown-editor></wc-markdown-editor>`,
    );
    tiptap(el).chain().focus().insertContent('/').run();
    await aTimeout(20);
    await el.updateComplete;
    const menu = el.shadowRoot!.querySelector('.slash-menu') as HTMLElement;
    const groups = Array.from(menu.querySelectorAll('.slash-group')).map(g =>
      g.textContent?.trim(),
    );
    expect(groups).to.deep.equal(['Assistant', 'Blocks']);
    const labels = Array.from(
      menu.querySelectorAll('[role=option] .slash-item-label'),
    ).map(l => l.textContent?.trim());
    expect(labels.slice(0, 2)).to.deep.equal([
      'Continue writing',
      'Summarize above',
    ]);
  });

  it('inserts a continuation at the caret', async () => {
    setPeacockAi({
      provider: mockAi({ transform: { chunks: [' It works now.'] } }),
    });
    const el = await fixture<MarkdownEditor>(
      html`<wc-markdown-editor value="Fixed the job."></wc-markdown-editor>`,
    );
    tiptap(el).chain().focus('end').run();
    ai(el).start('continue');
    await waitUntil(
      () =>
        panel(el)
          .querySelector('wc-button:not([disabled])')
          ?.textContent?.trim() === 'Accept',
      'done',
      { timeout: 3000 },
    );
    ai(el).accept();
    await el.updateComplete;
    expect(el.value).to.equal('Fixed the job. It works now.');
  });

  it('shows ghost text at the end of a paragraph, and Tab takes it', async () => {
    setPeacockAi({
      provider: mockAi({ complete: { chunks: [' to the user'] } }),
    });
    const el = await fixture<MarkdownEditor>(
      html`<wc-markdown-editor ai-completion></wc-markdown-editor>`,
    );
    tiptap(el).chain().focus().insertContent('Returned the laptop').run();
    await waitUntil(() => ghostOf(el) !== '', 'ghost text', { timeout: 2000 });
    expect(ghostOf(el)).to.equal(' to the user');
    tiptap(el).view.dom.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(tiptap(el).getText()).to.equal('Returned the laptop to the user');
  });
});
