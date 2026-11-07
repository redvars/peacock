import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';

import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import type { RichTextMention } from '@/__internal/rich-text/mention.js';
import { writeClipboardText } from '@/__internal/utils/clipboard.js';
import {
  formatRelativeTime,
  parseDatetime,
  watchRelativeTime,
} from '@/__internal/utils/relative-time.js';
import type { CommentComposerSubmitDetail } from '../comment-composer/comment-composer.js';
import type { Menu } from '../menu/menu/menu.js';
import { renderEntryTime } from './discussion-time.js';

import styles from './discussion-comment.scss';

/** `detail` of `submit`: a new comment (`parentId` null) or a reply to the comment `parentId`. */
export interface DiscussionSubmitDetail {
  value: string;
  mentions: RichTextMention[];
  parentId: string | null;
}

/** `detail` of `edit`: the comment and its new Markdown. */
export interface DiscussionEditDetail {
  commentId: string;
  value: string;
  mentions: RichTextMention[];
}

/** `detail` of `delete` and `reply`. */
export interface DiscussionCommentDetail {
  commentId: string;
}

/** `detail` of `copy-link`: the comment and the absolute link that was copied. */
export interface DiscussionCopyLinkDetail {
  commentId: string;
  href: string;
}

type Composer = HTMLElement & {
  focus: () => void;
  updateComplete?: Promise<unknown>;
};

/**
 * @label Discussion Comment
 * @tag wc-discussion-comment
 * @rawTag discussion-comment
 *
 * @summary One comment in a discussion: author, time, Markdown text, actions, replies and inline reply and edit.
 * @overview
 * <p>A comment shows its <code>author</code> (with a <code>wc-avatar</code> from
 * <code>avatar-src</code>, or initials), its time and its text. <code>value</code> is Markdown,
 * shown with <code>wc-markdown</code>, so mentions show as chips. <code>datetime</code> (ISO 8601)
 * shows relative to now and keeps itself current; with <code>href</code> (the comment's permalink)
 * the time links to it. <code>edited</code> adds an "Edited" marker, and the <code>badge</code>
 * slot holds a tag such as <em>Work note</em>.</p>
 *
 * <p>Replies are <code>wc-discussion-comment</code> elements with <code>slot="replies"</code>,
 * one level deep. <strong>Reply</strong> fires a cancelable <code>reply</code> and opens a
 * <code>wc-comment-composer</code> under the replies; sending it fires <code>submit</code> with
 * <code>detail.parentId</code> set to this comment's <code>comment-id</code>.
 * <strong>Edit</strong> (with <code>editable</code>) turns the text into a composer; saving fires a
 * cancelable <code>edit</code> with the new Markdown. Cancel either event to keep the composer open,
 * for example while a save fails. <strong>Delete</strong> (with <code>deletable</code>) and
 * <strong>Copy link</strong> (with <code>href</code>) fire <code>delete</code> and
 * <code>copy-link</code>. The app owns the data: it updates <code>value</code>, adds the reply, or
 * removes the comment.</p>
 *
 * <p>Use comments inside <code>wc-discussion</code>, which passes down <code>readonly</code>,
 * <code>triggers</code> and <code>mention-href</code>, and gives the reply and edit composers their
 * mention suggestions.</p>
 *
 * @slot - Replaces the Markdown body with your own content.
 * @slot badge - Shown after the author, such as a `wc-tag` for a work note.
 * @slot footer - Shown under the text, such as reactions or attachments.
 * @slot replies - The replies: `wc-discussion-comment` elements.
 *
 * @fires {CustomEvent<{commentId: string}>} reply - Cancelable. The person pressed Reply; cancel it to use your own composer.
 * @fires {CustomEvent<{value: string, mentions: object[], parentId: string}>} submit - Cancelable. The person sent a reply.
 * @fires {CustomEvent<{commentId: string, value: string, mentions: object[]}>} edit - Cancelable. The person saved an edit.
 * @fires {CustomEvent<{commentId: string}>} delete - The person chose Delete.
 * @fires {CustomEvent<{commentId: string, href: string}>} copy-link - The person chose Copy link; the link is on the clipboard.
 *
 * @example
 * ```html
 * <wc-discussion-comment comment-id="1" author="Ana Lima" datetime="2026-11-07T09:30:00Z"
 *   value="Restarted the worker. [@Ravi Kumar](mention:usr_7), can you check?"></wc-discussion-comment>
 * ```
 * @tags collaboration
 */
@IndividualComponent
export class DiscussionComment extends LitElement {
  // ── Static ────────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ────────────────────────────────────────────────────────────

  /** The app's id of the comment, sent back in every event. */
  @property({ type: String, attribute: 'comment-id' })
  commentId = '';

  /** Name of the author. */
  @property({ type: String })
  author = '';

