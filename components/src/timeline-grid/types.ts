import type { EventType } from '@/calendar/types.js';

/** A row of the grid: a person, a room, a machine. Add any fields of your own. */
export type TimelineGridResource = {
  id: string | number;
  /** Shown in the row header, and read with the row's events. */
  title: string;
  /** A second line under the title, such as a role or a room's size. */
  supportingText?: string;
  [key: string]: unknown;
};

/** An event of the grid: a calendar event with the `id` of the resource whose row it is in. */
export type TimelineGridEvent = EventType & { resourceId: string | number };

/** A view of the grid. */
export type TimelineGridViewType = {
  value: string;
  /** Text of the view's button. Defaults to Peacock's `day`, `week` or `month` string, else `value`. */
  label?: string;
  /**
   * What a column stands for. Drags snap to `minute-step` in `hour` views and move by whole days in
   * `day` views, where an event covers the days it touches.
   */
  slot: 'hour' | 'day';
  /** Days shown; without it, a calendar month. A view whose `value` is `week` starts on the week's first day. */
  days?: number;
};

/** How an `event-change` changed the event. */
export type TimelineGridEventChangeAction = 'move' | 'resize';

/** Detail of `event-change`. */
export type TimelineGridEventChangeDetail = {
  /** The event as it was, the object from `events`. */
  event: TimelineGridEvent;
  /** The new start. */
  start: Date;
  /** The new end. */
  end: Date;
  /** The resource the event belongs to now: `event.resourceId`, unless it was dragged to another row. */
  resourceId: string | number;
  /** `move` when the event was dragged, `resize` when its start or end was. */
  action: TimelineGridEventChangeAction;
};

/** Detail of `event-add`. */
export type TimelineGridEventAddDetail = {
  /** Start of the range the person drew or clicked. */
  start: Date;
  /** End of the range, exclusive: midnight after the last day of a range of whole days. */
  end: Date;
  /** Whether the range is whole days, as in day views. */
  allDay: boolean;
  /** The resource whose row the range is in. */
  resourceId: string | number;
};

/** Detail of `group-toggle`. */
export type TimelineGridGroupToggleDetail = {
  /** The group's key: its `group-by` value as a string, `""` for resources without one. */
  group: string;
  /** Whether the group is expanded now. */
  expanded: boolean;
};
