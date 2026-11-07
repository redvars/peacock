import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';

import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import { writeClipboardText } from '@/__internal/utils/clipboard.js';
import IndividualComponent from '@/IndividualComponent.js';
import type { Menu } from '../menu/menu/menu.js';

import {
  formatAbsoluteTime,
  formatRelativeTime,
  onMinuteTick,
  parseDatetime,
} from './relative-time.js';
import styles from './comment.scss';

/** `detail` of `submit`: the text, and the comment it replies to (`null` for a new comment). */
export interface CommentSubmitDetail {
  body: string;
  parentId: string | null;
}

/** `detail` of a comment's `edit`, `delete` and `reply` events. */
export interface CommentActionDetail {
  commentId: string;
}

/** `detail` of `copy-link`: the comment and the absolute link that was copied. */
export interface CommentCopyLinkDetail {
  commentId: string;
  href: string;
}

/** The text control of a composer: `wc-textarea`, or a slotted element with a `value`. */
type ValueElement = HTMLElement & { value: string };

/**
 * @label Comment
 * @tag wc-comment
 * @rawTag comment
 *
 * @summary One comment in a `wc-comment-thread`, with its replies.
 * @overview
 * <p>A comment shows its <code>author</code> (with a <code>wc-avatar</code> from
 * <code>avatar-src</code>, or the author's initials), its time and its text. <code>datetime</code>
 * (ISO 8601) shows relative to now in the page's locale, such as "5 minutes ago", and keeps itself
 * current; the absolute date and time is the tooltip of its <code>&lt;time&gt;</code>. With
 * <code>href</code> (the comment's permalink) the time links to it. <code>edited</code> adds an
 * "Edited" marker.</p>
 * <p>The text is <code>body</code>, plain text whose line breaks show. For rich text, put the
 * content in the comment instead; it replaces <code>body</code>.</p>
 * <p>Replies are <code>wc-comment</code> elements with <code>slot="replies"</code> inside their
 * comment, shown indented. There is one level: a reply shows no Reply button and no replies.</p>
 * <p>Actions fire events and change nothing; the app owns the data. The actions menu (the
 * <code>more_vert</code> button) lists Edit with <code>editable</code>, Delete with
 * <code>deletable</code> and, with <code>href</code>, Copy link, which also copies the absolute
 * link to the clipboard. Without any of them there is no menu. Reply (on comments, not replies)
 * fires a cancelable <code>reply</code> and opens a reply composer under the replies; Ctrl+Enter
 * (Cmd+Enter) or Send fires <code>submit</code> with <code>detail.parentId</code> set to this
 * comment's <code>comment-id</code>, and Escape or Cancel closes it. Cancel <code>submit</code> to
 * keep the composer open with the text.</p>
 * <p>Each comment is an <code>article</code> named "Comment by <i>author</i>, <i>time</i>" (a
 * reply "Reply by ..."), so a screen reader can move between them.</p>
 *
 * @slot - Rich text body; replaces `body`.
 * @slot replies - The replies: `wc-comment` elements.
 *
 * @fires {CustomEvent<{commentId: string}>} edit - The person chose Edit.
 * @fires {CustomEvent<{commentId: string}>} delete - The person chose Delete.
 * @fires {CustomEvent<{commentId: string, href: string}>} copy-link - The person chose Copy link; the link is on the clipboard.
 * @fires {CustomEvent<{commentId: string}>} reply - Cancelable. The person pressed Reply; cancel it to show your own reply composer.
 * @fires {CustomEvent<{body: string, parentId: string}>} submit - Cancelable. The person sent a reply.
 *
 * @example
 * ```html
 * <wc-comment comment-id="1" author="Ada Lovelace" datetime="2026-11-07T09:30:00Z" body="Looks good to me."></wc-comment>
 * ```
 * @tags collaboration
 */
