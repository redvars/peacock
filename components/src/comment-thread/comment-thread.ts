import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';

import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import IndividualComponent from '@/IndividualComponent.js';

import { CommentElement, type CommentSubmitDetail } from './comment.js';
import styles from './comment-thread.scss';

/** The composer's text control: `wc-textarea`, or a slotted element with a `value`. */
type ValueElement = HTMLElement & { value: string };

/**
 * @label Comment Thread
 * @tag wc-comment-thread
 * @rawTag comment-thread
 *
 * @summary A discussion thread for a record: comments, one level of replies and a composer.
 * @overview
 * <p>A comment thread holds <code>wc-comment</code> elements, oldest first, and a composer under
 * them. The app owns the comments: it renders one <code>wc-comment</code> per comment (replies
 * with <code>slot="replies"</code> inside their comment) and changes them in answer to the
 * events. Every event bubbles, so one listener on the thread hears them all.</p>
 * <p>The composer is a <code>wc-textarea</code> with a Send button. Ctrl+Enter (Cmd+Enter on a
 * Mac) or Send fires a cancelable <code>submit</code> with the trimmed text in
 * <code>detail.body</code> and <code>detail.parentId</code> <code>null</code> (replies, sent from a
 * comment's reply composer, carry the comment's id). Unless the event is cancelled the composer
 * empties, and the app adds the comment; cancel it to keep the text, for example when the app
 * cannot take it now. Send is disabled while the text is blank or the thread is
 * <code>loading</code>. Put your own control in the <code>composer</code> slot to replace the
 * textarea (a mention input, say): it needs a <code>value</code> property and must fire
 * <code>input</code>, and the thread empties it after a send. <code>readonly</code> hides the
 * composer and the Reply buttons.</p>
 * <p><code>loading</code> shows placeholder rows while the comments load. Without comments the
 * thread says "No comments yet" (replace it with the <code>empty</code> slot).</p>
 * <p>Accessibility: the comments sit in a <code>role="feed"</code> named by <code>label</code>
 * ("Comments" by default), busy while loading. Each comment is an <code>article</code> named
 * "Comment by <i>author</i>, <i>time</i>". Page Down and Page Up move focus to the next and
 * previous comment, and Ctrl+End to the composer. A comment added after the thread has loaded is
 * announced politely ("New comment by <i>author</i>").</p>
 *
 * @slot - The comments: `wc-comment` elements.
 * @slot composer - Replaces the composer's textarea; needs a `value` and must fire `input`.
 * @slot empty - Replaces the "No comments yet" message.
 *
 * @fires {CustomEvent<{body: string, parentId: string | null}>} submit - Cancelable. The person sent a comment (`parentId` null) or a reply.
 *
 * @example
 * ```html
 * <wc-comment-thread>
 *   <wc-comment comment-id="1" author="Ada Lovelace" datetime="2026-11-07T09:30:00Z" body="Can we ship this on Friday?">
 *     <wc-comment slot="replies" comment-id="2" author="Grace Hopper" datetime="2026-11-07T10:02:00Z" body="Yes, the tests pass."></wc-comment>
 *   </wc-comment>
 * </wc-comment-thread>
 * ```
 * @tags collaboration
 */
