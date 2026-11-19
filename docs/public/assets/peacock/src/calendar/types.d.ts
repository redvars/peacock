export type CalendarViewType = {
    /** Text of the view's button. Defaults to Peacock's `day`, `week` or `month` string, else `value`. */
    label?: string;
    value: string;
    type: 'column' | 'month';
    days?: number;
};
export type EventType = {
    /**
     * When the event starts. An event lasting a day or more, or running from one midnight to
     * another, is shown in the all-day row.
     */
    start: Date;
    /** When the event ends, exclusive: an all-day event on November 4 ends at midnight on November 5. */
    end: Date;
    title: string;
    /** A palette color name, such as `blue` or `green`. */
    color?: string;
    /** Identifies the event, so `applyCalendarChange()` finds it after the array was replaced. */
    id?: string | number;
    /** `false` keeps this event in place when the calendar is `editable`. */
    editable?: boolean;
    [key: string]: any;
};
/** How an `event-change` changed the event. */
export type CalendarEventChangeAction = 'move' | 'resize';
/** Detail of `event-change`. */
export type CalendarEventChangeDetail = {
    /** The event as it was, the object from `events`. */
    event: EventType;
    /** The new start. */
    start: Date;
    /** The new end. */
    end: Date;
    /** `move` when the event was dragged, `resize` when its start or end was. */
    action: CalendarEventChangeAction;
};
/** Detail of `event-add`. */
export type CalendarEventAddDetail = {
    /** Start of the range the person drew or clicked. */
    start: Date;
    /** End of the range, exclusive: midnight after the last day of an all-day range. */
    end: Date;
    /** Whether the range is whole days, drawn in the all-day row or the month view. */
    allDay: boolean;
};
