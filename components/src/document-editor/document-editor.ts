import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { Editor, type JSONContent } from '@tiptap/core';
import { DOMSerializer } from '@tiptap/pm/model';

import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import type { PeacockStrings } from '@/__internal/i18n/strings.js';
import { RichTextBlockHandleController } from '@/__internal/rich-text/block-handle-controller.js';
import { RichTextBubbleController } from '@/__internal/rich-text/bubble-controller.js';
import {
  activeTextStyle,
  BLOCKS,
  blocksFor,
  marksFor,
  type BlockCommand,
} from '@/__internal/rich-text/commands.js';
import { buildExtensions } from '@/__internal/rich-text/extensions.js';
import { RichTextLinkController } from '@/__internal/rich-text/link-controller.js';
import {
  RichTextMentionController,
  type RichTextMentionHost,
} from '@/__internal/rich-text/mention-controller.js';
import { RichTextSlashController } from '@/__internal/rich-text/slash-controller.js';
import { safeUrl } from '@/__internal/rich-text/url.js';
import type { MentionSuggestion } from '../mention-input/mention-model.js';
import {
  MARGIN_PRESETS,
  marginPresetOf,
  normalizeDocument,
  pageGeometry,
  type DocumentValue,
  type MarginPreset,
  type PageGeometry,
  type PageOrientation,
  type PageSetup,
  type PageSize,
} from './document-model.js';
import {
  documentFormatting,
  marginalExtensions,
  PageBreak,
} from './document-nodes.js';
import { paginate, paginationExtension } from './pagination.js';
import {
  loadCollaboration,
  presenceOf,
  type CollaborationKit,
  type DocumentCollaboration,
  type DocumentPresence,
} from './collaboration.js';
import {
  CommentMark,
  commentRanges,
  setActiveComment,
  threadsAt,
} from './comment-mark.js';
import { printPages } from './print.js';

import styles from './document-editor.scss';

/** `detail` of `image-upload`: the file, and a function to call with its address once stored. */
export interface DocumentImageUploadDetail {
  file: File;
  /** Inserts the image where it was added; call it with the stored file's address. */
  respond: (src: string, alt?: string) => void;
}

/** `detail` of `input` and `change`. */
export interface DocumentValueDetail {
  value: DocumentValue;
}

/** `detail` of `comment-add`: the new thread's id and the text it is about. */
export interface DocumentCommentAddDetail {
  threadId: string;
  quote: string;
}

/**
 * How large the pages are shown: `'fit'` fits the page to the editor's width, never above 100%;
 * a number is a percentage, such as `75`.
 */
export type DocumentZoom = 'fit' | number;

/** `detail` of `zoom-change`. */
export interface DocumentZoomDetail {
  zoom: DocumentZoom;
}

/** A commented range in the document. */
export interface DocumentComment {
  threadId: string;
  /** The text the thread is about. */
  quote: string;
}

type Region = 'body' | 'header' | 'footer';

interface Heading {
  level: number;
  text: string;
  pos: number;
}

/** Text colors offered by the toolbar; stored in the document as is. */
const TEXT_COLORS = [
  { name: 'Gray', value: '#5f6368' },
  { name: 'Red', value: '#c5221f' },
  { name: 'Orange', value: '#b45309' },
  { name: 'Green', value: '#137333' },
  { name: 'Blue', value: '#1a56db' },
  { name: 'Purple', value: '#7e3af2' },
];

const ALIGNMENTS = [
  { value: 'left', icon: 'format_align_left', key: 'alignLeft' },
  { value: 'center', icon: 'format_align_center', key: 'alignCenter' },
  { value: 'right', icon: 'format_align_right', key: 'alignRight' },
  { value: 'justify', icon: 'format_align_justify', key: 'alignJustify' },
] as const;

const TABLE_ACTIONS = [
  'addRowBelow',
  'addColumnAfter',
  'deleteRow',
  'deleteColumn',
  'deleteTable',
] as const;

type TableAction = (typeof TABLE_ACTIONS)[number];

const MARGIN_KEYS: Record<
  MarginPreset,
  'marginsNormal' | 'marginsNarrow' | 'marginsWide'
> = {
  normal: 'marginsNormal',
  narrow: 'marginsNarrow',
  wide: 'marginsWide',
};

const SIZE_LABELS: Record<PageSize, string> = {
  a4: 'A4',
  letter: 'Letter',
  legal: 'Legal',
};

/** Zoom percentages offered by the status bar, after "Fit width". */
const ZOOM_LEVELS = [50, 75, 100, 125, 150];

/** Reads the `zoom` attribute: `fit` or a percentage. */
const zoomConverter = {
  fromAttribute: (value: string | null): DocumentZoom => {
    const percent = Number(value);
    return value && value !== 'fit' && percent > 0 ? percent : 'fit';
  },
  toAttribute: (value: DocumentZoom): string => String(value),
};

/**
 * @label Document Editor
 * @tag wc-document-editor
 * @rawTag document-editor
 *
 * @summary A word-processor style editor with pages, a header and footer, page numbers, tables, images and an outline.
 * @overview
 * <p>Use it for long, structured documents that are read as pages: policies, contracts, reports,
 * specifications. The text flows over pages of the chosen size, A4, Letter or Legal, portrait or
 * landscape, with normal, narrow or wide margins. Paragraphs continue on the next page at the line
 * that does not fit; tables break between rows; images move whole. Ctrl/Cmd+Enter inserts a page
 * break.</p>
 *
 * <p>Double-click the top or bottom margin of a page to edit the <strong>header</strong> or
 * <strong>footer</strong>, which repeat on every page; the toolbar then inserts the page number
 * or page count. The <strong>outline</strong> lists the headings for navigation
 * (<code>outline-open</code>), and the status bar shows the page setup, word count and the
 * current page. <code>print()</code> prints the pages as they look, always at 100%.</p>
 *
 * <p><strong>Zoom.</strong> By default (<code>zoom="fit"</code>) a page wider than the editor is
 * scaled down to fit its width, so narrow containers, tablets and phones show whole pages instead
 * of scrolling sideways; it is never enlarged past 100%. Set <code>zoom</code> to a percentage, or
 * pick one in the status bar, to show the pages at a fixed size; the editor fires
 * <code>zoom-change</code> when the person changes it. Zooming only changes how the pages are
 * shown: the text flows over the same pages at every zoom.</p>
 *
 * <p>The value is a <code>DocumentValue</code>: the page setup and the body, header and footer as
 * Tiptap JSON, so alignment, colors and page setup are kept. <code>getMarkdown()</code> and
 * <code>getHTML()</code> export the body. The editor fires <code>input</code> with
 * <code>{ value }</code> as the document changes (after <code>debounce</code> milliseconds) and
 * <code>change</code> when focus leaves after an edit.</p>
 *
 * <p><strong>Images.</strong> Inserting an image (toolbar, paste or drop) fires
 * <code>image-upload</code> with the <code>file</code> and a <code>respond(src, alt?)</code>
 * function. Store the file and call <code>respond</code> with its address; Peacock never uploads
 * anything itself, and does not embed files in the value.</p>
 *
 * <p><strong>Mentions</strong> work as on <code>wc-markdown-editor</code>: answer
 * <code>search</code> by setting <code>suggestions</code>.</p>
 *
 * <p><strong>Comments.</strong> <em>Comment</em> (toolbar or selection bubble) highlights the
 * selected text and fires a cancelable <code>comment-add</code> with a new <code>threadId</code>
 * and the <code>quote</code>. The app owns the threads: it puts an element per thread in the
 * <code>comments</code> slot with a <code>thread-id</code> attribute, usually a
 * <code>wc-discussion</code>, and the editor lines each one up beside its text in a column next
 * to the pages. The thread under the caret gets <code>data-active</code> and fires
 * <code>comment-select</code>; focusing a thread highlights its text. <code>removeComment()</code>
 * clears a resolved thread's highlight, <code>focusComment()</code> goes to it, and
 * <code>comments</code> lists them. The highlights are part of the document, so they are shared
 * when collaborating.</p>
 *
 * <p><strong>Collaboration.</strong> Set <code>collaboration</code> to
 * <code>{ document, provider, user }</code>: a <code>Y.Doc</code>, its provider (any Yjs provider;
 * its <code>awareness</code> carries carets and presence) and the person editing here. Everyone's
 * edits, the header, footer and page setup merge live; other people's carets show with their
 * names, and their avatars appear in the toolbar (<code>presence-change</code> lists them). Edits
 * from others update <code>value</code> without firing <code>input</code>. The first person into an
 * empty shared document brings this editor's <code>value</code>. Collaboration needs the
 * <code>yjs</code> package, which loads only when it is used.</p>
 *
 * @slot comments - Comment threads, one element per thread with a `thread-id`, such as `wc-discussion`.
 *
 * @cssprop --document-editor-canvas - Background behind the pages.
 * @cssprop --document-editor-page - Background of a page.
 * @cssprop --document-editor-height - Height of the editor; the pages scroll inside. Defaults to 40rem.
 * @cssprop --document-editor-comments-width - Width of the comments column. Defaults to 20rem.
 * @cssprop --document-editor-comment - Background of commented text.
 * @cssprop --document-editor-comment-active - Background of the active thread's text.
 *
 * @fires {CustomEvent<{value: DocumentValue}>} input - Dispatched as the document changes, after `debounce` milliseconds.
 * @fires {CustomEvent<{value: DocumentValue}>} change - Dispatched when focus leaves the editor after an edit.
 * @fires {CustomEvent<{file: File, respond: (src: string, alt?: string) => void}>} image-upload - Dispatched when an image is added; call `respond` with its stored address.
 * @fires {CustomEvent<{trigger: string, query: string}>} search - Dispatched as a mention is typed; answer with `suggestions`.
 * @fires {CustomEvent<{mention: {id: string, label: string, trigger: string}, suggestion: MentionSuggestion}>} mention - Dispatched when a suggestion is inserted as a mention.
 * @fires {CustomEvent<{threadId: string, quote: string}>} comment-add - Cancelable. Text was commented; add a thread element with this `thread-id`.
 * @fires {CustomEvent<{threadId: string}>} comment-select - The caret moved into a thread's text.
 * @fires {CustomEvent<{users: DocumentPresence[]}>} presence-change - The people in a shared document changed.
 * @fires {CustomEvent<{zoom: DocumentZoom}>} zoom-change - The person picked a zoom in the status bar.
 *
 * @example
 * ```html
 * <wc-document-editor label="Policy" outline-open></wc-document-editor>
 * ```
 * @tags editor
 */
