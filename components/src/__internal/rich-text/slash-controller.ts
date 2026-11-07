import {
  html,
  nothing,
  type ReactiveController,
  type ReactiveControllerHost,
  type TemplateResult,
} from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { Extension, type Editor, type Range } from '@tiptap/core';
import { PluginKey } from '@tiptap/pm/state';
import {
  Suggestion,
  type SuggestionKeyDownProps,
  type SuggestionProps,
} from '@tiptap/suggestion';

import { FloatingController } from '../controllers/floating-controller.js';
import { OverlayController } from '../controllers/overlay-controller.js';
import type { I18nController } from '../i18n/i18n-controller.js';
import { blocksFor, type BlockCommand } from './commands.js';

interface SlashHost extends ReactiveControllerHost, HTMLElement {
  readonly renderRoot: HTMLElement | DocumentFragment;
}

interface SlashOptions {
  editor: () => Editor | undefined;
  i18n: I18nController;
}

let slashCount = 0;

/**
 * The slash menu: typing `/` lists the blocks the editor can hold (headings, lists, quote, code,
 * table, divider), filtered by what follows the slash; Enter or a click turns the line into that
 * block. Like the mention list, focus stays in the editor and the active item is announced through
 * `aria-activedescendant`.
 *
 * Usage: add `extension()` to the editor's extensions, render `render()` and use the
 * `slash-menu` styles from `editor-chrome.scss`.
 */
export class RichTextSlashController implements ReactiveController {
  private readonly host: SlashHost;

  private readonly options: SlashOptions;

  private readonly listId = `wc-rich-text-slash-${(slashCount += 1)}`;

  private items: BlockCommand[] = [];

  private activeIndex = 0;

  private range: Range | null = null;

  private caretRect?: () => DOMRect | null;

  private open = false;

  private shown = false;

  private readonly floating: FloatingController;

  private readonly overlay: OverlayController;

  constructor(host: SlashHost, options: SlashOptions) {
    this.host = host;
    this.options = options;
    host.addController(this);
    this.floating = new FloatingController(host, {
      placement: 'bottom-start',
      strategy: 'fixed',
      offset: 6,
      trigger: 'manual',
      closeOnClickOutside: false,
      fitViewport: true,
    });
    this.overlay = new OverlayController(host, {
      surface: () => this.list,
      closeOnEscape: () => false,
      focusOnOpen: () => false,
      restoreFocus: () => false,
      requestClose: () => this.close(),
    });
  }

  hostUpdated() {
    if (this.open !== this.shown) {
      this.shown = this.open;
      if (this.open) {
        this.overlay.sync(true);
        this.place();
        this.floating.open();
      } else {
        this.floating.close();
        this.overlay.sync(false);
      }
    } else if (this.open) {
      this.place();
    }
    this.syncEditorAria();
  }

  hostDisconnected() {
    this.open = false;
    this.shown = false;
  }

  /** Whether the menu shows. */
  get visible(): boolean {
    return this.open;
  }

  /** The Tiptap extension that watches for `/`. */
  extension() {
    const controller = this;
    return Extension.create({
      name: 'peacockSlashMenu',
      addProseMirrorPlugins() {
        return [
          Suggestion<BlockCommand, BlockCommand>({
            editor: this.editor,
            char: '/',
            pluginKey: new PluginKey('peacockSlashMenu'),
            allowSpaces: false,
            items: ({ query, editor }) => controller.filter(editor, query),
            command: ({ editor, range, props }) => {
              props.run(editor.chain().focus().deleteRange(range)).run();
            },
            render: () => ({
              onStart: props => controller.onChange(props),
              onUpdate: props => controller.onChange(props),
              onExit: () => controller.close(),
              onKeyDown: props => controller.onKeyDown(props),
            }),
          }),
        ];
      },
    });
  }

  /**
   * Opens the menu below the block at `position` and inserts the chosen block after it; for the
   * block handle's insert button.
   */
  openAfterBlock(position: number) {
    const editor = this.options.editor();
    if (!editor) return;
    try {
      const $pos = editor.state.doc.resolve(position);
      const end = $pos.depth > 0 ? $pos.after(1) : position;
      const coords = editor.view.coordsAtPos(Math.max(0, end - 1));
      const rect = new DOMRect(coords.left, coords.bottom, 0, 0);
      this.items = blocksFor(editor);
      this.activeIndex = 0;
      this.caretRect = () => rect;
      this.insertAt = end;
      this.range = null;
      this.open = true;
      this.host.requestUpdate();
    } catch {
      // The position is outside the document; nothing to open.
    }
  }

