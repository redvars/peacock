import { LitElement, html, nothing, PropertyValues, TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import {
  addDays,
  addHours,
  clamp,
  differenceInDays,
  startOfDay,
  calculateDateRange,
  formatDate,
  formatEventLabel,
  formatTimeRange,
  getTimePercent,
  lastDayOf,
  rangesOverlap,
  snapTime,
  timeAtFraction,
  LONG_EVENT_PADDING,
  MINUTE_MS,
  onActivateKey,
} from './utils.js';
import { CalendarEvent } from './calendar-event.js';
import {
  CalendarDragController,
  dragByDays,
  nearestIndex,
  type CalendarDragAction,
  type DragPoint,
} from './calendar-drag.js';
import { EventManager } from './event-manager.js';
import type { ColumnEvent } from './event-manager.js';
import type {
  CalendarEventAddDetail,
  CalendarEventChangeDetail,
  EventType,
} from './types.js';
import IndividualComponent from '@/IndividualComponent.js';
import { resolveLocale } from '@/__internal/i18n/locale.js';
import type { WeekDay } from '@/__internal/utils/date.js';
import styles from './calendar-column-view.scss';

/** The part of the view a drag happens in: the hours, or the all-day row above them. */
type Section = 'timed' | 'all-day';

/** A press that may become a drag. */
interface ColumnPress {
  action: CalendarDragAction;
  section: Section;
  /** The event pressed; none when adding. */
  event?: ColumnEvent;
  /** The day under the press. */
  day: Date;
  /** The time under the press; midnight in the all-day row. */
  time: Date;
}

/** Where a drag would put an event, or the range it would add. */
interface ColumnPreview {
  action: CalendarDragAction;
  section: Section;
  /** The dragged event's object from `events`; none when adding. */
  data?: EventType;
  title: string;
  color?: string;
  start: Date;
  end: Date;
}

/** How an event block takes part in a drag. */
type DragRole = 'source' | 'lifted' | null;

/** Events shorter than this have no handle at their start, so there is room to grab them. */
const START_HANDLE_MIN_MS = 30 * MINUTE_MS;

/** Previews shorter than this show their title and times on one line. */
const COMPACT_PREVIEW_MS = 45 * MINUTE_MS;

/**
 * @internal
 *
 * @label Calendar Column View
 * @tag wc-calendar-column-view
 * @rawTag calendar-column-view
 * @summary The calendar's day and week view, with one column of timed events per day.
 *
 * @overview
 * <p>Rendered by <code>wc-calendar</code>; not meant to be used on its own.</p>
 * <p>The view is a region labelled with the dates it shows. Day numbers in the header are buttons
 * that open the day; events are buttons labelled with their title and time, or notes that cannot
 * be focused when <code>events-readonly</code> is set. Events lasting a day or more are shown in a
 * row above the hours.</p>
 * <p>With <code>editable</code>, events are dragged to move them and their edges to resize them;
 * with <code>addable</code>, dragging across empty time or clicking it asks for a new event.</p>
 *
 * @fires date-click - Internal, does not bubble; a day number was chosen. Detail contains `{ date }`.
 * @fires event-click - Internal, does not bubble; `wc-calendar` re-fires it. Detail contains `{ event }`.
 * @fires event-change - Internal, does not bubble; an event was dropped at a new time. `wc-calendar` re-fires it.
 * @fires event-add - Internal, does not bubble; a range of empty time was drawn or clicked. `wc-calendar` re-fires it.
 */
@IndividualComponent
export class CalendarColumnView extends LitElement {
  // ── Static

  static styles = [styles];

  // ── Properties

  /** Events to lay out. */
  @property({ type: Array })
  events: CalendarEvent[] = [];

  /** The view's name; `week` aligns the range to the week start. */
  @property({ type: String })
  view: string = 'week';

  /** Number of day columns. */
  @property({ type: Number })
  days: number = 7;

  /** Events are shown but cannot be clicked or focused. */
  @property({ type: Boolean, attribute: 'events-readonly' })
  eventsReadonly: boolean = false;

  /** Events can be moved and resized by dragging. */
  @property({ type: Boolean })
  editable: boolean = false;

  /** Dragging across empty time, or clicking it, asks for a new event. */
  @property({ type: Boolean })
  addable: boolean = false;

  /** Minutes that drags move timed events and their edges by. */
  @property({ type: Number, attribute: false })
  minuteStep: number = 15;

  /** Minutes an event added by a click lasts. */
  @property({ type: Number, attribute: false })
  defaultDuration: number = 60;

  /** A range waiting for its new event, drawn as one. */
  @property({ attribute: false })
  placeholder: CalendarEventAddDetail | null = null;

  /** Title shown for an event without one. */
  @property({ attribute: false })
  untitledLabel: string = '(no title)';

  /** Title of the block that marks a new event. */
  @property({ attribute: false })
  newEventLabel: string = 'New event';

  /** Now, which places the current-time line and marks today. */
  @property({ type: Object, attribute: false })
  currentTime: Date = new Date();

  /** A date in the range to show. */
  @property({ type: Object, attribute: false })
  contextDate: Date = new Date();

  /** First day of the week, 0 (Sunday) to 6, for the `week` view. */
  @property({ type: Number, attribute: false })
  weekStartsOn: WeekDay = 1;

  /** Locale for day names and times. Defaults to the nearest `lang`, then the browser language. */
  @property({ type: String })
  locale: string = '';

  // ── State

  /** First and last day shown. */
  @state()
  private dateRange: { startDate: Date; endDate: Date; totalDays: number } = {
    startDate: new Date(),
    endDate: new Date(),
    totalDays: 7,
  };

  /** Timed events per day, keyed by `dd-MM-yyyy`. */
  @state()
  private singleDayEvents: Record<string, ColumnEvent[][]> = {};

  /** Rows of events lasting a day or more. */
  @state()
  private multiDayEvents: ColumnEvent[][] = [];

  /** The drag in progress, where it would put its event. */
  @state()
  private _preview: ColumnPreview | null = null;

  // ── Private fields

  private readonly _drag = new CalendarDragController<ColumnPress>(this, {
    lift: () => {},
    move: (press, point) => this._follow(press, point),
    drop: (press, point) => this._drop(press, point),
    cancel: () => {
      this._preview = null;
    },
    tap: press => this._tap(press),
    scrollers: press => [
      this.renderRoot.querySelector<HTMLElement>(
        press.section === 'timed' ? '.view-body' : '.multi-day-section-scroll',
      ),
    ],
  });

  // ── Lifecycle

  override connectedCallback() {
    super.connectedCallback();
    this._processEvents();
  }

  override firstUpdated() {
    const viewBody = this.renderRoot.querySelector('.view-body');
    if (viewBody) {
      const viewBodyHeight = viewBody.scrollHeight;
      viewBody.scrollTo({
        top: (getTimePercent(this.currentTime) / 100) * viewBodyHeight - 150,
      });
    }
  }

  override willUpdate(changed: PropertyValues<this>) {
    super.willUpdate(changed);
    if (
      changed.has('events') ||
      changed.has('contextDate') ||
      changed.has('view') ||
      changed.has('days') ||
      changed.has('weekStartsOn')
    ) {
      this._processEvents();
    }
    // A drag cannot outlive the days it started on, or editing being turned off.
    if (
      this._drag.pressing &&
      (changed.has('contextDate') ||
        changed.has('view') ||
        changed.has('days') ||
        changed.has('weekStartsOn') ||
        changed.has('editable') ||
        changed.has('addable') ||
        changed.has('eventsReadonly'))
    ) {
      this._drag.abort();
    }
  }

  // ── Private methods

  private get _interactive(): boolean {
    return !this.eventsReadonly;
  }

  /** The locale dates and times are formatted in. */
  private get _locale(): string {
    return resolveLocale(this.locale, this);
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

  /** Whether an event can be dragged: the view is editable and the event did not opt out. */
  private _canEdit(node: CalendarEvent): boolean {
    const data = node.data as EventType | undefined;
    return this.editable && this._interactive && data?.editable !== false;
  }

  private _processEvents() {
    this.dateRange = calculateDateRange(
      this.view,
      this.contextDate,
      this.days,
      this.weekStartsOn,
    );
    this.singleDayEvents = {};

    this._forEachDayInRange(i => {
      const dayStart = startOfDay(i);
      const dayEnd = addDays(dayStart, 1);
      const manager = new EventManager();
      manager.addEvents(
        this.events.filter(
          event =>
            !event.isAllDay() &&
            rangesOverlap(event.start, event.end, dayStart, dayEnd),
        ),
      );
      manager.process();
      this.singleDayEvents[this._getDateOnly(i)] = manager.columns;
    });

    const rangeEnd = addDays(startOfDay(this.dateRange.endDate), 1);
    const multiManager = new EventManager();
    multiManager.addEvents(
      this.events.filter(
        event =>
          event.isAllDay() &&
          rangesOverlap(
            event.start,
            event.end,
            this.dateRange.startDate,
            rangeEnd,
          ),
      ),
    );
    multiManager.process();
    this.multiDayEvents = multiManager.columns;
  }

  private _forEachDayInRange(callback: (d: Date) => void) {
    for (
      let i = new Date(this.dateRange.startDate);
      differenceInDays(startOfDay(this.dateRange.endDate), i) >= 0;
      i = addDays(i, 1)
    ) {
      callback(i);
    }
  }

  private _getDateOnly(date: Date): string {
    return formatDate(date, 'dd-MM-yyyy');
  }

  private _getDatePercent(date: Date): number {
    const currentDay = differenceInDays(
      startOfDay(date),
      this.dateRange.startDate,
    );
    const percent = (currentDay / this.dateRange.totalDays) * 100;
    if (percent < 0) return 0;
    if (percent > 100) return 100;
    return percent;
  }

  private _getDayClass(date: Date): string {
    const diff = differenceInDays(
      startOfDay(date),
      startOfDay(this.currentTime),
    );
    if (diff === 0) return 'column today';
    if (diff < 0) return 'column past';
    return 'column future';
  }

  /** Custom properties that colour an event with a palette `color`. */
  private _colorVars(color: string): Record<string, string> {
    return {
      '--calendar-event-bg-color': `var(--color-${color}-container)`,
      '--calendar-event-bg-color--hover': `var(--color-inverse-${color})`,
      '--calendar-event-border-color': `var(--color-${color})`,
      '--calendar-event-text-color': `var(--color-on-${color}-container)`,
      '--calendar-event-text-color--hover': `var(--color-on-${color})`,
    };
  }

  private _emitDateClick(date: Date) {
    this.dispatchEvent(new CustomEvent('date-click', { detail: { date } }));
  }

  private _emitEventClick(event: unknown) {
    this.dispatchEvent(new CustomEvent('event-click', { detail: { event } }));
  }

  private _emitChange(detail: CalendarEventChangeDetail) {
    this.dispatchEvent(
      new CustomEvent<CalendarEventChangeDetail>('event-change', { detail }),
    );
  }

  private _emitAdd(detail: CalendarEventAddDetail) {
    this.dispatchEvent(
      new CustomEvent<CalendarEventAddDetail>('event-add', { detail }),
    );
  }

  /** Accessible name of the view: the dates it shows. */
  private _rangeLabel(): string {
    const { startDate, endDate } = this.dateRange;
    const format = new Intl.DateTimeFormat(this._locale, { dateStyle: 'long' });
    if (differenceInDays(endDate, startDate) <= 0)
      return format.format(startDate);
    try {
      return format.formatRange(startDate, endDate);
    } catch {
      return `${format.format(startDate)} – ${format.format(endDate)}`;
    }
  }

  private _styleMap(declarations: Record<string, string>): string {
    return Object.entries(declarations)
      .map(([k, v]) => `${k}:${v}`)
      .join(';');
  }

  // ── Drag and drop

  /** The day columns of a section. */
  private _columnsOf(section: Section): HTMLElement[] {
    return [
      ...this.renderRoot.querySelectorAll<HTMLElement>(
        section === 'timed'
          ? '.events-container > .column'
          : '.multi-day-background .columns > .column',
      ),
    ];
  }

  /** The day of the column nearest `x`; with `within`, only a column that spans `x`. */
  private _dayAt(section: Section, x: number, within = false): Date | null {
    const columns = this._columnsOf(section);
    const index = nearestIndex(columns, x);
    if (index < 0) return null;
    if (within) {
      const rect = columns[index].getBoundingClientRect();
      if (x < rect.left || x > rect.right) return null;
    }
    return addDays(this.dateRange.startDate, index);
  }

  /** The time at `y` in `day`'s column of the hours. */
  private _timeAt(day: Date, y: number): Date {
    const rect = this.renderRoot
      .querySelector('.events-container')
      ?.getBoundingClientRect();
    if (!rect || rect.height <= 0) return startOfDay(day);
    return timeAtFraction(day, (y - rect.top) / rect.height);
  }

  private _onEventPointerDown(
    event: PointerEvent,
    node: ColumnEvent,
    section: Section,
  ) {
    if (!this._canEdit(node)) return;
    const handle =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>('[data-handle]')?.dataset.handle
        : undefined;
    let action: CalendarDragAction = 'move';
    if (handle === 'start') action = 'resize-start';
    else if (handle === 'end') action = 'resize-end';
    const day = this._dayAt(section, event.clientX) ?? startOfDay(node.start);
    this._drag.start(event, {
      action,
      section,
      event: node,
      day,
      time: section === 'timed' ? this._timeAt(day, event.clientY) : day,
    });
  }

  private _onSectionPointerDown(event: PointerEvent, section: Section) {
    if (!this.addable || this._drag.pressing) return;
    // Presses on events are theirs, even on events that cannot be dragged.
    const onEvent = event
      .composedPath()
      .some(
        target =>
          target instanceof HTMLElement && target.classList.contains('event'),
      );
    if (onEvent) return;
    const day = this._dayAt(section, event.clientX, true);
    if (!day) return;
    this._drag.start(event, {
      action: 'add',
      section,
      day,
      time: section === 'timed' ? this._timeAt(day, event.clientY) : day,
    });
  }

  /** Where the drag of `press` would put its event with the pointer at `point`. */
  private _previewFor(
    press: ColumnPress,
    point: DragPoint,
  ): ColumnPreview | null {
    const { event } = press;
    const range =
      press.section === 'timed'
        ? this._timedRange(press, point)
        : dragByDays(
            press.action,
            press.day,
            this._dayAt('all-day', point.x) ?? press.day,
            event,
          );
    if (!range) return null;
    return {
      action: press.action,
      section: press.section,
      data: event?.data as EventType | undefined,
      title: event ? event.title || this.untitledLabel : this.newEventLabel,
      color: event?.color,
      ...range,
    };
  }

  /** The range a drag in the hours gives, snapped to `minuteStep`. */
  private _timedRange(
    press: ColumnPress,
    point: DragPoint,
  ): { start: Date; end: Date } | null {
    const step = this._step;
    const stepMs = step * MINUTE_MS;
    const { event } = press;

    if (press.action === 'add') {
      // The slot pressed is always part of the range; the drag stays in its day.
      const time = this._timeAt(press.day, point.y);
      const anchor = snapTime(press.time, step, 'floor');
      const dayEnd = addDays(startOfDay(press.day), 1).valueOf();
      if (time.valueOf() >= anchor.valueOf()) {
        const end = Math.max(
          snapTime(time, step, 'ceil', press.day).valueOf(),
          anchor.valueOf() + stepMs,
        );
        return { start: anchor, end: new Date(Math.min(end, dayEnd)) };
      }
      return {
        start: snapTime(time, step, 'floor', press.day),
        end: new Date(Math.min(anchor.valueOf() + stepMs, dayEnd)),
      };
    }
    if (!event) return null;

    if (press.action === 'move') {
      // The event keeps its length and the point it was grabbed by, within the day under the pointer.
      const day = this._dayAt('timed', point.x) ?? press.day;
      const dayStart = startOfDay(day);
      const length = event.length();
      const grab = press.time.valueOf() - event.start.valueOf();
      const raw = new Date(this._timeAt(day, point.y).valueOf() - grab);
      let start = snapTime(raw, step, 'round', dayStart).valueOf();
      const latest = addDays(dayStart, 1).valueOf() - length;
      if (latest >= dayStart.valueOf()) start = Math.min(start, latest);
      return { start: new Date(start), end: new Date(start + length) };
    }

    if (press.action === 'resize-end') {
      // The end stays on the day it is drawn on, at least one step after the start.
      const endDay = event.lastDay();
      const end = snapTime(
        this._timeAt(endDay, point.y),
        step,
        'round',
        endDay,
      ).valueOf();
      const min = event.start.valueOf() + stepMs;
      const max = Math.max(addDays(endDay, 1).valueOf(), min);
      return { start: event.start, end: new Date(clamp(end, min, max)) };
    }

    // resize-start: the start stays on its day, at least one step before the end.
    const startDay = startOfDay(event.start);
    const start = snapTime(
      this._timeAt(startDay, point.y),
      step,
      'round',
      startDay,
    ).valueOf();
    const max = event.end.valueOf() - stepMs;
    return {
      start: new Date(clamp(start, Math.min(startDay.valueOf(), max), max)),
      end: event.end,
    };
  }

  private _follow(press: ColumnPress, point: DragPoint) {
    const preview = this._previewFor(press, point);
    if (!preview) return;
    const current = this._preview;
    if (
      current &&
      current.start.valueOf() === preview.start.valueOf() &&
      current.end.valueOf() === preview.end.valueOf()
    ) {
      return;
    }
    this._preview = preview;
  }

  private _drop(press: ColumnPress, point: DragPoint) {
    const preview = this._previewFor(press, point) ?? this._preview;
    this._preview = null;
    if (!preview) return;
    const { start, end } = preview;
    if (press.action === 'add') {
      this._emitAdd({ start, end, allDay: press.section === 'all-day' });
      return;
    }
    const { event } = press;
    if (!event || !preview.data) return;
    if (
      start.valueOf() === event.start.valueOf() &&
      end.valueOf() === event.end.valueOf()
    ) {
      return;
    }
    this._emitChange({
      event: preview.data,
      start,
      end,
      action: press.action === 'move' ? 'move' : 'resize',
    });
  }

  /** A click on empty time adds an event there: `defaultDuration` long, or the whole day. */
  private _tap(press: ColumnPress) {
    if (press.action !== 'add') return;
    if (press.section === 'all-day') {
      this._emitAdd({
        start: press.day,
        end: addDays(press.day, 1),
        allDay: true,
      });
      return;
    }
    // Starts at the half hour clicked, the rows the grid draws.
    const start = snapTime(press.time, Math.max(30, this._step), 'floor');
    const dayEnd = addDays(startOfDay(press.day), 1).valueOf();
    const end = new Date(
      Math.min(start.valueOf() + this._duration * MINUTE_MS, dayEnd),
    );
    this._emitAdd({ start, end, allDay: false });
  }

  /** How `node`'s blocks take part in the drag in progress. */
  private _dragRole(node: CalendarEvent, section: Section): DragRole {
    const preview = this._preview;
    if (!preview?.data || preview.data !== node.data) return null;
    // A timed event moving between columns is drawn again where it lands.
    return section === 'timed' && preview.action === 'move'
      ? 'source'
      : 'lifted';
  }

  /** The days the drag in progress, or the placeholder, covers in the all-day row. */
  private _allDayTarget(): { start: Date; end: Date } | null {
    const preview = this._preview;
    if (preview) return preview.section === 'all-day' ? preview : null;
    return this.placeholder?.allDay ? this.placeholder : null;
  }

  /** Classes of the view while a drag is in progress, which set the cursor. */
  private _rootClasses() {
    const action = this._preview?.action;
    const section = this._preview?.section;
    const resizing = action === 'resize-start' || action === 'resize-end';
    return {
      'calendar-column-view': true,
      addable: this.addable,
      dragging: !!action,
      'drag-move': action === 'move',
      'drag-resize-y': resizing && section === 'timed',
      'drag-resize-x': resizing && section === 'all-day',
    };
  }

  // ── Render helpers

  private _renderHeader() {
    const locale = this._locale;
    const long = new Intl.DateTimeFormat(locale, { dateStyle: 'full' });
    const columns: TemplateResult[] = [];
    this._forEachDayInRange(i => {
      const today = this._getDayClass(i).includes('today');
      const open = () => this._emitDateClick(i);
      columns.push(html`
        <div class=${this._getDayClass(i)}>
          <div class="column-content">
            <div
              class="date"
              role="button"
              tabindex="0"
              aria-label=${long.format(i)}
              aria-current=${today ? 'date' : nothing}
              @click=${open}
              @keydown=${onActivateKey(open)}
            >
              ${formatDate(i, 'dd', locale)}
            </div>
            <div class="day" aria-hidden="true">
              ${formatDate(i, 'E', locale)}
            </div>
          </div>
        </div>
      `);
    });
    return columns;
  }

  private _renderMultiDayBackground() {
    const target = this._allDayTarget();
    const first = target ? startOfDay(target.start).valueOf() : 0;
    const last = target ? lastDayOf(target.start, target.end).valueOf() : -1;
    const columns: TemplateResult[] = [];
    this._forEachDayInRange(i => {
      const day = startOfDay(i).valueOf();
      const covered = day >= first && day <= last;
      columns.push(
        html`<div
          class="${this._getDayClass(i)}${covered ? ' drop-target' : ''}"
        ></div>`,
      );
    });
    return columns;
  }

  private _renderScale() {
    const locale = this._locale;
    const rows: TemplateResult[] = [];
    for (let i = 0; i < 48; i += 1) {
      const cls = i % 2 ? 'row hour' : 'row';
      const sd = startOfDay(new Date());
      rows.push(html`
        <div class=${cls}>
          ${i % 2 === 0 && i
            ? html`<div class="time">
                ${formatDate(addHours(sd, i / 2), 'hh a', locale)}
              </div>`
            : nothing}
        </div>
      `);
    }
    return html`<div class="background" aria-hidden="true">${rows}</div>`;
  }

  private _renderBackgroundGrid() {
    const rows: TemplateResult[] = [];
    for (let i = 0; i < 48; i += 1) {
      const cls = i % 2 ? 'row hour' : 'row';
      const columns: TemplateResult[] = [];
      this._forEachDayInRange(d => {
        columns.push(html`<div class=${this._getDayClass(d)}></div>`);
      });
      rows.push(html`<div class=${cls}>${columns}</div>`);
    }
    return html`<div class="background" aria-hidden="true">${rows}</div>`;
  }

  /** One event block. `start` and `end` are where it is drawn, which a resize changes. */
  private _renderEvent(
    node: ColumnEvent,
    section: Section,
    position: Record<string, string>,
    range: { start: Date; end: Date },
    handles: ('start' | 'end')[],
  ) {
    const interactive = this._interactive;
    const editable = this._canEdit(node);
    const role = this._dragRole(node, section);
    const resizing =
      role === 'lifted' &&
      section === 'timed' &&
      this._preview?.action !== 'move';
    const declarations = node.color
      ? { ...position, ...this._colorVars(node.color) }
      : position;
    const activate = () => this._emitEventClick(node.data);
    const handle = (edge: 'start' | 'end') =>
      editable && handles.includes(edge)
        ? html`<div
            class="resize-handle ${edge}"
            data-handle=${edge}
            aria-hidden="true"
          ></div>`
        : nothing;
    return html`
      <div
        class=${classMap({
          event: true,
          clickable: interactive,
          editable,
          'drag-source': role === 'source',
          lifted: role === 'lifted',
        })}
        style=${this._styleMap(declarations)}
        role=${interactive ? 'button' : 'note'}
        tabindex=${interactive ? '0' : nothing}
        aria-label=${formatEventLabel(
          node.title,
          node.start,
          node.end,
          this._locale,
          section === 'all-day',
        )}
        @click=${() => {
          if (interactive) activate();
        }}
        @keydown=${interactive ? onActivateKey(activate) : nothing}
        @pointerdown=${editable
          ? (event: PointerEvent) =>
              this._onEventPointerDown(event, node, section)
          : nothing}
      >
        ${handle('start')}
        <div class="event-title" aria-hidden="true">
          ${node.title || this.untitledLabel}
        </div>
        ${resizing
          ? html`<div class="event-time" aria-hidden="true">
              ${formatTimeRange(range.start, range.end, this._locale)}
            </div>`
          : nothing}
        ${handle('end')}
      </div>
    `;
  }

  /** A timed event's block in one day column, at its own times or those of its resize. */
  private _renderTimedEvent(
    node: ColumnEvent,
    dayStart: Date,
    dayEnd: Date,
    columnIndex: number,
    columnCount: number,
  ) {
    const preview = this._preview;
    const resized =
      this._dragRole(node, 'timed') === 'lifted' && preview ? preview : null;
    const start = resized ? resized.start : node.start;
    const end = resized ? resized.end : node.end;
    const top = getTimePercent(start, dayStart);
    const bottom = getTimePercent(end, dayStart);
    // A block shows the handle of an edge only on the day that edge falls on.
    const handles: ('start' | 'end')[] = [];
    if (
      start.valueOf() >= dayStart.valueOf() &&
      end.valueOf() - start.valueOf() >= START_HANDLE_MIN_MS
    ) {
      handles.push('start');
    }
    if (end.valueOf() <= dayEnd.valueOf()) handles.push('end');
    return this._renderEvent(
      node,
      'timed',
      {
        top: `${top}%`,
        height: `${bottom - top}%`,
        'inset-inline-start': `${(columnIndex / columnCount) * 100}%`,
        width: `calc(${(node.width / columnCount) * 100}% - 1px)`,
      },
      { start, end },
      handles,
    );
  }

  /** A new or moved timed event where the drag would put it, or the placeholder. */
  private _renderTimedPreview(dayStart: Date, dayEnd: Date) {
    const preview = this._preview;
    let item: { start: Date; end: Date; title: string; color?: string } | null =
      null;
    let placeholder = false;
    if (preview) {
      if (
        preview.section === 'timed' &&
        (preview.action === 'add' || preview.action === 'move')
      ) {
        item = preview;
      }
    } else if (this.placeholder && !this.placeholder.allDay) {
      item = { ...this.placeholder, title: this.newEventLabel };
      placeholder = true;
    }
    if (!item || !rangesOverlap(item.start, item.end, dayStart, dayEnd)) {
      return nothing;
    }
    const top = getTimePercent(item.start, dayStart);
    const bottom = getTimePercent(item.end, dayStart);
    const position = {
      top: `${top}%`,
      height: `${bottom - top}%`,
      'inset-inline-start': '0',
      width: 'calc(100% - 1px)',
    };
    const time = formatTimeRange(item.start, item.end, this._locale);
    const compact =
      item.end.valueOf() - item.start.valueOf() < COMPACT_PREVIEW_MS;
    return html`
      <div
        class=${classMap({ event: true, preview: true, placeholder })}
        style=${this._styleMap(
          item.color
            ? { ...position, ...this._colorVars(item.color) }
            : position,
        )}
        aria-hidden="true"
      >
        ${compact
          ? html`<div class="event-title">${item.title}, ${time}</div>`
          : html`<div class="event-title">${item.title}</div>
              <div class="event-time">${time}</div>`}
      </div>
    `;
  }

  private _renderEvents() {
    const columns: TemplateResult[] = [];
    this._forEachDayInRange(i => {
      const dayStart = startOfDay(i);
      const dayEnd = addDays(dayStart, 1);
      const eventDay = this.singleDayEvents[this._getDateOnly(i)];
      columns.push(html`
        <div class=${this._getDayClass(i)}>
          <div class="column-content">
            ${eventDay
              ? eventDay.map((nodes, columnIndex) =>
                  nodes.map(node =>
                    this._renderTimedEvent(
                      node,
                      dayStart,
                      dayEnd,
                      columnIndex,
                      eventDay.length,
                    ),
                  ),
                )
              : nothing}
            ${this._renderTimedPreview(dayStart, dayEnd)}
          </div>
        </div>
      `);
    });
    return html`<div class="events-container">${columns}</div>`;
  }

  /** Position of a bar in the all-day row covering the days of `start`–`end`. */
  private _allDayPosition(start: Date, end: Date): Record<string, string> {
    const from = this._getDatePercent(start);
    const to = this._getDatePercent(addDays(lastDayOf(start, end), 1));
    return {
      'inset-inline-start': `${from + LONG_EVENT_PADDING}%`,
      width: `${to - from - 2 * LONG_EVENT_PADDING}%`,
    };
  }

  private _renderAllDayEvent(node: ColumnEvent) {
    const preview = this._preview;
    const dragged =
      this._dragRole(node, 'all-day') === 'lifted' && preview ? preview : null;
    const start = dragged ? dragged.start : node.start;
    const end = dragged ? dragged.end : node.end;
    // Edges outside the days shown cannot be dragged.
    const handles: ('start' | 'end')[] = [];
    if (startOfDay(start).valueOf() >= this.dateRange.startDate.valueOf()) {
      handles.push('start');
    }
    if (
      lastDayOf(start, end).valueOf() <=
      startOfDay(this.dateRange.endDate).valueOf()
    ) {
      handles.push('end');
    }
    return this._renderEvent(
      node,
      'all-day',
      this._allDayPosition(start, end),
      { start, end },
      handles,
    );
  }

  private _renderMultiDayEvents() {
    const preview = this._preview;
    let adding: { start: Date; end: Date; placeholder: boolean } | null = null;
    if (preview) {
      if (preview.section === 'all-day' && preview.action === 'add') {
        adding = { start: preview.start, end: preview.end, placeholder: false };
      }
    } else if (this.placeholder?.allDay) {
      adding = { ...this.placeholder, placeholder: true };
    }
    if (!this.multiDayEvents.length && !adding) return nothing;
    return html`
      <div class="row-content">
        ${this.multiDayEvents.map(
          nodes => html`
            <div class="row">
              ${nodes.map(node => this._renderAllDayEvent(node))}
            </div>
          `,
        )}
        ${adding
          ? html`<div class="row">
              <div
                class=${classMap({
                  event: true,
                  preview: true,
                  placeholder: adding.placeholder,
                })}
                style=${this._styleMap(
                  this._allDayPosition(adding.start, adding.end),
                )}
                aria-hidden="true"
              >
                <div class="event-title">${this.newEventLabel}</div>
              </div>
            </div>`
          : nothing}
        <div class="row-spacer"></div>
      </div>
    `;
  }

  private _renderCurrentTime() {
    if (
      this.currentTime.valueOf() < this.dateRange.startDate.valueOf() - 1 ||
      this.currentTime.valueOf() > this.dateRange.endDate.valueOf() + 1
    ) {
      return nothing;
    }
    return html`
      <div
        class="current-time-line"
        aria-hidden="true"
        style="top: calc(${getTimePercent(this.currentTime)}% - 1px)"
      >
        <div class="time">
          ${formatDate(this.currentTime, 'hh:mm a', this._locale)}
        </div>
        <div
          class="dash-line"
          style="width: ${this._getDatePercent(this.currentTime)}%"
        ></div>
        <div
          class="dot"
          style="left: calc(${this._getDatePercent(
            this.currentTime,
          )}% - 0.25rem)"
        ></div>
        <div
          class="line"
          style="left: ${this._getDatePercent(this.currentTime)}%; width: ${(1 /
            this.dateRange.totalDays) *
          100}%"
        ></div>
      </div>
    `;
  }

  // ── Render

  render() {
    return html`
      <div
        class=${classMap(this._rootClasses())}
        role="region"
        aria-label=${this._rangeLabel()}
      >
        <div class="view-header">
          <div class="scale"></div>
          <div class="columns">${this._renderHeader()}</div>
          <div class="scrollbar-placeholder"></div>
        </div>
        <div class="multi-day-section-wrapper">
          <div class="multi-day-section-scroll">
            <div
              class="multi-day-section"
              @pointerdown=${(event: PointerEvent) =>
                this._onSectionPointerDown(event, 'all-day')}
            >
              <div class="multi-day-background" aria-hidden="true">
                <div class="scale"></div>
                <div class="columns">${this._renderMultiDayBackground()}</div>
              </div>
              <div class="multi-events">${this._renderMultiDayEvents()}</div>
            </div>
          </div>
        </div>
        <div class="view-body">
          <div class="view-body-scroll">
            <div class="scale">${this._renderScale()}</div>
            <div
              class="drawing-area"
              @pointerdown=${(event: PointerEvent) =>
                this._onSectionPointerDown(event, 'timed')}
            >
              ${this._renderBackgroundGrid()} ${this._renderEvents()}
            </div>
            ${this._renderCurrentTime()}
          </div>
        </div>
      </div>
    `;
  }
}
