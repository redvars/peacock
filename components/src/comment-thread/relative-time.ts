/** Relative and absolute times of comments, and one shared clock that refreshes them. */

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30.44 * DAY;
const YEAR = 365.25 * DAY;

/** Parses an ISO 8601 date-time (or anything `Date` reads); `null` when it is not a date. */
export function parseDatetime(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** `date` relative to `now` in `locale`, such as "5 minutes ago", "yesterday" or "now". */
export function formatRelativeTime(
  date: Date,
  locale: string,
  now: number = Date.now(),
): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const seconds = (date.getTime() - now) / 1000;
  const abs = Math.abs(seconds);
  if (abs < 45) return rtf.format(0, 'second');
  if (abs < 45 * MINUTE)
    return rtf.format(Math.round(seconds / MINUTE), 'minute');
  if (abs < 22 * HOUR) return rtf.format(Math.round(seconds / HOUR), 'hour');
  if (abs < 6.5 * DAY) return rtf.format(Math.round(seconds / DAY), 'day');
  if (abs < 26 * DAY) return rtf.format(Math.round(seconds / WEEK), 'week');
  if (abs < 320 * DAY) return rtf.format(Math.round(seconds / MONTH), 'month');
  return rtf.format(Math.round(seconds / YEAR), 'year');
}

/** `date` as an absolute date and time in `locale`, such as "Nov 7, 2026, 3:04 PM". */
export function formatAbsoluteTime(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

const listeners = new Set<() => void>();

let timer: ReturnType<typeof setInterval> | undefined;

/**
 * Calls `listener` once a minute, so relative times stay current. One timer serves every
 * comment on the page and stops when the last one disconnects. Returns the unsubscribe function.
 */
export function onMinuteTick(listener: () => void): () => void {
  listeners.add(listener);
  timer ??= setInterval(() => {
    for (const each of listeners) each();
  }, 60_000);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer !== undefined) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}
