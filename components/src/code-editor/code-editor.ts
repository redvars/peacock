import { type CSSResult, html, nothing, PropertyValues } from 'lit';
import { property, state, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import BaseInput from '../input/BaseInput.js';
import { observeThemeChange } from '../__internal/utils/observe-theme-change.js';
import { redispatchEvent } from '../__internal/utils/dispatch-event-utils.js';
import { copyToClipboard } from '../__internal/utils/copy-to-clipboard.js';
import { isDarkMode } from '@/__internal/utils/is-dark-mode.js';

import styles from './code-editor.scss';

export type CodeEditorLanguage =
  | 'javascript'
  | 'typescript'
  | 'json'
  | 'html'
  | 'css'
  | 'scss'
  | 'markdown';

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

const locale = {
  copied: 'Copied',
  copyToClipboard: 'Copy to clipboard',
  readOnly: 'Read Only',
  breakpoint: 'Breakpoint',
  currentLine: 'Paused here',
};

const EXTENSIONS: Record<CodeEditorLanguage, string> = {
  javascript: 'js',
  typescript: 'ts',
  json: 'json',
  html: 'html',
  css: 'css',
  scss: 'scss',
  markdown: 'md',
};

/** Where the language workers are: `monaco/` beside the built component. */
const WORKERS = new URL('./monaco/', import.meta.url);

let loading: Promise<Monaco> | undefined;
let instances = 0;

/**
 * Loads Monaco once per page: its workers come from this origin, and the icon font is declared in
 * the document, since a shadow root ignores `@font-face`.
 */
function loadMonaco(): Promise<Monaco> {
  loading ??= (async () => {
    Reflect.set(globalThis, 'MonacoEnvironment', {
      getWorker(_id: string, label: string) {
        const file =
          label === 'typescript' || label === 'javascript'
            ? 'ts.worker.js'
            : label === 'json'
              ? 'json.worker.js'
              : 'editor.worker.js';
        return new Worker(new URL(file, WORKERS), { type: 'module' });
      },
    });
    const font = (styles as CSSResult).cssText.match(/@font-face\s*\{[^}]*font-family:\s*codicon[^}]*\}/);
    if (font && !document.getElementById('wc-code-editor-codicon')) {
      const style = document.createElement('style');
      style.id = 'wc-code-editor-codicon';
      style.textContent = font[0];
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
 * @summary A Monaco-based code editing component with syntax highlighting, completions and debugging marks.
 * @overview
 *  - CodeEditor wraps Monaco Editor as a web component. Monaco is bundled with Peacock and loaded when the first editor appears; nothing comes from a CDN, so it works under a content security policy that allows only its own origin.
 *  - Supports TypeScript, JavaScript, JSON, HTML, CSS, SCSS and Markdown, with completions and errors for TypeScript, JavaScript and JSON; read-only mode, line numbers, minimap, and dark/light theme.
 *  - `lib-source` adds TypeScript declarations for completions, such as the modules a script may import.
 *  - With `breakpoint-gutter`, a click in the gutter fires `breakpoint-toggle`; `breakpoints` and `current-line` draw the marks a debugger shows.
 *  - `markers` underline problems, such as where a run failed.
 *  - With `fill`, the editor takes the height of its container.
 *  - Has a copy button; hide it with `hide-copy`.
 *  - Emits `change` when content is edited and updates value from property changes.
 *
 * @cssprop --code-editor-height - Height of the editor. Defaults to 300px.
 *
 * @fires {Event} change - Dispatched when the user edits the content.
 * @fires {CustomEvent<{value: string}>} copied - Dispatched after the copy button copies the content.
 * @fires {CustomEvent<{line: number}>} breakpoint-toggle - Dispatched when the gutter of a line is clicked, with `breakpoint-gutter` set. The component does not change `breakpoints` itself.
 *
 * @example
 * ```html
 * <wc-code-editor
 *   language="css"
 *   readonly
 *   style="width: 100%; --code-editor-height: 10rem;"
 *   value=":root { --color-primary: #6341d5; }">
 * </wc-code-editor>
 * ```
 * @tags input, editor
 */
@IndividualComponent
export default class CodeEditor extends BaseInput {
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

  /** TypeScript declarations (a `.d.ts`) for completions in TypeScript and JavaScript, such as the modules the code may import. */
  @property({ type: String, attribute: 'lib-source' })
  libSource: string | undefined;

  /** Compiler options for TypeScript and JavaScript, over the editor's defaults (target and modules ESNext, strict), such as `{ lib: ['es2022'] }`. */
  @property({ type: Object, attribute: false })
  compilerOptions: Record<string, unknown> | undefined;

  /** Whether line numbers show in the gutter. */
  @property({ type: String })
  lineNumbers: 'off' | 'on' = 'on';

  /** Shows the minimap. Leave the attribute out to hide it. */
  @property({ type: Boolean })
  minimap = false;

  /** Hides the copy button. */
  @property({ type: Boolean, attribute: 'hide-copy' })
  hideCopy = false;

  /** Shows a "Read Only" badge while the editor is read-only or disabled. */
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

  /** Takes the height of the container instead of `--code-editor-height`. */
  @property({ type: Boolean, reflect: true })
  fill = false;

  /** Whether the page is in dark mode; picks the Monaco theme. */
  @state() private _isDarkMode: boolean = isDarkMode();

  /** Whether the editor text has focus. */
  @state() private hasFocus = false;

  /** Whether the copy button was just used; shows a check for a few seconds. */
  @state() private _copied = false;

  /** The Monaco editor instance, once loaded. */
  @state() private editorMonacoInstance?: any;

  // ── Queries

  @query('.editor') private editorElement!: HTMLElement;

  // ── Private fields

  /** The Monaco API, once loaded. */
  monaco: Monaco | undefined;

  /** This editor's model's address, unique on the page so two editors never share a model. */
  private readonly __id = ++instances;

  /** Stops listening for theme changes. */
  private __unobserveTheme?: () => void;

  /** Resets the copied state of the copy button. */
  private __copiedTimer?: ReturnType<typeof setTimeout>;

  /** The declarations added for `libSource`. */
  private __lib?: { dispose(): void }[];

  /** The breakpoint and current-line marks. */
  private __decorations?: { set(decorations: unknown[]): void; clear(): void };

  // ── Lifecycle

  connectedCallback() {
    super.connectedCallback();
    this.__unobserveTheme = observeThemeChange(() => {
      this._isDarkMode = isDarkMode();
      this.monaco?.editor.setTheme(this.getTheme());
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.__unobserveTheme?.();
    clearTimeout(this.__copiedTimer);
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

  protected updated(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('libSource') || changedProperties.has('compilerOptions')) this.libSourceChanged();

    const editor = this.editorMonacoInstance;
    if (!editor || !this.monaco) return;

    if (changedProperties.has('disabled') || changedProperties.has('readonly')) {
      editor.updateOptions({ readOnly: this.disabled || this.readonly });
    }

    if (
      changedProperties.has('lineNumbers') ||
      changedProperties.has('minimap') ||
      changedProperties.has('breakpointGutter')
    ) {
      editor.updateOptions({
        lineNumbers: this.lineNumbers,
        minimap: { enabled: this.minimap },
        glyphMargin: this.breakpointGutter,
      });
    }

    if (changedProperties.has('language')) {
      this.monaco.editor.setModelLanguage(editor.getModel(), this.language);
    }

    if (changedProperties.has('value') && editor.getValue() !== this.value) {
      editor.setValue(this.value || '');
    }

    if (changedProperties.has('breakpoints') || changedProperties.has('currentLine')) {
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

    const model = monaco.editor.createModel(
      this.value,
      this.language,
      monaco.Uri.parse(`file:///wc-code-editor/${this.__id}/index.${EXTENSIONS[this.language] ?? 'txt'}`),
    );
    this.editorMonacoInstance = monaco.editor.create(this.editorElement, {
      model,
      lineNumbers: this.lineNumbers,
      minimap: { enabled: this.minimap },
      glyphMargin: this.breakpointGutter,
      theme: this.getTheme(),
      readOnly: this.disabled || this.readonly,
      automaticLayout: true,
      fixedOverflowWidgets: true,
      scrollBeyondLastLine: false,
    });
    this.__decorations = this.editorMonacoInstance.createDecorationsCollection([]);

    this.libSourceChanged();
    this.drawDecorations();
    this.drawMarkers();

    this.editorMonacoInstance.onDidChangeModelContent((e: any) => {
      if (!e.isFlush) {
        const newValue = this.editorMonacoInstance!.getValue();
        this.value = newValue;
        redispatchEvent(
          this,
          new Event('change', { bubbles: true, composed: true }),
        );
      }
    });

    this.editorMonacoInstance.onMouseDown((e: any) => {
      if (!this.breakpointGutter) return;
      const type = e.target?.type;
      const { MouseTargetType } = monaco.editor;
      if (type !== MouseTargetType.GUTTER_GLYPH_MARGIN && type !== MouseTargetType.GUTTER_LINE_NUMBERS) return;
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
      this.hasFocus = true;
    });

    this.editorMonacoInstance.onDidBlurEditorText(() => {
      this.hasFocus = false;
    });
  }

  async setFocus() {
    this.editorMonacoInstance?.focus();
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

  // ── Private methods

  private libSourceChanged() {
    const typescript = this.monaco?.typescript;
    if (!typescript) return;
    const defaults = [typescript.typescriptDefaults, typescript.javascriptDefaults];
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
      ? defaults.map(found => found.addExtraLib(this.libSource!, `file:///wc-code-editor/${this.__id}/lib.d.ts`))
      : undefined;
  }

  private drawDecorations() {
    const monaco = this.monaco;
    if (!monaco || !this.__decorations) return;
    const range = (line: number) => new monaco.Range(line, 1, line, 1);
    const decorations: unknown[] = this.breakpoints.map(line => ({
      range: range(line),
      options: {
        glyphMarginClassName: 'wc-code-editor-breakpoint',
        glyphMarginHoverMessage: { value: locale.breakpoint },
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
          glyphMarginHoverMessage: { value: locale.currentLine },
        },
      });
    }
    this.__decorations.set(decorations);
  }

  private drawMarkers() {
    const monaco = this.monaco;
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
          endColumn: marker.endColumn ?? model.getLineMaxColumn(Math.min(endLine, model.getLineCount())),
          message: marker.message,
          severity: severity[marker.severity ?? 'error'],
        };
      }),
    );
  }

  private getTheme() {
    return this._isDarkMode ? 'vs-dark' : 'vs';
  }

  private async __handleCopyClick() {
    const value = this.editorMonacoInstance?.getValue() ?? this.value ?? '';
    await copyToClipboard(value);
    this._copied = true;
    clearTimeout(this.__copiedTimer);
    this.__copiedTimer = setTimeout(() => {
      this._copied = false;
    }, 3000);
    this.dispatchEvent(
      new CustomEvent('copied', {
        detail: { value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // ── Render helpers

  private renderToolbar() {
    const showBadge = this.showReadonlyBadge && (this.disabled || this.readonly);
    if (this.hideCopy && !showBadge) return nothing;

    return html`
      <div class="toolbar">
        ${showBadge
          ? html`<wc-tag class="read-only-tag" color="red">${locale.readOnly}</wc-tag>`
          : nothing}
        ${this.hideCopy
          ? nothing
          : html`<wc-icon-button
              class="copy-button"
              color=${this._copied ? 'success' : 'surface'}
              variant="text"
              size="xs"
              aria-label=${this._copied ? locale.copied : locale.copyToClipboard}
              tooltip=${this._copied ? locale.copied : locale.copyToClipboard}
              @click=${this.__handleCopyClick}
            >
              <wc-icon name=${this._copied ? 'check' : 'content_copy'}></wc-icon>
            </wc-icon-button>`}
      </div>
    `;
  }

  // ── Render

  render() {
    if (this.fill) {
      // A pane of its own, such as an IDE's: no field outline, as tall as its container.
      return html`
        <div class="code-editor-component fill">
          ${this.renderToolbar()}
          <div class="editor"></div>
          ${!this.editorMonacoInstance
            ? html`<div class="code-editor-loader"><wc-spinner></wc-spinner> Loading...</div>`
            : nothing}
        </div>
      `;
    }
    // The field isn't marked read-only: its read-only look dims the
    // container, and a read-only editor is still meant to be read.
    return html`
      <wc-field
        ?required=${this.required}
        ?disabled=${this.disabled}
        ?skeleton=${this.skeleton}
        ?focused=${this.hasFocus}
        .host=${this}
        class="${classMap({
          'code-editor-component': true,
          disabled: this.disabled,
        })}"
      >
        ${this.renderToolbar()}
        <div class="editor"></div>
        ${!this.editorMonacoInstance
          ? html`
              <div class="code-editor-loader">
                <wc-spinner></wc-spinner> Loading...
              </div>
            `
          : nothing}
      </wc-field>
    `;
  }
}
