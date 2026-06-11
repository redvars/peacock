/**
 * Pure date utility functions (no external dependencies).
 */
function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}
function endOfDay(date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
}
function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}
function addMonths(date, months) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
}
function addHours(date, hours) {
    const d = new Date(date);
    d.setHours(d.getHours() + hours);
    return d;
}
function differenceInDays(dateA, dateB) {
    const a = startOfDay(dateA);
    const b = startOfDay(dateB);
    return Math.round((a.valueOf() - b.valueOf()) / 86400000);
}
function startOfWeek(date, weekStartsOn = 1) {
    const d = startOfDay(date);
    const day = d.getDay();
    const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
    d.setDate(d.getDate() - diff);
    return d;
}
function endOfWeek(date, weekStartsOn = 1) {
    const d = startOfWeek(date, weekStartsOn);
    d.setDate(d.getDate() + 6);
    return endOfDay(d);
}
function startOfMonth(date) {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
}
function endOfMonth(date) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + 1, 0);
    d.setHours(23, 59, 59, 999);
    return d;
}
function calculateMonthRange(date, weekStartsOn = 1) {
    const sd = startOfWeek(startOfMonth(date), weekStartsOn);
    const ed = endOfWeek(endOfMonth(date), weekStartsOn);
    return { startDate: sd, endDate: ed, totalDays: 42 };
}
function calculateWeekRange(date, weekStartsOn = 1) {
    const sd = startOfWeek(date, weekStartsOn);
    const ed = endOfWeek(date, weekStartsOn);
    return { startDate: sd, endDate: ed, totalDays: 7 };
}
function calculateDateRange(view, contextDate, days) {
    if (view === 'week') {
        return calculateWeekRange(contextDate, 1);
    }
    return {
        startDate: startOfDay(contextDate),
        endDate: endOfDay(addDays(contextDate, days - 1)),
        totalDays: days,
    };
}
const LONG_EVENT_PADDING = 0.25;
const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES_LONG = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];
const MONTH_NAMES = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];
function formatDate(date, pattern) {
    const day = date.getDate();
    const dayOfWeek = date.getDay();
    const month = date.getMonth();
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    switch (pattern) {
        case 'MMMM d, yyyy':
            return `${MONTH_NAMES[month]} ${day}, ${year}`;
        case 'EEEE':
            return DAY_NAMES_LONG[dayOfWeek];
        case 'E':
            return DAY_NAMES_SHORT[dayOfWeek];
        case 'd':
            return `${day}`;
        case 'dd':
            return day < 10 ? `0${day}` : `${day}`;
        case 'hh a': {
            const h = hours % 12 || 12;
            const ampm = hours < 12 ? 'AM' : 'PM';
            return `${h < 10 ? '0' : ''}${h} ${ampm}`;
        }
        case 'hh:mm a': {
            const h = hours % 12 || 12;
            const ampm = hours < 12 ? 'AM' : 'PM';
            return `${h < 10 ? '0' : ''}${h}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;
        }
        case 'dd-MM-yyyy':
            return `${day < 10 ? '0' : ''}${day}-${month + 1 < 10 ? '0' : ''}${month + 1}-${year}`;
        default:
            return date.toLocaleDateString();
    }
}
function getTimePercent(date, forDay) {
    const day = forDay || date;
    const sd = startOfDay(day);
    const ed = endOfDay(day);
    const percent = ((date.valueOf() - sd.valueOf()) / (ed.valueOf() - sd.valueOf())) * 100;
    if (percent < 0)
        return 0;
    if (percent > 100)
        return 100;
    return percent;
}

class BaseEvent {
    constructor(start, end) {
        this.gid = crypto.randomUUID();
        this.start = start;
        this.end = end;
    }
    length() {
        return this.end.valueOf() - this.start.valueOf();
    }
    isOverlapping(event) {
        let totalLength;
        if (this.start.valueOf() <= event.start.valueOf()) {
            totalLength = event.end.valueOf() - this.start.valueOf();
        }
        else {
            totalLength = this.end.valueOf() - event.start.valueOf();
        }
        return this.length() + event.length() >= totalLength;
    }
    isOverlappingWithoutTime(event) {
        const thisStartDay = startOfDay(this.start);
        const eventStartDay = startOfDay(event.start);
        const thisEndDay = endOfDay(this.end);
        const eventEndDay = endOfDay(event.end);
        let totalLength;
        if (thisStartDay.valueOf() <= eventStartDay.valueOf()) {
            totalLength = eventEndDay.valueOf() - thisStartDay.valueOf();
        }
        else {
            totalLength = thisEndDay.valueOf() - eventStartDay.valueOf();
        }
        return this.length() + event.length() >= totalLength;
    }
    isOverlappingWithDate(date) {
        return (this.start.valueOf() <= date.valueOf() &&
            this.end.valueOf() >= date.valueOf());
    }
}

class CalendarEvent extends BaseEvent {
    constructor(start, end, title, color, data) {
        super(start, end);
        this.data = data;
        if (color)
            this.color = color;
        this.title = title;
    }
}

export { BaseEvent as B, CalendarEvent as C, LONG_EVENT_PADDING as L, addDays as a, addMonths as b, calculateDateRange as c, differenceInDays as d, endOfDay as e, formatDate as f, getTimePercent as g, addHours as h, calculateMonthRange as i, startOfDay as s };
//# sourceMappingURL=calendar-event-BrQ_SEKD.js.map
