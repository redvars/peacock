import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { r } from './state-DkTK9EGF.js';
import { g as getTimePercent, i as calculateMonthRange, a as addDays, B as BaseEvent, s as startOfDay, e as endOfDay, d as differenceInDays, f as formatDate, L as LONG_EVENT_PADDING } from './calendar-event-BrQ_SEKD.js';
import { M as MonthEventManager } from './event-manager-DTyX2uYD.js';

var css_248z = i`@charset "UTF-8";
* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.screen-reader-only {
  display: none !important;
}

[hidden] {
  display: none !important;
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

/* ── Today highlighting ── */
.calendar-month-view .view-body .view-body-scroll .drawing-area .multi-day-section .multi-day-background .columns .column.today {
  background: color-mix(in srgb, var(--color-primary) 6%, transparent);
}
.calendar-month-view .view-body .view-body-scroll .drawing-area .multi-day-section .multi-day-background .columns .column.today .column-header {
  border-top-color: var(--color-primary);
}`;

/**
 * @label Calendar Month View
 * @tag wc-calendar-month-view
 * @rawTag calendar-month-view
 * @summary Internal month view component for the calendar.
 */
let CalendarMonthView = class CalendarMonthView extends i$1 {
    constructor() {
        super(...arguments);
        this.events = [];
        this.eventClickable = true;
        this.currentTime = new Date();
        this.contextDate = new Date();
        this.dateRange = {};
        this.weekDayEvents = [];
    }
    connectedCallback() {
        super.connectedCallback();
        this._processEvents();
    }
    willUpdate(changedProperties) {
        if (changedProperties.has('events') ||
            changedProperties.has('contextDate')) {
            this._processEvents();
        }
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
    _processEvents() {
        this.dateRange = calculateMonthRange(this.contextDate, 1);
        this.weekDayEvents = [];
        for (let i = new Date(this.dateRange.startDate), j = 0; j < 6; i = addDays(i, 7), j++) {
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
    _populateColorVars(styles, color) {
        styles['--calendar-event-bg-color'] = `var(--color-${color}-container)`;
        styles['--calendar-event-bg-color--hover'] = `var(--color-inverse-${color})`;
        styles['--calendar-event-border-color'] = `var(--color-${color})`;
        styles['--calendar-event-text-color'] = `var(--color-on-${color}-container)`;
        styles['--calendar-event-text-color--hover'] = `var(--color-on-${color})`;
    }
    _emitEventClick(event) {
        this.dispatchEvent(new CustomEvent('month-view-event-click', {
            detail: { event },
            bubbles: true,
            composed: true,
        }));
    }
    _renderHeader() {
        const columns = [];
        for (let i = new Date(this.dateRange.startDate), j = 0; j < 7; i = addDays(i, 1), j++) {
            columns.push(b `
        <div class="column">
          <div class="column-content">
            <div class="day">${formatDate(i, 'EEEE')}</div>
          </div>
        </div>
      `);
        }
        return columns;
    }
    _renderMultiDayBackground(sd) {
        const columns = [];
        for (let i = new Date(sd), j = 0; j < 7; i = addDays(i, 1), j++) {
            columns.push(b `
        <div class=${this._getDayClass(i)}>
          <div class="column-content">
            <div class="column-header">
              <div class="day">${formatDate(i, 'd')}</div>
            </div>
          </div>
        </div>
      `);
        }
        return columns;
    }
    _renderEvents() {
        return this.weekDayEvents.map((eventDay, index) => {
            const weekStartDate = addDays(this.dateRange.startDate, index * 7);
            return b `
        <div class="multi-day-section">
          <div class="multi-day-body-scroll">
            <div class="multi-day-background">
              <div class="columns">
                ${this._renderMultiDayBackground(weekStartDate)}
              </div>
            </div>
            <div class="multi-events">
              <div class="row-content">
                ${eventDay.map(nodes => b `
                    <div class="row">
                      ${nodes.map(node => {
                const evtCls = this.eventClickable
                    ? 'event clickable'
                    : 'event';
                const evtStyles = {
                    left: `${this._getDatePercent(node.start, weekStartDate) + LONG_EVENT_PADDING}%`,
                    width: `${this._getDatePercent(addDays(node.end, 1), weekStartDate) - this._getDatePercent(node.start, weekStartDate) - 2 * LONG_EVENT_PADDING}%`,
                };
                if (node.color) {
                    this._populateColorVars(evtStyles, node.color);
                }
                return b `
                          <div
                            class=${evtCls}
                            style=${this._styleMap(evtStyles)}
                            @click=${() => {
                    if (this.eventClickable)
                        this._emitEventClick(node.data);
                }}
                          >
                            <div class="event-title">
                              ${node.title || '(no title)'}
                            </div>
                          </div>
                        `;
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
    _styleMap(styles) {
        return Object.entries(styles)
            .map(([k, v]) => `${k}:${v}`)
            .join(';');
    }
    render() {
        return b `
      <div class="calendar-month-view">
        <div class="view-header">
          <div class="columns">${this._renderHeader()}</div>
          <div class="scrollbar-placeholder"></div>
        </div>
        <div class="view-body">
          <div class="view-body-scroll">
            <div class="drawing-area">${this._renderEvents()}</div>
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
    n({ type: Boolean, attribute: 'event-clickable' })
], CalendarMonthView.prototype, "eventClickable", void 0);
__decorate([
    n({ type: Object, attribute: false })
], CalendarMonthView.prototype, "currentTime", void 0);
__decorate([
    n({ type: Object, attribute: false })
], CalendarMonthView.prototype, "contextDate", void 0);
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
