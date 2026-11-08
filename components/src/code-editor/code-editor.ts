import { type CSSResult, html, nothing, PropertyValues } from 'lit';
import { property, state, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import type { PeacockStrings } from '@/__internal/i18n/strings.js';
import BaseInput from '../input/BaseInput.js';
import { observeThemeChange } from '../__internal/utils/observe-theme-change.js';
import { buildEditorTheme, resolvePalette } from './editor-theme.js';

import styles from './code-editor.scss';

export type CodeEditorLanguage =
  | 'javascript'
  | 'typescript'
  | 'json'
  | 'html'
  | 'css'
  | 'scss'
  | 'markdown';

export type CodeEditorSize = 'sm' | 'md';

/** A problem shown in the editor: a squiggle under the text and a mark in the scroll bar. Lines and columns count from 1. */
export type CodeEditorMarker = {
  line: number;
  column?: number;
  endLine?: number;
  endColumn?: number;
  message: string;
  severity?: 'error' | 'warning' | 'info';
};

type Monaco = typeof import('./monaco.js');

const EXTENSIONS: Record<CodeEditorLanguage, string> = {
  javascript: 'js',
  typescript: 'ts',
  json: 'json',
  html: 'html',
  css: 'css',
  scss: 'scss',
  markdown: 'md',
};

/** Monaco has one theme per page; every editor defines it from the tokens around it. */
const THEME_NAME = 'peacock';

/** How long the copy button shows its check. */

/** Where the language workers are: `monaco/` beside the built component. */
const WORKERS = new URL('./monaco/', import.meta.url);

let loading: Promise<Monaco> | undefined;
let instances = 0;

/**
 * Reads `line-numbers`: a boolean that is on by default, so `line-numbers="false"` turns it
 * off.
 */
const lineNumbersConverter = {
  fromAttribute(value: string | null): boolean {
    return value !== 'false';
  },
};

/** The worker file for a Monaco language service label. */
function workerFile(label: string): string {
  if (label === 'typescript' || label === 'javascript') return 'ts.worker.js';
  if (label === 'json') return 'json.worker.js';
  return 'editor.worker.js';
}

/** The next editor's model number. */
function nextInstanceId(): number {
  instances += 1;
  return instances;
}

/**
 * Loads Monaco once per page: its workers come from this origin, and the icon font is declared in
 * the document, since a shadow root ignores `@font-face`.
 */
function loadMonaco(): Promise<Monaco> {
  loading ??= (async () => {
    Reflect.set(window, 'MonacoEnvironment', {
      getWorker(_id: string, label: string) {
        return new Worker(new URL(workerFile(label), WORKERS), {
          type: 'module',
        });
      },
    });
    const font = (styles as CSSResult).cssText.match(
      /@font-face\s*\{[^}]*font-family:\s*codicon[^}]*\}/,
    );
    if (font && !document.getElementById('wc-code-editor-codicon')) {
      const [declaration] = font;
      const style = document.createElement('style');
      style.id = 'wc-code-editor-codicon';
      style.textContent = declaration;
      document.head.append(style);
    }
    return import('./monaco.js');
  })();
  return loading;
}

