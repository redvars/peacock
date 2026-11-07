import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';

import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import {
  formatRelativeTime,
  parseDatetime,
  watchRelativeTime,
} from '@/__internal/utils/relative-time.js';
import { renderEntryTime } from './discussion-time.js';

import styles from './discussion-activity.scss';

/**
 * @label Discussion Activity
 * @tag wc-discussion-activity
 * @rawTag discussion-activity
 *
 * @summary A one-line entry in a discussion for something that happened, such as a changed field or status.
 * @overview
 * <p>An activity entry records a change on the record the discussion belongs to, such as
 * "Ana Lima changed State from New to In progress", between the comments. It shows an
 * <code>icon</code>, the <code>author</code>, the change as inline Markdown in <code>value</code>
 * and the time from <code>datetime</code>, relative to now.</p>
 *
 * <p>Use it inside <code>wc-discussion</code>; Page Up and Page Down move through activity entries
 * and comments alike.</p>
 *
 * @slot - Replaces the Markdown text with your own content.
 *
 * @example
 * ```html
 * <wc-discussion-activity icon="swap_horiz" author="Ana Lima" datetime="2026-11-07T09:30:00Z"
 *   value="changed **State** from New to In progress"></wc-discussion-activity>
 * ```
 * @tags collaboration
 */
@IndividualComponent
export class DiscussionActivity extends LitElement {
  // ── Static ────────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ────────────────────────────────────────────────────────────

  /** Name of a Material Symbols icon for the kind of change. */
  @property({ type: String })
  icon = 'history';

  /** Who made the change. */
  @property({ type: String })
  author = '';

  /** When it happened, as ISO 8601. */
  @property({ type: String })
  datetime = '';

  /** What happened, as inline Markdown, after the author's name. */
  @property({ type: String })
  value = '';

  /** Address mentions link to, with `{id}`; see `wc-markdown`. `wc-discussion` sets it. */
  @property({ type: String, attribute: 'mention-href' })
  mentionHref = '';

  // ── Private fields ────────────────────────────────────────────────────────

  private readonly i18n = new I18nController(this);

  private readonly internals: ReturnType<HTMLElement['attachInternals']> =
    this.attachInternals();

  private stopTicking?: () => void;

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    this.internals.role = 'article';
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
    const { date } = this;
    const time = date ? formatRelativeTime(date, this.i18n.locale) : '';
    this.internals.ariaLabel = this.i18n.t('activityLabel')(
      this.author || this.i18n.t('commentUnknownAuthor'),
      time,
    );
  }

  // ── Private methods ───────────────────────────────────────────────────────

  private get date(): Date | null {
    return parseDatetime(this.datetime);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  render() {
    return html`<div class="activity">
      <span class="icon" aria-hidden="true"
        ><wc-icon name=${this.icon} size="sm"></wc-icon
      ></span>
      <div class="text">
        ${this.author
          ? html`<span class="author">${this.author}</span>`
          : nothing}
        <slot
          ><wc-markdown
            inline
            size="sm"
            mention-href=${this.mentionHref}
            .value=${this.value}
          ></wc-markdown
        ></slot>
        ${renderEntryTime(this.date, this.i18n.locale)}
      </div>
    </div>`;
  }
}
