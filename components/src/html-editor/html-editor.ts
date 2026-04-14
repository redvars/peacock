import { html, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import IndividualComponent from '@/IndividualComponent.js';
import BaseInput from '../input/BaseInput.js';
import { redispatchEvent } from '../__utils/dispatch-event-utils.js';

import styles from './html-editor.scss';

/**
 * @label HTML Editor
 * @tag wc-html-editor
 * @rawTag html-editor
 *
 * @summary A WYSIWYG HTML editor component with a Material 3 styled toolbar.
 * @overview
 * <p>The HTML Editor provides a rich-text editing experience using the browser's built-in
 * <code>contenteditable</code> API. It wraps the editable area in a Material 3 styled
 * <code>wc-field</code> and exposes a toolbar with common formatting actions.</p>
 *
 * <p>Get and set the HTML content via the <code>value</code> property. The component
 * dispatches a <code>change</code> event whenever the content is modified.</p>
 *
 * @cssprop --html-editor-min-height - Minimum height of the editable area. Defaults to 8rem.
 * @cssprop --html-editor-toolbar-background - Background color of the toolbar.
 * @cssprop --html-editor-toolbar-border-color - Border color between toolbar and editing area.
 *
 * @fires {Event} change - Fired whenever the editable content changes.
 *
 * @example
 * ```html
 * <wc-html-editor label="Description" value="<p>Hello <strong>world</strong></p>"></wc-html-editor>
 * ```
 * @tags input editor
 */
@IndividualComponent
export class HtmlEditor extends BaseInput {
  static styles = [styles];

  /** Current HTML value of the editor. */
  @property({ type: String })
  value = '';

  /** Label displayed above the editor. */
  @property({ type: String })
  label = '';

  /** Placeholder text shown when the editor is empty. */
  @property({ type: String })
  placeholder = 'Enter text\u2026';

  /** Visual style of the wrapping field. */
  @property({ type: String })
  variant: 'filled' | 'outlined' | 'default' = 'default';

  /** Helper text displayed below the editor. */
  @property({ type: String, attribute: 'helper-text' })
  helperText = '';

  /** Whether to show an error state. */
  @property({ type: Boolean })
  error = false;

  /** Error message text. */
  @property({ type: String, attribute: 'error-text' })
  errorText = '';

  @state() private _focused = false;

  @query('.html-editor-content')
  private _editorEl!: HTMLDivElement;

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  protected firstUpdated() {
    if (this.value && this._editorEl) {
      this._editorEl.innerHTML = this.value;
    }
  }

  protected updated(changed: Map<string, unknown>) {
    if (changed.has('value') && this._editorEl) {
      if (this._editorEl.innerHTML !== this.value) {
        this._editorEl.innerHTML = this.value ?? '';
      }
    }
    if (changed.has('disabled') || changed.has('readonly')) {
      if (this._editorEl) {
        this._editorEl.contentEditable =
          this.disabled || this.readonly ? 'false' : 'true';
      }
    }
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _execCmd(command: string, value?: string) {
    if (this.disabled || this.readonly) return;
    this._editorEl.focus();
    // execCommand is deprecated but remains broadly supported for rich-text editing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (document as any).execCommand(command, false, value ?? null);
  }

  private _handleInput() {
    this.value = this._editorEl.innerHTML;
    redispatchEvent(
      this,
      new Event('change', { bubbles: true, composed: true }),
    );
  }

  private _handleFocus() {
    this._focused = true;
  }

  private _handleBlur() {
    this._focused = false;
  }

  private _insertLink() {
    // eslint-disable-next-line no-alert
    const url = window.prompt('Enter URL:', 'https://');
    if (url) this._execCmd('createLink', url);
  }

  // ─── Toolbar button ────────────────────────────────────────────────────────

  private _toolbarButton(
    icon: string,
    title: string,
    command: string,
    value?: string,
  ) {
    return html`
      <button
        class="toolbar-btn"
        title=${title}
        aria-label=${title}
        ?disabled=${this.disabled || this.readonly}
        @mousedown=${(e: Event) => e.preventDefault()}
        @click=${(e: Event) => {
          e.preventDefault();
          this._execCmd(command, value);
        }}
      >
        <wc-icon name=${icon} size="sm"></wc-icon>
      </button>
    `;
  }

  // ─── Toolbar ───────────────────────────────────────────────────────────────

  private _renderToolbar() {
    return html`
      <div
        class="html-editor-toolbar"
        role="toolbar"
        aria-label="Formatting toolbar"
      >
        ${this._toolbarButton('format_bold', 'Bold', 'bold')}
        ${this._toolbarButton('format_italic', 'Italic', 'italic')}
        ${this._toolbarButton('format_underlined', 'Underline', 'underline')}
        ${this._toolbarButton(
          'format_strikethrough',
          'Strikethrough',
          'strikeThrough',
        )}

        <span class="toolbar-divider"></span>

        ${this._toolbarButton('format_align_left', 'Align left', 'justifyLeft')}
        ${this._toolbarButton(
          'format_align_center',
          'Align center',
          'justifyCenter',
        )}
        ${this._toolbarButton(
          'format_align_right',
          'Align right',
          'justifyRight',
        )}

        <span class="toolbar-divider"></span>

        ${this._toolbarButton(
          'format_list_bulleted',
          'Unordered list',
          'insertUnorderedList',
        )}
        ${this._toolbarButton(
          'format_list_numbered',
          'Ordered list',
          'insertOrderedList',
        )}

        <span class="toolbar-divider"></span>

        ${this._toolbarButton(
          'format_indent_increase',
          'Indent',
          'indent',
        )}
        ${this._toolbarButton('format_indent_decrease', 'Outdent', 'outdent')}

        <span class="toolbar-divider"></span>

        <button
          class="toolbar-btn"
          title="Insert link"
          aria-label="Insert link"
          ?disabled=${this.disabled || this.readonly}
          @mousedown=${(e: Event) => e.preventDefault()}
          @click=${() => this._insertLink()}
        >
          <wc-icon name="link" size="sm"></wc-icon>
        </button>

        <span class="toolbar-divider"></span>

        ${this._toolbarButton('undo', 'Undo', 'undo')}
        ${this._toolbarButton('redo', 'Redo', 'redo')}
      </div>
    `;
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  render() {
    const isEmpty = !this.value || this.value === '<br>';

    return html`
      <wc-field
        label=${this.label}
        ?required=${this.required}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        ?skeleton=${this.skeleton}
        ?focused=${this._focused}
        ?error=${this.error}
        error-text=${this.errorText}
        helper-text=${this.helperText}
        variant=${this.variant}
        ?populated=${!isEmpty}
        .host=${this}
        class=${classMap({
          'html-editor-field': true,
          disabled: this.disabled,
          readonly: this.readonly,
        })}
      >
        ${this._renderToolbar()}

        <div
          class=${classMap({
            'html-editor-content': true,
            'is-empty': isEmpty,
          })}
          contenteditable=${this.disabled || this.readonly ? 'false' : 'true'}
          data-placeholder=${this.placeholder}
          @input=${this._handleInput}
          @focus=${this._handleFocus}
          @blur=${this._handleBlur}
        ></div>

        ${this.disabled || this.readonly
          ? html`<wc-tag class="read-only-tag" color="red">Read Only</wc-tag>`
          : nothing}
      </wc-field>
    `;
  }
}
