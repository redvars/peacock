import { c as __classPrivateFieldGet } from './IndividualComponent-Bdwyrvd6.js';
import { C as CalendarEvent } from './calendar-event-BrQ_SEKD.js';

var _EventManager_events, _MonthEventManager_events;
class ColumnEvent extends CalendarEvent {
    constructor(event) {
        super(event.start, event.end, event.title, event.color, event.data);
        this.width = 1;
    }
}
class EventManager {
    constructor() {
        _EventManager_events.set(this, []);
        this.columns = [];
    }
    addEvents(events) {
        events.forEach(event => {
            __classPrivateFieldGet(this, _EventManager_events, "f").push(new ColumnEvent(event));
        });
    }
    process() {
        this.columns = [];
        let events = __classPrivateFieldGet(this, _EventManager_events, "f").sort((a, b) => {
            return a.start.valueOf() - b.start.valueOf() || b.length() - a.length();
        });
        let oldLength = null;
        /* Bucketing: group non-overlapping events into columns */
        while (events.length) {
            if (oldLength === events.length) {
                throw new Error('Events not processed in previous run, breaking infinite loop');
            }
            oldLength = events.length;
            const column = [];
            for (let i = 0; i < events.length; i++) {
                if (i === 0) {
                    column.push(events[i]);
                }
                else if (events[i].start.valueOf() >= column[column.length - 1].end.valueOf()) {
                    column.push(events[i]);
                }
            }
            this.columns.push(column);
            events = events.filter(e => !column.find(ce => ce.gid === e.gid));
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
_EventManager_events = new WeakMap();
class MonthEventManager {
    constructor() {
        _MonthEventManager_events.set(this, []);
        this.columns = [];
    }
    addEvents(events) {
        events.forEach(event => {
            __classPrivateFieldGet(this, _MonthEventManager_events, "f").push(new ColumnEvent(event));
        });
    }
    process() {
        this.columns = [];
        let events = __classPrivateFieldGet(this, _MonthEventManager_events, "f").sort((a, b) => {
            return a.start.valueOf() - b.start.valueOf() || b.length() - a.length();
        });
        let oldLength = null;
        while (events.length) {
            if (oldLength === events.length) {
                throw new Error('Events not processed in previous run, breaking infinite loop');
            }
            oldLength = events.length;
            const column = [];
            for (let i = 0; i < events.length; i++) {
                if (i === 0) {
                    column.push(events[i]);
                }
                else {
                    const lastEnd = new Date(column[column.length - 1].end);
                    lastEnd.setHours(23, 59, 59, 999);
                    const nextStart = new Date(events[i].start);
                    nextStart.setHours(0, 0, 0, 0);
                    if (nextStart.valueOf() > lastEnd.valueOf()) {
                        column.push(events[i]);
                    }
                }
            }
            this.columns.push(column);
            events = events.filter(e => !column.find(ce => ce.gid === e.gid));
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
_MonthEventManager_events = new WeakMap();

export { EventManager as E, MonthEventManager as M };
//# sourceMappingURL=event-manager-DTyX2uYD.js.map
