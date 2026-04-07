export type CalendarViewType = {
  label: string;
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
