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
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1,
) {
  if (view === 'week') {
    return calculateWeekRange(contextDate, weekStartsOn);
  }
  return {
    startDate: startOfDay(contextDate),
    endDate: endOfDay(addDays(contextDate, days - 1)),
    totalDays: days,
  };
}

export const LONG_EVENT_PADDING = 0.25;

/** Wall-clock date and time fields; `month` is 1–12. */
export type WallClockParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

/**
 * The wall-clock fields `date` shows in `timeZone` (an IANA name such as `America/New_York`),
 * read from `Intl.DateTimeFormat#formatToParts`. Throws a `RangeError` for an unknown zone.
 */
export function zonedParts(date: Date, timeZone: string): WallClockParts {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  }).formatToParts(date);
  const field = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find(part => part.type === type)?.value ?? 0);
  return {
    year: field('year'),
    month: field('month'),
    day: field('day'),
    // Some engines print midnight as 24 even with `h23`.
    hour: field('hour') % 24,
    minute: field('minute'),
    second: field('second'),
  };
}

/**
 * A `Date` whose local fields show the wall-clock time `date` has in `timeZone`, so the views can
 * lay it out with local getters. An empty or unknown zone returns a copy of `date`.
 */
export function toZonedWallClock(date: Date, timeZone: string): Date {
  if (!timeZone) return new Date(date);
  try {
    const { year, month, day, hour, minute, second } = zonedParts(
      date,
      timeZone,
    );
    const wall = new Date(
      year,
      month - 1,
      day,
      hour,
      minute,
      second,
      date.getMilliseconds(),
    );
    // Two-digit years would otherwise land in the 1900s.
    wall.setFullYear(year);
    return wall;
  } catch {
    return new Date(date);
  }
}

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

/** Accessible name of an event: its title and when it happens, for example `Standup, Nov 6, 2026, 9:00 – 9:30 AM`. */
export function formatEventLabel(
  title: string,
  start: Date,
  end: Date,
  locale: string,
  allDay = false,
): string {
  const format = new Intl.DateTimeFormat(
    locale,
    allDay
      ? { dateStyle: 'medium' }
      : { dateStyle: 'medium', timeStyle: 'short' },
  );
  let when: string;
  try {
    when = format.formatRange(start, end);
  } catch {
    when = `${format.format(start)} – ${format.format(end)}`;
  }
  return title ? `${title}, ${when}` : when;
}

/** Runs `action` on Enter or Space, the keys that activate a button. */
export function onActivateKey(action: () => void) {
  return (event: KeyboardEvent) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    action();
  };
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
