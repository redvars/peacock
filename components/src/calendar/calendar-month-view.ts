import { LitElement, html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import {
  addDays,
  differenceInDays,
  startOfDay,
  endOfDay,
  calculateMonthRange,
  formatDate,
  getTimePercent,
  LONG_EVENT_PADDING,
} from './utils.js';
import { BaseEvent } from './base-event.js';
import { CalendarEvent } from './calendar-event.js';
import { MonthEventManager } from './event-manager.js';
import type { ColumnEvent } from './event-manager.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './calendar-month-view.scss';

/**
 * @label Calendar Month View
 * @tag wc-calendar-month-view
 * @rawTag calendar-month-view
 * @parentRawTag calendar
 * @summary Internal month view component for the calendar.
 */
@IndividualComponent
export class CalendarMonthView extends LitElement {
  static styles = [styles];

  @property({ type: Array })
  events: CalendarEvent[] = [];

  @property({ type: Boolean, attribute: 'event-clickable' })
  eventClickable: boolean = true;

  @property({ type: Object, attribute: false })
  currentTime: Date = new Date();

  @property({ type: Object, attribute: false })
  contextDate: Date = new Date();

  @state()
  private dateRange: any = {};

  @state()
  private weekDayEvents: ColumnEvent[][][] = [];

  override connectedCallback() {
    super.connectedCallback();
    this._processEvents();
  }

  override willUpdate(changedProperties: Map<string, unknown>) {
    if (
      changedProperties.has('events') ||
      changedProperties.has('contextDate')
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
    this.dateRange = calculateMonthRange(this.contextDate, 1);
    this.weekDayEvents = [];

    for (
      let i = new Date(this.dateRange.startDate), j = 0;
      j < 6;
      i = addDays(i, 7), j++
    ) {
      const manager = new MonthEventManager();
      manager.addEvents(
        this.events.filter(event =>
          event.isOverlapping(
            new BaseEvent(startOfDay(i), endOfDay(addDays(i, 6))),
          ),
        ),
      );
      manager.process();
      this.weekDayEvents.push(manager.columns);
    }
  }

  private _getDatePercent(date: Date, dateRangeStartDate: Date): number {
    const currentDay = differenceInDays(startOfDay(date), dateRangeStartDate);
    const percent = (currentDay / 7) * 100;
    if (percent < 0) return 0;
    if (percent > 100) return 100;
    return percent;
  }

  private _getDayClass(date: Date): string {
    const diff = differenceInDays(
      startOfDay(date),
      startOfDay(this.currentTime),
    );
    if (diff === 0) return 'column today';
    if (diff < 0) return 'column past';
    return 'column future';
  }

  private _populateColorVars(
    styles: Record<string, string>,
    color: string,
  ) {
    styles['--calendar-event-bg-color'] = `var(--color-${color}-container)`;
    styles['--calendar-event-bg-color--hover'] = `var(--color-inverse-${color})`;
    styles['--calendar-event-border-color'] = `var(--color-${color})`;
    styles['--calendar-event-text-color'] = `var(--color-on-${color}-container)`;
    styles['--calendar-event-text-color--hover'] = `var(--color-on-${color})`;
  }

  private _emitEventClick(event: any) {
    this.dispatchEvent(
      new CustomEvent('month-view-event-click', {
        detail: { event },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _renderHeader() {
    const columns: any[] = [];
    for (
      let i = new Date(this.dateRange.startDate), j = 0;
      j < 7;
      i = addDays(i, 1), j++
    ) {
      columns.push(html`
        <div class="column">
          <div class="column-content">
            <div class="day">${formatDate(i, 'EEEE')}</div>
          </div>
        </div>
      `);
    }
    return columns;
  }

  private _renderMultiDayBackground(sd: Date) {
    const columns: any[] = [];
    for (let i = new Date(sd), j = 0; j < 7; i = addDays(i, 1), j++) {
      columns.push(html`
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

  private _renderEvents() {
    return this.weekDayEvents.map((eventDay, index) => {
      const weekStartDate = addDays(this.dateRange.startDate, index * 7);
      return html`
        <div class="multi-day-section">
          <div class="multi-day-body-scroll">
            <div class="multi-day-background">
              <div class="columns">
                ${this._renderMultiDayBackground(weekStartDate)}
              </div>
            </div>
            <div class="multi-events">
              <div class="row-content">
                ${eventDay.map(
                  nodes => html`
                    <div class="row">
                      ${nodes.map(node => {
                        const evtCls = this.eventClickable
                          ? 'event clickable'
                          : 'event';
                        const evtStyles: Record<string, string> = {
                          left: `${this._getDatePercent(node.start, weekStartDate) + LONG_EVENT_PADDING}%`,
                          width: `${this._getDatePercent(addDays(node.end, 1), weekStartDate) - this._getDatePercent(node.start, weekStartDate) - 2 * LONG_EVENT_PADDING}%`,
                        };
                        if (node.color) {
                          this._populateColorVars(evtStyles, node.color);
                        }
                        return html`
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
                  `,
                )}
                <div class="row-spacer"></div>
              </div>
            </div>
          </div>
        </div>
      `;
    });
  }

  private _styleMap(styles: Record<string, string>): string {
    return Object.entries(styles)
      .map(([k, v]) => `${k}:${v}`)
      .join(';');
  }

  render() {
    return html`
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
}
