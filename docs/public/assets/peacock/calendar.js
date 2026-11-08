import { i, _ as __decorate, I as IndividualComponent, a as i$1, b, A } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { r } from './state-BCeDVCI9.js';
import { t as toZonedWallClock, a as addDays, b as addMonths, f as formatDate } from './utils-D92ldd1V.js';
import { C as CalendarEvent } from './calendar-event-_OYdAT3c.js';
import { I as I18nController } from './i18n-controller-Cp43HjJl.js';
import { A as isoToDate, B as dateToIso, w as weekStart } from './date-vFrYT1S9.js';
import './locale-DEsJZCQG.js';
import './strings-BJPuhKJk.js';

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
  color: var(--calendar-on-surface);
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
 * @label Calendar
 * @tag wc-calendar
 * @rawTag calendar
 * @summary A calendar that shows events by day, week or month, with controls to move between periods.
 *
 * @overview
 * <p>Pass events as the <code>events</code> property; each has a <code>start</code>,
 * <code>end</code>, <code>title</code> and optional palette <code>color</code>. The day and week
 * views lay timed events out in a column per day, with events lasting a day or more in a row
 * above; the month view shows six weeks. <code>available-views</code> sets the views offered in
 * the header's segmented buttons, and <code>view</code> the one shown.</p>
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
 *
 * @cssprop --calendar-border-color - Border color used throughout the calendar grid.
 * @cssprop --calendar-event-bg-color - Background color for calendar events.
 * @cssprop --calendar-event-border-color - Left border color for calendar events.
 *
 * @fires {CustomEvent<{event: EventType}>} event-click - An event was clicked, or chosen with Enter or Space. Detail contains `{ event }`. Not fired with `events-readonly`.
 * @fires {CustomEvent<{view: string}>} view-change - The view changed. Detail contains `{ view }`.
 * @fires {CustomEvent<{date: Date, value: string}>} date-change - The context date changed. Detail contains `{ date, value }`: the `Date` and its ISO string.
 *
 * @example
 * ```html
 * <wc-calendar view="week" date="2026-11-06" style="height: 600px"></wc-calendar>
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
        // ── Private fields
        /** Peacock's strings and the resolved locale. */
        this._i18n = new I18nController(this);
    }
    // ── Lifecycle
    connectedCallback() {
        super.connectedCallback();
        this._currentTime = this._now();
        if (!this.contextDate && !isoToDate(this.date)) {
            this.contextDate = this._currentTime;
        }
    }
    willUpdate(changed) {
        super.willUpdate(changed);
        if (changed.has('view') || changed.has('availableViews')) {
            this._currentView = this.availableViews.find(v => v.value === this.view);
        }
        if (changed.has('timezone')) {
            this._currentTime = this._now();
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
        return b `
      <div class="calendar-header-classic">
        <div class="header-left">
          <wc-button
            variant="outlined"
            size="sm"
            class="color-secondary"
            @click=${() => this.today()}
          >
            ${this._i18n.t('today')}
          </wc-button>
          <wc-icon-button
            variant="text"
            size="sm"
            class="color-secondary"
            aria-label=${this._i18n.t('previousPeriod')}
            @click=${() => this.previous()}
          >
            <wc-icon name="chevron_left"></wc-icon>
          </wc-icon-button>
          <wc-icon-button
            variant="text"
            size="sm"
            class="color-secondary"
            aria-label=${this._i18n.t('nextPeriod')}
            @click=${() => this.next()}
          >
            <wc-icon name="chevron_right"></wc-icon>
          </wc-icon-button>
          <div class="title" aria-live="polite">
            ${this.contextDate
            ? formatDate(this.contextDate, 'MMMM d, yyyy', this._i18n.locale)
            : ''}
          </div>
        </div>
        <div class="header-right">
          <wc-segmented-button-group @change=${this._onViewSegmentChange}>
            ${this.availableViews.map(v => b `<wc-segmented-button
                  .value=${v.value}
                  ?selected=${this.view === v.value}
                >
                  ${this._viewLabel(v)}
                </wc-segmented-button>`)}
          </wc-segmented-button-group>
        </div>
      </div>
    `;
    }
    _renderCalendarView() {
        if (!this._currentView) {
            return b `<div>${this._i18n.t('invalidView')}</div>`;
        }
        const { locale } = this._i18n;
        const readonly = !this._eventsInteractive();
        const weekStartsOn = this._weekStart();
        const contextDate = this.contextDate ?? this._currentTime;
        const calEvents = this.events.map(event => new CalendarEvent(event.start, event.end, event.title, event.color, event));
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
          ?events-readonly=${readonly}
          @date-click=${this._onViewDateClick}
          @event-click=${this._onViewEventClick}
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
          ?events-readonly=${readonly}
          @event-click=${this._onViewEventClick}
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
Calendar = __decorate([
    IndividualComponent
], Calendar);

export { Calendar };
//# sourceMappingURL=calendar.js.map
