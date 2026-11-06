import { LitElement, html, nothing, PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { addDays, addMonths, formatDate, toZonedWallClock } from './utils.js';
import { CalendarEvent } from './calendar-event.js';
import type { CalendarViewType, EventType } from './types.js';
import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import type { PeacockStrings } from '@/__internal/i18n/strings.js';
import { deprecate } from '@/__internal/utils/deprecate.js';
import {
  dateToIso,
  isoToDate,
  weekStart,
  type WeekDay,
} from '@/__internal/utils/date.js';
import styles from './calendar.scss';

/** Detail of `date-change`. */
export type CalendarDateChangeDetail = {
  /** The new context date. */
  date: Date;
  /** The same date as an ISO string, `YYYY-MM-DD`. */
  value: string;
};

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
 * @fires {CustomEvent} event-click - An event was clicked, or chosen with Enter or Space. Detail contains `{ event }`. Not fired with `events-readonly`.
 * @fires {CustomEvent} view-change - The view changed. Detail contains `{ view }`.
 * @fires {CustomEvent} date-change - The context date changed. Detail contains `{ date, value }`: the `Date` and its ISO string.
 *
 * @example
 * ```html
 * <wc-calendar view="week" date="2026-11-06" style="height: 600px"></wc-calendar>
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
   * Whether events are clickable.
   * @deprecated Use `events-readonly`.
   */
  @property({ type: Boolean, attribute: 'event-clickable' })
  eventClickable: boolean = true;

  /** Shows a progress bar and marks the calendar busy while events load. */
  @property({ type: Boolean, reflect: true })
  loading: boolean = false;

  /**
   * Shows a progress bar while events load.
   * @deprecated Use `loading`.
   */
  @property({ type: Boolean, attribute: 'show-loader' })
  showLoader: boolean = false;

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
  }

  override willUpdate(changed: PropertyValues<this>) {
    super.willUpdate(changed);
    if (changed.has('view') || changed.has('availableViews')) {
      this._currentView = this.availableViews.find(v => v.value === this.view);
    }
    if (changed.has('timezone')) {
      this._currentTime = this._now();
    }
    this._syncDate(changed);
    if (changed.has('showLoader') && this.showLoader) {
      deprecate('wc-calendar', '`show-loader`', '`loading`');
    }
    if (changed.has('eventClickable') && !this.eventClickable) {
      deprecate('wc-calendar', '`event-clickable`', '`events-readonly`');
    }
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

  /** Whether events can be clicked: not `events-readonly` and not the deprecated `event-clickable="false"`. */
  private _eventsInteractive(): boolean {
    return !this.eventsReadonly && this.eventClickable;
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

  private _onViewSegmentChange(evt: CustomEvent<{ value: string | null }>) {
    if (!evt.detail.value) return;
    this.view = evt.detail.value;
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
    return html`
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
            ${this.availableViews.map(
              v =>
                html`<wc-segmented-button
                  .value=${v.value}
                  ?selected=${this.view === v.value}
                >
                  ${this._viewLabel(v)}
                </wc-segmented-button>`,
            )}
          </wc-segmented-button-group>
        </div>
      </div>
    `;
  }

  private _renderCalendarView() {
    if (!this._currentView) {
      return html`<div>${this._i18n.t('invalidView')}</div>`;
    }
    const { locale } = this._i18n;
    const readonly = !this._eventsInteractive();
    const weekStartsOn = this._weekStart();
    const contextDate = this.contextDate ?? this._currentTime;

    const calEvents = this.events.map(
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
          ?events-readonly=${readonly}
          @date-click=${this._onViewDateClick}
          @event-click=${this._onViewEventClick}
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
          ?events-readonly=${readonly}
          @event-click=${this._onViewEventClick}
        ></wc-calendar-month-view>
      `;
    }
    return nothing;
  }

  // ── Render

  render() {
    const busy = this.loading || this.showLoader;
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
      </div>
    `;
  }
}
