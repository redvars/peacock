import { i, _ as __decorate, I as IndividualComponent, a as i$1, A, b } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { r } from './state-BCeDVCI9.js';
import { g as getTimePercent, c as calculateDateRange, d as startOfDay, e as endOfDay, h as differenceInDays, a as addDays, f as formatDate, o as onActivateKey, i as addHours, j as formatEventLabel, L as LONG_EVENT_PADDING } from './utils-D92ldd1V.js';
import { B as BaseEvent } from './calendar-event-_OYdAT3c.js';
import { E as EventManager } from './event-manager-CWAWPOUE.js';
import { r as resolveLocale } from './locale-DEsJZCQG.js';

var css_248z = i`@charset "UTF-8";
* {
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
  --calendar-border-color: var(--color-outline-variant);
  --calendar-scale-color: var(--color-outline-variant);
  --scale-size: 4rem;
}

.scale {
  width: var(--scale-size);
  flex-shrink: 0;
}

.calendar-column-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* ── Header ── */
.view-header {
  display: flex;
  background: var(--color-surface-container);
  border-bottom: 1px solid var(--calendar-border-color);
}
.view-header .columns {
  display: flex;
  flex: 1;
}
.view-header .columns .column {
  flex: 1;
  border-inline-start: 1px solid var(--calendar-border-color);
}
.view-header .columns .column:first-child {
  border-inline-start: 0;
}
.view-header .columns .column .column-content {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  gap: 0.5rem;
  border-top: 3px solid transparent;
}
.view-header .columns .column.today .column-content {
  border-top-color: var(--color-primary);
}
.view-header .columns .column.today .column-content .date {
  color: var(--color-on-primary);
  background: var(--color-primary);
}
.view-header .columns .column .date {
  font-size: 1.5rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-on-surface);
  transition: background 200ms ease;
}
.view-header .columns .column .date:hover {
  background: var(--color-primary-90);
}
.view-header .columns .column .date:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
.view-header .columns .column .day {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-on-surface-variant);
}
.view-header .scrollbar-placeholder {
  width: var(--scrollbar-width, 0px);
}

/* ── Multi-day section ── */
.multi-day-section-wrapper {
  background: var(--color-surface-container);
  border-bottom: 1px solid var(--calendar-border-color);
}
.multi-day-section-wrapper .multi-day-section-scroll {
  overflow-y: auto;
  max-height: 6rem;
}
.multi-day-section-wrapper .multi-day-section {
  position: relative;
}
.multi-day-section-wrapper .multi-day-background {
  display: flex;
  height: 100%;
  position: absolute;
  width: 100%;
}
.multi-day-section-wrapper .multi-day-background .columns {
  display: flex;
  flex: 1;
}
.multi-day-section-wrapper .multi-day-background .columns .column {
  flex: 1;
  border-inline-start: 1px solid var(--calendar-border-color);
}
.multi-day-section-wrapper .multi-day-background .columns .column:first-child {
  border-inline-start: 0;
}
.multi-day-section-wrapper .multi-events {
  padding: 0 0 0 var(--scale-size);
}
.multi-day-section-wrapper .multi-events .row {
  height: 1.8rem;
  box-sizing: content-box;
  position: relative;
  padding-bottom: 0.25rem;
}
.multi-day-section-wrapper .multi-events .row:last-child {
  padding-bottom: 0;
}
.multi-day-section-wrapper .multi-events .row-spacer {
  height: 0.75rem;
}
.multi-day-section-wrapper .multi-events .event {
  position: absolute;
  height: 1.8rem;
  text-overflow: ellipsis;
  overflow: hidden;
}

/* ── View body ── */
.view-body {
  height: 100%;
  border-bottom: 1px solid var(--calendar-border-color);
  overflow-y: auto;
}
.view-body .view-body-scroll {
  display: flex;
  position: relative;
}
.view-body .view-body-scroll .scale {
  border-inline-end: 1px solid var(--calendar-scale-color);
}
.view-body .view-body-scroll .scale .background {
  border-inline-start: 1rem;
}
.view-body .view-body-scroll .scale .row {
  width: 0;
  position: relative;
  height: 2rem;
  border-bottom: 1px dashed var(--calendar-scale-color);
}
.view-body .view-body-scroll .scale .row.hour {
  border-bottom: 1px solid var(--calendar-scale-color);
  width: 50%;
  margin-inline-start: 50%;
}
.view-body .view-body-scroll .scale .row:last-child {
  border-bottom: 0;
}
.view-body .view-body-scroll .scale .row .time {
  position: absolute;
  top: -0.5rem;
  font-size: 0.75rem;
  color: var(--color-on-surface-variant);
}
.view-body .view-body-scroll .drawing-area {
  flex: 1;
  position: relative;
}
.view-body .view-body-scroll .drawing-area .background {
  position: relative;
  width: 100%;
  height: 100%;
}
.view-body .view-body-scroll .drawing-area .background .row {
  height: 2rem;
  border-bottom: 1px dashed var(--calendar-scale-color);
  display: flex;
}
.view-body .view-body-scroll .drawing-area .background .row.hour {
  border-bottom: 1px solid var(--calendar-scale-color);
}
.view-body .view-body-scroll .drawing-area .background .row:last-child {
  border-bottom: 0;
}
.view-body .view-body-scroll .drawing-area .background .row .column {
  flex: 1;
  border-inline-start: 1px solid var(--calendar-border-color);
}
.view-body .view-body-scroll .drawing-area .background .row .column:first-child {
  border-inline-start: 0;
}
.view-body .view-body-scroll .drawing-area .background .row .column.today {
  background: color-mix(in srgb, var(--color-primary) 4%, transparent);
}
.view-body .view-body-scroll .drawing-area .events-container {
  position: absolute;
  top: 0;
  inset-inline-start: 0;
  width: 100%;
  height: 100%;
  display: flex;
}
.view-body .view-body-scroll .drawing-area .events-container .column {
  flex: 1;
  padding: 0 0.5rem 0 1px;
}
.view-body .view-body-scroll .drawing-area .events-container .column .column-content {
  position: relative;
  height: 100%;
}
.view-body .view-body-scroll .drawing-area .events-container .column .event {
  position: absolute;
}
.view-body .view-body-scroll {
  /* ── Current time line ── */
}
.view-body .view-body-scroll .current-time-line {
  position: absolute;
  z-index: 100;
  pointer-events: none;
  width: calc(100% - var(--scale-size));
  margin-inline-start: var(--scale-size);
}
.view-body .view-body-scroll .current-time-line .time {
  position: absolute;
  font-family: var(--typography-label-small-font-family) !important;
  font-size: var(--typography-label-small-font-size) !important;
  font-weight: var(--typography-label-small-font-weight) !important;
  line-height: var(--typography-label-small-line-height) !important;
  letter-spacing: var(--typography-label-small-letter-spacing) !important;
  color: var(--color-on-primary-container);
  transform: translate(calc(-100% - 2px), -50%);
  background: var(--color-primary-container);
  padding: 2px 4px;
  border-radius: var(--shape-corner-extra-small);
}
.view-body .view-body-scroll .current-time-line .dash-line {
  position: absolute;
  inset-inline-start: 0;
  border-bottom: 1px dashed var(--color-primary);
}
.view-body .view-body-scroll .current-time-line .dot {
  border-radius: 50%;
  width: 0.5rem;
  height: 0.5rem;
  background: var(--color-primary);
  display: block;
  position: absolute;
  top: -0.25rem;
}
.view-body .view-body-scroll .current-time-line .line {
  border-bottom: 2px solid var(--color-primary);
  position: absolute;
  top: -1px;
}

/* ── Event styles ── */
.event {
  background: var(--calendar-event-bg-color);
  border-inline-start: 0.25rem solid var(--calendar-event-border-color);
  border-radius: var(--shape-corner-extra-small);
  transition: background 150ms ease;
}
.event .event-title {
  padding: 0.25rem 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--calendar-event-text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.event.clickable {
  cursor: pointer;
}
.event.clickable:hover {
  background: var(--calendar-event-bg-color--hover);
}
.event.clickable:hover .event-title {
  color: var(--calendar-event-text-color--hover);
}
.event.clickable:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}`;

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
 *
 * @fires date-click - Internal, does not bubble; a day number was chosen. Detail contains `{ date }`.
 * @fires event-click - Internal, does not bubble; `wc-calendar` re-fires it. Detail contains `{ event }`.
 */
