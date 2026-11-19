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

/** Milliseconds in a day of 24 hours. */
export const DAY_MS = 86400000;

/** Milliseconds in a minute. */
export const MINUTE_MS = 60000;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Whether `date` is at local midnight. */
export function isMidnight(date: Date): boolean {
  return (
    date.getHours() === 0 &&
    date.getMinutes() === 0 &&
    date.getSeconds() === 0 &&
    date.getMilliseconds() === 0
  );
}

/**
 * Whether a range belongs in the all-day row: it lasts a day or more, or runs from one midnight to
 * a later one (a day the clocks go forward on has only 23 hours).
 */
export function isAllDayRange(start: Date, end: Date): boolean {
  const length = end.valueOf() - start.valueOf();
  return (
    length >= DAY_MS || (length > 0 && isMidnight(start) && isMidnight(end))
  );
}

/**
 * The last day a range covers. `end` is exclusive, so a range that ends at midnight ends the day
 * before. Never earlier than the day of `start`.
 */
export function lastDayOf(start: Date, end: Date): Date {
  const first = startOfDay(start);
  const last = startOfDay(new Date(end.valueOf() - 1));
  return last.valueOf() < first.valueOf() ? first : last;
}

/**
 * Whether the range `start`–`end` (end exclusive) shares time with `from`–`to`. A range without
 * length counts when its instant falls inside.
 */
export function rangesOverlap(
  start: Date,
  end: Date,
  from: Date,
  to: Date,
): boolean {
  if (start.valueOf() >= end.valueOf()) {
    return start.valueOf() >= from.valueOf() && start.valueOf() < to.valueOf();
  }
  return start.valueOf() < to.valueOf() && end.valueOf() > from.valueOf();
}

/** The time at `fraction` (0 to 1) down `day`'s column: the inverse of `getTimePercent`. */
export function timeAtFraction(day: Date, fraction: number): Date {
  const sd = startOfDay(day);
  const ed = endOfDay(day);
  return new Date(
    sd.valueOf() + clamp(fraction, 0, 1) * (ed.valueOf() - sd.valueOf()),
  );
}

/**
 * `date` moved to a multiple of `minutes` after the start of `day` (by default its own day): the
 * nearest one, or the one before or after. The result stays within `day`, whose end is the next
 * midnight.
 */
export function snapTime(
  date: Date,
  minutes: number,
  mode: 'round' | 'floor' | 'ceil' = 'round',
  day: Date = date,
): Date {
  const sd = startOfDay(day);
  const length = addDays(sd, 1).valueOf() - sd.valueOf();
  const step = Math.max(1, minutes) * MINUTE_MS;
  const steps = Math[mode]((date.valueOf() - sd.valueOf()) / step);
  return new Date(sd.valueOf() + clamp(steps * step, 0, length));
}

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

/** `format.formatRange`, or both dates joined by a dash where it is missing or throws. */
function formatRange(
  format: Intl.DateTimeFormat,
  start: Date,
  end: Date,
): string {
  try {
    return format.formatRange(start, end);
  } catch {
    return `${format.format(start)} – ${format.format(end)}`;
  }
}

/**
 * When an event happens, for example `Nov 6, 2026, 9:00 – 9:30 AM`. An all-day event shows its
 * days only, through the day before an `end` at midnight.
 */
export function formatEventWhen(
  start: Date,
  end: Date,
  locale: string,
  allDay = false,
): string {
  if (allDay) {
    const format = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });
    return formatRange(format, start, lastDayOf(start, end));
  }
  const format = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  return formatRange(format, start, end);
}

/** The times of a range without its date, for example `9:00 – 10:30 AM`. */
export function formatTimeRange(
  start: Date,
  end: Date,
  locale: string,
): string {
  const format = new Intl.DateTimeFormat(locale, { timeStyle: 'short' });
  return formatRange(format, start, end);
}

/** Accessible name of an event: its title and when it happens, for example `Standup, Nov 6, 2026, 9:00 – 9:30 AM`. */
export function formatEventLabel(
  title: string,
  start: Date,
  end: Date,
  locale: string,
  allDay = false,
): string {
  const when = formatEventWhen(start, end, locale, allDay);
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
