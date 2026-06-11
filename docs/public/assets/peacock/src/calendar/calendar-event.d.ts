import { BaseEvent } from './base-event.js';
export declare class CalendarEvent extends BaseEvent {
    data: any;
    title: string;
    color?: string;
    constructor(start: Date, end: Date, title: string, color: string | undefined, data: any);
}