@IndividualComponent
export class DocumentEditor extends LitElement implements RichTextMentionHost {
  // ── Static ────────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ────────────────────────────────────────────────────────────

  /**
   * The document. Set it to load one; read it, or listen for `input`, to save. A document set here
   * loads at once, so methods called right after it (such as `importMarkdown()`) work on it.
   */
  @property({ attribute: false })
  get value(): DocumentValue {
    return this._value;
  }

  set value(next: DocumentValue) {
    const old = this._value;
    const value = next === this._produced ? next : normalizeDocument(next);
    this._value = value;
    if (this._body && value !== this._produced) this._load(value);
    this.requestUpdate('value', old);
  }

  /** Accessible name of the document. Defaults to "Document". */
  @property({ type: String })
  label = '';

  /** Text shown while the document is empty. */
  @property({ type: String })
  placeholder = '';

  /** Shows the document without editing; the formatting tools are hidden. */
  @property({ type: Boolean, reflect: true })
  readonly = false;

  /** Shows the document dimmed and without editing. */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** Shows the outline panel. */
  @property({ type: Boolean, reflect: true, attribute: 'outline-open' })
  outlineOpen = false;

  /** Milliseconds without typing before `input` fires. */
  @property({ type: Number })
  debounce = 400;

  /** Characters that start a mention, such as `"@"`. Empty turns mentions off. */
  @property({ type: String })
  triggers = '@';

  /** Suggestions for the mention being typed; set them in answer to `search`. */
  @property({ attribute: false })
  suggestions: MentionSuggestion[] = [];

  /** Shows a loading row in the mention list while the app looks for suggestions. */
  @property({ type: Boolean, attribute: 'suggestions-loading' })
  suggestionsLoading = false;

  /** Overrides Peacock's strings for this instance only. */
  @property({ attribute: false })
  strings?: Partial<PeacockStrings>;

  /**
   * Turns on realtime editing with others: `{ document, provider, user }`, a `Y.Doc`, its
   * provider (whose `awareness` carries carets and presence) and the person editing here. Needs
   * the `yjs` package.
   */
  @property({ attribute: false })
  collaboration?: DocumentCollaboration | null;

  /**
   * How large the pages are shown: `"fit"` (the default) scales a page wider than the editor down
   * to its width, never above 100%; a number is a percentage, such as `75`. Printing is always at
   * 100%.
   */
  @property({ converter: zoomConverter })
  zoom: DocumentZoom = 'fit';

  // ── State ─────────────────────────────────────────────────────────────────

  @state() private _pages = 1;

  @state() private _region: Region = 'body';

  /** The page the live header or footer editor sits on. */
  @state() private _marginalPage = 0;

  @state() private _printing = false;

  /** Whether the app has put threads in the comments column. */
  @state() private _hasComments = false;

  /** The people in a shared document. */
  @state() private _people: DocumentPresence[] = [];

  /** The width the canvas has for a page, without its padding; 0 until measured. */
  @state() private _canvasWidth = 0;

  // ── Queries ───────────────────────────────────────────────────────────────

  @query('.body-root') private _bodyRoot?: HTMLElement;

  @query('.header-root') private _headerRoot?: HTMLElement;

  @query('.footer-root') private _footerRoot?: HTMLElement;

  @query('.pages') private _pagesElement?: HTMLElement;

  @query('.image-input') private _imageInput?: HTMLInputElement;

  // ── Private fields ────────────────────────────────────────────────────────

  private _body?: Editor;

  private _header?: Editor;

  private _footer?: Editor;

  private _value: DocumentValue = normalizeDocument(null);

  /** The value this editor last produced or loaded; a different `value` is a new document. */
  private _produced?: DocumentValue;

  private _inputTimer?: number;

  private _paginateFrame?: number;

  private _changed = false;

  private _resizeObserver?: ResizeObserver;

  /** Watches the canvas's width for the fit-width zoom. */
  private _canvasObserver?: ResizeObserver;

  /** The scale the sheet was last rendered at; screen measurements are divided by it. */
  private _shownScale = 1;

  /** Where an image will go while the app stores it. */
  private _imageAt?: number;

  /** What the header and footer copies were last drawn from. */
  private _marginalKey: unknown[] = [];

  /** The thread whose text is highlighted. */
  private _activeThread: string | null = null;

  /** Counts editor creations, so a slow collaboration load cannot win over a newer one. */
  private _generation = 0;

  /** Disconnects from a shared document's page map and awareness. */
  private _leaveShared?: () => void;

  private _commentObserver?: ResizeObserver;

  private _commentFrame?: number;

  /** The canvas's scroll position before a zoom change, and how much the zoom changes. */
  private _zoomScroll?: { top: number; left: number; ratio: number };

  private readonly _i18n = new I18nController(this);

  private readonly _mentions = new RichTextMentionController(this, {
    editor: () => this._body,
    i18n: this._i18n,
  });

  private readonly _slash = new RichTextSlashController(this, {
    editor: () => this._body,
    i18n: this._i18n,
  });

  private readonly _link = new RichTextLinkController(this, {
    editor: () => this._activeEditor,
    i18n: this._i18n,
  });

  private readonly _bubble = new RichTextBubbleController(this, {
    editor: () => this._body,
    i18n: this._i18n,
    allowed: () =>
      this._region === 'body' &&
      !this._link.open &&
      !this._slash.visible &&
      !this._mentions.visible,
    editLink: () => this._link.show(),
    extra: () =>
      html`<wc-icon-button
        class="bubble-button"
        variant="text"
        color="surface"
        shape="round"
        size="xs"
        aria-label=${this._i18n.t('addComment')}
        tooltip=${this._i18n.t('addComment')}
        @click=${this._addComment}
        ><wc-icon name="add_comment"></wc-icon
      ></wc-icon-button>`,
  });