  /** Image URL of the author's avatar; without it the avatar shows initials. */
  @property({ type: String, attribute: 'avatar-src' })
  avatarSrc = '';

  /** When the comment was written, as ISO 8601. */
  @property({ type: String })
  datetime = '';

  /** The comment, as Markdown. */
  @property({ type: String })
  value = '';

  /** Shows an "Edited" marker. */
  @property({ type: Boolean, reflect: true })
  edited = false;

  /** Offers Edit. */
  @property({ type: Boolean })
  editable = false;

  /** Offers Delete. */
  @property({ type: Boolean })
  deletable = false;

  /** The comment's permalink; links the time and offers Copy link. */
  @property({ type: String })
  href = '';

  /** Hides Reply and Edit. `wc-discussion` sets it from its own `readonly`. */
  @property({ type: Boolean, reflect: true })
  readonly = false;

  /** Mention triggers of the reply and edit composers. `wc-discussion` sets it. */
  @property({ type: String })
  triggers = '@';

  /** Address mentions link to, with `{id}`; see `wc-markdown`. `wc-discussion` sets it. */
  @property({ type: String, attribute: 'mention-href' })
  mentionHref = '';

  // ── State ─────────────────────────────────────────────────────────────────

  @state() private replying = false;

  @state() private editing = false;

  @state() private hasReplies = false;

  @state() private hasCustomBody = false;

  @state() private menuOpen = false;

  // ── Queries ───────────────────────────────────────────────────────────────

  @query('.menu')
  private menu?: Menu;

  @query('.menu-button')
  private menuButton?: HTMLElement;

  @query('.reply-button')
  private replyButton?: HTMLElement;

  // ── Private fields ────────────────────────────────────────────────────────

  private readonly i18n = new I18nController(this);

  private readonly internals: ReturnType<HTMLElement['attachInternals']> =
    this.attachInternals();

