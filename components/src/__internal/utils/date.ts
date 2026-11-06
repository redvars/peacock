/**
 * Date and time helpers shared by the date/time pickers and fields.
 *
 * Values cross component boundaries as ISO strings so they are locale-independent and
 * submit cleanly with a form: dates as `YYYY-MM-DD`, times as `HH:mm` or `HH:mm:ss`
 * (24-hour), date-times as `YYYY-MM-DDTHH:mm`, and ranges as `start/end`.
 */
import { addDays, startOfWeek } from '@/calendar/utils.js';

export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type HourCycle = 'h12' | 'h23';

export interface DateParts {
  year: number;
  month: number; // 1–12
  day: number;
}

export interface TimeParts {
  hour: number; // 0–23
  minute: number;
  second: number;
}

const pad = (n: number, width = 2) => String(n).padStart(width, '0');

// ── Locale ───────────────────────────────────────────────────────────────────

// Kept here so existing imports keep working; the resolver lives with the i18n helpers.
export { resolveLocale } from '@/__internal/i18n/locale.js';

/** First day of the week for a locale (0 = Sunday), from `Intl.Locale` week info when available. */
export function weekStart(locale: string): WeekDay {
  try {
    const loc = new Intl.Locale(locale) as Intl.Locale & {
      weekInfo?: { firstDay: number };
      getWeekInfo?: () => { firstDay: number };
    };
    const info = loc.getWeekInfo?.() ?? loc.weekInfo;
    if (info) return (info.firstDay % 7) as WeekDay;
  } catch {
    // Unknown locale tag: fall through.
  }
  return 0;
}

/** The locale's preferred hour cycle. */
export function localeHourCycle(locale: string): HourCycle {
  const options = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
  }).resolvedOptions();
  return options.hourCycle === 'h11' || options.hourCycle === 'h12'
    ? 'h12'
    : 'h23';
}

/** The hour cycle a time control shows: the one it was given, else the locale's. */
export function resolveHourCycle(
  hourCycle: HourCycle | undefined,
  locale: string,
): HourCycle {
  return hourCycle ?? localeHourCycle(locale);
}

/** The order of day, month and year in the locale's numeric date format. */
export function localeDateOrder(
  locale: string,
): Array<'day' | 'month' | 'year'> {
  const parts = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(2026, 10, 23));
  const order = parts
    .map(p => p.type)
    .filter((t): t is 'day' | 'month' | 'year' =>
      ['day', 'month', 'year'].includes(t),
    );
  return order.length === 3 ? order : ['month', 'day', 'year'];
}

/** The separator the locale uses between numeric date parts. */
function localeDateSeparator(locale: string): string {
  const parts = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(2026, 10, 23));
  return parts.find(p => p.type === 'literal')?.value.trim() || '/';
}

/** A human hint for the locale's date format, such as `MM/DD/YYYY` or `DD.MM.YYYY`. */
export function localeDatePattern(locale: string): string {
  const tokens = { day: 'DD', month: 'MM', year: 'YYYY' };
  return localeDateOrder(locale)
    .map(t => tokens[t])
    .join(localeDateSeparator(locale));
}

// ── ISO dates ────────────────────────────────────────────────────────────────

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function isValidDateParts({ year, month, day }: DateParts): boolean {
  if (month < 1 || month > 12 || day < 1 || year < 1 || year > 9999) {
    return false;
  }
  return day <= daysInMonth(year, month);
}

/** Parses `YYYY-MM-DD`; returns null for anything else, including impossible dates. */
export function parseIsoDate(
  value: string | null | undefined,
): DateParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value?.trim() ?? '');
  if (!match) return null;
  const parts = { year: +match[1], month: +match[2], day: +match[3] };
  return isValidDateParts(parts) ? parts : null;
}

export function toIsoDate({ year, month, day }: DateParts): string {
  return `${pad(year, 4)}-${pad(month)}-${pad(day)}`;
}

export function dateToIso(date: Date): string {
  return toIsoDate({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  });
}

export function isoToDate(iso: string): Date | null {
  const parts = parseIsoDate(iso);
  return parts ? new Date(parts.year, parts.month - 1, parts.day) : null;
}

export function todayIso(): string {
  return dateToIso(new Date());
}

/** Adds days to an ISO date. */
export function addDaysIso(iso: string, days: number): string {
  const date = isoToDate(iso);
  return date ? dateToIso(addDays(date, days)) : iso;
}

