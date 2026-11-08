import { html, LitElement, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import type { AiCitation } from '@/__internal/ai/types.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import type { PeacockStrings } from '@/__internal/i18n/strings.js';
import {
  formatAbsoluteTime,
  formatClockTime,
  parseDatetime,
} from '@/__internal/utils/relative-time.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './chat-message.scss';

/**
 * Who wrote a message: the person using the page (`user`), the assistant, or another person in
 * the conversation (`participant`), such as a caller or a teammate.
 */
export type ChatMessageFrom = 'user' | 'assistant' | 'participant';

/** What the person thought of an answer; `''` for nothing. */
export type ChatMessageFeedback = 'up' | 'down' | '';

/** `detail` of `feedback`. */
export interface ChatMessageFeedbackDetail {
  value: ChatMessageFeedback;
}

/** `detail` of `suggestion-select`. */
export interface ChatMessageSuggestionDetail {
  value: string;
}

/**
 * @label Chat Message
 * @tag wc-chat-message
 * @rawTag chat-message
 * @summary One turn of a conversation: what the person asked, another person's message, or the assistant's answer with its steps, drafts and sources.
 * @overview
 * <p>Put messages in <code>wc-chat-thread</code>. <code>from="user"</code> shows the person's text in
 * a bubble at the end of the line; <code>from="assistant"</code> (default) shows the answer as
 * formatted text; <code>from="participant"</code> shows another person's text, such as a caller's
 * or a teammate's, in a quiet bubble at the start of the line, with their name above it. All take
 * Markdown in <code>value</code>, rendered by <code>wc-markdown</code>, so mentions and
 * <code>[1](cite:id)</code> citations work; give the sources in <code>citations</code>.</p>
 * <p><strong>Who and when.</strong> A line above the message names <code>author</code> and adds
 * <code>channel</code> ("via Teams") and the time of <code>datetime</code>. It shows for a
 * participant, whenever <code>datetime</code> or <code>channel</code> is set, and when the
 * <code>meta</code> slot has content, such as a "Work note" tag. In a one-to-one conversation with
 * the assistant, leave them out and the messages stay bare.</p>
 * <p>While an answer arrives, set <code>streaming</code> and keep replacing <code>value</code>. Before
 * the first words, a typing indicator shows <code>status</code>, such as "Looking up your laptop…".
 * Put <code>wc-assistant-steps</code> in the <code>steps</code> slot, above the text, and
 * <code>wc-draft-card</code>s in the default slot, below it.</p>
 * <p>A finished answer has actions: copy, <strong>Try again</strong> (<code>regenerate</code>) and
 * good or bad (<code>feedback</code>, which toggles <code>feedback</code>). <code>hide-actions</code>
 * removes them. With <code>error</code> the message says the answer failed, with Try again.</p>
 * <p><strong>Quick replies.</strong> <code>suggestions</code> shows the likely next moves as chips
 * under the message ("Promote to major incident", "Why P2?"). Picking one fires
 * <code>suggestion-select</code>; the app sends it and usually clears the list.</p>
 * @tags display, ai
 *
 * @slot - Below the text, such as `wc-draft-card`s.
 * @slot steps - Above the text, such as `wc-assistant-steps`.
 * @slot avatar - Beside the message, such as a `wc-avatar`.
 * @slot meta - At the end of the line above the message, such as a "Work note" `wc-tag`.
 * @slot footer - Below everything.
 *
 * @csspart header - The line above the message with the author, channel and time.
 * @csspart bubble - The text bubble of the person or a participant.
 * @csspart content - The answer's text.
 * @csspart actions - The answer's actions.
 * @csspart suggestions - The quick replies.
 *
 * @cssprop --chat-message-bubble-background - Background of the person's bubble.
 * @cssprop --chat-message-bubble-color - Text color of the person's bubble.
 * @cssprop --chat-message-participant-background - Background of a participant's bubble.
 * @cssprop --chat-message-participant-color - Text color of a participant's bubble.
 *
 * @fires {CustomEvent<void>} regenerate - The person asked for the answer again.
 * @fires {CustomEvent<ChatMessageFeedbackDetail>} feedback - The person rated the answer, or took the rating back (`value: ''`).
 * @fires {CustomEvent<ChatMessageSuggestionDetail>} suggestion-select - The person picked a quick reply.
 *
 * @example
 * ```html
 * <wc-chat-message from="user" value="Will I get a loaner before Friday?"></wc-chat-message>
 * <wc-chat-message value="Desk support has **2 loaners** free."></wc-chat-message>
 * ```
 * @example
 * ```html
 * <wc-chat-message from="participant" author="Priya Shah" channel="Teams"
 *   datetime="2026-11-08T09:41:00" value="VPN keeps dropping every ten minutes."></wc-chat-message>
 * ```
 */
@IndividualComponent
export class ChatMessage extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** Who wrote it: the person (`user`), the assistant (`assistant`, default) or another person (`participant`). */
  @property({ type: String, reflect: true }) from: ChatMessageFrom =
    'assistant';

  /** Name shown above a participant's message and read before every message; defaults to "You", "Assistant" or "Participant". */
  @property({ type: String }) author = '';

  /** When it was written, as an ISO 8601 date-time; shown as a time above the message. */
  @property({ type: String }) datetime = '';

  /** Where it came from, such as "Teams"; shown as "via Teams" above the message. */
  @property({ type: String }) channel = '';

  /** The text, as Markdown. */
  @property({ type: String }) value = '';

  /** The answer is still arriving. Reflected, so `wc-chat-thread` can announce it once complete. */
  @property({ type: Boolean, reflect: true }) streaming = false;

  /** What is happening before the first words, such as "Looking up your laptop…". */
  @property({ type: String }) status = '';

  /** The answer failed. */
  @property({ type: Boolean, reflect: true }) error = false;

  /** What went wrong; defaults to "The assistant couldn't answer." */
  @property({ type: String, attribute: 'error-text' }) errorText = '';

  /** The sources `[n](cite:id)` links refer to. */
  @property({ attribute: false }) citations: AiCitation[] = [];

  /** Address of a cited source not in `citations`; `{id}` is replaced by its id. */
  @property({ type: String, attribute: 'citation-href' }) citationHref = '';

  /** The person's rating of the answer. */
  @property({ type: String, reflect: true }) feedback: ChatMessageFeedback = '';

  /** Removes copy, Try again and the rating from an answer. */
  @property({ type: Boolean, attribute: 'hide-actions' }) hideActions = false;

  /** Quick replies shown as chips under the message once it is complete. */
  @property({ attribute: false }) suggestions: string[] = [];

  /** Locale for the time; defaults to the nearest `lang`, else the browser's. */
  @property({ type: String }) locale?: string;

  /** Per-instance string overrides. */
  @property({ attribute: false }) strings?: Partial<PeacockStrings>;

  // ── State ────────────────────────────────────────────────────────────────

  /** The `meta` slot has content. */
  @state() private _hasMeta = false;

  // ── Private fields ───────────────────────────────────────────────────────

  private readonly i18n = new I18nController(this);

  // ── Public methods ───────────────────────────────────────────────────────

  /** The name read before the message. */
  get authorName(): string {
    if (this.author) return this.author;
    if (this.from === 'user') return this.i18n.t('chatYou');
    if (this.from === 'participant') return this.i18n.t('chatParticipant');
    return this.i18n.t('chatAssistant');
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private _onMetaChange(event: Event) {
    this._hasMeta =
      (event.target as HTMLSlotElement).assignedNodes({ flatten: true })
        .length > 0;
  }

  private _pick(value: string) {
    this.dispatchEvent(
      new CustomEvent<ChatMessageSuggestionDetail>('suggestion-select', {
        detail: { value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private regenerate = () => {
    this.dispatchEvent(
      new CustomEvent('regenerate', { bubbles: true, composed: true }),
    );
  };

  private rate(value: 'up' | 'down') {
    this.feedback = this.feedback === value ? '' : value;
    this.dispatchEvent(
      new CustomEvent<ChatMessageFeedbackDetail>('feedback', {
        detail: { value: this.feedback },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private renderText() {
    if (!this.value && this.streaming) {
      return html`<wc-typing-indicator
        label=${this.status || this.i18n.t('typingThinking')}
      ></wc-typing-indicator>`;
    }
    if (!this.value) return nothing;
    return html`<wc-markdown
      class="text"
      size="sm"
      ?streaming=${this.streaming}
      .value=${this.value}
      .citations=${this.citations}
      citation-href=${this.citationHref}
    ></wc-markdown>`;
  }

  private renderError() {
    if (!this.error) return nothing;
    return html`<div class="error" role="alert">
      <wc-icon name="error" aria-hidden="true"></wc-icon>
      <span class="error-text"
        >${this.errorText || this.i18n.t('chatFailed')}</span
      >
      <wc-button size="sm" variant="text" @click=${this.regenerate}
        >${this.i18n.t('chatRegenerate')}</wc-button
      >
    </div>`;
  }

  private renderActions() {
    if (
      this.from !== 'assistant' ||
      this.hideActions ||
      this.streaming ||
      this.error ||
      !this.value
    ) {
      return nothing;
    }
    const { i18n } = this;
    return html`<div class="actions" part="actions">
      <wc-copy-button
        .value=${this.value}
        label=${i18n.t('chatCopy')}
      ></wc-copy-button>
      <wc-icon-button
        variant="text"
        shape="round"
        size="sm"
        aria-label=${i18n.t('chatRegenerate')}
        tooltip=${i18n.t('chatRegenerate')}
        @click=${this.regenerate}
        ><wc-icon name="refresh"></wc-icon
      ></wc-icon-button>
      <wc-icon-button
        variant="text"
        shape="round"
        size="sm"
        toggle
        ?selected=${this.feedback === 'up'}
        aria-label=${i18n.t('chatGoodAnswer')}
        tooltip=${i18n.t('chatGoodAnswer')}
        @click=${() => this.rate('up')}
        ><wc-icon name="thumb_up"></wc-icon
      ></wc-icon-button>
      <wc-icon-button
        variant="text"
        shape="round"
        size="sm"
        toggle
        ?selected=${this.feedback === 'down'}
        aria-label=${i18n.t('chatBadAnswer')}
        tooltip=${i18n.t('chatBadAnswer')}
        @click=${() => this.rate('down')}
        ><wc-icon name="thumb_down"></wc-icon
      ></wc-icon-button>
    </div>`;
  }

  private renderHeader() {
    const date = parseDatetime(this.datetime);
    const shown =
      this.from === 'participant' || !!date || !!this.channel || this._hasMeta;
    const { locale } = this.i18n;
    return html`<div class="header" part="header" ?hidden=${!shown}>
      <span class="author">${this.authorName}</span>
      ${this.channel
        ? html`<span class="channel"
            >${this.i18n.t('chatVia')(this.channel)}</span
          >`
        : nothing}
      ${date
        ? html`<time
            class="time"
            datetime=${this.datetime}
            title=${formatAbsoluteTime(date, locale)}
            >${formatClockTime(date, locale)}</time
          >`
        : nothing}
      <slot name="meta" @slotchange=${this._onMetaChange}></slot>
    </div>`;
  }

  private renderSuggestions() {
    if (!this.suggestions.length || this.streaming || this.error) {
      return nothing;
    }
    return html`<div
      class="suggestions"
      part="suggestions"
      role="group"
      aria-label=${this.i18n.t('chatQuickReplies')}
    >
      ${this.suggestions.map(
        suggestion =>
          html`<wc-chip @click=${() => this._pick(suggestion)}
            >${suggestion}</wc-chip
          >`,
      )}
    </div>`;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const { from } = this;
    const bubble = from !== 'assistant';
    return html`<article
      class=${classMap({
        message: true,
        user: from === 'user',
        participant: from === 'participant',
        assistant: from === 'assistant',
      })}
      aria-label=${this.authorName}
      aria-busy=${this.streaming ? 'true' : nothing}
    >
      <slot name="avatar"></slot>
      <div class="body">
        ${this.renderHeader()}
        <slot name="steps"></slot>
        ${bubble
          ? html`<div class="bubble" part="bubble">${this.renderText()}</div>`
          : html`<div class="content" part="content">
              ${this.renderText()}
            </div>`}
        <slot></slot>
        ${this.renderError()} ${this.renderActions()}
        ${this.renderSuggestions()}
        <slot name="footer"></slot>
      </div>
    </article>`;
  }
}
