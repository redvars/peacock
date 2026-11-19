import { LitElement, PropertyValues } from 'lit';
import type { CalendarEventChangeDetail, CalendarViewType, EventType } from './types.js';
import type { PeacockStrings } from '../__internal/i18n/strings.js';
export type { CalendarEventAddDetail, CalendarEventChangeAction, CalendarEventChangeDetail, } from './types.js';
/** Detail of `date-change`. */
export type CalendarDateChangeDetail = {
    /** The new context date. */
    date: Date;
    /** The same date as an ISO string, `YYYY-MM-DD`. */
    value: string;
};
/**
 * Applies an `event-change` to an `events` array the way the calendar does, returning a new array
 * in which the event is replaced by a copy with the new `start` and `end`. The event is found by
 * identity, else by `id`. The copy is made with object spread, so give the calendar plain objects,
 * not class instances. Use it to apply a change you canceled, for example once the server has
 * accepted it.
 */
export declare function applyCalendarChange<T extends EventType>(events: readonly T[], change: Pick<CalendarEventChangeDetail, 'event' | 'start' | 'end'>): T[];
/**
 * @label Calendar
 * @tag wc-calendar
 * @rawTag calendar
 * @summary A calendar that shows events by day, week or month, with controls to move between periods.
 *
 * @overview
 * <p>Pass events as the <code>events</code> property; each has a <code>start</code>,
 * <code>end</code>, <code>title</code> and optional palette <code>color</code>. <code>end</code> is
 * exclusive: an all-day event on November 4 runs from midnight on the 4th to midnight on the 5th.
 * The day and week views lay timed events out in a column per day, with events lasting a day or
 * more in a row above; the month view shows six weeks. <code>available-views</code> sets the views
 * offered in the header's segmented buttons, and <code>view</code> the one shown.</p>
 * <p>The header has a Today button, previous and next buttons and the current date, which is a
 * polite live region. <code>previous()</code>, <code>next()</code> and <code>today()</code> do the
 * same from code; each fires <code>date-change</code>. The date shown is <code>date</code> (an ISO
 * string) or <code>contextDate</code> (a <code>Date</code>), kept in step. Choosing a day number
 * in a column view switches to the day view and fires <code>view-change</code> and
 * <code>date-change</code>.</p>
 * <p>Events are buttons, chosen with a click, Enter or Space, which fire <code>event-click</code>.
 * With <code>events-readonly</code> they are shown but cannot be focused or clicked.
 * <code>loading</code> shows a progress bar and marks the calendar busy. <code>first-day</code>
 * sets the week start (else the locale's), <code>timezone</code> the zone the current time is
 * shown in, and <code>locale</code> the language of names and times.</p>
 * <p>With <code>editable</code>, people drag events to move them and drag their edges to change
 * when they start or end: timed events in steps of <code>minute-step</code> minutes, all-day events
 * and every event in the month view by whole days. Each drop fires the cancelable
 * <code>event-change</code>; unless it is canceled, the calendar replaces <code>events</code> with
 * a new array holding a copy of the event with its new times. To confirm a change with a server
 * first, cancel the event and apply it later with <code>applyCalendarChange()</code>. An event with
 * <code>editable: false</code> stays put, and <code>events-readonly</code> turns editing off. On
 * touch screens, hold an event briefly before dragging it. Escape cancels a drag.</p>
 * <p>With <code>addable</code>, dragging across empty time, or clicking it, fires
 * <code>event-add</code> with the range: a click gives <code>default-duration</code> minutes, and
 * the all-day row and the month view give whole days. The calendar does not add the event itself.
 * It marks the range as a new event until <code>events</code> changes, the person presses Escape
 * or starts another drag, or <code>clearPlaceholder()</code> is called, for example when a dialog
 * asking for the event's title is canceled. Each change is announced to screen readers. Dragging
 * needs a pointer, so offer another way to change an event's time too, such as the dialog that
 * <code>event-click</code> opens.</p>
 *
 * @cssprop --calendar-border-color - Border color used throughout the calendar grid.
 * @cssprop --calendar-event-bg-color - Background color for calendar events.
 * @cssprop --calendar-event-border-color - Left border color for calendar events.
 *
 * @fires {CustomEvent<{event: EventType}>} event-click - An event was clicked, or chosen with Enter or Space. Detail contains `{ event }`. Not fired with `events-readonly`.
 * @fires {CustomEvent<{view: string}>} view-change - The view changed. Detail contains `{ view }`.
 * @fires {CustomEvent<{date: Date, value: string}>} date-change - The context date changed. Detail contains `{ date, value }`: the `Date` and its ISO string.
 * @fires {CustomEvent<CalendarEventChangeDetail>} event-change - An event was dragged to a new time (`action: 'move'`) or had its start or end dragged (`action: 'resize'`). Detail contains `{ event, start, end, action }`, where `event` is the object from `events` as it was. Cancelable: cancel it to keep the event where it was. Only with `editable`.
 * @fires {CustomEvent<CalendarEventAddDetail>} event-add - Empty time was dragged across or clicked. Detail contains `{ start, end, allDay }`. Only with `addable`.
 *
 * @example
 * ```html
 * <wc-calendar view="week" date="2026-11-06" style="height: 600px"></wc-calendar>
 * ```
 *
 * @example
 * ```html
 * <wc-calendar id="planner" view="week" editable addable style="height: 600px"></wc-calendar>
 * <script>
 *   const planner = document.getElementById('planner');
 *   planner.events = [
 *     { id: 1, title: 'Standup', start: new Date(2026, 10, 4, 9), end: new Date(2026, 10, 4, 9, 30) },
 *   ];
 *   planner.addEventListener('event-change', event => console.log(event.detail));
 *   planner.addEventListener('event-add', ({ detail }) => {
 *     planner.events = [...planner.events, { id: Date.now(), title: 'New event', ...detail }];
 *   });
 * </script>
 * ```
 */
