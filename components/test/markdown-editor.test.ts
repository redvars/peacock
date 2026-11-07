/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, aTimeout, oneEvent } from '@open-wc/testing';
import type { Editor } from '@tiptap/core';
// Import the module directly; wc-code-editor is left undefined so Monaco is not loaded, and the
// tests talk to the source view through the events the editor listens for.
import { MarkdownEditor } from '../src/markdown-editor/index.js';

if (!customElements.get('wc-markdown-editor')) {
  customElements.define('wc-markdown-editor', MarkdownEditor);
}

/** The Tiptap editor inside, for typing and selecting in tests. */
function tiptap(el: MarkdownEditor): Editor {
  return (el as unknown as { editor: Editor }).editor;
}

function root(el: MarkdownEditor): ShadowRoot {
  return el.shadowRoot as ShadowRoot;
}

function tool(el: MarkdownEditor, label: string): HTMLElement {
  return root(el).querySelector(
    `.toolbar [aria-label="${label}"]`,
  ) as HTMLElement;
}

async function editor(
  markup = html`<wc-markdown-editor></wc-markdown-editor>`,
) {
  const el = await fixture<MarkdownEditor>(markup);
  await el.updateComplete;
  return el;
}

describe('MarkdownEditor', () => {
  it('shows its value formatted', async () => {
    const el = await editor(
      html`<wc-markdown-editor
        value=${'## Steps\n\n1. Open **billing**'}
      ></wc-markdown-editor>`,
    );
    const prose = root(el).querySelector('.ProseMirror') as HTMLElement;
    expect(prose.querySelector('h2')?.textContent).to.equal('Steps');
    expect(prose.querySelector('ol li strong')?.textContent).to.equal(
      'billing',
    );
  });

  it('turns typing into Markdown and fires a debounced input', async () => {
    const el = await editor(
      html`<wc-markdown-editor debounce="10"></wc-markdown-editor>`,
    );
    const input = oneEvent(el, 'input');
    tiptap(el).chain().focus().insertContent('Hello world').run();
    tiptap(el).chain().selectAll().toggleBold().run();
    const event = (await input) as CustomEvent<{ value: string }>;
    expect(event.detail.value).to.equal('**Hello world**');
    expect(el.value).to.equal('**Hello world**');
  });

  it('fires change when focus leaves after an edit, after the pending input', async () => {
    const el = await editor(
      html`<wc-markdown-editor debounce="5000"></wc-markdown-editor>`,
    );
    const events: string[] = [];
    el.addEventListener('input', () => events.push('input'));
    el.addEventListener('change', () => events.push('change'));
    el.dispatchEvent(new FocusEvent('focusin'));
    tiptap(el).commands.insertContent('Note');
    el.dispatchEvent(new FocusEvent('focusout'));
    expect(events).to.deep.equal(['input', 'change']);

    el.dispatchEvent(new FocusEvent('focusin'));
    el.dispatchEvent(new FocusEvent('focusout'));
    expect(events).to.deep.equal(['input', 'change']);
  });

  it('is invalid while required and empty, and shows it on submit', async () => {
    const form = await fixture<HTMLFormElement>(
      html`<form><wc-markdown-editor required></wc-markdown-editor></form>`,
    );
    const el = form.querySelector('wc-markdown-editor') as MarkdownEditor;
    await el.updateComplete;
    expect(el.checkValidity()).to.equal(false);
    expect(el.validity.valueMissing).to.equal(true);

    form.requestSubmit();
    await el.updateComplete;
    const field = root(el).querySelector('wc-field') as HTMLElement;
    expect(field.hasAttribute('error')).to.equal(true);
    expect(field.getAttribute('error-text')).to.not.equal('');

    el.value = '# Notes';
    await el.updateComplete;
    expect(el.checkValidity()).to.equal(true);
  });

  it('formats the selection from the toolbar', async () => {
    const el = await editor(
      html`<wc-markdown-editor value="word"></wc-markdown-editor>`,
    );
    tiptap(el).chain().focus().selectAll().run();
    tool(el, 'Italic').click();
    expect(el.value).to.equal('*word*');

    tool(el, 'Bulleted list').click();
    expect(el.value).to.equal('- *word*');
    tiptap(el).commands.setTextSelection(4);
    await el.updateComplete;
    expect(tool(el, 'Bulleted list').hasAttribute('selected')).to.equal(true);
  });

  it('offers only what Markdown can store', async () => {
    const el = await editor();
    expect(tool(el, 'Bold')).to.exist;
    expect(tool(el, 'Underline')).to.equal(null);
    expect(tool(el, 'Checklist')).to.exist;
    expect(tool(el, 'Table')).to.exist;
    expect(tool(el, 'Mention someone')).to.exist;
  });

  it('switches to an editable source view and back', async () => {
    const el = await editor(
      html`<wc-markdown-editor
        value="**bold**"
        debounce="0"
      ></wc-markdown-editor>`,
    );
    expect(root(el).querySelector('wc-code-editor')).to.equal(null);

    tool(el, 'View source').click();
    await el.updateComplete;
    const source = root(el).querySelector('wc-code-editor') as HTMLElement & {
      value: string;
      language: string;
    };
    expect(source.getAttribute('language')).to.equal('markdown');
    expect(source.value).to.equal('**bold**');
    expect(root(el).querySelector('.editor-area')?.classList.contains('hidden'))
      .to.be.true;

    source.dispatchEvent(
      new CustomEvent('input', {
        detail: { value: '# Title' },
        bubbles: true,
        composed: true,
      }),
    );
    await el.updateComplete;
    expect(el.value).to.equal('# Title');

    tool(el, 'View source').click();
    await el.updateComplete;
    expect(root(el).querySelector('wc-code-editor')).to.equal(null);
    expect(root(el).querySelector('.ProseMirror h1')?.textContent).to.equal(
      'Title',
    );
  });

  it('turns a line into a block from the slash menu', async () => {
    const el = await editor();
    tiptap(el).chain().focus().insertContent('/head').run();
    // The suggestion plugin resolves its items asynchronously.
    await aTimeout(20);
    await el.updateComplete;
    const menu = root(el).querySelector('.slash-menu') as HTMLElement;
    expect(menu.matches(':popover-open')).to.equal(true);
    const labels = Array.from(
      menu.querySelectorAll('[role=option] .slash-item-label'),
    ).map(label => label.textContent?.trim());
    expect(labels).to.deep.equal(['Heading 1', 'Heading 2', 'Heading 3']);

    tiptap(el).view.dom.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
    tiptap(el).view.dom.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
    expect(tiptap(el).isActive('heading', { level: 2 })).to.equal(true);
    await el.updateComplete;
    expect(menu.matches(':popover-open')).to.equal(false);
  });

  it('links the selection from the link editor, refusing unsafe addresses', async () => {
    const el = await editor(
      html`<wc-markdown-editor value="docs"></wc-markdown-editor>`,
    );
    tiptap(el).chain().focus().selectAll().run();
    tool(el, 'Link').click();
    await el.updateComplete;
    const popover = root(el).querySelector('.link-editor') as HTMLElement;
    expect(popover.matches(':popover-open')).to.equal(true);
    const field = popover.querySelector('wc-input') as HTMLElement;
    const apply = () =>
      (
        Array.from(popover.querySelectorAll('wc-button')).pop() as HTMLElement
      ).click();
    const type = (value: string) =>
      field.dispatchEvent(new CustomEvent('input', { detail: { value } }));

    // eslint-disable-next-line no-script-url
    type('javascript:alert(1)');
    apply();
    await el.updateComplete;
    expect(field.hasAttribute('error')).to.equal(true);
    expect(el.value).to.equal('docs');

    type('peacock.redvars.com/docs');
    apply();
    await el.updateComplete;
    expect(el.value).to.equal('[docs](https://peacock.redvars.com/docs)');
    expect(popover.matches(':popover-open')).to.equal(false);
  });

  it('offers table actions while the caret is in a table', async () => {
    const el = await editor();
    expect(root(el).querySelector('.table-tools')).to.equal(null);
    tool(el, 'Table').click();
    await el.updateComplete;
    expect(root(el).querySelector('.table-tools')).to.exist;
    expect(el.value).to.contain('| --- |');
  });

  it('counts characters against maxlength and reports a longer value', async () => {
    const el = await editor(
      html`<wc-markdown-editor
        maxlength="10"
        value="Hello"
      ></wc-markdown-editor>`,
    );
    const field = root(el).querySelector('wc-field') as HTMLElement;
    expect(field.getAttribute('text-count')).to.equal('5/10');

    el.value = 'Hello there, world';
    await el.updateComplete;
    expect(el.validity.tooLong).to.equal(true);
  });

  it('hides the toolbar with hide-toolbar', async () => {
    const el = await editor(
      html`<wc-markdown-editor hide-toolbar></wc-markdown-editor>`,
    );
    expect(root(el).querySelector('.toolbar')).to.equal(null);
  });

  it('turns mentions off with an empty triggers', async () => {
    const el = await editor(
      html`<wc-markdown-editor triggers=""></wc-markdown-editor>`,
    );
    expect(tool(el, 'Mention someone')).to.equal(null);
    expect(tiptap(el).schema.nodes.mention).to.equal(undefined);
  });

  describe('dragging a block by its handle', () => {
    /** Hovers block `from`, starts dragging its handle, and drops it at `y` over the area. */
    async function drag(
      from: number,
      y: (rects: DOMRect[]) => number,
    ): Promise<MarkdownEditor> {
      const el = await editor(
        html`<wc-markdown-editor
          value=${'First\n\nSecond\n\nThird'}
        ></wc-markdown-editor>`,
      );
      const { view } = tiptap(el);
      const rects = Array.from(view.dom.querySelectorAll('p')).map(p =>
        p.getBoundingClientRect(),
      );
      view.dom.dispatchEvent(
        new MouseEvent('mousemove', {
          clientX: rects[from].left + 5,
          clientY: rects[from].top + rects[from].height / 2,
          bubbles: true,
        }),
      );
      await el.updateComplete;
      const handle = root(el).querySelector(
        '.block-handle-button[draggable="true"]',
      ) as HTMLElement;
      const dataTransfer = new DataTransfer();
      handle.dispatchEvent(
        new DragEvent('dragstart', {
          dataTransfer,
          bubbles: true,
          composed: true,
        }),
      );
      const area = root(el).querySelector('.editor-area') as HTMLElement;
      const at = { clientX: rects[0].left + 40, clientY: y(rects) };
      const over = new DragEvent('dragover', {
        dataTransfer,
        ...at,
        bubbles: true,
        cancelable: true,
      });
      view.dom.dispatchEvent(over);
      expect(over.defaultPrevented).to.equal(true);
      expect(
        root(el).querySelector('.drop-line')?.classList.contains('visible'),
      ).to.equal(true);
      area.dispatchEvent(
        new DragEvent('drop', {
          dataTransfer,
          ...at,
          bubbles: true,
          cancelable: true,
        }),
      );
      return el;
    }

    it('drops on the upper half of a block before it', async () => {
      const el = await drag(0, rects => rects[2].top + 3);
      expect(el.value).to.equal('Second\n\nFirst\n\nThird');
    });

    it('drops on the lower half of a block after it', async () => {
      const el = await drag(2, rects => rects[0].bottom - 3);
      expect(el.value).to.equal('First\n\nThird\n\nSecond');
    });

    it('drops below the last block at the end, padding included', async () => {
      const el = await drag(0, rects => rects[2].bottom + 30);
      expect(el.value).to.equal('Second\n\nThird\n\nFirst');
      expect(
        root(el).querySelector('.drop-line')?.classList.contains('visible'),
      ).to.equal(false);
    });

    it('leaves a block dropped next to itself where it is', async () => {
      const el = await drag(1, rects => rects[1].top + 2);
      expect(el.value).to.equal('First\n\nSecond\n\nThird');
    });
  });

  it('cannot be edited while read-only', async () => {
    const el = await editor(
      html`<wc-markdown-editor readonly value="text"></wc-markdown-editor>`,
    );
    expect(tiptap(el).isEditable).to.equal(false);
    expect(tool(el, 'Bold').hasAttribute('disabled')).to.equal(true);
    expect(root(el).querySelector('.state-tag')).to.exist;

    el.readonly = false;
    await el.updateComplete;
    expect(tiptap(el).isEditable).to.equal(true);
  });

  it('passes size to the source view', async () => {
    const el = await editor(
      html`<wc-markdown-editor size="sm"></wc-markdown-editor>`,
    );
    expect(el.getAttribute('size')).to.equal('sm');
    tool(el, 'View source').click();
    await el.updateComplete;
    expect(
      root(el).querySelector('wc-code-editor')?.getAttribute('size'),
    ).to.equal('sm');
    await aTimeout(0);
  });
});
