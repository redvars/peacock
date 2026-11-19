import { i, _ as __decorate, I as IndividualComponent, a as i$1, A, b } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { r } from './state-BCeDVCI9.js';
import { e } from './class-map-NDIkZErE.js';
import { j as getTimePercent, k as calculateDateRange, b as startOfDay, n as nextDay, r as rangesOverlap, d as differenceInDays, a as addDays, h as formatDate, m as timeAtFraction, o as snapTime, p as clamp, M as MINUTE_MS, q as onActivateKey, l as lastDayOf, u as addHours, g as formatEventLabel, v as formatTimeRange, L as LONG_EVENT_PADDING } from './utils-DcvLgexs.js';
import { C as CalendarDragController, n as nearestIndex, d as dragByDays } from './calendar-drag-IXMPZrTN.js';
import { E as EventManager } from './event-manager-KGMT2x2Q.js';
import { r as resolveLocale } from './locale-DEsJZCQG.js';
import './directive-ZPhl09Yt.js';
import './calendar-event-BQChlMXy.js';

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
.multi-day-section-wrapper .multi-day-background .columns .column.drop-target {
  background: color-mix(in srgb, var(--color-primary) 12%, transparent);
}
.multi-day-section-wrapper .multi-events {
  padding-inline-start: var(--scale-size);
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
.event.clickable:hover .event-title,
.event.clickable:hover .resize-handle {
  color: var(--calendar-event-text-color--hover);
}
.event.clickable:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}

/* ── Editing ── */
.calendar-column-view.addable .drawing-area,
.calendar-column-view.addable .multi-day-section {
  user-select: none;
  -webkit-touch-callout: none;
}
.calendar-column-view.addable .multi-events {
  min-height: 2rem;
}

.calendar-column-view.dragging {
  user-select: none;
}
.calendar-column-view.dragging .event {
  pointer-events: none;
}

.calendar-column-view.drag-move {
  cursor: grabbing;
}

.calendar-column-view.drag-resize-y {
  cursor: ns-resize;
}

.calendar-column-view.drag-resize-x {
  cursor: ew-resize;
}

