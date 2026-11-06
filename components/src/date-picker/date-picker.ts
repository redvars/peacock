import { LitElement, html, nothing, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import IndividualComponent from '@/IndividualComponent.js';
import {
  type WeekDay,
  addDaysIso,
  addMonthsIso,
  buildMonthGrid,
  clampIso,
  formatDateLong,
  formatMonthYear,
  isWithin,
  monthNames,
  parseIsoDate,
  parseRange,
  resolveLocale,
  toIsoDate,
  toRange,
  todayIso,
  weekStart,
  weekdayNames,
} from '@/__internal/utils/date.js';
import styles from './date-picker.scss';

type View = 'day' | 'month' | 'year';

/**
 * @label Date Picker
 * @tag wc-date-picker
 * @rawTag date-picker
 *
 * @summary A calendar for picking a date or a date range.
 * @overview
 * <p>Date picker shows a month of days. Pick a day with the pointer or the keyboard; switch to a
 * month or year grid from the header to jump further. With <code>range</code> it picks a start and
 * an end date. It is the calendar inside <code>wc-date-field</code> and can also be placed inline.</p>
 * <p>Values are ISO dates (<code>2026-11-06</code>); a range is <code>start/end</code>.</p>
 *
 * @cssprop --date-picker-cell-size - Size of a day cell. Defaults to 2.5rem.
 *
 * @fires {CustomEvent<{value: string}>} input - Dispatched when the start of a range is picked.
 * @fires {CustomEvent<{value: string}>} change - Dispatched when a date, or the end of a range, is picked, or the value is cleared.
 *
 * @example
 * ```html
 * <wc-date-picker value="2026-11-06"></wc-date-picker>
 * ```
 * @example
 * ```html
 * <wc-date-picker range months="2" value="2026-11-03/2026-11-09"></wc-date-picker>
 * ```
 * @tags input
 */
@IndividualComponent
export class DatePicker extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** The picked date (`YYYY-MM-DD`), or `start/end` with `range`. Empty when nothing is picked. */
  @property({ type: String, reflect: true }) value = '';

  /** Picks a start and an end date instead of a single date. */
  @property({ type: Boolean, reflect: true }) range = false;

  /** Earliest date that can be picked (`YYYY-MM-DD`). */
  @property({ type: String }) min = '';

  /** Latest date that can be picked (`YYYY-MM-DD`). */
  @property({ type: String }) max = '';

  /** BCP 47 locale for names and the first day of the week; defaults to the page language. */
  @property({ type: String }) locale = '';

  /** First day of the week, 0 (Sunday) to 6; defaults to the locale's. */
  @property({ type: Number, attribute: 'first-day-of-week' })
  firstDayOfWeek?: WeekDay;

  /** Number of months shown side by side: 1 or 2. */
  @property({ type: Number }) months: 1 | 2 = 1;

  /** Leaves the days of neighbouring months blank. Always on when two months are shown. */
  @property({ type: Boolean, attribute: 'hide-outside-days' })
  hideOutsideDays = false;

  /** Shows Today and Clear buttons below the calendar. */
  @property({ type: Boolean, attribute: 'show-actions' }) showActions = false;

  @property({ type: Boolean, reflect: true }) disabled = false;

  @property({ type: Boolean, reflect: true }) readonly = false;

  /** Return true for dates that cannot be picked, such as holidays. */
  @property({ attribute: false }) isDateDisabled?: (iso: string) => boolean;

  // ── State ────────────────────────────────────────────────────────────────

  @state() private view: View = 'day';

  /** First shown month, as year and 1-based month. */
  @state() private viewYear = 0;

  @state() private viewMonth = 0;

  /** The date holding the roving tab stop. */
  @state() private activeDate = '';

  /** While choosing a range end, the day under the pointer or keyboard focus. */
  @state() private hoverDate = '';

  // ── Private fields ───────────────────────────────────────────────────────

  /** The value this picker last emitted, so its own updates do not move the view. */
  private emittedValue: string | null = null;

  /** Set when the keyboard moved the active date, so focus follows it after render. */
  private focusAfterRender = false;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  protected override willUpdate(changed: Map<PropertyKey, unknown>) {
    if (changed.has('value') && this.value !== this.emittedValue) {
      this.emittedValue = null;
      this.hoverDate = '';
      this.moveTo(this.initialDate());
    }
    if (!this.viewYear) this.moveTo(this.initialDate());
    // The tab stop must be on screen: when the view moved away from the active date, carry the
    // active date into the first shown month.
    if (this.view === 'day' && !this.activeDateShown()) {
      this.activeDate = this.dateInView(this.activeDate);
    }
  }

  protected override updated() {
    if (this.focusAfterRender) {
      this.focusAfterRender = false;
      this.focusActive();
    }
  }

  // ── Public methods ───────────────────────────────────────────────────────

  /** Moves focus to the active day (or month or year). */
  override focus() {
    this.focusActive();
  }

  // ── Private getters ──────────────────────────────────────────────────────

  private get resolvedLocale() {
    return resolveLocale(this.locale);
  }

  private get firstDay(): WeekDay {
    return this.firstDayOfWeek ?? weekStart(this.resolvedLocale);
  }

  private get rangeValue(): [string, string] {
    return parseRange(this.value);
  }

  /** True after a range start is picked and before its end is. */
  private get choosingEnd() {
    const [start, end] = this.rangeValue;
    return this.range && !!start && !end;
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private initialDate(): string {
    const picked = this.range ? this.rangeValue[0] : this.value;
    const base = parseIsoDate(picked) ? picked : todayIso();
    return clampIso(base, this.min || undefined, this.max || undefined);
  }

  private moveTo(iso: string) {
    this.activeDate = iso;
    const parts = parseIsoDate(iso);
    if (!parts) return;
    const shownIndex = this.viewYear * 12 + this.viewMonth - 1;
    const targetIndex = parts.year * 12 + parts.month - 1;
    // Keep the view when the date is already on screen (the second of two months).
    if (targetIndex < shownIndex || targetIndex >= shownIndex + this.months) {
      this.viewYear = parts.year;
      this.viewMonth = parts.month;
    }
  }

  /** The shown months as [year, month] pairs. */
  private shownMonths(): Array<readonly [number, number]> {
    return Array.from({ length: this.months }, (_, i) => {
      const index = this.viewYear * 12 + this.viewMonth - 1 + i;
      return [Math.floor(index / 12), (index % 12) + 1] as const;
    });
  }

  private activeDateShown(): boolean {
    const active = parseIsoDate(this.activeDate);
    return (
      !!active &&
      this.shownMonths().some(
        ([y, m]) => y === active.year && m === active.month,
      )
    );
  }

  private isDisabledDate(iso: string): boolean {
    return (
      !isWithin(iso, this.min || undefined, this.max || undefined) ||
      !!this.isDateDisabled?.(iso)
    );
  }

  private emit(type: 'input' | 'change', value: string) {
    this.value = value;
    this.emittedValue = value;
    this.dispatchEvent(
      new CustomEvent(type, {
        detail: { value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private select(iso: string) {
    if (this.disabled || this.readonly || this.isDisabledDate(iso)) return;
    this.moveTo(iso);
    if (!this.range) {
      this.emit('change', iso);
      return;
    }
    if (this.choosingEnd) {
      const [start] = this.rangeValue;
      this.hoverDate = '';
      this.emit(
        'change',
        iso < start ? toRange(iso, start) : toRange(start, iso),
      );
    } else {
      this.emit('input', toRange(iso, ''));
    }
  }

  private shiftView(step: number) {
    if (this.view === 'day') {
      const index = this.viewYear * 12 + this.viewMonth - 1 + step;
      this.viewYear = Math.floor(index / 12);
      this.viewMonth = (index % 12) + 1;
    } else {
      this.viewYear += step * (this.view === 'month' ? 1 : 10);
    }
  }

  private cycleView() {
    const next: Record<View, View> = {
      day: 'month',
      month: 'year',
      year: 'day',
    };
    this.view = next[this.view];
  }

  private focusActive() {
    const target = this.renderRoot.querySelector<HTMLElement>(
      '[tabindex="0"].cell',
    );
    target?.focus();
  }

  private moveActive(iso: string, direction: 1 | -1) {
    let next = clampIso(iso, this.min || undefined, this.max || undefined);
    // Step past disabled dates in the direction of travel, for at most a year.
    for (let i = 0; i < 366 && this.isDisabledDate(next); i += 1) {
      next = addDaysIso(next, direction);
    }
    if (this.isDisabledDate(next)) return;
    this.moveTo(next);
    if (this.choosingEnd) this.hoverDate = next;
    this.focusAfterRender = true;
  }

  private handleDayKeyDown(event: KeyboardEvent) {
    const iso = this.activeDate;
    const dayOfWeek =
      (new Date(`${iso}T00:00`).getDay() - this.firstDay + 7) % 7;
    const moves: Record<string, () => [string, 1 | -1]> = {
      ArrowLeft: () => [addDaysIso(iso, -1), -1],
      ArrowRight: () => [addDaysIso(iso, 1), 1],
      ArrowUp: () => [addDaysIso(iso, -7), -1],
      ArrowDown: () => [addDaysIso(iso, 7), 1],
      Home: () => [addDaysIso(iso, -dayOfWeek), -1],
      End: () => [addDaysIso(iso, 6 - dayOfWeek), 1],
      PageUp: () => [addMonthsIso(iso, event.shiftKey ? -12 : -1), -1],
      PageDown: () => [addMonthsIso(iso, event.shiftKey ? 12 : 1), 1],
    };
    if (event.key in moves) {
      event.preventDefault();
      const [next, direction] = moves[event.key]();
      this.moveActive(next, direction);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.select(iso);
    }
  }

  private handleGridKeyDown(event: KeyboardEvent, kind: 'month' | 'year') {
    const steps: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -3,
      ArrowDown: 3,
    };
    if (event.key in steps) {
      event.preventDefault();
      if (kind === 'month') {
        const index =
          this.viewYear * 12 + this.viewMonth - 1 + steps[event.key];
        this.viewYear = Math.floor(index / 12);
        this.viewMonth = (index % 12) + 1;
      } else {
        this.viewYear += steps[event.key];
      }
      this.focusAfterRender = true;
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (kind === 'month') this.pickMonth(this.viewMonth);
      else this.pickYear(this.viewYear);
    } else if (event.key === 'Escape' && this.view !== 'day') {
      event.stopPropagation();
      this.view = 'day';
      this.focusAfterRender = true;
    }
  }

  private pickMonth(month: number) {
    this.viewMonth = month;
    this.view = 'day';
    this.activeDate = this.dateInView(this.activeDate);
    this.focusAfterRender = true;
  }

  private pickYear(year: number) {
    this.viewYear = year;
    this.view = 'month';
    this.focusAfterRender = true;
  }

  /** The active day moved into the shown month, keeping its day number where it can. */
  private dateInView(iso: string): string {
    const day = parseIsoDate(iso)?.day ?? 1;
    const last = new Date(this.viewYear, this.viewMonth, 0).getDate();
    const candidate = toIsoDate({
      year: this.viewYear,
      month: this.viewMonth,
      day: Math.min(day, last),
    });
    return clampIso(candidate, this.min || undefined, this.max || undefined);
  }

  private monthDisabled(year: number, month: number) {
    const first = toIsoDate({ year, month, day: 1 });
    const last = toIsoDate({
      year,
      month,
      day: new Date(year, month, 0).getDate(),
    });
    return (!!this.max && first > this.max) || (!!this.min && last < this.min);
  }

  private yearDisabled(year: number) {
    return (
      (!!this.max && `${year}-01-01` > this.max) ||
      (!!this.min && `${year}-12-31` < this.min)
    );
  }

  private handleToday() {
    const today = todayIso();
    this.moveTo(today);
    this.view = 'day';
    if (!this.range) this.select(today);
    this.focusAfterRender = true;
  }

  private handleClear() {
    this.hoverDate = '';
    this.emit('change', '');
  }

  // ── Render ───────────────────────────────────────────────────────────────

  private renderHeader(): TemplateResult {
    const locale = this.resolvedLocale;
    let label: string;
    if (this.view === 'year') {
      const start = Math.floor(this.viewYear / 10) * 10;
      label = `${start} – ${start + 9}`;
    } else if (this.view === 'month') {
      label = String(this.viewYear);
    } else if (this.months === 2) {
      label = new Intl.DateTimeFormat(locale, {
        month: 'long',
        year: 'numeric',
      }).formatRange(
        new Date(this.viewYear, this.viewMonth - 1, 1),
        new Date(this.viewYear, this.viewMonth, 1),
      );
    } else {
      label = formatMonthYear(this.viewYear, this.viewMonth, locale);
    }
    const unit = { day: 'month', month: 'year', year: 'decade' }[this.view];
    return html`
      <div class="header">
        <button
          class="view-button"
          type="button"
          aria-live="polite"
          ?disabled=${this.disabled}
          @click=${this.cycleView}
        >
          <span>${label}</span>
          <wc-icon
            class="view-chevron"
            name=${this.view === 'day' ? 'arrow_drop_down' : 'arrow_drop_up'}
          ></wc-icon>
        </button>
        <span class="nav">
          <wc-icon-button
            class="prev"
            shape="round"
            variant="text"
            color="secondary"
            size="sm"
            aria-label=${`Previous ${unit}`}
            ?disabled=${this.disabled}
            @click=${() => this.shiftView(-1)}
          >
            <wc-icon name="chevron_left"></wc-icon>
          </wc-icon-button>
          <wc-icon-button
            class="next"
            shape="round"
            variant="text"
            color="secondary"
            size="sm"
            aria-label=${`Next ${unit}`}
            ?disabled=${this.disabled}
            @click=${() => this.shiftView(1)}
          >
            <wc-icon name="chevron_right"></wc-icon>
          </wc-icon-button>
        </span>
      </div>
    `;
  }

  private renderMonth(year: number, month: number): TemplateResult {
    const locale = this.resolvedLocale;
    const today = todayIso();
    const [start, end] = this.range ? this.rangeValue : [this.value, ''];
    const hideOutside = this.hideOutsideDays || this.months > 1;
    // The band runs to the hovered day while the end of a range is being chosen.
    const bandEnd = this.choosingEnd ? this.hoverDate : end;
    const [low, high] =
      bandEnd && bandEnd < start ? [bandEnd, start] : [start, bandEnd];
    const shortNames = weekdayNames(locale, this.firstDay, 'short');
    const longNames = weekdayNames(locale, this.firstDay, 'long');
    const grid = buildMonthGrid(year, month, this.firstDay);

    return html`
      <table
        class="month"
        role="grid"
        aria-label=${formatMonthYear(year, month, locale)}
      >
        <thead>
          <tr>
            ${shortNames.map(
              (name, i) =>
                html`<th scope="col" abbr=${longNames[i]}>${name}</th>`,
            )}
          </tr>
        </thead>
        <tbody>
          ${grid.map(
            week => html`
              <tr>
                ${week.map(cell => {
                  if (!cell.inMonth && hideOutside) {
                    return html`<td role="presentation"></td>`;
                  }
                  const { iso } = cell;
                  const disabled = this.isDisabledDate(iso);
                  const selected = iso === start || (this.range && iso === end);
                  const inBand =
                    this.range && !!low && !!high && iso >= low && iso <= high;
                  const tabStop = cell.inMonth && iso === this.activeDate;
                  return html`
                    <td
                      role="gridcell"
                      aria-selected=${selected ? 'true' : 'false'}
                      class=${classMap({
                        'in-range': inBand && low !== high,
                        'range-start': inBand && iso === low,
                        'range-end': inBand && iso === high,
                      })}
                    >
                      <button
                        type="button"
                        class=${classMap({
                          cell: true,
                          day: true,
                          outside: !cell.inMonth,
                          today: iso === today,
                          selected,
                        })}
                        data-date=${iso}
                        tabindex=${tabStop ? 0 : -1}
                        aria-label=${formatDateLong(iso, locale)}
                        aria-current=${iso === today ? 'date' : nothing}
                        aria-disabled=${disabled ? 'true' : nothing}
                        ?disabled=${this.disabled}
                        @click=${() => this.select(iso)}
                        @pointerenter=${() => {
                          if (this.choosingEnd && !disabled)
                            this.hoverDate = iso;
                        }}
                        @focus=${() => {
                          this.activeDate = iso;
                        }}
                        @keydown=${this.handleDayKeyDown}
                      >
                        ${cell.day}
                      </button>
                    </td>
                  `;
                })}
              </tr>
            `,
          )}
        </tbody>
      </table>
    `;
  }

  private renderDays(): TemplateResult {
    return html`
      <div class="months">
        ${this.shownMonths().map(([y, m]) => this.renderMonth(y, m))}
      </div>
    `;
  }

  private renderMonths(): TemplateResult {
    const names = monthNames(this.resolvedLocale, 'short');
    const current = parseIsoDate(todayIso());
    return html`
      <div class="choices" role="grid" aria-label=${String(this.viewYear)}>
        ${names.map((name, i) => {
          const month = i + 1;
          const disabled = this.monthDisabled(this.viewYear, month);
          return html`
            <button
              type="button"
              class=${classMap({
                cell: true,
                choice: true,
                today:
                  current?.year === this.viewYear && current.month === month,
                selected: month === this.viewMonth,
              })}
              role="gridcell"
              tabindex=${month === this.viewMonth ? 0 : -1}
              aria-selected=${month === this.viewMonth ? 'true' : 'false'}
              aria-disabled=${disabled ? 'true' : nothing}
              ?disabled=${this.disabled}
              @click=${() => !disabled && this.pickMonth(month)}
              @keydown=${(e: KeyboardEvent) =>
                this.handleGridKeyDown(e, 'month')}
            >
              ${name}
            </button>
          `;
        })}
      </div>
    `;
  }

  private renderYears(): TemplateResult {
    const decade = Math.floor(this.viewYear / 10) * 10;
    const years = Array.from({ length: 12 }, (_, i) => decade - 1 + i);
    const currentYear = new Date().getFullYear();
    return html`
      <div
        class="choices"
        role="grid"
        aria-label=${`${decade} – ${decade + 9}`}
      >
        ${years.map(year => {
          const disabled = this.yearDisabled(year);
          return html`
            <button
              type="button"
              class=${classMap({
                cell: true,
                choice: true,
                outside: year < decade || year > decade + 9,
                today: year === currentYear,
                selected: year === this.viewYear,
              })}
              role="gridcell"
              tabindex=${year === this.viewYear ? 0 : -1}
              aria-selected=${year === this.viewYear ? 'true' : 'false'}
              aria-disabled=${disabled ? 'true' : nothing}
              ?disabled=${this.disabled}
              @click=${() => !disabled && this.pickYear(year)}
              @keydown=${(e: KeyboardEvent) =>
                this.handleGridKeyDown(e, 'year')}
            >
              ${year}
            </button>
          `;
        })}
      </div>
    `;
  }

  private renderView(): TemplateResult {
    if (this.view === 'month') return this.renderMonths();
    if (this.view === 'year') return this.renderYears();
    return this.renderDays();
  }

  render() {
    return html`
      <div
        class=${classMap({
          'date-picker': true,
          disabled: this.disabled,
          [`view-${this.view}`]: true,
        })}
        @pointerleave=${() => {
          if (this.choosingEnd) this.hoverDate = '';
        }}
      >
        ${this.renderHeader()} ${this.renderView()}
        ${this.showActions
          ? html`
              <div class="actions">
                <wc-button
                  class="today-button"
                  variant="text"
                  size="sm"
                  ?disabled=${this.disabled || this.readonly}
                  @click=${this.handleToday}
                  >Today</wc-button
                >
                <wc-button
                  class="clear-button"
                  variant="text"
                  size="sm"
                  ?disabled=${this.disabled || this.readonly || !this.value}
                  @click=${this.handleClear}
                  >Clear</wc-button
                >
              </div>
            `
          : nothing}
      </div>
    `;
  }
}
