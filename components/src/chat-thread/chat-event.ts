import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';

import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import {
  formatAbsoluteTime,
  formatClockTime,
  parseDatetime,
} from '@/__internal/utils/relative-time.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './chat-event.scss';

/**
 * @label Chat Event
 * @tag wc-chat-event
 * @rawTag chat-event
 * @summary A line in a conversation for something that happened rather than something said, such as "Alan Kay confirmed the rollback".
 * @overview
 * <p>Goes in <code>wc-chat-thread</code> between <code>wc-chat-message</code>s. It records what
 * happened to the conversation's subject: a person confirmed a draft, a record changed state,
 * someone joined. The content is the sentence; <code>icon</code> sets the glyph before it, and
 * <code>datetime</code> adds the time after it.</p>
 * <p>Use a message for anything someone wrote, and an event for anything the platform recorded.
 * Events are not announced as they arrive; the record they describe is what changed.</p>
 * @tags display, ai
 *
 * @slot - What happened. Bold the name of who did it with `<strong>`.
 *
 * @csspart event - The line.
 *
 * @example
 * ```html
 * <wc-chat-event icon="verified" datetime="2026-11-08T10:07:00">
 *   <strong>Alan Kay</strong> confirmed the rollback · policy NET-04
 * </wc-chat-event>
 * ```
 */
@IndividualComponent
export class ChatEvent extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** Material Symbols name of the glyph before the text, such as `verified`. */
  @property({ type: String }) icon = '';

  /** When it happened, as an ISO 8601 date-time; shown as a time after the text. */
  @property({ type: String }) datetime = '';

  /** Locale for the time; defaults to the nearest `lang`, else the browser's. */
  @property({ type: String }) locale?: string;

  // ── Private fields ───────────────────────────────────────────────────────

  private readonly i18n = new I18nController(this);

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const date = parseDatetime(this.datetime);
    const { locale } = this.i18n;
    return html`<p class="event" part="event">
      ${this.icon
        ? html`<wc-icon name=${this.icon} aria-hidden="true"></wc-icon>`
        : nothing}
      <span class="text"><slot></slot></span>
      ${date
        ? html`<time
            class="time"
            datetime=${this.datetime}
            title=${formatAbsoluteTime(date, locale)}
            >${formatClockTime(date, locale)}</time
          >`
        : nothing}
    </p>`;
  }
}
