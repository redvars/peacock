/**
 * Pure date utility functions (no external dependencies).
 */
export declare function startOfDay(date: Date): Date;
export declare function endOfDay(date: Date): Date;
export declare function addDays(date: Date, days: number): Date;
export declare function addMonths(date: Date, months: number): Date;
export declare function addHours(date: Date, hours: number): Date;
export declare function differenceInDays(dateA: Date, dateB: Date): number;
export declare function startOfWeek(date: Date, weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6): Date;
export declare function endOfWeek(date: Date, weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6): Date;
export declare function startOfMonth(date: Date): Date;
export declare function endOfMonth(date: Date): Date;
export declare function calculateMonthRange(date: Date, weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6): {
    startDate: Date;
    endDate: Date;
    totalDays: number;
};
export declare function calculateWeekRange(date: Date, weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6): {
    startDate: Date;
    endDate: Date;
    totalDays: number;
};
export declare function calculateDateRange(view: string, contextDate: Date, days: number, weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6): {
    startDate: Date;
    endDate: Date;
    totalDays: number;
};
export declare const LONG_EVENT_PADDING = 0.25;
/** Milliseconds in a day of 24 hours. */
export declare const DAY_MS = 86400000;
/** Milliseconds in a minute. */
export declare const MINUTE_MS = 60000;
export declare function clamp(value: number, min: number, max: number): number;
/** Whether `date` is at local midnight. */
export declare function isMidnight(date: Date): boolean;
/**
 * Whether a range belongs in the all-day row: it lasts a day or more, or runs from one midnight to
 * a later one (a day the clocks go forward on has only 23 hours).
 */
export declare function isAllDayRange(start: Date, end: Date): boolean;
/**
 * The last day a range covers. `end` is exclusive, so a range that ends at midnight ends the day
 * before. Never earlier than the day of `start`.
 */
export declare function lastDayOf(start: Date, end: Date): Date;
/**
 * Whether the range `start`–`end` (end exclusive) shares time with `from`–`to`. A range without
 * length counts when its instant falls inside.
 */
export declare function rangesOverlap(start: Date, end: Date, from: Date, to: Date): boolean;
/**
 * The start of the day after `date`'s. Unlike `addDays(day, 1)`, it lands on midnight even after a
 * day whose midnight the clocks skipped, where `startOfDay` gives 01:00.
 */
export declare function nextDay(date: Date): Date;
/**
 * Wall-clock minutes from the start of `day` to `date`: negative before it, 1440 or more after
 * it. The day and week views draw 24 equal hours, also on the days the clocks change.
 */
export declare function wallMinutes(date: Date, day: Date): number;
/** The time `minutes` after the start of `day` on the wall clock; 1440 is the next midnight. */
export declare function atWallMinutes(day: Date, minutes: number): Date;
/** The time at `fraction` (0 to 1) down `day`'s column: the inverse of `getTimePercent`. */
export declare function timeAtFraction(day: Date, fraction: number): Date;
/**
 * `date` moved to a multiple of `minutes` on the wall clock after the start of `day` (by default
 * its own day): the nearest one, or the one before or after. The result stays within `day`, whose
 * end is the next midnight.
 */
export declare function snapTime(date: Date, minutes: number, mode?: 'round' | 'floor' | 'ceil', day?: Date): Date;
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
export declare function zonedParts(date: Date, timeZone: string): WallClockParts;
/**
 * A `Date` whose local fields show the wall-clock time `date` has in `timeZone`, so the views can
 * lay it out with local getters. An empty or unknown zone returns a copy of `date`.
 */
export declare function toZonedWallClock(date: Date, timeZone: string): Date;
/**
 * Formats a date for display in `locale`. The patterns name the `en-US` output; other locales get
 * their own month and day names, order and clock. `dd-MM-yyyy` is a fixed key, not display text.
 */
export declare function formatDate(date: Date, pattern: string, locale?: string): string;
/**
 * When an event happens, for example `Nov 6, 2026, 9:00 – 9:30 AM`. An all-day event shows its
 * days only, through the day before an `end` at midnight.
 */
export declare function formatEventWhen(start: Date, end: Date, locale: string, allDay?: boolean): string;
/** The times of a range without its date, for example `9:00 – 10:30 AM`. */
export declare function formatTimeRange(start: Date, end: Date, locale: string): string;
/** Accessible name of an event: its title and when it happens, for example `Standup, Nov 6, 2026, 9:00 – 9:30 AM`. */
export declare function formatEventLabel(title: string, start: Date, end: Date, locale: string, allDay?: boolean): string;
/** Runs `action` on Enter or Space, the keys that activate a button. */
export declare function onActivateKey(action: () => void): (event: KeyboardEvent) => void;
/**
 * How far down `forDay`'s column (by default `date`'s own day) `date` falls, in percent, on a
 * 24-hour wall clock: a 9:00 event sits at the 9 AM row also on the days the clocks change.
 */
export declare function getTimePercent(date: Date, forDay?: Date): number;
