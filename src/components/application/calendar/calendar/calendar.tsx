import {
  Component,
  ComponentInterface,
  Element,
  Event,
  EventEmitter,
  h,
  Host,
  Listen,
  Prop,
} from '@stencil/core';
import { addDays, addMonths, format } from 'date-fns';
import { CalendarEvent } from './CalendarEvent';
import { CalendarViewType, EventType } from './types';
import {
  GoatCalendarColumnViewCustomEvent,
  GoatCalendarMonthViewCustomEvent,
} from '../../../../components';

/**
 * @name Calendar
 * @description The calendar component is used to display information in a daily, weekly, monthly, or category view.
 * @category Data Display
 * @tags calendar
 * @img /assets/img/calendar.webp
 * @imgDark /assets/img/calendar-dark.webp
 */
@Component({
  tag: 'goat-calendar',
  styleUrl: 'calendar.scss',
  shadow: true,
})
export class Calendar implements ComponentInterface {
  @Element() elm!: HTMLElement;

  /**
   * Calendar events.
   */
  @Prop() events: EventType[] = [];

  /**
   * Available views.
   */
  @Prop() availableViews: CalendarViewType[] = [
    {
      label: 'Day',
      value: 'day',
      type: 'column',
      days: 1,
    },
    {
      label: 'Week',
      value: 'week',
      type: 'column',
      days: 7,
    },
    {
      label: 'Month',
      value: 'month',
      type: 'month',
    },
  ];

  /**
   * Calendar view.
   */
  @Prop() view: 'day' | 'week' | 'month' | string = 'week';

  /**
   * Event clickable.
   */
  @Prop() eventClickable: boolean = true;

  /**
   * Show loader.
   */
  @Prop() showLoader: boolean = false;

  /**
   * Timezone.
   */
  @Prop() timezone: string;

  /**
   * Context date.
   */
  @Prop({ mutable: true }) contextDate: Date;

  /**
   * Calendar event click.
   */
  @Event({ eventName: 'goat-calendar--event-click' })
  goatCalendarEventClick: EventEmitter;

  #currentTime: any;
  #currentView: CalendarViewType;

  @Listen('internal-column-view-date-click')
  columnViewDateClick(evt: GoatCalendarColumnViewCustomEvent<any>) {
    evt.stopPropagation();
    evt.preventDefault();
    this.view = 'day';
    this.contextDate = evt.detail.date;
  }

  @Listen('internal-column-view-event-click')
  @Listen('internal-month-view-event-click')
  monthViewEventClick(evt: GoatCalendarMonthViewCustomEvent<any>) {
    evt.stopPropagation();
    evt.preventDefault();
    this.goatCalendarEventClick.emit({
      event: evt.detail.event,
    });
  }

  async componentWillLoad() {
    if (this.timezone) {
      this.#currentTime = new Date(
        new Date().toLocaleString('en', { timeZone: this.timezone }),
      );
    } else {
      this.#currentTime = new Date();
    }
    if (!this.contextDate) {
      this.contextDate = this.#currentTime;
    }
  }

  async componentWillRender() {
    this.#currentView = this.availableViews.find(
      view => view.value === this.view,
    );
  }

  previous() {
    if (this.#currentView.days) {
      this.contextDate = addDays(this.contextDate, -1 * this.#currentView.days);
    } else if (this.#currentView.type === 'month') {
      this.contextDate = addMonths(this.contextDate, -1);
    }
  }

  next() {
    if (this.#currentView.days) {
      this.contextDate = addDays(this.contextDate, this.#currentView.days);
    } else if (this.#currentView.type === 'month') {
      this.contextDate = addMonths(this.contextDate, 1);
    }
  }

  renderHeader() {
    return (
      <div class="calendar-header-classic">
        <div class="header-left">
          <pc-button
            variant="outlined"
            size="sm"
            class="color-secondary"
            onClick={() => (this.contextDate = this.#currentTime)}
          >
            Today
          </pc-button>
          <pc-button
            variant="text"
            size="sm"
            class="color-secondary"
            onClick={() => this.previous()}
          >
            <pc-icon slot="icon" name="chevron--left"></pc-icon>
          </pc-button>
          <pc-button
            variant="text"
            size="sm"
            class="color-secondary"
            onClick={() => this.next()}
          >
            <pc-icon slot="icon" name="chevron--right"></pc-icon>
          </pc-button>
          <div class="title">{format(this.contextDate, 'MMMM d, yyyy')}</div>
        </div>
        <div class="header-right">
          <goat-select
            size="sm"
            placements={'bottom-end'}
            value={this.view}
            items={this.availableViews.map(view => {
              return {
                label: view.label,
                value: view.value,
              };
            })}
            onGoat-select--change={event => {
              this.view = event.detail.value;
            }}
          ></goat-select>
        </div>
      </div>
    );
  }

  renderCalendarView() {
    if (!this.#currentView) return 'Invalid view';

    const events = this.events.map(event => {
      return new CalendarEvent(
        event.start,
        event.end,
        event.title,
        event.color,
        event,
      );
    });

    if (this.#currentView.type === 'column') {
      return (
        <goat-calendar-column-view
          view={this.#currentView.value}
          days={this.#currentView.days}
          currentTime={this.#currentTime}
          contextDate={this.contextDate}
          eventClickable={this.eventClickable}
          events={events}
        />
      );
    } else if (this.#currentView.type === 'month') {
      return (
        <goat-calendar-month-view
          currentTime={this.#currentTime}
          contextDate={this.contextDate}
          eventClickable={this.eventClickable}
          events={events}
        />
      );
    }
  }

  render() {
    return (
      <Host>
        <div class="calendar">
          <div class="calendar-header">{this.renderHeader()}</div>
          <div class="calendar-body">
            <div class="view-container">{this.renderCalendarView()}</div>
            <div class="contextual-panel"></div>
          </div>
        </div>
      </Host>
    );
  }
}
