import { LitElement } from 'lit';
import { CalendarEvent } from './calendar-event.js';
/**
 * @label Calendar Month View
 * @tag wc-calendar-month-view
 * @rawTag calendar-month-view
 * @summary Internal month view component for the calendar.
 */
export declare class CalendarMonthView extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    events: CalendarEvent[];
    eventClickable: boolean;
    currentTime: Date;
    contextDate: Date;
    private dateRange;
    private weekDayEvents;
    connectedCallback(): void;
    willUpdate(changedProperties: Map<string, unknown>): void;
    firstUpdated(): void;
    private _processEvents;
    private _getDatePercent;
    private _getDayClass;
    private _populateColorVars;
    private _emitEventClick;
    private _renderHeader;
    private _renderMultiDayBackground;
    private _renderEvents;
    private _styleMap;
    render(): import("lit-html").TemplateResult<1>;
}