/**
 * @label Code Editor
 * @tag wc-code-editor
 * @rawTag code-editor
 *
 * @summary A code editor built on Monaco, with syntax highlighting, completions and debugging marks.
 * @overview
 * <ul>
 * <li>CodeEditor wraps Monaco Editor as a web component, in the same frame as
 * <code>wc-code-highlighter</code>: an optional header with a title and actions, or a copy button
 * that floats at the top end. Monaco is bundled with Peacock and loaded when the first editor
 * appears; nothing comes from a CDN, so it works under a content security policy that allows only
 * its own origin. The code shows as plain text until Monaco is ready.</li>
 * <li>Its colors come from the theme's color roles and the code highlighter's syntax colors, so
 * light, dark, the system color scheme and custom themes all follow the tokens.</li>
 * <li>Supports TypeScript, JavaScript, JSON, HTML, CSS, SCSS and Markdown, with completions and
 * errors for TypeScript, JavaScript and JSON; read-only mode, line numbers, line wrapping and a
 * minimap.</li>
 * <li><code>lib-source</code> adds TypeScript declarations for completions, such as the modules a
 * script may import.</li>
 * <li>With <code>breakpoint-gutter</code>, a click in the gutter fires
 * <code>breakpoint-toggle</code>; <code>breakpoints</code> and <code>current-line</code> draw the
 * marks a debugger shows.</li>
 * <li><code>markers</code> underline problems, such as where a run failed.</li>
 * <li>With <code>fill</code>, the editor drops its frame and takes the height of its container, as
 * a pane of its own.</li>
 * <li>It is a form field: <code>label</code> shows above the editor (and names it for assistive
 * technology), <code>helper-text</code> below it, <code>error</code> with <code>error-text</code>
 * puts it in its error state, and <code>required</code> blocks form submission while it is empty,
 * with the message shown below once the value is committed or the form is submitted.</li>
 * <li><code>file-name</code> is the header title, such as <code>theme.css</code>.</li>
 * <li>Fires <code>input</code> with <code>{ value }</code> on each edit and <code>change</code> with
 * <code>{ value }</code> when the editor loses focus after an edit.</li>
 * <li><code>size</code> sets the size of the code text: <code>sm</code> or <code>md</code> (the
 * default), as on <code>wc-code-highlighter</code>.</li>
 * <li>Line numbers show by default; <code>line-numbers="false"</code> (or the
 * <code>lineNumbers = false</code> property) hides them.</li>
 * </ul>
 *
 * @slot title - Header title content. Overrides `file-name` and shows the header.
 * @slot icon - Icon shown before the title in the header.
 * @slot actions - Extra action buttons, shown in the header or floating at the top end.
 *
 * @csspart container - The outer frame.
 * @csspart header - The header row.
 * @csspart title - The header title.
 * @csspart actions - The action buttons group.
 * @csspart editor - The area Monaco renders into.
 *
 * @cssprop --code-editor-height - Height of the editing area. Defaults to 300px. Ignored with `fill`.
 * @cssprop --code-editor-background - Frame background. Defaults to `--color-surface-container-low`.
 * @cssprop --code-editor-border-color - Frame border color. Defaults to `--color-outline-variant`.
 * @cssprop --code-editor-shape - Frame corner radius. Defaults to `--shape-corner-medium`.
 * @cssprop --code-highlighter-token-keyword - Keyword color, shared with `wc-code-highlighter`, like the other `--code-highlighter-token-*` colors.
 *
 * @fires {CustomEvent<{value: string}>} input - Dispatched on each edit.
 * @fires {CustomEvent<{value: string}>} change - Dispatched when the editor loses focus after an edit.
 * @fires {CustomEvent<{value: string}>} copied - Dispatched by the copy button (`wc-copy-button`) after it copies the content.
 * @fires {CustomEvent<{value: string, error: unknown}>} copy-error - Dispatched by the copy button when the content could not be copied.
 * @fires {CustomEvent<{line: number}>} breakpoint-toggle - Dispatched when the gutter of a line is clicked, with `breakpoint-gutter` set. The component does not change `breakpoints` itself.
 *
 * @example
 * ```html
 * <wc-code-editor
 *   language="css"
 *   file-name="theme.css"
 *   readonly
 *   style="width: 100%; --code-editor-height: 10rem;"
 *   value=":root { --color-primary: #6341d5; }">
 * </wc-code-editor>
 * ```
 * @tags input, editor
 */
@IndividualComponent
export class CodeEditor extends BaseInput {
  // ── Static

  static styles = [styles];

  // ── Properties

  // `name` (for form use) comes from BaseInput's form association.

  /** The code shown in the editor. Updated as the user types. */
  @property({ type: String })
  value = '';

  /** Language used for syntax highlighting. Can be changed after the editor loads. */
  @property({ type: String })
  language: CodeEditorLanguage = 'javascript';

  /** Label shown above the editor; also its accessible name. */
  @property({ type: String })
  label = '';

