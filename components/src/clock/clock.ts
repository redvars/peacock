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
 * @summary The current time in a given timezone, formatted for the locale and updated every second.
 * @overview
 * <ul>
 * <li>Clocks are used to display the current time in a specified timezone.</li>
 * <li>The time is formatted for <code>locale</code> (by default the nearest <code>lang</code>), so
 * 12- or 24-hour time follows the locale.</li>
 * <li>The time updates once a second, on the second.</li>
 * </ul>
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
