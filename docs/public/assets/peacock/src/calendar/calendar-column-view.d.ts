import { LitElement, PropertyValues, TemplateResult } from 'lit';
import { CalendarEvent } from './calendar-event.js';
import type { CalendarEventAddDetail } from './types.js';
import type { WeekDay } from '../__internal/utils/date.js';
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
 * <p>With <code>editable</code>, events are dragged to move them and their edges to resize them;
 * with <code>addable</code>, dragging across empty time or clicking it asks for a new event.</p>
 *
 * @fires date-click - Internal, does not bubble; a day number was chosen. Detail contains `{ date }`.
 * @fires event-click - Internal, does not bubble; `wc-calendar` re-fires it. Detail contains `{ event }`.
 * @fires event-change - Internal, does not bubble; an event was dropped at a new time. `wc-calendar` re-fires it.
 * @fires event-add - Internal, does not bubble; a range of empty time was drawn or clicked. `wc-calendar` re-fires it.
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
    /** Events can be moved and resized by dragging. */
    editable: boolean;
    /** Dragging across empty time, or clicking it, asks for a new event. */
    addable: boolean;
    /** Minutes that drags move timed events and their edges by. */
    minuteStep: number;
    /** Minutes an event added by a click lasts. */
    defaultDuration: number;
    /** A range waiting for its new event, drawn as one. */
    placeholder: CalendarEventAddDetail | null;
    /** Title shown for an event without one. */
    untitledLabel: string;
    /** Title of the block that marks a new event. */
    newEventLabel: string;
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
    /** The drag in progress, where it would put its event. */
    private _preview;
    private readonly _drag;
    connectedCallback(): void;
    firstUpdated(): void;
    willUpdate(changed: PropertyValues<this>): void;
    private get _interactive();
    /** The locale dates and times are formatted in. */
    private get _locale();
    /** `minuteStep` when it is a whole number of minutes in a day, else 15. */
    private get _step();
    /** `defaultDuration` when it is a positive number of minutes, else 60. */
    private get _duration();
    /** Whether an event can be dragged: the view is editable and the event did not opt out. */
    private _canEdit;
    private _processEvents;
    private _forEachDayInRange;
    private _getDateOnly;
    private _getDatePercent;
    private _getDayClass;
    /** Custom properties that colour an event with a palette `color`. */
    private _colorVars;
    private _emitDateClick;
    private _emitEventClick;
    private _emitChange;
    private _emitAdd;
    /** Accessible name of the view: the dates it shows. */
    private _rangeLabel;
    private _styleMap;
    /** The day columns of a section. */
    private _columnsOf;
    /** The day of the column nearest `x`; with `within`, only a column that spans `x`. */
    private _dayAt;
    /** The time at `y` in `day`'s column of the hours. */
    private _timeAt;
    private _onEventPointerDown;
    private _onSectionPointerDown;
    /** Where the drag of `press` would put its event with the pointer at `point`. */
    private _previewFor;
    /** The range a drag in the hours gives, snapped to `minuteStep`. */
    private _timedRange;
    private _follow;
    private _drop;
    /** A click on empty time adds an event there: `defaultDuration` long, or the whole day. */
    private _tap;
    /**
     * Blurs the focused event when a drag starts. The drop redraws the events, and the element that
     * held focus could then show another event, which Enter would open.
     */
    private _blurFocused;
    /** How `node`'s blocks take part in the drag in progress. */
    private _dragRole;
    /** The days the drag in progress, or the placeholder, covers in the all-day row. */
    private _allDayTarget;
    /** Classes of the view while a drag is in progress, which set the cursor. */
    private _rootClasses;
    private _renderHeader;
    private _renderMultiDayBackground;
    private _renderScale;
    private _renderBackgroundGrid;
    /** One event block. `start` and `end` are where it is drawn, which a resize changes. */
    private _renderEvent;
    /** A timed event's block in one day column, at its own times or those of its resize. */
    private _renderTimedEvent;
    /** A new or moved timed event where the drag would put it, or the placeholder. */
    private _renderTimedPreview;
    private _renderEvents;
    /** Position of a bar in the all-day row covering the days of `start`–`end`. */
    private _allDayPosition;
    private _renderAllDayEvent;
    private _renderMultiDayEvents;
    private _renderCurrentTime;
    render(): TemplateResult<1>;
}
