export type CalendarViewType = {
  /** Text of the view's button. Defaults to Peacock's `day`, `week` or `month` string, else `value`. */
  label?: string;
  value: string;
  type: 'column' | 'month';
  days?: number;
};

export type EventType = {
  start: Date;
  end: Date;
  title: string;
  color?: string;
  [key: string]: any;
};
