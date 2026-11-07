/**
 * Relative and absolute times ("5 minutes ago", "in 3 days", "Nov 2"), and one shared ticker that
 * keeps every relative time on the page current. Used by `wc-relative-time`, `wc-comment` and
 * `wc-notification-center`.
 */

export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
export const WEEK = 7 * DAY;
export const MONTH = 30.44 * DAY;
export const YEAR = 365.25 * DAY;

/** `numeric` of `Intl.RelativeTimeFormat`: "yesterday" (`auto`) or "1 day ago" (`always`). */
export type RelativeTimeNumeric = 'auto' | 'always';

/** `style` of `Intl.RelativeTimeFormat`: "5 minutes ago", "5 min. ago" or "5m ago". */
export type RelativeTimeStyle = 'long' | 'short' | 'narrow';

export interface RelativeTimeOptions {
  /** "yesterday" (`auto`, the default) or "1 day ago" (`always`). */
  numeric?: RelativeTimeNumeric;
  /** `long` (the default), `short` or `narrow`. */
  style?: RelativeTimeStyle;
  /** The time to measure from, in milliseconds; defaults to `Date.now()`. */
  now?: number;
}

export interface TimeOptions extends RelativeTimeOptions {
  /**
   * Beyond this distance from now, in milliseconds, the time is an absolute date ("Nov 2")
   * instead of a relative one. Unset, it is always relative.
   */
  absoluteAfter?: number;
}

const relativeFormats = new Map<string, Intl.RelativeTimeFormat>();
const dateFormats = new Map<string, Intl.DateTimeFormat>();

function relativeFormat(
  locale: string,
  numeric: RelativeTimeNumeric,
  style: RelativeTimeStyle,
): Intl.RelativeTimeFormat {
  const key = `${locale}|${numeric}|${style}`;
  let format = relativeFormats.get(key);
  if (!format) {
    format = new Intl.RelativeTimeFormat(locale, { numeric, style });
    relativeFormats.set(key, format);
  }
  return format;
}

function dateFormat(
  locale: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const key = `${locale}|${JSON.stringify(options)}`;
  let format = dateFormats.get(key);
  if (!format) {
    format = new Intl.DateTimeFormat(locale, options);
    dateFormats.set(key, format);
  }
  return format;
}

function toTime(date: Date | number): number {
  return typeof date === 'number' ? date : date.getTime();
}

/** Parses an ISO 8601 date-time (or anything `Date` reads); `null` when it is not a date. */
export function parseDatetime(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Parses an ISO 8601 duration such as `P7D`, `PT12H` or `P1W` into milliseconds (months are 30.44
 * days, years 365.25); `null` when it is not a duration.
 */
export function parseDuration(value: string | null | undefined): number | null {
  if (!value) return null;
  const match =
    /^P(?:(\d+(?:\.\d+)?)Y)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)W)?(?:(\d+(?:\.\d+)?)D)?(?:T(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?)?$/i.exec(
      value.trim(),
    );
  if (!match || match.slice(1).every(part => part === undefined)) return null;
  const units = [YEAR, MONTH, WEEK, DAY, HOUR, MINUTE, SECOND];
  return units.reduce(
    (total, unit, index) => total + Number(match[index + 1] ?? 0) * unit,
    0,
  );
}

/**
 * The value and unit that describe a distance of `diff` milliseconds (negative is past): seconds
 * under 45 s, minutes under 45 min, hours under 22 h, days under 6.5 days, weeks under 26 days,
 * months under 320 days, then years. Under 45 s it is 0 seconds, which formats as "now".
 */
export function relativeTimeUnit(diff: number): {
  value: number;
  unit: Intl.RelativeTimeFormatUnit;
} {
  const abs = Math.abs(diff);
  const round = (unit: number) => Math.round(diff / unit) || 0;
  if (abs < 45 * SECOND) return { value: 0, unit: 'second' };
  if (abs < 45 * MINUTE) return { value: round(MINUTE), unit: 'minute' };
  if (abs < 22 * HOUR) return { value: round(HOUR), unit: 'hour' };
  if (abs < 6.5 * DAY) return { value: round(DAY), unit: 'day' };
  if (abs < 26 * DAY) return { value: round(WEEK), unit: 'week' };
  if (abs < 320 * DAY) return { value: round(MONTH), unit: 'month' };
  return { value: round(YEAR), unit: 'year' };
}

/** `date` relative to now in `locale`, such as "5 minutes ago", "in 3 days", "yesterday" or "now". */
export function formatRelativeTime(
  date: Date | number,
  locale: string,
  options: RelativeTimeOptions = {},
): string {
  const { numeric = 'auto', style = 'long', now = Date.now() } = options;
  const { value, unit } = relativeTimeUnit(toTime(date) - now);
  return relativeFormat(locale, numeric, style).format(value, unit);
}