  /** Header title, such as a file name. Shows the header when set. */
  @property({ type: String, attribute: 'file-name' })
  fileName = '';

  /** Help text shown below the editor. */
  @property({ type: String, attribute: 'helper-text' })
  helperText = '';

  /** Shows the editor in its error state with `error-text`. */
  @property({ type: Boolean })
  error = false;

  /** Error message shown below the editor while `error` is set; replaces the help text. */
  @property({ type: String, attribute: 'error-text' })
  errorText = '';

  /** TypeScript declarations (a `.d.ts`) for completions in TypeScript and JavaScript, such as the modules the code may import. */
  @property({ type: String, attribute: 'lib-source' })
  libSource: string | undefined;

  /** Compiler options for TypeScript and JavaScript, over the editor's defaults (target and modules ESNext, strict), such as `{ lib: ['es2022'] }`. */
  @property({ type: Object, attribute: false })
  compilerOptions: Record<string, unknown> | undefined;

  /** Whether line numbers show in the gutter. On by default; `line-numbers="false"` hides them. */
  @property({ attribute: 'line-numbers', converter: lineNumbersConverter })
  lineNumbers = true;

  /** Wraps long lines instead of scrolling horizontally. */
  @property({ type: Boolean, reflect: true })
  wrap = false;

  /** Shows a button that turns line wrapping on and off. */
  @property({ type: Boolean, attribute: 'wrap-toggle' })
  wrapToggle = false;

  /** Shows the minimap. Leave the attribute out to hide it. */
  @property({ type: Boolean })
  minimap = false;

  /** Size of the editor. `sm` uses smaller text and padding. */
  @property({ type: String, reflect: true })
  size: CodeEditorSize = 'md';

  /** Hides the copy button. */
  @property({ type: Boolean, attribute: 'hide-copy' })
  hideCopy = false;

  /** Shows a "Read only" badge while the editor is read-only or disabled. */
  @property({ type: Boolean, attribute: 'show-readonly-badge' })
  showReadonlyBadge = false;

  /** Shows a gutter for breakpoints; a click there, or on a line number, fires `breakpoint-toggle`. */
  @property({ type: Boolean, attribute: 'breakpoint-gutter' })
  breakpointGutter = false;

  /** The lines with a breakpoint, from 1. */
  @property({ type: Array, attribute: false })
  breakpoints: number[] = [];

  /** The line a debugger is paused at, marked and scrolled into view; none when unset. */
  @property({ type: Number, attribute: 'current-line' })
  currentLine: number | undefined;

  /** Problems to underline, such as where a run failed. */
  @property({ type: Array, attribute: false })
  markers: CodeEditorMarker[] = [];

  /** Drops the frame and takes the height of the container instead of `--code-editor-height`. */
  @property({ type: Boolean, reflect: true })
  fill = false;

  /** Overrides Peacock's strings for this instance only. */
  @property({ attribute: false }) strings?: Partial<PeacockStrings>;

  /** Whether the editor text has focus. */
  @state() private hasFocus = false;

  /** The Monaco editor instance, once loaded. */
  @state() private editorMonacoInstance?: any;

  // ── Queries

  @query('.editor') private editorElement?: HTMLElement;

  @query('.probe') private probeElement?: HTMLElement;

  // ── Private fields

  /** The Monaco API, once loaded. */
  monaco: Monaco | undefined;

  /** This editor's model's address, unique on the page so two editors never share a model. */
  private readonly __id = nextInstanceId();

  /** Peacock's strings for the toolbar, badge and gutter hovers. */
  private readonly i18n = new I18nController(this);

  /** Stops listening for theme changes. */
  private __unobserveTheme?: () => void;

  /** The system color scheme, watched so the editor follows it. */
  private __colorScheme?: MediaQueryList;

  /** Re-renders when slotted header content is added or removed. */
  private __childObserver?: MutationObserver;

  /** The declarations added for `libSource`. */
  private __lib?: { dispose(): void }[];

