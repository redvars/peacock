import { LitElement, html, nothing, PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import {
  addDays,
  differenceInDays,
  startOfDay,
  endOfDay,
  calculateMonthRange,
  formatDate,
  formatEventLabel,
  getTimePercent,
  LONG_EVENT_PADDING,
  onActivateKey,
} from './utils.js';
import { BaseEvent } from './base-event.js';
import { CalendarEvent } from './calendar-event.js';
import { MonthEventManager } from './event-manager.js';
import type { ColumnEvent } from './event-manager.js';
import IndividualComponent from '@/IndividualComponent.js';
import { resolveLocale } from '@/__internal/i18n/locale.js';
import { deprecate } from '@/__internal/utils/deprecate.js';
import type { WeekDay } from '@/__internal/utils/date.js';
import styles from './calendar-month-view.scss';

/** An event laid out in one week row, with the id its day cell owns it by. */
type PlacedEvent = { node: ColumnEvent; id: string; dayIndex: number };

/**
 * @internal Rendered by `wc-calendar`; not meant to be used on its own.
 *
 * @label Calendar Month View
 * @tag wc-calendar-month-view
 * @rawTag calendar-month-view
 * @summary Internal month view component for the calendar.
 *
 * The month is an ARIA grid: one row per week, one gridcell per day labelled with its full date.
 * Each event is owned (`aria-owns`) by the cell of the day it starts on in that week.
 *
 * @fires event-click - Internal, does not bubble; `wc-calendar` re-fires it. Detail contains `{ event }`.
 */
@IndividualComponent
export class CalendarMonthView extends LitElement {
  // ── Static

  static styles = [styles];

  // ── Properties

  /** Events to lay out. */
  @property({ type: Array })
  events: CalendarEvent[] = [];

  /** Events are shown but cannot be clicked or focused. */
  @property({ type: Boolean, attribute: 'events-readonly' })
  eventsReadonly: boolean = false;

  /**
   * Whether events are clickable.
   * @deprecated Use `events-readonly`.
   */
  @property({ type: Boolean, attribute: 'event-clickable' })
  eventClickable: boolean = true;

  /** Now, which marks today. */
  @property({ type: Object, attribute: false })
  currentTime: Date = new Date();

  /** A date in the month to show. */
  @property({ type: Object, attribute: false })
  contextDate: Date = new Date();

  /** First day of the week, 0 (Sunday) to 6. */
  @property({ type: Number, attribute: false })
  weekStartsOn: WeekDay = 1;

  /** Locale for day names and numbers. Defaults to the nearest `lang`, then the browser language. */
  @property({ type: String })
  locale: string = '';

  // ── State

  /** First and last day shown (six whole weeks). */
  @state()
  private dateRange: { startDate: Date; endDate: Date; totalDays: number } = {
    startDate: new Date(),
    endDate: new Date(),
    totalDays: 42,
  };

  /** Event rows per week. */
  @state()
  private weekDayEvents: ColumnEvent[][][] = [];

  // ── Lifecycle

  override connectedCallback() {
    super.connectedCallback();
    this._processEvents();
  }

  override firstUpdated() {
    const viewBody = this.renderRoot.querySelector('.view-body');
    if (viewBody) {
      const viewBodyHeight = viewBody.scrollHeight;
      viewBody.scrollTo({
        top: (getTimePercent(this.currentTime) / 100) * viewBodyHeight - 150,
      });
    }
  }

  override willUpdate(changed: PropertyValues<this>) {
    super.willUpdate(changed);
    if (changed.has('eventClickable') && !this.eventClickable) {
      deprecate(
        'wc-calendar-month-view',
        '`event-clickable`',
        '`events-readonly`',
      );
    }
    if (
      changed.has('events') ||
      changed.has('contextDate') ||
      changed.has('weekStartsOn')
    ) {
      this._processEvents();
    }
  }

  // ── Private methods

  private get _interactive(): boolean {
    return !this.eventsReadonly && this.eventClickable;
  }

  private _processEvents() {
    this.dateRange = calculateMonthRange(this.contextDate, this.weekStartsOn);
    this.weekDayEvents = [];

    for (
      let i = new Date(this.dateRange.startDate), j = 0;
      j < 6;
      i = addDays(i, 7), j += 1
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

  /** Custom properties that colour an event with a palette `color`. */
  private _colorVars(color: string): Record<string, string> {
    return {
      '--calendar-event-bg-color': `var(--color-${color}-container)`,
      '--calendar-event-bg-color--hover': `var(--color-inverse-${color})`,
      '--calendar-event-border-color': `var(--color-${color})`,
      '--calendar-event-text-color': `var(--color-on-${color}-container)`,
      '--calendar-event-text-color--hover': `var(--color-on-${color})`,
    };
  }

  private _emitEventClick(event: unknown) {
    this.dispatchEvent(new CustomEvent('event-click', { detail: { event } }));
  }

  /** The locale day names and numbers are formatted in. */
  private get _locale(): string {
    return resolveLocale(this.locale, this);
  }

  /** The week's events with ids and the day (0–6) each starts on within the week. */
  private _placeEvents(weekIndex: number, weekStartDate: Date): PlacedEvent[] {
    const placed: PlacedEvent[] = [];
    this.weekDayEvents[weekIndex]?.forEach((nodes, rowIndex) =>
      nodes.forEach((node, nodeIndex) => {
        const offset = differenceInDays(startOfDay(node.start), weekStartDate);
        placed.push({
          node,
          id: `event-${weekIndex}-${rowIndex}-${nodeIndex}`,
          dayIndex: Math.min(Math.max(offset, 0), 6),
        });
      }),
    );
    return placed;
  }

  private _styleMap(declarations: Record<string, string>): string {
    return Object.entries(declarations)
      .map(([k, v]) => `${k}:${v}`)
      .join(';');
  }

  // ── Render helpers

  private _renderHeader() {
    const locale = this._locale;
    const columns = [];
    for (
      let i = new Date(this.dateRange.startDate), j = 0;
      j < 7;
      i = addDays(i, 1), j += 1
    ) {
      columns.push(html`
        <div class="column" role="columnheader">
          <div class="column-content">
            <div class="day">${formatDate(i, 'EEEE', locale)}</div>
          </div>
        </div>
      `);
    }
    return columns;
  }

  private _renderDayCells(sd: Date, placed: PlacedEvent[]) {
    const locale = this._locale;
    const long = new Intl.DateTimeFormat(locale, { dateStyle: 'full' });
    const columns = [];
    for (let i = new Date(sd), j = 0; j < 7; i = addDays(i, 1), j += 1) {
      const owned = placed
        .filter(p => p.dayIndex === j)
        .map(p => p.id)
        .join(' ');
      const today = this._getDayClass(i).includes('today');
      columns.push(html`
        <div
          class=${this._getDayClass(i)}
          role="gridcell"
          aria-label=${long.format(i)}
          aria-current=${today ? 'date' : nothing}
          aria-owns=${owned || nothing}
        >
          <div class="column-content">
            <div class="column-header" aria-hidden="true">
              <div class="day">${formatDate(i, 'd', locale)}</div>
            </div>
          </div>
        </div>
      `);
    }
    return columns;
  }

  private _renderEvent(placed: PlacedEvent, weekStartDate: Date) {
    const { node, id } = placed;
    const interactive = this._interactive;
    const evtStyles: Record<string, string> = {
      left: `${this._getDatePercent(node.start, weekStartDate) + LONG_EVENT_PADDING}%`,
      width: `${this._getDatePercent(addDays(node.end, 1), weekStartDate) - this._getDatePercent(node.start, weekStartDate) - 2 * LONG_EVENT_PADDING}%`,
      ...(node.color ? this._colorVars(node.color) : {}),
    };
    const activate = () => this._emitEventClick(node.data);
    return html`
      <div
        id=${id}
        class=${interactive ? 'event clickable' : 'event'}
        style=${this._styleMap(evtStyles)}
        role=${interactive ? 'button' : 'note'}
        tabindex=${interactive ? '0' : nothing}
        aria-label=${formatEventLabel(
          node.title,
          node.start,
          node.end,
          this._locale,
          node.length() >= 86400000,
        )}
        @click=${() => {
          if (interactive) activate();
        }}
        @keydown=${interactive ? onActivateKey(activate) : nothing}
      >
        <div class="event-title" aria-hidden="true">
          ${node.title || '(no title)'}
        </div>
      </div>
    `;
  }

  private _renderWeeks() {
    return this.weekDayEvents.map((eventDay, index) => {
      const weekStartDate = addDays(this.dateRange.startDate, index * 7);
      const placed = this._placeEvents(index, weekStartDate);
      const byNode = new Map(placed.map(p => [p.node, p]));
      return html`
        <div class="multi-day-section" role="row">
          <div class="multi-day-body-scroll">
            <div class="multi-day-background">
              <div class="columns">
                ${this._renderDayCells(weekStartDate, placed)}
              </div>
            </div>
            <div class="multi-events">
              <div class="row-content">
                ${eventDay.map(
                  nodes => html`
                    <div class="row">
                      ${nodes.map(node => {
                        const entry = byNode.get(node);
                        return entry
                          ? this._renderEvent(entry, weekStartDate)
                          : nothing;
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

  // ── Render

  render() {
    const context = this.contextDate;
    const label = new Intl.DateTimeFormat(this._locale, {
      month: 'long',
      year: 'numeric',
    }).format(context);
    return html`
      <div
        class="calendar-month-view"
        role="grid"
        aria-label=${label}
        aria-readonly="true"
      >
        <div class="view-header">
          <div class="columns" role="row">${this._renderHeader()}</div>
          <div class="scrollbar-placeholder"></div>
        </div>
        <div class="view-body">
          <div class="view-body-scroll">
            <div class="drawing-area">${this._renderWeeks()}</div>
          </div>
        </div>
      </div>
    `;
  }
}
