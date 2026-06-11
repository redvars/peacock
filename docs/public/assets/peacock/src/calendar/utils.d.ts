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
export declare function calculateDateRange(view: string, contextDate: Date, days: number): {
    startDate: Date;
    endDate: Date;
    totalDays: number;
};
export declare const LONG_EVENT_PADDING = 0.25;
export declare function formatDate(date: Date, pattern: string): string;
export declare function getTimePercent(date: Date, forDay?: Date): number;