@IndividualComponent
export class CommentElement extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** The app's id of the comment, sent back in every event. */
  @property({ type: String, attribute: 'comment-id' })
  commentId = '';

  /** Name of the person who wrote it. */
  @property({ type: String })
  author = '';

  /** URL of the author's picture; without one the avatar shows initials. */
  @property({ type: String, attribute: 'avatar-src' })
  avatarSrc = '';

  /** When it was written, as an ISO 8601 date-time. */
  @property({ type: String })
  datetime = '';

  /** The text, as plain text; line breaks show. Slotted content replaces it. */
  @property({ type: String })
  body = '';

  /** Shows the "Edited" marker. */
  @property({ type: Boolean, reflect: true })
  edited = false;

  /** Offers Edit in the actions menu. */
  @property({ type: Boolean })
  editable = false;

  /** Offers Delete in the actions menu. */
  @property({ type: Boolean })
  deletable = false;

  /** The comment's permalink: the time links to it, and the menu offers Copy link. */
  @property({ type: String })
  href = '';

  /**
   * Hides Reply. Set by a `readonly` `wc-comment-thread`.
   * @internal
   */
  @property({ attribute: false })
  replyHidden = false;

  // ── State ────────────────────────────────────────────────────────────────

  /** Whether the reply composer is open. */
  @state()
  private replying = false;

  /** The text in the reply composer. */
  @state()
  private replyDraft = '';

  /** Whether rich content is slotted in place of `body`. */
  @state()
  private hasRichBody = false;

  /** Whether the comment has replies. */
  @state()
  private hasReplies = false;

  /** Whether the actions menu is open. */
  @state()
  private menuOpen = false;

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('.menu')
  private menu?: Menu;

  @query('.menu-button')
  private menuButton?: HTMLElement;

  @query('.reply-button')
  private replyButton?: HTMLElement;

  @query('.reply-input')
  private replyInput?: ValueElement;

  // ── Private fields ───────────────────────────────────────────────────────

  /** Peacock's strings and the locale for the time. */
  private readonly i18n = new I18nController(this);

  /** The article role and name, without touching the app's attributes. */
  private readonly internals: ReturnType<HTMLElement['attachInternals']> =
    this.attachInternals();

  /** Stops the shared clock that refreshes the relative time. */
  private stopTicking?: () => void;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    this.internals.role = 'article';
    // Feed articles take focus from the thread's Page Up / Page Down.
    if (!this.hasAttribute('tabindex')) this.tabIndex = -1;
    this.stopTicking = onMinuteTick(() => this.requestUpdate());
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.stopTicking?.();
    this.stopTicking = undefined;
  }

  protected override updated(changed: PropertyValues<this>) {
    super.updated(changed);
    this.internals.ariaLabel = this.accessibleName();
  }

  // ── Public methods ───────────────────────────────────────────────────────

  /** Whether this comment is a reply: it sits inside another `wc-comment`. */
  get isReply(): boolean {
    return this.parentElement instanceof CommentElement;
  }

  /** Opens the reply composer and focuses it. Does nothing on a reply. */
  async openReply() {
    if (this.isReply) return;
    this.replying = true;
    await this.updateComplete;
    const input = this.replyInput as
      | (ValueElement & { updateComplete?: Promise<boolean> })
      | undefined;
    await input?.updateComplete;
    input?.focus();
  }

  /** Closes the reply composer and drops its text. */
  closeReply() {
    const hadFocus = this.matches(':focus-within');
    this.replying = false;
    this.replyDraft = '';
    if (hadFocus) this.updateComplete.then(() => this.replyButton?.focus());
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private get authorName(): string {
    return this.author || this.i18n.t('commentUnknownAuthor');
  }

  private get date(): Date | null {
    return parseDatetime(this.datetime);
  }

  private get hasMenu(): boolean {
    return this.editable || this.deletable || !!this.href;
  }

  private accessibleName(): string {
    const { date } = this;
    const time = date ? formatRelativeTime(date, this.i18n.locale) : '';
    return this.isReply
      ? this.i18n.t('commentReplyLabel')(this.authorName, time)
      : this.i18n.t('commentLabel')(this.authorName, time);
  }

  private emit<T>(type: string, detail: T, cancelable = false): boolean {
    return this.dispatchEvent(
      new CustomEvent<T>(type, {
        detail,
        bubbles: true,
        composed: true,
        cancelable,
      }),
    );
  }

  private handleBodySlotChange(event: Event) {
    const slot = event.target as HTMLSlotElement;
    this.hasRichBody = slot
      .assignedNodes()
      .some(
        node =>
          node.nodeType === Node.ELEMENT_NODE ||
          (node.nodeType === Node.TEXT_NODE && !!node.textContent?.trim()),
      );
  }

  private handleRepliesSlotChange(event: Event) {
    const slot = event.target as HTMLSlotElement;
    this.hasReplies = slot.assignedElements().length > 0;
  }

  private toggleMenu() {
    const { menu } = this;
    if (!menu) return;
    menu.anchorElement = this.menuButton ?? null;
    menu.toggle();
  }

  private handleMenuOpenChange(event: Event) {
    // The menu's own open / close are an implementation detail of the comment.
    event.stopPropagation();
    this.menuOpen = event.type === 'open';
  }

  private handleMenuActivate(event: Event) {
    event.stopPropagation();
    const { item } = (event as CustomEvent<{ item?: { value?: string } }>)
      .detail;
    const { commentId } = this;
    switch (item?.value) {
      case 'edit':
        this.emit<CommentActionDetail>('edit', { commentId });
        break;
      case 'delete':
        this.emit<CommentActionDetail>('delete', { commentId });
        break;
      case 'copy-link': {
        const { href } = new URL(this.href, document.baseURI);
        writeClipboardText(href).catch(() => {});
        this.emit<CommentCopyLinkDetail>('copy-link', { commentId, href });
        break;
      }
      default:
    }
  }

  private handleReplyClick() {
    if (
      this.emit<CommentActionDetail>(
        'reply',
        { commentId: this.commentId },
        true,
      )
    ) {
      this.openReply();
    }
  }

  private handleReplyInput(event: Event) {
    event.stopPropagation();
    this.replyDraft = (event.target as ValueElement).value ?? '';
  }

  private stopEvent(event: Event) {
    event.stopPropagation();
  }

  private handleReplyKeydown(event: KeyboardEvent) {
    if (event.isComposing) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.closeReply();
    } else if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      this.sendReply();
    }
  }

  private sendReply() {
    const body = this.replyDraft.trim();
    if (!body) return;
    const accepted = this.emit<CommentSubmitDetail>(
      'submit',
      { body, parentId: this.commentId },
      true,
    );
    if (accepted) this.closeReply();
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private renderTime() {
    const { date } = this;
    if (!date) return nothing;
    const { locale } = this.i18n;
    const time = html`<time
      datetime=${date.toISOString()}
      title=${formatAbsoluteTime(date, locale)}
      >${formatRelativeTime(date, locale)}</time
    >`;
    return this.href
      ? html`<a class="time" href=${this.href}>${time}</a>`
      : html`<span class="time">${time}</span>`;
  }

  private renderMenu() {
    if (!this.hasMenu) return nothing;
    return html`<wc-icon-button
        class="menu-button"
        variant="text"
        size="xs"
        shape="round"
        aria-label=${this.i18n.t('commentActions')(this.authorName)}
        aria-haspopup="menu"
        aria-expanded=${String(this.menuOpen)}
        @click=${this.toggleMenu}
      >
        <wc-icon name="more_vert"></wc-icon>
      </wc-icon-button>
      <wc-menu
        class="menu"
        placement="bottom-end"
        @menu-item-activate=${this.handleMenuActivate}
        @open=${this.handleMenuOpenChange}
        @close=${this.handleMenuOpenChange}
      >
        ${this.editable
          ? html`<wc-menu-item value="edit"
              ><wc-icon slot="start" name="edit"></wc-icon>${this.i18n.t(
                'commentEdit',
              )}</wc-menu-item
            >`
          : nothing}
        ${this.href
          ? html`<wc-menu-item value="copy-link"
              ><wc-icon slot="start" name="link"></wc-icon>${this.i18n.t(
                'commentCopyLink',
              )}</wc-menu-item
            >`
          : nothing}
        ${this.deletable
          ? html`<wc-menu-item value="delete"
              ><wc-icon slot="start" name="delete"></wc-icon>${this.i18n.t(
                'commentDelete',
              )}</wc-menu-item
            >`
          : nothing}
      </wc-menu>`;
  }

  private renderReplyComposer() {
    if (!this.replying) return nothing;
    return html`<div class="reply-composer" @keydown=${this.handleReplyKeydown}>
      <wc-textarea
        class="reply-input"
        rows="2"
        auto-grow
        max-rows="10"
        placeholder=${this.i18n.t('commentReplyTo')(this.authorName)}
        .configAria=${{
          'aria-label': this.i18n.t('commentReplyTo')(this.authorName),
        }}
        .value=${this.replyDraft}
        @input=${this.handleReplyInput}
        @change=${this.stopEvent}
      ></wc-textarea>
      <div class="composer-actions">
        <wc-button
          class="reply-cancel"
          variant="text"
          size="sm"
          @click=${() => this.closeReply()}
          >${this.i18n.t('commentCancel')}</wc-button
        >
        <wc-button
          class="reply-send"
          size="sm"
          ?disabled=${!this.replyDraft.trim()}
          @click=${this.sendReply}
          >${this.i18n.t('commentSend')}</wc-button
        >
      </div>
    </div>`;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const reply = this.isReply;
    const canReply = !reply && !this.replyHidden;
    return html`<div class="comment">
      <div class="avatar" aria-hidden="true">
        <wc-avatar
          size=${reply ? 'sm' : 'md'}
          name=${this.author}
          src=${this.avatarSrc || nothing}
        ></wc-avatar>
      </div>
      <div class="main">
        <div class="header">
          <span class="author">${this.authorName}</span>
          ${this.renderTime()}
          ${this.edited
            ? html`<span class="edited">${this.i18n.t('commentEdited')}</span>`
            : nothing}
          <span class="spacer"></span>
          ${this.renderMenu()}
        </div>
        <div class="body">
          <slot @slotchange=${this.handleBodySlotChange}></slot>
          ${this.hasRichBody
            ? nothing
            : html`<div class="plain">${this.body}</div>`}
        </div>
        ${canReply
          ? html`<div class="footer">
              <wc-button
                class="reply-button"
                variant="text"
                size="xs"
                @click=${this.handleReplyClick}
                >${this.i18n.t('commentReply')}</wc-button
              >
            </div>`
          : nothing}
        ${reply
          ? nothing
          : html`<div
              class="replies"
              role=${this.hasReplies ? 'group' : nothing}
              aria-label=${this.hasReplies
                ? this.i18n.t('commentReplies')(this.authorName)
                : nothing}
              ?hidden=${!this.hasReplies}
            >
              <slot
                name="replies"
                @slotchange=${this.handleRepliesSlotChange}
              ></slot>
            </div>`}
        ${this.renderReplyComposer()}
      </div>
    </div>`;
  }
}
