import { html, LitElement, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';

import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import type { PeacockStrings } from '@/__internal/i18n/strings.js';
import IndividualComponent from '@/IndividualComponent.js';
import type { ChatMessage } from '../chat-message/chat-message.js';
import styles from './chat-thread.scss';

/** `detail` of `suggestion-select`. */
export interface ChatThreadSuggestionDetail {
  value: string;
}

/** How close to the end, in pixels, still counts as reading the latest message. */
const PINNED_SLACK = 48;

/** An answer's Markdown as plain text, for the announcement. */
function plainText(markdown: string): string {
  return markdown
    .replace(/\[([^\]]*)\]\(cite:[^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`~#>]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * @label Chat Thread
 * @tag wc-chat-thread
 * @rawTag chat-thread
 * @summary The scrolling log of a conversation: keeps the latest message in view and announces finished answers.
 * @overview
 * <p>Holds <code>wc-chat-message</code>s, oldest first. It fills its container and scrolls; while
 * the person reads the end, new messages and growing answers stay in view. Scrolling up stops that,
 * and a <strong>Jump to latest</strong> button appears.</p>
 * <p>It is a log (<code>role="log"</code>), but not a live region of its own: streaming text would be
 * read word by word. Instead, an assistant answer is announced once, when it is complete (its
 * <code>streaming</code> turns off), as "Assistant: …".</p>
 * <p>Before the first message it shows the <code>empty</code> slot and <code>suggestions</code>: prompt
 * starters as chips that fire <code>suggestion-select</code>.</p>
 * @tags display, ai
 *
 * @slot - The `wc-chat-message`s.
 * @slot empty - Shown while there are no messages, above the suggestions.
 *
 * @csspart scroller - The scrolling area.
 * @csspart jump - The Jump to latest button.
 *
 * @cssprop --chat-thread-gap - Space between messages.
 * @cssprop --chat-thread-padding - Padding of the scrolling area.
 *
 * @fires {CustomEvent<ChatThreadSuggestionDetail>} suggestion-select - The person picked a prompt starter.
 *
 * @example
 * ```html
 * <wc-chat-thread style="height: 24rem">
 *   <wc-chat-message from="user" value="What's waiting for me?"></wc-chat-message>
 *   <wc-chat-message value="Two things need you today."></wc-chat-message>
 * </wc-chat-thread>
 * ```
 */
@IndividualComponent
export class ChatThread extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** Accessible name of the log; defaults to "Conversation". */
  @property({ type: String }) label = '';

  /** Prompt starters shown before the first message. */
  @property({ attribute: false }) suggestions: string[] = [];

  /** Per-instance string overrides. */
  @property({ attribute: false }) strings?: Partial<PeacockStrings>;

  // ── State ────────────────────────────────────────────────────────────────

  @state() private _empty = true;

  @state() private _pinned = true;

  @state() private _announcement = '';

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('.scroller') private _scroller?: HTMLElement;

  @query('.content') private _content?: HTMLElement;

  // ── Private fields ───────────────────────────────────────────────────────

  private readonly i18n = new I18nController(this);

  private _resize?: ResizeObserver;

  private _mutations?: MutationObserver;

  /** Set while Jump to latest scrolls smoothly to the end. */
  private _seeking = false;

  /** Messages already announced or present from the start, which are not announced. */
  private readonly _settled = new WeakSet<Element>();

  // ── Lifecycle ────────────────────────────────────────────────────────────

  connectedCallback() {
    super.connectedCallback();
    this._mutations = new MutationObserver(records =>
      this._onMutations(records),
    );
    this._mutations.observe(this, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['streaming'],
    });
    // Messages already here are history, not news.
    for (const message of this._messages()) this._settled.add(message);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._mutations?.disconnect();
    this._resize?.disconnect();
  }

  protected firstUpdated() {
    // New content and a resized thread (a rotated phone, a resized window) both keep the end in view.
    this._resize = new ResizeObserver(() => {
      if (this._pinned) this._toBottom('instant');
    });
    if (this._content) this._resize.observe(this._content);
    if (this._scroller) this._resize.observe(this._scroller);
    this._toBottom('instant');
  }

  // ── Public methods ───────────────────────────────────────────────────────

  /** Scrolls to the latest message and keeps it in view again. */
  scrollToLatest(behavior: 'smooth' | 'instant' = 'smooth') {
    this._pinned = true;
    this._seeking = behavior === 'smooth';
    this._toBottom(behavior);
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private _messages(): ChatMessage[] {
    return Array.from(
      this.querySelectorAll<ChatMessage>(':scope > wc-chat-message'),
    );
  }

  /**
   * Scrolls to the end. Following new content is `instant`, never the page's CSS
   * `scroll-behavior`: a smooth scroll's in-between positions would read as the reader scrolling
   * up.
   */
  private _toBottom(behavior: 'smooth' | 'instant') {
    const scroller = this._scroller;
    if (!scroller) return;
    scroller.scrollTo({ top: scroller.scrollHeight, behavior });
  }

  private _onScroll() {
    const scroller = this._scroller;
    if (!scroller) return;
    const distance =
      scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
    const atEnd = distance <= PINNED_SLACK;
    // While Jump to latest scrolls smoothly, its own steps are not the reader scrolling up.
    if (this._seeking) {
      if (atEnd) this._seeking = false;
      return;
    }
    this._pinned = atEnd;
  }

  private _onSlotChange(event: Event) {
    const slot = event.target as HTMLSlotElement;
    this._empty = !slot
      .assignedElements({ flatten: true })
      .some(element => element.localName === 'wc-chat-message');
    if (this._pinned) this.updateComplete.then(() => this._toBottom('instant'));
  }

  /** Announces assistant answers once they are complete. */
  private _onMutations(records: MutationRecord[]) {
    const finished = new Set<ChatMessage>();
    for (const record of records) {
      if (record.type === 'attributes') {
        finished.add(record.target as ChatMessage);
      } else {
        record.addedNodes.forEach(node => {
          if ((node as Element).localName === 'wc-chat-message') {
            finished.add(node as ChatMessage);
          }
        });
      }
    }
    // A message just added reflects `streaming` only after its first update; look then.
    for (const message of finished) {
      Promise.resolve(message.updateComplete).then(() =>
        this._announce(message),
      );
    }
  }

  private _announce(message: ChatMessage) {
    const ready =
      message.parentElement === this &&
      message.from !== 'user' &&
      !message.streaming &&
      !this._settled.has(message);
    if (!ready) return;
    const text = message.error
      ? message.errorText || this.i18n.t('chatFailed')
      : plainText(message.value);
    // Nothing to say yet: an empty message is announced once it has words.
    if (!text) return;
    this._settled.add(message);
    this._announcement = this.i18n.t('chatAnnouncement')(
      message.authorName,
      text,
    );
  }

  private _pick(value: string) {
    this.dispatchEvent(
      new CustomEvent<ChatThreadSuggestionDetail>('suggestion-select', {
        detail: { value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const label = this.label || this.i18n.t('chatLog');
    return html`<div
        class="scroller"
        part="scroller"
        role="log"
        aria-live="off"
        aria-label=${label}
        tabindex="0"
        @scroll=${this._onScroll}
      >
        <div class="content">
          <slot @slotchange=${this._onSlotChange}></slot>
          <div class="empty" ?hidden=${!this._empty}>
            <slot name="empty"></slot>
            ${this.suggestions.length
              ? html`<div class="suggestions">
                  ${this.suggestions.map(
                    suggestion =>
                      html`<wc-chip @click=${() => this._pick(suggestion)}
                        >${suggestion}</wc-chip
                      >`,
                  )}
                </div>`
              : nothing}
          </div>
        </div>
      </div>
      ${this._pinned || this._empty
        ? nothing
        : html`<wc-button
            class="jump"
            part="jump"
            variant="tonal"
            size="sm"
            @click=${() => this.scrollToLatest()}
            ><wc-icon slot="icon" name="arrow_downward"></wc-icon>${this.i18n.t(
              'chatJumpToLatest',
            )}</wc-button
          >`}
      <div class="screen-reader-only" role="status" aria-live="polite">
        ${this._announcement}
      </div>`;
  }
}