/** `date` as an absolute date and time in `locale`, such as "Nov 7, 2026, 3:04 PM". */
export function formatAbsoluteTime(
  date: Date | number,
  locale: string,
): string {
  return dateFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(
    toTime(date),
  );
}

/** `date` as a short date in `locale`: "Nov 2" in the current year, else "Nov 2, 2025". */
export function formatAbsoluteDate(
  date: Date | number,
  locale: string,
  now: number = Date.now(),
): string {
  const time = toTime(date);
  const sameYear = new Date(time).getFullYear() === new Date(now).getFullYear();
  return dateFormat(
    locale,
    sameYear ? { month: 'short', day: 'numeric' } : { dateStyle: 'medium' },
  ).format(time);
}

/**
 * `date` relative to now ("5 minutes ago"), or, when `absoluteAfter` is set and the date is
 * farther from now than that, an absolute date ("Nov 2").
 */
export function formatTime(
  date: Date | number,
  locale: string,
  options: TimeOptions = {},
): string {
  const now = options.now ?? Date.now();
  const time = toTime(date);
  if (
    options.absoluteAfter !== undefined &&
    Math.abs(time - now) >= options.absoluteAfter
  ) {
    return formatAbsoluteDate(time, locale, now);
  }
  return formatRelativeTime(time, locale, { ...options, now });
}

/**
 * How soon a relative time `diff` milliseconds from now may read differently: every 10 seconds
 * under a minute, every minute under an hour, every 5 minutes under a day, then every hour.
 */
export function refreshInterval(diff: number): number {
  const abs = Math.abs(diff);
  if (abs < MINUTE) return 10 * SECOND;
  if (abs < HOUR) return MINUTE;
  if (abs < DAY) return 5 * MINUTE;
  return HOUR;
}

// ── Shared ticker ───────────────────────────────────────────────────────────

interface Subscription {
  listener: () => void;
  delay: () => number;
  due: number;
}

const subscriptions = new Set<Subscription>();

let timer: ReturnType<typeof setTimeout> | undefined;

let timerDue = Infinity;

function pageHidden(): boolean {
  return (
    typeof document !== 'undefined' && document.visibilityState === 'hidden'
  );
}

function schedule() {
  if (timer !== undefined) clearTimeout(timer);
  timer = undefined;
  timerDue = Infinity;
  if (subscriptions.size === 0 || pageHidden()) return;
  let due = Infinity;
  for (const each of subscriptions) due = Math.min(due, each.due);
  timerDue = due;
  // `tick` reschedules through `schedule`, so one of the two comes first.
  // eslint-disable-next-line no-use-before-define
  timer = setTimeout(tick, Math.max(0, due - Date.now()));
}

function run(subscription: Subscription, now: number) {
  // eslint-disable-next-line no-param-reassign
  subscription.due = now + Math.max(SECOND, subscription.delay());
  subscription.listener();
}

function tick() {
  timer = undefined;
  const now = Date.now();
  for (const each of [...subscriptions]) {
    if (each.due <= now && subscriptions.has(each)) run(each, now);
  }
  schedule();
}

/** Back on the page: everything may be stale, so refresh all and start again. */
function handleVisibilityChange() {
  if (pageHidden()) {
    schedule();
    return;
  }
  const now = Date.now();
  for (const each of [...subscriptions]) {
    if (subscriptions.has(each)) run(each, now);
  }
  schedule();
}

/** Whether the shared ticker has a timer running. For tests. */
export function tickerRunning(): boolean {
  return timer !== undefined;
}

/**
 * Calls `listener` again after `delay()` milliseconds (asked anew after each call), on one timer
 * shared by every subscriber on the page. The timer waits for the earliest subscriber, pauses
 * while the page is hidden, refreshes everyone when it is shown again, and stops when the last
 * subscriber leaves. Returns the unsubscribe function.
 */
export function onTick(listener: () => void, delay: () => number): () => void {
  const subscription: Subscription = {
    listener,
    delay,
    due: Date.now() + Math.max(SECOND, delay()),
  };
  if (subscriptions.size === 0 && typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }
  subscriptions.add(subscription);
  if (subscription.due < timerDue) schedule();
  return () => {
    if (!subscriptions.delete(subscription)) return;
    if (subscriptions.size === 0) {
      if (typeof document !== 'undefined') {
        document.removeEventListener(
          'visibilitychange',
          handleVisibilityChange,
        );
      }
      schedule();
    }
  };
}

/**
 * Calls `listener` whenever the relative time of `date()` may have changed: often for a time close
 * to now, rarely for one far away (see `refreshInterval`). A `null` date refreshes once a minute.
 * Returns the unsubscribe function.
 */
export function watchRelativeTime(
  date: () => Date | number | null,
  listener: () => void,
): () => void {
  return onTick(listener, () => {
    const value = date();
    return value === null
      ? MINUTE
      : refreshInterval(toTime(value) - Date.now());
  });
}
