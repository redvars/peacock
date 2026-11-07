import { LitElement, PropertyValues, TemplateResult } from 'lit';
import { CalendarEvent } from './calendar-event.js';
import type { WeekDay } from '@/__internal/utils/date.js';
/**
 * @internal
 *
 * @label Calendar Column View
 * @tag wc-calendar-column-view
 * @rawTag calendar-column-view
 * @summary The calendar's day and week view, with one column of timed events per day.
 *
 * @overview
 * <p>Rendered by <code>wc-calendar</code>; not meant to be used on its own.</p>
 * <p>The view is a region labelled with the dates it shows. Day numbers in the header are buttons
 * that open the day; events are buttons labelled with their title and time, or notes that cannot
 * be focused when <code>events-readonly</code> is set. Events lasting a day or more are shown in a
 * row above the hours.</p>
 *
 * @fires date-click - Internal, does not bubble; a day number was chosen. Detail contains `{ date }`.
 * @fires event-click - Internal, does not bubble; `wc-calendar` re-fires it. Detail contains `{ event }`.
 */
export declare class CalendarColumnView extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /** Events to lay out. */
    events: CalendarEvent[];
    /** The view's name; `week` aligns the range to the week start. */
    view: string;
    /** Number of day columns. */
    days: number;
    /** Events are shown but cannot be clicked or focused. */
    eventsReadonly: boolean;
    /** Now, which places the current-time line and marks today. */
    currentTime: Date;
    /** A date in the range to show. */
    contextDate: Date;
    /** First day of the week, 0 (Sunday) to 6, for the `week` view. */
    weekStartsOn: WeekDay;
    /** Locale for day names and times. Defaults to the nearest `lang`, then the browser language. */
    locale: string;
    /** First and last day shown. */
    private dateRange;
    /** Timed events per day, keyed by `dd-MM-yyyy`. */
    private singleDayEvents;
    /** Rows of events lasting a day or more. */
    private multiDayEvents;
    connectedCallback(): void;
    firstUpdated(): void;
    willUpdate(changed: PropertyValues<this>): void;
    private get _interactive();
    /** The locale dates and times are formatted in. */
    private get _locale();
    private _processEvents;
    private _forEachDayInRange;
    private _getDateOnly;
    private _getDatePercent;
    private _getDayClass;
    /** Custom properties that colour an event with a palette `color`. */
    private _colorVars;
    private _emitDateClick;
    private _emitEventClick;
    /** Accessible name of the view: the dates it shows. */
    private _rangeLabel;
    private _styleMap;
    private _renderHeader;
    private _renderMultiDayBackground;
    private _renderScale;
    private _renderBackgroundGrid;
    /** One event block; `allDay` marks events lasting a day or more. */
    private _renderEvent;
    private _renderEvents;
    private _renderMultiDayEvents;
    private _renderCurrentTime;
    render(): TemplateResult<1>;
}