  private readonly _blockHandle = new RichTextBlockHandleController(this, {
    editor: () => this._body,
    i18n: this._i18n,
    allowed: () => true,
    insertAfter: position => this._slash.openAfterBlock(position),
  });

  private readonly _dragOver = {
    handleEvent: (event: DragEvent) => this._blockHandle.dragOver(event),
    capture: true,
  };

  private readonly _drop = {
    handleEvent: (event: DragEvent) => this._blockHandle.drop(event),
    capture: true,
  };

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  constructor() {
    super();
    this.addEventListener('focusout', this._onFocusOut);
  }

  override connectedCallback() {
    super.connectedCallback();
    if (this.hasUpdated && !this._body) this._createEditors();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._flushInput();
    this._resizeObserver?.disconnect();
    this._canvasObserver?.disconnect();
    this._commentObserver?.disconnect();
    window.clearTimeout(this._paginateFrame);
    this._destroyEditors();
  }

  protected override firstUpdated() {
    this._createEditors();
    this._resizeObserver = new ResizeObserver(() => this._schedulePagination());
    if (this._bodyRoot) this._resizeObserver.observe(this._bodyRoot);
    this._canvasObserver = new ResizeObserver(([entry]) => {
      const { width } = entry.contentRect;
      // In the next frame: re-rendering inside the observer's callback can resize what other
      // observers watch (the threads, the body) and trip the browser's resize-loop error.
      requestAnimationFrame(() => {
        this._canvasWidth = width;
      });
    });
    const canvas = this.renderRoot.querySelector('.canvas');
    if (canvas) this._canvasObserver.observe(canvas);
    document.fonts?.ready.then(() => this._schedulePagination());
  }

  protected override willUpdate() {
    this._noteZoomScroll();
  }

  protected override updated(changed: PropertyValues<this>) {
    this._restoreZoomScroll();
    if (changed.has('readonly') || changed.has('disabled')) {
      const editable = !(this.readonly || this.disabled);
      this._body?.setEditable(editable);
      this._header?.setEditable(editable);
      this._footer?.setEditable(editable);
    }
    const rebuild =
      (changed.has('triggers') && changed.get('triggers') !== undefined) ||
      (changed.has('collaboration') &&
        changed.get('collaboration') !== this.collaboration);
    // Before the first editors exist, firstUpdated() creates them with the current settings.
    if (rebuild && this.hasUpdated && (this._body || this._generation > 0)) {
      this._destroyEditors();
      this._createEditors();
    }
    this._renderMarginals();
  }

  // ── Public methods ────────────────────────────────────────────────────────

  /** The number of pages. */
  get pageCount(): number {
    return this._pages;
  }

  /** The body as Markdown. Alignment, colors, the header and footer are not part of it. */
  getMarkdown(): string {
    return this._body?.getMarkdown() ?? '';
  }

  /** The body as HTML. */
  getHTML(): string {
    return this._body?.getHTML() ?? '';
  }

  /** The comment threads in the document, in order, with the text each is about. */
  get comments(): DocumentComment[] {
    const body = this._body;
    if (!body) return [];
    const seen = new Map<string, DocumentComment>();
    for (const range of commentRanges(body.state.doc)) {
      const quote = body.state.doc.textBetween(range.from, range.to, ' ');
      const known = seen.get(range.threadId);
      if (known) known.quote = `${known.quote} ${quote}`;
      else seen.set(range.threadId, { threadId: range.threadId, quote });
    }
    return [...seen.values()];
  }

  /** Selects a thread's text, scrolls to it and highlights it. */
  focusComment(threadId: string) {
    const body = this._body;
    const range = body
      ? commentRanges(body.state.doc).find(r => r.threadId === threadId)
      : undefined;
    if (!body || !range) return;
    body
      .chain()
      .focus()
      .setTextSelection({ from: range.from, to: range.to })
      .run();
    const dom = body.view.domAtPos(range.from).node;
    (dom instanceof Element ? dom : dom.parentElement)?.scrollIntoView({
      block: 'center',
    });
    this._setActiveThread(threadId, false);
  }

  /** Removes a thread's highlight from the text, for example when it is resolved. */
  removeComment(threadId: string) {
    this._body?.commands.unsetComment(threadId);
    if (this._activeThread === threadId) this._setActiveThread(null, false);
  }

  /** Replaces the body with Markdown, such as a value from `wc-markdown-editor`; fires `input`. */
  importMarkdown(markdown: string) {
    const body = this._body;
    if (!body) return;
    body.commands.setContent(markdown ?? '', { contentType: 'markdown' });
  }

  /** Focuses the body. */
  override focus() {
    this._body?.commands.focus();
  }

  /** Prints the pages as they look, with the header, footer and page numbers. */
  async print() {
    if (!this._body || !this._pagesElement || this._printing) return;
    // Lay the pages out without gaps, so each fills a printed sheet.
    this._region = 'body';
    this._printing = true;
    await this.updateComplete;
    this._paginateNow();
    await this.updateComplete;
    this._renderMarginals();
    // The copy is of `.pages`, inside the sheet that carries the zoom, so it prints at 100%.
    const pages = this._pagesElement;
    if (pages) {
      await printPages(this, pages, this._geometry(), this.value.page);
    }
    this._printing = false;
    await this.updateComplete;
    this._paginateNow();
  }

  // ── Private methods: editors ──────────────────────────────────────────────

  private get _activeEditor(): Editor | undefined {
    if (this._region === 'header') return this._header;
    if (this._region === 'footer') return this._footer;
    return this._body;
  }

  private _geometry(): PageGeometry {
    return pageGeometry(this.value.page, this._printing ? 0 : 24);
  }

  /**
   * Creates the editors; with `collaboration`, after the collaboration extensions (and Yjs) load.
   * A newer call, or a disconnect, while loading wins.
   */
  private _createEditors() {
    this._generation += 1;
    const generation = this._generation;
    const { collaboration } = this;
    if (!collaboration) {
      this._buildEditors();
      return;
    }
    loadCollaboration()
      .then(kit => {
        if (
          generation !== this._generation ||
          !this.isConnected ||
          this._body
        ) {
          return;
        }
        this._buildEditors(kit, collaboration);
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error(
          'wc-document-editor: collaboration needs the yjs package.',
          error,
        );
      });
  }

