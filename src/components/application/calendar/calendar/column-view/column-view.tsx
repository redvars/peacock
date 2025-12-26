import {
  Component,
  ComponentInterface,
  Element,
  Event,
  EventEmitter,
  h,
  Prop,
} from '@stencil/core';
import {
  addDays,
  addHours,
  differenceInDays,
  endOfDay,
  format,
  startOfDay,
} from 'date-fns';
import { calculateDateRange } from './utils';
import ColumnEventManager from './ColumnEventManager';
import { BaseEvent } from '../event-management/BaseEvent';
import { LONG_EVENT_PADDING } from '../utils';

@Component({
  tag: 'pc-calendar-column-view',
  styleUrl: 'column-view.scss',
  shadow: true,
})
export class CalendarColumnView implements ComponentInterface {
  @Element() elm!: HTMLElement;

  @Prop() events: any[] = [];

  @Prop() view = 'week';

  @Prop() days = 7;

  @Prop() eventClickable: boolean = true;

  @Prop() currentTime: Date;

  @Prop() contextDate: Date;

  dateRange: any;

  singleDayEvents: any = {};
  multiDayEvents: any = [];

  @Event({ eventName: 'internal-column-view-date-click' })
  goatColumnViewDateClick: EventEmitter;

  @Event({ eventName: 'internal-column-view-event-click' })
  goatColumnViewEventClick: EventEmitter;

