import { i, _ as __decorate, I as IndividualComponent, a as i$1, b, A } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { r } from './state-DkTK9EGF.js';
import { a as addDays, b as addMonths, f as formatDate, C as CalendarEvent } from './calendar-event-BrQ_SEKD.js';

var css_248z = i`* {
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
  color: var(--calendar-on-surface);
  padding-inline-start: 0.5rem;
}
.calendar-header .calendar-header-classic .header-right {
  display: flex;
  align-items: center;
}

.calendar-body {
  flex: 1;
  overflow: auto;
}
.calendar-body .view-container {
  height: 100%;
}`;

/**
 * @label Calendar
 * @tag wc-calendar
 * @rawTag calendar
 * @summary A full calendar component for displaying events in day, week, or month views.
 *
 * @cssprop --calendar-border-color - Border color used throughout the calendar grid.
 * @cssprop --calendar-event-bg-color - Background color for calendar events.
 * @cssprop --calendar-event-border-color - Left border color for calendar events.
 *
 * @fires {CustomEvent} event-click - Dispatched when a calendar event is clicked. Detail contains `{ event }`.
 * @fires {CustomEvent} view-change - Dispatched when the calendar view changes. Detail contains `{ view }`.
 * @fires {CustomEvent} date-change - Dispatched when the context date changes. Detail contains `{ date }`.
 *
 * @example
 * ```html
 * <wc-calendar view="week" style="height: 600px"></wc-calendar>
 * ```
 */
