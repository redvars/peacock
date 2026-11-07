import { html, nothing } from 'lit';
import { property } from 'lit/decorators.js';

import IndividualComponent from '@/IndividualComponent.js';
import PickerField, { type ValueProblem } from '@/__internal/picker-field.js';
import {
  type WeekDay,
  parseRange,
  parseRangeText,
  toRange,
} from '@/__internal/utils/date.js';
import {
  formatRangeValue,
  isCompleteRange,
  rangeFormatHint,
  validateDates,
} from '../date-field/range-utils.js';
import styles from './date-range-field.scss';

/** A ready-made range shown beside the calendar, such as "Last 7 days". */
export interface DateRangePreset {
  /** Text of the preset's button. */
  label: string;
  /** First day of the range (`YYYY-MM-DD`). */
  start: string;
  /** Last day of the range (`YYYY-MM-DD`). */
  end: string;
}

/**
 * @label Date Range Field
 * @tag wc-date-range-field
 * @rawTag date-range-field
 *
 * @summary A text field for a start and an end date, with a calendar to pick the range from.
 * @overview
 * <p>Date range field shows the range in the locale's format. Type two dates joined by a dash
 * (<code>11/3/2026 - 11/9/2026</code>), or open the calendar (<code>wc-date-picker</code>) from the
 * button or with Alt+Down and pick the start, then the end. The calendar closes once the end is
 * picked. Text that is not a range, or has a date outside <code>min</code>/<code>max</code>, shows
 * an error and keeps the previous value.</p>
 * <p><code>presets</code> adds a list of ready-made ranges beside the calendar; picking one sets
 * and commits it. The value is two ISO dates joined by a slash (<code>2026-11-03/2026-11-09</code>)
 * and is submitted under the field's <code>name</code>.</p>
 *
 * @fires {CustomEvent<{value: string}>} input - Dispatched when the start of the range is picked, and before `change` when a preset is picked.
 * @fires {CustomEvent<{value: string}>} change - Dispatched when a range is committed, by typing, picking the end or picking a preset.
 *
 * @example
 * ```html
 * <wc-date-range-field label="Trip" value="2026-11-03/2026-11-09"></wc-date-range-field>
 * ```
 * @example
 * ```html
 * <wc-date-range-field
 *   label="Report period"
 *   presets='[{"label":"November","start":"2026-11-01","end":"2026-11-30"}]'
 * ></wc-date-range-field>
 * ```
 * @tags input, form
 */
@IndividualComponent
export class DateRangeField extends PickerField {
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

  /** Months shown side by side in the calendar. */
  @property({ type: Number }) months: 1 | 2 = 2;

  /**
   * Ready-made ranges listed beside the calendar, as `{ label, start, end }` with ISO dates.
   * From HTML, pass them as JSON.
   */
  @property({ type: Array }) presets: DateRangePreset[] = [];

  /** Shows Today and Clear buttons in the calendar. */
  @property({ type: Boolean, attribute: 'show-actions' }) showActions = false;

  /** Return true for dates that cannot be picked, such as holidays. */
  @property({ attribute: false }) isDateDisabled?: (iso: string) => boolean;

  // ── Protected fields ─────────────────────────────────────────────────────

  protected readonly pickerIcon = 'date_range';

  protected get pickerLabel(): string {
    return this.i18n.t('chooseDateRange');
  }

  // ── Protected methods ────────────────────────────────────────────────────

  protected closeOnCommit(value: string): boolean {
    return isCompleteRange(value);
  }

  protected parseText(text: string): string | null {
    return parseRangeText(text, this.resolvedLocale);
  }

  protected formatValue(value: string): string {
    return formatRangeValue(value, this.resolvedLocale);
  }

  protected formatHint(): string {
    return rangeFormatHint(this.resolvedLocale);
  }

  protected validateValue(value: string): ValueProblem | null {
    return validateDates(
      parseRange(value),
      this,
      this.resolvedLocale,
      this.i18n,
    );
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private presetValue(preset: DateRangePreset): string {
    const [start, end] = parseRange(toRange(preset.start, preset.end));
    if (!start || !end) return '';
    return start <= end ? toRange(start, end) : toRange(end, start);
  }

  private handlePresetClick(value: string) {
    this.preview(value);
    // Commits, closes the calendar and returns focus to the text, as picking the end does.
    this.handlePickerChange(new CustomEvent('change', { detail: { value } }));
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private renderPresets() {
    if (!this.presets.length) return nothing;
    return html`
      <ul class="presets" aria-label=${this.i18n.t('dateRangePresets')}>
        ${this.presets.map(preset => {
          const value = this.presetValue(preset);
          const unavailable =
            !value || !!this.validateValue(value) || this.readonly;
          return html`<li>
            <button
              type="button"
              class="preset"
              aria-pressed=${String(!!value && value === this.value)}
              ?disabled=${unavailable || this.disabled}
              @click=${() => this.handlePresetClick(value)}
            >
              ${preset.label}
            </button>
          </li>`;
        })}
      </ul>
    `;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  protected renderPicker() {
    return html`
      <div class="range-panel">
        ${this.renderPresets()}
        <wc-date-picker
          class="picker"
          .value=${this.value}
          range
          min=${this.min}
          max=${this.max}
          locale=${this.locale}
          .firstDayOfWeek=${this.firstDayOfWeek}
          .months=${this.months}
          ?show-actions=${this.showActions}
          .isDateDisabled=${this.isDateDisabled}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          @input=${this.handlePickerInput}
          @change=${this.handlePickerChange}
        ></wc-date-picker>
      </div>
    `;
  }
}