/** Adds months to an ISO date, clamping the day to the target month (Jan 31 + 1 → Feb 28). */
export function addMonthsIso(iso: string, months: number): string {
  const parts = parseIsoDate(iso);
  if (!parts) return iso;
  const index = parts.year * 12 + (parts.month - 1) + months;
  const year = Math.floor(index / 12);
  const month = (index % 12) + 1;
  return toIsoDate({
    year,
    month,
    day: Math.min(parts.day, daysInMonth(year, month)),
  });
}

/** ISO dates compare correctly as strings; empty bounds never limit. */
export function isBefore(a: string, b: string): boolean {
  return !!a && !!b && a < b;
}

export function isWithin(iso: string, min?: string, max?: string): boolean {
  return !(min && iso < min) && !(max && iso > max);
}

export function clampIso(iso: string, min?: string, max?: string): string {
  if (min && iso < min) return min;
  if (max && iso > max) return max;
  return iso;
}

// ── Ranges ───────────────────────────────────────────────────────────────────

export function parseRange(value: string | null | undefined): [string, string] {
  const [start = '', end = ''] = (value ?? '').split('/');
  return [parseIsoDate(start) ? start : '', parseIsoDate(end) ? end : ''];
}

export function toRange(start: string, end: string): string {
  if (!start && !end) return '';
  return `${start}/${end}`;
}

// ── ISO times ────────────────────────────────────────────────────────────────

export function isValidTimeParts({ hour, minute, second }: TimeParts): boolean {
  return (
    hour >= 0 &&
    hour < 24 &&
    minute >= 0 &&
    minute < 60 &&
    second >= 0 &&
    second < 60
  );
}

export function parseIsoTime(
  value: string | null | undefined,
): TimeParts | null {
  const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value?.trim() ?? '');
  if (!match) return null;
  const parts = {
    hour: +match[1],
    minute: +match[2],
    second: +(match[3] ?? 0),
  };
  return isValidTimeParts(parts) ? parts : null;
}

export function toIsoTime(
  { hour, minute, second }: TimeParts,
  seconds = false,
): string {
  const base = `${pad(hour)}:${pad(minute)}`;
  return seconds ? `${base}:${pad(second)}` : base;
}

export function parseIsoDateTime(
  value: string | null | undefined,
): { date: string; time: string } | null {
  const [date = '', time = ''] = (value ?? '').split('T');
  if (!parseIsoDate(date) || !parseIsoTime(time)) return null;
  return { date, time };
}

// ── Formatting ───────────────────────────────────────────────────────────────

/** Formats an ISO date in the locale's numeric format (`11/06/2026`). Empty for invalid input. */
export function formatDate(iso: string, locale: string): string {
  const date = isoToDate(iso);
  if (!date) return '';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** Formats an ISO date in full words for screen readers (`Friday, November 6, 2026`). */
export function formatDateLong(iso: string, locale: string): string {
  const date = isoToDate(iso);
  if (!date) return '';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'full' }).format(date);
}

export function formatTime(
  iso: string,
  locale: string,
  hourCycle: HourCycle = localeHourCycle(locale),
  seconds = false,
): string {
  const parts = parseIsoTime(iso);
  if (!parts) return '';
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    second: seconds ? '2-digit' : undefined,
    hourCycle,
  }).format(new Date(2000, 0, 1, parts.hour, parts.minute, parts.second));
}

/** Month name and year for a calendar header (`November 2026`). */
export function formatMonthYear(
  year: number,
  month: number,
  locale: string,
): string {
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1));
}

export function monthNames(
  locale: string,
  width: 'long' | 'short' = 'short',
): string[] {
  const format = new Intl.DateTimeFormat(locale, { month: width });
  return Array.from({ length: 12 }, (_, m) =>
    format.format(new Date(2026, m, 1)),
  );
}

/** Weekday names in display order, starting on `firstDay`. */
export function weekdayNames(
  locale: string,
  firstDay: WeekDay,
  width: 'narrow' | 'short' | 'long' = 'short',
): string[] {
  const format = new Intl.DateTimeFormat(locale, { weekday: width });
  // 2026-11-01 is a Sunday.
  return Array.from({ length: 7 }, (_, i) =>
    format.format(new Date(2026, 10, 1 + ((firstDay + i) % 7))),
  );
}

