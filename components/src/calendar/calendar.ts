import { LitElement, html, nothing, PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import {
  addDays,
  addMonths,
  formatDate,
  formatEventLabel,
  formatEventWhen,
  isAllDayRange,
  toZonedWallClock,
} from './utils.js';
import { CalendarEvent } from './calendar-event.js';
import { renderCalendarHeader } from './calendar-header.js';
import type {
  CalendarEventAddDetail,
  CalendarEventChangeDetail,
  CalendarViewType,
  EventType,
} from './types.js';
import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import type { PeacockStrings } from '@/__internal/i18n/strings.js';
import {
  dateToIso,
  isoToDate,
  weekStart,
  type WeekDay,
} from '@/__internal/utils/date.js';
import styles from './calendar.scss';

export type {
  CalendarEventAddDetail,
  CalendarEventChangeAction,
  CalendarEventChangeDetail,
} from './types.js';

/** Detail of `date-change`. */
export type CalendarDateChangeDetail = {
  /** The new context date. */
  date: Date;
  /** The same date as an ISO string, `YYYY-MM-DD`. */
  value: string;
};

/**
 * Applies an `event-change` to an `events` array the way the calendar does, returning a new array
 * in which the event is replaced by a copy with the new `start` and `end`. The event is found by
 * identity, else by `id`. The copy is made with object spread, so give the calendar plain objects,
 * not class instances. Use it to apply a change you canceled, for example once the server has
 * accepted it.
 */
export function applyCalendarChange<T extends EventType>(
  events: readonly T[],
  change: Pick<CalendarEventChangeDetail, 'event' | 'start' | 'end'>,
): T[] {
  const { id } = change.event;
  let index = events.indexOf(change.event as T);
  if (index < 0 && id !== undefined && id !== null) {
    index = events.findIndex(event => event.id === id);
  }
  return events.map((event, i) =>
    i === index ? { ...event, start: change.start, end: change.end } : event,
  );
}

/**
 * @label Calendar
 * @tag wc-calendar
 * @rawTag calendar
 * @summary A calendar that shows events by day, week or month, with controls to move between periods.
 *
 * @overview
 * <p>Pass events as the <code>events</code> property; each has a <code>start</code>,
 * <code>end</code>, <code>title</code> and optional palette <code>color</code>. <code>end</code> is
 * exclusive: an all-day event on November 4 runs from midnight on the 4th to midnight on the 5th.
 * The day and week views lay timed events out in a column per day, with events lasting a day or
 * more in a row above; the month view shows six weeks. <code>available-views</code> sets the views
 * offered in the header's segmented buttons, and <code>view</code> the one shown.</p>
 * <p>The header has a Today button, previous and next buttons and the current date, which is a
 * polite live region. <code>previous()</code>, <code>next()</code> and <code>today()</code> do the
 * same from code; each fires <code>date-change</code>. The date shown is <code>date</code> (an ISO
 * string) or <code>contextDate</code> (a <code>Date</code>), kept in step. Choosing a day number
 * in a column view switches to the day view and fires <code>view-change</code> and
 * <code>date-change</code>. In the month view, choosing a day number selects that day (it is
 * highlighted and becomes <code>contextDate</code>) and fires <code>date-change</code>, staying on
 * the month. The header shows the month and year in the month view and the full date otherwise,
 * and wraps onto two lines when the calendar is narrow.</p>
 * <p>Events are buttons, chosen with a click, Enter or Space, which fire <code>event-click</code>.
 * With <code>events-readonly</code> they are shown but cannot be focused or clicked.
 * <code>loading</code> shows a progress bar and marks the calendar busy. <code>first-day</code>
 * sets the week start (else the locale's), <code>timezone</code> the zone the current time is
 * shown in, and <code>locale</code> the language of names and times.</p>
 * <p>With <code>editable</code>, people drag events to move them and drag their edges to change
 * when they start or end: timed events in steps of <code>minute-step</code> minutes, all-day events
 * and every event in the month view by whole days. Each drop fires the cancelable
 * <code>event-change</code>; unless it is canceled, the calendar replaces <code>events</code> with
 * a new array holding a copy of the event with its new times. To confirm a change with a server
 * first, cancel the event and apply it later with <code>applyCalendarChange()</code>. An event with
 * <code>editable: false</code> stays put, and <code>events-readonly</code> turns editing off. On
 * touch screens, hold an event briefly before dragging it. Escape cancels a drag.</p>
 * <p>With <code>addable</code>, dragging across empty time, or clicking it, fires
 * <code>event-add</code> with the range: a click gives <code>default-duration</code> minutes, and
 * the all-day row and the month view give whole days. The calendar does not add the event itself.
 * It marks the range as a new event until <code>events</code> changes, the person presses Escape
 * or starts another drag, or <code>clearPlaceholder()</code> is called, for example when a dialog
 * asking for the event's title is canceled. Each change is announced to screen readers. Dragging
 * needs a pointer, so offer another way to change an event's time too, such as the dialog that
 * <code>event-click</code> opens.</p>
 *
 * @cssprop --calendar-border-color - Border color used throughout the calendar grid.
 * @cssprop --calendar-event-bg-color - Background color for calendar events.
 * @cssprop --calendar-event-border-color - Left border color for calendar events.
 *
 * @fires {CustomEvent<{event: EventType}>} event-click - An event was clicked, or chosen with Enter or Space. Detail contains `{ event }`. Not fired with `events-readonly`.
 * @fires {CustomEvent<{view: string}>} view-change - The view changed. Detail contains `{ view }`.
 * @fires {CustomEvent<{date: Date, value: string}>} date-change - The context date changed. Detail contains `{ date, value }`: the `Date` and its ISO string.
 * @fires {CustomEvent<CalendarEventChangeDetail>} event-change - An event was dragged to a new time (`action: 'move'`) or had its start or end dragged (`action: 'resize'`). Detail contains `{ event, start, end, action }`, where `event` is the object from `events` as it was. Cancelable: cancel it to keep the event where it was. Only with `editable`.
 * @fires {CustomEvent<CalendarEventAddDetail>} event-add - Empty time was dragged across or clicked. Detail contains `{ start, end, allDay }`. Only with `addable`.
 *
 * @example
 * ```html
 * <wc-calendar view="week" date="2026-11-06" style="height: 600px"></wc-calendar>
 * ```
 *
 * @example
 * ```html
 * <wc-calendar id="planner" view="week" editable addable style="height: 600px"></wc-calendar>
 * <script>
 *   const planner = document.getElementById('planner');
 *   planner.events = [
 *     { id: 1, title: 'Standup', start: new Date(2026, 10, 4, 9), end: new Date(2026, 10, 4, 9, 30) },
 *   ];
 *   planner.addEventListener('event-change', event => console.log(event.detail));
 *   planner.addEventListener('event-add', ({ detail }) => {
 *     planner.events = [...planner.events, { id: Date.now(), title: 'New event', ...detail }];
 *   });
 * </script>
 * ```
 */
@IndividualComponent
export class Calendar extends LitElement {
  // ── Static

  static styles = [styles];

  // ── Properties

  /** Calendar events array. */
  @property({ type: Array })
  events: EventType[] = [];

  /**
   * Available views configuration. A view without a `label` shows Peacock's `day`, `week` or
   * `month` string for those values, else its `value`.
   */
  @property({ type: Array, attribute: 'available-views' })
  availableViews: CalendarViewType[] = [
    { value: 'day', type: 'column', days: 1 },
    { value: 'week', type: 'column', days: 7 },
    { value: 'month', type: 'month' },
  ];

  /** Current calendar view. */
  @property({ type: String, reflect: true })
  view: string = 'week';

  /**
   * The date the view shows, as an ISO string (`YYYY-MM-DD`). Kept in step with `contextDate`.
   * Defaults to today.
   */
  @property({ type: String })
  date: string = '';

  /**
   * The date the view shows, as a `Date`. Kept in step with `date`.
   */
  @property({ type: Object, attribute: false })
  contextDate: Date | null = null;

  /**
   * First day of the week, `0` (Sunday) to `6` (Saturday). Defaults to the locale's week start.
   */
  @property({ type: Number, attribute: 'first-day' })
  firstDay?: number;

  /** Events are shown but cannot be clicked or focused, and `event-click` does not fire. */
  @property({ type: Boolean, attribute: 'events-readonly' })
  eventsReadonly: boolean = false;

  /**
   * People can drag events to move them and drag their edges to resize them. Each drop fires the
   * cancelable `event-change`. An event with `editable: false` stays put.
   */
  @property({ type: Boolean, reflect: true })
  editable: boolean = false;

  /**
   * Dragging across empty time, or clicking it, fires `event-add` with the range and marks it as a
   * new event until `events` changes.
   */
  @property({ type: Boolean, reflect: true })
  addable: boolean = false;

  /** Minutes that dragging moves, resizes and draws timed events by. Defaults to 15. */
  @property({ type: Number, attribute: 'minute-step' })
  minuteStep: number = 15;

  /** Length in minutes of an event added by clicking empty time in the day or week view. Defaults to 60. */
  @property({ type: Number, attribute: 'default-duration' })
  defaultDuration: number = 60;

  /** Shows a progress bar and marks the calendar busy while events load. */
  @property({ type: Boolean, reflect: true })
  loading: boolean = false;

  /** IANA time zone the current time is shown in, for example `America/New_York`. Defaults to the browser's. */
  @property({ type: String })
  timezone: string = '';

  /**
   * Locale for month and day names and times. Defaults to the nearest `lang`, then the browser
   * language.
   */
  @property({ type: String })
  locale: string = '';

  /** Overrides Peacock's strings for this instance only. */
  @property({ attribute: false }) strings?: Partial<PeacockStrings>;

  // ── State

  /** Now, as wall-clock time in `timezone`. */
  @state()
  private _currentTime: Date = new Date();

  /** The entry of `availableViews` matching `view`. */
  @state()
  private _currentView: CalendarViewType | undefined;

  /** The range of the last `event-add`, marked as a new event until the app adds it. */
  @state()
  private _placeholder: CalendarEventAddDetail | null = null;

  // ── Private fields

  /** Peacock's strings and the resolved locale. */
  private readonly _i18n = new I18nController(this);

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
    if (changed.has('view') || changed.has('availableViews')) {
      this._currentView = this.availableViews.find(v => v.value === this.view);
    }
    if (changed.has('timezone')) {
      this._currentTime = this._now();
    }
    // The new event has been added, or the person has moved on.
    if (
      this._placeholder &&
      (changed.has('events') ||
        changed.has('view') ||
        changed.has('date') ||
        changed.has('contextDate') ||
        (changed.has('addable') && !this.addable))
    ) {
      this._placeholder = null;
    }
    this._syncDate(changed);
  }

  // ── Public methods

  /** Moves back one period: a day or week in column views, a month in the month view. */
  previous() {
    this._step(-1);
  }

  /** Moves forward one period: a day or week in column views, a month in the month view. */
  next() {
    this._step(1);
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

  /** Whether events can be clicked: not `events-readonly`. */
  private _eventsInteractive(): boolean {
    return !this.eventsReadonly;
  }

  /** Whether events can be dragged: `editable` and not `events-readonly`. */
  private _eventsEditable(): boolean {
    return this.editable && this._eventsInteractive();
  }

  private _step(direction: 1 | -1) {
    if (!this._currentView || !this.contextDate) return;
    if (this._currentView.days) {
      this._setContextDate(
        addDays(this.contextDate, direction * this._currentView.days),
      );
    } else if (this._currentView.type === 'month') {
      this._setContextDate(addMonths(this.contextDate, direction));
    }
  }

  private _setContextDate(date: Date) {
    this.contextDate = date;
    this.date = dateToIso(date);
    this.dispatchEvent(
      new CustomEvent<CalendarDateChangeDetail>('date-change', {
        detail: { date, value: this.date },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /**
   * Reads `message` in the live region. Its text is set directly, so an announcement does not
   * render the calendar, and its views, again.
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

  private _onViewDateClick(evt: CustomEvent<{ date: Date }>) {
    evt.stopPropagation();
    this.view = 'day';
    this.dispatchEvent(
      new CustomEvent('view-change', {
        detail: { view: this.view },
        bubbles: true,
        composed: true,
      }),
    );
    this._setContextDate(evt.detail.date);
  }

  /** A day chosen in the month view becomes the selected day; the view stays on the month. */
  private _onMonthDateClick(evt: CustomEvent<{ date: Date }>) {
    evt.stopPropagation();
    this._setContextDate(evt.detail.date);
  }

  private _onViewEventClick(evt: CustomEvent<{ event: unknown }>) {
    evt.stopPropagation();
    if (!this._eventsInteractive()) return;
    this.dispatchEvent(
      new CustomEvent('event-click', {
        detail: { event: evt.detail.event },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _onViewEventChange(evt: CustomEvent<CalendarEventChangeDetail>) {
    evt.stopPropagation();
    if (!this._eventsEditable()) return;
    const detail = { ...evt.detail };
    const change = new CustomEvent<CalendarEventChangeDetail>('event-change', {
      detail,
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    if (!this.dispatchEvent(change)) return;
    this.events = applyCalendarChange(this.events, detail);
    const { event, start, end, action } = detail;
    const title = event.title || this._i18n.t('calendarUntitled');
    const when = formatEventWhen(
      start,
      end,
      this._i18n.locale,
      isAllDayRange(start, end),
    );
    this._announce(
      this._i18n.t(
        action === 'move' ? 'calendarEventMoved' : 'calendarEventResized',
      )(title, when),
    );
  }

  private _onViewEventAdd(evt: CustomEvent<CalendarEventAddDetail>) {
    evt.stopPropagation();
    if (!this.addable) return;
    const detail = { ...evt.detail };
    this._placeholder = detail;
    this.dispatchEvent(
      new CustomEvent<CalendarEventAddDetail>('event-add', {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
    this._announce(
      formatEventLabel(
        this._i18n.t('calendarNewEvent'),
        detail.start,
        detail.end,
        this._i18n.locale,
        detail.allDay,
      ),
    );
  }

  private _changeView(value: string) {
    this.view = value;
    this.dispatchEvent(
      new CustomEvent('view-change', {
        detail: { view: this.view },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** The view's own label, else Peacock's string for the built-in views, else its value. */
  private _viewLabel(view: CalendarViewType): string {
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

  // ── Render helpers

  private _renderHeader() {
    return renderCalendarHeader({
      // "November 2026" in the month view, the full date in the others.
      title: this.contextDate
        ? formatDate(
            this.contextDate,
            this._currentView?.type === 'month' ? 'MMMM yyyy' : 'MMMM d, yyyy',
            this._i18n.locale,
          )
        : '',
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

  private _renderCalendarView() {
    if (!this._currentView) {
      return html`<div>${this._i18n.t('invalidView')}</div>`;
    }
    const { locale } = this._i18n;
    const readonly = !this._eventsInteractive();
    const editable = this._eventsEditable();
    const weekStartsOn = this._weekStart();
    const contextDate = this.contextDate ?? this._currentTime;
    const untitled = this._i18n.t('calendarUntitled');
    // Wrapped on every render, so events changed in place show after `requestUpdate()`.
    const calEvents = (this.events ?? []).map(
      event =>
        new CalendarEvent(
          event.start,
          event.end,
          event.title,
          event.color,
          event,
        ),
    );

    if (this._currentView.type === 'column') {
      return html`
        <wc-calendar-column-view
          .events=${calEvents}
          .view=${this._currentView.value}
          .days=${this._currentView.days || 7}
          .currentTime=${this._currentTime}
          .contextDate=${contextDate}
          .weekStartsOn=${weekStartsOn}
          .locale=${locale}
          .editable=${editable}
          .addable=${this.addable}
          .minuteStep=${this.minuteStep}
          .defaultDuration=${this.defaultDuration}
          .placeholder=${this._placeholder}
          .untitledLabel=${untitled}
          .newEventLabel=${this._i18n.t('calendarNewEvent')}
          ?events-readonly=${readonly}
          @date-click=${this._onViewDateClick}
          @event-click=${this._onViewEventClick}
          @event-change=${this._onViewEventChange}
          @event-add=${this._onViewEventAdd}
        ></wc-calendar-column-view>
      `;
    }
    if (this._currentView.type === 'month') {
      return html`
        <wc-calendar-month-view
          .events=${calEvents}
          .currentTime=${this._currentTime}
          .contextDate=${contextDate}
          .weekStartsOn=${weekStartsOn}
          .locale=${locale}
          .editable=${editable}
          .addable=${this.addable}
          .placeholder=${this._placeholder}
          .untitledLabel=${untitled}
          ?events-readonly=${readonly}
          @date-click=${this._onMonthDateClick}
          @event-click=${this._onViewEventClick}
          @event-change=${this._onViewEventChange}
          @event-add=${this._onViewEventAdd}
        ></wc-calendar-month-view>
      `;
    }
    return nothing;
  }

  // ── Render

  render() {
    const busy = this.loading;
    return html`
      <div class="calendar">
        <div class="calendar-header">${this._renderHeader()}</div>
        ${busy
          ? html`<wc-linear-progress
              class="loader"
              indeterminate
              label=${this._i18n.t('loading')}
            ></wc-linear-progress>`
          : nothing}
        <div class="calendar-body" aria-busy=${busy ? 'true' : 'false'}>
          <div class="view-container">${this._renderCalendarView()}</div>
        </div>
        <div class="screen-reader-only" role="status" aria-live="polite"></div>
      </div>
    `;
  }
}
