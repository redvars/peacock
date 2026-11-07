import { LitElement, PropertyValues } from 'lit';
import { CalendarEvent } from './calendar-event.js';
import type { WeekDay } from '@/__internal/utils/date.js';
/**
 * @internal
 *
 * @label Calendar Month View
 * @tag wc-calendar-month-view
 * @rawTag calendar-month-view
 * @summary The calendar's month view, six weeks of days with the events on each.
 *
 * @overview
 * <p>Rendered by <code>wc-calendar</code>; not meant to be used on its own.</p>
 * <p>The month is a read-only ARIA grid labelled with the month and year: one row per week, one
 * gridcell per day labelled with its full date. Each event is owned (<code>aria-owns</code>) by the
 * cell of the day it starts on in that week. Events are buttons labelled with their title and
 * time, or notes that cannot be focused when <code>events-readonly</code> is set.</p>
 *
 * @fires event-click - Internal, does not bubble; `wc-calendar` re-fires it. Detail contains `{ event }`.
 */
export declare class CalendarMonthView extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /** Events to lay out. */
    events: CalendarEvent[];
    /** Events are shown but cannot be clicked or focused. */
    eventsReadonly: boolean;
    /** Now, which marks today. */
    currentTime: Date;
    /** A date in the month to show. */
    contextDate: Date;
    /** First day of the week, 0 (Sunday) to 6. */
    weekStartsOn: WeekDay;
    /** Locale for day names and numbers. Defaults to the nearest `lang`, then the browser language. */
    locale: string;
    /** First and last day shown (six whole weeks). */
    private dateRange;
    /** Event rows per week. */
    private weekDayEvents;
    connectedCallback(): void;
    firstUpdated(): void;
    willUpdate(changed: PropertyValues<this>): void;
    private get _interactive();
    private _processEvents;
    private _getDatePercent;
    private _getDayClass;
    /** Custom properties that colour an event with a palette `color`. */
    private _colorVars;
    private _emitEventClick;
    /** The locale day names and numbers are formatted in. */
    private get _locale();
    /** The week's events with ids and the day (0–6) each starts on within the week. */
    private _placeEvents;
    private _styleMap;
    private _renderHeader;
    private _renderDayCells;
    private _renderEvent;
    private _renderWeeks;
    render(): import("lit-html").TemplateResult<1>;
}
