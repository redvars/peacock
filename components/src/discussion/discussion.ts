import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';

import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import type { MentionSuggestion } from '../mention-input/mention-model.js';
import { CommentComposer } from '../comment-composer/comment-composer.js';
import type { CommentComposerSubmitDetail } from '../comment-composer/comment-composer.js';
import { DiscussionActivity } from './discussion-activity.js';
import {
  DiscussionComment,
  type DiscussionSubmitDetail,
} from './discussion-comment.js';

import styles from './discussion.scss';

type Entry = DiscussionComment | DiscussionActivity;

/**
 * @label Discussion
 * @tag wc-discussion
 * @rawTag discussion
 *
 * @summary The discussion of a record, such as a ticket: comments with replies, activity entries and a rich-text composer with mentions.
 * @overview
 * <p>A discussion holds <code>wc-discussion-comment</code> and <code>wc-discussion-activity</code>
 * elements in the order the app gives them (oldest or newest first), and a
 * <code>wc-comment-composer</code> under them. The app owns the data: it renders the entries and
 * changes them in answer to the events, which all bubble, so one listener on the discussion hears
 * them.</p>
 *
 * <ul>
 * <li><code>submit</code> (cancelable) with <code>{ value, mentions, parentId }</code>: a new
 * comment from the composer (<code>parentId</code> null) or a reply. Cancel it to keep the text in
 * the composer.</li>
 * <li><code>edit</code> (cancelable), <code>delete</code>, <code>reply</code> and
 * <code>copy-link</code>, from the comments.</li>
 * <li><code>search</code> with <code>{ trigger, query }</code> from any composer, the main one or a
 * reply or edit composer. Answer by setting <code>suggestions</code> (and
 * <code>suggestions-loading</code>) on the discussion; it passes them to the composer that
 * asked.</li>
 * </ul>
 *
 * <p>Put your own <code>wc-comment-composer</code> in the <code>composer</code> slot to add footer
 * controls (a <em>Comment</em> / <em>Work note</em> select, an attach button) or an avatar.
 * <code>readonly</code> hides the composer, Reply and Edit. <code>triggers</code> and
 * <code>mention-href</code> pass down to every comment and composer. <code>loading</code> shows
 * placeholder rows; without entries the discussion says "No comments yet" (replace it with the
 * <code>empty</code> slot). The <code>header</code> slot sits above the entries, for a title, a
 * count or a sort control.</p>
 *
 * <p>Accessibility: the entries sit in a <code>role="feed"</code> named by <code>label</code>
 * ("Comments" by default). Page Down and Page Up move focus between entries and Ctrl+End to the
 * composer. A comment added after the discussion has loaded is announced politely.</p>
 *
 * @slot - The entries: `wc-discussion-comment` and `wc-discussion-activity` elements.
 * @slot header - Above the entries, such as a title and a count.
 * @slot summary - Between the header and the entries, such as a `wc-ai-summary` of a long thread.
 * @slot composer - Replaces the built-in composer with your own `wc-comment-composer`.
 * @slot empty - Replaces the "No comments yet" message.
 *
 * @fires {CustomEvent<{value: string, mentions: object[], parentId: string | null}>} submit - Cancelable. A new comment or a reply.
 *
 * @example
 * ```html
 * <wc-discussion>
 *   <wc-discussion-activity author="Ana Lima" datetime="2026-11-07T08:00:00Z" value="opened the ticket"></wc-discussion-activity>
 *   <wc-discussion-comment comment-id="1" author="Ravi Kumar" datetime="2026-11-07T09:30:00Z" value="Looking into it."></wc-discussion-comment>
 * </wc-discussion>
 * ```
 * @tags collaboration
 */
@IndividualComponent
export class Discussion extends LitElement {
  // ── Static ────────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ────────────────────────────────────────────────────────────

  /** Accessible name of the feed. Defaults to "Comments". */
  @property({ type: String })
  label = '';

  /** Shows placeholder rows while the entries load. */
  @property({ type: Boolean, reflect: true })
  loading = false;

  /** Hides the composer, Reply and Edit. */
  @property({ type: Boolean, reflect: true })
  readonly = false;

  /** Placeholder of the built-in composer. Defaults to "Add a comment". */
  @property({ type: String })
  placeholder = '';

