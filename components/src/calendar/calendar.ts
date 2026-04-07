import { LitElement, html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { addDays, addMonths, formatDate } from './utils.js';
import { CalendarEvent } from './calendar-event.js';
import type { CalendarViewType, EventType } from './types.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './calendar.scss';

/**
 * @label Calendar
 * @tag wc-calendar
 * @rawTag calendar
 * @summary A Material 3 inspired full calendar component for displaying events in day, week, or month views.
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
@IndividualComponent
export class Calendar extends LitElement {
  static styles = [styles];

  /**
   * Calendar events array.
   */
  @property({ type: Array })
  events: EventType[] = [];

  /**
   * Available views configuration.
   */
  @property({ type: Array, attribute: 'available-views' })
  availableViews: CalendarViewType[] = [
    { label: 'Day', value: 'day', type: 'column', days: 1 },
    { label: 'Week', value: 'week', type: 'column', days: 7 },
    { label: 'Month', value: 'month', type: 'month' },
  ];

  /**
   * Current calendar view.
   */
  @property({ type: String, reflect: true })
  view: string = 'week';

  /**
   * Whether events are clickable.
   */
  @property({ type: Boolean, attribute: 'event-clickable' })
  eventClickable: boolean = true;

  /**
   * Show loading state.
   */
  @property({ type: Boolean, attribute: 'show-loader' })
  showLoader: boolean = false;

  /**
   * Timezone string (e.g. 'America/New_York').
   */
  @property({ type: String })
  timezone: string = '';

  /**
   * The context date for the calendar view.
   */
  @property({ type: Object, attribute: false })
  contextDate: Date | null = null;

  @state()
  private _currentTime: Date = new Date();

  @state()
  private _currentView: CalendarViewType | undefined;

  override connectedCallback() {
    super.connectedCallback();
    if (this.timezone) {
      this._currentTime = new Date(
        new Date().toLocaleString('en', { timeZone: this.timezone }),
      );
    } else {
      this._currentTime = new Date();
    }
    if (!this.contextDate) {
      this.contextDate = this._currentTime;
    }
  }

  override willUpdate(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('view') || changedProperties.has('availableViews')) {
      this._currentView = this.availableViews.find(v => v.value === this.view);
    }
  }

  private _onColumnViewDateClick(evt: CustomEvent) {
    evt.stopPropagation();
    this.view = 'day';
    this.contextDate = evt.detail.date;
    this.dispatchEvent(
      new CustomEvent('view-change', {
        detail: { view: this.view },
        bubbles: true,
        composed: true,
      }),
    );
    this.dispatchEvent(
      new CustomEvent('date-change', {
        detail: { date: this.contextDate },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _onEventClick(evt: CustomEvent) {
    evt.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('event-click', {
        detail: { event: evt.detail.event },
        bubbles: true,
        composed: true,
      }),
    );
  }

  previous() {
    if (!this._currentView) return;
    if (this._currentView.days) {
      this.contextDate = addDays(
        this.contextDate!,
        -1 * this._currentView.days,
      );
    } else if (this._currentView.type === 'month') {
      this.contextDate = addMonths(this.contextDate!, -1);
    }
    this.dispatchEvent(
      new CustomEvent('date-change', {
        detail: { date: this.contextDate },
        bubbles: true,
        composed: true,
      }),
    );
  }

  next() {
    if (!this._currentView) return;
    if (this._currentView.days) {
      this.contextDate = addDays(
        this.contextDate!,
        this._currentView.days,
      );
    } else if (this._currentView.type === 'month') {
      this.contextDate = addMonths(this.contextDate!, 1);
    }
    this.dispatchEvent(
      new CustomEvent('date-change', {
        detail: { date: this.contextDate },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _goToToday() {
    this.contextDate = this._currentTime;
    this.dispatchEvent(
      new CustomEvent('date-change', {
        detail: { date: this.contextDate },
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

  private _renderHeader() {
    return html`
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
            ${this.availableViews.map(
              v =>
                html`<wc-segmented-button
                  .value=${v.value}
                  ?selected=${this.view === v.value}
                >
                  ${v.label}
                </wc-segmented-button>`,
            )}
          </wc-segmented-button-group>
        </div>
      </div>
    `;
  }

  private _renderCalendarView() {
    if (!this._currentView) return html`<div>Invalid view</div>`;

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
          .contextDate=${this.contextDate}
          ?event-clickable=${this.eventClickable}
          @column-view-date-click=${this._onColumnViewDateClick}
          @column-view-event-click=${this._onEventClick}
        ></wc-calendar-column-view>
      `;
    } else if (this._currentView.type === 'month') {
      return html`
        <wc-calendar-month-view
          .events=${calEvents}
          .currentTime=${this._currentTime}
          .contextDate=${this.contextDate}
          ?event-clickable=${this.eventClickable}
          @month-view-event-click=${this._onEventClick}
        ></wc-calendar-month-view>
      `;
    }
    return nothing;
  }

  render() {
    return html`
      <div class="calendar">
        <div class="calendar-header">${this._renderHeader()}</div>
        <div class="calendar-body">
          <div class="view-container">${this._renderCalendarView()}</div>
        </div>
      </div>
    `;
  }
}
