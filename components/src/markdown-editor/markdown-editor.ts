import { html, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { Editor, Extension, Range } from '@tiptap/core';
import { Plugin, NodeSelection } from '@tiptap/pm/state';
import { DOMSerializer, Fragment, Slice } from '@tiptap/pm/model';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Suggestion from '@tiptap/suggestion';
import { computePosition, flip, offset, shift } from '@floating-ui/dom';
import { marked } from 'marked';
import TurndownService from 'turndown';

import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import type { PeacockStrings } from '@/__internal/i18n/strings.js';
import BaseInput from '../input/BaseInput.js';

import styles from './markdown-editor.scss';

/** String keys of the slash menu item titles. */
type SlashTitleKey =
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'bulletedList'
  | 'numberedList'
  | 'quote'
  | 'codeBlock'
  | 'divider';

interface SlashItem {
  /** Key of the item's title in Peacock's strings. */
  titleKey: SlashTitleKey;
  hint: string;
  icon: string;
  command: (args: { editor: Editor; range: Range }) => void;
}

const SLASH_ITEMS: SlashItem[] = [
  {
    titleKey: 'heading1',
    hint: '#',
    icon: 'title',
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 1 })
        .run(),
  },
  {
    titleKey: 'heading2',
    hint: '##',
    icon: 'title',
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 2 })
        .run(),
  },
  {
    titleKey: 'heading3',
    hint: '###',
    icon: 'title',
    command: ({ editor, range }) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 3 })
        .run(),
  },
  {
    titleKey: 'bulletedList',
    hint: '-',
    icon: 'format_list_bulleted',
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    titleKey: 'numberedList',
    hint: '1.',
    icon: 'format_list_numbered',
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    titleKey: 'quote',
    hint: '>',
    icon: 'format_quote',
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    titleKey: 'codeBlock',
    hint: '```',
    icon: 'code',
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  {
    titleKey: 'divider',
    hint: '---',
    icon: 'horizontal_rule',
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
];

/**
 * @label Markdown Editor
 * @tag wc-markdown-editor
 * @rawTag markdown-editor
 *
 * @summary A Tiptap-powered Notion-like Markdown editor with a bottom toggle
 *   between rendered and raw markdown views.
 * @overview
 * <p>The Markdown Editor provides a block-based, Notion-like writing surface
 * built on Tiptap. Type <code>/</code> to open a slash menu for inserting
 * headings, lists, quotes, code blocks, and dividers. Select text to reveal
 * a floating bubble toolbar with inline formatting actions.</p>
 *
 * <p>The canonical <code>value</code> is Markdown. Use the bottom segmented
 * switch to toggle between the rendered editor and the raw markdown source.
 * The component fires <code>input</code> with <code>{ value }</code> as the content changes
 * (after <code>debounce</code> milliseconds without typing) and <code>change</code> with
 * <code>{ value }</code> when focus leaves the editor after an edit. With
 * <code>required</code>, an empty editor blocks form submission.</p>
 *
 * <p><code>size</code> sets the text size: <code>sm</code> or <code>md</code> (the default), as on
 * <code>wc-code-editor</code>.</p>
 *
 * <p><strong>Breaking in 3.x:</strong> <code>change</code> used to fire, debounced, on every
 * edit; it now fires once when the edit is committed (on blur), and the debounced event is
 * <code>input</code>. Listen for <code>input</code> to keep the old timing.</p>
 *
 * @cssprop --markdown-editor-min-height - Minimum height of the editable area. Defaults to 12rem.
 * @cssprop --markdown-editor-bubble-background - Background color of the selection bubble menu.
 * @cssprop --markdown-editor-slash-background - Background color of the slash command menu.
 *
 * @fires {CustomEvent<{value: string}>} input - Dispatched as the content changes, after `debounce` milliseconds without typing.
 * @fires {CustomEvent<{value: string}>} change - Dispatched when focus leaves the editor after an edit.
 *
 * @example
 * ```html
 * <wc-markdown-editor
 *   label="Notes"
 *   value="# Hello\n\nType a slash on a new line to insert blocks."
 * ></wc-markdown-editor>
 * ```
 * @tags input editor
 */
@IndividualComponent
export class MarkdownEditor extends BaseInput {
  // ── Static ────────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ────────────────────────────────────────────────────────────

  /** Current Markdown value of the editor. */
  @property({ type: String })
  value = '';

  /** Label displayed above the editor. */
  @property({ type: String })
  label = '';

  /** Placeholder text shown when the editor is empty. Defaults to Peacock's "Type '/' for commands…". */
  @property({ type: String })
  placeholder = '';

  /** Visual style of the wrapping field. */
  @property({ type: String })
  variant: 'filled' | 'outlined' | 'default' = 'default';

  /** Size of the text: `sm` or `md`. */
  @property({ type: String, reflect: true })
  size: 'sm' | 'md' = 'md';

  /** Helper text displayed below the editor. */
  @property({ type: String, attribute: 'helper-text' })
  helperText = '';

  /** Whether to show an error state. */
  @property({ type: Boolean })
  error = false;

  /** Error message text. */
  @property({ type: String, attribute: 'error-text' })
  errorText = '';

  /** Debounce in milliseconds for dispatching `input`. */
  @property({ type: Number })
  debounce = 250;

  /** Overrides Peacock's strings for this instance only. */
  @property({ attribute: false }) strings?: Partial<PeacockStrings>;

  // ── State ─────────────────────────────────────────────────────────────────

  /** Whether the editor currently has focus. */
  @state() private _focused = false;

  /** Current view mode: rendered editor or raw markdown. */
  @state() private _mode: 'editor' | 'markdown' = 'editor';

  /** Whether the bubble toolbar is visible. */
  @state() private _bubbleOpen = false;

  /** Whether the slash command menu is visible. */
  @state() private _slashOpen = false;

  /** Filtered slash menu items. */
  @state() private _slashItems: SlashItem[] = [];

  /** Currently highlighted slash menu index. */
  @state() private _slashIndex = 0;

  /** Whether the block handle panel is visible. */
  @state() private _blockHandleVisible = false;

  // ── Queries ───────────────────────────────────────────────────────────────

  @query('.tiptap-root')
  private _editorEl?: HTMLDivElement;

  @query('.bubble-menu')
  private _bubbleEl?: HTMLDivElement;

  @query('.slash-menu')
  private _slashEl?: HTMLDivElement;

  @query('.block-handle')
  private _blockHandleEl?: HTMLDivElement;

  // ── Private fields ────────────────────────────────────────────────────────

  /** TipTap editor instance. */
  private _editor?: Editor;

  /** Debounce timer for the `input` event. */
  private _inputTimeout?: number;

  /** Whether focus is somewhere inside the editor. */
  private _focusWithin = false;

  /** The value when focus entered the editor; `change` fires on leaving when it differs. */
  private _valueAtFocus = '';

  /** Most recent slash-suggestion bounding rect (for popup placement). */
  private _slashClientRect: (() => DOMRect | null) | null = null;

  /** Slash-suggestion command callback to invoke on selection. */
  private _slashCommand?: (item: SlashItem) => void;

  /** ProseMirror doc position (inside-block) of the block under the handle. */
  private _blockHandleNodePos = -1;

  /** Timer id for delayed hide of the block handle. */
  private _blockHandleHideTimeout?: number;

  /** Peacock's strings for the menus, handles, modes, tags and placeholder. */
  private readonly i18n = new I18nController(this);

  /** Reusable Turndown serializer instance. */
  private _turndown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '_',
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  constructor() {
    super();
    this.addEventListener('focusin', this._onFocusIn);
    this.addEventListener('focusout', this._onFocusOut);
  }

  protected firstUpdated() {
    this._initializeEditor();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._flushInput();
    if (this._blockHandleHideTimeout) {
      window.clearTimeout(this._blockHandleHideTimeout);
      this._blockHandleHideTimeout = undefined;
    }
    this._destroyEditor();
  }

  protected override updated(changed: PropertyValues<this>) {
    super.updated(changed);
    if (changed.has('value') && this._editor) {
      const currentMd = MarkdownEditor._normalizeMd(
        this._htmlToMarkdown(this._editor.getHTML()),
      );
      const nextMd = MarkdownEditor._normalizeMd(this.value);
      if (currentMd !== nextMd) {
        this._editor.commands.setContent(
          this._markdownToHtml(this.value),
          false,
        );
      }
    }

    if ((changed.has('disabled') || changed.has('readonly')) && this._editor) {
      this._editor.setEditable(!(this.disabled || this.readonly));
    }

    if ((changed.has('placeholder') || changed.has('strings')) && this._editor) {
      this._destroyEditor();
      this._initializeEditor();
    }
  }

  // ── Public methods ────────────────────────────────────────────────────────

  override focus() {
    if (this._editor && this._mode === 'editor') this._editor.commands.focus();
    else super.focus();
  }

  // ── Private methods: conversion ───────────────────────────────────────────

  private static _normalizeMd(value: string) {
    return (value ?? '').replace(/\r\n/g, '\n').replace(/\s+$/g, '');
  }

  private _markdownToHtml(md: string): string {
    return marked.parse(md ?? '', {
      gfm: true,
      breaks: true,
      async: false,
    }) as string;
  }

  private _htmlToMarkdown(htmlStr: string): string {
    return this._turndown.turndown(htmlStr ?? '');
  }

  // ── Private methods: TipTap setup ─────────────────────────────────────────

  /** The `placeholder`, or Peacock's default when it is empty. */
  private _placeholderText() {
    return this.placeholder || this.i18n.t('slashCommandsPlaceholder');
  }

  private _destroyEditor() {
    if (!this._editor) return;
    this._editorEl?.removeEventListener(
      'click',
      this._focusEditorOnContainerClick,
    );
    this._editor.destroy();
    this._editor = undefined;
  }

  private _initializeEditor() {
    if (!this._editorEl || this._editor) return;

    this._editor = new Editor({
      element: this._editorEl,
      extensions: [
        StarterKit,
        Underline,
        Placeholder.configure({
          placeholder: () => this._placeholderText(),
        }),
        this._buildSlashExtension(),
        this._buildBlockHandleExtension(),
      ],
      content: this._markdownToHtml(this.value),
      editable: !(this.disabled || this.readonly),
      onFocus: () => {
        this._focused = true;
      },
      onBlur: () => {
        this._focused = false;
        window.setTimeout(() => {
          this._bubbleOpen = false;
        }, 150);
      },
      onUpdate: () => {
        if (!this._editor) return;

        const nextMd = MarkdownEditor._normalizeMd(
          this._htmlToMarkdown(this._editor.getHTML()),
        );
        if (nextMd === this.value) return;
        this.value = nextMd;
        this._dispatchDebouncedInput();
      },
      onSelectionUpdate: () => {
        this._updateBubbleMenu();
      },
    });

    this._editorEl.addEventListener('click', this._focusEditorOnContainerClick);
    // Render the bubble menu, which needs the editor.
    this.requestUpdate();
  }

  private _focusEditorOnContainerClick = (event: Event) => {
    if (!this._editor) return;
    if (event.target === this._editorEl) {
      this._editor.commands.focus('end');
    }
  };

  // ── Private methods: slash command ────────────────────────────────────────

  private _buildSlashExtension() {
    const host = this;

    return Extension.create({
      name: 'slashCommand',

      addProseMirrorPlugins() {
        return [
          Suggestion<SlashItem>({
            editor: this.editor,
            char: '/',
            startOfLine: false,
            allowSpaces: false,
            items: ({ query: slashQuery }) => {
              const q = slashQuery.toLowerCase();
              return SLASH_ITEMS.filter(item =>
                host.i18n.t(item.titleKey).toLowerCase().includes(q),
              ).slice(0, 10);
            },
            command: ({ editor, range, props }) => {
              props.command({ editor, range });
            },
            render: () => ({
              onStart: props => {
                host._slashItems = props.items;
                host._slashIndex = 0;
                host._slashClientRect =
                  props.clientRect as () => DOMRect | null;
                host._slashCommand = item => {
                  props.command({
                    ...item,
                    command: item.command,
                  } as unknown as SlashItem);
                };
                host._slashOpen = props.items.length > 0;
                host._positionSlashMenu();
              },
              onUpdate: props => {
                host._slashItems = props.items;
                host._slashIndex = 0;
                host._slashClientRect =
                  props.clientRect as () => DOMRect | null;
                host._slashOpen = props.items.length > 0;
                host._positionSlashMenu();
              },
              onKeyDown: ({ event }) => {
                if (!host._slashOpen) return false;

                if (event.key === 'ArrowDown') {
                  host._slashIndex =
                    (host._slashIndex + 1) % host._slashItems.length;
                  return true;
                }
                if (event.key === 'ArrowUp') {
                  host._slashIndex =
                    (host._slashIndex - 1 + host._slashItems.length) %
                    host._slashItems.length;
                  return true;
                }
                if (event.key === 'Enter') {
                  const item = host._slashItems[host._slashIndex];
                  if (item && host._slashCommand) {
                    host._slashCommand(item);
                  }
                  return true;
                }
                if (event.key === 'Escape') {
                  host._slashOpen = false;
                  return true;
                }
                return false;
              },
              onExit: () => {
                host._slashOpen = false;
                host._slashClientRect = null;
                host._slashCommand = undefined;
              },
            }),
          }),
        ];
      },
    });
  }

  private async _positionSlashMenu() {
    await this.updateComplete;

    if (!this._slashEl || !this._slashClientRect) return;
    const rect = this._slashClientRect();
    if (!rect) return;

    const virtual = {
      getBoundingClientRect: () => rect,
    };

    const { x, y } = await computePosition(virtual, this._slashEl, {
      placement: 'bottom-start',
      strategy: 'fixed',
      middleware: [offset(6), flip(), shift({ padding: 8 })],
    });

    this._slashEl.style.left = `${x}px`;
    this._slashEl.style.top = `${y}px`;
  }

  private _onSlashItemClick = (event: MouseEvent) => {
    event.preventDefault();
    const target = (event.currentTarget as HTMLElement) ?? null;
    if (!target) return;
    const index = Number(target.dataset.index ?? '-1');
    const item = this._slashItems[index];
    if (item && this._slashCommand) {
      this._slashCommand(item);
    }
  };

  // ── Private methods: block handle ─────────────────────────────────────────

  private _buildBlockHandleExtension() {
    const host = this;

    return Extension.create({
      name: 'blockHandle',

      addProseMirrorPlugins() {
        return [
          new Plugin({
            props: {
              handleDOMEvents: {
                mousemove: (view, event) => {
                  if (host.disabled || host.readonly || host._mode !== 'editor') {
                    host._blockHandleVisible = false;
                    return false;
                  }
                  const coords = view.posAtCoords({
                    left: event.clientX,
                    top: event.clientY,
                  });
                  if (!coords) {
                    host._blockHandleVisible = false;
                    return false;
                  }
                  try {
                    // Store the inside-block position (not before(1)) so that
                    // domAtPos() resolves to the block element, not its parent.
                    host._blockHandleNodePos = coords.pos;
                    window.clearTimeout(host._blockHandleHideTimeout);
                    host._blockHandleHideTimeout = undefined;
                    host._blockHandleVisible = true;
                    host._positionBlockHandle();
                  } catch {
                    host._blockHandleVisible = false;
                  }
                  return false;
                },
                mouseleave: (_view, event) => {
                  const rel = (event as MouseEvent).relatedTarget as Node | null;
                  if (
                    host._blockHandleEl?.contains(rel) ||
                    rel === host._blockHandleEl
                  )
                    return false;
                  // Delay so the mouse can travel to the handle without it vanishing.
                  window.clearTimeout(host._blockHandleHideTimeout);
                  host._blockHandleHideTimeout = window.setTimeout(() => {
                    host._blockHandleVisible = false;
                  }, 400);
                  return false;
                },
              },
            },
          }),
        ];
      },
    });
  }

  private _positionBlockHandle() {
    if (!this._editor || !this._blockHandleEl) return;
    const { view } = this._editor;
    const pos = this._blockHandleNodePos;
    if (pos < 0) return;
    try {
      const domRef = view.domAtPos(pos);
      let el: Element | null =
        domRef.node.nodeType === Node.TEXT_NODE
          ? (domRef.node as Text).parentElement
          : (domRef.node as Element);
      while (el && el !== view.dom) {
        const d = getComputedStyle(el).display;
        if (d === 'block' || d === 'list-item') break;
        el = el.parentElement;
      }
      if (!el || el === view.dom) {
        this._blockHandleVisible = false;
        return;
      }
      const blockRect = el.getBoundingClientRect();
      // Use .markdown-editor-content (grandparent of .ProseMirror) as the
      // left anchor so the handle sits inside the left padding area and is
      // never clipped by a sidebar or page margin.
      const contentEl = view.dom.parentElement?.parentElement;
      const contentLeft = contentEl
        ? contentEl.getBoundingClientRect().left
        : view.dom.getBoundingClientRect().left - 16;
      const handleH = this._blockHandleEl.offsetHeight || 60;
      const top = blockRect.top + blockRect.height / 2 - handleH / 2;
      const left = contentLeft + 4;
      this._blockHandleEl.style.top = `${top}px`;
      this._blockHandleEl.style.left = `${left}px`;
    } catch {
      this._blockHandleVisible = false;
    }
  }

  private _onBlockHandleMouseEnter = () => {
    window.clearTimeout(this._blockHandleHideTimeout);
    this._blockHandleHideTimeout = undefined;
  };

  private _onBlockHandleMouseLeave = (event: MouseEvent) => {
    const rel = event.relatedTarget as Node | null;
    if (this._editorEl?.contains(rel)) return;
    window.clearTimeout(this._blockHandleHideTimeout);
    this._blockHandleHideTimeout = window.setTimeout(() => {
      this._blockHandleVisible = false;
    }, 150);
  };

  private _onInsertBlockClick = () => {
    if (!this._editor || this.disabled || this.readonly) return;
    const { view } = this._editor;
    const { state } = view;
    try {
      const $pos = state.doc.resolve(this._blockHandleNodePos);
      const nodeEnd = $pos.after(1);
      const safePos = Math.min(nodeEnd - 1, state.doc.content.size - 1);
      const coords = view.coordsAtPos(safePos);
      const rect = new DOMRect(coords.left, coords.bottom, 0, 0);

      this._slashItems = [...SLASH_ITEMS];
      this._slashIndex = 0;
      this._slashClientRect = () => rect;
      this._slashCommand = item => {
        if (!this._editor) return;
        const end = nodeEnd;
        this._editor
          .chain()
          .focus()
          .insertContentAt(end, { type: 'paragraph' })
          .setTextSelection(end + 1)
          .run();
        const { from } = this._editor.state.selection;
        item.command({ editor: this._editor, range: { from, to: from } });
        this._slashOpen = false;
        this._slashClientRect = null;
        this._slashCommand = undefined;
      };
      this._slashOpen = true;
      this._positionSlashMenu();
    } catch { /* ignore */ }
  };

  private _onDragHandleMouseDown = (event: MouseEvent) => {
    event.preventDefault();
    if (!this._editor) return;
    const { view } = this._editor;
    const { state } = view;
    try {
      const $pos = state.doc.resolve(this._blockHandleNodePos);
      const nodePos = $pos.depth > 0 ? $pos.before(1) : this._blockHandleNodePos;
      const sel = NodeSelection.create(state.doc, nodePos);
      view.dispatch(state.tr.setSelection(sel));
    } catch { /* ignore */ }
  };

  private _onDragHandleDragStart = (event: DragEvent) => {
    if (!this._editor || !event.dataTransfer) return;
    const { view } = this._editor;
    const { state } = view;
    try {
      const $pos = state.doc.resolve(this._blockHandleNodePos);
      const nodePos = $pos.depth > 0 ? $pos.before(1) : this._blockHandleNodePos;
      const node = state.doc.nodeAt(nodePos);
      if (!node) return;
      const slice = new Slice(Fragment.from(node), 0, 0);
      const container = document.createElement('div');
      container.appendChild(
        DOMSerializer.fromSchema(state.schema).serializeFragment(slice.content),
      );
      event.dataTransfer.clearData();
      event.dataTransfer.setData('text/html', container.innerHTML);
      event.dataTransfer.setData('text/plain', container.textContent ?? '');
      event.dataTransfer.effectAllowed = 'move';
      view.dragging = { slice, move: true };
    } catch { /* ignore */ }
  };

  private _onDragHandleDragEnd = () => {
    if (this._editor) this._editor.view.dragging = null;
  };

  // ── Private methods: bubble menu ──────────────────────────────────────────

  private async _updateBubbleMenu() {
    if (!this._editor || this.disabled || this.readonly) {
      this._bubbleOpen = false;
      return;
    }

    if (this._mode !== 'editor') {
      this._bubbleOpen = false;
      return;
    }

    const { from, to, empty } = this._editor.state.selection;
    if (empty || from === to) {
      this._bubbleOpen = false;
      return;
    }

    this._bubbleOpen = true;
    await this.updateComplete;

    if (!this._bubbleEl) return;

    const { view } = this._editor;
    const start = view.coordsAtPos(from);
    const end = view.coordsAtPos(to);
    const rect: DOMRect = {
      x: Math.min(start.left, end.left),
      y: start.top,
      left: Math.min(start.left, end.left),
      top: start.top,
      right: Math.max(start.right, end.right),
      bottom: end.bottom,
      width: Math.max(start.right, end.right) - Math.min(start.left, end.left),
      height: end.bottom - start.top,
      toJSON: () => ({}),
    };

    const virtual = {
      getBoundingClientRect: () => rect,
    };

    const { x, y } = await computePosition(virtual, this._bubbleEl, {
      placement: 'top',
      strategy: 'fixed',
      middleware: [offset(8), flip(), shift({ padding: 8 })],
    });

    this._bubbleEl.style.left = `${x}px`;
    this._bubbleEl.style.top = `${y}px`;
  }

  // ── Private methods: events / mode ────────────────────────────────────────

  private _emitValue(type: 'input' | 'change') {
    this.dispatchEvent(
      new CustomEvent(type, {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _dispatchDebouncedInput() {
    window.clearTimeout(this._inputTimeout);
    this._inputTimeout = window.setTimeout(() => {
      this._inputTimeout = undefined;
      this._emitValue('input');
    }, this.debounce);
  }

  /** Fires a pending debounced `input` now. */
  private _flushInput() {
    if (this._inputTimeout === undefined) return;
    window.clearTimeout(this._inputTimeout);
    this._inputTimeout = undefined;
    this._emitValue('input');
  }

  private _onFocusIn = () => {
    if (this._focusWithin) return;
    this._focusWithin = true;
    this._valueAtFocus = this.value;
  };

  private _onFocusOut = (event: FocusEvent) => {
    // Focus moving between parts of the editor arrives retargeted to the host.
    const next = event.relatedTarget as Node | null;
    if (next && (next === this || this.contains(next))) return;
    this._focusWithin = false;
    this._commit();
  };

  /** Commits the value: `change` when it differs from the value when focus entered. */
  private _commit() {
    this._flushInput();
    if (this.value === this._valueAtFocus) return;
    this._valueAtFocus = this.value;
    this._emitValue('change');
  }

  private _stopEvent(event: Event) {
    event.stopPropagation();
  }

  private _execCommand(command: () => void) {
    if (this.disabled || this.readonly || !this._editor) return;
    command();
    this._editor.commands.focus();
  }

  private _switchMode = (event: CustomEvent<{ value: string }>) => {
    event.stopPropagation();
    const nextMode = event.detail?.value === 'markdown' ? 'markdown' : 'editor';
    if (nextMode === this._mode) return;

    if (nextMode === 'markdown' && this._editor) {
      const nextMd = MarkdownEditor._normalizeMd(
        this._htmlToMarkdown(this._editor.getHTML()),
      );
      if (nextMd !== this.value) {
        this.value = nextMd;
      }
      this._bubbleOpen = false;
    }

    this._mode = nextMode;
  };

  /** The source editor's `input`: take its value. */
  private _handleSourceInput = (event: CustomEvent<{ value: string }>) => {
    event.stopPropagation();
    const nextValue = event.detail?.value ?? '';
    if (nextValue === this.value) return;

    this.value = nextValue;
    this._dispatchDebouncedInput();
  };

  // ── Render helpers ────────────────────────────────────────────────────────

  private _renderToolbarButton(
    icon: string,
    title: string,
    action: () => void,
    active = false,
  ) {
    return html`
      <button
        class=${classMap({ 'toolbar-btn': true, active })}
        title=${title}
        aria-label=${title}
        ?disabled=${this.disabled || this.readonly}
        @mousedown=${(e: Event) => e.preventDefault()}
        @click=${(e: Event) => {
          e.preventDefault();
          this._execCommand(action);
        }}
      >
        <wc-icon name=${icon} size="sm"></wc-icon>
      </button>
    `;
  }

  private _renderBubbleMenu() {
    if (!this._editor) return nothing;

    return html`
      <div
        class=${classMap({ 'bubble-menu': true, open: this._bubbleOpen })}
        role="toolbar"
        aria-label=${this.i18n.t('inlineFormatting')}
      >
        ${this._renderToolbarButton(
          'format_bold',
          this.i18n.t('bold'),
          () => this._editor?.chain().focus().toggleBold().run(),
          this._editor.isActive('bold'),
        )}
        ${this._renderToolbarButton(
          'format_italic',
          this.i18n.t('italic'),
          () => this._editor?.chain().focus().toggleItalic().run(),
          this._editor.isActive('italic'),
        )}
        ${this._renderToolbarButton(
          'format_underlined',
          this.i18n.t('underline'),
          () => this._editor?.chain().focus().toggleUnderline().run(),
          this._editor.isActive('underline'),
        )}
        ${this._renderToolbarButton(
          'format_strikethrough',
          this.i18n.t('strikethrough'),
          () => this._editor?.chain().focus().toggleStrike().run(),
          this._editor.isActive('strike'),
        )}
        ${this._renderToolbarButton(
          'code',
          this.i18n.t('inlineCode'),
          () => this._editor?.chain().focus().toggleCode().run(),
          this._editor.isActive('code'),
        )}
      </div>
    `;
  }

  private _renderSlashMenu() {
    return html`
      <div
        class=${classMap({ 'slash-menu': true, open: this._slashOpen })}
        role="listbox"
        aria-label=${this.i18n.t('insertBlock')}
      >
        ${this._slashItems.map(
          (item, index) => html`
            <button
              type="button"
              class=${classMap({
                'slash-item': true,
                active: index === this._slashIndex,
              })}
              role="option"
              aria-selected=${index === this._slashIndex}
              data-index=${index}
              @mousedown=${(e: Event) => e.preventDefault()}
              @click=${this._onSlashItemClick}
            >
              <wc-icon name=${item.icon} size="sm"></wc-icon>
              <span class="slash-item-label"
                >${this.i18n.t(item.titleKey)}</span
              >
              <span class="slash-item-hint">${item.hint}</span>
            </button>
          `,
        )}
      </div>
    `;
  }

  private _renderBlockHandle() {
    if (this._mode !== 'editor') return nothing;
    return html`
      <div
        class=${classMap({
          'block-handle': true,
          visible: this._blockHandleVisible,
        })}
        @mouseenter=${this._onBlockHandleMouseEnter}
        @mouseleave=${this._onBlockHandleMouseLeave}
      >
        <button
          class="block-handle-btn drag-btn"
          title=${this.i18n.t('dragToReorder')}
          aria-label=${this.i18n.t('dragToReorder')}
          draggable="true"
          ?disabled=${this.disabled || this.readonly}
          @mousedown=${this._onDragHandleMouseDown}
          @dragstart=${this._onDragHandleDragStart}
          @dragend=${this._onDragHandleDragEnd}
        >
          <wc-icon name="drag_indicator" size="sm"></wc-icon>
        </button>
        <button
          class="block-handle-btn insert-btn"
          title=${this.i18n.t('insertBlockBelow')}
          aria-label=${this.i18n.t('insertBlockBelow')}
          ?disabled=${this.disabled || this.readonly}
          @mousedown=${(e: Event) => e.preventDefault()}
          @click=${this._onInsertBlockClick}
        >
          <wc-icon name="add" size="sm"></wc-icon>
        </button>
      </div>
    `;
  }

  private _renderReadonlyTag() {
    if (this.disabled) {
      return html`<wc-tag class="read-only-tag" color="red"
        >${this.i18n.t('disabled')}</wc-tag
      >`;
    }
    if (this.readonly) {
      return html`<wc-tag class="read-only-tag" color="red"
        >${this.i18n.t('readOnlyTag')}</wc-tag
      >`;
    }
    return nothing;
  }

  // ── Render ────────────────────────────────────────────────────────────────

  render() {
    const isEmpty = !this.value || this.value.trim() === '';
    const { validationText } = this;

    return html`
      <wc-field
        label=${this.label}
        ?required=${this.required}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        ?skeleton=${this.skeleton}
        ?focused=${this._focused}
        ?error=${this.error || !!validationText}
        error-text=${this.error ? this.errorText : validationText}
        helper-text=${this.helperText}
        variant=${this.variant}
        ?populated=${!isEmpty}
        .host=${this}
        class=${classMap({
          'markdown-editor-field': true,
          disabled: this.disabled,
          readonly: this.readonly,
        })}
      >
        <div
          class=${classMap({
            'markdown-editor-content': true,
            'is-empty': isEmpty,
            hidden: this._mode !== 'editor',
          })}
          data-placeholder=${this._placeholderText()}
          @input=${this._stopEvent}
          @beforeinput=${this._stopEvent}
        >
          <div class="tiptap-root"></div>
        </div>

        <div
          class=${classMap({
            'markdown-source': true,
            hidden: this._mode !== 'markdown',
          })}
        >
          <wc-code-editor
            language="markdown"
            size=${this.size}
            .value=${this.value}
            ?readonly=${this.readonly}
            ?disabled=${this.disabled}
            @input=${this._handleSourceInput}
            @change=${this._stopEvent}
          ></wc-code-editor>
        </div>

        <div class="mode-switcher">
          <wc-segmented-button-group @change=${this._switchMode}>
            <wc-segmented-button
              value="editor"
              ?selected=${this._mode === 'editor'}
              ?disabled=${this.disabled}
            >
              ${this.i18n.t('editorMode')}
            </wc-segmented-button>
            <wc-segmented-button
              value="markdown"
              ?selected=${this._mode === 'markdown'}
              ?disabled=${this.disabled}
            >
              ${this.i18n.t('markdownMode')}
            </wc-segmented-button>
          </wc-segmented-button-group>
        </div>

        ${this._renderReadonlyTag()}
      </wc-field>

      ${this._renderBubbleMenu()} ${this._renderSlashMenu()}
      ${this._renderBlockHandle()}
    `;
  }
}
