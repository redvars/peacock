import { CalendarEvent } from './calendar-event.js';
import { endOfDay, startOfDay } from './utils.js';

export class ColumnEvent extends CalendarEvent {
  width: number = 1;

  constructor(event: CalendarEvent) {
    super(event.start, event.end, event.title, event.color, event.data);
  }
}

export class EventManager {
  #events: ColumnEvent[] = [];
  columns: ColumnEvent[][] = [];

  addEvents(events: CalendarEvent[]): void {
    events.forEach(event => {
      this.#events.push(new ColumnEvent(event));
    });
  }

  process(): void {
    this.columns = [];
    let events = this.#events.sort((a, b) => {
      return a.start.valueOf() - b.start.valueOf() || b.length() - a.length();
    });

    let oldLength: number | null = null;
    /* Bucketing: group non-overlapping events into columns */
    while (events.length) {
      if (oldLength === events.length) {
        throw new Error(
          'Events not processed in previous run, breaking infinite loop',
        );
      }
      oldLength = events.length;

      const column: ColumnEvent[] = [];
      for (let i = 0; i < events.length; i++) {
        if (i === 0) {
          column.push(events[i]);
        } else if (events[i].start.valueOf() >= column[column.length - 1].end.valueOf()) {
          column.push(events[i]);
        }
      }
      this.columns.push(column);
      const placed = new Set(column);
      events = events.filter(e => !placed.has(e));
    }

    /* Calculate widths for events that span multiple columns */
    for (let i = 0; i < this.columns.length - 1; i++) {
      this.columns[i].forEach(event => {
        for (let j = i + 1; j < this.columns.length; j++) {
          if (this.columns[j].find(colEvent => event.isOverlapping(colEvent))) {
            break;
          }
          event.width++;
        }
      });
    }
  }
}

export class MonthEventManager {
  #events: ColumnEvent[] = [];
  columns: ColumnEvent[][] = [];

  addEvents(events: CalendarEvent[]): void {
    events.forEach(event => {
      this.#events.push(new ColumnEvent(event));
    });
  }

  process(): void {
    this.columns = [];
    let events = this.#events.sort((a, b) => {
      return a.start.valueOf() - b.start.valueOf() || b.length() - a.length();
    });

    let oldLength: number | null = null;
    while (events.length) {
      if (oldLength === events.length) {
        throw new Error(
          'Events not processed in previous run, breaking infinite loop',
        );
      }
      oldLength = events.length;

      const column: ColumnEvent[] = [];
      for (let i = 0; i < events.length; i++) {
        if (i === 0) {
          column.push(events[i]);
        } else {
          // `end` is exclusive: an event ending at midnight leaves that day free.
          const lastEnd = endOfDay(column[column.length - 1].lastDay());
          const nextStart = startOfDay(events[i].start);
          if (nextStart.valueOf() > lastEnd.valueOf()) {
            column.push(events[i]);
          }
        }
      }
      this.columns.push(column);
      const placed = new Set(column);
      events = events.filter(e => !placed.has(e));
    }

    for (let i = 0; i < this.columns.length - 1; i++) {
      this.columns[i].forEach(event => {
        for (let j = i + 1; j < this.columns.length; j++) {
          if (this.columns[j].find(colEvent => event.isOverlapping(colEvent))) {
            break;
          }
          event.width++;
        }
      });
    }
  }
}