  private _buildEditors(
    kit?: CollaborationKit,
    collaboration?: DocumentCollaboration,
  ) {
    const body = this._bodyRoot;
    const header = this._headerRoot;
    const footer = this._footerRoot;
    if (!body || !header || !footer || this._body) return;
    const doc = normalizeDocument(this.value);
    const editable = !(this.readonly || this.disabled);
    const shared = !!(kit && collaboration);
    const bind = (field: 'body' | 'header' | 'footer') =>
      kit && collaboration
        ? kit.extensions(field, collaboration, field === 'body')
        : [];
    const remote = (transaction: { getMeta(key: unknown): unknown }) =>
      !!kit &&
      !!(
        transaction.getMeta(kit.syncKey) as
          | { isChangeOrigin?: boolean }
          | undefined
      )?.isChangeOrigin;

    this._body = new Editor({
      element: body,
      extensions: buildExtensions('document', {
        placeholder: () =>
          this.placeholder || this._i18n.t('documentPlaceholder'),
        mentions: this.triggers ? this._mentions.suggestionOptions() : [],
        history: !shared,
        extra: [
          ...documentFormatting(),
          PageBreak.configure({ label: this._i18n.t('pageBreak') }),
          CommentMark,
          paginationExtension(),
          this._slash.extension(),
          this._link.extension(),
          this._blockHandle.extension(),
          ...bind('body'),
        ],
      }),
      // A shared document is the source; its content comes from the collaboration binding.
      content: shared ? undefined : doc.body,
      editable,
      editorProps: {
        attributes: {
          role: 'textbox',
          'aria-multiline': 'true',
          'aria-label': this.label || this._i18n.t('documentLabel'),
        },
        // A click can put the caret out of view: below a page break it goes to the next page.
        handleClick: () => {
          requestAnimationFrame(() => this._revealCaret());
          return false;
        },
        handlePaste: (_view, event) => this._takeImages(event.clipboardData),
        handleDrop: (_view, event) =>
          this._takeImages((event as DragEvent).dataTransfer),
      },
      onFocus: () => {
        this._region = 'body';
      },
      onUpdate: ({ transaction }) =>
        this._onContentChange(true, remote(transaction)),
      onSelectionUpdate: () => this._onSelectionChange(),
      onTransaction: () => this.requestUpdate(),
    });

    const marginal = (
      element: HTMLElement,
      content: JSONContent,
      region: 'header' | 'footer',
    ) =>
      new Editor({
        element,
        extensions: [
          ...marginalExtensions(
            () =>
              this._i18n.t(
                region === 'header'
                  ? 'documentHeaderPlaceholder'
                  : 'documentFooterPlaceholder',
              ),
            !shared,
          ),
          ...bind(region),
        ],
        content: shared ? undefined : content,
        editable,
        editorProps: {
          attributes: {
            role: 'textbox',
            'aria-label': this._i18n.t(
              region === 'header' ? 'documentHeader' : 'documentFooter',
            ),
          },
        },
        onFocus: () => {
          this._region = region;
        },
        onUpdate: ({ transaction }) =>
          this._onContentChange(false, remote(transaction)),
        onTransaction: () => this.requestUpdate(),
      });
    this._header = marginal(header, doc.header, 'header');
    this._footer = marginal(footer, doc.footer, 'footer');
    if (collaboration) this._joinShared(collaboration, doc);
    this._produced = this._compose();
    this._value = this._produced;
    this.requestUpdate();
    this._schedulePagination();
  }

  /**
   * Connects to the shared document: an empty one gets this editor's value (so the first person in
   * brings the document), the page setup follows the shared map, and awareness lists the people.
   */
  private _joinShared(
    collaboration: DocumentCollaboration,
    doc: DocumentValue,
  ) {
    const shared = collaboration.document;
    const seed = (
      editor: Editor | undefined,
      field: 'body' | 'header' | 'footer',
      content: JSONContent,
    ) => {
      const empty = !content.content?.some(
        node => node.content?.length || node.type !== 'paragraph',
      );
      if (editor && shared.getXmlFragment(field).length === 0 && !empty) {
        editor.commands.setContent(content);
      }
    };
    seed(this._body, 'body', doc.body);
    seed(this._header, 'header', doc.header);
    seed(this._footer, 'footer', doc.footer);

    const pageMap = shared.getMap('page');
    const setup = pageMap.get('setup') as Partial<PageSetup> | undefined;
    if (setup) {
      this._value = {
        ...this._value,
        page: normalizeDocument({ page: setup as PageSetup }).page,
      };
    } else {
      pageMap.set('setup', doc.page);
    }
    const onPage = (event: { transaction: { local: boolean } }) => {
      if (event.transaction.local) return;
      const next = pageMap.get('setup') as PageSetup | undefined;
      if (!next) return;
      this._produced = this._compose(normalizeDocument({ page: next }).page);
      this._value = this._produced;
      this.requestUpdate('value');
      this._schedulePagination();
    };
    pageMap.observe(onPage);

    const awareness = collaboration.provider?.awareness;
    const onAwareness = () => {
      this._people = presenceOf(awareness);
      this.dispatchEvent(
        new CustomEvent<{ users: DocumentPresence[] }>('presence-change', {
          detail: { users: this._people },
          bubbles: true,
          composed: true,
        }),
      );
    };
    awareness?.on('change', onAwareness);
    onAwareness();

    this._leaveShared = () => {
      pageMap.unobserve(onPage);
      awareness?.off('change', onAwareness);
      this._people = [];
    };
  }

  private _destroyEditors() {
    this._leaveShared?.();
    this._leaveShared = undefined;
    this._body?.destroy();
    this._header?.destroy();
    this._footer?.destroy();
    this._body = undefined;
    this._header = undefined;
    this._footer = undefined;
  }

  /** Loads a document set from outside. */
  private _load(doc: DocumentValue) {
    this._body?.commands.setContent(doc.body, { emitUpdate: false });
    this._header?.commands.setContent(doc.header, { emitUpdate: false });
    this._footer?.commands.setContent(doc.footer, { emitUpdate: false });
    this._produced = doc;
    this._schedulePagination();
  }

  /** The document as the editors hold it now. */
  private _compose(page: PageSetup = this.value.page): DocumentValue {
    return {
      version: 1,
      page,
      header: this._header?.getJSON() ?? this.value.header,
      footer: this._footer?.getJSON() ?? this.value.footer,
      body: this._body?.getJSON() ?? this.value.body,
    };
  }

  /**
   * The editors changed. A change from someone else (`remote`) updates the value but fires no
   * events: `input` and `change` are about what the person here did.
   */
  private _onContentChange(body: boolean, remote = false) {
    this._produced = this._compose();
    this.value = this._produced;
    if (!remote) {
      this._changed = true;
      this._queueInput();
    }
    if (body) this._schedulePagination();
  }

  private _setPage(page: Partial<PageSetup>) {
    const next = { ...this.value.page, ...page };
    this.collaboration?.document.getMap('page').set('setup', next);
    this._produced = this._compose(next);
    this.value = this._produced;
    this._changed = true;
    this._queueInput();
    this._schedulePagination();
    this._body?.commands.focus();
  }

  // ── Private methods: pagination ───────────────────────────────────────────

  /** Paginates shortly after the last change, so typing is not re-measured on every key. */
  private _schedulePagination() {
    window.clearTimeout(this._paginateFrame);
    this._paginateFrame = window.setTimeout(() => {
      this._paginateFrame = undefined;
      this._paginateNow();
    }, 80);
  }

  private _paginateNow() {
    const body = this._body;
    if (!body || body.isDestroyed) return;
    const { pages } = paginate(
      body.view,
      this._geometry(),
      undefined,
      this._shownScale,
    );
    this._pages = pages;
    this.updateComplete.then(() => this._layoutComments());
  }

  // ── Private methods: zoom ─────────────────────────────────────────────────

  /**
   * The scale the pages are shown at. The zoom is a CSS transform on the sheet: unlike CSS `zoom`,
   * it leaves the layout (line breaks, heights) exactly as at 100%, so the pages break at the
   * same places at every zoom, and ProseMirror's `posAtCoords` and `coordsAtPos` work in screen
   * coordinates as usual.
   */
  private get _scale(): number {
    if (this.zoom !== 'fit') {
      const percent = Number(this.zoom) || 100;
      return Math.min(Math.max(percent, 10), 400) / 100;
    }
    const { width } = this._geometry();
    if (!this._canvasWidth || !width) return 1;
    // Rounded down, so the scaled page never overflows the canvas by a fraction of a pixel.
    return Math.min(1, Math.floor((this._canvasWidth / width) * 1000) / 1000);
  }

  /** Before a render that changes the scale, notes the scroll position to keep. */
  private _noteZoomScroll() {
    const next = this._scale;
    const canvas = this.renderRoot.querySelector<HTMLElement>('.canvas');
    if (!canvas || next === this._shownScale || this._zoomScroll) return;
    this._zoomScroll = {
      top: canvas.scrollTop,
      left: canvas.scrollLeft,
      ratio: next / this._shownScale,
    };
  }

  /** After the scale changed, keeps the same part of the document in view and moves the threads. */
  private _restoreZoomScroll() {
    const scroll = this._zoomScroll;
    if (!scroll) return;
    this._zoomScroll = undefined;
    const canvas = this.renderRoot.querySelector<HTMLElement>('.canvas');
    if (canvas) {
      canvas.scrollTop = scroll.top * scroll.ratio;
      canvas.scrollLeft = scroll.left * scroll.ratio;
    }
    this._scheduleCommentLayout();
  }

