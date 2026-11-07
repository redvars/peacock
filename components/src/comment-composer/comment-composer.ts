import { html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { Extension, type Editor, type Extensions } from '@tiptap/core';

import IndividualComponent from '@/IndividualComponent.js';
import RichTextInput, {
  type RichTextContent,
} from '@/__internal/rich-text/rich-text-input.js';
import type { BlockCommand } from '@/__internal/rich-text/commands.js';
import { extractMentions } from '@/__internal/rich-text/markdown-lexer.js';
import type { RichTextMention } from '@/__internal/rich-text/mention.js';

import styles from './comment-composer.scss';

/** `detail` of `submit`: the Markdown and the mentions in it. */
export interface CommentComposerSubmitDetail {
  value: string;
  mentions: RichTextMention[];
}

/**
 * @label Comment Composer
 * @tag wc-comment-composer
 * @rawTag comment-composer
 *
 * @summary A box for writing a comment in rich text, with mentions, that sends it with a button or Ctrl+Enter.
 * @overview
 * <p>The composer is where people write a comment or a work note, such as at the bottom of a ticket's
 * discussion. It starts as a one-line box; focusing it opens the editor and a footer with the
 * formatting tools and <strong>Send</strong>. Comments are Markdown: bold, italic, strikethrough,
 * code, links, lists, checklists, quotes and code blocks, but no headings or tables.</p>
 *
 * <p><strong>Send</strong> or Ctrl+Enter (Cmd+Enter on a Mac) fires a cancelable
 * <code>submit</code> with the Markdown in <code>detail.value</code> and the people it mentions in
 * <code>detail.mentions</code>. Unless the event is cancelled the composer empties; cancel it to keep
 * the text, for example while a request fails. Set <code>loading</code> while the comment is being
 * saved. <code>dismissible</code> adds a <strong>Cancel</strong> button, and Escape, that empty the
 * composer and fire <code>cancel</code>; use it for reply and edit composers.</p>
 *
 * <p>Mentions work as on <code>wc-markdown-editor</code>: answer <code>search</code> by setting
 * <code>suggestions</code>. Inside <code>wc-discussion</code>, set the suggestions on the discussion
 * instead and it passes them to whichever composer asked.</p>
 *
 * <p>Put controls of your own in the footer with the <code>start</code> slot, such as a select for
 * <em>Comment</em> or <em>Work note</em>, or an attach button, and an avatar before the box with
 * the <code>avatar</code> slot. The composer is form-associated, so it also works as the
 * "Additional comments" field of a form.</p>
 *
 * @slot avatar - Shown before the box, such as the current person's `wc-avatar`.
 * @slot start - Controls in the footer after the formatting tools, such as a visibility select or an attach button.
 *
 * @cssprop --comment-composer-background - Background of the box.
 * @cssprop --prose-mention-background - Background of mention chips.
 * @cssprop --prose-mention-color - Text color of mention chips.
 * @cssprop --mention-list-width - Width of the mention suggestion list.
 *
 * @fires {CustomEvent<{value: string, mentions: {id: string, label: string, trigger: string}[]}>} submit - Cancelable. The person sent the comment.
 * @fires {CustomEvent} cancel - The person pressed Cancel or Escape in a `dismissible` composer.
 * @fires {CustomEvent<{value: string}>} input - Dispatched as the content changes, after `debounce` milliseconds without typing.
 * @fires {CustomEvent<{value: string}>} change - Dispatched when focus leaves after an edit.
 * @fires {CustomEvent<{trigger: string, query: string}>} search - Dispatched as a mention is typed; answer with `suggestions`.
 * @fires {CustomEvent<{mention: {id: string, label: string, trigger: string}, suggestion: MentionSuggestion}>} mention - Dispatched when a suggestion is inserted as a mention.
 *
 * @example
 * ```html
 * <wc-comment-composer placeholder="Add a comment"></wc-comment-composer>
 * ```
 * @tags input editor collaboration
 */
@IndividualComponent
export class CommentComposer extends RichTextInput {
  // ── Static ────────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ────────────────────────────────────────────────────────────

  /** Text of the send button. Defaults to "Send". */
  @property({ type: String, attribute: 'submit-label' })
  submitLabel = '';

  /** Shows the comment is being saved: Send shows progress and does nothing. */
  @property({ type: Boolean, reflect: true })
  loading = false;

  /** Keeps the composer open even when it is empty and not focused. */
  @property({ type: Boolean, reflect: true })
  expanded = false;

  /** Adds a Cancel button, and Escape, that empty the composer and fire `cancel`. */
  @property({ type: Boolean })
  dismissible = false;

  // ── State ─────────────────────────────────────────────────────────────────

  /** Whether focus is in the composer. */
  @state() private active = false;

  // ── Protected fields ──────────────────────────────────────────────────────

  protected readonly profile = 'comment' as const;

  protected readonly sourceLanguage = 'markdown' as const;

  protected readonly sourceIcon = 'markdown';

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  constructor() {
    super();
    this.rows = 3;
    this.addEventListener('focusin', () => {
      this.active = true;
    });
    this.addEventListener('focusout', (event: FocusEvent) => {
      const next = event.relatedTarget as Node | null;
      if (next && (next === this || this.contains(next))) return;
      this.active = false;
    });
  }

  // ── Public methods ────────────────────────────────────────────────────────

  /** Sends the comment, as Send does. */
  submit() {
    const value = this.currentValue();
    if (!value.trim() || this.loading || this.disabled || this.readonly) {
      return;
    }
    const accepted = this.dispatchEvent(
      new CustomEvent<CommentComposerSubmitDetail>('submit', {
        detail: { value, mentions: extractMentions(value) },
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
    if (accepted) this.clear();
  }

  /** Empties the composer. */
  clear() {
    this.value = '';
  }

  // ── Protected methods ─────────────────────────────────────────────────────

  protected get showBlockHandle(): boolean {
    return false;
  }

  protected readFromEditor(editor: Editor): string {
    return this.isEditorEmpty(editor) ? '' : editor.getMarkdown();
  }

  protected contentFor(value: string): RichTextContent {
    return { content: value ?? '', contentType: 'markdown' };
  }

  protected defaultPlaceholder(): string {
    return this.i18n.t('commentComposerLabel');
  }

  /** A comment has no use for a divider. */
  protected toolbarBlocks(editor: Editor): BlockCommand[] {
    return super.toolbarBlocks(editor).filter(block => block.id !== 'divider');
  }

  protected extraExtensions(): Extensions {
    return [
      Extension.create({
        name: 'peacockComposerKeys',
        addKeyboardShortcuts: () => ({
          'Mod-Enter': () => {
            this.submit();
            return true;
          },
          Escape: () => {
            if (
              !this.dismissible ||
              this.mentions.visible ||
              this.slash.visible
            ) {
              return false;
            }
            this.cancel();
            return true;
          },
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

  private get open(): boolean {
    return this.expanded || this.active || !!this.value.trim();
  }

  private cancel = () => {
    this.clear();
    this.dispatchEvent(
      new CustomEvent('cancel', { bubbles: true, composed: true }),
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────

  render() {
    const { editor, open, validationText } = this;
    const canSend =
      !!this.value.trim() && !this.disabled && !this.readonly && !this.loading;
    return html`<div
        class=${classMap({
          composer: true,
          open,
          focused: this.editorFocused,
          invalid: this.error || !!validationText,
        })}
      >
        <slot name="avatar"></slot>
        <div class="box">
          ${this.renderEditorArea()}
          <div class="footer" ?hidden=${!open}>
            ${editor && !this.hideToolbar
              ? html`<wc-toolbar
                  class="toolbar"
                  variant="flat"
                  aria-label=${this.i18n.t('formattingToolbar')}
                  @mousedown=${this.keepSelection}
                  >${this.renderTools(editor)}</wc-toolbar
                >`
              : nothing}
            <slot name="start"></slot>
            <span class="spacer"></span>
            ${this.dismissible
              ? html`<wc-button
                  class="cancel"
                  variant="text"
                  size="sm"
                  ?disabled=${this.loading}
                  @click=${this.cancel}
                  >${this.i18n.t('commentCancel')}</wc-button
                >`
              : nothing}
            <wc-button
              class="send"
              size="sm"
              ?loading=${this.loading}
              ?disabled=${!canSend}
              @click=${() => this.submit()}
              >${this.submitLabel || this.i18n.t('commentSend')}</wc-button
            >
          </div>
        </div>
      </div>
      ${validationText || (this.error && this.errorText)
        ? html`<div class="error-text" role="alert">
            ${this.error ? this.errorText : validationText}
          </div>`
        : nothing}
      ${this.renderPopups()}`;
  }
}