  private stopTicking?: () => void;

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    this.internals.role = 'article';
    // Feed articles take focus from the discussion's Page Up / Page Down.
    if (!this.hasAttribute('tabindex')) this.tabIndex = -1;
    this.stopTicking = watchRelativeTime(
      () => this.date,
      () => this.requestUpdate(),
    );
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.stopTicking?.();
    this.stopTicking = undefined;
  }

  protected override updated(changed: PropertyValues<this>) {
    super.updated(changed);
    this.internals.ariaLabel = this.accessibleName();
    if (changed.has('readonly') && this.readonly) {
      this.replying = false;
      this.editing = false;
    }
  }

  // ── Public methods ────────────────────────────────────────────────────────

  /** Whether this comment is a reply: it sits inside another comment. */
  get isReply(): boolean {
    return this.parentElement instanceof DiscussionComment;
  }

  /** Opens the reply composer and focuses it. Does nothing on a reply or while read-only. */
  async openReply() {
    if (this.isReply || this.readonly) return;
    this.replying = true;
    await this.focusComposer('.reply-composer');
  }

  /** Closes the reply composer. */
  closeReply() {
    const hadFocus = this.matches(':focus-within');
    this.replying = false;
    if (hadFocus) this.updateComplete.then(() => this.replyButton?.focus());
  }

  /** Turns the text into an editor. */
  async startEdit() {
    if (this.readonly) return;
    this.editing = true;
    await this.focusComposer('.edit-composer');
  }

  /** Leaves editing without saving. */
  cancelEdit() {
    this.editing = false;
    this.updateComplete.then(() => this.focus());
  }

  // ── Private methods ───────────────────────────────────────────────────────

  private get authorName(): string {
    return this.author || this.i18n.t('commentUnknownAuthor');
  }

  private get date(): Date | null {
    return parseDatetime(this.datetime);
  }

  private accessibleName(): string {
    const { date } = this;
    const time = date ? formatRelativeTime(date, this.i18n.locale) : '';
    return this.isReply
      ? this.i18n.t('commentReplyLabel')(this.authorName, time)
      : this.i18n.t('commentLabel')(this.authorName, time);
  }

  private async focusComposer(selector: string) {
    await this.updateComplete;
    const composer = this.renderRoot.querySelector<Composer>(selector);
    await composer?.updateComplete;
    composer?.focus();
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

  private onBodySlotChange(event: Event) {
    const slot = event.target as HTMLSlotElement;
    this.hasCustomBody = slot
      .assignedNodes()
      .some(
        node =>
          node.nodeType === Node.ELEMENT_NODE ||
          (node.nodeType === Node.TEXT_NODE && !!node.textContent?.trim()),
      );
  }

  private onRepliesSlotChange(event: Event) {
    this.hasReplies =
      (event.target as HTMLSlotElement).assignedElements().length > 0;
  }

  private toggleMenu() {
    const { menu } = this;
    if (!menu) return;
    menu.anchorElement = this.menuButton ?? null;
    menu.toggle();
  }

  private onMenuOpenChange(event: Event) {
    event.stopPropagation();
    this.menuOpen = event.type === 'open';
  }

  private onMenuActivate(event: Event) {
    event.stopPropagation();
    const { item } = (event as CustomEvent<{ item?: { value?: string } }>)
      .detail;
    const { commentId } = this;
    switch (item?.value) {
      case 'edit':
        this.startEdit();
        break;
      case 'delete':
        this.emit<DiscussionCommentDetail>('delete', { commentId });
        break;
      case 'copy-link': {
        const { href } = new URL(this.href, document.baseURI);
        writeClipboardText(href).catch(() => {});
        this.emit<DiscussionCopyLinkDetail>('copy-link', { commentId, href });
        break;
      }
      default:
    }
  }

  private onReplyClick() {
    const accepted = this.emit<DiscussionCommentDetail>(
      'reply',
      { commentId: this.commentId },
      true,
    );
    if (accepted) this.openReply();
  }

  private onReplySubmit(event: CustomEvent<CommentComposerSubmitDetail>) {
    event.stopPropagation();
    const { value, mentions } = event.detail;
    const accepted = this.emit<DiscussionSubmitDetail>(
      'submit',
      { value, mentions, parentId: this.commentId },
      true,
    );
    if (accepted) this.closeReply();
    else event.preventDefault();
  }

  private onEditSubmit(event: CustomEvent<CommentComposerSubmitDetail>) {
    event.stopPropagation();
    const { value, mentions } = event.detail;
    const accepted = this.emit<DiscussionEditDetail>(
      'edit',
      { commentId: this.commentId, value, mentions },
      true,
    );
    if (accepted) this.cancelEdit();
    else event.preventDefault();
  }

  private stop(event: Event) {
    event.stopPropagation();
  }

  // ── Render helpers ────────────────────────────────────────────────────────

  private renderMenu() {
    const canEdit = this.editable && !this.readonly;
    if (!canEdit && !this.deletable && !this.href) return nothing;
    return html`<wc-icon-button
        class="menu-button"
        variant="text"
        color="surface"
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
        @menu-item-activate=${this.onMenuActivate}
        @open=${this.onMenuOpenChange}
        @close=${this.onMenuOpenChange}
      >
        ${canEdit
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

  private renderBody() {
    if (this.editing) {
      return html`<wc-comment-composer
        class="edit-composer"
        dismissible
        expanded
        triggers=${this.triggers}
        submit-label=${this.i18n.t('commentSave')}
        label=${this.i18n.t('commentEdit')}
        .value=${this.value}
        @submit=${this.onEditSubmit}
        @cancel=${(event: Event) => {
          event.stopPropagation();
          this.cancelEdit();
        }}
        @input=${this.stop}
        @change=${this.stop}
      ></wc-comment-composer>`;
    }
    return html`<slot @slotchange=${this.onBodySlotChange}></slot> ${this
        .hasCustomBody
        ? nothing
        : html`<wc-markdown
            class="markdown"
            size="sm"
            mention-href=${this.mentionHref}
            .value=${this.value}
          ></wc-markdown>`}`;
  }

  private renderReplyComposer() {
    if (!this.replying) return nothing;
    const label = this.i18n.t('commentReplyTo')(this.authorName);
    return html`<wc-comment-composer
      class="reply-composer"
      dismissible
      expanded
      triggers=${this.triggers}
      label=${label}
      placeholder=${label}
      @submit=${this.onReplySubmit}
      @cancel=${(event: Event) => {
        event.stopPropagation();
        this.closeReply();
      }}
      @input=${this.stop}
      @change=${this.stop}
    ></wc-comment-composer>`;
  }

  // ── Render ────────────────────────────────────────────────────────────────

  render() {
    const reply = this.isReply;
    const canReply = !reply && !this.readonly;
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
          <slot name="badge"></slot>
          ${renderEntryTime(this.date, this.i18n.locale, this.href)}
          ${this.edited
            ? html`<span class="edited">${this.i18n.t('commentEdited')}</span>`
            : nothing}
          <span class="spacer"></span>
          ${this.renderMenu()}
        </div>
        <div class="body">${this.renderBody()}</div>
        <slot name="footer"></slot>
        ${canReply && !this.editing
          ? html`<div class="actions">
              <wc-button
                class="reply-button"
                variant="text"
                size="xs"
                @click=${this.onReplyClick}
                ><wc-icon slot="start" name="reply"></wc-icon>${this.i18n.t(
                  'commentReply',
                )}</wc-button
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
                @slotchange=${this.onRepliesSlotChange}
              ></slot>
            </div>`}
        ${this.renderReplyComposer()}
      </div>
    </div>`;
  }
}
