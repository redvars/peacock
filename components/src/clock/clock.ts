import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import IndividualComponent from '@/IndividualComponent.js';
import { resolveLocale } from '@/__internal/i18n/locale.js';
import { ClockController } from './ClockController.js';

import styles from './clock.scss';

/**
 * @label Clock
 * @tag wc-clock
 * @rawTag clock
 * @summary Displays the current time in a given timezone.
 * @overview
 *  - Clocks are used to display the current time in a specified timezone.
 *  - The time is formatted for `locale` (by default the nearest `lang`), so 12- or 24-hour time follows the locale.
 *  - The time updates once a second, on the second.
 * @tags display
 *
 * @example
 * ```html
 * <wc-clock></wc-clock>
 * ```
 */
@IndividualComponent
export class Clock extends LitElement {
  static styles = [styles];

  /** IANA timezone to show the time in, for example `Europe/Berlin`. Defaults to the local timezone. */
  @property() timezone?: string;

  /**
   * BCP 47 locale used to format the time. Defaults to the nearest `lang`, then the document's,
   * then the browser language.
   */
  @property() locale?: string;

  // ── Private fields ────────────────────────────────────────────────────────

  /** Ticks once a second, aligned to the second boundary. */
  readonly clockController = new ClockController(this, 1000);

  // ── Private ───────────────────────────────────────────────────────────────

  private formatTime(date: Date) {
    return date.toLocaleTimeString(resolveLocale(this.locale, this), {
      timeZone: this.timezone,
    });
  }

  // ── Render ────────────────────────────────────────────────────────────────

  render() {
    return html`<div class="current-time">
      ${this.formatTime(this.clockController.value)}
    </div>`;
  }
}
