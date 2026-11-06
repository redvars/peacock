import { LitElement, html, nothing, PropertyValues, TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import {
  addDays,
  addHours,
  differenceInDays,
  startOfDay,
  endOfDay,
  calculateDateRange,
  formatDate,
  formatEventLabel,
  getTimePercent,
  LONG_EVENT_PADDING,
  onActivateKey,
} from './utils.js';
import { BaseEvent } from './base-event.js';
import { CalendarEvent } from './calendar-event.js';
import { EventManager } from './event-manager.js';
import type { ColumnEvent } from './event-manager.js';
import IndividualComponent from '@/IndividualComponent.js';
import { resolveLocale } from '@/__internal/i18n/locale.js';
import { deprecate } from '@/__internal/utils/deprecate.js';
import type { WeekDay } from '@/__internal/utils/date.js';
import styles from './calendar-column-view.scss';

/**
 * @internal Rendered by `wc-calendar`; not meant to be used on its own.
 *
 * @label Calendar Column View
 * @tag wc-calendar-column-view
 * @rawTag calendar-column-view
 * @summary Internal column view component for the calendar (day/week views).
 *
 * The view is a region labelled with the dates it shows. Day numbers in the header are buttons
 * that open the day; events are buttons labelled with their title and time.
 *
 * @fires date-click - Internal, does not bubble; a day number was chosen. Detail contains `{ date }`.
 * @fires event-click - Internal, does not bubble; `wc-calendar` re-fires it. Detail contains `{ event }`.
 */
@IndividualComponent
export class CalendarColumnView extends LitElement {
  // ── Static

  static styles = [styles];

  // ── Properties

  /** Events to lay out. */
  @property({ type: Array })
  events: CalendarEvent[] = [];

  /** The view's name; `week` aligns the range to the week start. */
  @property({ type: String })
  view: string = 'week';

  /** Number of day columns. */
  @property({ type: Number })
  days: number = 7;

  /** Events are shown but cannot be clicked or focused. */
  @property({ type: Boolean, attribute: 'events-readonly' })
  eventsReadonly: boolean = false;

  /**
   * Whether events are clickable.
   * @deprecated Use `events-readonly`.
   */
  @property({ type: Boolean, attribute: 'event-clickable' })
  eventClickable: boolean = true;

  /** Now, which places the current-time line and marks today. */
  @property({ type: Object, attribute: false })
  currentTime: Date = new Date();

  /** A date in the range to show. */
  @property({ type: Object, attribute: false })
  contextDate: Date = new Date();

  /** First day of the week, 0 (Sunday) to 6, for the `week` view. */
  @property({ type: Number, attribute: false })
  weekStartsOn: WeekDay = 1;

  /** Locale for day names and times. Defaults to the nearest `lang`, then the browser language. */
  @property({ type: String })
  locale: string = '';

  // ── State

  /** First and last day shown. */
  @state()
  private dateRange: { startDate: Date; endDate: Date; totalDays: number } = {
    startDate: new Date(),
    endDate: new Date(),
    totalDays: 7,
  };

  /** Timed events per day, keyed by `dd-MM-yyyy`. */
  @state()
  private singleDayEvents: Record<string, ColumnEvent[][]> = {};

  /** Rows of events lasting a day or more. */
  @state()
  private multiDayEvents: ColumnEvent[][] = [];

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
        'wc-calendar-column-view',
        '`event-clickable`',
        '`events-readonly`',
      );
    }
    if (
      changed.has('events') ||
      changed.has('contextDate') ||
      changed.has('view') ||
      changed.has('days') ||
      changed.has('weekStartsOn')
    ) {
      this._processEvents();
    }
  }

  // ── Private methods

  private get _interactive(): boolean {
    return !this.eventsReadonly && this.eventClickable;
  }

  /** The locale dates and times are formatted in. */
  private get _locale(): string {
    return resolveLocale(this.locale, this);
  }

  private _processEvents() {
    this.dateRange = calculateDateRange(
      this.view,
      this.contextDate,
      this.days,
      this.weekStartsOn,
    );
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

  private _emitDateClick(date: Date) {
    this.dispatchEvent(new CustomEvent('date-click', { detail: { date } }));
  }

  private _emitEventClick(event: unknown) {
    this.dispatchEvent(new CustomEvent('event-click', { detail: { event } }));
  }

  /** Accessible name of the view: the dates it shows. */
  private _rangeLabel(): string {
    const { startDate, endDate } = this.dateRange;
    const format = new Intl.DateTimeFormat(this._locale, { dateStyle: 'long' });
    if (differenceInDays(endDate, startDate) <= 0)
      return format.format(startDate);
    try {
      return format.formatRange(startDate, endDate);
    } catch {
      return `${format.format(startDate)} – ${format.format(endDate)}`;
    }
  }

  private _styleMap(declarations: Record<string, string>): string {
    return Object.entries(declarations)
      .map(([k, v]) => `${k}:${v}`)
      .join(';');
  }

  // ── Render helpers

  private _renderHeader() {
    const locale = this._locale;
    const long = new Intl.DateTimeFormat(locale, { dateStyle: 'full' });
    const columns: TemplateResult[] = [];
    this._forEachDayInRange(i => {
      const today = this._getDayClass(i).includes('today');
      const open = () => this._emitDateClick(i);
      columns.push(html`
        <div class=${this._getDayClass(i)}>
          <div class="column-content">
            <div
              class="date"
              role="button"
              tabindex="0"
              aria-label=${long.format(i)}
              aria-current=${today ? 'date' : nothing}
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

  private _renderMultiDayBackground() {
    const columns: TemplateResult[] = [];
    this._forEachDayInRange(i => {
      columns.push(html`<div class=${this._getDayClass(i)}></div>`);
    });
    return columns;
  }

  private _renderScale() {
    const locale = this._locale;
    const rows: TemplateResult[] = [];
    for (let i = 0; i < 48; i += 1) {
      const cls = i % 2 ? 'row hour' : 'row';
      const sd = startOfDay(new Date());
      rows.push(html`
        <div class=${cls}>
          ${i % 2 === 0 && i
            ? html`<div class="time">
                ${formatDate(addHours(sd, i / 2), 'hh a', locale)}
              </div>`
            : nothing}
        </div>
      `);
    }
    return html`<div class="background" aria-hidden="true">${rows}</div>`;
  }

  private _renderBackgroundGrid() {
    const rows: TemplateResult[] = [];
    for (let i = 0; i < 48; i += 1) {
      const cls = i % 2 ? 'row hour' : 'row';
      const columns: TemplateResult[] = [];
      this._forEachDayInRange(d => {
        columns.push(html`<div class=${this._getDayClass(d)}></div>`);
      });
      rows.push(html`<div class=${cls}>${columns}</div>`);
    }
    return html`<div class="background" aria-hidden="true">${rows}</div>`;
  }

  /** One event block; `allDay` marks events lasting a day or more. */
  private _renderEvent(
    node: ColumnEvent,
    position: Record<string, string>,
    allDay: boolean,
  ) {
    const interactive = this._interactive;
    const declarations = node.color
      ? { ...position, ...this._colorVars(node.color) }
      : position;
    const activate = () => this._emitEventClick(node.data);
    return html`
      <div
        class=${interactive ? 'event clickable' : 'event'}
        style=${this._styleMap(declarations)}
        role=${interactive ? 'button' : 'note'}
        tabindex=${interactive ? '0' : nothing}
        aria-label=${formatEventLabel(
          node.title,
          node.start,
          node.end,
          this._locale,
          allDay,
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

  private _renderEvents() {
    const columns: TemplateResult[] = [];
    this._forEachDayInRange(i => {
      const cls = this._getDayClass(i);
      const eventDay = this.singleDayEvents[this._getDateOnly(i)];
      columns.push(html`
        <div class=${cls}>
          <div class="column-content">
            ${eventDay
              ? eventDay.map((nodes, columnIndex) =>
                  nodes.map(node =>
                    this._renderEvent(
                      node,
                      {
                        top: `${getTimePercent(node.start, startOfDay(i))}%`,
                        height: `${getTimePercent(node.end, startOfDay(i)) - getTimePercent(node.start, startOfDay(i))}%`,
                        left: `${(columnIndex / eventDay.length) * 100}%`,
                        width: `calc(${((1 * node.width) / eventDay.length) * 100}% - 1px)`,
                      },
                      false,
                    ),
                  ),
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
              ${nodes.map(node =>
                this._renderEvent(
                  node,
                  {
                    left: `${this._getDatePercent(node.start) + LONG_EVENT_PADDING}%`,
                    width: `${this._getDatePercent(addDays(node.end, 1)) - this._getDatePercent(node.start) - 2 * LONG_EVENT_PADDING}%`,
                  },
                  true,
                ),
              )}
            </div>
          `,
        )}
        <div class="row-spacer"></div>
      </div>
    `;
  }

  private _renderCurrentTime() {
    if (
      this.currentTime.valueOf() < this.dateRange.startDate.valueOf() - 1 ||
      this.currentTime.valueOf() > this.dateRange.endDate.valueOf() + 1
    ) {
      return nothing;
    }
    return html`
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
          style="left: calc(${this._getDatePercent(
            this.currentTime,
          )}% - 0.25rem)"
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
    return html`
      <div
        class="calendar-column-view"
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
            <div class="multi-day-section">
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
