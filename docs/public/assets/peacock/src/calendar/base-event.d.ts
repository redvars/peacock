export declare class BaseEvent {
    /** Identifies the event within a layout pass. */
    gid: string;
    start: Date;
    end: Date;
    constructor(start: Date, end: Date);
    length(): number;
    /** Whether the event belongs in the all-day row: it lasts a day or more, or midnight to midnight. */
    isAllDay(): boolean;
    /** The last day the event covers; `end` is exclusive, so an event ending at midnight ends the day before. */
    lastDay(): Date;
    isOverlapping(event: BaseEvent): boolean;
    isOverlappingWithoutTime(event: BaseEvent): boolean;
    isOverlappingWithDate(date: Date): boolean;
}
