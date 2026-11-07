import { LitElement, PropertyValues } from 'lit';
import type { CalendarViewType, EventType } from './types.js';
import type { PeacockStrings } from '@/__internal/i18n/strings.js';
/** Detail of `date-change`. */
export type CalendarDateChangeDetail = {
    /** The new context date. */
    date: Date;
    /** The same date as an ISO string, `YYYY-MM-DD`. */
    value: string;
};
/**
 * @label Calendar
 * @tag wc-calendar
 * @rawTag calendar
 * @summary A calendar that shows events by day, week or month, with controls to move between periods.
 *
 * @overview
 * <p>Pass events as the <code>events</code> property; each has a <code>start</code>,
 * <code>end</code>, <code>title</code> and optional palette <code>color</code>. The day and week
 * views lay timed events out in a column per day, with events lasting a day or more in a row
 * above; the month view shows six weeks. <code>available-views</code> sets the views offered in
 * the header's segmented buttons, and <code>view</code> the one shown.</p>
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
 *
 * @cssprop --calendar-border-color - Border color used throughout the calendar grid.
 * @cssprop --calendar-event-bg-color - Background color for calendar events.
 * @cssprop --calendar-event-border-color - Left border color for calendar events.
 *
 * @fires {CustomEvent<{event: EventType}>} event-click - An event was clicked, or chosen with Enter or Space. Detail contains `{ event }`. Not fired with `events-readonly`.
 * @fires {CustomEvent<{view: string}>} view-change - The view changed. Detail contains `{ view }`.
 * @fires {CustomEvent<{date: Date, value: string}>} date-change - The context date changed. Detail contains `{ date, value }`: the `Date` and its ISO string.
 *
 * @example
 * ```html
 * <wc-calendar view="week" date="2026-11-06" style="height: 600px"></wc-calendar>
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
    /** Peacock's strings and the resolved locale. */
    private readonly _i18n;
    connectedCallback(): void;
    willUpdate(changed: PropertyValues<this>): void;
    /** Moves back one period: a day or week in column views, a month in the month view. */
    previous(): void;
    /** Moves forward one period: a day or week in column views, a month in the month view. */
    next(): void;
    /** Moves the view to today, in `timezone`. */
    today(): void;
    /** Now, as wall-clock time in `timezone`. */
    private _now;
    /** Keeps `date` and `contextDate` in step; `date` wins when both changed. */
    private _syncDate;
    /** The week start in effect: `firstDay` when valid, else the locale's. */
    private _weekStart;
    /** Whether events can be clicked: not `events-readonly`. */
    private _eventsInteractive;
    private _step;
    private _setContextDate;
    private _onViewDateClick;
    private _onViewEventClick;
    private _onViewSegmentChange;
    /** The view's own label, else Peacock's string for the built-in views, else its value. */
    private _viewLabel;
    private _renderHeader;
    private _renderCalendarView;
    render(): import("lit-html").TemplateResult<1>;
}
