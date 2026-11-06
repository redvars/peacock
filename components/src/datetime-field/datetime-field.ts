import { html } from 'lit';
import { property } from 'lit/decorators.js';

import IndividualComponent from '@/IndividualComponent.js';
import PickerField, { type ValueProblem } from '@/__internal/picker-field.js';
import {
  type HourCycle,
  type WeekDay,
  formatDate,
  formatTime,
  localeDatePattern,
  localeHourCycle,
  parseDateText,
  parseIsoDateTime,
  parseTimeText,
  todayIso,
} from '@/__internal/utils/date.js';
import styles from './datetime-field.scss';

/**
 * @label Date Time Field
 * @tag wc-datetime-field
 * @rawTag datetime-field
 *
 * @summary A text field for a date and a time, with a calendar and time columns to pick from.
 * @overview
 * <p>Date time field shows a date and a time in the locale's format, such as
 * <code>11/06/2026, 9:30 AM</code>. Type both, or open the picker, which shows
 * <code>wc-date-picker</code> and <code>wc-time-picker</code> side by side. Picking a date keeps the
 * time; picking a time first uses today's date.</p>
 * <p>The value is a local ISO date-time (<code>2026-11-06T09:30</code>), and it is form-associated.</p>
 *
 * @fires {CustomEvent<{value: string}>} input - Dispatched while the date or time changes in the picker.
 * @fires {CustomEvent<{value: string}>} change - Dispatched when a value is committed, by typing or when the picker closes.
 *
 * @example
 * ```html
 * <wc-datetime-field label="Meeting" value="2026-11-06T09:30" step="15"></wc-datetime-field>
 * ```
 * @tags input, form
 */
@IndividualComponent
export class DatetimeField extends PickerField {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** Earliest allowed date-time (`YYYY-MM-DDTHH:mm`). */
  @property({ type: String }) min = '';

  /** Latest allowed date-time (`YYYY-MM-DDTHH:mm`). */
  @property({ type: String }) max = '';

  /** Minutes between entries in the minute column. */
  @property({ type: Number }) step = 1;

  /** `h12` or `h23`; defaults to the locale's. */
  @property({ type: String, attribute: 'hour-cycle' }) hourCycle?: HourCycle;

  /** First day of the week in the calendar, 0 (Sunday) to 6; defaults to the locale's. */
  @property({ type: Number, attribute: 'first-day-of-week' })
  firstDayOfWeek?: WeekDay;

  // ── Protected fields ─────────────────────────────────────────────────────

  protected readonly pickerIcon = 'calendar_clock';

  protected get pickerLabel(): string {
    return this.i18n.t('chooseDateAndTime');
  }

  // ── Protected methods ────────────────────────────────────────────────────

  /** The picker stays open so both parts can be set; it commits when it closes. */
  protected closeOnCommit(): boolean {
    return false;
  }

  protected parseText(text: string): string | null {
    const trimmed = text.trim();
    const iso = /^(\d{4}-\d{2}-\d{2})[T\s]+(.+)$/.exec(trimmed);
    let datePart: string;
    let timePart: string;
    if (iso) {
      [, datePart, timePart] = iso;
    } else if (trimmed.includes(',')) {
      const at = trimmed.indexOf(',');
      datePart = trimmed.slice(0, at);
      timePart = trimmed.slice(at + 1);
    } else {
      const at = trimmed.search(/\s/);
      if (at === -1) return null;
      datePart = trimmed.slice(0, at);
      timePart = trimmed.slice(at + 1);
    }
    const date = parseDateText(datePart, this.resolvedLocale);
    const time = parseTimeText(timePart);
    return date && time ? `${date}T${time}` : null;
  }

  protected formatValue(value: string): string {
    const parts = parseIsoDateTime(value);
    if (!parts) return '';
    const locale = this.resolvedLocale;
    return `${formatDate(parts.date, locale)}, ${formatTime(parts.time, locale, this.resolvedHourCycle)}`;
  }

  protected formatHint(): string {
    const time = this.resolvedHourCycle === 'h12' ? 'hh:mm AM' : 'hh:mm';
    return `${localeDatePattern(this.resolvedLocale)}, ${time}`;
  }

  protected validateValue(value: string): ValueProblem | null {
    if (this.min && value < this.min) {
      return {
        flag: 'rangeUnderflow',
        message: this.i18n.t('pickDateTimeOnOrAfter')(
          this.formatValue(this.min),
        ),
      };
    }
    if (this.max && value > this.max) {
      return {
        flag: 'rangeOverflow',
        message: this.i18n.t('pickDateTimeOnOrBefore')(
          this.formatValue(this.max),
        ),
      };
    }
    return null;
  }

  protected renderPicker() {
    const parts = parseIsoDateTime(this.value);
    const minParts = parseIsoDateTime(this.min);
    const maxParts = parseIsoDateTime(this.max);
    // Time limits only apply on the first and last allowed days.
    const timeMin =
      minParts && parts?.date === minParts.date ? minParts.time : '';
    const timeMax =
      maxParts && parts?.date === maxParts.date ? maxParts.time : '';
    return html`
      <div class="picker-layout">
        <wc-date-picker
          class="picker"
          .value=${parts?.date ?? ''}
          min=${minParts?.date ?? ''}
          max=${maxParts?.date ?? ''}
          locale=${this.locale}
          .firstDayOfWeek=${this.firstDayOfWeek}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          @change=${this.handleDateChange}
        ></wc-date-picker>
        <wc-time-picker
          class="time-picker"
          .value=${parts?.time ?? ''}
          step=${this.step}
          .hourCycle=${this.hourCycle}
          min=${timeMin}
          max=${timeMax}
          locale=${this.locale}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          @input=${this.handleTimeChange}
          @change=${this.handleTimeChange}
        ></wc-time-picker>
      </div>
    `;
  }

  // ── Private getters ──────────────────────────────────────────────────────

  private get resolvedHourCycle(): HourCycle {
    return this.hourCycle ?? localeHourCycle(this.resolvedLocale);
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private handleDateChange(event: CustomEvent<{ value: string }>) {
    event.stopPropagation();
    if (!event.detail.value) return;
    const time = parseIsoDateTime(this.value)?.time ?? '00:00';
    this.preview(this.clamp(`${event.detail.value}T${time}`));
  }

  private handleTimeChange(event: CustomEvent<{ value: string }>) {
    event.stopPropagation();
    const date = parseIsoDateTime(this.value)?.date ?? todayIso();
    this.preview(this.clamp(`${date}T${event.detail.value}`));
  }

  private clamp(value: string): string {
    if (this.min && value < this.min) return this.min;
    if (this.max && value > this.max) return this.max;
    return value;
  }
}
