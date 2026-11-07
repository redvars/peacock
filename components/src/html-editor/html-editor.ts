import { html, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { Editor, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Mention from '@tiptap/extension-mention';
import { html as beautifyHtml } from 'js-beautify';

import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import type { PeacockStrings } from '@/__internal/i18n/strings.js';
import BaseInput, { type ControlValidity } from '../input/BaseInput.js';

import styles from './html-editor.scss';

/** A mention suggestion. */
export interface HtmlEditorMention {
  label: string;
  value: string;
}

/**
 * @label HTML Editor
 * @tag wc-html-editor
 * @rawTag html-editor
 *
 * @summary A rich text editor for HTML, with formatting actions and a switch to edit the HTML source.
 * @overview
 * <p>The editor is built on Tiptap. It wraps the editable area in a styled <code>wc-field</code>,
 * exposes common formatting actions, and includes a segmented switch between
 * <strong>Visual</strong> and <strong>HTML</strong> source modes.</p>
 *
 * <p>Get and set the HTML content via the <code>value</code> property; an empty editor has the
 * value <code>''</code>. The component fires <code>input</code> with <code>{ value }</code> as the
 * content changes (after <code>debounce</code> milliseconds without typing) and
 * <code>change</code> with <code>{ value }</code> when focus leaves the editor after an edit.
 * With <code>required</code>, an empty editor blocks form submission.</p>
 *
 * <p>Mention suggestions come from the <code>mentions</code> property. With
 * <code>mentions-search="managed"</code> the editor fires <code>mention-search</code> with the
 * typed <code>query</code>; set <code>mentions</code> in response, at once or after a request.</p>
 *
 * <p><code>size</code> sets the text size: <code>sm</code> or <code>md</code> (the default), as on
 * <code>wc-code-editor</code>.</p>
 *
 * @cssprop --html-editor-min-height - Minimum height of the editable area. Defaults to 8rem.
 * @cssprop --html-editor-toolbar-background - Background color of the toolbar.
 * @cssprop --html-editor-toolbar-border-color - Border color between toolbar and editing area.
 *
 * @fires {CustomEvent<{value: string}>} input - Dispatched as the content changes, after `debounce` milliseconds without typing.
 * @fires {CustomEvent<{value: string}>} change - Dispatched when focus leaves the editor after an edit.
 * @fires {CustomEvent<{query: string}>} mention-search - Dispatched in managed mention mode as the user types after the suggestion character. Set `mentions` in response. *
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
  // ── Static ────────────────────────────────────────────────────────────────

  static styles = [styles];

  private static _normalizeHtml(value: string) {
    return beautifyHtml(value ?? '', {
      wrap_line_length: 120,
    });
  }

  // ── Properties ────────────────────────────────────────────────────────────

  /** Current HTML value of the editor; `''` while it is empty. */
  @property({ type: String })
  value = '';

  /** Label displayed above the editor. */
  @property({ type: String })
  label = '';

  /** Placeholder text shown when the editor is empty. Defaults to Peacock's `enterTextPlaceholder` string. */
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

  /** Hides the formatting toolbar of the visual mode. */
  @property({ type: Boolean, attribute: 'hide-toolbar' })
  hideToolbar = false;

  /** Mention suggestions used by the mention extension. */
  @property({ type: Array })
  mentions: HtmlEditorMention[] = [];

  /** Mention filtering mode: `contains` filters `mentions`; `managed` fires `mention-search`. */
  @property({ type: String, attribute: 'mentions-search' })
  mentionsSearch: 'contains' | 'managed' = 'contains';

  /** Character that triggers mention suggestions. */
  @property({ type: String, attribute: 'suggestion-character' })
  suggestionCharacter = '@';

  /** Leaves the suggestion character out of rendered mention text. */
  @property({ type: Boolean, attribute: 'hide-suggestion-character' })
  hideSuggestionCharacter = false;

  /** Debounce in milliseconds for dispatching `input`. */
  @property({ type: Number })
  debounce = 250;

  /** Overrides Peacock's strings for this instance only. */
  @property({ attribute: false }) strings?: Partial<PeacockStrings>;

  // ── State ─────────────────────────────────────────────────────────────────

  @state() private _focused = false;

  @state() private _mode: 'visual' | 'html' = 'visual';

  // ── Queries ───────────────────────────────────────────────────────────────

  @query('.tiptap-root')
  private _editorEl?: HTMLDivElement;

  // ── Private fields ────────────────────────────────────────────────────────

  private _editor?: Editor;

  /** Timer of the debounced `input` event. */
  private _inputTimeout?: number;

  /** Whether focus is somewhere inside the editor. */
  private _focusWithin = false;

  /** The value when focus entered the editor; `change` fires on leaving when it differs. */
  private _valueAtFocus = '';

  /** Resolves the pending managed mention search with the next `mentions`. */
  private _resolveMentionSearch?: (values: string[]) => void;

  /** Peacock's strings for the toolbar, modes, tags and placeholder. */
  private readonly i18n = new I18nController(this);

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  constructor() {
    super();
    this.addEventListener('focusin', this._onFocusIn);
    this.addEventListener('focusout', this._onFocusOut);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._flushInput();
    this._destroyEditor();
  }

  protected firstUpdated() {
    this._initializeEditor();
  }

  protected override updated(changed: PropertyValues<this>) {
    super.updated(changed);
    if (changed.has('value') && this._editor) {
      const editorHtml = this._editorValue();
      const nextHtml = this.value ? HtmlEditor._normalizeHtml(this.value) : '';
      if (editorHtml !== nextHtml) {
        this._editor.commands.setContent(this.value ?? '', false);
      }
    }

    if ((changed.has('disabled') || changed.has('readonly')) && this._editor) {
      this._editor.setEditable(!(this.disabled || this.readonly));
    }

    if (
      (changed.has('placeholder') ||
        changed.has('strings') ||
        changed.has('hideSuggestionCharacter')) &&
      this._editor
    ) {
      this._destroyEditor();
      this._initializeEditor();
    }

    if (changed.has('mentions')) {
      if (this._resolveMentionSearch) {
        // The consumer answered `mention-search`.
        this._resolveMentionSearch(this.mentions.map(item => item.value));
        this._resolveMentionSearch = undefined;
      } else if (
        this._editor &&
        this.mentionsSearch !== 'managed' &&
        changed.get('mentions') !== undefined
      ) {
        // Re-render mentions already in the content with their new labels.
        this._destroyEditor();
        this._initializeEditor();
      }
    }
  }

  // ── Public methods ────────────────────────────────────────────────────────

  override focus() {
    if (this._editor && this._mode === 'visual') this._editor.commands.focus();
    else super.focus();
  }

  // ── Protected methods ─────────────────────────────────────────────────────

  /** `required` fails while the editor has no content, even an empty paragraph. */
  protected override computeValidity(): ControlValidity {
    const empty = this._editor
      ? this._editor.isEmpty
      : !(this.value ?? '').replace(/<[^>]*>/g, '').trim();
    if (this.required && empty && !this.disabled) {
      return {
        flags: { valueMissing: true },
        message: this.valueMissingText(),
      };
    }
    return { flags: {}, message: '' };
  }

  // ── Private methods ───────────────────────────────────────────────────────

  /** The editor's content as `value` holds it: normalized HTML, or `''` when empty. */
  private _editorValue(): string {
    if (!this._editor || this._editor.isEmpty) return '';
    return HtmlEditor._normalizeHtml(this._editor.getHTML());
  }

  /** The `placeholder`, or Peacock's default when it is empty. */
  private _placeholderText() {
    return this.placeholder || this.i18n.t('enterTextPlaceholder');
  }

  /** Whether mention text includes the suggestion character. */
  private _showSuggestionCharacter() {
    return !this.hideSuggestionCharacter;
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
        Mention.configure({
          HTMLAttributes: {
            class: 'mention',
          },
          renderHTML: ({ options, node }) => {
            const item = this._getMentionItem(node.attrs.id);
            return [
              'a',
              mergeAttributes(
                { contenteditable: false },
                options.HTMLAttributes,
              ),
              `${this._showSuggestionCharacter() ? options.suggestion.char : ''}${
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
                  item.label
                    .toLowerCase()
                    .startsWith(mentionQuery.toLowerCase()),
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

        const nextHtml = this._editorValue();
        if (nextHtml === this.value) return;
        this.value = nextHtml;
        this._dispatchDebouncedInput();
      },
      // The toolbar shows which marks are active at the selection.
      onTransaction: () => this.requestUpdate(),
    });

    this._editorEl.addEventListener('click', this._focusEditorOnContainerClick);
    // Render the toolbar, which needs the editor.
    this.requestUpdate();
  }

  private _focusEditorOnContainerClick = (event: Event) => {
    if (!this._editor) return;
    if (event.target === this._editorEl) {
      this._editor.commands.focus('end');
    }
  };

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

  private _requestManagedMentions(mentionQuery: string): Promise<string[]> {
    // A newer query replaces an unanswered one.
    this._resolveMentionSearch?.(this.mentions.map(item => item.value));
    return new Promise(resolve => {
      this._resolveMentionSearch = resolve;
      this.dispatchEvent(
        new CustomEvent<{ query: string }>('mention-search', {
          detail: { query: mentionQuery },
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
      this.value = this._editorValue();
    }

    this._mode = nextMode;
  }

  /** The source editor's `input`: take its value. */
  private _handleSourceInput(event: CustomEvent<{ value: string }>) {
    event.stopPropagation();
    const nextValue = event.detail?.value ?? '';
    if (nextValue === this.value) return;

    this.value = nextValue;
    this._dispatchDebouncedInput();
  }

  /** The source editor's own `change`; the editor commits when focus leaves it as a whole. */
  private _stopEvent(event: Event) {
    event.stopPropagation();
  }

  // ── Render helpers ────────────────────────────────────────────────────────

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

  private _renderToolbar() {
    if (!this._editor || this.hideToolbar || this._mode !== 'visual') {
      return nothing;
    }

    return html`
      <div
        class="html-editor-toolbar"
        role="toolbar"
        aria-label=${this.i18n.t('formattingToolbar')}
      >
        ${this._toolbarButton('undo', this.i18n.t('undo'), () =>
          this._editor?.commands.undo(),
        )}
        ${this._toolbarButton('redo', this.i18n.t('redo'), () =>
          this._editor?.commands.redo(),
        )}

        <span class="toolbar-divider"></span>

        ${this._toolbarButton(
          'format_bold',
          this.i18n.t('bold'),
          () => this._editor?.chain().focus().toggleBold().run(),
          this._editor.isActive('bold'),
        )}
        ${this._toolbarButton(
          'format_italic',
          this.i18n.t('italic'),
          () => this._editor?.chain().focus().toggleItalic().run(),
          this._editor.isActive('italic'),
        )}
        ${this._toolbarButton(
          'format_underlined',
          this.i18n.t('underline'),
          () => this._editor?.chain().focus().toggleUnderline().run(),
          this._editor.isActive('underline'),
        )}
        ${this._toolbarButton(
          'format_strikethrough',
          this.i18n.t('strikethrough'),
          () => this._editor?.chain().focus().toggleStrike().run(),
          this._editor.isActive('strike'),
        )}

        <span class="toolbar-divider"></span>

        ${this._toolbarButton(
          'format_list_bulleted',
          this.i18n.t('unorderedList'),
          () => this._editor?.chain().focus().toggleBulletList().run(),
          this._editor.isActive('bulletList'),
        )}
        ${this._toolbarButton(
          'format_list_numbered',
          this.i18n.t('orderedList'),
          () => this._editor?.chain().focus().toggleOrderedList().run(),
          this._editor.isActive('orderedList'),
        )}
      </div>
    `;
  }

  private _renderReadonlyTag() {
    if (this.disabled) {
      return html`<wc-tag class="read-only-tag" intent="danger"
        >${this.i18n.t('disabled')}</wc-tag
      >`;
    }
    if (this.readonly) {
      return html`<wc-tag class="read-only-tag" intent="danger"
        >${this.i18n.t('readOnlyTag')}</wc-tag
      >`;
    }
    return nothing;
  }

  // ── Render ────────────────────────────────────────────────────────────────

  render() {
    const isEmpty = !this.value || this.value === '<br>';
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
              ${this.i18n.t('visualMode')}
            </wc-segmented-button>
            <wc-segmented-button
              value="html"
              ?selected=${this._mode === 'html'}
              ?disabled=${this.disabled}
            >
              ${this.i18n.t('htmlMode')}
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
          data-placeholder=${this._placeholderText()}
          @input=${this._stopEvent}
          @beforeinput=${this._stopEvent}
        >
          <div class="tiptap-root"></div>
        </div>

        <div
          class=${classMap({
            'html-source': true,
            hidden: this._mode !== 'html',
          })}
        >
          <wc-code-editor
            language="html"
            size=${this.size}
            .value=${this.value}
            ?readonly=${this.readonly}
            ?disabled=${this.disabled}
            @input=${this._handleSourceInput}
            @change=${this._stopEvent}
          ></wc-code-editor>
        </div>

        ${this._renderReadonlyTag()}
      </wc-field>
    `;
  }
}