  /** Mention triggers of every composer; empty turns mentions off. */
  @property({ type: String })
  triggers = '@';

  /** Address mentions link to, with `{id}`; passed to every entry. */
  @property({ type: String, attribute: 'mention-href' })
  mentionHref = '';

  /** Suggestions for the mention being typed in any composer; set them in answer to `search`. */
  @property({ attribute: false })
  suggestions: MentionSuggestion[] = [];

  /** Whether the app is still looking for suggestions. */
  @property({ type: Boolean, attribute: 'suggestions-loading' })
  suggestionsLoading = false;

  // ── State ─────────────────────────────────────────────────────────────────

  @state() private empty = true;

  @state() private announcement = '';

  // ── Queries ───────────────────────────────────────────────────────────────

  @query('slot[name="composer"]')
  private composerSlot?: HTMLSlotElement;

  @query('.built-in-composer')
  private builtInComposer?: CommentComposer;

  // ── Private fields ────────────────────────────────────────────────────────

  private readonly i18n = new I18nController(this);

  /** Watches the entries, to pass settings down and announce new comments. */
  private readonly observer = new MutationObserver(records =>
    this.onMutations(records),
  );

  /** False in the task where the entries arrive, so loading them is not announced. */
  private announceReady = false;

  /** The composer that asked for suggestions last. */
  private searchingComposer?: CommentComposer;

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  constructor() {
    super();
    this.addEventListener('search', this.onSearch);
  }

  override connectedCallback() {
    super.connectedCallback();
    this.observer.observe(this, { childList: true, subtree: true });
    this.syncEntries();
    this.armAnnouncements();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.observer.disconnect();
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    if (
      changed.has('readonly') ||
      changed.has('triggers') ||
      changed.has('mentionHref')
    ) {
      this.syncEntries();
    }
    if (changed.has('loading') && changed.get('loading') && !this.loading) {
      this.armAnnouncements();
    }
  }

  protected override updated(changed: PropertyValues<this>) {
    if (
      (changed.has('suggestions') || changed.has('suggestionsLoading')) &&
      this.searchingComposer
    ) {
      this.searchingComposer.suggestions = this.suggestions;
      this.searchingComposer.suggestionsLoading = this.suggestionsLoading;
    }
    if (changed.has('triggers')) {
      const composer = this.mainComposer();
      if (composer) composer.triggers = this.triggers;
    }
  }

  // ── Public methods ────────────────────────────────────────────────────────

  /** The comments and activity entries, replies included, in document order. */
  get entries(): Entry[] {
    return Array.from(this.querySelectorAll('*')).filter(
      (node): node is Entry =>
        node instanceof DiscussionComment || node instanceof DiscussionActivity,
    );
  }

  /** Focuses the composer. */
  focusComposer() {
    this.mainComposer()?.focus();
  }

  /**
   * Drafts a reply in the composer for the person to edit and send (ADR-030002): it is marked
   * "Suggested reply" with `reason` until they edit or send it, and its clear button empties the
   * composer again. Ignored while AI is off.
   */
  suggestReply(value: string, reason = '') {
    const composer = this.mainComposer();
    if (!composer) return;
    composer.suggestion = { value, reason };
  }

  // ── Private methods ───────────────────────────────────────────────────────

  private mainComposer(): CommentComposer | undefined {
    const slotted = this.composerSlot
      ?.assignedElements({ flatten: true })
      .find(node => node instanceof CommentComposer);
    return (slotted as CommentComposer | undefined) ?? this.builtInComposer;
  }

  private armAnnouncements() {
    this.announceReady = false;
    setTimeout(() => {
      this.announceReady = true;
    });
  }

  /** Passes `readonly`, `triggers` and `mention-href` to the entries. */
  private syncEntries() {
    const { entries } = this;
    for (const entry of entries) {
      entry.mentionHref = this.mentionHref;
      if (entry instanceof DiscussionComment) {
        entry.readonly = this.readonly;
        entry.triggers = this.triggers;
      }
    }
    this.empty = entries.length === 0;
  }

