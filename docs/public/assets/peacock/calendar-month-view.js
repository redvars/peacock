import { i, _ as __decorate, I as IndividualComponent, a as i$1, b, A } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { r } from './state-BCeDVCI9.js';
import { g as getTimePercent, k as calculateMonthRange, a as addDays, d as startOfDay, e as endOfDay, h as differenceInDays, f as formatDate, L as LONG_EVENT_PADDING, j as formatEventLabel, o as onActivateKey } from './utils-D92ldd1V.js';
import { B as BaseEvent } from './calendar-event-_OYdAT3c.js';
import { M as MonthEventManager } from './event-manager-CWAWPOUE.js';
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
  --scale-size: 3rem;
}

.scale {
  width: var(--scale-size);
  flex-shrink: 0;
}

.calendar-month-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* ── Header ── */
.view-header {
  background: var(--color-surface-container);
  display: flex;
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
  padding: 0.5rem 0.75rem;
  gap: 0.5rem;
}
.view-header .columns .column .day {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-on-surface-variant);
}
.view-header .scrollbar-placeholder {
  width: var(--scrollbar-width, 0px);
}

/* ── View body ── */
.view-body {
  height: 100%;
  overflow-y: auto;
}
.view-body .view-body-scroll {
  display: flex;
  position: relative;
  min-height: 100%;
}
.view-body .view-body-scroll .drawing-area {
  flex: 1;
}
.view-body .view-body-scroll .drawing-area .multi-day-section {
  border-bottom: 1px solid var(--calendar-scale-color);
  min-height: 8rem;
}
.view-body .view-body-scroll .drawing-area .multi-day-section .multi-day-body-scroll {
  position: relative;
  height: 100%;
}
.view-body .view-body-scroll .drawing-area .multi-day-section .multi-day-background {
  display: flex;
  height: 100%;
  position: absolute;
  width: 100%;
}
.view-body .view-body-scroll .drawing-area .multi-day-section .multi-day-background .columns {
  display: flex;
  flex: 1;
}
.view-body .view-body-scroll .drawing-area .multi-day-section .multi-day-background .columns .column {
  min-height: 8rem;
  flex: 1;
  border-inline-start: 1px solid var(--calendar-scale-color);
}
.view-body .view-body-scroll .drawing-area .multi-day-section .multi-day-background .columns .column:first-child {
  border-inline-start: 0;
}
.view-body .view-body-scroll .drawing-area .multi-day-section .multi-day-background .columns .column .column-header {
  font-size: 0.75rem;
  color: var(--color-on-surface-variant);
  padding-inline-start: 0.5rem;
  padding-top: 0.375rem;
  border-top: 3px solid transparent;
}
.view-body .view-body-scroll .drawing-area .multi-day-section .multi-day-background .columns .column.today {
  background: color-mix(in srgb, var(--color-primary) 6%, transparent);
}
.view-body .view-body-scroll .drawing-area .multi-day-section .multi-day-background .columns .column.today .column-header {
  border-top-color: var(--color-primary);
}
.view-body .view-body-scroll .drawing-area .multi-day-section .multi-events {
  min-height: 4rem;
  padding-top: 2rem;
  height: 100%;
}
.view-body .view-body-scroll .drawing-area .multi-day-section .multi-events .row {
  height: 1.8rem;
  box-sizing: content-box;
  position: relative;
  padding-bottom: 0.25rem;
}
.view-body .view-body-scroll .drawing-area .multi-day-section .multi-events .row:last-child {
  padding-bottom: 0;
}
.view-body .view-body-scroll .drawing-area .multi-day-section .multi-events .row-spacer {
  height: 0.75rem;
}
.view-body .view-body-scroll .drawing-area .multi-day-section .multi-events .event {
  position: absolute;
  height: 1.8rem;
  text-overflow: ellipsis;
  overflow: hidden;
}
.view-body .view-body-scroll .drawing-area .multi-day-section .multi-events .event .event-title {
  padding: 0.25rem 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.view-body .view-body-scroll .drawing-area .multi-day-section .multi-events .event.clickable {
  cursor: pointer;
}

/* ── Event styles ── */
.event {
  background: var(--calendar-event-bg-color);
  border-inline-start: 0.25rem solid var(--calendar-event-border-color);
  border-radius: var(--shape-corner-extra-small);
  color: var(--calendar-event-text-color);
  transition: background 150ms ease;
}
.event.clickable:hover {
  background: var(--calendar-event-bg-color--hover);
  color: var(--calendar-event-text-color--hover);
}
.event.clickable:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}