  private _onZoom = (event: CustomEvent<{ item: HTMLElement }>) => {
    event.stopPropagation();
    const value = event.detail.item.getAttribute('value');
    const zoom = zoomConverter.fromAttribute(value);
    if (zoom === this.zoom) return;
    this.zoom = zoom;
    this.dispatchEvent(
      new CustomEvent<DocumentZoomDetail>('zoom-change', {
        detail: { zoom },
        bubbles: true,
        composed: true,
      }),
    );
  };

  // ── Private methods: comments ─────────────────────────────────────────────

  /** The threads the app shows in the comments column. */
  private _threadElements(): HTMLElement[] {
    const slot = this.renderRoot.querySelector<HTMLSlotElement>(
      'slot[name="comments"]',
    );
    return (slot?.assignedElements() ?? []) as HTMLElement[];
  }

  private _onCommentsSlotChange = () => {
    const elements = this._threadElements();
    this._hasComments = elements.length > 0;
    this._commentObserver?.disconnect();
    this._commentObserver = new ResizeObserver(() =>
      this._scheduleCommentLayout(),
    );
    elements.forEach(element => this._commentObserver?.observe(element));
    this._markActiveThread();
    this._scheduleCommentLayout();
  };

  private _scheduleCommentLayout() {
    if (this._commentFrame) cancelAnimationFrame(this._commentFrame);
    this._commentFrame = requestAnimationFrame(() => {
      this._commentFrame = undefined;
      this._layoutComments();
    });
  }

  /**
   * Places each thread beside the text it is about, top to bottom without overlapping. A thread
   * whose text was deleted gets `data-orphan` and goes last.
   */
  private _layoutComments() {
    const body = this._body;
    const canvas = this.renderRoot.querySelector<HTMLElement>('.canvas');
    const elements = this._threadElements();
    if (!body || body.isDestroyed || !canvas || !elements.length) return;
    const ranges = commentRanges(body.state.doc);
    // Positions in the canvas's scrolled content; the track moves with the canvas's scroll.
    const sheetTop = canvas.getBoundingClientRect().top - canvas.scrollTop;
    const items = elements.map(element => {
      const range = ranges.find(
        candidate => candidate.threadId === element.getAttribute('thread-id'),
      );
      let y = Number.POSITIVE_INFINITY;
      if (range) {
        try {
          y = body.view.coordsAtPos(range.from).top - sheetTop;
        } catch {
          // The position is outside the rendered document; treat as orphan.
        }
      }
      return { element, y, orphan: !range };
    });
    items.sort((a, b) => a.y - b.y);
    let next = 0;
    for (const item of items) {
      const top = Math.max(Number.isFinite(item.y) ? item.y : next, next);
      item.element.style.setProperty('top', `${Math.round(top)}px`);
      item.element.toggleAttribute('data-orphan', item.orphan);
      next = top + item.element.offsetHeight + 12;
    }
  }

  /** The comments column scrolls with the pages. */
  private _onCanvasScroll = (event: Event) => {
    const track = this.renderRoot.querySelector<HTMLElement>('.comments-track');
    const canvas = event.currentTarget as HTMLElement;
    if (track) track.style.transform = `translateY(${-canvas.scrollTop}px)`;
  };

  /**
   * Scrolls the canvas to the caret when it is out of view, leaving the top margin of its page
   * above it, so the page it is on shows.
   */
  private _revealCaret() {
    const body = this._body;
    const canvas = this.renderRoot.querySelector<HTMLElement>('.canvas');
    if (!body || body.isDestroyed || !canvas) return;
    const caret = body.view.coordsAtPos(body.state.selection.head);
    const view = canvas.getBoundingClientRect();
    if (caret.top >= view.top && caret.bottom <= view.bottom) return;
    const room = this._geometry().marginTop * this._shownScale + 16;
    const reduce = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    canvas.scrollBy({
      top: caret.top - view.top - room,
      behavior: reduce ? 'auto' : 'smooth',
    });
  }

  /** The thread under the caret becomes the active one. */
  private _onSelectionChange() {
    const body = this._body;
    if (!body) return;
    const threads = threadsAt(body.state.doc, body.state.selection.from);
    this._setActiveThread(threads[threads.length - 1] ?? null, true);
  }