  private onMutations(records: MutationRecord[]) {
    this.syncEntries();
    if (!this.announceReady || this.loading) return;
    const added: DiscussionComment[] = [];
    for (const record of records) {
      for (const node of Array.from(record.addedNodes)) {
        if (node instanceof DiscussionComment) added.push(node);
      }
    }
    const last = added[added.length - 1];
    if (!last) return;
    const text = this.i18n.t('commentAdded')(
      last.author || this.i18n.t('commentUnknownAuthor'),
    );
    // A trailing space makes a repeat of the same text a change the live region reads.
    this.announcement = this.announcement === text ? `${text} ` : text;
  }

  /** Remembers which composer asked, so the answer goes to it. */
  private onSearch = (event: Event) => {
    const composer = event
      .composedPath()
      .find((node): node is CommentComposer => node instanceof CommentComposer);
    if (!composer) return;
    this.searchingComposer = composer;
    composer.suggestions = this.suggestions;
    composer.suggestionsLoading = this.suggestionsLoading;
  };

  /** A new comment from the main composer: send it on with `parentId` null. */
  private onComposerSubmit(event: CustomEvent<CommentComposerSubmitDetail>) {
    event.stopPropagation();
    const { value, mentions } = event.detail;
    const accepted = this.dispatchEvent(
      new CustomEvent<DiscussionSubmitDetail>('submit', {
        detail: { value, mentions, parentId: null },
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
    if (!accepted) event.preventDefault();
  }

  private stop(event: Event) {
    event.stopPropagation();
  }

  private onFeedKeydown(event: KeyboardEvent) {
    const { key } = event;
    if (key === 'End' && event.ctrlKey) {
      if (this.readonly) return;
      event.preventDefault();
      this.focusComposer();
      return;
    }
    if (key !== 'PageDown' && key !== 'PageUp') return;
    const { entries } = this;
    const current = event
      .composedPath()
      .find(
        (node): node is Entry =>
          node instanceof DiscussionComment ||
          node instanceof DiscussionActivity,
      );
    if (!current || entries.length === 0) return;
    const next =
      entries[entries.indexOf(current) + (key === 'PageDown' ? 1 : -1)];
    event.preventDefault();
    next?.focus();
  }

  // ── Render helpers ────────────────────────────────────────────────────────

  private renderSkeleton() {
    return html`<div class="skeletons" aria-hidden="true">
      ${[0, 1, 2].map(
        () =>
          html`<div class="skeleton-row">
            <wc-skeleton visible class="skeleton-avatar"></wc-skeleton>
            <div class="skeleton-lines">
              <wc-skeleton visible class="skeleton-line short"></wc-skeleton>
              <wc-skeleton visible class="skeleton-line"></wc-skeleton>
              <wc-skeleton visible class="skeleton-line medium"></wc-skeleton>
            </div>
          </div>`,
      )}
    </div>`;
  }

  // ── Render ────────────────────────────────────────────────────────────────

  render() {
    return html`<slot name="header"></slot>
      <slot name="summary"></slot>
      <div
        class="feed"
        role="feed"
        aria-label=${this.label || this.i18n.t('commentThreadLabel')}
        aria-busy=${this.loading ? 'true' : 'false'}
        @keydown=${this.onFeedKeydown}
      >
        ${this.loading ? this.renderSkeleton() : nothing}
        <slot ?hidden=${this.loading}></slot>
      </div>
      ${!this.loading && this.empty
        ? html`<div class="empty">
            <slot name="empty">
              <wc-icon name="forum" aria-hidden="true"></wc-icon>
              <span>${this.i18n.t('commentThreadEmpty')}</span>
            </slot>
          </div>`
        : nothing}
      ${this.readonly
        ? nothing
        : html`<div
            class="composer"
            @submit=${this.onComposerSubmit}
            @input=${this.stop}
            @change=${this.stop}
          >
            <slot name="composer">
              <wc-comment-composer
                class="built-in-composer"
                triggers=${this.triggers}
                placeholder=${this.placeholder ||
                this.i18n.t('commentComposerLabel')}
                label=${this.placeholder || this.i18n.t('commentComposerLabel')}
              ></wc-comment-composer>
            </slot>
          </div>`}
      <div class="screen-reader-only" aria-live="polite">
        ${this.announcement}
      </div>`;
  }
}