  async componentWillRender() {
    this.dateRange = calculateDateRange(this.view, this.contextDate, this.days);
    this.singleDayEvents = {};
    this.#forEachDayInDateRange(i => {
      const manager = new ColumnEventManager();
      manager.addEvents(
        this.events.filter(event => {
          return (
            event.isOverlapping(new BaseEvent(startOfDay(i), endOfDay(i))) &&
            event.length() < 86400000
          );
        }),
      );
      manager.process();
      this.singleDayEvents[this.#getDateOnly(i)] = manager.columns;
    });
    const manager = new ColumnEventManager();
    manager.addEvents(
      this.events.filter(event => {
        return (
          event.isOverlapping(
            new BaseEvent(this.dateRange.startDate, this.dateRange.endDate),
          ) && event.length() >= 86400000
        );
      }),
    );
    manager.process();
    this.multiDayEvents = manager.columns;
  }

  #forEachDayInDateRange(callback) {
    for (
      let i = new Date(this.dateRange.startDate);
      differenceInDays(startOfDay(this.dateRange.endDate), i) >= 0;
      i = addDays(i, 1)
    ) {
      callback(i);
    }
  }

  #getDateOnly(date: Date) {
    return format(date, 'dd-MM-yyyy');
  }

  async componentDidLoad() {
    const viewBodyHeight =
      this.elm.shadowRoot.querySelector('.view-body').scrollHeight;
    this.elm.shadowRoot.querySelector('.view-body').scroll({
      top: (this.getTimePercent(this.currentTime) / 100) * viewBodyHeight - 150,
    });
  }

  renderHeader() {
    const columns = [];
    this.#forEachDayInDateRange(i => {
      const cls = ['column'];
      const diff = differenceInDays(
        startOfDay(i),
        startOfDay(this.currentTime),
      );
      if (diff === 0) cls.push('today');
      else if (diff < 0) cls.push('past');
      else if (diff > 0) cls.push('future');

      columns.push(
        <div class={cls.join(' ')}>
          <div class="column-content">
            <div
              class="date"
              onClick={() => this.goatColumnViewDateClick.emit({ date: i })}
            >
              {format(i, 'dd')}
            </div>
            <div class="day">{format(i, 'E')}</div>
          </div>
        </div>,
      );
    });
    return columns;
  }

  renderMultiDayBackground() {
    const columns = [];
    for (
      let i = new Date(this.dateRange.startDate);
      differenceInDays(startOfDay(this.dateRange.endDate), i) >= 0;
      i = addDays(i, 1)
    ) {
      const cls = ['column'];
      const diff = differenceInDays(
        startOfDay(i),
        startOfDay(this.currentTime),
      );
      if (diff === 0) cls.push('today');
      else if (diff < 0) cls.push('past');
      else if (diff > 0) cls.push('future');

      columns.push(<div class={cls.join(' ')}></div>);
    }
    return columns;
  }

  renderScale() {
    const rows = [];
    for (let i = 0; i < 48; i++) {
      // @TODO: parameterize number of column, currently rendering 24 hours
      const cls = ['row'];
      if (i % 2) cls.push('hour');
      const startTime = startOfDay(new Date());
      const row = (
        <div class={cls.join(' ')}>
          {(() => {
            if (i % 2 == 0 && i) {
              return (
                <div class="time">
                  {format(addHours(startTime, i / 2), 'hh a')}
                </div>
              );
            }
          })()}
        </div>
      );
      rows.push(row);
    }
    return <div class="background">{rows}</div>;
  }

  renderEvents() {
    const columns = [];
    for (
      let i = new Date(this.dateRange.startDate), j = 0;
      differenceInDays(startOfDay(this.dateRange.endDate), i) >= 0;
      i = addDays(i, 1), j++
    ) {
      const cls = ['column'];
      const diff = differenceInDays(
        startOfDay(i),
        startOfDay(this.currentTime),
      );
      if (diff === 0) cls.push('today');
      else if (diff < 0) cls.push('past');
      else if (diff > 0) cls.push('future');
      columns.push(
        <div class={cls.join(' ')}>
          <div class="column-content">
            {(() => {
              const eventDay = this.singleDayEvents[this.#getDateOnly(i)];
              if (eventDay) {
                const columnsLength = eventDay.length;

                return eventDay.map((nodes, columnIndex) => {
                  return nodes.map(node => {
                    const cls = ['event'];
                    if (this.eventClickable) cls.push('clickable');
                    const eventStyles = {
                      top: `${this.getTimePercent(node.start, startOfDay(i))}%`,
                      height: `${
                        this.getTimePercent(node.end, startOfDay(i)) -
                        this.getTimePercent(node.start, startOfDay(i))
                      }%`,
                      left: `${(columnIndex / columnsLength) * 100}%`,
                      width: `calc(${
                        ((1 * node.width) / columnsLength) * 100
                      }% - 1px)`,
                    };
                    if (node.color) {
                      this.populateColorVariables(eventStyles, node.color);
                    }
                    return (
                      <div
                        class={cls.join(' ')}
                        onClick={() => {
                          if (this.eventClickable) {
                            this.goatColumnViewEventClick.emit({
                              event: node.data,
                            });
                          }
                        }}
                        style={eventStyles}
                      >
                        <div class="event-title">
                          {node.title || '(no title)'}
                        </div>
                      </div>
                    );
                  });
                });
              }
            })()}
          </div>
        </div>,
      );
    }
    return <div class="events-container">{columns}</div>;
  }

  populateColorVariables(eventStyles, color) {
    eventStyles['--calendar-event-bg-color'] = `var(--color-${color}-80)`;
    eventStyles[
      '--calendar-event-bg-color--hover'
    ] = `var(--color-${color}-60)`;
    eventStyles['--calendar-event-border-color'] = `var(--color-${color})`;
    eventStyles['--calendar-event-dark-bg-color'] = `var(--color-${color}-90)`;
    eventStyles[
      '--calendar-event-dark-bg-color--hover'
    ] = `var(--color-${color}-70)`;
    eventStyles[
      '--calendar-event-dark-border-color'
    ] = `var(--color-${color})-70`;
  }

  renderMultiDayEvents() {
    const eventDay = this.multiDayEvents;
    if (eventDay && eventDay.length) {
      return (
        <div class="row-content">
          {eventDay.map(nodes => {
            return (
              <div class="row">
                {nodes.map(node => {
                  const cls = ['event'];
                  const eventStyles = {
                    left: `${
                      this.getDatePercent(node.start) + LONG_EVENT_PADDING
                    }%`,
                    width: `${
                      this.getDatePercent(addDays(node.end, 1)) -
                      this.getDatePercent(node.start) -
                      2 * LONG_EVENT_PADDING
                    }%`,
                  };
                  if (node.color) {
                    this.populateColorVariables(eventStyles, node.color);
                  }
                  if (this.eventClickable) cls.push('clickable');
                  return (
                    <div
                      class={cls.join(' ')}
                      onClick={() => {
                        if (this.eventClickable) {
                          this.goatColumnViewEventClick.emit({
                            event: node.data,
                          });
                        }
                      }}
                      style={eventStyles}
                    >
                      <div class="event-title">
                        {node.title || '(no title)'}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
          <div class="row-spacer"></div>
        </div>
      );
    }
  }

  getDatePercent(date) {
    const currentDay = differenceInDays(
      startOfDay(date),
      this.dateRange.startDate,
    );
    const percent = (currentDay / this.dateRange.totalDays) * 100;
    if (percent < 0) return 0;
    if (percent > 100) return 100;
    return percent;
  }

  getTimePercent(date, forDay?) {
    if (!forDay) forDay = date;
    const startDate = startOfDay(forDay);
    const endDate = endOfDay(forDay);
    const percent =
      ((date.valueOf() - startDate.valueOf()) /
        (endDate.valueOf() - startDate.valueOf())) *
      100;
    if (percent < 0) return 0;
    if (percent > 100) return 100;
    return percent;
  }

  renderCurrentTime() {
    if (
      this.currentTime.valueOf() > this.dateRange.startDate.valueOf() - 1 &&
      this.currentTime.valueOf() < this.dateRange.endDate.valueOf() + 1
    ) {
      return (
        <div
          class="current-time-line"
          style={{
            top: `calc(${this.getTimePercent(this.currentTime)}% - 1px)`,
          }}
        >
          <div class="time">{format(this.contextDate, 'hh:mm a')}</div>
          <div
            class="dash-line"
            style={{ width: `${this.getDatePercent(this.currentTime)}%` }}
          ></div>
          <div
            class="dot"
            style={{
              left: `calc( ${this.getDatePercent(
                this.currentTime,
              )}% - 0.25rem)`,
            }}
          ></div>
          <div
            class="line"
            style={{
              left: `${this.getDatePercent(this.currentTime)}%`,
              width: `${(1 / this.dateRange.totalDays) * 100}%`,
            }}
          ></div>
        </div>
      );
    }
  }

  render() {
    return (
      <div class="calendar-column-view">
        <div class="view-header">
          <div class="scale" />
          <div class="columns">{this.renderHeader()}</div>
          <div class="scrollbar-placeholder" />
        </div>
        <div class="multi-day-section-wrapper">
          <div class="multi-day-section-scroll">
            <div class="multi-day-section">
              <div class="multi-day-background">
                <div class="scale" />
                <div class="columns">{this.renderMultiDayBackground()}</div>
              </div>
              <div class="multi-events">{this.renderMultiDayEvents()}</div>
            </div>
          </div>
        </div>
        <div class="view-body">
          <div class="view-body-scroll">
            <div class="scale">{this.renderScale()}</div>
            <div class="drawing-area">
              <pc-calendar-column-view-background
                dateRange={this.dateRange}
                currentTime={this.currentTime}
              />
              {this.renderEvents()}
            </div>
            {this.renderCurrentTime()}
          </div>
        </div>
      </div>
    );
  }
}
