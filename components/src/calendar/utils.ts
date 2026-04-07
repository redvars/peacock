/**
 * Pure date utility functions (no external dependencies).
 */

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function addHours(date: Date, hours: number): Date {
  const d = new Date(date);
  d.setHours(d.getHours() + hours);
  return d;
}

export function differenceInDays(dateA: Date, dateB: Date): number {
  const a = startOfDay(dateA);
  const b = startOfDay(dateB);
  return Math.round((a.valueOf() - b.valueOf()) / 86400000);
}

export function startOfWeek(
  date: Date,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1,
): Date {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  d.setDate(d.getDate() - diff);
  return d;
}

export function endOfWeek(
  date: Date,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1,
): Date {
  const d = startOfWeek(date, weekStartsOn);
  d.setDate(d.getDate() + 6);
  return endOfDay(d);
}

export function startOfMonth(date: Date): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfMonth(date: Date): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function calculateMonthRange(
  date: Date,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1,
) {
  const sd = startOfWeek(startOfMonth(date), weekStartsOn);
  const ed = endOfWeek(endOfMonth(date), weekStartsOn);
  return { startDate: sd, endDate: ed, totalDays: 42 };
}

export function calculateWeekRange(
  date: Date,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1,
) {
  const sd = startOfWeek(date, weekStartsOn);
  const ed = endOfWeek(date, weekStartsOn);
  return { startDate: sd, endDate: ed, totalDays: 7 };
}

export function calculateDateRange(
  view: string,
  contextDate: Date,
  days: number,
) {
  if (view === 'week') {
    return calculateWeekRange(contextDate, 1);
  }
  return {
    startDate: startOfDay(contextDate),
    endDate: endOfDay(addDays(contextDate, days - 1)),
    totalDays: days,
  };
}

export const LONG_EVENT_PADDING = 0.25;

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

export function formatDate(date: Date, pattern: string): string {
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

export function getTimePercent(date: Date, forDay?: Date): number {
  const day = forDay || date;
  const sd = startOfDay(day);
  const ed = endOfDay(day);
  const percent =
    ((date.valueOf() - sd.valueOf()) / (ed.valueOf() - sd.valueOf())) * 100;
  if (percent < 0) return 0;
  if (percent > 100) return 100;
  return percent;
}
