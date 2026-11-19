import { startOfDay, endOfDay, isAllDayRange, lastDayOf } from './utils.js';

let lastId = 0;

export class BaseEvent {
  /** Identifies the event within a layout pass. */
  gid: string;

  start: Date;

  end: Date;

  constructor(start: Date, end: Date) {
    // A counter, not `crypto.randomUUID()`, which only exists in secure contexts.
    lastId += 1;
    this.gid = `calendar-event-${lastId}`;
    this.start = start;
    this.end = end;
  }

  length(): number {
    return this.end.valueOf() - this.start.valueOf();
  }

  /** Whether the event belongs in the all-day row: it lasts a day or more, or midnight to midnight. */
  isAllDay(): boolean {
    return isAllDayRange(this.start, this.end);
  }

  /** The last day the event covers; `end` is exclusive, so an event ending at midnight ends the day before. */
  lastDay(): Date {
    return lastDayOf(this.start, this.end);
  }

  isOverlapping(event: BaseEvent): boolean {
    let totalLength: number;
    if (this.start.valueOf() <= event.start.valueOf()) {
      totalLength = event.end.valueOf() - this.start.valueOf();
    } else {
      totalLength = this.end.valueOf() - event.start.valueOf();
    }
    return this.length() + event.length() >= totalLength;
  }

  isOverlappingWithoutTime(event: BaseEvent): boolean {
    const thisStartDay = startOfDay(this.start);
    const eventStartDay = startOfDay(event.start);
    const thisEndDay = endOfDay(this.end);
    const eventEndDay = endOfDay(event.end);

    let totalLength: number;
    if (thisStartDay.valueOf() <= eventStartDay.valueOf()) {
      totalLength = eventEndDay.valueOf() - thisStartDay.valueOf();
    } else {
      totalLength = thisEndDay.valueOf() - eventStartDay.valueOf();
    }
    return this.length() + event.length() >= totalLength;
  }

  isOverlappingWithDate(date: Date): boolean {
    return (
      this.start.valueOf() <= date.valueOf() &&
      this.end.valueOf() >= date.valueOf()
    );
  }
}
