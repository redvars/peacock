export declare class BaseEvent {
    gid: string;
    start: Date;
    end: Date;
    constructor(start: Date, end: Date);
    length(): number;
    isOverlapping(event: BaseEvent): boolean;
    isOverlappingWithoutTime(event: BaseEvent): boolean;
    isOverlappingWithDate(date: Date): boolean;
}
