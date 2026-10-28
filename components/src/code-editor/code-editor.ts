import { html, nothing, PropertyValues } from 'lit';
import { property, state, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { init } from 'modern-monaco';
import IndividualComponent from '@/IndividualComponent.js';
import BaseInput from '../input/BaseInput.js';
import { observeThemeChange } from '../__internal/utils/observe-theme-change.js';
import { redispatchEvent } from '../__internal/utils/dispatch-event-utils.js';
import { copyToClipboard } from '../__internal/utils/copy-to-clipboard.js';
import { isDarkMode } from '@/__internal/utils/is-dark-mode.js';

import styles from './code-editor.scss';

export type CodeEditorLanguage = 'javascript' | 'json' | 'html' | 'css' | 'scss';

const locale = {
  copied: 'Copied',
  copyToClipboard: 'Copy to clipboard',
  readOnly: 'Read Only',
};

/**
 * @label Code Editor
 * @tag wc-code-editor
 * @rawTag code-editor
 *
 * @summary A Monaco-based code editing component with syntax highlighting and theming.
 * @overview
 *  - CodeEditor wraps Monaco Editor as a web component.
 *  - Supports JavaScript, JSON, HTML, CSS and SCSS, read-only mode, line numbers, minimap, and dark/light theme.
 *  - Has a copy button; hide it with `hide-copy`.
 *  - Emits `change` when content is edited and updates value from property changes.
 *
 * @cssprop --code-editor-height - Height of the editor. Defaults to 300px.
 *
 * @fires {Event} change - Dispatched when the user edits the content.
 * @fires {CustomEvent<{value: string}>} copied - Dispatched after the copy button copies the content.
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

  /** Extra source loaded as a separate model, e.g. type definitions for completions. */
  @property({ type: Object })
  libSource: any;

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

  /** The Monaco API returned by modern-monaco's init(). */
  monaco: any;

  /** Stops listening for theme changes. */
  private __unobserveTheme?: () => void;

  /** Resets the copied state of the copy button. */
  private __copiedTimer?: ReturnType<typeof setTimeout>;

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
    this.editorMonacoInstance?.dispose();
  }

  protected firstUpdated() {
    this.initializeMonaco();
  }

  protected updated(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('libSource')) this.libSourceChanged();

    const editor = this.editorMonacoInstance;
    if (!editor) return;

    if (changedProperties.has('disabled') || changedProperties.has('readonly')) {
      editor.updateOptions({ readOnly: this.disabled || this.readonly });
    }

    if (changedProperties.has('lineNumbers') || changedProperties.has('minimap')) {
      editor.updateOptions({
        lineNumbers: this.lineNumbers,
        minimap: { enabled: this.minimap },
      });
    }

    if (changedProperties.has('language')) {
      this.monaco.editor.setModelLanguage(editor.getModel(), this.language);
    }

    if (changedProperties.has('value') && editor.getValue() !== this.value) {
      editor.setValue(this.value || '');
    }
  }

  // ── Public methods

  async initializeMonaco() {
    this.monaco = await init({
      themes: ['github-light', 'github-dark'],
    });

    this.editorMonacoInstance = this.monaco.editor.create(this.editorElement, {
      value: this.value,
      lineNumbers: this.lineNumbers,
      language: this.language,
      minimap: { enabled: this.minimap },
      theme: this.getTheme(),
      readOnly: this.disabled || this.readonly,
    });

    if (this.libSource) {
      this.libSourceChanged();
    }

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

  // ── Private methods

  private libSourceChanged() {
    if (!this.monaco) return;
    const libUri = 'java://peacock.redvars.com/lib.java';
    const libModel = this.monaco.editor.getModel(this.monaco.Uri.parse(libUri));

    if (libModel) libModel.dispose();

    if (this.libSource) {
      this.monaco.editor.createModel(
        this.libSource,
        this.language,
        this.monaco.Uri.parse(libUri),
      );
    }
  }

  private getTheme() {
    return this._isDarkMode ? 'github-dark' : 'github-light';
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