  private _setActiveThread(threadId: string | null, announce: boolean) {
    if (threadId === this._activeThread) return;
    this._activeThread = threadId;
    if (this._body) setActiveComment(this._body, threadId);
    this._markActiveThread();
    if (threadId && announce) {
      this.dispatchEvent(
        new CustomEvent<{ threadId: string }>('comment-select', {
          detail: { threadId },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  private _markActiveThread() {
    for (const element of this._threadElements()) {
      element.toggleAttribute(
        'data-active',
        !!this._activeThread &&
          element.getAttribute('thread-id') === this._activeThread,
      );
    }
  }

  /** Focus moving into a thread in the column highlights its text. */
  private _onCommentsFocus = (event: FocusEvent) => {
    const thread = event
      .composedPath()
      .find(
        (node): node is HTMLElement =>
          node instanceof HTMLElement && node.hasAttribute('thread-id'),
      );
    if (thread) this._setActiveThread(thread.getAttribute('thread-id'), false);
  };

  /** Comments on the selected text: marks it and asks the app to open a thread. */
  private _addComment = () => {
    const body = this._body;
    if (!body || this.readonly || this.disabled) return;
    const { from, to, empty } = body.state.selection;
    if (empty) return;
    const threadId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `thread-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    const quote = body.state.doc.textBetween(from, to, ' ');
    body.chain().focus().setComment(threadId).run();
    const accepted = this.dispatchEvent(
      new CustomEvent<DocumentCommentAddDetail>('comment-add', {
        detail: { threadId, quote },
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
    if (!accepted) {
      body.commands.unsetComment(threadId);
      return;
    }
    this._setActiveThread(threadId, false);
    // The app usually adds the thread's element in its handler; focus its composer once slotted.
    requestAnimationFrame(() => {
      const element = this._threadElements().find(
        candidate => candidate.getAttribute('thread-id') === threadId,
      ) as (HTMLElement & { focusComposer?: () => void }) | undefined;
      if (element?.focusComposer) element.focusComposer();
      else element?.focus();
    });
  };

  // ── Private methods: header and footer ────────────────────────────────────

  /** Fills each page's static copy of the header and footer, with its page number. */
  private _renderMarginals() {
    const key = [
      this._header?.state.doc,
      this._footer?.state.doc,
      this._pages,
      this._region,
      this._marginalPage,
      this._printing,
    ];
    const same =
      this._marginalKey.length === key.length &&
      this._marginalKey.every((part, index) => part === key[index]);
    if (same) return;
    this._marginalKey = key;
    const total = String(this._pages);
    const regions: [Region, Editor | undefined][] = [
      ['header', this._header],
      ['footer', this._footer],
    ];
    for (const [region, editor] of regions.filter(
      ([, candidate]) => candidate && !candidate.isDestroyed,
    )) {
      if (!editor) break;
      const serializer = DOMSerializer.fromSchema(editor.schema);
      const fragment = serializer.serializeFragment(editor.state.doc.content);
      const copies = this.renderRoot.querySelectorAll<HTMLElement>(
        `.marginal-copy[data-region="${region}"]`,
      );
      copies.forEach(copy => {
        const page = String(Number(copy.dataset.page) + 1);
        const content = fragment.cloneNode(true) as DocumentFragment;
        content
          .querySelectorAll<HTMLElement>('[data-type="page-number"]')
          .forEach(element => {
            const number = element;
            number.textContent = number.dataset.kind === 'total' ? total : page;
          });
        copy.replaceChildren(content);
      });
    }
  }

  private _editMarginal(region: 'header' | 'footer', page: number) {
    if (this.readonly || this.disabled) return;
    this._marginalPage = page;
    this._region = region;
    this.updateComplete.then(() => {
      (region === 'header' ? this._header : this._footer)?.commands.focus(
        'end',
      );
    });
  }

  /** Focus leaving the live header or footer closes it, unless it went to the toolbar or a popup. */
  private _leaveMarginal = (event: FocusEvent) => {
    const next = event.relatedTarget as Node | null;
    const keep = ['.marginal-live.active', '.toolbar', '.link-editor'].some(
      selector =>
        !!next && !!this.renderRoot.querySelector(selector)?.contains(next),
    );
    if (keep || this._link.open) return;
    this._region = 'body';
  };

  // ── Private methods: images ───────────────────────────────────────────────

  private _requestImage = () => {
    if (this.readonly || this.disabled) return;
    this._imageAt = this._body?.state.selection.from;
    this._imageInput?.click();
  };

  private _onImageChosen = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    files.forEach(file => this._upload(file, this._imageAt));
  };

  /** Pasted or dropped image files go to the app; returns whether there were any. */
  private _takeImages(data: DataTransfer | null): boolean {
    const files = Array.from(data?.files ?? []).filter(file =>
      file.type.startsWith('image/'),
    );
    if (!files.length) return false;
    const at = this._body?.state.selection.from;
    files.forEach(file => this._upload(file, at));
    return true;
  }

  private _upload(file: File, at: number | undefined) {
    this.dispatchEvent(
      new CustomEvent<DocumentImageUploadDetail>('image-upload', {
        detail: {
          file,
          respond: (src: string, alt?: string) => {
            const body = this._body;
            const url = safeUrl(src);
            if (!body || !url || /^(mailto|tel):/i.test(url)) return;
            const position = Math.min(
              at ?? body.state.selection.from,
              body.state.doc.content.size,
            );
            body
              .chain()
              .focus()
              .insertContentAt(position, {
                type: 'image',
                attrs: { src: url, alt: alt ?? file.name },
              })
              .run();
          },
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // ── Private methods: events ───────────────────────────────────────────────

  private _emit(type: 'input' | 'change') {
    this.dispatchEvent(
      new CustomEvent<DocumentValueDetail>(type, {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _queueInput() {
    window.clearTimeout(this._inputTimer);
    this._inputTimer = window.setTimeout(() => {
      this._inputTimer = undefined;
      this._emit('input');
    }, this.debounce);
  }

  private _flushInput() {
    if (this._inputTimer === undefined) return;
    window.clearTimeout(this._inputTimer);
    this._inputTimer = undefined;
    this._emit('input');
  }

  private _onFocusOut = (event: FocusEvent) => {
    const next = event.relatedTarget as Node | null;
    if (next && (next === this || this.contains(next))) return;
    this._flushInput();
    if (!this._changed) return;
    this._changed = false;
    this._emit('change');
  };

  private _run(command: (editor: Editor) => void) {
    const editor = this._activeEditor;
    if (!editor || this.readonly || this.disabled) return;
    command(editor);
  }

  private _keepSelection = (event: MouseEvent) => event.preventDefault();

  private _onTextStyle = (event: CustomEvent<{ item: HTMLElement }>) => {
    event.stopPropagation();
    const id = event.detail.item.getAttribute('value');
    const block: BlockCommand | undefined = BLOCKS.find(b => b.id === id);
    if (block) this._run(editor => block.run(editor.chain().focus()).run());
  };

  private _onColor = (event: CustomEvent<{ item: HTMLElement }>) => {
    event.stopPropagation();
    const color = event.detail.item.getAttribute('value') ?? '';
    this._run(editor => {
      if (color) editor.chain().focus().setColor(color).run();
      else editor.chain().focus().unsetColor().run();
    });
  };

  private _onTableAction = (event: CustomEvent<{ item: HTMLElement }>) => {
    event.stopPropagation();
    const action = event.detail.item.getAttribute('value') as TableAction;
    this._run(editor => {
      const chain = editor.chain().focus();
      const actions: Record<TableAction, () => boolean> = {
        addRowBelow: () => chain.addRowAfter().run(),
        addColumnAfter: () => chain.addColumnAfter().run(),
        deleteRow: () => chain.deleteRow().run(),
        deleteColumn: () => chain.deleteColumn().run(),
        deleteTable: () => chain.deleteTable().run(),
      };
      actions[action]?.();
    });
  };

  private _onPageNumber = (event: CustomEvent<{ item: HTMLElement }>) => {
    event.stopPropagation();
    const kind =
      event.detail.item.getAttribute('value') === 'total' ? 'total' : 'current';
    this._run(editor => editor.chain().focus().insertPageNumber(kind).run());
  };

  private _onPageSize = (event: CustomEvent<{ item: HTMLElement }>) => {
    event.stopPropagation();
    const size = event.detail.item.getAttribute('value') ?? '';
    if (size in SIZE_LABELS) this._setPage({ size: size as PageSize });
  };

  private _onOrientation = (event: CustomEvent<{ item: HTMLElement }>) => {
    event.stopPropagation();
    const orientation = event.detail.item.getAttribute('value');
    if (orientation === 'portrait' || orientation === 'landscape') {
      this._setPage({ orientation: orientation as PageOrientation });
    }
  };

  private _onMargins = (event: CustomEvent<{ item: HTMLElement }>) => {
    event.stopPropagation();
    const preset = event.detail.item.getAttribute('value') ?? '';
    if (preset in MARGIN_PRESETS) {
      this._setPage({ margins: { ...MARGIN_PRESETS[preset as MarginPreset] } });
    }
  };

  private _goToHeading(heading: Heading) {
    const body = this._body;
    if (!body) return;
    body
      .chain()
      .focus()
      .setTextSelection(heading.pos + 1)
      .run();
    const dom = body.view.nodeDOM(heading.pos);
    if (dom instanceof HTMLElement) dom.scrollIntoView({ block: 'start' });
  }

  // ── Private methods: derived ──────────────────────────────────────────────

  private _headings(): Heading[] {
    const headings: Heading[] = [];
    this._body?.state.doc.descendants((node, pos) => {
      if (node.type.name === 'heading') {
        headings.push({
          level: node.attrs.level as number,
          text: node.textContent,
          pos,
        });
        return false;
      }
      return node.isBlock && !node.isTextblock;
    });
    return headings;
  }

  private _wordCount(): number {
    const text = this._body?.state.doc.textContent ?? '';
    return text.split(/\s+/).filter(Boolean).length;
  }

  /** The page the caret is on, from 1. */
  private _currentPage(): number {
    const body = this._body;
    const pages = this._pagesElement;
    if (!body || !pages || body.isDestroyed) return 1;
    try {
      const { top } = body.view.coordsAtPos(body.state.selection.from);
      const geometry = this._geometry();
      const y = (top - pages.getBoundingClientRect().top) / this._shownScale;
      const page = Math.floor(y / (geometry.height + geometry.gap)) + 1;
      return Math.min(Math.max(page, 1), this._pages);
    } catch {
      return 1;
    }
  }

  // ── Render helpers ────────────────────────────────────────────────────────

  private _tool(
    icon: string,
    label: string,
    action: () => void,
    selected?: boolean,
  ) {
    return html`<wc-icon-button
      class="tool"
      variant="text"
      color="surface"
      shape="round"
      size="xs"
      ?toggle=${selected !== undefined}
      ?selected=${!!selected}
      aria-label=${label}
      tooltip=${label}
      @click=${action}
      ><wc-icon name=${icon}></wc-icon
    ></wc-icon-button>`;
  }

  private _divider() {
    return html`<wc-divider orientation="vertical"></wc-divider>`;
  }

  private _renderTextStyle(editor: Editor) {
    const textStyles = blocksFor(editor).filter(block => block.textStyle);
    if (textStyles.length < 2) return nothing;
    const active = activeTextStyle(editor);
    return html`<wc-dropdown-button
        class="text-style"
        size="xs"
        variant="text"
        color="surface"
        aria-label=${this._i18n.t('textStyle')}
        @menu-item-activate=${this._onTextStyle}
      >
        ${this._i18n.t(active?.id ?? 'paragraph')}
        ${textStyles.map(
          block =>
            html`<wc-menu-item
              slot="menu"
              type="radio"
              value=${block.id}
              ?selected=${block === active}
              >${this._i18n.t(block.id)}</wc-menu-item
            >`,
        )}
      </wc-dropdown-button>
      ${this._divider()}`;
  }

  private _renderColor(editor: Editor) {
    if (!editor.schema.marks.textStyle) return nothing;
    const current = (editor.getAttributes('textStyle').color as string) ?? '';
    return html`<wc-dropdown-button
      class="text-color"
      size="xs"
      variant="text"
      color="surface"
      aria-label=${this._i18n.t('textColor')}
      @menu-item-activate=${this._onColor}
    >
      <wc-icon name="format_color_text"></wc-icon>
      <wc-menu-item slot="menu" type="radio" value="" ?selected=${!current}
        >${this._i18n.t('defaultColor')}</wc-menu-item
      >
      ${TEXT_COLORS.map(
        color =>
          html`<wc-menu-item
            slot="menu"
            type="radio"
            value=${color.value}
            ?selected=${current.toLowerCase() === color.value}
            ><span
              slot="start"
              class="swatch"
              style=${styleMap({ background: color.value })}
            ></span
            >${color.name}</wc-menu-item
          >`,
      )}
    </wc-dropdown-button>`;
  }

  private _renderAlign(editor: Editor) {
    const types =
      this._region === 'body' ? ['paragraph', 'heading'] : ['paragraph'];
    return ALIGNMENTS.map(alignment =>
      this._tool(
        alignment.icon,
        this._i18n.t(alignment.key),
        () =>
          this._run(e => {
            e.chain().focus().setTextAlign(alignment.value).run();
          }),
        types.some(type =>
          editor.isActive(type, { textAlign: alignment.value }),
        ) ||
          (alignment.value === 'left' &&
            !ALIGNMENTS.some(other =>
              types.some(type =>
                editor.isActive(type, { textAlign: other.value }),
              ),
            )),
      ),
    );
  }

  private _renderTableTools(editor: Editor) {
    if (!editor.isActive('table')) return nothing;
    return html`${this._divider()}
      <wc-dropdown-button
        class="table-tools"
        size="xs"
        variant="text"
        color="surface"
        @menu-item-activate=${this._onTableAction}
      >
        ${this._i18n.t('table')}
        ${TABLE_ACTIONS.map(
          action =>
            html`<wc-menu-item slot="menu" value=${action}
              >${this._i18n.t(action)}</wc-menu-item
            >`,
        )}
      </wc-dropdown-button>`;
  }

  private _renderBodyTools(editor: Editor) {
    const i18n = this._i18n;
    const blocks = blocksFor(editor).filter(
      block => !block.textStyle && block.id !== 'divider',
    );
    return html`${this._renderTextStyle(editor)}
    ${marksFor(editor).map(mark =>
      this._tool(
        mark.icon,
        i18n.t(mark.id),
        () => this._run(e => mark.run(e.chain().focus()).run()),
        editor.isActive(mark.mark),
      ),
    )}
    ${this._renderColor(editor)} ${this._divider()} ${this._renderAlign(editor)}
    ${this._divider()}
    ${blocks.map(block =>
      this._tool(
        block.icon,
        i18n.t(block.id),
        () => this._run(e => block.run(e.chain().focus()).run()),
        block.id === 'table' ? undefined : block.active(editor),
      ),
    )}
    ${this._divider()}
    ${this._tool(
      'link',
      i18n.t('link'),
      () => this._link.show(),
      editor.isActive('link'),
    )}
    ${this._tool('image', i18n.t('insertImage'), this._requestImage)}
    ${this._tool('insert_page_break', i18n.t('pageBreak'), () =>
      this._run(e => e.chain().focus().setPageBreak().run()),
    )}
    ${this._tool('add_comment', i18n.t('addComment'), this._addComment)}
    ${this.triggers
      ? this._tool('alternate_email', i18n.t('mentionSomeone'), () =>
          this._mentions.insertTrigger(),
        )
      : nothing}
    ${this._renderTableTools(editor)}`;
  }

  private _renderMarginalTools(editor: Editor) {
    const i18n = this._i18n;
    return html`${marksFor(editor).map(mark =>
        this._tool(
          mark.icon,
          i18n.t(mark.id),
          () => this._run(e => mark.run(e.chain().focus()).run()),
          editor.isActive(mark.mark),
        ),
      )}
      ${this._renderColor(editor)} ${this._divider()}
      ${this._renderAlign(editor)} ${this._divider()}
      ${this._tool(
        'link',
        i18n.t('link'),
        () => this._link.show(),
        editor.isActive('link'),
      )}
      <wc-dropdown-button
        class="page-number-menu"
        size="xs"
        variant="text"
        color="surface"
        @menu-item-activate=${this._onPageNumber}
      >
        ${i18n.t('insertPageNumber')}
        <wc-menu-item slot="menu" value="current"
          >${i18n.t('insertPageNumber')}</wc-menu-item
        >
        <wc-menu-item slot="menu" value="total"
          >${i18n.t('pageCount')}</wc-menu-item
        >
      </wc-dropdown-button>`;
  }

  private _renderToolbar() {
    const editor = this._activeEditor;
    const i18n = this._i18n;
    const editing = !this.readonly && !this.disabled;
    return html`<wc-toolbar
      class="toolbar"
      variant="flat"
      aria-label=${i18n.t('formattingToolbar')}
      @mousedown=${this._keepSelection}
    >
      ${editor && editing
        ? html`${this._tool('undo', i18n.t('undo'), () =>
            this._run(e => e.chain().focus().undo().run()),
          )}
          ${this._tool('redo', i18n.t('redo'), () =>
            this._run(e => e.chain().focus().redo().run()),
          )}
          ${this._divider()}
          ${this._region === 'body'
            ? this._renderBodyTools(editor)
            : this._renderMarginalTools(editor)}`
        : nothing}
      <span class="toolbar-spacer" aria-hidden="true"></span>
      ${this._renderPeople()}
      ${this._tool(
        'toc',
        i18n.t('outline'),
        () => {
          this.outlineOpen = !this.outlineOpen;
        },
        this.outlineOpen,
      )}
      ${this._tool('print', i18n.t('print'), () => this.print())}
    </wc-toolbar>`;
  }

  /** The people editing a shared document, as avatars in their caret colors. */
  private _renderPeople() {
    if (this._people.length < 2) return nothing;
    const i18n = this._i18n;
    return html`<wc-avatar-group
      class="people"
      size="sm"
      max="4"
      label=${i18n.t('collaborators')}
    >
      ${this._people.map(person => {
        const name = person.name || i18n.t('anonymousCollaborator');
        return html`<wc-avatar
          size="sm"
          name=${name}
          label=${person.self ? i18n.t('collaboratorYou')(name) : name}
          src=${person.avatar || nothing}
          style=${styleMap({
            '--avatar-container-color': person.color,
            '--avatar-text-color': '#ffffff',
          })}
        ></wc-avatar>`;
      })}
    </wc-avatar-group>`;
  }

  private _renderOutline() {
    if (!this.outlineOpen) return nothing;
    const headings = this._headings();
    const from = this._body?.state.selection.from ?? 0;
    const current = [...headings].reverse().find(h => h.pos <= from);
    return html`<nav class="outline" aria-label=${this._i18n.t('outline')}>
      <div class="outline-title">${this._i18n.t('outline')}</div>
      ${headings.length
        ? html`<ul>
            ${headings.map(
              heading =>
                html`<li class="level-${heading.level}">
                  <button
                    type="button"
                    class=${classMap({ current: heading === current })}
                    aria-current=${heading === current ? 'location' : nothing}
                    @click=${() => this._goToHeading(heading)}
                  >
                    ${heading.text || '—'}
                  </button>
                </li>`,
            )}
          </ul>`
        : html`<p class="outline-empty">${this._i18n.t('outlineEmpty')}</p>`}
    </nav>`;
  }

  private _renderPages(geometry: PageGeometry) {
    const headerTop = Math.min(12.7 * (96 / 25.4), geometry.marginTop / 2);
    const footerBottom = Math.min(
      12.7 * (96 / 25.4),
      geometry.marginBottom / 2,
    );
    const headerHeight = Math.max(16, geometry.marginTop - headerTop - 6);
    const footerHeight = Math.max(16, geometry.marginBottom - footerBottom - 6);
    const stride = geometry.height + geometry.gap;
    const hint =
      this.readonly || this.disabled
        ? ''
        : this._i18n.t('documentEditMarginal');
    const live = (region: 'header' | 'footer') => this._region === region;
    const marginalBox = (region: 'header' | 'footer', page: number) => ({
      top: `${
        page * stride +
        (region === 'header'
          ? headerTop
          : geometry.height - footerBottom - footerHeight)
      }px`,
      left: `${geometry.marginLeft}px`,
      width: `${geometry.contentWidth}px`,
      height: `${region === 'header' ? headerHeight : footerHeight}px`,
    });

    return html`<div
      class="pages"
      style=${styleMap({
        width: `${geometry.width}px`,
        height: `${this._pages * stride - geometry.gap}px`,
        '--_page-height': `${geometry.height}px`,
      })}
    >
      ${Array.from(
        { length: this._pages },
        (_, page) =>
          // The page sheet is decoration; the text is in the body.
          html`<div
              class="page"
              aria-hidden="true"
              style=${styleMap({
                top: `${page * stride}px`,
                height: `${geometry.height}px`,
              })}
            ></div>
            ${page < this._pages - 1
              ? html`<div
                  class="page-mask"
                  aria-hidden="true"
                  style=${styleMap({
                    top: `${page * stride + geometry.height - geometry.marginBottom}px`,
                    '--_bottom': `${geometry.marginBottom}px`,
                    '--_gap': `${geometry.gap}px`,
                    '--_top': `${geometry.marginTop}px`,
                  })}
                >
                  <span class="mask-sheet bottom"></span
                  ><span class="mask-gap"></span
                  ><span class="mask-sheet top"></span>
                </div>`
              : nothing}
            ${(['header', 'footer'] as const).map(
              region =>
                html`<div
                  class=${classMap({
                    'marginal-copy': true,
                    [region]: true,
                    hidden: live(region) && this._marginalPage === page,
                  })}
                  data-region=${region}
                  data-page=${page}
                  title=${hint}
                  style=${styleMap(marginalBox(region, page))}
                  @dblclick=${() => this._editMarginal(region, page)}
                ></div>`,
            )}`,
      )}
      ${(['header', 'footer'] as const).map(
        region =>
          html`<div
            class=${classMap({
              'marginal-live': true,
              [region]: true,
              active: live(region),
            })}
            style=${styleMap(marginalBox(region, this._marginalPage))}
            @focusout=${this._leaveMarginal}
          >
            <span class="marginal-tag"
              >${this._i18n.t(
                region === 'header' ? 'documentHeader' : 'documentFooter',
              )}</span
            >
            <div class="${region}-root"></div>
          </div>`,
      )}
      <div
        class="body"
        style=${styleMap({
          top: `${geometry.marginTop}px`,
          left: `${geometry.marginLeft}px`,
          width: `${geometry.contentWidth}px`,
        })}
        @dragenter=${this._dragOver}
        @dragover=${this._dragOver}
        @drop=${this._drop}
      >
        <div class="body-root"></div>
      </div>
    </div>`;
  }

  private _renderStatus() {
    const i18n = this._i18n;
    const { page } = this.value;
    const preset = marginPresetOf(page.margins);
    const format = (n: number) => new Intl.NumberFormat(i18n.locale).format(n);
    const words = this._wordCount();
    const editing = !this.readonly && !this.disabled;
    const menu = (
      label: string,
      text: string,
      items: { value: string; label: string; selected: boolean }[],
      handler: (event: CustomEvent<{ item: HTMLElement }>) => void,
    ) =>
      editing
        ? html`<wc-dropdown-button
            size="xs"
            variant="text"
            color="surface"
            placement="top-start"
            aria-label=${label}
            @menu-item-activate=${handler}
          >
            ${text}
            ${items.map(
              item =>
                html`<wc-menu-item
                  slot="menu"
                  type="radio"
                  value=${item.value}
                  ?selected=${item.selected}
                  >${item.label}</wc-menu-item
                >`,
            )}
          </wc-dropdown-button>`
        : html`<span class="status-text">${text}</span>`;

    return html`<div class="status-bar">
      ${menu(
        i18n.t('pageSize'),
        SIZE_LABELS[page.size],
        (Object.keys(SIZE_LABELS) as PageSize[]).map(size => ({
          value: size,
          label: SIZE_LABELS[size],
          selected: size === page.size,
        })),
        this._onPageSize,
      )}
      ${menu(
        i18n.t('orientation'),
        i18n.t(page.orientation),
        (['portrait', 'landscape'] as const).map(orientation => ({
          value: orientation,
          label: i18n.t(orientation),
          selected: orientation === page.orientation,
        })),
        this._onOrientation,
      )}
      ${menu(
        i18n.t('margins'),
        preset ? i18n.t(MARGIN_KEYS[preset]) : i18n.t('marginsCustom'),
        (Object.keys(MARGIN_PRESETS) as MarginPreset[]).map(name => ({
          value: name,
          label: i18n.t(MARGIN_KEYS[name]),
          selected: name === preset,
        })),
        this._onMargins,
      )}
      <span class="status-spacer"></span>
      <span class="status-text"
        >${i18n.t('wordCount')(words, format(words))}</span
      >
      <span class="status-text" aria-live="polite"
        >${i18n.t('documentPageOf')(
          format(this._currentPage()),
          format(this._pages),
        )}</span
      >
      ${this._renderZoom()}
    </div>`;
  }

  /** The zoom menu: the scale shown now, "Fit width" and fixed percentages. Works while read-only. */
  private _renderZoom() {
    const i18n = this._i18n;
    const percent = (value: number) =>
      new Intl.NumberFormat(i18n.locale, { style: 'percent' }).format(value);
    return html`<wc-dropdown-button
      class="zoom-menu"
      size="xs"
      variant="text"
      color="surface"
      placement="top-end"
      aria-label=${i18n.t('documentZoom')}
      @menu-item-activate=${this._onZoom}
    >
      ${percent(this._scale)}
      <wc-menu-item
        slot="menu"
        type="radio"
        value="fit"
        ?selected=${this.zoom === 'fit'}
        >${i18n.t('documentZoomFit')}</wc-menu-item
      >
      ${ZOOM_LEVELS.map(
        level =>
          html`<wc-menu-item
            slot="menu"
            type="radio"
            value=${level}
            ?selected=${this.zoom === level}
            >${percent(level / 100)}</wc-menu-item
          >`,
      )}
    </wc-dropdown-button>`;
  }

  // ── Render ────────────────────────────────────────────────────────────────

  render() {
    const geometry = this._geometry();
    const scale = this._scale;
    this._shownScale = scale;
    const sheetHeight =
      this._pages * (geometry.height + geometry.gap) - geometry.gap;
    return html`<div
        class=${classMap({ document: true, printing: this._printing })}
      >
        ${this._renderToolbar()}
        <div class="workspace">
          ${this._renderOutline()}
          <div class="canvas" @scroll=${this._onCanvasScroll}>
            <div
              class="zoom-frame"
              style=${styleMap({
                width: `${geometry.width * scale}px`,
                height: `${sheetHeight * scale}px`,
              })}
            >
              <div
                class="sheet"
                style=${styleMap({
                  '--_page-width': `${geometry.width}px`,
                  transform: scale === 1 ? undefined : `scale(${scale})`,
                })}
              >
                ${this._renderPages(geometry)}
              </div>
            </div>
          </div>
          <aside
            class="comments"
            aria-label=${this._i18n.t('documentComments')}
            ?hidden=${!this._hasComments}
            @focusin=${this._onCommentsFocus}
          >
            <div class="comments-track">
              <slot
                name="comments"
                @slotchange=${this._onCommentsSlotChange}
              ></slot>
            </div>
          </aside>
        </div>
        ${this._renderStatus()}
        <input
          class="image-input"
          type="file"
          accept="image/*"
          multiple
          hidden
          @change=${this._onImageChosen}
        />
      </div>
      ${this._mentions.render()}
      <span class="slash-anchor" aria-hidden="true"></span>
      ${this._slash.render()} ${this._bubble.render()} ${this._link.render()}
      ${this._blockHandle.render()} ${this._blockHandle.renderDropLine()}`;
  }
}
