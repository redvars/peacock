import { LitElement, html, nothing, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import {
  addDays,
  addMonths,
  atWallMinutes,
  clamp,
  formatEventWhen,
  formatTimeRange,
  isAllDayRange,
  MINUTE_MS,
  nextDay,
  onActivateKey,
  rangesOverlap,
  snapTime,
  startOfDay,
  toZonedWallClock,
} from '@/calendar/utils.js';
import {
  CalendarDragController,
  dragByDays,
  type CalendarDragAction,
  type DragPoint,
} from '@/calendar/calendar-drag.js';
import { renderCalendarHeader } from '@/calendar/calendar-header.js';
import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import { isRtl } from '@/__internal/i18n/locale.js';
import type { PeacockStrings } from '@/__internal/i18n/strings.js';
import {
  dateToIso,
  isoToDate,
  weekStart,
  weekendDays,
  type WeekDay,
} from '@/__internal/utils/date.js';
import {
  DAY_MINUTES,
  assignLanes,
  axisLength,
  axisMinutes,
  dateAtAxis,
  dayOfRange,
  eventSpan,
  rangeEnd,
  viewRange,
  type AxisSpan,
  type TimelineRange,
} from './layout.js';
import type {
  CalendarTimelineEvent,
  CalendarTimelineEventAddDetail,
  CalendarTimelineEventChangeDetail,
  CalendarTimelineGroupToggleDetail,
  CalendarTimelineResource,
  CalendarTimelineViewType,
} from './types.js';
import styles from './calendar-timeline.scss';

export type {
  CalendarTimelineEvent,
  CalendarTimelineEventAddDetail,
  CalendarTimelineEventChangeAction,
  CalendarTimelineEventChangeDetail,
  CalendarTimelineGroupToggleDetail,
  CalendarTimelineResource,
  CalendarTimelineViewType,
} from './types.js';

/** Detail of `date-change`. */
export type CalendarTimelineDateChangeDetail = {
  /** The new context date. */
  date: Date;
  /** The same date as an ISO string, `YYYY-MM-DD`. */
  value: string;
};

/** An event laid out in its row. */
interface PlacedEvent extends AxisSpan {
  data: CalendarTimelineEvent;
  start: Date;
  end: Date;
  lane: number;
}

/** A resource's row, laid out. */
interface LaidOutRow {
  resource: CalendarTimelineResource;
  events: PlacedEvent[];
  lanes: number;
}

/** The rows of one `group-by` value: indices into the laid-out rows, in order. */
interface RowGroup {
  key: string;
  rows: number[];
}

/** A press that may become a drag. */
interface GridPress {
  action: CalendarDragAction;
  /** The event pressed; none when adding. */
  event?: PlacedEvent;
  /** The index of the row pressed. */
  row: number;
  /** The time under the press: the day in day views. */
  time: Date;
}

/** Where a drag would put an event, or the range it would add. */
interface GridPreview {
  action: CalendarDragAction;
  /** The dragged event's object from `events`; none when adding. */
  data?: CalendarTimelineEvent;
  /** The index of the row it would land in. */
  row: number;
  title: string;
  color?: string;
  start: Date;
  end: Date;
}

/** Events shorter than this have no handle at their start in hour views, so there is room to grab them. */
const START_HANDLE_MIN_MS = 30 * MINUTE_MS;

/**
 * Applies an `event-change` to an `events` array the way the timeline does, returning a new array in
 * which the event is replaced by a copy with the new `start`, `end` and `resourceId`. The event is
 * found by identity, else by `id`. The copy is made with object spread, so give the timeline plain
 * objects. Use it to apply a change you canceled, for example once the server has accepted it.
 */
export function applyCalendarTimelineChange<T extends CalendarTimelineEvent>(
  events: readonly T[],
  change: Pick<
    CalendarTimelineEventChangeDetail,
    'event' | 'start' | 'end' | 'resourceId'
  >,
): T[] {
  const { id } = change.event;
  let index = events.indexOf(change.event as T);
  if (index < 0 && id !== undefined && id !== null) {
    index = events.findIndex(event => event.id === id);
  }
  return events.map((event, i) =>
    i === index
      ? {
          ...event,
          start: change.start,
          end: change.end,
          resourceId: change.resourceId,
        }
      : event,
  );
}

/**
 * @label Calendar Timeline
 * @tag wc-calendar-timeline
 * @rawTag calendar-timeline
 * @summary Resources such as people, rooms or machines as rows against a horizontal time axis, with events that can be dragged between times and rows.
 *
 * @overview
 * <p>Pass the rows as <code>resources</code> (<code>{ id, title, supportingText? }</code>) and the
 * events as <code>events</code>: the calendar's event objects with a <code>resourceId</code>. An
 * event whose <code>resourceId</code> matches no resource is not shown, and <code>end</code> is
 * exclusive, as in <code>wc-calendar</code>.</p>
 * <p>Each entry of <code>available-views</code> is <code>{ value, label?, slot, days? }</code>:
 * <code>slot</code> is what a column stands for, <code>hour</code> or <code>day</code>, and without
 * <code>days</code> the view is a calendar month. The defaults are <code>day</code> (24 hour
 * columns), <code>week</code> (7 day columns from the week's first day) and <code>month</code>. In
 * hour views an event is drawn from its start to its end; in day views it covers the days it
 * touches. Events that overlap in a row stack in lanes. Columns share the width, never narrower
 * than <code>--calendar-timeline-hour-width</code> or <code>--calendar-timeline-day-width</code>, and a
 * range that does not fit scrolls sideways under a header and a resource column that stay in
 * place. A line marks the current time.</p>
 * <p>The header, <code>date</code>, <code>contextDate</code>, <code>view</code>,
 * <code>first-day</code>, <code>timezone</code>, <code>locale</code>, <code>previous()</code>,
 * <code>next()</code> and <code>today()</code> work as in <code>wc-calendar</code>, so the two can
 * share a view switcher and a date.</p>
 * <p>With <code>editable</code>, people drag an event to another time or another resource's row,
 * and drag its edges to resize it: in steps of <code>minute-step</code> minutes in hour views, by
 * whole days in day views. Each drop fires the cancelable <code>event-change</code>, with the new
 * <code>resourceId</code>; unless it is canceled, the timeline replaces <code>events</code> with a new
 * array holding a copy of the event. To confirm a change with a server first, cancel the event and
 * apply it later with <code>applyCalendarTimelineChange()</code>. With <code>addable</code>, dragging
 * across empty time in a row, or clicking it, fires <code>event-add</code>; the range stays marked
 * as a new event until <code>events</code> changes or <code>clearPlaceholder()</code> is called.
 * An event with <code>editable: false</code> stays put, and <code>events-readonly</code> turns
 * editing off.</p>
 * <p><code>group-by</code> names a resource field, such as <code>team</code>, to group the rows by.
 * Groups keep the order they first appear in, and resources without the field form an
 * "(Empty)" group. Each group has a header row whose button collapses or expands it and fires
 * <code>group-toggle</code>; <code>collapsed-groups</code> holds the keys of the collapsed groups,
 * their values as strings. A collapsed group's header shows its events as thin bars, so its busy
 * times stay in sight. Events can be dragged between rows of different groups.</p>
 * <p>The timeline is a table: a row per resource, with the resource's title as its row header and its
 * events in its cell. Events are buttons, named with their title, resource and time, that fire
 * <code>event-click</code>. Changes are announced to screen readers. Dragging needs a pointer, so
 * offer another way to change an event too, such as the dialog <code>event-click</code> opens.</p>
 *
 * @cssprop --calendar-timeline-resource-width - Width of the resource column. Defaults to `12rem`.
 * @cssprop --calendar-timeline-hour-width - Narrowest an hour column gets before the timeline scrolls. Defaults to `4rem`.
 * @cssprop --calendar-timeline-day-width - Narrowest a day column gets before the timeline scrolls. Defaults to `3rem`.
 * @cssprop --calendar-timeline-lane-height - Height of each lane of events in a row. Defaults to `2rem`.
 * @cssprop --calendar-timeline-border-color - Color of the grid lines.
 * @cssprop --calendar-timeline-event-bg-color - Background color of events without a `color`.
 * @cssprop --calendar-timeline-event-border-color - Start border color of events without a `color`.
 *
 * @fires {CustomEvent<{event: CalendarTimelineEvent}>} event-click - An event was clicked, or chosen with Enter or Space. Detail contains `{ event }`. Not fired with `events-readonly`.
 * @fires {CustomEvent<{view: string}>} view-change - The view changed. Detail contains `{ view }`.
 * @fires {CustomEvent<CalendarTimelineDateChangeDetail>} date-change - The context date changed. Detail contains `{ date, value }`: the `Date` and its ISO string.
 * @fires {CustomEvent<CalendarTimelineEventChangeDetail>} event-change - An event was dragged to a new time or row (`action: 'move'`), or had its start or end dragged (`action: 'resize'`). Detail contains `{ event, start, end, resourceId, action }`, where `event` is the object from `events` as it was. Cancelable: cancel it to keep the event where it was. Only with `editable`.
 * @fires {CustomEvent<CalendarTimelineEventAddDetail>} event-add - Empty time in a row was dragged across or clicked. Detail contains `{ start, end, allDay, resourceId }`. Only with `addable`.
 * @fires {CustomEvent<CalendarTimelineGroupToggleDetail>} group-toggle - A group was collapsed or expanded with its header's button. Detail contains `{ group, expanded }`.
 *
 * @example
 * ```html
 * <wc-calendar-timeline id="rooms" view="day" resource-label="Rooms" editable addable style="height: 24rem"></wc-calendar-timeline>
 * <script>
 *   const rooms = document.getElementById('rooms');
 *   rooms.resources = [
 *     { id: 'aspen', title: 'Aspen', supportingText: '8 seats' },
 *     { id: 'birch', title: 'Birch', supportingText: '4 seats' },
 *   ];
 *   rooms.events = [
 *     { id: 1, resourceId: 'aspen', title: 'Design review', start: new Date(2026, 10, 4, 9), end: new Date(2026, 10, 4, 10) },
 *   ];
 *   rooms.addEventListener('event-change', event => console.log(event.detail));
 * </script>
 * ```
 */
@IndividualComponent
export class CalendarTimeline extends LitElement {
  // ── Static

  static styles = [styles];

  // ── Properties

  /** The rows, in order. */
  @property({ attribute: false })
  resources: CalendarTimelineResource[] = [];

  /** The events. Each one is shown in the row of the resource its `resourceId` names. */
  @property({ attribute: false })
  events: CalendarTimelineEvent[] = [];

  /**
   * The views offered in the header. A view without a `label` shows Peacock's `day`, `week` or
   * `month` string for those values, else its `value`.
   */
  @property({ type: Array, attribute: 'available-views' })
  availableViews: CalendarTimelineViewType[] = [
    { value: 'day', slot: 'hour', days: 1 },
    { value: 'week', slot: 'day', days: 7 },
    { value: 'month', slot: 'day' },
  ];

  /** The view shown: the `value` of one of `availableViews`. */
  @property({ type: String, reflect: true })
  view: string = 'day';

  /**
   * The date the view shows, as an ISO string (`YYYY-MM-DD`). Kept in step with `contextDate`.
   * Defaults to today.
   */
  @property({ type: String })
  date: string = '';

  /** The date the view shows, as a `Date`. Kept in step with `date`. */
  @property({ type: Object, attribute: false })
  contextDate: Date | null = null;

  /** First day of the week, `0` (Sunday) to `6` (Saturday). Defaults to the locale's week start. */
  @property({ type: Number, attribute: 'first-day' })
  firstDay?: number;

  /** Header of the resource column, such as "Rooms" or "People". Defaults to "Resources". */
  @property({ type: String, attribute: 'resource-label' })
  resourceLabel: string = '';

  /**
   * A resource field to group the rows by, such as `team`. Each group gets a header row that
   * collapses it. Groups keep the order they first appear in.
   */
  @property({ type: String, attribute: 'group-by' })
  groupBy: string = '';

  /** Keys of the collapsed groups: their `group-by` values as strings (`""` for resources without one). */
  @property({ type: Array, attribute: 'collapsed-groups' })
  collapsedGroups: string[] = [];

  /** Events are shown but cannot be clicked or focused, and `event-click` does not fire. */
  @property({ type: Boolean, attribute: 'events-readonly' })
  eventsReadonly: boolean = false;

  /**
   * People can drag events to other times and rows, and drag their edges to resize them. Each drop
   * fires the cancelable `event-change`. An event with `editable: false` stays put.
   */
  @property({ type: Boolean, reflect: true })
  editable: boolean = false;

  /**
   * Dragging across empty time in a row, or clicking it, fires `event-add` with the range and
   * marks it as a new event until `events` changes.
   */
  @property({ type: Boolean, reflect: true })
  addable: boolean = false;

  /** Minutes that dragging moves, resizes and draws events by in hour views. Defaults to 15. */
  @property({ type: Number, attribute: 'minute-step' })
  minuteStep: number = 15;

  /** Length in minutes of an event added by clicking empty time in an hour view. Defaults to 60. */
  @property({ type: Number, attribute: 'default-duration' })
  defaultDuration: number = 60;

  /** Shows a progress bar and marks the timeline busy while events load. */
  @property({ type: Boolean, reflect: true })
  loading: boolean = false;

  /** IANA time zone the current time is shown in, for example `America/New_York`. Defaults to the browser's. */
  @property({ type: String })
  timezone: string = '';

  /**
   * Locale for day names and times. Defaults to the nearest `lang`, then the browser language.
   */
  @property({ type: String })
  locale: string = '';

  /** Overrides Peacock's strings for this instance only. */
  @property({ attribute: false }) strings?: Partial<PeacockStrings>;

  // ── State

  /** Now, as wall-clock time in `timezone`. */
  @state()
  private _currentTime: Date = new Date();

  /** The drag in progress, where it would put its event. */
  @state()
  private _preview: GridPreview | null = null;

  /** The range of the last `event-add`, marked as a new event until the app adds it. */
  @state()
  private _placeholder: CalendarTimelineEventAddDetail | null = null;

  // ── Private fields

  /** Peacock's strings and the resolved locale. */
  private readonly _i18n = new I18nController(this);

  /** The days shown. */
  private _range: TimelineRange = { start: startOfDay(new Date()), days: 1 };

  /** The rows, laid out before each render, in the order of `resources`. */
  private _rows: LaidOutRow[] = [];

  /** The rows by `group-by` value, when grouped. */
  private _groups: RowGroup[] | null = null;

  /** Whether to scroll the axis to now, or to the morning, after the next render. */
  private _scrollPending = true;

  private readonly _drag = new CalendarDragController<GridPress>(this, {
    lift: () => this._blurFocused(),
    move: (press, point) => this._follow(press, point),
    drop: (press, point) => this._drop(press, point),
    cancel: () => {
      this._preview = null;
    },
    tap: press => this._tap(press),
    scrollers: () => [this.renderRoot.querySelector<HTMLElement>('.scroller')],
  });

  // ── Lifecycle

  override connectedCallback() {
    super.connectedCallback();
    this._currentTime = this._now();
    if (!this.contextDate && !isoToDate(this.date)) {
      this.contextDate = this._currentTime;
    }
    // Capture, so a press clears the placeholder before it starts a drag of its own.
    this.addEventListener('pointerdown', this._handlePointerDown, true);
    this.addEventListener('keydown', this._handleKeyDown);
    // Clicking empty time leaves focus on the page, so Escape is also heard there.
    window.addEventListener('keydown', this._handleWindowKeyDown);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('pointerdown', this._handlePointerDown, true);
    this.removeEventListener('keydown', this._handleKeyDown);
    window.removeEventListener('keydown', this._handleWindowKeyDown);
  }

  override willUpdate(changed: PropertyValues<this>) {
    super.willUpdate(changed);
    if (changed.has('timezone')) this._currentTime = this._now();
    this._syncDate(changed);

    const view = this._view;
    const previous = this._range;
    if (view) {
      this._range = viewRange(
        view,
        this.contextDate ?? this._currentTime,
        this._weekStart(),
      );
    }
    const rangeChanged =
      this._range.start.valueOf() !== previous.start.valueOf() ||
      this._range.days !== previous.days;
    if (rangeChanged || changed.has('view') || changed.has('availableViews')) {
      this._scrollPending = true;
    }
    this._rows = this._layout();
    this._groups = this.groupBy ? this._groupsOf(this._rows) : null;

    this._drag.enabled = this.addable || this._eventsEditable();
    // A drag cannot outlive the days or rows it started on, or editing being turned off.
    if (
      this._drag.pressing &&
      (rangeChanged ||
        changed.has('view') ||
        changed.has('resources') ||
        changed.has('groupBy') ||
        changed.has('collapsedGroups') ||
        changed.has('editable') ||
        changed.has('addable') ||
        changed.has('eventsReadonly'))
    ) {
      this._drag.abort();
    }
    // The new event has been added, or the person has moved on.
    if (
      this._placeholder &&
      (changed.has('events') ||
        changed.has('resources') ||
        changed.has('view') ||
        changed.has('date') ||
        changed.has('contextDate') ||
        (changed.has('addable') && !this.addable))
    ) {
      this._placeholder = null;
    }
  }

  override updated() {
    if (this._scrollPending) {
      this._scrollPending = false;
      this._scrollAxis();
    }
  }

  // ── Public methods

  /** Moves back one period: the view's number of days, or a month. */
  previous() {
    this._shift(-1);
  }

  /** Moves forward one period: the view's number of days, or a month. */
  next() {
    this._shift(1);
  }

  /** Moves the view to today, in `timezone`. */
  today() {
    this._currentTime = this._now();
    this._setContextDate(this._currentTime);
  }

  /**
   * Removes the new event marked after `event-add`, for when adding it is canceled. It also goes
   * when `events` changes.
   */
  clearPlaceholder() {
    this._placeholder = null;
  }

  // ── Private methods

  /** The entry of `availableViews` matching `view`. */
  private get _view(): CalendarTimelineViewType | undefined {
    return this.availableViews.find(view => view.value === this.view);
  }

  /** What a column of the current view stands for. */
  private get _slot(): CalendarTimelineViewType['slot'] {
    return this._view?.slot === 'day' ? 'day' : 'hour';
  }

  /** `minuteStep` when it is a whole number of minutes in a day, else 15. */
  private get _step(): number {
    const step = Math.round(this.minuteStep);
    return Number.isFinite(step) && step >= 1 ? Math.min(step, 1440) : 15;
  }

  /** `defaultDuration` when it is a positive number of minutes, else 60. */
  private get _duration(): number {
    const minutes = Math.round(this.defaultDuration);
    return Number.isFinite(minutes) && minutes >= 1 ? minutes : 60;
  }

  /** Now, as wall-clock time in `timezone`. */
  private _now(): Date {
    return toZonedWallClock(new Date(), this.timezone);
  }

  /** Keeps `date` and `contextDate` in step; `date` wins when both changed. */
  private _syncDate(changed: PropertyValues<this>) {
    const current = this.contextDate ? dateToIso(this.contextDate) : '';
    if (changed.has('date') && this.date && this.date !== current) {
      const parsed = isoToDate(this.date);
      if (parsed) {
        this.contextDate = parsed;
        return;
      }
    }
    if (current && this.date !== current) {
      this.date = current;
    }
  }

  /** The week start in effect: `firstDay` when valid, else the locale's. */
  private _weekStart(): WeekDay {
    const day = this.firstDay;
    if (
      typeof day === 'number' &&
      Number.isInteger(day) &&
      day >= 0 &&
      day <= 6
    ) {
      return day as WeekDay;
    }
    return weekStart(this._i18n.locale);
  }

  /** Whether events can be dragged: `editable` and not `events-readonly`. */
  private _eventsEditable(): boolean {
    return this.editable && !this.eventsReadonly;
  }

  /** Whether an event can be dragged: the timeline is editable and the event did not opt out. */
  private _canEdit(event: CalendarTimelineEvent): boolean {
    return this._eventsEditable() && event.editable !== false;
  }

  /** Each resource's events within the range, in lanes. */
  private _layout(): LaidOutRow[] {
    const view = this._view;
    if (!view) return [];
    const range = this._range;
    const end = rangeEnd(range);
    const byResource = new Map<string | number, CalendarTimelineEvent[]>();
    (this.events ?? []).forEach(event => {
      if (!rangesOverlap(event.start, event.end, range.start, end)) return;
      const list = byResource.get(event.resourceId);
      if (list) list.push(event);
      else byResource.set(event.resourceId, [event]);
    });
    return (this.resources ?? []).map(resource => {
      const spans = (byResource.get(resource.id) ?? []).map(data => ({
        data,
        start: data.start,
        end: data.end,
        ...eventSpan(range, view.slot, data.start, data.end),
      }));
      const { lanes, laneOf } = assignLanes(spans);
      const events: PlacedEvent[] = spans.map(span => ({
        ...span,
        lane: laneOf.get(span) ?? 0,
      }));
      return { resource, events, lanes };
    });
  }

  /** The rows by their `group-by` value, in the order each value first appears. */
  private _groupsOf(rows: LaidOutRow[]): RowGroup[] {
    const groups = new Map<string, RowGroup>();
    rows.forEach((row, index) => {
      const value = row.resource[this.groupBy];
      const key = value === undefined || value === null ? '' : String(value);
      const group = groups.get(key);
      if (group) group.rows.push(index);
      else groups.set(key, { key, rows: [index] });
    });
    return [...groups.values()];
  }

  /** `collapsedGroups` as strings. */
  private _collapsedKeys(): string[] {
    return (
      Array.isArray(this.collapsedGroups) ? this.collapsedGroups : []
    ).map(key => String(key));
  }

  /** Collapses or expands a group, and fires `group-toggle`. */
  private _toggleGroup(key: string) {
    const keys = this._collapsedKeys();
    const expanded = keys.includes(key);
    this.collapsedGroups = expanded
      ? keys.filter(entry => entry !== key)
      : [...keys, key];
    this.dispatchEvent(
      new CustomEvent<CalendarTimelineGroupToggleDetail>('group-toggle', {
        detail: { group: key, expanded },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _shift(direction: 1 | -1) {
    const view = this._view;
    if (!view || !this.contextDate) return;
    if (view.days) {
      this._setContextDate(
        addDays(this.contextDate, direction * Math.round(view.days)),
      );
    } else {
      this._setContextDate(addMonths(this.contextDate, direction));
    }
  }

  private _setContextDate(date: Date) {
    this.contextDate = date;
    this.date = dateToIso(date);
    this.dispatchEvent(
      new CustomEvent<CalendarTimelineDateChangeDetail>('date-change', {
        detail: { date, value: this.date },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _changeView(value: string) {
    this.view = value;
    this.dispatchEvent(
      new CustomEvent('view-change', {
        detail: { view: value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** The view's own label, else Peacock's string for the built-in views, else its value. */
  private _viewLabel(view: CalendarTimelineViewType): string {
    if (view.label) return view.label;
    if (
      view.value === 'day' ||
      view.value === 'week' ||
      view.value === 'month'
    ) {
      return this._i18n.t(view.value);
    }
    return view.value;
  }

  /** The days shown, for the header and the table's name. */
  private _rangeLabel(): string {
    const { locale } = this._i18n;
    const { start, days } = this._range;
    if (!this._view?.days) {
      return new Intl.DateTimeFormat(locale, {
        month: 'long',
        year: 'numeric',
      }).format(start);
    }
    if (days === 1) {
      return new Intl.DateTimeFormat(locale, { dateStyle: 'full' }).format(
        start,
      );
    }
    const last = dayOfRange(this._range, days - 1);
    const format = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });
    try {
      return format.formatRange(start, last);
    } catch {
      return `${format.format(start)} – ${format.format(last)}`;
    }
  }

  /** Custom properties that colour an event with a palette `color`. */
  private _colorVars(color: string | undefined): Record<string, string> {
    if (!color) return {};
    return {
      '--calendar-timeline-event-bg-color': `var(--color-${color}-container)`,
      '--calendar-timeline-event-bg-color--hover': `var(--color-inverse-${color})`,
      '--calendar-timeline-event-border-color': `var(--color-${color})`,
      '--calendar-timeline-event-text-color': `var(--color-on-${color}-container)`,
      '--calendar-timeline-event-text-color--hover': `var(--color-on-${color})`,
    };
  }

  private _styleMap(declarations: Record<string, string>): string {
    return Object.entries(declarations)
      .map(([k, v]) => `${k}:${v}`)
      .join(';');
  }

  /** The `inset-inline-start` and `width` of something spanning `span` of the axis. */
  private _position(span: AxisSpan): Record<string, string> {
    const total = axisLength(this._range);
    return {
      'inset-inline-start': `${(span.from / total) * 100}%`,
      width: `${(Math.max(0, span.to - span.from) / total) * 100}%`,
    };
  }

  /** When an event happens, for its accessible name and the live region. */
  private _when(start: Date, end: Date): string {
    return formatEventWhen(
      start,
      end,
      this._i18n.locale,
      isAllDayRange(start, end),
    );
  }

  /** The time an event shows after its title: its times in hour views, its start in day views. */
  private _timeText(start: Date, end: Date): string {
    const { locale } = this._i18n;
    if (this._slot === 'hour') return formatTimeRange(start, end, locale);
    if (isAllDayRange(start, end)) return '';
    return new Intl.DateTimeFormat(locale, { timeStyle: 'short' }).format(
      start,
    );
  }

  /**
   * Reads `message` in the live region. Its text is set directly, so an announcement does not
   * render the timeline again.
   */
  private _announce(message: string) {
    const region = this.renderRoot.querySelector('[role="status"]');
    if (!region) return;
    // Clear first, so the same message twice in a row is read again.
    region.textContent = '';
    setTimeout(() => {
      region.textContent = message;
    });
  }

  /** Scrolls the axis to just before now when it is in range, else to the morning or the start. */
  private _scrollAxis() {
    const scroller = this.renderRoot.querySelector<HTMLElement>('.scroller');
    const header = this.renderRoot.querySelector<HTMLElement>('.time-header');
    if (!scroller || !header || scroller.scrollWidth <= scroller.clientWidth) {
      return;
    }
    const range = this._range;
    const total = axisLength(range);
    const now = this._currentTime;
    let minutes = 0;
    if (rangesOverlap(now, now, range.start, rangeEnd(range))) {
      minutes =
        axisMinutes(range, now) - (this._slot === 'hour' ? 60 : DAY_MINUTES);
    } else if (this._slot === 'hour') {
      minutes = 8 * 60;
    }
    const left = (clamp(minutes, 0, total) / total) * header.offsetWidth;
    scroller.scrollTo({ left: isRtl(this) ? -left : left });
  }

  // ── Drag and drop

  /** Minutes along the axis at viewport `x`; the axis runs from the inline start. */
  private _axisAt(x: number): number {
    const rect = this.renderRoot
      .querySelector('.time-header')
      ?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return 0;
    const fraction = isRtl(this)
      ? (rect.right - x) / rect.width
      : (x - rect.left) / rect.width;
    return clamp(fraction, 0, 1) * axisLength(this._range);
  }

  /** The time at viewport `x`. */
  private _timeAt(x: number): Date {
    return dateAtAxis(this._range, this._axisAt(x));
  }

  /** The day at viewport `x`, at midnight. */
  private _dayAt(x: number): Date {
    const index = Math.min(
      Math.floor(this._axisAt(x) / DAY_MINUTES),
      this._range.days - 1,
    );
    return dayOfRange(this._range, index);
  }

  /**
   * The index of the row at viewport `y`, or of the nearest shown; -1 without rows. Rows of
   * collapsed groups are not shown, so each track names its row.
   */
  private _rowAt(y: number): number {
    let best = -1;
    let bestDistance = Infinity;
    this.renderRoot
      .querySelectorAll<HTMLElement>('.track[data-row]')
      .forEach(track => {
        const rect = track.getBoundingClientRect();
        const distance = Math.max(0, rect.top - y, y - rect.bottom);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = Number(track.dataset.row);
        }
      });
    return best;
  }

  /** The time a press at `x` starts from: the day in day views. */
  private _pressTime(x: number): Date {
    return this._slot === 'day' ? this._dayAt(x) : this._timeAt(x);
  }

  private _onEventPointerDown(
    event: PointerEvent,
    placed: PlacedEvent,
    row: number,
  ) {
    if (!this._canEdit(placed.data)) return;
    const handle =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>('[data-handle]')?.dataset.handle
        : undefined;
    let action: CalendarDragAction = 'move';
    if (handle === 'start') action = 'resize-start';
    else if (handle === 'end') action = 'resize-end';
    this._drag.start(event, {
      action,
      event: placed,
      row,
      time: this._pressTime(event.clientX),
    });
  }

  private _onTrackPointerDown(event: PointerEvent, row: number) {
    if (!this.addable || this._drag.pressing) return;
    // Presses on events are theirs, even on events that cannot be dragged.
    const onEvent = event
      .composedPath()
      .some(
        target =>
          target instanceof HTMLElement && target.classList.contains('event'),
      );
    if (onEvent) return;
    this._drag.start(event, {
      action: 'add',
      row,
      time: this._pressTime(event.clientX),
    });
  }

  /** Where the drag of `press` would put its event with the pointer at `point`. */
  private _previewFor(press: GridPress, point: DragPoint): GridPreview | null {
    const { event } = press;
    const range =
      this._slot === 'day'
        ? dragByDays(press.action, press.time, this._dayAt(point.x), event)
        : this._hourRange(press, point);
    if (!range) return null;
    // Only a move changes rows.
    const row =
      press.action === 'move' ? Math.max(0, this._rowAt(point.y)) : press.row;
    return {
      action: press.action,
      data: event?.data,
      row,
      title: event
        ? event.data.title || this._i18n.t('calendarUntitled')
        : this._i18n.t('calendarNewEvent'),
      color: event?.data.color,
      ...range,
    };
  }

  /** The range a drag in an hour view gives, snapped to `minuteStep` and kept in the range. */
  private _hourRange(
    press: GridPress,
    point: DragPoint,
  ): { start: Date; end: Date } | null {
    const step = this._step;
    const stepMs = step * MINUTE_MS;
    const first = this._range.start.valueOf();
    const last = rangeEnd(this._range).valueOf();
    const time = this._timeAt(point.x);
    const { event } = press;

    if (press.action === 'add') {
      // The slot pressed is always part of the range.
      const anchor = Math.min(
        snapTime(press.time, step, 'floor').valueOf(),
        last - stepMs,
      );
      if (time.valueOf() >= anchor) {
        const end = Math.max(
          snapTime(time, step, 'ceil').valueOf(),
          anchor + stepMs,
        );
        return { start: new Date(anchor), end: new Date(Math.min(end, last)) };
      }
      return {
        start: snapTime(time, step, 'floor'),
        end: new Date(Math.min(anchor + stepMs, last)),
      };
    }
    if (!event) return null;

    const length = event.end.valueOf() - event.start.valueOf();
    if (press.action === 'move') {
      // The point the event was grabbed by follows the pointer; at least a step of it stays in range.
      const visible = Math.min(stepMs, length);
      const grab = press.time.valueOf() - event.start.valueOf();
      const start = clamp(
        snapTime(new Date(time.valueOf() - grab), step, 'round').valueOf(),
        first + visible - length,
        last - visible,
      );
      return { start: new Date(start), end: new Date(start + length) };
    }
    if (press.action === 'resize-end') {
      const end = snapTime(time, step, 'round').valueOf();
      const min = event.start.valueOf() + stepMs;
      return {
        start: event.start,
        end: new Date(clamp(end, min, Math.max(last, min))),
      };
    }
    const start = snapTime(time, step, 'round').valueOf();
    const max = event.end.valueOf() - stepMs;
    return {
      start: new Date(clamp(start, Math.min(first, max), max)),
      end: event.end,
    };
  }

  private _follow(press: GridPress, point: DragPoint) {
    const preview = this._previewFor(press, point);
    if (!preview) return;
    const current = this._preview;
    if (
      current &&
      current.row === preview.row &&
      current.start.valueOf() === preview.start.valueOf() &&
      current.end.valueOf() === preview.end.valueOf()
    ) {
      return;
    }
    this._preview = preview;
  }

  private _drop(press: GridPress, point: DragPoint) {
    const preview = this._previewFor(press, point) ?? this._preview;
    this._preview = null;
    if (!preview) return;
    const resource = this._rows[preview.row]?.resource;
    if (!resource) return;
    const { start, end } = preview;
    if (press.action === 'add') {
      this._add({
        start,
        end,
        allDay: this._slot === 'day',
        resourceId: resource.id,
      });
      return;
    }
    const { event } = press;
    if (!event) return;
    if (
      start.valueOf() === event.start.valueOf() &&
      end.valueOf() === event.end.valueOf() &&
      resource.id === event.data.resourceId
    ) {
      return;
    }
    this._change({
      event: event.data,
      start,
      end,
      resourceId: resource.id,
      action: press.action === 'move' ? 'move' : 'resize',
    });
  }

  /** A click on empty time adds an event there: `defaultDuration` long, or the whole day. */
  private _tap(press: GridPress) {
    if (press.action !== 'add') return;
    const resource = this._rows[press.row]?.resource;
    if (!resource) return;
    if (this._slot === 'day') {
      this._add({
        start: press.time,
        end: nextDay(press.time),
        allDay: true,
        resourceId: resource.id,
      });
      return;
    }
    // Starts at the half hour clicked.
    const grain = Math.max(30, this._step);
    const last = rangeEnd(this._range).valueOf();
    const start = Math.min(
      snapTime(press.time, grain, 'floor').valueOf(),
      last - grain * MINUTE_MS,
    );
    this._add({
      start: new Date(start),
      end: new Date(Math.min(start + this._duration * MINUTE_MS, last)),
      allDay: false,
      resourceId: resource.id,
    });
  }

  /** Fires `event-change` and, unless it is canceled, applies and announces it. */
  private _change(detail: CalendarTimelineEventChangeDetail) {
    if (!this._eventsEditable()) return;
    const change = new CustomEvent<CalendarTimelineEventChangeDetail>(
      'event-change',
      { detail, bubbles: true, composed: true, cancelable: true },
    );
    if (!this.dispatchEvent(change)) return;
    this.events = applyCalendarTimelineChange(this.events, detail);
    const title = detail.event.title || this._i18n.t('calendarUntitled');
    const when = this._when(detail.start, detail.end);
    if (detail.resourceId !== detail.event.resourceId) {
      const resource =
        this.resources.find(item => item.id === detail.resourceId)?.title ?? '';
      this._announce(
        this._i18n.t('calendarTimelineEventMoved')(title, resource, when),
      );
      return;
    }
    this._announce(
      this._i18n.t(
        detail.action === 'move'
          ? 'calendarEventMoved'
          : 'calendarEventResized',
      )(title, when),
    );
  }

  /** Marks the range as a new event, fires `event-add` and announces it. */
  private _add(detail: CalendarTimelineEventAddDetail) {
    if (!this.addable) return;
    this._placeholder = detail;
    this.dispatchEvent(
      new CustomEvent<CalendarTimelineEventAddDetail>('event-add', {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
    const resource =
      this.resources.find(item => item.id === detail.resourceId)?.title ?? '';
    this._announce(
      [
        this._i18n.t('calendarNewEvent'),
        resource,
        formatEventWhen(
          detail.start,
          detail.end,
          this._i18n.locale,
          detail.allDay,
        ),
      ]
        .filter(Boolean)
        .join(', '),
    );
  }

  /**
   * Blurs the focused event when a drag starts. The drop redraws the events, and the element that
   * held focus could then show another event, which Enter would open.
   */
  private _blurFocused() {
    const active = (this.renderRoot as ShadowRoot).activeElement;
    if (active instanceof HTMLElement) active.blur();
  }

  private readonly _handlePointerDown = () => {
    if (this._placeholder) this._placeholder = null;
  };

  private readonly _handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || !this._placeholder) return;
    // Keep an enclosing dialog open.
    event.stopPropagation();
    this._placeholder = null;
  };

  private readonly _handleWindowKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && this._placeholder) this._placeholder = null;
  };

  /** Classes of the scroller, which set the cursor during a drag. */
  private _scrollerClasses() {
    const action = this._preview?.action;
    return {
      scroller: true,
      addable: this.addable,
      dragging: !!action,
      'drag-move': action === 'move',
      'drag-resize': action === 'resize-start' || action === 'resize-end',
    };
  }

  // ── Render helpers

  private _renderHeader() {
    return renderCalendarHeader({
      title: this._rangeLabel(),
      views: this.availableViews.map(view => ({
        value: view.value,
        label: this._viewLabel(view),
      })),
      view: this.view,
      labels: {
        today: this._i18n.t('today'),
        previous: this._i18n.t('previousPeriod'),
        next: this._i18n.t('nextPeriod'),
      },
      onToday: () => this.today(),
      onPrevious: () => this.previous(),
      onNext: () => this.next(),
      onViewChange: value => this._changeView(value),
    });
  }

  /** The column labels: hours (under their days when there are several), or days. */
  private _renderTimeHeader(view: CalendarTimelineViewType) {
    const { locale } = this._i18n;
    const range = this._range;
    const today = startOfDay(this._currentTime).valueOf();
    const days = Array.from({ length: range.days }, (_, i) =>
      dayOfRange(range, i),
    );
    if (view.slot === 'day') {
      const weekday = new Intl.DateTimeFormat(locale, {
        weekday: range.days > 7 ? 'narrow' : 'short',
      });
      const number = new Intl.DateTimeFormat(locale, { day: 'numeric' });
      return days.map(
        day =>
          html`<div
            class=${classMap({
              'slot-label': true,
              'day-label': true,
              today: day.valueOf() === today,
            })}
          >
            <span class="weekday">${weekday.format(day)}</span>
            <span class="day-number">${number.format(day)}</span>
          </div>`,
      );
    }
    const hour = new Intl.DateTimeFormat(locale, { hour: 'numeric' });
    const dayName = new Intl.DateTimeFormat(locale, {
      weekday: 'short',
      day: 'numeric',
    });
    return html`
      ${range.days > 1
        ? days.map(
            day =>
              html`<div
                class=${classMap({
                  'slot-label': true,
                  'day-span': true,
                  today: day.valueOf() === today,
                })}
              >
                ${dayName.format(day)}
              </div>`,
          )
        : nothing}
      ${days.map(day =>
        Array.from(
          { length: 24 },
          (_, h) =>
            html`<div class="slot-label hour-label">
              ${hour.format(atWallMinutes(day, h * 60))}
            </div>`,
        ),
      )}
    `;
  }

  /** Today, weekends and day boundaries behind every row, and the current-time line. */
  private _renderOverlay(view: CalendarTimelineViewType) {
    const range = this._range;
    const today = startOfDay(this._currentTime).valueOf();
    const weekend = weekendDays(this._i18n.locale);
    const stripes = Array.from({ length: range.days }, (_, i) => {
      const day = dayOfRange(range, i);
      const classes = {
        stripe: true,
        today: view.slot === 'day' && day.valueOf() === today,
        weekend:
          view.slot === 'day' && weekend.includes(day.getDay() as WeekDay),
        'day-start': view.slot === 'hour' && i > 0,
      };
      if (!classes.today && !classes.weekend && !classes['day-start']) {
        return nothing;
      }
      return html`<div
        class=${classMap(classes)}
        style=${this._styleMap(
          this._position({
            from: i * DAY_MINUTES,
            to: (i + 1) * DAY_MINUTES,
          }),
        )}
      ></div>`;
    });
    const now = this._currentTime;
    const showNow = rangesOverlap(now, now, range.start, rangeEnd(range));
    return html`<div class="overlay" aria-hidden="true">
      ${stripes}
      ${showNow
        ? html`<div
            class="now"
            style="inset-inline-start: ${(axisMinutes(range, now) /
              axisLength(range)) *
            100}%"
          ></div>`
        : nothing}
    </div>`;
  }

  private _renderEvent(placed: PlacedEvent, row: number, slot: string) {
    const { data } = placed;
    const interactive = !this.eventsReadonly;
    const editable = this._canEdit(data);
    const preview = this._preview;
    const dragged = !!preview?.data && preview.data === data;
    const resized =
      dragged && preview && preview.action !== 'move' ? preview : null;
    // A resize is drawn in place; a move leaves the event faded where it was.
    const start = resized ? resized.start : data.start;
    const end = resized ? resized.end : data.end;
    const span = resized
      ? eventSpan(this._range, this._slot, start, end)
      : placed;
    const title = data.title || this._i18n.t('calendarUntitled');
    const resource = this._rows[row]?.resource.title ?? '';
    const time = this._timeText(start, end);
    const activate = () =>
      this.dispatchEvent(
        new CustomEvent('event-click', {
          detail: { event: data },
          bubbles: true,
          composed: true,
        }),
      );
    // The event's own times decide its handles, so the one being dragged stays.
    const handles = {
      start:
        data.start.valueOf() >= this._range.start.valueOf() &&
        (slot === 'day' ||
          data.end.valueOf() - data.start.valueOf() >= START_HANDLE_MIN_MS),
      end: data.end.valueOf() <= rangeEnd(this._range).valueOf(),
    };
    const handle = (edge: 'start' | 'end') =>
      editable && handles[edge]
        ? html`<span
            class="resize-handle ${edge}"
            data-handle=${edge}
            aria-hidden="true"
          ></span>`
        : nothing;
    return html`
      <div
        class=${classMap({
          event: true,
          clickable: interactive,
          editable,
          'drag-source': dragged && !resized,
          lifted: !!resized,
        })}
        style=${this._styleMap({
          ...this._position(span),
          '--_lane-index': String(placed.lane),
          ...this._colorVars(data.color),
        })}
        role=${interactive ? 'button' : 'note'}
        tabindex=${interactive ? '0' : nothing}
        aria-label=${[title, resource, this._when(data.start, data.end)]
          .filter(Boolean)
          .join(', ')}
        @click=${() => {
          if (interactive) activate();
        }}
        @keydown=${interactive ? onActivateKey(activate) : nothing}
        @pointerdown=${editable
          ? (event: PointerEvent) =>
              this._onEventPointerDown(event, placed, row)
          : nothing}
      >
        ${handle('start')}
        <span class="event-title" aria-hidden="true">${title}</span>
        ${time
          ? html`<span class="event-time" aria-hidden="true">${time}</span>`
          : nothing}
        ${handle('end')}
      </div>
    `;
  }

  /** A new or moved event where the drag would put it in this row, or the placeholder. */
  private _renderRowPreview(row: number) {
    const preview = this._preview;
    let item: { start: Date; end: Date; title: string; color?: string } | null =
      null;
    let placeholder = false;
    if (preview) {
      if (
        (preview.action === 'add' || preview.action === 'move') &&
        preview.row === row
      ) {
        item = preview;
      }
    } else if (
      this._placeholder &&
      this._rows[row]?.resource.id === this._placeholder.resourceId
    ) {
      item = {
        ...this._placeholder,
        title: this._i18n.t('calendarNewEvent'),
      };
      placeholder = true;
    }
    if (!item) return nothing;
    const time = this._timeText(item.start, item.end);
    return html`<div
      class=${classMap({ event: true, preview: true, placeholder })}
      style=${this._styleMap({
        ...this._position(
          eventSpan(this._range, this._slot, item.start, item.end),
        ),
        '--_lane-index': '0',
        ...this._colorVars(item.color),
      })}
      aria-hidden="true"
    >
      <span class="event-title">${item.title}</span>
      ${time ? html`<span class="event-time">${time}</span>` : nothing}
    </div>`;
  }

  private _renderRow(row: LaidOutRow, index: number, slot: string) {
    const { resource } = row;
    return html`
      <div class="row" role="row">
        <div class="resource" role="rowheader">
          <span class="resource-title">${resource.title}</span>
          ${resource.supportingText
            ? html`<span class="resource-supporting"
                >${resource.supportingText}</span
              >`
            : nothing}
        </div>
        <div
          class="track"
          role="cell"
          data-row=${index}
          style="--_lanes: ${row.lanes}"
          @pointerdown=${(event: PointerEvent) =>
            this._onTrackPointerDown(event, index)}
        >
          ${row.events.map(placed => this._renderEvent(placed, index, slot))}
          ${this._renderRowPreview(index)}
        </div>
      </div>
    `;
  }

  /** A collapsed group's events as thin bars, so its busy times stay in sight. */
  private _renderGroupSummary(group: RowGroup) {
    return html`<div class="summary" aria-hidden="true">
      ${group.rows.map(index =>
        (this._rows[index]?.events ?? []).map(
          event =>
            html`<span
              class="summary-bar"
              style=${this._styleMap({
                ...this._position(event),
                ...this._colorVars(event.data.color),
              })}
            ></span>`,
        ),
      )}
    </div>`;
  }

  /** A group's header row, then its rows unless it is collapsed. */
  private _renderGroup(group: RowGroup, collapsed: boolean, slot: string) {
    const name = group.key === '' ? this._i18n.t('emptyGroup') : group.key;
    const count = group.rows.length;
    return html`
      <div
        class=${classMap({ row: true, 'group-row': true, collapsed })}
        role="row"
      >
        <div class="group-header" role="rowheader">
          <button
            type="button"
            class="group-toggle"
            aria-expanded=${collapsed ? 'false' : 'true'}
            aria-label=${collapsed
              ? this._i18n.t('expandGroup')(name)
              : this._i18n.t('collapseGroup')(name)}
            @click=${() => this._toggleGroup(group.key)}
          >
            <wc-icon name="chevron_right" aria-hidden="true"></wc-icon>
          </button>
          <span class="group-label">${name}</span>
          <span class="group-count"
            >${this._i18n.t('calendarTimelineGroupCount')(
              new Intl.NumberFormat(this._i18n.locale).format(count),
              count,
            )}</span
          >
        </div>
        <div class="group-track" role="cell">
          ${collapsed ? this._renderGroupSummary(group) : nothing}
        </div>
      </div>
      ${collapsed
        ? nothing
        : group.rows.map(index =>
            this._renderRow(this._rows[index], index, slot),
          )}
    `;
  }

  /** The rows, under their groups' headers when grouped. */
  private _renderRows(slot: string) {
    if (!this._rows.length) {
      return html`<div class="row" role="row">
        <div class="empty" role="cell">
          ${this._i18n.t('calendarTimelineEmpty')}
        </div>
      </div>`;
    }
    if (!this._groups) {
      return this._rows.map((row, index) => this._renderRow(row, index, slot));
    }
    const collapsed = new Set(this._collapsedKeys());
    return this._groups.map(group =>
      this._renderGroup(group, collapsed.has(group.key), slot),
    );
  }

  private _renderGrid() {
    const view = this._view;
    if (!view) {
      return html`<div class="message">${this._i18n.t('invalidView')}</div>`;
    }
    const range = this._range;
    const slots = view.slot === 'day' ? range.days : range.days * 24;
    const label = this._rangeLabel();
    return html`
      <div
        class=${classMap(this._scrollerClasses())}
        style="--_slots: ${slots}; --_days: ${range.days}; --_slot-min: var(${view.slot ===
        'day'
          ? '--calendar-timeline-day-width'
          : '--calendar-timeline-hour-width'})"
      >
        <div class="table" role="table" aria-label=${label}>
          <div class="row header-row" role="row">
            <div class="corner" role="columnheader">
              ${this.resourceLabel || this._i18n.t('calendarTimelineResources')}
            </div>
            <div
              class=${classMap({
                'time-header': true,
                'two-tier': view.slot === 'hour' && range.days > 1,
              })}
              role="columnheader"
              aria-label=${label}
            >
              <div class="slot-labels" aria-hidden="true">
                ${this._renderTimeHeader(view)}
              </div>
            </div>
          </div>
          <div class="rows" role="rowgroup">
            ${this._renderOverlay(view)} ${this._renderRows(view.slot)}
          </div>
        </div>
      </div>
    `;
  }

  // ── Render

  render() {
    const busy = this.loading;
    return html`
      <div class="calendar-timeline">
        <div class="calendar-header">${this._renderHeader()}</div>
        ${busy
          ? html`<wc-linear-progress
              class="loader"
              indeterminate
              label=${this._i18n.t('loading')}
            ></wc-linear-progress>`
          : nothing}
        <div class="body" aria-busy=${busy ? 'true' : 'false'}>
          ${this._renderGrid()}
        </div>
        <div class="screen-reader-only" role="status" aria-live="polite"></div>
      </div>
    `;
  }
}