/* ── Today highlighting ── */
.calendar-month-view .view-body .view-body-scroll .drawing-area .multi-day-section .multi-day-background .columns .column.today {
  background: color-mix(in srgb, var(--color-primary) 6%, transparent);
}
.calendar-month-view .view-body .view-body-scroll .drawing-area .multi-day-section .multi-day-background .columns .column.today .column-header {
  border-top-color: var(--color-primary);
}`;

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
 *
 * @fires event-click - Internal, does not bubble; `wc-calendar` re-fires it. Detail contains `{ event }`.
 */
let CalendarMonthView = class CalendarMonthView extends i$1 {
    constructor() {
        // ── Static
        super(...arguments);
        // ── Properties
        /** Events to lay out. */
        this.events = [];
        /** Events are shown but cannot be clicked or focused. */
        this.eventsReadonly = false;
        /** Now, which marks today. */
        this.currentTime = new Date();
        /** A date in the month to show. */
        this.contextDate = new Date();
        /** First day of the week, 0 (Sunday) to 6. */
        this.weekStartsOn = 1;
        /** Locale for day names and numbers. Defaults to the nearest `lang`, then the browser language. */
        this.locale = '';
        // ── State
        /** First and last day shown (six whole weeks). */
        this.dateRange = {
            startDate: new Date(),
            endDate: new Date(),
            totalDays: 42,
        };
        /** Event rows per week. */
        this.weekDayEvents = [];
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
            changed.has('weekStartsOn')) {
            this._processEvents();
        }
    }
    // ── Private methods
    get _interactive() {
        return !this.eventsReadonly;
    }
    _processEvents() {
        this.dateRange = calculateMonthRange(this.contextDate, this.weekStartsOn);
        this.weekDayEvents = [];
        for (let i = new Date(this.dateRange.startDate), j = 0; j < 6; i = addDays(i, 7), j += 1) {
            const manager = new MonthEventManager();
            manager.addEvents(this.events.filter(event => event.isOverlapping(new BaseEvent(startOfDay(i), endOfDay(addDays(i, 6))))));
            manager.process();
            this.weekDayEvents.push(manager.columns);
        }
    }
    _getDatePercent(date, dateRangeStartDate) {
        const currentDay = differenceInDays(startOfDay(date), dateRangeStartDate);
        const percent = (currentDay / 7) * 100;
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
    _emitEventClick(event) {
        this.dispatchEvent(new CustomEvent('event-click', { detail: { event } }));
    }
    /** The locale day names and numbers are formatted in. */
    get _locale() {
        return resolveLocale(this.locale, this);
    }
    /** The week's events with ids and the day (0–6) each starts on within the week. */
    _placeEvents(weekIndex, weekStartDate) {
        const placed = [];
        this.weekDayEvents[weekIndex]?.forEach((nodes, rowIndex) => nodes.forEach((node, nodeIndex) => {
            const offset = differenceInDays(startOfDay(node.start), weekStartDate);
            placed.push({
                node,
                id: `event-${weekIndex}-${rowIndex}-${nodeIndex}`,
                dayIndex: Math.min(Math.max(offset, 0), 6),
            });
        }));
        return placed;
    }
    _styleMap(declarations) {
        return Object.entries(declarations)
            .map(([k, v]) => `${k}:${v}`)
            .join(';');
    }
    // ── Render helpers
    _renderHeader() {
        const locale = this._locale;
        const columns = [];
        for (let i = new Date(this.dateRange.startDate), j = 0; j < 7; i = addDays(i, 1), j += 1) {
            columns.push(b `
        <div class="column" role="columnheader">
          <div class="column-content">
            <div class="day">${formatDate(i, 'EEEE', locale)}</div>
          </div>
        </div>
      `);
        }
        return columns;
    }
    _renderDayCells(sd, placed) {
        const locale = this._locale;
        const long = new Intl.DateTimeFormat(locale, { dateStyle: 'full' });
        const columns = [];
        for (let i = new Date(sd), j = 0; j < 7; i = addDays(i, 1), j += 1) {
            const owned = placed
                .filter(p => p.dayIndex === j)
                .map(p => p.id)
                .join(' ');
            const today = this._getDayClass(i).includes('today');
            columns.push(b `
        <div
          class=${this._getDayClass(i)}
          role="gridcell"
          aria-label=${long.format(i)}
          aria-current=${today ? 'date' : A}
          aria-owns=${owned || A}
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
    _renderEvent(placed, weekStartDate) {
        const { node, id } = placed;
        const interactive = this._interactive;
        const evtStyles = {
            left: `${this._getDatePercent(node.start, weekStartDate) + LONG_EVENT_PADDING}%`,
            width: `${this._getDatePercent(addDays(node.end, 1), weekStartDate) - this._getDatePercent(node.start, weekStartDate) - 2 * LONG_EVENT_PADDING}%`,
            ...(node.color ? this._colorVars(node.color) : {}),
        };
        const activate = () => this._emitEventClick(node.data);
        return b `
      <div
        id=${id}
        class=${interactive ? 'event clickable' : 'event'}
        style=${this._styleMap(evtStyles)}
        role=${interactive ? 'button' : 'note'}
        tabindex=${interactive ? '0' : A}
        aria-label=${formatEventLabel(node.title, node.start, node.end, this._locale, node.length() >= 86400000)}
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
    _renderWeeks() {
        return this.weekDayEvents.map((eventDay, index) => {
            const weekStartDate = addDays(this.dateRange.startDate, index * 7);
            const placed = this._placeEvents(index, weekStartDate);
            const byNode = new Map(placed.map(p => [p.node, p]));
            return b `
        <div class="multi-day-section" role="row">
          <div class="multi-day-body-scroll">
            <div class="multi-day-background">
              <div class="columns">
                ${this._renderDayCells(weekStartDate, placed)}
              </div>
            </div>
            <div class="multi-events">
              <div class="row-content">
                ${eventDay.map(nodes => b `
                    <div class="row">
                      ${nodes.map(node => {
                const entry = byNode.get(node);
                return entry
                    ? this._renderEvent(entry, weekStartDate)
                    : A;
            })}
                    </div>
                  `)}
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
        return b `
      <div
        class="calendar-month-view"
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
            <div class="drawing-area">${this._renderWeeks()}</div>
          </div>
        </div>
      </div>
    `;
    }
};
CalendarMonthView.styles = [css_248z];
__decorate([
    n({ type: Array })
], CalendarMonthView.prototype, "events", void 0);
__decorate([
    n({ type: Boolean, attribute: 'events-readonly' })
], CalendarMonthView.prototype, "eventsReadonly", void 0);
__decorate([
    n({ type: Object, attribute: false })
], CalendarMonthView.prototype, "currentTime", void 0);
__decorate([
    n({ type: Object, attribute: false })
], CalendarMonthView.prototype, "contextDate", void 0);
__decorate([
    n({ type: Number, attribute: false })
], CalendarMonthView.prototype, "weekStartsOn", void 0);
__decorate([
    n({ type: String })
], CalendarMonthView.prototype, "locale", void 0);
__decorate([
    r()
], CalendarMonthView.prototype, "dateRange", void 0);
__decorate([
    r()
], CalendarMonthView.prototype, "weekDayEvents", void 0);
CalendarMonthView = __decorate([
    IndividualComponent
], CalendarMonthView);

export { CalendarMonthView };
//# sourceMappingURL=calendar-month-view.js.map