export function dayPeriodNames(locale: string): [string, string] {
  const format = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    hourCycle: 'h12',
  });
  const period = (d: Date) =>
    format.formatToParts(d).find(p => p.type === 'dayPeriod')?.value ?? '';
  return [
    period(new Date(2000, 0, 1, 9)) || 'AM',
    period(new Date(2000, 0, 1, 21)) || 'PM',
  ];
}

// ── Parsing typed text ───────────────────────────────────────────────────────

function expandYear(year: number, digits: number): number {
  if (digits > 2) return year;
  // Two-digit years land within 50 years of now either way.
  const now = new Date().getFullYear();
  const century = Math.floor(now / 100) * 100;
  const candidate = century + year;
  return candidate > now + 50 ? candidate - 100 : candidate;
}

/**
 * Parses a date typed by a person: ISO (`2026-11-06`) or the locale's numeric order with any of
 * `/`, `-`, `.` or space as separator (`11/6/2026`, `6.11.26`). Returns an ISO date or null.
 */
export function parseDateText(text: string, locale: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const iso = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.exec(trimmed);
  if (iso) {
    const parts = { year: +iso[1], month: +iso[2], day: +iso[3] };
    return isValidDateParts(parts) ? toIsoDate(parts) : null;
  }
  const pieces = trimmed.split(/[\s/.-]+/).filter(Boolean);
  if (pieces.length !== 3 || pieces.some(p => !/^\d+$/.test(p))) return null;
  const order = localeDateOrder(locale);
  const parts = { year: 0, month: 0, day: 0 };
  order.forEach((type, i) => {
    const raw = pieces[i];
    parts[type] = type === 'year' ? expandYear(+raw, raw.length) : +raw;
  });
  return isValidDateParts(parts) ? toIsoDate(parts) : null;
}

/** Parses a typed range: two dates joined by `–`, `—`, ` - `, `to` or `/` between ISO dates. */
export function parseRangeText(text: string, locale: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const isoRange = /^(\d{4}-\d{2}-\d{2})\/(\d{4}-\d{2}-\d{2})$/.exec(trimmed);
  const halves = isoRange
    ? [isoRange[1], isoRange[2]]
    : trimmed.split(/\s*[–—]\s*|\s+-\s+|\s+to\s+/i);
  if (halves.length !== 2) return null;
  const start = parseDateText(halves[0], locale);
  const end = parseDateText(halves[1], locale);
  if (!start || !end) return null;
  return start <= end ? toRange(start, end) : toRange(end, start);
}

/**
 * Parses a time typed by a person: `9:30`, `09:30:15`, `930`, `9`, `9:30 pm`, `21:30`.
 * Returns an ISO time (with seconds when `seconds` is set) or null.
 */
export function parseTimeText(text: string, seconds = false): string | null {
  const trimmed = text.trim().toLowerCase();
  if (!trimmed) return null;
  const match =
    /^(\d{1,2})(?:[:.h]?(\d{2}))?(?:[:.]?(\d{2}))?\s*([ap]\.?\s?m?\.?)?$/.exec(
      trimmed,
    );
  if (!match) return null;
  let hour = +match[1];
  const minute = +(match[2] ?? 0);
  const second = +(match[3] ?? 0);
  const period = match[4]?.[0];
  if (period) {
    if (hour < 1 || hour > 12) return null;
    hour = (hour % 12) + (period === 'p' ? 12 : 0);
  }
  const parts = { hour, minute, second };
  return isValidTimeParts(parts) ? toIsoTime(parts, seconds) : null;
}

// ── Calendar grid ────────────────────────────────────────────────────────────

/**
 * The days shown for a month: always 6 weeks × 7 days so the grid height never jumps, starting
 * on `firstDay`. Each cell carries its ISO date and whether it falls in the shown month.
 */
export function buildMonthGrid(
  year: number,
  month: number,
  firstDay: WeekDay,
): Array<Array<{ iso: string; day: number; inMonth: boolean }>> {
  const start = startOfWeek(new Date(year, month - 1, 1), firstDay);
  return Array.from({ length: 6 }, (_w, week) =>
    Array.from({ length: 7 }, (_d, d) => {
      const date = addDays(start, week * 7 + d);
      return {
        iso: dateToIso(date),
        day: date.getDate(),
        inMonth: date.getMonth() === month - 1,
      };
    }),
  );
}