export declare class Calendar extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /** Calendar events array. */
    events: EventType[];
    /**
     * Available views configuration. A view without a `label` shows Peacock's `day`, `week` or
     * `month` string for those values, else its `value`.
     */
    availableViews: CalendarViewType[];
    /** Current calendar view. */
    view: string;
    /**
     * The date the view shows, as an ISO string (`YYYY-MM-DD`). Kept in step with `contextDate`.
     * Defaults to today.
     */
    date: string;
    /**
     * The date the view shows, as a `Date`. Kept in step with `date`.
     */
    contextDate: Date | null;
    /**
     * First day of the week, `0` (Sunday) to `6` (Saturday). Defaults to the locale's week start.
     */
    firstDay?: number;
    /** Events are shown but cannot be clicked or focused, and `event-click` does not fire. */
    eventsReadonly: boolean;
    /**
     * People can drag events to move them and drag their edges to resize them. Each drop fires the
     * cancelable `event-change`. An event with `editable: false` stays put.
     */
    editable: boolean;
    /**
     * Dragging across empty time, or clicking it, fires `event-add` with the range and marks it as a
     * new event until `events` changes.
     */
    addable: boolean;
    /** Minutes that dragging moves, resizes and draws timed events by. Defaults to 15. */
    minuteStep: number;
    /** Length in minutes of an event added by clicking empty time in the day or week view. Defaults to 60. */
    defaultDuration: number;
    /** Shows a progress bar and marks the calendar busy while events load. */
    loading: boolean;
    /** IANA time zone the current time is shown in, for example `America/New_York`. Defaults to the browser's. */
    timezone: string;
    /**
     * Locale for month and day names and times. Defaults to the nearest `lang`, then the browser
     * language.
     */
    locale: string;
    /** Overrides Peacock's strings for this instance only. */
    strings?: Partial<PeacockStrings>;
    /** Now, as wall-clock time in `timezone`. */
    private _currentTime;
    /** The entry of `availableViews` matching `view`. */
    private _currentView;
    /** The range of the last `event-add`, marked as a new event until the app adds it. */
    private _placeholder;
    /** Peacock's strings and the resolved locale. */
    private readonly _i18n;
    connectedCallback(): void;
    disconnectedCallback(): void;
    willUpdate(changed: PropertyValues<this>): void;
    /** Moves back one period: a day or week in column views, a month in the month view. */
    previous(): void;
    /** Moves forward one period: a day or week in column views, a month in the month view. */
    next(): void;
    /** Moves the view to today, in `timezone`. */
    today(): void;
    /**
     * Removes the new event marked after `event-add`, for when adding it is canceled. It also goes
     * when `events` changes.
     */
    clearPlaceholder(): void;
    /** Now, as wall-clock time in `timezone`. */
    private _now;
    /** Keeps `date` and `contextDate` in step; `date` wins when both changed. */
    private _syncDate;
    /** The week start in effect: `firstDay` when valid, else the locale's. */
    private _weekStart;
    /** Whether events can be clicked: not `events-readonly`. */
    private _eventsInteractive;
    /** Whether events can be dragged: `editable` and not `events-readonly`. */
    private _eventsEditable;
    private _step;
    private _setContextDate;
    /**
     * Reads `message` in the live region. Its text is set directly, so an announcement does not
     * render the calendar, and its views, again.
     */
    private _announce;
    private readonly _handlePointerDown;
    private readonly _handleKeyDown;
    private readonly _handleWindowKeyDown;
    private _onViewDateClick;
    private _onViewEventClick;
    private _onViewEventChange;
    private _onViewEventAdd;
    private _changeView;
    /** The view's own label, else Peacock's string for the built-in views, else its value. */
    private _viewLabel;
    private _renderHeader;
    private _renderCalendarView;
    render(): import("lit-html").TemplateResult<1>;
}
