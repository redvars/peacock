import { BaseEvent } from './base-event.js';

export class CalendarEvent extends BaseEvent {
  data: any;
  title: string;
  color?: string;

  constructor(
    start: Date,
    end: Date,
    title: string,
    color: string | undefined,
    data: any,
  ) {
    super(start, end);
    this.data = data;
    if (color) this.color = color;
    this.title = title;
  }
}
