import { html } from 'lit';
import { property } from 'lit/decorators.js';

import IndividualComponent from '@/IndividualComponent.js';
import PickerField, { type ValueProblem } from '@/__internal/picker-field.js';
import {
  type WeekDay,
  formatDate,
  isWithin,
  localeDatePattern,
  parseDateText,
  parseIsoDate,
  parseRange,
  parseRangeText,
} from '@/__internal/utils/date.js';
import styles from './date-field.scss';

/**
 * @label Date Field
 * @tag wc-date-field
 * @rawTag date-field
 *
 * @summary A text field for a date or a date range, with a calendar to pick from.
 * @overview
 * <p>Date field shows the date in the locale's format. Type a date, or open the calendar
 * (<code>wc-date-picker</code>) from the button or with Alt+Down. Typed text is read when the field
 * loses focus or on Enter; text that is not a date, or is outside <code>min</code>/<code>max</code>,
 * shows an error and keeps the previous value.</p>
 * <p>With <code>range</code> it holds a start and an end date. The value is always ISO
 * (<code>2026-11-06</code>, or <code>2026-11-03/2026-11-09</code> for a range), and it is
 * form-associated: the value is submitted under its <code>name</code>.</p>
 *
 * @fires {CustomEvent<{value: string}>} input - Dispatched when the start of a range is picked.
 * @fires {CustomEvent<{value: string}>} change - Dispatched when a date or range is committed, by typing or picking.
 *
 * @example
 * ```html
 * <wc-date-field label="Start date" value="2026-11-06"></wc-date-field>
 * ```
 * @example
 * ```html
 * <wc-date-field label="Trip" range value="2026-11-03/2026-11-09"></wc-date-field>
 * ```
 * @tags input, form
 */
@IndividualComponent
export class DateField extends PickerField {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** Holds a start and an end date (`start/end`) instead of a single date. */
  @property({ type: Boolean, reflect: true }) range = false;

  /** Earliest allowed date (`YYYY-MM-DD`). */
  @property({ type: String }) min = '';

  /** Latest allowed date (`YYYY-MM-DD`). */
  @property({ type: String }) max = '';

  /** First day of the week in the calendar, 0 (Sunday) to 6; defaults to the locale's. */
  @property({ type: Number, attribute: 'first-day-of-week' })
  firstDayOfWeek?: WeekDay;

  /** Months shown side by side in the calendar; defaults to 2 for a range, else 1. */
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

  // ── Protected methods ────────────────────────────────────────────────────

  protected closeOnCommit(value: string): boolean {
    if (!this.range) return true;
    const [start, end] = parseRange(value);
    return !!start && !!end;
  }

  protected parseText(text: string): string | null {
    return this.range
      ? parseRangeText(text, this.resolvedLocale)
      : parseDateText(text, this.resolvedLocale);
  }

  protected formatValue(value: string): string {
    const locale = this.resolvedLocale;
    if (!this.range)
      return parseIsoDate(value) ? formatDate(value, locale) : '';
    const [start, end] = parseRange(value);
    if (!start) return '';
    return `${formatDate(start, locale)} – ${end ? formatDate(end, locale) : ''}`.trim();
  }

  protected formatHint(): string {
    const pattern = localeDatePattern(this.resolvedLocale);
    return this.range ? `${pattern} – ${pattern}` : pattern;
  }

  protected validateValue(value: string): ValueProblem | null {
    const dates = this.range ? parseRange(value) : [value];
    const min = this.min || undefined;
    const max = this.max || undefined;
    for (const date of dates) {
      if (min && date < min) {
        return {
          flag: 'rangeUnderflow',
          message: this.i18n.t('pickDateOnOrAfter')(
            formatDate(min, this.resolvedLocale),
          ),
        };
      }
      if (max && date > max) {
        return {
          flag: 'rangeOverflow',
          message: this.i18n.t('pickDateOnOrBefore')(
            formatDate(max, this.resolvedLocale),
          ),
        };
      }
      if (isWithin(date, min, max) && this.isDateDisabled?.(date)) {
        return {
          flag: 'badInput',
          message: this.i18n.t('dateUnavailable')(
            formatDate(date, this.resolvedLocale),
          ),
        };
      }
    }
    return null;
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