let CalendarColumnView = class CalendarColumnView extends i$1 {
    constructor() {
        // ── Static
        super(...arguments);
        // ── Properties
        /** Events to lay out. */
        this.events = [];
        /** The view's name; `week` aligns the range to the week start. */
        this.view = 'week';
        /** Number of day columns. */
        this.days = 7;
        /** Events are shown but cannot be clicked or focused. */
        this.eventsReadonly = false;
        /** Now, which places the current-time line and marks today. */
        this.currentTime = new Date();
        /** A date in the range to show. */
        this.contextDate = new Date();
        /** First day of the week, 0 (Sunday) to 6, for the `week` view. */
        this.weekStartsOn = 1;
        /** Locale for day names and times. Defaults to the nearest `lang`, then the browser language. */
        this.locale = '';
        // ── State
        /** First and last day shown. */
        this.dateRange = {
            startDate: new Date(),
            endDate: new Date(),
            totalDays: 7,
        };
        /** Timed events per day, keyed by `dd-MM-yyyy`. */
        this.singleDayEvents = {};
        /** Rows of events lasting a day or more. */
        this.multiDayEvents = [];
    }
    // ── Lifecycle
    connectedCallback() {
        super.connectedCallback();
        this._processEvents();
    }
    firstUpdated() {
        const viewBody = this.renderRoot.querySelector('.view-body');
        if (viewBody) {
            const viewBodyHeight = viewBody.scrollHeight;
            viewBody.scrollTo({
                top: (getTimePercent(this.currentTime) / 100) * viewBodyHeight - 150,
            });
        }
    }
    willUpdate(changed) {
        super.willUpdate(changed);
        if (changed.has('events') ||
            changed.has('contextDate') ||
            changed.has('view') ||
            changed.has('days') ||
            changed.has('weekStartsOn')) {
            this._processEvents();
        }
    }
    // ── Private methods
    get _interactive() {
        return !this.eventsReadonly;
    }
    /** The locale dates and times are formatted in. */
    get _locale() {
        return resolveLocale(this.locale, this);
    }
    _processEvents() {
        this.dateRange = calculateDateRange(this.view, this.contextDate, this.days, this.weekStartsOn);
        this.singleDayEvents = {};
        this._forEachDayInRange(i => {
            const manager = new EventManager();
            manager.addEvents(this.events.filter(event => event.isOverlapping(new BaseEvent(startOfDay(i), endOfDay(i))) &&
                event.length() < 86400000));
            manager.process();
            this.singleDayEvents[this._getDateOnly(i)] = manager.columns;
        });
        const multiManager = new EventManager();
        multiManager.addEvents(this.events.filter(event => event.isOverlapping(new BaseEvent(this.dateRange.startDate, this.dateRange.endDate)) && event.length() >= 86400000));
        multiManager.process();
        this.multiDayEvents = multiManager.columns;
    }
    _forEachDayInRange(callback) {
        for (let i = new Date(this.dateRange.startDate); differenceInDays(startOfDay(this.dateRange.endDate), i) >= 0; i = addDays(i, 1)) {
            callback(i);
        }
    }
    _getDateOnly(date) {
        return formatDate(date, 'dd-MM-yyyy');
    }
    _getDatePercent(date) {
        const currentDay = differenceInDays(startOfDay(date), this.dateRange.startDate);
        const percent = (currentDay / this.dateRange.totalDays) * 100;
        if (percent < 0)
            return 0;
        if (percent > 100)
            return 100;
        return percent;
    }
    _getDayClass(date) {
        const diff = differenceInDays(startOfDay(date), startOfDay(this.currentTime));
        if (diff === 0)
            return 'column today';
        if (diff < 0)
            return 'column past';
        return 'column future';
    }
    /** Custom properties that colour an event with a palette `color`. */
    _colorVars(color) {
        return {
            '--calendar-event-bg-color': `var(--color-${color}-container)`,
            '--calendar-event-bg-color--hover': `var(--color-inverse-${color})`,
            '--calendar-event-border-color': `var(--color-${color})`,
            '--calendar-event-text-color': `var(--color-on-${color}-container)`,
            '--calendar-event-text-color--hover': `var(--color-on-${color})`,
        };
    }
    _emitDateClick(date) {
        this.dispatchEvent(new CustomEvent('date-click', { detail: { date } }));
    }
    _emitEventClick(event) {
        this.dispatchEvent(new CustomEvent('event-click', { detail: { event } }));
    }
    /** Accessible name of the view: the dates it shows. */
    _rangeLabel() {
        const { startDate, endDate } = this.dateRange;
        const format = new Intl.DateTimeFormat(this._locale, { dateStyle: 'long' });
        if (differenceInDays(endDate, startDate) <= 0)
            return format.format(startDate);
        try {
            return format.formatRange(startDate, endDate);
        }
        catch {
            return `${format.format(startDate)} – ${format.format(endDate)}`;
        }
    }
    _styleMap(declarations) {
        return Object.entries(declarations)
            .map(([k, v]) => `${k}:${v}`)
            .join(';');
    }
    // ── Render helpers
    _renderHeader() {
        const locale = this._locale;
        const long = new Intl.DateTimeFormat(locale, { dateStyle: 'full' });
        const columns = [];
        this._forEachDayInRange(i => {
            const today = this._getDayClass(i).includes('today');
            const open = () => this._emitDateClick(i);
            columns.push(b `
        <div class=${this._getDayClass(i)}>
          <div class="column-content">
            <div
              class="date"
              role="button"
              tabindex="0"
              aria-label=${long.format(i)}
              aria-current=${today ? 'date' : A}
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
    _renderMultiDayBackground() {
        const columns = [];
        this._forEachDayInRange(i => {
            columns.push(b `<div class=${this._getDayClass(i)}></div>`);
        });
        return columns;
    }
    _renderScale() {
        const locale = this._locale;
        const rows = [];
        for (let i = 0; i < 48; i += 1) {
            const cls = i % 2 ? 'row hour' : 'row';
            const sd = startOfDay(new Date());
            rows.push(b `
        <div class=${cls}>
          ${i % 2 === 0 && i
                ? b `<div class="time">
                ${formatDate(addHours(sd, i / 2), 'hh a', locale)}
              </div>`
                : A}
        </div>
      `);
        }
        return b `<div class="background" aria-hidden="true">${rows}</div>`;
    }
    _renderBackgroundGrid() {
        const rows = [];
        for (let i = 0; i < 48; i += 1) {
            const cls = i % 2 ? 'row hour' : 'row';
            const columns = [];
            this._forEachDayInRange(d => {
                columns.push(b `<div class=${this._getDayClass(d)}></div>`);
            });
            rows.push(b `<div class=${cls}>${columns}</div>`);
        }
        return b `<div class="background" aria-hidden="true">${rows}</div>`;
    }
    /** One event block; `allDay` marks events lasting a day or more. */
    _renderEvent(node, position, allDay) {
        const interactive = this._interactive;
        const declarations = node.color
            ? { ...position, ...this._colorVars(node.color) }
            : position;
        const activate = () => this._emitEventClick(node.data);
        return b `
      <div
        class=${interactive ? 'event clickable' : 'event'}
        style=${this._styleMap(declarations)}
        role=${interactive ? 'button' : 'note'}
        tabindex=${interactive ? '0' : A}
        aria-label=${formatEventLabel(node.title, node.start, node.end, this._locale, allDay)}
        @click=${() => {
            if (interactive)
                activate();
        }}
        @keydown=${interactive ? onActivateKey(activate) : A}
      >
        <div class="event-title" aria-hidden="true">
          ${node.title || '(no title)'}
        </div>
      </div>
    `;
    }
    _renderEvents() {
        const columns = [];
        this._forEachDayInRange(i => {
            const cls = this._getDayClass(i);
            const eventDay = this.singleDayEvents[this._getDateOnly(i)];
            columns.push(b `
        <div class=${cls}>
          <div class="column-content">
            ${eventDay
                ? eventDay.map((nodes, columnIndex) => nodes.map(node => this._renderEvent(node, {
                    top: `${getTimePercent(node.start, startOfDay(i))}%`,
                    height: `${getTimePercent(node.end, startOfDay(i)) - getTimePercent(node.start, startOfDay(i))}%`,
                    left: `${(columnIndex / eventDay.length) * 100}%`,
                    width: `calc(${((1 * node.width) / eventDay.length) * 100}% - 1px)`,
                }, false)))
                : A}
          </div>
        </div>
      `);
        });
        return b `<div class="events-container">${columns}</div>`;
    }
    _renderMultiDayEvents() {
        if (!this.multiDayEvents || !this.multiDayEvents.length)
            return A;
        return b `
      <div class="row-content">
        ${this.multiDayEvents.map(nodes => b `
            <div class="row">
              ${nodes.map(node => this._renderEvent(node, {
            left: `${this._getDatePercent(node.start) + LONG_EVENT_PADDING}%`,
            width: `${this._getDatePercent(addDays(node.end, 1)) - this._getDatePercent(node.start) - 2 * LONG_EVENT_PADDING}%`,
        }, true))}
            </div>
          `)}
        <div class="row-spacer"></div>
      </div>
    `;
    }
    _renderCurrentTime() {
        if (this.currentTime.valueOf() < this.dateRange.startDate.valueOf() - 1 ||
            this.currentTime.valueOf() > this.dateRange.endDate.valueOf() + 1) {
            return A;
        }
        return b `
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
          style="left: calc(${this._getDatePercent(this.currentTime)}% - 0.25rem)"
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
        return b `
      <div
        class="calendar-column-view"
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
            <div class="multi-day-section">
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
            <div class="drawing-area">
              ${this._renderBackgroundGrid()} ${this._renderEvents()}
            </div>
            ${this._renderCurrentTime()}
          </div>
        </div>
      </div>
    `;
    }
};
CalendarColumnView.styles = [css_248z];
__decorate([
    n({ type: Array })
], CalendarColumnView.prototype, "events", void 0);
__decorate([
    n({ type: String })
], CalendarColumnView.prototype, "view", void 0);
__decorate([
    n({ type: Number })
], CalendarColumnView.prototype, "days", void 0);
__decorate([
    n({ type: Boolean, attribute: 'events-readonly' })
], CalendarColumnView.prototype, "eventsReadonly", void 0);
__decorate([
    n({ type: Object, attribute: false })
], CalendarColumnView.prototype, "currentTime", void 0);
__decorate([
    n({ type: Object, attribute: false })
], CalendarColumnView.prototype, "contextDate", void 0);
__decorate([
    n({ type: Number, attribute: false })
], CalendarColumnView.prototype, "weekStartsOn", void 0);
__decorate([
    n({ type: String })
], CalendarColumnView.prototype, "locale", void 0);
__decorate([
    r()
], CalendarColumnView.prototype, "dateRange", void 0);
__decorate([
    r()
], CalendarColumnView.prototype, "singleDayEvents", void 0);
__decorate([
    r()
], CalendarColumnView.prototype, "multiDayEvents", void 0);
CalendarColumnView = __decorate([
    IndividualComponent
], CalendarColumnView);

export { CalendarColumnView };
//# sourceMappingURL=calendar-column-view.js.map