  /** The breakpoint and current-line marks. */
  private __decorations?: { set(decorations: unknown[]): void; clear(): void };

  /** The font and padding last given to Monaco, to skip unchanged updates. */
  private __layoutKey = '';

  /** The value when the editor text gained focus; `change` fires on blur when it differs. */
  private __valueAtFocus = '';

  // ── Lifecycle

  connectedCallback() {
    super.connectedCallback();
    this.__unobserveTheme = observeThemeChange(this.__applyTheme);
    this.__colorScheme = window.matchMedia?.('(prefers-color-scheme: dark)');
    this.__colorScheme?.addEventListener('change', this.__applyTheme);
    this.__childObserver = new MutationObserver(() => this.requestUpdate());
    this.__childObserver.observe(this, {
      childList: true,
      attributes: true,
      attributeFilter: ['slot'],
      subtree: true,
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.__unobserveTheme?.();
    this.__colorScheme?.removeEventListener('change', this.__applyTheme);
    this.__childObserver?.disconnect();
    this.__lib?.forEach(lib => lib.dispose());
    this.__lib = undefined;
    const model = this.editorMonacoInstance?.getModel();
    this.editorMonacoInstance?.dispose();
    model?.dispose();
    this.editorMonacoInstance = undefined;
  }

  protected firstUpdated() {
    this.initializeMonaco();
  }

  protected override updated(changedProperties: PropertyValues<this>) {
    super.updated(changedProperties);
    if (
      changedProperties.has('libSource') ||
      changedProperties.has('compilerOptions')
    )
      this.libSourceChanged();

    const editor = this.editorMonacoInstance;
    if (!editor || !this.monaco) return;

    if (
      changedProperties.has('disabled') ||
      changedProperties.has('readonly')
    ) {
      editor.updateOptions({ readOnly: this.disabled || this.readonly });
    }

    if (
      changedProperties.has('lineNumbers') ||
      changedProperties.has('minimap') ||
      changedProperties.has('breakpointGutter') ||
      changedProperties.has('wrap') ||
      changedProperties.has('label') ||
      changedProperties.has('fileName') ||
      changedProperties.has('strings')
    ) {
      editor.updateOptions({
        lineNumbers: this.lineNumbers ? 'on' : 'off',
        minimap: { enabled: this.minimap },
        glyphMargin: this.breakpointGutter,
        wordWrap: this.wrap ? 'on' : 'off',
        ariaLabel: this.__accessibleName,
      });
    }

    // The header and size set the font and padding; read them back from the styles.
    this.__applyLayout();

    if (changedProperties.has('language')) {
      this.monaco.editor.setModelLanguage(editor.getModel(), this.language);
    }

    if (changedProperties.has('value') && editor.getValue() !== this.value) {
      editor.setValue(this.value || '');
    }

    if (
      changedProperties.has('breakpoints') ||
      changedProperties.has('currentLine') ||
      changedProperties.has('strings')
    ) {
      this.drawDecorations();
    }
    if (changedProperties.has('currentLine') && this.currentLine) {
      editor.revealLineInCenterIfOutsideViewport(this.currentLine);
    }

    if (changedProperties.has('markers')) this.drawMarkers();
  }

  // ── Public methods

  async initializeMonaco() {
    const monaco = await loadMonaco();
    // Disconnected while Monaco loaded: nothing to put it in.
    if (!this.isConnected || !this.editorElement) return;
    this.monaco = monaco;
    this.__applyTheme();

    const model = monaco.editor.createModel(
      this.value,
      this.language,
      monaco.Uri.parse(
        `file:///wc-code-editor/${this.__id}/index.${EXTENSIONS[this.language] ?? 'txt'}`,
      ),
    );
    const layout = this.__readLayout();
    this.__layoutKey = JSON.stringify(layout);
    this.editorMonacoInstance = monaco.editor.create(this.editorElement, {
      model,
      ...layout,
      lineNumbers: this.lineNumbers ? 'on' : 'off',
      minimap: { enabled: this.minimap },
      glyphMargin: this.breakpointGutter,
      wordWrap: this.wrap ? 'on' : 'off',
      theme: THEME_NAME,
      readOnly: this.disabled || this.readonly,
      ariaLabel: this.__accessibleName,
      automaticLayout: true,
      fixedOverflowWidgets: true,
      scrollBeyondLastLine: false,
      lineNumbersMinChars: 3,
      lineDecorationsWidth: 8,
      renderLineHighlight: 'line',
      renderLineHighlightOnlyWhenFocus: true,
      overviewRulerBorder: false,
      hideCursorInOverviewRuler: true,
      stickyScroll: { enabled: false },
      scrollbar: {
        useShadows: false,
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10,
      },
    });
    this.__decorations = this.editorMonacoInstance.createDecorationsCollection(
      [],
    );

    // Monaco measures the font when it starts; measure again once web fonts have loaded.
    document.fonts?.ready.then(() => this.monaco?.editor.remeasureFonts());

    this.libSourceChanged();
    this.drawDecorations();
    this.drawMarkers();

    this.editorMonacoInstance.onDidChangeModelContent((e: any) => {
      if (!e.isFlush) {
        this.value = this.editorMonacoInstance?.getValue() ?? '';
        this.__emitValue('input');
      }
    });

    this.editorMonacoInstance.onMouseDown((e: any) => {
      if (!this.breakpointGutter) return;
      const type = e.target?.type;
      const { MouseTargetType } = monaco.editor;
      if (
        type !== MouseTargetType.GUTTER_GLYPH_MARGIN &&
        type !== MouseTargetType.GUTTER_LINE_NUMBERS
      )
        return;
      const line = e.target.position?.lineNumber;
      if (!line) return;
      this.dispatchEvent(
        new CustomEvent('breakpoint-toggle', {
          detail: { line },
          bubbles: true,
          composed: true,
        }),
      );
    });

    this.editorMonacoInstance.onDidFocusEditorText(() => {
      this.handleEditorFocus();
    });

    this.editorMonacoInstance.onDidBlurEditorText(() => {
      this.handleEditorBlur();
    });
  }

  override focus() {
    if (this.editorMonacoInstance) this.editorMonacoInstance.focus();
    else super.focus();
  }

  async setFocus() {
    this.focus();
  }

  async setBlur() {
    this.editorMonacoInstance?.trigger(
      'keyboard',
      'type',
      '',
    ); /* Focus hack or use blur if available */
  }

  /** Scrolls `line` into view and puts the cursor at its start. */
  revealLine(line: number) {
    const editor = this.editorMonacoInstance;
    if (!editor) return;
    editor.revealLineInCenterIfOutsideViewport(line);
    editor.setPosition({ lineNumber: line, column: 1 });
  }

  // ── Protected methods

  /** The editor text gained focus: remember the value, to commit on blur. */
  protected handleEditorFocus() {
    this.hasFocus = true;
    this.__valueAtFocus = this.value;
  }

  /** The editor text lost focus: commit the value with `change` when it was edited. */
  protected handleEditorBlur() {
    this.hasFocus = false;
    if (this.value !== this.__valueAtFocus) {
      this.__valueAtFocus = this.value;
      this.__emitValue('change');
    }
  }

  // ── Private methods

  /** Monaco's accessible name. */
  private get __accessibleName(): string {
    return this.label || this.fileName || this.i18n.t('codeEditor');
  }

  /** The text under the editor: the consumer's error, the validation message or the help. */
  private get __footerText(): string {
    if (this.error) return this.errorText;
    return this.validationText || this.helperText;
  }

  /** Dispatches `input` or `change` with the current value. */
  private __emitValue(type: 'input' | 'change') {
    this.dispatchEvent(
      new CustomEvent(type, {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** Stops Monaco's native `input` events, which cross the shadow boundary, at the editor. */
  private __stopNativeInput(event: Event) {
    event.stopPropagation();
  }

  /** Defines the page's editor theme from the tokens around this editor. */
  private __applyTheme = () => {
    const { monaco, probeElement } = this;
    if (!monaco || !probeElement) return;
    monaco.editor.defineTheme(
      THEME_NAME,
      buildEditorTheme(resolvePalette(probeElement)),
    );
    monaco.editor.setTheme(THEME_NAME);
  };

  /** The font and padding the styles give the code, for Monaco's options. */
  private __readLayout() {
    const probe = this.probeElement;
    if (!probe) return {};
    const style = getComputedStyle(probe);
    const fontSize = parseFloat(style.fontSize) || 14;
    return {
      fontFamily: style.fontFamily,
      fontSize,
      lineHeight: parseFloat(style.lineHeight) || Math.round(fontSize * 1.43),
      padding: {
        top: parseFloat(style.paddingTop) || 0,
        bottom: parseFloat(style.paddingBottom) || 0,
      },
    };
  }

  /** Gives Monaco the font and padding when the header or size changed them. */
  private __applyLayout() {
    const layout = this.__readLayout();
    const key = JSON.stringify(layout);
    if (key === this.__layoutKey) return;
    this.__layoutKey = key;
    this.editorMonacoInstance?.updateOptions(layout);
  }

  /** Whether light-DOM children are assigned to the named slot. */
  private __hasSlotted(name: string): boolean {
    return Array.from(this.children).some(
      child => child.getAttribute('slot') === name,
    );
  }

  private libSourceChanged() {
    const typescript = this.monaco?.typescript;
    if (!typescript) return;
    const defaults = [
      typescript.typescriptDefaults,
      typescript.javascriptDefaults,
    ];
    for (const found of defaults) {
      found.setCompilerOptions({
        target: typescript.ScriptTarget.ESNext,
        module: typescript.ModuleKind.ESNext,
        moduleResolution: typescript.ModuleResolutionKind.NodeJs,
        allowNonTsExtensions: true,
        strict: true,
        noEmit: true,
        ...this.compilerOptions,
      });
    }
    this.__lib?.forEach(lib => lib.dispose());
    this.__lib = this.libSource
      ? defaults.map(found =>
          found.addExtraLib(
            this.libSource!,
            `file:///wc-code-editor/${this.__id}/lib.d.ts`,
          ),
        )
      : undefined;
  }

  private drawDecorations() {
    const { monaco } = this;
    if (!monaco || !this.__decorations) return;
    const range = (line: number) => new monaco.Range(line, 1, line, 1);
    const decorations: unknown[] = this.breakpoints.map(line => ({
      range: range(line),
      options: {
        glyphMarginClassName: 'wc-code-editor-breakpoint',
        glyphMarginHoverMessage: { value: this.i18n.t('breakpoint') },
        stickiness: 1,
      },
    }));
    if (this.currentLine) {
      decorations.push({
        range: range(this.currentLine),
        options: {
          isWholeLine: true,
          className: 'wc-code-editor-current-line',
          glyphMarginClassName: 'wc-code-editor-current-line-glyph',
          glyphMarginHoverMessage: { value: this.i18n.t('pausedHere') },
        },
      });
    }
    this.__decorations.set(decorations);
  }

  private drawMarkers() {
    const { monaco } = this;
    const model = this.editorMonacoInstance?.getModel();
    if (!monaco || !model) return;
    const severity = {
      error: monaco.MarkerSeverity.Error,
      warning: monaco.MarkerSeverity.Warning,
      info: monaco.MarkerSeverity.Info,
    };
    monaco.editor.setModelMarkers(
      model,
      'wc-code-editor',
      this.markers.map(marker => {
        const endLine = marker.endLine ?? marker.line;
        return {
          startLineNumber: marker.line,
          startColumn: marker.column ?? 1,
          endLineNumber: endLine,
          endColumn:
            marker.endColumn ??
            model.getLineMaxColumn(Math.min(endLine, model.getLineCount())),
          message: marker.message,
          severity: severity[marker.severity ?? 'error'],
        };
      }),
    );
  }

  /**
   * Hands the copy button the editor's current text just before it copies: a capture listener on
   * the button runs before the button's own click handler, and the text changes as the person
   * types without a re-render.
   */
  private __prepareCopy = {
    handleEvent: (event: Event) => {
      const button = event.currentTarget as HTMLElement & { value?: string };
      button.value = this.editorMonacoInstance?.getValue() ?? this.value ?? '';
    },
    capture: true,
  };

  private __handleWrapClick() {
    this.wrap = !this.wrap;
  }

  // ── Render helpers

  private renderBadge() {
    return html`<span class="read-only-badge">
      <wc-icon name="lock"></wc-icon>${this.i18n.t('readOnly')}
    </span>`;
  }

  private renderActions(floating: boolean, showBadge: boolean) {
    const wrapLabel = this.i18n.t(this.wrap ? 'unwrapLines' : 'wrapLines');
    return html`
      <div
        class=${classMap({
          actions: true,
          floating,
          pinned: floating && showBadge,
        })}
        part="actions"
      >
        ${showBadge ? this.renderBadge() : nothing}
        <slot name="actions"></slot>
        ${this.wrapToggle
          ? html`<wc-icon-button
              class="wrap-button"
              variant="text"
              size="xs"
              shape="round"
              color="surface"
              toggle
              ?selected=${this.wrap}
              aria-label=${wrapLabel}
              tooltip=${wrapLabel}
              @click=${this.__handleWrapClick}
            >
              <wc-icon name="wrap_text"></wc-icon>
            </wc-icon-button>`
          : nothing}
        ${this.hideCopy
          ? nothing
          : html`<wc-copy-button
              class="copy-button"
              size="xs"
              label=${this.i18n.t('copyToClipboard')}
              @click=${this.__prepareCopy}
            ></wc-copy-button>`}
      </div>
    `;
  }

  private renderHeader(showBadge: boolean) {
    return html`
      <div class="header" part="header">
        <slot name="icon"></slot>
        <div class="title" part="title">
          <slot name="title">${this.fileName}</slot>
        </div>
        ${this.renderActions(false, showBadge)}
      </div>
    `;
  }

  private renderFieldLabel() {
    if (!this.label) return nothing;
    return html`<div class="field-label" part="label">
      ${this.label}${this.required
        ? html`<span class="required" aria-hidden="true">*</span>`
        : nothing}
    </div>`;
  }

  private renderFooter() {
    const text = this.__footerText;
    if (!text) return nothing;
    return html`<div class="field-footer" part="helper-text">${text}</div>`;
  }

  // ── Render

  render() {
    const hasHeader = !!this.fileName || this.__hasSlotted('title');
    const showBadge =
      this.showReadonlyBadge && (this.disabled || this.readonly);
    const hasActions =
      !this.hideCopy ||
      this.wrapToggle ||
      showBadge ||
      this.__hasSlotted('actions');
    const loaded = !!this.editorMonacoInstance;
    const invalid = this.error || !!this.validationText;

    // A read-only editor keeps full contrast: it is still meant to be read.
    return html`
      ${this.renderFieldLabel()}
      <div
        class=${classMap({
          'code-block': true,
          'has-header': hasHeader,
          focused: this.hasFocus,
          disabled: this.disabled,
          'has-error': invalid,
          numbered: this.lineNumbers,
          'breakpoint-gutter': this.breakpointGutter,
        })}
        part="container"
      >
        ${hasHeader ? this.renderHeader(showBadge) : nothing}
        ${!hasHeader && hasActions
          ? this.renderActions(true, showBadge)
          : nothing}
        <div class="editor-area">
          <div
            class="editor"
            part="editor"
            @input=${this.__stopNativeInput}
            @beforeinput=${this.__stopNativeInput}
          ></div>
          ${loaded
            ? nothing
            : html`<pre class="placeholder" aria-hidden="true">
${this.value}</pre
              >`}
          ${this.skeleton
            ? html`<wc-skeleton class="skeleton" visible></wc-skeleton>`
            : nothing}
        </div>
        <span class="probe" aria-hidden="true"></span>
      </div>
      ${this.renderFooter()}
    `;
  }
}

export default CodeEditor;
