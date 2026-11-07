import { html } from 'lit';
import { property } from 'lit/decorators.js';

import IndividualComponent from '@/IndividualComponent.js';
import PickerField, { type ValueProblem } from '@/__internal/picker-field.js';
import {
  type HourCycle,
  formatTime,
  parseIsoTime,
  parseTimeText,
  resolveHourCycle,
} from '@/__internal/utils/date.js';
import styles from './time-field.scss';

/** Compares two ISO times, with or without seconds. */
function compareTime(a: string, b: string): number {
  const pa = parseIsoTime(a);
  const pb = parseIsoTime(b);
  if (!pa || !pb) return 0;
  const sa = pa.hour * 3600 + pa.minute * 60 + pa.second;
  const sb = pb.hour * 3600 + pb.minute * 60 + pb.second;
  return sa - sb;
}

/**
 * @label Time Field
 * @tag wc-time-field
 * @rawTag time-field
 *
 * @summary A text field for a time of day, with columns to pick from.
 * @overview
 * <p>Time field shows the time in the locale's format. Type a time (<code>9:30</code>,
 * <code>930</code>, <code>9:30 pm</code>, <code>21:30</code>), or open the time picker
 * (<code>wc-time-picker</code>) from the button or with Alt+Down. Typed text is read when the
 * field loses focus or on Enter.</p>
 * <p>The value is always a 24-hour ISO time (<code>09:30</code>), and it is form-associated.</p>
 *
 * @fires {CustomEvent<{value: string}>} input - Dispatched while the time changes in the picker.
 * @fires {CustomEvent<{value: string}>} change - Dispatched when a time is committed, by typing, picking the last column, or closing the picker.
 *
 * @example
 * ```html
 * <wc-time-field label="Start time" value="09:30" minute-step="15"></wc-time-field>
 * ```
 * @tags input, form
 */
@IndividualComponent
export class TimeField extends PickerField {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** Minutes between entries in the picker's minute column. */
  @property({ type: Number, attribute: 'minute-step' }) minuteStep = 1;

  /** The value's format: `HH:mm:ss` with seconds (and a seconds column), else `HH:mm`. */
  @property({ type: Boolean }) seconds = false;

  /** `h12` or `h23`; defaults to the locale's. */
  @property({ type: String, attribute: 'hour-cycle' }) hourCycle?: HourCycle;

  /** Earliest allowed time (`HH:mm`). */
  @property({ type: String }) min = '';

  /** Latest allowed time (`HH:mm`). */
  @property({ type: String }) max = '';

  // ── Protected fields ─────────────────────────────────────────────────────

  protected readonly pickerIcon = 'schedule';

  protected get pickerLabel(): string {
    return this.i18n.t('chooseTime');
  }

  // ── Protected methods ────────────────────────────────────────────────────

  protected closeOnCommit(): boolean {
    return true;
  }

  protected parseText(text: string): string | null {
    return parseTimeText(text, this.seconds);
  }

  protected formatValue(value: string): string {
    return parseIsoTime(value)
      ? formatTime(
          value,
          this.resolvedLocale,
          this.resolvedHourCycle,
          this.seconds,
        )
      : '';
  }

  protected formatHint(): string {
    const h12 = this.resolvedHourCycle === 'h12';
    const base = this.seconds ? 'hh:mm:ss' : 'hh:mm';
    return h12 ? `${base} AM` : base;
  }

  protected validateValue(value: string): ValueProblem | null {
    const locale = this.resolvedLocale;
    if (this.min && compareTime(value, this.min) < 0) {
      return {
        flag: 'rangeUnderflow',
        message: this.i18n.t('pickTimeAtOrAfter')(
          formatTime(this.min, locale, this.resolvedHourCycle),
        ),
      };
    }
    if (this.max && compareTime(value, this.max) > 0) {
      return {
        flag: 'rangeOverflow',
        message: this.i18n.t('pickTimeAtOrBefore')(
          formatTime(this.max, locale, this.resolvedHourCycle),
        ),
      };
    }
    return null;
  }

  protected renderPicker() {
    return html`
      <wc-time-picker
        class="picker"
        .value=${this.value}
        minute-step=${this.minuteStep}
        ?seconds=${this.seconds}
        .hourCycle=${this.hourCycle}
        min=${this.min}
        max=${this.max}
        locale=${this.locale}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        @input=${this.handlePickerInput}
        @change=${this.handlePickerChange}
      ></wc-time-picker>
    `;
  }

  // ── Private getters ──────────────────────────────────────────────────────

  private get resolvedHourCycle(): HourCycle {
    return resolveHourCycle(this.hourCycle, this.resolvedLocale);
  }
}
