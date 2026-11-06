// Parsing, formatting and validation shared by `wc-date-field` and `wc-date-range-field`.
import type { I18nController } from '@/__internal/i18n/i18n-controller.js';
import type { ValueProblem } from '@/__internal/picker-field.js';
import {
  formatDate,
  isWithin,
  localeDatePattern,
  parseIsoDate,
  parseRange,
} from '@/__internal/utils/date.js';

/** The limits a picked or typed date is checked against. */
export interface DateLimits {
  /** Earliest allowed date (`YYYY-MM-DD`); empty for none. */
  min?: string;
  /** Latest allowed date (`YYYY-MM-DD`); empty for none. */
  max?: string;
  /** Returns true for dates that cannot be picked. */
  isDateDisabled?: (iso: string) => boolean;
}

/** Formats a single ISO date for display, or '' when it is not a date. */
export function formatDateValue(value: string, locale: string): string {
  return parseIsoDate(value) ? formatDate(value, locale) : '';
}

/** Formats a `start/end` range for display: `11/03/2026 – 11/09/2026`, or just the start. */
export function formatRangeValue(value: string, locale: string): string {
  const [start, end] = parseRange(value);
  if (!start) return '';
  return `${formatDate(start, locale)} – ${end ? formatDate(end, locale) : ''}`.trim();
}

/** The format hint for a range, such as `MM/DD/YYYY – MM/DD/YYYY`. */
export function rangeFormatHint(locale: string): string {
  const pattern = localeDatePattern(locale);
  return `${pattern} – ${pattern}`;
}

/** Whether a `start/end` value has both dates. */
export function isCompleteRange(value: string): boolean {
  const [start, end] = parseRange(value);
  return !!start && !!end;
}

/**
 * Checks each date against the limits and returns the first problem: before `min`, after `max`, or
 * a disabled date. Returns null when every date is allowed.
 */
export function validateDates(
  dates: readonly string[],
  limits: DateLimits,
  locale: string,
  i18n: Pick<I18nController, 't'>,
): ValueProblem | null {
  const min = limits.min || undefined;
  const max = limits.max || undefined;
  for (const date of dates) {
    if (min && date < min) {
      return {
        flag: 'rangeUnderflow',
        message: i18n.t('pickDateOnOrAfter')(formatDate(min, locale)),
      };
    }
    if (max && date > max) {
      return {
        flag: 'rangeOverflow',
        message: i18n.t('pickDateOnOrBefore')(formatDate(max, locale)),
      };
    }
    if (isWithin(date, min, max) && limits.isDateDisabled?.(date)) {
      return {
        flag: 'badInput',
        message: i18n.t('dateUnavailable')(formatDate(date, locale)),
      };
    }
  }
  return null;
}