let Calendar = class Calendar extends i$1 {
    constructor() {
        super(...arguments);
        /**
         * Calendar events array.
         */
        this.events = [];
        /**
         * Available views configuration.
         */
        this.availableViews = [
            { label: 'Day', value: 'day', type: 'column', days: 1 },
            { label: 'Week', value: 'week', type: 'column', days: 7 },
            { label: 'Month', value: 'month', type: 'month' },
        ];
        /**
         * Current calendar view.
         */
        this.view = 'week';
        /**
         * Whether events are clickable.
         */
        this.eventClickable = true;
        /**
         * Show loading state.
         */
        this.showLoader = false;
        /**
         * Timezone string (e.g. 'America/New_York').
         */
        this.timezone = '';
        /**
         * The context date for the calendar view.
         */
        this.contextDate = null;
        this._currentTime = new Date();
    }
    connectedCallback() {
        super.connectedCallback();
        if (this.timezone) {
            this._currentTime = new Date(new Date().toLocaleString('en', { timeZone: this.timezone }));
        }
        else {
            this._currentTime = new Date();
        }
        if (!this.contextDate) {
            this.contextDate = this._currentTime;
        }
    }
    willUpdate(changedProperties) {
        if (changedProperties.has('view') || changedProperties.has('availableViews')) {
            this._currentView = this.availableViews.find(v => v.value === this.view);
        }
    }
    _onColumnViewDateClick(evt) {
        evt.stopPropagation();
        this.view = 'day';
        this.contextDate = evt.detail.date;
        this.dispatchEvent(new CustomEvent('view-change', {
            detail: { view: this.view },
            bubbles: true,
            composed: true,
        }));
        this.dispatchEvent(new CustomEvent('date-change', {
            detail: { date: this.contextDate },
            bubbles: true,
            composed: true,
        }));
    }
    _onEventClick(evt) {
        evt.stopPropagation();
        this.dispatchEvent(new CustomEvent('event-click', {
            detail: { event: evt.detail.event },
            bubbles: true,
            composed: true,
        }));
    }
    previous() {
        if (!this._currentView)
            return;
        if (this._currentView.days) {
            this.contextDate = addDays(this.contextDate, -1 * this._currentView.days);
        }
        else if (this._currentView.type === 'month') {
            this.contextDate = addMonths(this.contextDate, -1);
        }
        this.dispatchEvent(new CustomEvent('date-change', {
            detail: { date: this.contextDate },
            bubbles: true,
            composed: true,
        }));
    }
    next() {
        if (!this._currentView)
            return;
        if (this._currentView.days) {
            this.contextDate = addDays(this.contextDate, this._currentView.days);
        }
        else if (this._currentView.type === 'month') {
            this.contextDate = addMonths(this.contextDate, 1);
        }
        this.dispatchEvent(new CustomEvent('date-change', {
            detail: { date: this.contextDate },
            bubbles: true,
            composed: true,
        }));
    }
    _goToToday() {
        this.contextDate = this._currentTime;
        this.dispatchEvent(new CustomEvent('date-change', {
            detail: { date: this.contextDate },
            bubbles: true,
            composed: true,
        }));
    }
    _onViewSegmentChange(evt) {
        if (!evt.detail.value)
            return;
        this.view = evt.detail.value;
        this.dispatchEvent(new CustomEvent('view-change', {
            detail: { view: this.view },
            bubbles: true,
            composed: true,
        }));
    }
    _renderHeader() {
        return b `
      <div class="calendar-header-classic">
        <div class="header-left">
          <wc-button
            variant="outlined"
            size="sm"
            class="color-secondary"
            @click=${() => this._goToToday()}
          >
            Today
          </wc-button>
          <wc-icon-button
            variant="text"
            size="sm"
            class="color-secondary"
            @click=${() => this.previous()}
          >
            <wc-icon name="chevron_left"></wc-icon>
          </wc-icon-button>
          <wc-icon-button
            variant="text"
            size="sm"
            class="color-secondary"
            @click=${() => this.next()}
          >
            <wc-icon name="chevron_right"></wc-icon>
          </wc-icon-button>
          <div class="title">
            ${this.contextDate
            ? formatDate(this.contextDate, 'MMMM d, yyyy')
            : ''}
          </div>
        </div>
        <div class="header-right">
          <wc-segmented-button-group @change=${this._onViewSegmentChange}>
            ${this.availableViews.map(v => b `<wc-segmented-button
                  .value=${v.value}
                  ?selected=${this.view === v.value}
                >
                  ${v.label}
                </wc-segmented-button>`)}
          </wc-segmented-button-group>
        </div>
      </div>
    `;
    }
    _renderCalendarView() {
        if (!this._currentView)
            return b `<div>Invalid view</div>`;
        const calEvents = this.events.map(event => new CalendarEvent(event.start, event.end, event.title, event.color, event));
        if (this._currentView.type === 'column') {
            return b `
        <wc-calendar-column-view
          .events=${calEvents}
          .view=${this._currentView.value}
          .days=${this._currentView.days || 7}
          .currentTime=${this._currentTime}
          .contextDate=${this.contextDate}
          ?event-clickable=${this.eventClickable}
          @column-view-date-click=${this._onColumnViewDateClick}
          @column-view-event-click=${this._onEventClick}
        ></wc-calendar-column-view>
      `;
        }
        else if (this._currentView.type === 'month') {
            return b `
        <wc-calendar-month-view
          .events=${calEvents}
          .currentTime=${this._currentTime}
          .contextDate=${this.contextDate}
          ?event-clickable=${this.eventClickable}
          @month-view-event-click=${this._onEventClick}
        ></wc-calendar-month-view>
      `;
        }
        return A;
    }
    render() {
        return b `
      <div class="calendar">
        <div class="calendar-header">${this._renderHeader()}</div>
        <div class="calendar-body">
          <div class="view-container">${this._renderCalendarView()}</div>
        </div>
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
    n({ type: Boolean, attribute: 'event-clickable' })
], Calendar.prototype, "eventClickable", void 0);
__decorate([
    n({ type: Boolean, attribute: 'show-loader' })
], Calendar.prototype, "showLoader", void 0);
__decorate([
    n({ type: String })
], Calendar.prototype, "timezone", void 0);
__decorate([
    n({ type: Object, attribute: false })
], Calendar.prototype, "contextDate", void 0);
__decorate([
    r()
], Calendar.prototype, "_currentTime", void 0);
__decorate([
    r()
], Calendar.prototype, "_currentView", void 0);
Calendar = __decorate([
    IndividualComponent
], Calendar);

export { Calendar };
//# sourceMappingURL=calendar.js.map
