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
/** Accessible name of an event: its title and when it happens, for example `Standup, Nov 6, 2026, 9:00 – 9:30 AM`. */
export declare function formatEventLabel(title: string, start: Date, end: Date, locale: string, allDay?: boolean): string;
/** Runs `action` on Enter or Space, the keys that activate a button. */
export declare function onActivateKey(action: () => void): (event: KeyboardEvent) => void;
export declare function getTimePercent(date: Date, forDay?: Date): number;
