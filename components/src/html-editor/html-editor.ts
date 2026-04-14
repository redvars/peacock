import { html, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { Editor, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Mention from '@tiptap/extension-mention';
import { html as beautifyHtml } from 'js-beautify';

import IndividualComponent from '@/IndividualComponent.js';
import BaseInput from '../input/BaseInput.js';
import { redispatchEvent } from '../__utils/dispatch-event-utils.js';

import styles from './html-editor.scss';

/**
 * @label HTML Editor
 * @tag wc-html-editor
 * @rawTag html-editor
 *
 * @summary A Tiptap-powered HTML editor with visual and source editing modes.
 * @overview
 * <p>The HTML Editor provides a rich-text editing experience built on Tiptap.
 * It wraps the editable area in a Material 3 styled <code>wc-field</code>,
 * exposes common formatting actions, and includes a segmented switch between
 * <strong>Visual</strong> and <strong>HTML</strong> source modes.</p>
 *
 * <p>Get and set the HTML content via the <code>value</code> property. The component
 * dispatches a <code>change</code> event whenever the content is modified.
 * Mention suggestions are supported through the <code>mentions</code> property,
 * with optional externally managed lookup via the <code>search</code> event.</p>
 *
 * @cssprop --html-editor-min-height - Minimum height of the editable area. Defaults to 8rem.
 * @cssprop --html-editor-toolbar-background - Background color of the toolbar.
 * @cssprop --html-editor-toolbar-border-color - Border color between toolbar and editing area.
 *
 * @fires {Event} change - Fired whenever the editable content changes.
 * @fires {CustomEvent} search - Fired in managed mention mode with { query, callback } detail.
 *
 * @example
 * ```html
 * <wc-html-editor
 *   label="Description"
 *   value="<p>Hello <strong>world</strong></p>"
 *   .mentions="[{ label: 'Alex', value: 'alex' }]"
 * ></wc-html-editor>
 * ```
 * @tags input editor
 */
@IndividualComponent
export class HtmlEditor extends BaseInput {
  static styles = [styles];

  private _editor?: Editor;

  private _changeTimeout?: number;

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

  /** Whether toolbar controls should be displayed in visual mode. */
  @property({ type: Boolean, attribute: 'show-toolbar' })
  showToolbar = true;

  /** Mention suggestions used by the mention extension. */
  @property({ type: Array })
  mentions: Array<{ label: string; value: string }> = [];

  /** Mention filtering mode. */
  @property({ type: String, attribute: 'mentions-search' })
  mentionsSearch: 'contains' | 'managed' = 'contains';

  /** Character that triggers mention suggestions. */
  @property({ type: String, attribute: 'suggestion-character' })
  suggestionCharacter = '@';

  /** Whether to include the suggestion character in rendered mention text. */
  @property({ type: Boolean, attribute: 'show-suggestion-character' })
  showSuggestionCharacter = true;

  /** Debounce in milliseconds for dispatching `change`. */
  @property({ type: Number })
  debounce = 250;

  @state() private _focused = false;

  @state() private _mode: 'visual' | 'html' = 'visual';

  @query('.tiptap-root')
  private _editorEl!: HTMLDivElement;

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  protected firstUpdated() {
    this._initializeEditor();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._changeTimeout) {
      window.clearTimeout(this._changeTimeout);
      this._changeTimeout = undefined;
    }
    this._destroyEditor();
  }

  protected updated(changed: Map<string, unknown>) {
    if (changed.has('value') && this._editor) {
      const editorHtml = HtmlEditor._normalizeHtml(this._editor.getHTML());
      const nextHtml = HtmlEditor._normalizeHtml(this.value);
      if (editorHtml !== nextHtml) {
        this._editor.commands.setContent(this.value ?? '', false);
      }
    }

    if ((changed.has('disabled') || changed.has('readonly')) && this._editor) {
      this._editor.setEditable(!(this.disabled || this.readonly));
    }

    if (changed.has('placeholder') && this._editor) {
      this._destroyEditor();
      this._initializeEditor();
    }

    if (changed.has('mentions') && this._editor) {
      const oldMentions = changed.get('mentions') as Array<{
        label: string;
        value: string;
      }>;
      if (oldMentions !== this.mentions) {
        this._destroyEditor();
        this._initializeEditor();
      }
    }
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  private static _normalizeHtml(value: string) {
    return beautifyHtml(value ?? '', {
      wrap_line_length: 120,
    });
  }

  private _destroyEditor() {
    if (!this._editor) return;
    this._editorEl?.removeEventListener('click', this._focusEditorOnContainerClick);
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
          placeholder: this.placeholder,
        }),
        Mention.configure({
          HTMLAttributes: {
            class: 'mention',
          },
          renderHTML: ({ options, node }) => {
            const item = this._getMentionItem(node.attrs.id);
            return [
              'a',
              mergeAttributes({ contenteditable: false }, options.HTMLAttributes),
              `${this.showSuggestionCharacter ? options.suggestion.char : ''}${
                item ? item.label : node.attrs.id
              }`,
            ];
          },
          suggestion: {
            allowSpaces: true,
            char: this.suggestionCharacter,
            items: async ({ query: mentionQuery }) => {
              if (this.mentionsSearch === 'managed') {
                return this._requestManagedMentions(mentionQuery);
              }

              return this.mentions
                .filter(item =>
                  item.label.toLowerCase().startsWith(mentionQuery.toLowerCase()),
                )
                .map(item => item.value)
                .slice(0, 5);
            },
          },
        }),
      ],
      content: this.value,
      editable: !(this.disabled || this.readonly),
      onFocus: () => {
        this._focused = true;
      },
      onBlur: () => {
        this._focused = false;
      },
      onUpdate: () => {
        if (!this._editor) return;

        const nextHtml = HtmlEditor._normalizeHtml(this._editor.getHTML());
        if (nextHtml !== this.value) {
          this.value = nextHtml;
        }

        this._dispatchDebouncedChange();
      },
    });

    this._editorEl.addEventListener('click', this._focusEditorOnContainerClick);
  }

  private _focusEditorOnContainerClick = (event: Event) => {
    if (!this._editor) return;
    if (event.target === this._editorEl) {
      this._editor.commands.focus('end');
    }
  };

  private _dispatchDebouncedChange() {
    if (this._changeTimeout) {
      window.clearTimeout(this._changeTimeout);
    }

    this._changeTimeout = window.setTimeout(() => {
      redispatchEvent(this, new Event('change', { bubbles: true, composed: true }));
    }, this.debounce);
  }

  private _requestManagedMentions(mentionQuery: string): Promise<string[]> {
    return new Promise(resolve => {
      this.dispatchEvent(
        new CustomEvent('search', {
          detail: {
            query: mentionQuery,
            callback: (mentions: Array<{ label: string; value: string }>) => {
              this.mentions = mentions;
              resolve(this.mentions.map(item => item.value));
            },
          },
          bubbles: true,
          composed: true,
        }),
      );
    });
  }

  private _getMentionItem(value: string) {
    return this.mentions.find(item => item.value === value);
  }

  private _execCommand(command: () => void) {
    if (this.disabled || this.readonly || !this._editor) return;
    command();
    this._editor.commands.focus();
  }

  private _switchMode(event: CustomEvent<{ value: string }>) {
    event.stopPropagation();
    const nextMode = event.detail?.value === 'html' ? 'html' : 'visual';

    if (nextMode === this._mode) return;

    if (nextMode === 'html' && this._editor) {
      this.value = HtmlEditor._normalizeHtml(this._editor.getHTML());
    }

    this._mode = nextMode;
  }

  private _handleSourceChange(event: Event) {
    event.stopPropagation();
    const target = event.currentTarget as { value?: string };
    const nextValue = target.value ?? '';

    if (nextValue === this.value) return;

    this.value = nextValue;
    this._dispatchDebouncedChange();
  }

  // ─── Toolbar button ────────────────────────────────────────────────────────

  private _toolbarButton(
    icon: string,
    title: string,
    action: () => void,
    active = false,
  ) {
    return html`
      <button
        class=${classMap({
          'toolbar-btn': true,
          active,
        })}
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

  // ─── Toolbar ───────────────────────────────────────────────────────────────

  private _renderToolbar() {
    if (!this._editor || !this.showToolbar || this._mode !== 'visual') {
      return nothing;
    }

    return html`
      <div
        class="html-editor-toolbar"
        role="toolbar"
        aria-label="Formatting toolbar"
      >
        ${this._toolbarButton(
          'undo',
          'Undo',
          () => this._editor?.commands.undo(),
        )}
        ${this._toolbarButton(
          'redo',
          'Redo',
          () => this._editor?.commands.redo(),
        )}

        <span class="toolbar-divider"></span>

        ${this._toolbarButton(
          'format_bold',
          'Bold',
          () => this._editor?.chain().focus().toggleBold().run(),
          this._editor.isActive('bold'),
        )}
        ${this._toolbarButton(
          'format_italic',
          'Italic',
          () => this._editor?.chain().focus().toggleItalic().run(),
          this._editor.isActive('italic'),
        )}
        ${this._toolbarButton(
          'format_underlined',
          'Underline',
          () => this._editor?.chain().focus().toggleUnderline().run(),
          this._editor.isActive('underline'),
        )}
        ${this._toolbarButton(
          'format_strikethrough',
          'Strikethrough',
          () => this._editor?.chain().focus().toggleStrike().run(),
          this._editor.isActive('strike'),
        )}

        <span class="toolbar-divider"></span>

        ${this._toolbarButton(
          'format_list_bulleted',
          'Unordered list',
          () => this._editor?.chain().focus().toggleBulletList().run(),
          this._editor.isActive('bulletList'),
        )}
        ${this._toolbarButton(
          'format_list_numbered',
          'Ordered list',
          () => this._editor?.chain().focus().toggleOrderedList().run(),
          this._editor.isActive('orderedList'),
        )}
      </div>
    `;
  }

  private _renderReadonlyTag() {
    if (this.disabled) {
      return html`<wc-tag class="read-only-tag" color="red">Disabled</wc-tag>`;
    }
    if (this.readonly) {
      return html`<wc-tag class="read-only-tag" color="red">Read Only</wc-tag>`;
    }
    return nothing;
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
        <div class="mode-switcher">
          <wc-segmented-button-group @change=${this._switchMode}>
            <wc-segmented-button
              value="visual"
              ?selected=${this._mode === 'visual'}
              ?disabled=${this.disabled}
            >
              Visual
            </wc-segmented-button>
            <wc-segmented-button
              value="html"
              ?selected=${this._mode === 'html'}
              ?disabled=${this.disabled}
            >
              HTML
            </wc-segmented-button>
          </wc-segmented-button-group>
        </div>

        ${this._renderToolbar()}

        <div
          class=${classMap({
            'html-editor-content': true,
            'is-empty': isEmpty,
            hidden: this._mode !== 'visual',
          })}
          data-placeholder=${this.placeholder}
        >
          <div class="tiptap-root"></div>
        </div>

        <div class=${classMap({ 'html-source': true, hidden: this._mode !== 'html' })}>
          <wc-code-editor
            language="html"
            .value=${this.value}
            ?readonly=${this.readonly}
            ?disabled=${this.disabled}
            @change=${this._handleSourceChange}
          ></wc-code-editor>
        </div>

        ${this._renderReadonlyTag()}
      </wc-field>
    `;
  }
}