.event.editable {
  cursor: grab;
  user-select: none;
  -webkit-touch-callout: none;
}
.event.drag-source {
  opacity: 0.4;
}
.event.lifted {
  z-index: 2;
  overflow: hidden;
  box-shadow: var(--elevation-level2);
}
.event.lifted .event-time {
  white-space: normal;
}
.event.preview {
  z-index: 2;
  overflow: hidden;
  pointer-events: none;
  box-shadow: var(--elevation-level2);
}
.event.placeholder {
  box-shadow: var(--elevation-level3);
}
.event .event-time {
  padding: 0 0.375rem 0.25rem;
  font-size: 0.75rem;
  color: var(--calendar-event-text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  unicode-bidi: plaintext;
}

.resize-handle {
  position: absolute;
  z-index: 1;
  color: var(--calendar-event-text-color);
}
.resize-handle::after {
  content: "";
  position: absolute;
  margin: auto;
  border-radius: var(--shape-corner-full);
  background: currentColor;
  opacity: 0;
  transition: opacity 150ms ease;
}

.event.editable:hover .resize-handle::after,
.event.editable:focus-visible .resize-handle::after,
.event.lifted .resize-handle::after {
  opacity: 0.6;
}

.events-container .resize-handle {
  inset-inline: 0;
  block-size: 0.375rem;
  cursor: ns-resize;
}
.events-container .resize-handle.start {
  inset-block-start: 0;
}
.events-container .resize-handle.end {
  inset-block-end: 0;
}
.events-container .resize-handle::after {
  inset: 0;
  inline-size: 1rem;
  block-size: 0.125rem;
}

.multi-events .resize-handle {
  inset-block: 0;
  inline-size: 0.375rem;
  cursor: ew-resize;
}
.multi-events .resize-handle.start {
  inset-inline-start: 0;
}
.multi-events .resize-handle.end {
  inset-inline-end: 0;
}
.multi-events .resize-handle::after {
  inset: 0;
  inline-size: 0.125rem;
  block-size: 0.875rem;
}

@media (forced-colors: active) {
  .event.preview,
  .event.lifted {
    outline: 2px solid Highlight;
  }
  .multi-day-background .column.drop-target {
    outline: 2px solid Highlight;
    outline-offset: -2px;
  }
}`;

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
        /** Events can be moved and resized by dragging. */
        this.editable = false;
        /** Dragging across empty time, or clicking it, asks for a new event. */
        this.addable = false;
        /** Minutes that drags move timed events and their edges by. */
        this.minuteStep = 15;
        /** Minutes an event added by a click lasts. */
        this.defaultDuration = 60;
        /** A range waiting for its new event, drawn as one. */
        this.placeholder = null;
        /** Title shown for an event without one. */
        this.untitledLabel = '(no title)';
        /** Title of the block that marks a new event. */
        this.newEventLabel = 'New event';
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
        /** The drag in progress, where it would put its event. */
        this._preview = null;
        // ── Private fields
        this._drag = new CalendarDragController(this, {
            lift: () => this._blurFocused(),
            move: (press, point) => this._follow(press, point),
            drop: (press, point) => this._drop(press, point),
            cancel: () => {
                this._preview = null;
            },
            tap: press => this._tap(press),
            scrollers: press => [
                this.renderRoot.querySelector(press.section === 'timed' ? '.view-body' : '.multi-day-section-scroll'),
            ],
        });
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
        this._drag.enabled = this.addable || (this.editable && this._interactive);
        if (changed.has('events') ||
            changed.has('contextDate') ||
            changed.has('view') ||
            changed.has('days') ||
            changed.has('weekStartsOn')) {
            this._processEvents();
        }
        // A drag cannot outlive the days it started on, or editing being turned off.
        if (this._drag.pressing &&
            (changed.has('contextDate') ||
                changed.has('view') ||
                changed.has('days') ||
                changed.has('weekStartsOn') ||
                changed.has('editable') ||
                changed.has('addable') ||
                changed.has('eventsReadonly'))) {
            this._drag.abort();
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
    /** `minuteStep` when it is a whole number of minutes in a day, else 15. */
    get _step() {
        const step = Math.round(this.minuteStep);
        return Number.isFinite(step) && step >= 1 ? Math.min(step, 1440) : 15;
    }
    /** `defaultDuration` when it is a positive number of minutes, else 60. */
    get _duration() {
        const minutes = Math.round(this.defaultDuration);
        return Number.isFinite(minutes) && minutes >= 1 ? minutes : 60;
    }
    /** Whether an event can be dragged: the view is editable and the event did not opt out. */
    _canEdit(node) {
        const data = node.data;
        return this.editable && this._interactive && data?.editable !== false;
    }
    _processEvents() {
        this.dateRange = calculateDateRange(this.view, this.contextDate, this.days, this.weekStartsOn);
        this.singleDayEvents = {};
        this._forEachDayInRange(i => {
            const dayStart = startOfDay(i);
            const dayEnd = nextDay(dayStart);
            const manager = new EventManager();
            manager.addEvents(this.events.filter(event => !event.isAllDay() &&
                rangesOverlap(event.start, event.end, dayStart, dayEnd)));
            manager.process();
            this.singleDayEvents[this._getDateOnly(i)] = manager.columns;
        });
        const rangeEnd = nextDay(this.dateRange.endDate);
        const multiManager = new EventManager();
        multiManager.addEvents(this.events.filter(event => event.isAllDay() &&
            rangesOverlap(event.start, event.end, this.dateRange.startDate, rangeEnd)));
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
    _emitChange(detail) {
        this.dispatchEvent(new CustomEvent('event-change', { detail }));
    }
    _emitAdd(detail) {
        this.dispatchEvent(new CustomEvent('event-add', { detail }));
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
    // ── Drag and drop
    /** The day columns of a section. */
    _columnsOf(section) {
        return [
            ...this.renderRoot.querySelectorAll(section === 'timed'
                ? '.events-container > .column'
                : '.multi-day-background .columns > .column'),
        ];
    }
    /** The day of the column nearest `x`; with `within`, only a column that spans `x`. */
    _dayAt(section, x, within = false) {
        const columns = this._columnsOf(section);
        const index = nearestIndex(columns, x);
        if (index < 0)
            return null;
        if (within) {
            const rect = columns[index].getBoundingClientRect();
            if (x < rect.left || x > rect.right)
                return null;
        }
        return startOfDay(addDays(this.dateRange.startDate, index));
    }
    /** The time at `y` in `day`'s column of the hours. */
    _timeAt(day, y) {
        const rect = this.renderRoot
            .querySelector('.events-container')
            ?.getBoundingClientRect();
        if (!rect || rect.height <= 0)
            return startOfDay(day);
        return timeAtFraction(day, (y - rect.top) / rect.height);
    }
    _onEventPointerDown(event, node, section) {
        if (!this._canEdit(node))
            return;
        const handle = event.target instanceof Element
            ? event.target.closest('[data-handle]')?.dataset.handle
            : undefined;
        let action = 'move';
        if (handle === 'start')
            action = 'resize-start';
        else if (handle === 'end')
            action = 'resize-end';
        const day = this._dayAt(section, event.clientX) ?? startOfDay(node.start);
        this._drag.start(event, {
            action,
            section,
            event: node,
            day,
            time: section === 'timed' ? this._timeAt(day, event.clientY) : day,
        });
    }
    _onSectionPointerDown(event, section) {
        if (!this.addable || this._drag.pressing)
            return;
        // Presses on events are theirs, even on events that cannot be dragged.
        const onEvent = event
            .composedPath()
            .some(target => target instanceof HTMLElement && target.classList.contains('event'));
        if (onEvent)
            return;
        const day = this._dayAt(section, event.clientX, true);
        if (!day)
            return;
        this._drag.start(event, {
            action: 'add',
            section,
            day,
            time: section === 'timed' ? this._timeAt(day, event.clientY) : day,
        });
    }
    /** Where the drag of `press` would put its event with the pointer at `point`. */
    _previewFor(press, point) {
        const { event } = press;
        const range = press.section === 'timed'
            ? this._timedRange(press, point)
            : dragByDays(press.action, press.day, this._dayAt('all-day', point.x) ?? press.day, event);
        if (!range)
            return null;
        return {
            action: press.action,
            section: press.section,
            data: event?.data,
            title: event ? event.title || this.untitledLabel : this.newEventLabel,
            color: event?.color,
            ...range,
        };
    }
    /** The range a drag in the hours gives, snapped to `minuteStep`. */
    _timedRange(press, point) {
        const step = this._step;
        const stepMs = step * MINUTE_MS;
        const { event } = press;
        if (press.action === 'add') {
            // The slot pressed is always part of the range; the drag stays in its day.
            const time = this._timeAt(press.day, point.y);
            const anchor = snapTime(press.time, step, 'floor');
            const dayEnd = nextDay(press.day).valueOf();
            if (time.valueOf() >= anchor.valueOf()) {
                const end = Math.max(snapTime(time, step, 'ceil', press.day).valueOf(), anchor.valueOf() + stepMs);
                return { start: anchor, end: new Date(Math.min(end, dayEnd)) };
            }
            return {
                start: snapTime(time, step, 'floor', press.day),
                end: new Date(Math.min(anchor.valueOf() + stepMs, dayEnd)),
            };
        }
        if (!event)
            return null;
        if (press.action === 'move') {
            // The point the event was grabbed by follows the pointer, so the event keeps its length and
            // may run past midnight; at least a step of it stays in the column under the pointer.
            const day = this._dayAt('timed', point.x) ?? press.day;
            const length = event.length();
            const visible = Math.min(stepMs, length);
            const grab = press.time.valueOf() - event.start.valueOf();
            const raw = new Date(this._timeAt(day, point.y).valueOf() - grab);
            const start = clamp(snapTime(raw, step, 'round').valueOf(), startOfDay(day).valueOf() + visible - length, nextDay(day).valueOf() - visible);
            return { start: new Date(start), end: new Date(start + length) };
        }
        if (press.action === 'resize-end') {
            // The end stays on the day it is drawn on, at least one step after the start.
            const endDay = event.lastDay();
            const end = snapTime(this._timeAt(endDay, point.y), step, 'round', endDay).valueOf();
            const min = event.start.valueOf() + stepMs;
            const max = Math.max(nextDay(endDay).valueOf(), min);
            return { start: event.start, end: new Date(clamp(end, min, max)) };
        }
        // resize-start: the start stays on its day, at least one step before the end.
        const startDay = startOfDay(event.start);
        const start = snapTime(this._timeAt(startDay, point.y), step, 'round', startDay).valueOf();
        const max = event.end.valueOf() - stepMs;
        return {
            start: new Date(clamp(start, Math.min(startDay.valueOf(), max), max)),
            end: event.end,
        };
    }
    _follow(press, point) {
        const preview = this._previewFor(press, point);
        if (!preview)
            return;
        const current = this._preview;
        if (current &&
            current.start.valueOf() === preview.start.valueOf() &&
            current.end.valueOf() === preview.end.valueOf()) {
            return;
        }
        this._preview = preview;
    }
    _drop(press, point) {
        const preview = this._previewFor(press, point) ?? this._preview;
        this._preview = null;
        if (!preview)
            return;
        const { start, end } = preview;
        if (press.action === 'add') {
            this._emitAdd({ start, end, allDay: press.section === 'all-day' });
            return;
        }
        const { event } = press;
        if (!event || !preview.data)
            return;
        if (start.valueOf() === event.start.valueOf() &&
            end.valueOf() === event.end.valueOf()) {
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
    _tap(press) {
        if (press.action !== 'add')
            return;
        if (press.section === 'all-day') {
            this._emitAdd({
                start: press.day,
                end: nextDay(press.day),
                allDay: true,
            });
            return;
        }
        // Starts at the half hour clicked, the rows the grid draws.
        const start = snapTime(press.time, Math.max(30, this._step), 'floor');
        const dayEnd = nextDay(press.day).valueOf();
        const end = new Date(Math.min(start.valueOf() + this._duration * MINUTE_MS, dayEnd));
        this._emitAdd({ start, end, allDay: false });
    }
    /**
     * Blurs the focused event when a drag starts. The drop redraws the events, and the element that
     * held focus could then show another event, which Enter would open.
     */
    _blurFocused() {
        const active = this.renderRoot.activeElement;
        if (active instanceof HTMLElement)
            active.blur();
    }
    /** How `node`'s blocks take part in the drag in progress. */
    _dragRole(node, section) {
        const preview = this._preview;
        if (!preview?.data || preview.data !== node.data)
            return null;
        // A timed event moving between columns is drawn again where it lands.
        return section === 'timed' && preview.action === 'move'
            ? 'source'
            : 'lifted';
    }
    /** The days the drag in progress, or the placeholder, covers in the all-day row. */
    _allDayTarget() {
        const preview = this._preview;
        if (preview)
            return preview.section === 'all-day' ? preview : null;
        return this.placeholder?.allDay ? this.placeholder : null;
    }
    /** Classes of the view while a drag is in progress, which set the cursor. */
    _rootClasses() {
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
        const target = this._allDayTarget();
        const first = target ? startOfDay(target.start).valueOf() : 0;
        const last = target ? lastDayOf(target.start, target.end).valueOf() : -1;
        const columns = [];
        this._forEachDayInRange(i => {
            const day = startOfDay(i).valueOf();
            const covered = day >= first && day <= last;
            columns.push(b `<div
          class="${this._getDayClass(i)}${covered ? ' drop-target' : ''}"
        ></div>`);
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
    /** One event block. `start` and `end` are where it is drawn, which a resize changes. */
    _renderEvent(node, section, position, range, handles) {
        const interactive = this._interactive;
        const editable = this._canEdit(node);
        const role = this._dragRole(node, section);
        const resizing = role === 'lifted' &&
            section === 'timed' &&
            this._preview?.action !== 'move';
        const declarations = node.color
            ? { ...position, ...this._colorVars(node.color) }
            : position;
        const activate = () => this._emitEventClick(node.data);
        const handle = (edge) => editable && handles.includes(edge)
            ? b `<div
            class="resize-handle ${edge}"
            data-handle=${edge}
            aria-hidden="true"
          ></div>`
            : A;
        return b `
      <div
        class=${e({
            event: true,
            clickable: interactive,
            editable,
            'drag-source': role === 'source',
            lifted: role === 'lifted',
        })}
        style=${this._styleMap(declarations)}
        role=${interactive ? 'button' : 'note'}
        tabindex=${interactive ? '0' : A}
        aria-label=${formatEventLabel(node.title, node.start, node.end, this._locale, section === 'all-day')}
        @click=${() => {
            if (interactive)
                activate();
        }}
        @keydown=${interactive ? onActivateKey(activate) : A}
        @pointerdown=${editable
            ? (event) => this._onEventPointerDown(event, node, section)
            : A}
      >
        ${handle('start')}
        <div class="event-title" aria-hidden="true">
          ${node.title || this.untitledLabel}
        </div>
        ${resizing
            ? b `<div class="event-time" aria-hidden="true">
              ${formatTimeRange(range.start, range.end, this._locale)}
            </div>`
            : A}
        ${handle('end')}
      </div>
    `;
    }
    /** A timed event's block in one day column, at its own times or those of its resize. */
    _renderTimedEvent(node, dayStart, dayEnd, columnIndex, columnCount) {
        const preview = this._preview;
        const resized = this._dragRole(node, 'timed') === 'lifted' && preview ? preview : null;
        const start = resized ? resized.start : node.start;
        const end = resized ? resized.end : node.end;
        const top = getTimePercent(start, dayStart);
        const bottom = getTimePercent(end, dayStart);
        // A block shows the handle of an edge only on the day that edge falls on. The event's own
        // times decide, not the resize's: removing the handle being dragged would strand a touch drag.
        const handles = [];
        if (node.start.valueOf() >= dayStart.valueOf() &&
            node.length() >= START_HANDLE_MIN_MS) {
            handles.push('start');
        }
        if (node.end.valueOf() <= dayEnd.valueOf())
            handles.push('end');
        return this._renderEvent(node, 'timed', {
            top: `${top}%`,
            height: `${bottom - top}%`,
            'inset-inline-start': `${(columnIndex / columnCount) * 100}%`,
            width: `calc(${(node.width / columnCount) * 100}% - 1px)`,
        }, { start, end }, handles);
    }
    /** A new or moved timed event where the drag would put it, or the placeholder. */
    _renderTimedPreview(dayStart, dayEnd) {
        const preview = this._preview;
        let item = null;
        let placeholder = false;
        if (preview) {
            if (preview.section === 'timed' &&
                (preview.action === 'add' || preview.action === 'move')) {
                item = preview;
            }
        }
        else if (this.placeholder && !this.placeholder.allDay) {
            item = { ...this.placeholder, title: this.newEventLabel };
            placeholder = true;
        }
        if (!item || !rangesOverlap(item.start, item.end, dayStart, dayEnd)) {
            return A;
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
        const compact = item.end.valueOf() - item.start.valueOf() < COMPACT_PREVIEW_MS;
        return b `
      <div
        class=${e({ event: true, preview: true, placeholder })}
        style=${this._styleMap(item.color
            ? { ...position, ...this._colorVars(item.color) }
            : position)}
        aria-hidden="true"
      >
        ${compact
            ? b `<div class="event-title">${item.title}, ${time}</div>`
            : b `<div class="event-title">${item.title}</div>
              <div class="event-time">${time}</div>`}
      </div>
    `;
    }
    _renderEvents() {
        const columns = [];
        this._forEachDayInRange(i => {
            const dayStart = startOfDay(i);
            const dayEnd = nextDay(dayStart);
            const eventDay = this.singleDayEvents[this._getDateOnly(i)];
            columns.push(b `
        <div class=${this._getDayClass(i)}>
          <div class="column-content">
            ${eventDay
                ? eventDay.map((nodes, columnIndex) => nodes.map(node => this._renderTimedEvent(node, dayStart, dayEnd, columnIndex, eventDay.length)))
                : A}
            ${this._renderTimedPreview(dayStart, dayEnd)}
          </div>
        </div>
      `);
        });
        return b `<div class="events-container">${columns}</div>`;
    }
    /** Position of a bar in the all-day row covering the days of `start`–`end`. */
    _allDayPosition(start, end) {
        const from = this._getDatePercent(start);
        const to = this._getDatePercent(nextDay(lastDayOf(start, end)));
        return {
            'inset-inline-start': `${from + LONG_EVENT_PADDING}%`,
            width: `${to - from - 2 * LONG_EVENT_PADDING}%`,
        };
    }
    _renderAllDayEvent(node) {
        const preview = this._preview;
        const dragged = this._dragRole(node, 'all-day') === 'lifted' && preview ? preview : null;
        const start = dragged ? dragged.start : node.start;
        const end = dragged ? dragged.end : node.end;
        // Edges outside the days shown cannot be dragged. The event's own days decide, so the handle
        // being dragged stays while the bar moves.
        const handles = [];
        if (startOfDay(node.start).valueOf() >=
            startOfDay(this.dateRange.startDate).valueOf()) {
            handles.push('start');
        }
        if (node.lastDay().valueOf() <= startOfDay(this.dateRange.endDate).valueOf()) {
            handles.push('end');
        }
        return this._renderEvent(node, 'all-day', this._allDayPosition(start, end), { start, end }, handles);
    }
    _renderMultiDayEvents() {
        const preview = this._preview;
        let adding = null;
        if (preview) {
            if (preview.section === 'all-day' && preview.action === 'add') {
                adding = { start: preview.start, end: preview.end, placeholder: false };
            }
        }
        else if (this.placeholder?.allDay) {
            adding = { ...this.placeholder, placeholder: true };
        }
        if (!this.multiDayEvents.length && !adding)
            return A;
        return b `
      <div class="row-content">
        ${this.multiDayEvents.map(nodes => b `
            <div class="row">
              ${nodes.map(node => this._renderAllDayEvent(node))}
            </div>
          `)}
        ${adding
            ? b `<div class="row">
              <div
                class=${e({
                event: true,
                preview: true,
                placeholder: adding.placeholder,
            })}
                style=${this._styleMap(this._allDayPosition(adding.start, adding.end))}
                aria-hidden="true"
              >
                <div class="event-title">${this.newEventLabel}</div>
              </div>
            </div>`
            : A}
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
        class=${e(this._rootClasses())}
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
              @pointerdown=${(event) => this._onSectionPointerDown(event, 'all-day')}
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
              @pointerdown=${(event) => this._onSectionPointerDown(event, 'timed')}
            >
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
    n({ type: Boolean })
], CalendarColumnView.prototype, "editable", void 0);
__decorate([
    n({ type: Boolean })
], CalendarColumnView.prototype, "addable", void 0);
__decorate([
    n({ type: Number, attribute: false })
], CalendarColumnView.prototype, "minuteStep", void 0);
__decorate([
    n({ type: Number, attribute: false })
], CalendarColumnView.prototype, "defaultDuration", void 0);
__decorate([
    n({ attribute: false })
], CalendarColumnView.prototype, "placeholder", void 0);
__decorate([
    n({ attribute: false })
], CalendarColumnView.prototype, "untitledLabel", void 0);
__decorate([
    n({ attribute: false })
], CalendarColumnView.prototype, "newEventLabel", void 0);
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
__decorate([
    r()
], CalendarColumnView.prototype, "_preview", void 0);
CalendarColumnView = __decorate([
    IndividualComponent
], CalendarColumnView);

export { CalendarColumnView };
//# sourceMappingURL=calendar-column-view.js.map
