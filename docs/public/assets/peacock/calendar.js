import { i, _ as __decorate, I as IndividualComponent, a as i$1, b, A } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { r } from './state-BCeDVCI9.js';
import { t as toZonedWallClock, a as addDays, c as addMonths, f as formatEventWhen, i as isAllDayRange, g as formatEventLabel, h as formatDate } from './utils-DcvLgexs.js';
import { C as CalendarEvent } from './calendar-event-BQChlMXy.js';
import { r as renderCalendarHeader } from './calendar-header-DVrfThwr.js';
import { I as I18nController } from './i18n-controller-BTeChxE0.js';
import { A as isoToDate, B as dateToIso, w as weekStart } from './date-cfPx3alz.js';
import './locale-DEsJZCQG.js';
import './strings-DeiQWMd9.js';

var css_248z = i`* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.screen-reader-only {
  position: absolute !important;
  inline-size: 1px !important;
  block-size: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip-path: inset(50%) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

[hidden] {
  display: none !important;
}

@media (forced-colors: active) {
  .selected,
  [aria-selected=true],
  [aria-pressed=true],
  [aria-checked=true],
  [aria-current]:not([aria-current=false]) {
    outline: 2px solid Highlight;
    outline-offset: -2px;
  }
  .disabled,
  [aria-disabled=true] {
    color: GrayText;
  }
}
:host {
  display: block;
  height: 100%;
  min-height: 20em;
  --calendar-border-color: var(--color-outline-variant);
  --calendar-scale-color: var(--color-outline-variant);
  --calendar-event-bg-color: var(--color-primary-container);
  --calendar-event-bg-color--hover: var(--color-inverse-primary);
  --calendar-event-border-color: var(--color-primary);
  --calendar-event-text-color: var(--color-on-primary-container);
  --calendar-event-text-color--hover: var(--color-on-primary);
  --calendar-surface: var(--color-surface);
  --calendar-surface-variant: var(--color-surface-variant);
  --calendar-on-surface: var(--color-on-surface);
  --calendar-on-surface-variant: var(--color-on-surface-variant);
}

.calendar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--calendar-surface);
  border-radius: var(--shape-corner-large);
  overflow: hidden;
}

.calendar-header .calendar-header-classic {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  gap: 0.5rem;
}
.calendar-header .calendar-header-classic .header-left {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex: 1;
}
.calendar-header .calendar-header-classic .header-left .title {
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 1rem;
  color: var(--calendar-on-surface, var(--color-on-surface));
  padding-inline-start: 0.5rem;
}
.calendar-header .calendar-header-classic .header-right {
  display: flex;
  align-items: center;
}

.loader {
  display: block;
}

.calendar-body {
  flex: 1;
  overflow: auto;
}
.calendar-body .view-container {
  height: 100%;
}`;

/**
 * Applies an `event-change` to an `events` array the way the calendar does, returning a new array
 * in which the event is replaced by a copy with the new `start` and `end`. The event is found by
 * identity, else by `id`. The copy is made with object spread, so give the calendar plain objects,
 * not class instances. Use it to apply a change you canceled, for example once the server has
 * accepted it.
 */
