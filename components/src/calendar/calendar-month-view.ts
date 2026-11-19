import { LitElement, html, nothing, PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import {
  addDays,
  differenceInDays,
  startOfDay,
  calculateMonthRange,
  formatDate,
  formatEventLabel,
  lastDayOf,
  nextDay,
  rangesOverlap,
  LONG_EVENT_PADDING,
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
import { MonthEventManager } from './event-manager.js';
import type { ColumnEvent } from './event-manager.js';
import type {
  CalendarEventAddDetail,
  CalendarEventChangeDetail,
  EventType,
} from './types.js';
import IndividualComponent from '@/IndividualComponent.js';
import { resolveLocale } from '@/__internal/i18n/locale.js';
import type { WeekDay } from '@/__internal/utils/date.js';
import styles from './calendar-month-view.scss';

/** An event laid out in one week row, with the id its day cell owns it by. */
type PlacedEvent = { node: ColumnEvent; id: string; dayIndex: number };

/** A press that may become a drag. */
interface MonthPress {
  action: CalendarDragAction;
  /** The event pressed; none when adding. */
  event?: ColumnEvent;
  /** The day under the press. */
  day: Date;
}

/** Where a drag would put an event, or the days it would add. */
interface MonthPreview {
  action: CalendarDragAction;
  /** The dragged event's object from `events`; none when adding. */
  data?: EventType;
  start: Date;
  end: Date;
}

/**
 * @internal
 *
 * @label Calendar Month View
 * @tag wc-calendar-month-view
 * @rawTag calendar-month-view
 * @summary The calendar's month view, six weeks of days with the events on each.
 *
 * @overview
 * <p>Rendered by <code>wc-calendar</code>; not meant to be used on its own.</p>
 * <p>The month is a read-only ARIA grid labelled with the month and year: one row per week, one
 * gridcell per day labelled with its full date. Each event is owned (<code>aria-owns</code>) by the
 * cell of the day it starts on in that week. Events are buttons labelled with their title and
 * time, or notes that cannot be focused when <code>events-readonly</code> is set.</p>
 * <p>With <code>editable</code>, events are dragged to other days and all-day events resized by
 * their edges; with <code>addable</code>, dragging across days or clicking one asks for an
 * all-day event. The days a drag covers are highlighted.</p>
 *
 * @fires event-click - Internal, does not bubble; `wc-calendar` re-fires it. Detail contains `{ event }`.
 * @fires event-change - Internal, does not bubble; an event was dropped on new days. `wc-calendar` re-fires it.
 * @fires event-add - Internal, does not bubble; days were drawn across or a day clicked. `wc-calendar` re-fires it.
 */
@IndividualComponent
export class CalendarMonthView extends LitElement {
  // ── Static

  static styles = [styles];

  // ── Properties

  /** Events to lay out. */
  @property({ type: Array })
  events: CalendarEvent[] = [];

  /** Events are shown but cannot be clicked or focused. */
  @property({ type: Boolean, attribute: 'events-readonly' })
  eventsReadonly: boolean = false;

  /** Events can be moved to other days, and all-day events resized, by dragging. */
  @property({ type: Boolean })
  editable: boolean = false;

  /** Dragging across days, or clicking one, asks for a new all-day event. */
  @property({ type: Boolean })
  addable: boolean = false;

  /** A range waiting for its new event; its days are highlighted. */
  @property({ attribute: false })
  placeholder: CalendarEventAddDetail | null = null;

  /** Title shown for an event without one. */
  @property({ attribute: false })
  untitledLabel: string = '(no title)';

  /** Now, which marks today. */
  @property({ type: Object, attribute: false })
  currentTime: Date = new Date();

  /** A date in the month to show. */
  @property({ type: Object, attribute: false })
  contextDate: Date = new Date();

  /** First day of the week, 0 (Sunday) to 6. */
  @property({ type: Number, attribute: false })
  weekStartsOn: WeekDay = 1;

  /** Locale for day names and numbers. Defaults to the nearest `lang`, then the browser language. */
  @property({ type: String })
  locale: string = '';

  // ── State

  /** First and last day shown (six whole weeks). */
  @state()
  private dateRange: { startDate: Date; endDate: Date; totalDays: number } = {
    startDate: new Date(),
    endDate: new Date(),
    totalDays: 42,
  };

  /** Event rows per week. */
  @state()
  private weekDayEvents: ColumnEvent[][][] = [];

  /** The drag in progress, where it would put its event. */
  @state()
  private _preview: MonthPreview | null = null;

  // ── Private fields

  private readonly _drag = new CalendarDragController<MonthPress>(this, {
    lift: () => this._blurFocused(),
    move: (press, point) => this._follow(press, point),
    drop: (press, point) => this._drop(press, point),
    cancel: () => {
      this._preview = null;
    },
    tap: press => this._tap(press),
    scrollers: () => [this.renderRoot.querySelector<HTMLElement>('.view-body')],
  });

  // ── Lifecycle

  override connectedCallback() {
    super.connectedCallback();
    this._processEvents();
  }

  override willUpdate(changed: PropertyValues<this>) {
    super.willUpdate(changed);
    this._drag.enabled = this.addable || (this.editable && this._interactive);
    if (
      changed.has('events') ||
      changed.has('contextDate') ||
      changed.has('weekStartsOn')
    ) {
      this._processEvents();
    }
    // A drag cannot outlive the month it started in, or editing being turned off.
    if (
      this._drag.pressing &&
      (changed.has('contextDate') ||
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

  /** Whether an event can be dragged: the view is editable and the event did not opt out. */
  private _canEdit(node: CalendarEvent): boolean {
    const data = node.data as EventType | undefined;
    return this.editable && this._interactive && data?.editable !== false;
  }

  private _processEvents() {
    this.dateRange = calculateMonthRange(this.contextDate, this.weekStartsOn);
    this.weekDayEvents = [];

    for (
      let i = new Date(this.dateRange.startDate), j = 0;
      j < 6;
      i = addDays(i, 7), j += 1
    ) {
      const weekStart = startOfDay(i);
      const manager = new MonthEventManager();
      manager.addEvents(
        this.events.filter(event =>
          rangesOverlap(
            event.start,
            event.end,
            weekStart,
            startOfDay(addDays(weekStart, 7)),
          ),
        ),
      );
      manager.process();
      this.weekDayEvents.push(manager.columns);
    }
  }

  private _getDatePercent(date: Date, dateRangeStartDate: Date): number {
    const currentDay = differenceInDays(startOfDay(date), dateRangeStartDate);
    const percent = (currentDay / 7) * 100;
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

  /** The locale day names and numbers are formatted in. */
  private get _locale(): string {
    return resolveLocale(this.locale, this);
  }

  /** The week's events with ids and the day (0–6) each starts on within the week. */
  private _placeEvents(weekIndex: number, weekStartDate: Date): PlacedEvent[] {
    const placed: PlacedEvent[] = [];
    this.weekDayEvents[weekIndex]?.forEach((nodes, rowIndex) =>
      nodes.forEach((node, nodeIndex) => {
        const offset = differenceInDays(startOfDay(node.start), weekStartDate);
        placed.push({
          node,
          id: `event-${weekIndex}-${rowIndex}-${nodeIndex}`,
          dayIndex: Math.min(Math.max(offset, 0), 6),
        });
      }),
    );
    return placed;
  }

  private _styleMap(declarations: Record<string, string>): string {
    return Object.entries(declarations)
      .map(([k, v]) => `${k}:${v}`)
      .join(';');
  }

  // ── Drag and drop

  /** The day of the cell under, or nearest, a point. */
  private _dayAt(x: number, y: number): Date | null {
    const cells = [
      ...this.renderRoot.querySelectorAll<HTMLElement>('[role="gridcell"]'),
    ];
    const index = nearestIndex(cells, x, y);
    return index < 0
      ? null
      : startOfDay(addDays(this.dateRange.startDate, index));
  }

  private _onEventPointerDown(event: PointerEvent, node: ColumnEvent) {
    if (!this._canEdit(node)) return;
    const handle =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>('[data-handle]')?.dataset.handle
        : undefined;
    let action: CalendarDragAction = 'move';
    if (handle === 'start') action = 'resize-start';
    else if (handle === 'end') action = 'resize-end';
    const day =
      this._dayAt(event.clientX, event.clientY) ?? startOfDay(node.start);
    this._drag.start(event, { action, event: node, day });
  }

  private _onAreaPointerDown(event: PointerEvent) {
    if (!this.addable || this._drag.pressing) return;
    // Presses on events are theirs, even on events that cannot be dragged.
    const onEvent = event
      .composedPath()
      .some(
        target =>
          target instanceof HTMLElement && target.classList.contains('event'),
      );
    if (onEvent) return;
    const day = this._dayAt(event.clientX, event.clientY);
    if (!day) return;
    this._drag.start(event, { action: 'add', day });
  }

  private _previewFor(
    press: MonthPress,
    point: DragPoint,
  ): MonthPreview | null {
    const day = this._dayAt(point.x, point.y) ?? press.day;
    const range = dragByDays(press.action, press.day, day, press.event);
    if (!range) return null;
    return {
      action: press.action,
      data: press.event?.data as EventType | undefined,
      ...range,
    };
  }

  private _follow(press: MonthPress, point: DragPoint) {
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

  private _drop(press: MonthPress, point: DragPoint) {
    const preview = this._previewFor(press, point) ?? this._preview;
    this._preview = null;
    if (!preview) return;
    const { start, end } = preview;
    if (press.action === 'add') {
      this._emitAdd({ start, end, allDay: true });
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

  /** A click on a day adds an all-day event on it. */
  private _tap(press: MonthPress) {
    if (press.action !== 'add') return;
    this._emitAdd({
      start: press.day,
      end: nextDay(press.day),
      allDay: true,
    });
  }

  /**
   * Blurs the focused event when a drag starts. The drop redraws the events, and the element that
   * held focus could then show another event, which Enter would open.
   */
  private _blurFocused() {
    const active = (this.renderRoot as ShadowRoot).activeElement;
    if (active instanceof HTMLElement) active.blur();
  }

  /** The days the drag in progress, or the placeholder, covers. */
  private _target(): { start: Date; end: Date } | null {
    return this._preview ?? this.placeholder;
  }

  /** Classes of the view while a drag is in progress, which set the cursor. */
  private _rootClasses() {
    const action = this._preview?.action;
    return {
      'calendar-month-view': true,
      addable: this.addable,
      dragging: !!action,
      'drag-move': action === 'move',
      'drag-resize-x': action === 'resize-start' || action === 'resize-end',
    };
  }

  // ── Render helpers

  private _renderHeader() {
    const locale = this._locale;
    const columns = [];
    for (
      let i = new Date(this.dateRange.startDate), j = 0;
      j < 7;
      i = addDays(i, 1), j += 1
    ) {
      columns.push(html`
        <div class="column" role="columnheader">
          <div class="column-content">
            <div class="day">${formatDate(i, 'EEEE', locale)}</div>
          </div>
        </div>
      `);
    }
    return columns;
  }

  private _renderDayCells(sd: Date, placed: PlacedEvent[]) {
    const locale = this._locale;
    const long = new Intl.DateTimeFormat(locale, { dateStyle: 'full' });
    const target = this._target();
    const first = target ? startOfDay(target.start).valueOf() : 0;
    const last = target ? lastDayOf(target.start, target.end).valueOf() : -1;
    const columns = [];
    for (let i = new Date(sd), j = 0; j < 7; i = addDays(i, 1), j += 1) {
      const owned = placed
        .filter(p => p.dayIndex === j)
        .map(p => p.id)
        .join(' ');
      const today = this._getDayClass(i).includes('today');
      const day = startOfDay(i).valueOf();
      const covered = day >= first && day <= last;
      columns.push(html`
        <div
          class="${this._getDayClass(i)}${covered ? ' drop-target' : ''}"
          role="gridcell"
          aria-label=${long.format(i)}
          aria-current=${today ? 'date' : nothing}
          aria-owns=${owned || nothing}
        >
          <div class="column-content">
            <div class="column-header" aria-hidden="true">
              <div class="day">${formatDate(i, 'd', locale)}</div>
            </div>
          </div>
        </div>
      `);
    }
    return columns;
  }

  private _renderEvent(placed: PlacedEvent, weekStartDate: Date) {
    const { node, id } = placed;
    const interactive = this._interactive;
    const editable = this._canEdit(node);
    const allDay = node.isAllDay();
    const lastDay = node.lastDay();
    const dragged = !!this._preview?.data && this._preview.data === node.data;
    const evtStyles: Record<string, string> = {
      'inset-inline-start': `${this._getDatePercent(node.start, weekStartDate) + LONG_EVENT_PADDING}%`,
      width: `${this._getDatePercent(nextDay(lastDay), weekStartDate) - this._getDatePercent(node.start, weekStartDate) - 2 * LONG_EVENT_PADDING}%`,
      ...(node.color ? this._colorVars(node.color) : {}),
    };
    const activate = () => this._emitEventClick(node.data);
    // All-day events resize by whichever of their edges falls in this week.
    const weekEnd = startOfDay(addDays(weekStartDate, 6)).valueOf();
    const handle = (edge: 'start' | 'end') => {
      if (!editable || !allDay) return nothing;
      const shown =
        edge === 'start'
          ? startOfDay(node.start).valueOf() >=
            startOfDay(weekStartDate).valueOf()
          : lastDay.valueOf() <= weekEnd;
      return shown
        ? html`<div
            class="resize-handle ${edge}"
            data-handle=${edge}
            aria-hidden="true"
          ></div>`
        : nothing;
    };
    return html`
      <div
        id=${id}
        class=${classMap({
          event: true,
          clickable: interactive,
          editable,
          'drag-source': dragged,
        })}
        style=${this._styleMap(evtStyles)}
        role=${interactive ? 'button' : 'note'}
        tabindex=${interactive ? '0' : nothing}
        aria-label=${formatEventLabel(
          node.title,
          node.start,
          node.end,
          this._locale,
          allDay,
        )}
        @click=${() => {
          if (interactive) activate();
        }}
        @keydown=${interactive ? onActivateKey(activate) : nothing}
        @pointerdown=${editable
          ? (event: PointerEvent) => this._onEventPointerDown(event, node)
          : nothing}
      >
        ${handle('start')}
        <div class="event-title" aria-hidden="true">
          ${node.title || this.untitledLabel}
        </div>
        ${handle('end')}
      </div>
    `;
  }

  private _renderWeeks() {
    return this.weekDayEvents.map((eventDay, index) => {
      const weekStartDate = addDays(this.dateRange.startDate, index * 7);
      const placed = this._placeEvents(index, weekStartDate);
      const byNode = new Map(placed.map(p => [p.node, p]));
      return html`
        <div class="multi-day-section" role="row">
          <div class="multi-day-body-scroll">
            <div class="multi-day-background">
              <div class="columns">
                ${this._renderDayCells(weekStartDate, placed)}
              </div>
            </div>
            <div class="multi-events">
              <div class="row-content">
                ${eventDay.map(
                  nodes => html`
                    <div class="row">
                      ${nodes.map(node => {
                        const entry = byNode.get(node);
                        return entry
                          ? this._renderEvent(entry, weekStartDate)
                          : nothing;
                      })}
                    </div>
                  `,
                )}
                <div class="row-spacer"></div>
              </div>
            </div>
          </div>
        </div>
      `;
    });
  }

  // ── Render

  render() {
    const context = this.contextDate;
    const label = new Intl.DateTimeFormat(this._locale, {
      month: 'long',
      year: 'numeric',
    }).format(context);
    return html`
      <div
        class=${classMap(this._rootClasses())}
        role="grid"
        aria-label=${label}
        aria-readonly="true"
      >
        <div class="view-header">
          <div class="columns" role="row">${this._renderHeader()}</div>
          <div class="scrollbar-placeholder"></div>
        </div>
        <div class="view-body">
          <div class="view-body-scroll">
            <div
              class="drawing-area"
              @pointerdown=${(event: PointerEvent) =>
                this._onAreaPointerDown(event)}
            >
              ${this._renderWeeks()}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
