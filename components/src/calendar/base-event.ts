import { startOfDay, endOfDay } from './utils.js';

export class BaseEvent {
  gid: string;
  start: Date;
  end: Date;

  constructor(start: Date, end: Date) {
    this.gid = crypto.randomUUID();
    this.start = start;
    this.end = end;
  }

  length(): number {
    return this.end.valueOf() - this.start.valueOf();
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
