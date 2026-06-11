import { CalendarEvent } from './calendar-event.js';
export declare class ColumnEvent extends CalendarEvent {
    width: number;
    constructor(event: CalendarEvent);
}
export declare class EventManager {
    #private;
    columns: ColumnEvent[][];
    addEvents(events: CalendarEvent[]): void;
    process(): void;
}
export declare class MonthEventManager {
    #private;
    columns: ColumnEvent[][];
    addEvents(events: CalendarEvent[]): void;
    process(): void;
}