  /** Runs the item at `index`. */
  choose(index: number) {
    const item = this.items[index];
    const editor = this.options.editor();
    if (!item || !editor) return;
    if (this.range) {
      item.run(editor.chain().focus().deleteRange(this.range)).run();
    } else if (this.insertAt !== null) {
      const at = this.insertAt;
      editor
        .chain()
        .focus()
        .insertContentAt(at, { type: 'paragraph' })
        .setTextSelection(at + 1)
        .run();
      item.run(editor.chain().focus()).run();
    }
    this.close();
  }

  render(): TemplateResult {
    const { i18n } = this.options;
    return html`<div
      id=${this.listId}
      class="slash-menu"
      popover="manual"
      role="listbox"
      aria-label=${i18n.t('insertBlock')}
      @mousedown=${(event: MouseEvent) => event.preventDefault()}
    >
      ${this.open
        ? this.items.map((item, index) => this.renderItem(item, index))
        : nothing}
      ${this.open && !this.items.length
        ? html`<div class="slash-empty" role="presentation">
            ${i18n.t('noMatchingBlocks')}
          </div>`
        : nothing}
    </div>`;
  }

  // ── Private ──────────────────────────────────────────────────────────────

  /** Where the block handle's insert button puts the new block, when it opened the menu. */
  private insertAt: number | null = null;

  private filter(editor: Editor, query: string): BlockCommand[] {
    const q = query.toLowerCase();
    return blocksFor(editor).filter(
      block =>
        block.id !== 'paragraph' &&
        this.options.i18n.t(block.id).toLowerCase().includes(q),
    );
  }

  private onChange(props: SuggestionProps<BlockCommand, BlockCommand>) {
    this.items = props.items;
    this.activeIndex = 0;
    this.range = props.range;
    this.insertAt = null;
    this.caretRect = props.clientRect ?? undefined;
    this.open = true;
    this.host.requestUpdate();
  }

  private onKeyDown({ event }: SuggestionKeyDownProps): boolean {
    if (!this.open) return false;
    const { length } = this.items;
    switch (event.key) {
      case 'ArrowDown':
        if (length) this.activeIndex = (this.activeIndex + 1) % length;
        this.host.requestUpdate();
        return true;
      case 'ArrowUp':
        if (length) this.activeIndex = (this.activeIndex - 1 + length) % length;
        this.host.requestUpdate();
        return true;
      case 'Enter':
        if (!length) return false;
        this.choose(this.activeIndex);
        return true;
      case 'Escape':
        this.close();
        return true;
      default:
        return false;
    }
  }

  private close() {
    if (!this.open) return;
    this.open = false;
    this.range = null;
    this.insertAt = null;
    this.host.requestUpdate();
  }

  private get list(): HTMLElement | null {
    return this.host.renderRoot.querySelector<HTMLElement>(`#${this.listId}`);
  }

  private get anchor(): HTMLElement | null {
    return this.host.renderRoot.querySelector<HTMLElement>('.slash-anchor');
  }

  private place() {
    const rect = this.caretRect?.();
    const { anchor, list } = this;
    if (!rect || !anchor || !list) return;
    anchor.style.setProperty('top', `${rect.top}px`);
    anchor.style.setProperty('left', `${rect.left}px`);
    anchor.style.blockSize = `${rect.height}px`;
    this.floating.setElements(anchor, list);
  }

  private syncEditorAria() {
    const editor = this.options.editor();
    if (!editor || editor.isDestroyed) return;
    const { dom } = editor.view;
    // The mention list shares these attributes; only touch them while this menu is involved.
    if (this.open) {
      dom.setAttribute('aria-controls', this.listId);
      dom.setAttribute('aria-expanded', 'true');
      if (this.items.length) {
        dom.setAttribute(
          'aria-activedescendant',
          `${this.listId}-${this.activeIndex}`,
        );
      } else {
        dom.removeAttribute('aria-activedescendant');
      }
    } else if (dom.getAttribute('aria-controls') === this.listId) {
      dom.removeAttribute('aria-controls');
      dom.removeAttribute('aria-expanded');
      dom.removeAttribute('aria-activedescendant');
    }
  }

  private renderItem(item: BlockCommand, index: number) {
    const active = index === this.activeIndex;
    /* eslint-disable lit-a11y/click-events-have-key-events */
    return html`<div
      id="${this.listId}-${index}"
      class=${classMap({ 'slash-item': true, active })}
      role="option"
      aria-selected=${active ? 'true' : 'false'}
      @click=${() => this.choose(index)}
      @pointermove=${() => {
        if (this.activeIndex === index) return;
        this.activeIndex = index;
        this.host.requestUpdate();
      }}
    >
      <wc-icon name=${item.icon} size="sm" aria-hidden="true"></wc-icon>
      <span class="slash-item-label">${this.options.i18n.t(item.id)}</span>
      ${item.hint
        ? html`<span class="slash-item-hint" aria-hidden="true"
            >${item.hint}</span
          >`
        : nothing}
    </div>`;
    /* eslint-enable lit-a11y/click-events-have-key-events */
  }
}