@IndividualComponent
export class CommentThread extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  static Comment = CommentElement;

  // ── Properties ───────────────────────────────────────────────────────────

  /** Accessible name of the feed. Defaults to "Comments". */
  @property({ type: String })
  label = '';

  /** Shows placeholder rows while the comments load; Send is disabled. */
  @property({ type: Boolean, reflect: true })
  loading = false;

  /** Hides the composer and the Reply buttons. */
  @property({ type: Boolean, reflect: true })
  readonly = false;

  // ── State ────────────────────────────────────────────────────────────────

  /** The composer's text. */
  @state()
  private draft = '';

  /** Whether the thread has no comments. */
  @state()
  private empty = true;

  /** The polite announcement of a new comment. */
  @state()
  private announcement = '';

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('slot[name="composer"]')
  private composerSlot?: HTMLSlotElement;

  @query('.composer-input')
  private composerInput?: ValueElement;

  // ── Private fields ───────────────────────────────────────────────────────

  /** Peacock's strings. */
  private readonly i18n = new I18nController(this);

  /** Watches the comments, to pass `readonly` down and announce new ones. */
  private readonly observer = new MutationObserver(records =>
    this.handleMutations(records),
  );

  /** False in the task where the comments arrive, so loading them is not announced. */
  private announceReady = false;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    this.observer.observe(this, { childList: true, subtree: true });
    this.syncComments();
    this.armAnnouncements();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.observer.disconnect();
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    if (changed.has('readonly')) this.syncComments();
    if (changed.has('loading') && changed.get('loading') && !this.loading) {
      this.armAnnouncements();
    }
  }

  // ── Public methods ───────────────────────────────────────────────────────

  /** The `wc-comment` elements, replies included, in document order. */
  get comments(): CommentElement[] {
    return Array.from(this.querySelectorAll('*')).filter(
      (node): node is CommentElement => node instanceof CommentElement,
    );
  }

  /** Focuses the composer. */
  focusComposer() {
    (this.composerControl() as HTMLElement | undefined)?.focus();
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private armAnnouncements() {
    this.announceReady = false;
    setTimeout(() => {
      this.announceReady = true;
    });
  }

  private syncComments() {
    const { comments } = this;
    for (const comment of comments) comment.replyHidden = this.readonly;
    this.empty = comments.length === 0;
  }

  private handleMutations(records: MutationRecord[]) {
    this.syncComments();
    if (!this.announceReady || this.loading) return;
    const added: CommentElement[] = [];
    for (const record of records) {
      for (const node of Array.from(record.addedNodes)) {
        if (node instanceof CommentElement) added.push(node);
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

  /** The control that holds the text: the slotted one, else the built-in textarea. */
  private composerControl(): ValueElement | undefined {
    const slotted = this.composerSlot?.assignedElements({ flatten: true })[0];
    return (slotted as ValueElement | undefined) ?? this.composerInput;
  }

  private handleComposerInput(event: Event) {
    // Keep the composer's events inside: the thread fires `submit` itself.
    event.stopPropagation();
    const { value } = event.target as Partial<ValueElement>;
    this.draft = typeof value === 'string' ? value : '';
  }

  private stopEvent(event: Event) {
    event.stopPropagation();
  }

  private handleComposerKeydown(event: KeyboardEvent) {
    if (event.isComposing) return;
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      this.send();
    }
  }

  private send() {
    const body = this.draft.trim();
    if (!body || this.loading || this.readonly) return;
    const accepted = this.dispatchEvent(
      new CustomEvent<CommentSubmitDetail>('submit', {
        detail: { body, parentId: null },
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
    if (!accepted) return;
    this.draft = '';
    const control = this.composerControl();
    if (control) control.value = '';
  }

  private handleFeedKeydown(event: KeyboardEvent) {
    const { key } = event;
    if (key === 'End' && event.ctrlKey) {
      if (this.readonly) return;
      event.preventDefault();
      this.focusComposer();
      return;
    }
    if (key !== 'PageDown' && key !== 'PageUp') return;
    const { comments } = this;
    const current = event
      .composedPath()
      .find((node): node is CommentElement => node instanceof CommentElement);
    if (!current || comments.length === 0) return;
    const index = comments.indexOf(current);
    const next = comments[index + (key === 'PageDown' ? 1 : -1)];
    event.preventDefault();
    next?.focus();
  }

  // ── Render helpers ───────────────────────────────────────────────────────

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

  private renderComposer() {
    if (this.readonly) return nothing;
    const label = this.i18n.t('commentComposerLabel');
    return html`<div
      class="composer"
      @input=${this.handleComposerInput}
      @change=${this.stopEvent}
      @keydown=${this.handleComposerKeydown}
    >
      <slot name="composer">
        <wc-textarea
          class="composer-input"
          rows="2"
          auto-grow
          max-rows="10"
          placeholder=${label}
          .configAria=${{ 'aria-label': label }}
          .value=${this.draft}
          ?disabled=${this.loading}
        ></wc-textarea>
      </slot>
      <div class="composer-actions">
        <wc-button
          class="send-button"
          size="sm"
          ?disabled=${this.loading || !this.draft.trim()}
          @click=${this.send}
          >${this.i18n.t('commentSend')}</wc-button
        >
      </div>
    </div>`;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    return html`<div
        class="feed"
        role="feed"
        aria-label=${this.label || this.i18n.t('commentThreadLabel')}
        aria-busy=${this.loading ? 'true' : 'false'}
        @keydown=${this.handleFeedKeydown}
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
      ${this.renderComposer()}
      <div class="screen-reader-only" aria-live="polite">
        ${this.announcement}
      </div>`;
  }
}
