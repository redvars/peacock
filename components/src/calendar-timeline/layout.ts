/**
 * The time axis of `wc-calendar-timeline`: the days a view shows, where a time falls along them, and
 * which lane each event of a row takes. Pure functions, so they can be tested without a page.
 *
 * The axis counts wall-clock minutes from the first midnight, 1440 to a day, like the calendar's
 * day and week views: on the days the clocks change, 9:00 still sits at the 9 AM column.
 */
import {
  addDays,
  atWallMinutes,
  calculateDateRange,
  clamp,
  differenceInDays,
  endOfMonth,
  lastDayOf,
  startOfDay,
  startOfMonth,
  wallMinutes,
} from '@/calendar/utils.js';
import type { WeekDay } from '@/__internal/utils/date.js';
import type { CalendarTimelineViewType } from './types.js';

/** Minutes in a day on the wall clock. */
export const DAY_MINUTES = 1440;

/** The days a view shows: `days` days from the midnight of `start`. */
export interface TimelineRange {
  start: Date;
  days: number;
}

/** Where an item sits on the axis, in minutes from the start of the range. */
export interface AxisSpan {
  from: number;
  to: number;
}

/** The days `view` shows around `date`: a calendar month when it has no `days`. */
export function viewRange(
  view: CalendarTimelineViewType,
  date: Date,
  weekStartsOn: WeekDay,
): TimelineRange {
  if (!view.days || view.days < 1) {
    const start = startOfMonth(date);
    return { start, days: differenceInDays(endOfMonth(date), start) + 1 };
  }
  const days = Math.round(view.days);
  const { startDate } = calculateDateRange(
    view.value,
    date,
    days,
    weekStartsOn,
  );
  return { start: startOfDay(startDate), days };
}

/** Minutes on the axis of the whole range. */
export function axisLength(range: TimelineRange): number {
  return range.days * DAY_MINUTES;
}

/** The midnight that ends the range. */
export function rangeEnd(range: TimelineRange): Date {
  return startOfDay(addDays(startOfDay(range.start), range.days));
}

/** The day `index` days into the range, at midnight. */
export function dayOfRange(range: TimelineRange, index: number): Date {
  return startOfDay(addDays(range.start, index));
}

/** Wall-clock minutes from the start of the range to `date`: negative before it, not clamped. */
export function axisMinutes(range: TimelineRange, date: Date): number {
  return wallMinutes(date, range.start);
}

/** The time `minutes` along the axis, kept within the range. */
export function dateAtAxis(range: TimelineRange, minutes: number): Date {
  const at = clamp(minutes, 0, axisLength(range));
  const day = Math.min(Math.floor(at / DAY_MINUTES), range.days - 1);
  return atWallMinutes(dayOfRange(range, day), at - day * DAY_MINUTES);
}

/**
 * Where an event sits on the axis, within the range: from its start to its end in hour views, and
 * over the whole days it touches in day views.
 */
export function eventSpan(
  range: TimelineRange,
  slot: CalendarTimelineViewType['slot'],
  start: Date,
  end: Date,
): AxisSpan {
  const total = axisLength(range);
  if (slot === 'day') {
    const first = differenceInDays(start, range.start);
    const last = differenceInDays(lastDayOf(start, end), range.start);
    return {
      from: clamp(first * DAY_MINUTES, 0, total),
      to: clamp((last + 1) * DAY_MINUTES, 0, total),
    };
  }
  return {
    from: clamp(axisMinutes(range, start), 0, total),
    to: clamp(axisMinutes(range, end), 0, total),
  };
}

/**
 * Lanes for the events of a row: each takes the first lane that is free when it starts, so
 * events that only touch share a lane. `lanes` is at least 1.
 */
export function assignLanes<T extends AxisSpan>(
  items: readonly T[],
): { lanes: number; laneOf: Map<T, number> } {
  const sorted = [...items].sort((a, b) => a.from - b.from || b.to - a.to);
  const ends: number[] = [];
  const laneOf = new Map<T, number>();
  sorted.forEach(item => {
    // An event without length still takes a sliver of its lane.
    const end = Math.max(item.to, item.from + 1);
    let lane = ends.findIndex(laneEnd => laneEnd <= item.from);
    if (lane < 0) lane = ends.length;
    ends[lane] = end;
    laneOf.set(item, lane);
  });
  return { lanes: Math.max(1, ends.length), laneOf };
}
