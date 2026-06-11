import { LitElement } from 'lit';
import type { CalendarViewType, EventType } from './types.js';
/**
 * @label Calendar
 * @tag wc-calendar
 * @rawTag calendar
 * @summary A full calendar component for displaying events in day, week, or month views.
 *
 * @cssprop --calendar-border-color - Border color used throughout the calendar grid.
 * @cssprop --calendar-event-bg-color - Background color for calendar events.
 * @cssprop --calendar-event-border-color - Left border color for calendar events.
 *
 * @fires {CustomEvent} event-click - Dispatched when a calendar event is clicked. Detail contains `{ event }`.
 * @fires {CustomEvent} view-change - Dispatched when the calendar view changes. Detail contains `{ view }`.
 * @fires {CustomEvent} date-change - Dispatched when the context date changes. Detail contains `{ date }`.
 *
 * @example
 * ```html
 * <wc-calendar view="week" style="height: 600px"></wc-calendar>
 * ```
 */
export declare class Calendar extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /**
     * Calendar events array.
     */
    events: EventType[];
    /**
     * Available views configuration.
     */
    availableViews: CalendarViewType[];
    /**
     * Current calendar view.
     */
    view: string;
    /**
     * Whether events are clickable.
     */
    eventClickable: boolean;
    /**
     * Show loading state.
     */
    showLoader: boolean;
    /**
     * Timezone string (e.g. 'America/New_York').
     */
    timezone: string;
    /**
     * The context date for the calendar view.
     */
    contextDate: Date | null;
    private _currentTime;
    private _currentView;
    connectedCallback(): void;
    willUpdate(changedProperties: Map<string, unknown>): void;
    private _onColumnViewDateClick;
    private _onEventClick;
    previous(): void;
    next(): void;
    private _goToToday;
    private _onViewSegmentChange;
    private _renderHeader;
    private _renderCalendarView;
    render(): import("lit-html").TemplateResult<1>;
}
