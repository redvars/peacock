/**
 * Pure date utility functions (no external dependencies).
 */

import { resolveLocale } from '@/__internal/i18n/locale.js';

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function addHours(date: Date, hours: number): Date {
  const d = new Date(date);
  d.setHours(d.getHours() + hours);
  return d;
}

export function differenceInDays(dateA: Date, dateB: Date): number {
  const a = startOfDay(dateA);
  const b = startOfDay(dateB);
  return Math.round((a.valueOf() - b.valueOf()) / 86400000);
}

export function startOfWeek(
  date: Date,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1,
): Date {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  d.setDate(d.getDate() - diff);
  return d;
}

export function endOfWeek(
  date: Date,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1,
): Date {
  const d = startOfWeek(date, weekStartsOn);
  d.setDate(d.getDate() + 6);
  return endOfDay(d);
}

export function startOfMonth(date: Date): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfMonth(date: Date): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function calculateMonthRange(
  date: Date,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1,
) {
  const sd = startOfWeek(startOfMonth(date), weekStartsOn);
  const ed = endOfWeek(endOfMonth(date), weekStartsOn);
  return { startDate: sd, endDate: ed, totalDays: 42 };
}

export function calculateWeekRange(
  date: Date,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1,
) {
  const sd = startOfWeek(date, weekStartsOn);
  const ed = endOfWeek(date, weekStartsOn);
  return { startDate: sd, endDate: ed, totalDays: 7 };
}

export function calculateDateRange(
  view: string,
  contextDate: Date,
  days: number,
) {
  if (view === 'week') {
    return calculateWeekRange(contextDate, 1);
  }
  return {
    startDate: startOfDay(contextDate),
    endDate: endOfDay(addDays(contextDate, days - 1)),
    totalDays: days,
  };
}

export const LONG_EVENT_PADDING = 0.25;

/** `Intl` options for each display pattern; the output matches the pattern in `en-US`. */
const DISPLAY_FORMATS: Record<string, Intl.DateTimeFormatOptions> = {
  'MMMM d, yyyy': { month: 'long', day: 'numeric', year: 'numeric' },
  EEEE: { weekday: 'long' },
  E: { weekday: 'short' },
  d: { day: 'numeric' },
  dd: { day: '2-digit' },
  'hh a': { hour: '2-digit' },
  'hh:mm a': { hour: '2-digit', minute: '2-digit' },
};

/**
 * Formats a date for display in `locale`. The patterns name the `en-US` output; other locales get
 * their own month and day names, order and clock. `dd-MM-yyyy` is a fixed key, not display text.
 */
export function formatDate(
  date: Date,
  pattern: string,
  locale: string = resolveLocale(),
): string {
  if (pattern === 'dd-MM-yyyy') {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}-${month}-${date.getFullYear()}`;
  }
  const options = DISPLAY_FORMATS[pattern];
  if (!options) return date.toLocaleDateString(locale);
  return new Intl.DateTimeFormat(locale, options).format(date);
}

export function getTimePercent(date: Date, forDay?: Date): number {
  const day = forDay || date;
  const sd = startOfDay(day);
  const ed = endOfDay(day);
  const percent =
    ((date.valueOf() - sd.valueOf()) / (ed.valueOf() - sd.valueOf())) * 100;
  if (percent < 0) return 0;
  if (percent > 100) return 100;
  return percent;
}
