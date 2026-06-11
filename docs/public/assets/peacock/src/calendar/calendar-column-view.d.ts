import { LitElement } from 'lit';
import { CalendarEvent } from './calendar-event.js';
/**
 * @label Calendar Column View
 * @tag wc-calendar-column-view
 * @rawTag calendar-column-view
 * @summary Internal column view component for the calendar (day/week views).
 */
export declare class CalendarColumnView extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    events: CalendarEvent[];
    view: string;
    days: number;
    eventClickable: boolean;
    currentTime: Date;
    contextDate: Date;
    private dateRange;
    private singleDayEvents;
    private multiDayEvents;
    connectedCallback(): void;
    willUpdate(changedProperties: Map<string, unknown>): void;
    firstUpdated(): void;
    private _processEvents;
    private _forEachDayInRange;
    private _getDateOnly;
    private _getDatePercent;
    private _getDayClass;
    private _populateColorVars;
    private _emitDateClick;
    private _emitEventClick;
    private _renderHeader;
    private _renderMultiDayBackground;
    private _renderScale;
    private _renderBackgroundGrid;
    private _renderEvents;
    private _renderMultiDayEvents;
    private _renderCurrentTime;
    private _styleMap;
    render(): import("lit-html").TemplateResult<1>;
}
