import { html } from 'lit';
import { property } from 'lit/decorators.js';

import IndividualComponent from '@/IndividualComponent.js';
import PickerField, { type ValueProblem } from '@/__internal/picker-field.js';
import {
  type WeekDay,
  localeDatePattern,
  parseDateText,
} from '@/__internal/utils/date.js';
import { formatDateValue, validateDates } from './range-utils.js';
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
 * submitted under its <code>name</code>. For a start and an end date, use
 * <code>wc-date-range-field</code>.</p>
 *
 * @fires {CustomEvent<{value: string}>} input - Dispatched before `change` when the value is cleared with the clear button.
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

  /** Earliest allowed date (`YYYY-MM-DD`). */
  @property({ type: String }) min = '';

  /** Latest allowed date (`YYYY-MM-DD`). */
  @property({ type: String }) max = '';

  /** First day of the week in the calendar, 0 (Sunday) to 6; defaults to the locale's. */
  @property({ type: Number, attribute: 'first-day-of-week' })
  firstDayOfWeek?: WeekDay;

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

  protected closeOnCommit(): boolean {
    return true;
  }

  protected parseText(text: string): string | null {
    return parseDateText(text, this.resolvedLocale);
  }

  protected formatValue(value: string): string {
    return formatDateValue(value, this.resolvedLocale);
  }

  protected formatHint(): string {
    return localeDatePattern(this.resolvedLocale);
  }

  protected validateValue(value: string): ValueProblem | null {
    return validateDates([value], this, this.resolvedLocale, this.i18n);
  }

  protected renderPicker() {
    return html`
      <wc-date-picker
        class="picker"
        .value=${this.value}
        min=${this.min}
        max=${this.max}
        locale=${this.locale}
        .firstDayOfWeek=${this.firstDayOfWeek}
        ?show-actions=${this.showActions}
        .isDateDisabled=${this.isDateDisabled}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        @change=${this.handlePickerChange}
      ></wc-date-picker>
    `;
  }
}
