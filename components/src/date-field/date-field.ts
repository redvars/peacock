import { html, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';

import IndividualComponent from '@/IndividualComponent.js';
import PickerField, { type ValueProblem } from '@/__internal/picker-field.js';
import { deprecate } from '@/__internal/utils/deprecate.js';
import {
  type WeekDay,
  localeDatePattern,
  parseDateText,
  parseRange,
  parseRangeText,
} from '@/__internal/utils/date.js';
import {
  formatDateValue,
  formatRangeValue,
  isCompleteRange,
  rangeFormatHint,
  validateDates,
} from './range-utils.js';
import styles from './date-field.scss';

/**
 * @label Date Field
 * @tag wc-date-field
 * @rawTag date-field
 *
 * @summary A text field for a date, with a calendar to pick from.
 * @overview
 * <p>Date field shows the date in the locale's format. Type a date, or open the calendar
 * (<code>wc-date-picker</code>) from the button or with Alt+Down. Typed text is read when the field
 * loses focus or on Enter; text that is not a date, or is outside <code>min</code>/<code>max</code>,
 * shows an error and keeps the previous value.</p>
 * <p>The value is always ISO (<code>2026-11-06</code>), and it is form-associated: the value is
 * submitted under its <code>name</code>.</p>
 * <p><code>range</code> and <code>months</code> are deprecated: use <code>wc-date-range-field</code>
 * for a start and an end date. They keep working until 4.0.</p>
 *
 * @fires {CustomEvent<{value: string}>} input - Dispatched when the start of a range is picked (deprecated `range` mode).
 * @fires {CustomEvent<{value: string}>} change - Dispatched when a date is committed, by typing or picking.
 *
 * @example
 * ```html
 * <wc-date-field label="Start date" value="2026-11-06"></wc-date-field>
 * ```
 * @tags input, form
 */
@IndividualComponent
export class DateField extends PickerField {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /**
   * Holds a start and an end date (`start/end`) instead of a single date.
   * @deprecated Use `wc-date-range-field`; it will be removed in 4.0.
   */
  @property({ type: Boolean, reflect: true }) range = false;

  /** Earliest allowed date (`YYYY-MM-DD`). */
  @property({ type: String }) min = '';

  /** Latest allowed date (`YYYY-MM-DD`). */
  @property({ type: String }) max = '';

  /** First day of the week in the calendar, 0 (Sunday) to 6; defaults to the locale's. */
  @property({ type: Number, attribute: 'first-day-of-week' })
  firstDayOfWeek?: WeekDay;

  /**
   * Months shown side by side in the calendar; defaults to 2 for a range, else 1.
   * @deprecated Use `wc-date-range-field`, which has `months`; it will be removed in 4.0.
   */
  @property({ type: Number }) months?: 1 | 2;

  /** Shows Today and Clear buttons in the calendar. */
  @property({ type: Boolean, attribute: 'show-actions' }) showActions = false;

  /** Return true for dates that cannot be picked, such as holidays. */
  @property({ attribute: false }) isDateDisabled?: (iso: string) => boolean;

  // ── Protected fields ─────────────────────────────────────────────────────

  protected readonly pickerIcon = 'calendar_today';

  protected get pickerLabel(): string {
    return this.i18n.t('chooseDate');
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────

  protected override willUpdate(changed: PropertyValues<this>) {
    super.willUpdate(changed);
    if (changed.has('range') && this.range) {
      deprecate('wc-date-field', '`range`', 'wc-date-range-field');
    }
    if (changed.has('months') && this.months !== undefined) {
      deprecate('wc-date-field', '`months`', 'wc-date-range-field');
    }
  }

  // ── Protected methods ────────────────────────────────────────────────────

  protected closeOnCommit(value: string): boolean {
    return this.range ? isCompleteRange(value) : true;
  }

  protected parseText(text: string): string | null {
    return this.range
      ? parseRangeText(text, this.resolvedLocale)
      : parseDateText(text, this.resolvedLocale);
  }

  protected formatValue(value: string): string {
    return this.range
      ? formatRangeValue(value, this.resolvedLocale)
      : formatDateValue(value, this.resolvedLocale);
  }

  protected formatHint(): string {
    return this.range
      ? rangeFormatHint(this.resolvedLocale)
      : localeDatePattern(this.resolvedLocale);
  }

  protected validateValue(value: string): ValueProblem | null {
    return validateDates(
      this.range ? parseRange(value) : [value],
      this,
      this.resolvedLocale,
      this.i18n,
    );
  }

  protected renderPicker() {
    return html`
      <wc-date-picker
        class="picker"
        .value=${this.value}
        ?range=${this.range}
        min=${this.min}
        max=${this.max}
        locale=${this.locale}
        .firstDayOfWeek=${this.firstDayOfWeek}
        .months=${this.months ?? (this.range ? 2 : 1)}
        ?show-actions=${this.showActions}
        .isDateDisabled=${this.isDateDisabled}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        @input=${this.handlePickerInput}
        @change=${this.handlePickerChange}
      ></wc-date-picker>
    `;
  }
}
