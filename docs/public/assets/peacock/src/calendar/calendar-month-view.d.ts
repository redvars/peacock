import { LitElement, PropertyValues } from 'lit';
import { CalendarEvent } from './calendar-event.js';
import type { CalendarEventAddDetail } from './types.js';
import type { WeekDay } from '../__internal/utils/date.js';
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
 * <p>With <code>editable</code>, events are dragged to other days and all-day events resized by
 * their edges; with <code>addable</code>, dragging across days or clicking one asks for an
 * all-day event. The days a drag covers are highlighted.</p>
 *
 * @fires event-click - Internal, does not bubble; `wc-calendar` re-fires it. Detail contains `{ event }`.
 * @fires event-change - Internal, does not bubble; an event was dropped on new days. `wc-calendar` re-fires it.
 * @fires event-add - Internal, does not bubble; days were drawn across or a day clicked. `wc-calendar` re-fires it.
 */
export declare class CalendarMonthView extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /** Events to lay out. */
    events: CalendarEvent[];
    /** Events are shown but cannot be clicked or focused. */
    eventsReadonly: boolean;
    /** Events can be moved to other days, and all-day events resized, by dragging. */
    editable: boolean;
    /** Dragging across days, or clicking one, asks for a new all-day event. */
    addable: boolean;
    /** A range waiting for its new event; its days are highlighted. */
    placeholder: CalendarEventAddDetail | null;
    /** Title shown for an event without one. */
    untitledLabel: string;
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
    /** The drag in progress, where it would put its event. */
    private _preview;
    private readonly _drag;
    connectedCallback(): void;
    willUpdate(changed: PropertyValues<this>): void;
    private get _interactive();
    /** Whether an event can be dragged: the view is editable and the event did not opt out. */
    private _canEdit;
    private _processEvents;
    private _getDatePercent;
    private _getDayClass;
    /** Custom properties that colour an event with a palette `color`. */
    private _colorVars;
    private _emitEventClick;
    private _emitChange;
    private _emitAdd;
    /** The locale day names and numbers are formatted in. */
    private get _locale();
    /** The week's events with ids and the day (0–6) each starts on within the week. */
    private _placeEvents;
    private _styleMap;
    /** The day of the cell under, or nearest, a point. */
    private _dayAt;
    private _onEventPointerDown;
    private _onAreaPointerDown;
    private _previewFor;
    private _follow;
    private _drop;
    /** A click on a day adds an all-day event on it. */
    private _tap;
    /**
     * Blurs the focused event when a drag starts. The drop redraws the events, and the element that
     * held focus could then show another event, which Enter would open.
     */
    private _blurFocused;
    /** The days the drag in progress, or the placeholder, covers. */
    private _target;
    /** Classes of the view while a drag is in progress, which set the cursor. */
    private _rootClasses;
    private _renderHeader;
    private _renderDayCells;
    private _renderEvent;
    private _renderWeeks;
    render(): import("lit-html").TemplateResult<1>;
}
