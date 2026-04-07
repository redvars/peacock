import { LitElement, html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import {
  addDays,
  addHours,
  differenceInDays,
  startOfDay,
  endOfDay,
  calculateDateRange,
  formatDate,
  getTimePercent,
  LONG_EVENT_PADDING,
} from './utils.js';
import { BaseEvent } from './base-event.js';
import { CalendarEvent } from './calendar-event.js';
import { EventManager } from './event-manager.js';
import type { ColumnEvent } from './event-manager.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './calendar-column-view.scss';

/**
 * @label Calendar Column View
 * @tag wc-calendar-column-view
 * @rawTag calendar-column-view
 * @summary Internal column view component for the calendar (day/week views).
 */
@IndividualComponent
export class CalendarColumnView extends LitElement {
  static styles = [styles];

  @property({ type: Array })
  events: CalendarEvent[] = [];

  @property({ type: String })
  view: string = 'week';

  @property({ type: Number })
  days: number = 7;

  @property({ type: Boolean, attribute: 'event-clickable' })
  eventClickable: boolean = true;

  @property({ type: Object, attribute: false })
  currentTime: Date = new Date();

  @property({ type: Object, attribute: false })
  contextDate: Date = new Date();

  @state()
  private dateRange: any = {};

  @state()
  private singleDayEvents: Record<string, ColumnEvent[][]> = {};

  @state()
  private multiDayEvents: ColumnEvent[][] = [];

  override connectedCallback() {
    super.connectedCallback();
    this._processEvents();
  }

  override willUpdate(changedProperties: Map<string, unknown>) {
    if (
      changedProperties.has('events') ||
      changedProperties.has('contextDate') ||
      changedProperties.has('view') ||
      changedProperties.has('days')
    ) {
      this._processEvents();
    }
  }

  override firstUpdated() {
    const viewBody = this.renderRoot.querySelector('.view-body');
    if (viewBody) {
      const viewBodyHeight = viewBody.scrollHeight;
      viewBody.scrollTo({
        top:
          (getTimePercent(this.currentTime) / 100) * viewBodyHeight - 150,
      });
    }
  }

  private _processEvents() {
    this.dateRange = calculateDateRange(this.view, this.contextDate, this.days);
    this.singleDayEvents = {};

    this._forEachDayInRange(i => {
      const manager = new EventManager();
      manager.addEvents(
        this.events.filter(
          event =>
            event.isOverlapping(new BaseEvent(startOfDay(i), endOfDay(i))) &&
            event.length() < 86400000,
        ),
      );
      manager.process();
      this.singleDayEvents[this._getDateOnly(i)] = manager.columns;
    });

    const multiManager = new EventManager();
    multiManager.addEvents(
      this.events.filter(
        event =>
          event.isOverlapping(
            new BaseEvent(this.dateRange.startDate, this.dateRange.endDate),
          ) && event.length() >= 86400000,
      ),
    );
    multiManager.process();
    this.multiDayEvents = multiManager.columns;
  }

  private _forEachDayInRange(callback: (d: Date) => void) {
    for (
      let i = new Date(this.dateRange.startDate);
      differenceInDays(startOfDay(this.dateRange.endDate), i) >= 0;
      i = addDays(i, 1)
    ) {
      callback(i);
    }
  }

  private _getDateOnly(date: Date): string {
    return formatDate(date, 'dd-MM-yyyy');
  }

  private _getDatePercent(date: Date): number {
    const currentDay = differenceInDays(
      startOfDay(date),
      this.dateRange.startDate,
    );
    const percent = (currentDay / this.dateRange.totalDays) * 100;
    if (percent < 0) return 0;
    if (percent > 100) return 100;
    return percent;
  }

  private _getDayClass(date: Date): string {
    const diff = differenceInDays(startOfDay(date), startOfDay(this.currentTime));
    if (diff === 0) return 'column today';
    if (diff < 0) return 'column past';
    return 'column future';
  }

  private _populateColorVars(
    styles: Record<string, string>,
    color: string,
  ) {
    styles['--calendar-event-bg-color'] = `var(--color-${color}-90)`;
    styles['--calendar-event-bg-color--hover'] = `var(--color-${color}-80)`;
    styles['--calendar-event-border-color'] = `var(--color-${color})`;
  }

  private _emitDateClick(date: Date) {
    this.dispatchEvent(
      new CustomEvent('column-view-date-click', {
        detail: { date },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _emitEventClick(event: any) {
    this.dispatchEvent(
      new CustomEvent('column-view-event-click', {
        detail: { event },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _renderHeader() {
    const columns: any[] = [];
    this._forEachDayInRange(i => {
      columns.push(html`
        <div class=${this._getDayClass(i)}>
          <div class="column-content">
            <div
              class="date"
              @click=${() => this._emitDateClick(i)}
            >
              ${formatDate(i, 'dd')}
            </div>
            <div class="day">${formatDate(i, 'E')}</div>
          </div>
        </div>
      `);
    });
    return columns;
  }

  private _renderMultiDayBackground() {
    const columns: any[] = [];
    this._forEachDayInRange(i => {
      columns.push(html`<div class=${this._getDayClass(i)}></div>`);
    });
    return columns;
  }

  private _renderScale() {
    const rows: any[] = [];
    for (let i = 0; i < 48; i++) {
      const cls = i % 2 ? 'row hour' : 'row';
      const sd = startOfDay(new Date());
      rows.push(html`
        <div class=${cls}>
          ${i % 2 === 0 && i
            ? html`<div class="time">${formatDate(addHours(sd, i / 2), 'hh a')}</div>`
            : nothing}
        </div>
      `);
    }
    return html`<div class="background">${rows}</div>`;
  }

  private _renderBackgroundGrid() {
    const rows: any[] = [];
    for (let i = 0; i < 48; i++) {
      const cls = i % 2 ? 'row hour' : 'row';
      const columns: any[] = [];
      this._forEachDayInRange(d => {
        columns.push(html`<div class=${this._getDayClass(d)}></div>`);
      });
      rows.push(html`<div class=${cls}>${columns}</div>`);
    }
    return html`<div class="background">${rows}</div>`;
  }

  private _renderEvents() {
    const columns: any[] = [];
    this._forEachDayInRange(i => {
      const cls = this._getDayClass(i);
      const eventDay = this.singleDayEvents[this._getDateOnly(i)];
      columns.push(html`
        <div class=${cls}>
          <div class="column-content">
            ${eventDay
              ? eventDay.map((nodes, columnIndex) =>
                  nodes.map(node => {
                    const evtCls = this.eventClickable
                      ? 'event clickable'
                      : 'event';
                    const evtStyles: Record<string, string> = {
                      top: `${getTimePercent(node.start, startOfDay(i))}%`,
                      height: `${getTimePercent(node.end, startOfDay(i)) - getTimePercent(node.start, startOfDay(i))}%`,
                      left: `${(columnIndex / eventDay.length) * 100}%`,
                      width: `calc(${((1 * node.width) / eventDay.length) * 100}% - 1px)`,
                    };
                    if (node.color) {
                      this._populateColorVars(evtStyles, node.color);
                    }
                    return html`
                      <div
                        class=${evtCls}
                        style=${this._styleMap(evtStyles)}
                        @click=${() => {
                          if (this.eventClickable) this._emitEventClick(node.data);
                        }}
                      >
                        <div class="event-title">
                          ${node.title || '(no title)'}
                        </div>
                      </div>
                    `;
                  }),
                )
              : nothing}
          </div>
        </div>
      `);
    });
    return html`<div class="events-container">${columns}</div>`;
  }

  private _renderMultiDayEvents() {
    if (!this.multiDayEvents || !this.multiDayEvents.length) return nothing;
    return html`
      <div class="row-content">
        ${this.multiDayEvents.map(
          nodes => html`
            <div class="row">
              ${nodes.map(node => {
                const evtCls = this.eventClickable
                  ? 'event clickable'
                  : 'event';
                const evtStyles: Record<string, string> = {
                  left: `${this._getDatePercent(node.start) + LONG_EVENT_PADDING}%`,
                  width: `${this._getDatePercent(addDays(node.end, 1)) - this._getDatePercent(node.start) - 2 * LONG_EVENT_PADDING}%`,
                };
                if (node.color) {
                  this._populateColorVars(evtStyles, node.color);
                }
                return html`
                  <div
                    class=${evtCls}
                    style=${this._styleMap(evtStyles)}
                    @click=${() => {
                      if (this.eventClickable) this._emitEventClick(node.data);
                    }}
                  >
                    <div class="event-title">
                      ${node.title || '(no title)'}
                    </div>
                  </div>
                `;
              })}
            </div>
          `,
        )}
        <div class="row-spacer"></div>
      </div>
    `;
  }

  private _renderCurrentTime() {
    if (
      this.currentTime.valueOf() < this.dateRange.startDate?.valueOf() - 1 ||
      this.currentTime.valueOf() > this.dateRange.endDate?.valueOf() + 1
    ) {
      return nothing;
    }
    return html`
      <div
        class="current-time-line"
        style="top: calc(${getTimePercent(this.currentTime)}% - 1px)"
      >
        <div class="time">${formatDate(this.currentTime, 'hh:mm a')}</div>
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
          style="left: ${this._getDatePercent(this.currentTime)}%; width: ${(1 / this.dateRange.totalDays) * 100}%"
        ></div>
      </div>
    `;
  }

  private _styleMap(styles: Record<string, string>): string {
    return Object.entries(styles)
      .map(([k, v]) => `${k}:${v}`)
      .join(';');
  }

  render() {
    return html`
      <div class="calendar-column-view">
        <div class="view-header">
          <div class="scale"></div>
          <div class="columns">${this._renderHeader()}</div>
          <div class="scrollbar-placeholder"></div>
        </div>
        <div class="multi-day-section-wrapper">
          <div class="multi-day-section-scroll">
            <div class="multi-day-section">
              <div class="multi-day-background">
                <div class="scale"></div>
                <div class="columns">
                  ${this._renderMultiDayBackground()}
                </div>
              </div>
              <div class="multi-events">
                ${this._renderMultiDayEvents()}
              </div>
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
}
