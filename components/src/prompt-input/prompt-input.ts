import { html, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { Extension, type Editor, type Extensions } from '@tiptap/core';

import IndividualComponent from '@/IndividualComponent.js';
import RichTextInput, {
  type RichTextContent,
} from '@/__internal/rich-text/rich-text-input.js';
import { extractMentions } from '@/__internal/rich-text/markdown-lexer.js';
import type { RichTextMention } from '@/__internal/rich-text/mention.js';

import styles from './prompt-input.scss';

/** `detail` of `submit`: the text and the records or people it mentions. */
export interface PromptInputSubmitDetail {
  value: string;
  mentions: RichTextMention[];
}

/**
 * @label Prompt Input
 * @tag wc-prompt-input
 * @rawTag prompt-input
 *
 * @summary The box for writing to the assistant: plain text with mentions, sent with Enter, with a Stop button while the answer arrives.
 * @overview
 * <p>Where people ask the assistant for something, at the bottom of <code>wc-assistant-panel</code>
 * (ADR-030002). It is plain text, no formatting: Enter sends, Shift+Enter starts a new line, and the
 * box grows up to <code>max-rows</code> lines.</p>
 * <p>Sending fires a cancelable <code>submit</code> with the text in <code>detail.value</code> and
 * its mentions in <code>detail.mentions</code>, then empties the box unless the event is cancelled.
 * While <code>loading</code> (the answer is arriving), the send button becomes <strong>Stop</strong>,
 * which fires <code>stop</code>, and Enter does not send.</p>
 * <p>Mentions point the assistant at records: with <code>triggers="@"</code> (the default), typing
 * <code>@</code> fires <code>search</code>; answer by setting <code>suggestions</code>, as on
 * <code>wc-mention-input</code>. Add <code>/</code> to <code>triggers</code> for commands. A mention
 * is stored as <code>[@INC-2318](mention:inc_2318)</code>.</p>
 * <p>Put an attach button in the <code>start</code> slot and the attached files, as chips, in the
 * <code>attachments</code> slot above the text.</p>
 *
 * @slot start - Before the text, such as an attach button.
 * @slot attachments - Above the text, such as chips for attached files.
 *
 * @cssprop --prompt-input-background - Background of the box.
 *
 * @fires {CustomEvent<PromptInputSubmitDetail>} submit - Cancelable. The person sent the text; cancel it to keep the text in the box.
 * @fires {CustomEvent<void>} stop - The person pressed Stop while `loading`.
 * @fires {CustomEvent<{value: string}>} input - Dispatched as the text changes, after `debounce` milliseconds without typing.
 * @fires {CustomEvent<{value: string}>} change - Dispatched when focus leaves after an edit.
 * @fires {CustomEvent<{trigger: string, query: string}>} search - Dispatched as a mention is typed; answer with `suggestions`.
 * @fires {CustomEvent<{mention: {id: string, label: string, trigger: string}, suggestion: MentionSuggestion}>} mention - Dispatched when a suggestion is inserted as a mention.
 *
 * @example
 * ```html
 * <wc-prompt-input placeholder="Ask for something"></wc-prompt-input>
 * ```
 * @tags input, ai
 */
@IndividualComponent
export class PromptInput extends RichTextInput {
  // ── Static ────────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ────────────────────────────────────────────────────────────

  /** The answer is arriving: the send button becomes Stop and Enter does not send. */
  @property({ type: Boolean, reflect: true })
  loading = false;

  // ── Protected fields ──────────────────────────────────────────────────────

  protected readonly profile = 'prompt' as const;

  protected readonly sourceLanguage = 'markdown' as const;

  protected readonly sourceIcon = 'markdown';

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  constructor() {
    super();
    this.rows = 1;
    this.maxRows = 6;
  }

  // ── Public methods ────────────────────────────────────────────────────────

  /** Sends the text, as Enter does. */
  submit() {
    const value = this.currentValue();
    if (!value.trim() || this.loading || this.disabled || this.readonly) {
      return;
    }
    const accepted = this.dispatchEvent(
      new CustomEvent<PromptInputSubmitDetail>('submit', {
        detail: { value, mentions: extractMentions(value) },
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
    if (accepted) this.clear();
  }

  /** Empties the box. */
  clear() {
    this.value = '';
  }

  // ── Protected methods ─────────────────────────────────────────────────────

  protected get showBlockHandle(): boolean {
    return false;
  }

  protected get slashMenu(): boolean {
    return false;
  }

  protected get selectionBubble(): boolean {
    return false;
  }

  protected readFromEditor(editor: Editor): string {
    return this.isEditorEmpty(editor) ? '' : editor.getMarkdown();
  }

  protected contentFor(value: string): RichTextContent {
    return { content: value ?? '', contentType: 'markdown' };
  }

  protected defaultPlaceholder(): string {
    return this.i18n.t('promptPlaceholder');
  }

  protected extraExtensions(): Extensions {
    return [
      Extension.create({
        name: 'peacockPromptKeys',
        addKeyboardShortcuts: () => ({
          Enter: () => {
            // A mention being picked takes Enter first.
            if (this.mentions.visible) return false;
            this.submit();
            return true;
          },
          'Shift-Enter': ({ editor }) => editor.commands.splitBlock(),
        }),
      }),
    ];
  }

  // ── Private methods ───────────────────────────────────────────────────────

  /** The value, including typing the editor has not reported yet. */
  private currentValue(): string {
    const { editor } = this;
    return editor
      ? this.normalizeValue(this.readFromEditor(editor))
      : this.value;
  }

  private onStop = () => {
    this.dispatchEvent(
      new CustomEvent('stop', { bubbles: true, composed: true }),
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────

  private renderAction() {
    const { i18n } = this;
    if (this.loading) {
      return html`<wc-icon-button
        class="action stop"
        variant="filled"
        shape="round"
        size="sm"
        aria-label=${i18n.t('promptStop')}
        tooltip=${i18n.t('promptStop')}
        @click=${this.onStop}
        ><wc-icon name="stop"></wc-icon
      ></wc-icon-button>`;
    }
    const empty = !this.value.trim();
    return html`<wc-icon-button
      class="action send"
      variant="filled"
      shape="round"
      size="sm"
      aria-label=${i18n.t('promptSend')}
      tooltip=${i18n.t('promptSend')}
      ?disabled=${empty || this.disabled || this.readonly}
      @mousedown=${this.keepSelection}
      @click=${() => this.submit()}
      ><wc-icon name="arrow_upward"></wc-icon
    ></wc-icon-button>`;
  }

  render() {
    const { validationText } = this;
    return html`<div
        class=${classMap({
          prompt: true,
          focused: this.editorFocused,
          invalid: this.error || !!validationText,
          disabled: this.disabled,
        })}
      >
        <slot name="attachments"></slot>
        <div class="row">
          <slot name="start"></slot>
          <div class="text max-rows">${this.renderEditorArea()}</div>
          ${this.renderAction()}
        </div>
      </div>
      ${validationText || (this.error && this.errorText)
        ? html`<div class="error-text" role="alert">
            ${this.error ? this.errorText : validationText}
          </div>`
        : nothing}
      ${this.helperText
        ? html`<div class="helper-text">${this.helperText}</div>`
        : nothing}
      ${this.renderPopups()}`;
  }
}