function applyCalendarChange(events, change) {
    const { id } = change.event;
    let index = events.indexOf(change.event);
    if (index < 0 && id !== undefined && id !== null) {
        index = events.findIndex(event => event.id === id);
    }
    return events.map((event, i) => i === index ? { ...event, start: change.start, end: change.end } : event);
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
 * <code>date-change</code>.</p>
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
let Calendar = class Calendar extends i$1 {
    constructor() {
        // ── Static
        super(...arguments);
        // ── Properties
        /** Calendar events array. */
        this.events = [];
        /**
         * Available views configuration. A view without a `label` shows Peacock's `day`, `week` or
         * `month` string for those values, else its `value`.
         */
        this.availableViews = [
            { value: 'day', type: 'column', days: 1 },
            { value: 'week', type: 'column', days: 7 },
            { value: 'month', type: 'month' },
        ];
        /** Current calendar view. */
        this.view = 'week';
        /**
         * The date the view shows, as an ISO string (`YYYY-MM-DD`). Kept in step with `contextDate`.
         * Defaults to today.
         */
        this.date = '';
        /**
         * The date the view shows, as a `Date`. Kept in step with `date`.
         */
        this.contextDate = null;
        /** Events are shown but cannot be clicked or focused, and `event-click` does not fire. */
        this.eventsReadonly = false;
        /**
         * People can drag events to move them and drag their edges to resize them. Each drop fires the
         * cancelable `event-change`. An event with `editable: false` stays put.
         */
        this.editable = false;
        /**
         * Dragging across empty time, or clicking it, fires `event-add` with the range and marks it as a
         * new event until `events` changes.
         */
        this.addable = false;
        /** Minutes that dragging moves, resizes and draws timed events by. Defaults to 15. */
        this.minuteStep = 15;
        /** Length in minutes of an event added by clicking empty time in the day or week view. Defaults to 60. */
        this.defaultDuration = 60;
        /** Shows a progress bar and marks the calendar busy while events load. */
        this.loading = false;
        /** IANA time zone the current time is shown in, for example `America/New_York`. Defaults to the browser's. */
        this.timezone = '';
        /**
         * Locale for month and day names and times. Defaults to the nearest `lang`, then the browser
         * language.
         */
        this.locale = '';
        // ── State
        /** Now, as wall-clock time in `timezone`. */
        this._currentTime = new Date();
        /** The range of the last `event-add`, marked as a new event until the app adds it. */
        this._placeholder = null;
        // ── Private fields
        /** Peacock's strings and the resolved locale. */
        this._i18n = new I18nController(this);
        this._handlePointerDown = () => {
            if (this._placeholder)
                this._placeholder = null;
        };
        this._handleKeyDown = (event) => {
            if (event.key !== 'Escape' || !this._placeholder)
                return;
            // Keep an enclosing dialog open.
            event.stopPropagation();
            this._placeholder = null;
        };
        this._handleWindowKeyDown = (event) => {
            if (event.key === 'Escape' && this._placeholder)
                this._placeholder = null;
        };
    }
    // ── Lifecycle
    connectedCallback() {
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
    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListener('pointerdown', this._handlePointerDown, true);
        this.removeEventListener('keydown', this._handleKeyDown);
        window.removeEventListener('keydown', this._handleWindowKeyDown);
    }
    willUpdate(changed) {
        super.willUpdate(changed);
        if (changed.has('view') || changed.has('availableViews')) {
            this._currentView = this.availableViews.find(v => v.value === this.view);
        }
        if (changed.has('timezone')) {
            this._currentTime = this._now();
        }
        // The new event has been added, or the person has moved on.
        if (this._placeholder &&
            (changed.has('events') ||
                changed.has('view') ||
                changed.has('date') ||
                changed.has('contextDate') ||
                (changed.has('addable') && !this.addable))) {
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
    _now() {
        return toZonedWallClock(new Date(), this.timezone);
    }
    /** Keeps `date` and `contextDate` in step; `date` wins when both changed. */
    _syncDate(changed) {
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
    _weekStart() {
        const day = this.firstDay;
        if (typeof day === 'number' &&
            Number.isInteger(day) &&
            day >= 0 &&
            day <= 6) {
            return day;
        }
        return weekStart(this._i18n.locale);
    }
    /** Whether events can be clicked: not `events-readonly`. */
    _eventsInteractive() {
        return !this.eventsReadonly;
    }
    /** Whether events can be dragged: `editable` and not `events-readonly`. */
    _eventsEditable() {
        return this.editable && this._eventsInteractive();
    }
    _step(direction) {
        if (!this._currentView || !this.contextDate)
            return;
        if (this._currentView.days) {
            this._setContextDate(addDays(this.contextDate, direction * this._currentView.days));
        }
        else if (this._currentView.type === 'month') {
            this._setContextDate(addMonths(this.contextDate, direction));
        }
    }
    _setContextDate(date) {
        this.contextDate = date;
        this.date = dateToIso(date);
        this.dispatchEvent(new CustomEvent('date-change', {
            detail: { date, value: this.date },
            bubbles: true,
            composed: true,
        }));
    }
    /**
     * Reads `message` in the live region. Its text is set directly, so an announcement does not
     * render the calendar, and its views, again.
     */
    _announce(message) {
        const region = this.renderRoot.querySelector('[role="status"]');
        if (!region)
            return;
        // Clear first, so the same message twice in a row is read again.
        region.textContent = '';
        setTimeout(() => {
            region.textContent = message;
        });
    }
    _onViewDateClick(evt) {
        evt.stopPropagation();
        this.view = 'day';
        this.dispatchEvent(new CustomEvent('view-change', {
            detail: { view: this.view },
            bubbles: true,
            composed: true,
        }));
        this._setContextDate(evt.detail.date);
    }
    _onViewEventClick(evt) {
        evt.stopPropagation();
        if (!this._eventsInteractive())
            return;
        this.dispatchEvent(new CustomEvent('event-click', {
            detail: { event: evt.detail.event },
            bubbles: true,
            composed: true,
        }));
    }
    _onViewEventChange(evt) {
        evt.stopPropagation();
        if (!this._eventsEditable())
            return;
        const detail = { ...evt.detail };
        const change = new CustomEvent('event-change', {
            detail,
            bubbles: true,
            composed: true,
            cancelable: true,
        });
        if (!this.dispatchEvent(change))
            return;
        this.events = applyCalendarChange(this.events, detail);
        const { event, start, end, action } = detail;
        const title = event.title || this._i18n.t('calendarUntitled');
        const when = formatEventWhen(start, end, this._i18n.locale, isAllDayRange(start, end));
        this._announce(this._i18n.t(action === 'move' ? 'calendarEventMoved' : 'calendarEventResized')(title, when));
    }
    _onViewEventAdd(evt) {
        evt.stopPropagation();
        if (!this.addable)
            return;
        const detail = { ...evt.detail };
        this._placeholder = detail;
        this.dispatchEvent(new CustomEvent('event-add', {
            detail,
            bubbles: true,
            composed: true,
        }));
        this._announce(formatEventLabel(this._i18n.t('calendarNewEvent'), detail.start, detail.end, this._i18n.locale, detail.allDay));
    }
    _changeView(value) {
        this.view = value;
        this.dispatchEvent(new CustomEvent('view-change', {
            detail: { view: this.view },
            bubbles: true,
            composed: true,
        }));
    }
    /** The view's own label, else Peacock's string for the built-in views, else its value. */
    _viewLabel(view) {
        if (view.label)
            return view.label;
        if (view.value === 'day' ||
            view.value === 'week' ||
            view.value === 'month') {
            return this._i18n.t(view.value);
        }
        return view.value;
    }
    // ── Render helpers
    _renderHeader() {
        return renderCalendarHeader({
            title: this.contextDate
                ? formatDate(this.contextDate, 'MMMM d, yyyy', this._i18n.locale)
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
    _renderCalendarView() {
        if (!this._currentView) {
            return b `<div>${this._i18n.t('invalidView')}</div>`;
        }
        const { locale } = this._i18n;
        const readonly = !this._eventsInteractive();
        const editable = this._eventsEditable();
        const weekStartsOn = this._weekStart();
        const contextDate = this.contextDate ?? this._currentTime;
        const untitled = this._i18n.t('calendarUntitled');
        // Wrapped on every render, so events changed in place show after `requestUpdate()`.
        const calEvents = (this.events ?? []).map(event => new CalendarEvent(event.start, event.end, event.title, event.color, event));
        if (this._currentView.type === 'column') {
            return b `
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
            return b `
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
          @event-click=${this._onViewEventClick}
          @event-change=${this._onViewEventChange}
          @event-add=${this._onViewEventAdd}
        ></wc-calendar-month-view>
      `;
        }
        return A;
    }
    // ── Render
    render() {
        const busy = this.loading;
        return b `
      <div class="calendar">
        <div class="calendar-header">${this._renderHeader()}</div>
        ${busy
            ? b `<wc-linear-progress
              class="loader"
              indeterminate
              label=${this._i18n.t('loading')}
            ></wc-linear-progress>`
            : A}
        <div class="calendar-body" aria-busy=${busy ? 'true' : 'false'}>
          <div class="view-container">${this._renderCalendarView()}</div>
        </div>
        <div class="screen-reader-only" role="status" aria-live="polite"></div>
      </div>
    `;
    }
};
Calendar.styles = [css_248z];
__decorate([
    n({ type: Array })
], Calendar.prototype, "events", void 0);
__decorate([
    n({ type: Array, attribute: 'available-views' })
], Calendar.prototype, "availableViews", void 0);
__decorate([
    n({ type: String, reflect: true })
], Calendar.prototype, "view", void 0);
__decorate([
    n({ type: String })
], Calendar.prototype, "date", void 0);
__decorate([
    n({ type: Object, attribute: false })
], Calendar.prototype, "contextDate", void 0);
__decorate([
    n({ type: Number, attribute: 'first-day' })
], Calendar.prototype, "firstDay", void 0);
__decorate([
    n({ type: Boolean, attribute: 'events-readonly' })
], Calendar.prototype, "eventsReadonly", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Calendar.prototype, "editable", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Calendar.prototype, "addable", void 0);
__decorate([
    n({ type: Number, attribute: 'minute-step' })
], Calendar.prototype, "minuteStep", void 0);
__decorate([
    n({ type: Number, attribute: 'default-duration' })
], Calendar.prototype, "defaultDuration", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Calendar.prototype, "loading", void 0);
__decorate([
    n({ type: String })
], Calendar.prototype, "timezone", void 0);
__decorate([
    n({ type: String })
], Calendar.prototype, "locale", void 0);
__decorate([
    n({ attribute: false })
], Calendar.prototype, "strings", void 0);
__decorate([
    r()
], Calendar.prototype, "_currentTime", void 0);
__decorate([
    r()
], Calendar.prototype, "_currentView", void 0);
__decorate([
    r()
], Calendar.prototype, "_placeholder", void 0);
Calendar = __decorate([
    IndividualComponent
], Calendar);

export { Calendar, applyCalendarChange };
//# sourceMappingURL=calendar.js.map
