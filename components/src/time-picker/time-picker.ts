import { LitElement, html, nothing, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import IndividualComponent from '@/IndividualComponent.js';
import {
  type HourCycle,
  type TimeParts,
  dayPeriodNames,
  parseIsoTime,
  resolveHourCycle,
  toIsoTime,
} from '@/__internal/utils/date.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import styles from './time-picker.scss';

type Column = 'hour' | 'minute' | 'second' | 'period';

interface Option {
  value: number;
  label: string;
  disabled: boolean;
}

const pad = (n: number) => String(n).padStart(2, '0');

const toSeconds = ({ hour, minute, second }: TimeParts) =>
  hour * 3600 + minute * 60 + second;

/**
 * @label Time Picker
 * @tag wc-time-picker
 * @rawTag time-picker
 *
 * @summary Scrollable columns for picking a time of day.
 * @overview
 * <p>Time picker shows a column each for hours, minutes, optional seconds and, on a 12-hour
 * clock, AM/PM. Click an entry, or use the arrow keys: Up and Down change the focused column, Left
 * and Right move between columns, and Enter commits. It is the picker inside
 * <code>wc-time-field</code> and can also be placed inline.</p>
 * <p>Values are 24-hour ISO times (<code>09:30</code>, or <code>09:30:15</code> with
 * <code>seconds</code>), whatever the display.</p>
 * <p>It is a building block, not a form control: it has no <code>name</code> and is not submitted
 * with a form. In a form, use <code>wc-time-field</code> or <code>wc-datetime-field</code>.</p>
 *
 * @cssprop --time-picker-height - Height of the columns. Defaults to 14rem.
 *
 * @fires {CustomEvent<{value: string}>} input - Dispatched when an hour, minute or second is picked.
 * @fires {CustomEvent<{value: string}>} change - Dispatched when the last column is picked or Enter is pressed.
 *
 * @example
 * ```html
 * <wc-time-picker value="09:30" minute-step="15"></wc-time-picker>
 * ```
 * @tags input
 */
@IndividualComponent
export class TimePicker extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** The time as `HH:mm` (or `HH:mm:ss` with `seconds`), 24-hour. Empty when none is picked. */
  @property({ type: String }) value = '';

  /** Minutes between entries in the minute column, such as 15 for 00, 15, 30 and 45. */
  @property({ type: Number, attribute: 'minute-step' }) minuteStep = 1;

  /** The value's format: `HH:mm:ss` with seconds (and a seconds column), else `HH:mm`. */
  @property({ type: Boolean }) seconds = false;

  /** `h12` shows 1–12 with AM/PM, `h23` shows 0–23; defaults to the locale's. */
  @property({ type: String, attribute: 'hour-cycle' }) hourCycle?: HourCycle;

  /** Earliest time that can be picked (`HH:mm`). */
  @property({ type: String }) min = '';

  /** Latest time that can be picked (`HH:mm`). */
  @property({ type: String }) max = '';

  /** BCP 47 locale for AM/PM names and the default hour cycle. */
  @property({ type: String }) locale = '';

  /** Disables the picker: no time can be focused or picked. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Shows the selected time but stops the user changing it. */
  @property({ type: Boolean, reflect: true }) readonly = false;

  // ── State ────────────────────────────────────────────────────────────────

  /** The column holding the tab stop. */
  @state() private activeColumn: Column = 'hour';

  // ── Private fields ───────────────────────────────────────────────────────

  /** Peacock's strings for the column labels, and the resolved locale. */
  private readonly i18n = new I18nController(this);

  // ── Lifecycle ────────────────────────────────────────────────────────────

  protected override updated(changed: Map<PropertyKey, unknown>) {
    if (changed.has('value')) this.scrollToSelected();
  }

  // ── Public methods ───────────────────────────────────────────────────────

  /** Moves focus to the active column and scrolls every column to its selected entry. */
  override focus() {
    this.scrollToSelected();
    this.columnFor(this.activeColumn)?.focus();
  }

  /**
   * Scrolls each column so its selected entry (or, with no value, the current time's) sits in
   * the middle row, so the picked time reads across the columns.
   */
  scrollToSelected() {
    this.columnElements.forEach(column => {
      const anchor = column.querySelector<HTMLElement>('.option.anchor');
      if (!anchor) return;
      const top =
        anchor.offsetTop - (column.clientHeight - anchor.offsetHeight) / 2;
      column.scrollTo({ top });
    });
  }

  // ── Private getters ──────────────────────────────────────────────────────

  private get columnElements(): HTMLElement[] {
    return Array.from(this.renderRoot.querySelectorAll<HTMLElement>('.column'));
  }

  private get resolvedHourCycle(): HourCycle {
    return resolveHourCycle(this.hourCycle, this.i18n.locale);
  }

  private get columns(): Column[] {
    const columns: Column[] = ['hour', 'minute'];
    if (this.seconds) columns.push('second');
    if (this.resolvedHourCycle === 'h12') columns.push('period');
    return columns;
  }

  /** The picked time, or the current time when none is picked so a first pick has a base. */
  private get parts(): TimeParts {
    const parsed = parseIsoTime(this.value);
    if (parsed) return parsed;
    const now = new Date();
    const step = Math.max(1, this.minuteStep);
    return {
      hour: now.getHours(),
      minute: Math.floor(now.getMinutes() / step) * step,
      second: 0,
    };
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private columnFor(column: Column): HTMLElement | undefined {
    return this.columnElements.find(el => el.dataset.column === column);
  }

  private withColumn(
    parts: TimeParts,
    column: Column,
    value: number,
  ): TimeParts {
    switch (column) {
      case 'hour':
        if (this.resolvedHourCycle === 'h12') {
          const pm = parts.hour >= 12;
          return { ...parts, hour: (value % 12) + (pm ? 12 : 0) };
        }
        return { ...parts, hour: value };
      case 'minute':
        return { ...parts, minute: value };
      case 'second':
        return { ...parts, second: value };
      default:
        return { ...parts, hour: (parts.hour % 12) + (value ? 12 : 0) };
    }
  }

  /** Whether any time in [from, to] (seconds since midnight) is within min/max. */
  private spanAllowed(from: number, to: number): boolean {
    const min = parseIsoTime(this.min);
    const max = parseIsoTime(this.max);
    return !(min && to < toSeconds(min)) && !(max && from > toSeconds(max));
  }

  private optionDisabled(column: Column, value: number): boolean {
    if (!this.min && !this.max) return false;
    const next = this.withColumn(this.parts, column, value);
    const at = toSeconds(next);
    if (column === 'hour') {
      return !this.spanAllowed(next.hour * 3600, next.hour * 3600 + 3599);
    }
    if (column === 'period') {
      const start = value ? 12 * 3600 : 0;
      return !this.spanAllowed(start, start + 12 * 3600 - 1);
    }
    if (column === 'minute')
      return !this.spanAllowed(at - next.second, at - next.second + 59);
    return !this.spanAllowed(at, at);
  }

  private options(column: Column): Option[] {
    const h12 = this.resolvedHourCycle === 'h12';
    let values: Array<[number, string]>;
    if (column === 'hour') {
      values = h12
        ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(h => [h % 12, String(h)])
        : Array.from({ length: 24 }, (_, h) => [h, pad(h)]);
    } else if (column === 'period') {
      const [am, pm] = dayPeriodNames(this.i18n.locale);
      values = [
        [0, am],
        [1, pm],
      ];
    } else {
      const step =
        column === 'minute' ? Math.max(1, Math.min(60, this.minuteStep)) : 1;
      values = Array.from({ length: Math.ceil(60 / step) }, (_, i) => [
        i * step,
        pad(i * step),
      ]);
    }
    return values.map(([value, label]) => ({
      value,
      label,
      disabled: this.optionDisabled(column, value),
    }));
  }

  /** The entry a column shows for a time. */
  private columnValue(column: Column, parts: TimeParts): number {
    switch (column) {
      case 'hour':
        return this.resolvedHourCycle === 'h12' ? parts.hour % 12 : parts.hour;
      case 'minute':
        return parts.minute;
      case 'second':
        return parts.second;
      default:
        return parts.hour >= 12 ? 1 : 0;
    }
  }

  private selectedValue(column: Column): number | null {
    const parsed = parseIsoTime(this.value);
    return parsed ? this.columnValue(column, parsed) : null;
  }

  private emit(type: 'input' | 'change', value: string) {
    this.value = value;
    this.dispatchEvent(
      new CustomEvent(type, {
        detail: { value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private pick(column: Column, value: number, commit: boolean) {
    if (this.disabled || this.readonly) return;
    this.activeColumn = column;
    const next = toIsoTime(
      this.withColumn(this.parts, column, value),
      this.seconds,
    );
    const last = this.columns[this.columns.length - 1];
    this.emit(commit || column === last ? 'change' : 'input', next);
  }

  private handleKeyDown(event: KeyboardEvent, column: Column) {
    const { columns } = this;
    const index = columns.indexOf(column);
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const next = columns[index + (event.key === 'ArrowLeft' ? -1 : 1)];
      if (next) {
        this.activeColumn = next;
        this.columnFor(next)?.focus();
      }
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      this.emit('change', toIsoTime(this.parts, this.seconds));
      return;
    }
    const keys = ['ArrowUp', 'ArrowDown', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const options = this.options(column).filter(o => !o.disabled);
    if (!options.length) return;
    const current = this.selectedValue(column);
    const at = options.findIndex(o => o.value === current);
    let target: number;
    if (event.key === 'Home') target = 0;
    else if (event.key === 'End') target = options.length - 1;
    else if (at === -1) target = 0;
    else {
      const delta = event.key === 'ArrowUp' ? -1 : 1;
      target = (at + delta + options.length) % options.length;
    }
    this.pick(column, options[target].value, false);
  }

  // ── Render ───────────────────────────────────────────────────────────────

  private renderColumn(column: Column): TemplateResult {
    const labelKeys = {
      hour: 'hours',
      minute: 'minutes',
      second: 'seconds',
      period: 'dayPeriod',
    } as const;
    const selected = this.selectedValue(column);
    // The entry each column scrolls to: the picked one, or the current time's.
    const anchor = selected ?? this.columnValue(column, this.parts);
    const id = (value: number) => `${column}-${value}`;
    return html`
      <div
        class=${classMap({ column: true, [`column-${column}`]: true })}
        data-column=${column}
        role="listbox"
        aria-label=${this.i18n.t(labelKeys[column])}
        aria-activedescendant=${selected === null ? nothing : id(selected)}
        aria-disabled=${this.disabled ? 'true' : nothing}
        tabindex=${!this.disabled && column === this.activeColumn ? 0 : -1}
        @focus=${() => {
          this.activeColumn = column;
        }}
        @keydown=${(event: KeyboardEvent) => this.handleKeyDown(event, column)}
      >
        ${this.options(column).map(
          // The listbox owns the keyboard (aria-activedescendant); options only take clicks.
          /* eslint-disable lit-a11y/click-events-have-key-events */
          option => html`
            <div
              id=${id(option.value)}
              class=${classMap({
                option: true,
                selected: option.value === selected,
                anchor: option.value === anchor,
              })}
              role="option"
              aria-selected=${option.value === selected ? 'true' : 'false'}
              aria-disabled=${option.disabled ? 'true' : nothing}
              @click=${() =>
                !option.disabled && this.pick(column, option.value, false)}
            >
              ${option.label}
            </div>
          `,
          /* eslint-enable lit-a11y/click-events-have-key-events */
        )}
      </div>
    `;
  }

  render() {
    return html`
      <div class=${classMap({ 'time-picker': true, disabled: this.disabled })}>
        ${this.columns.map(column => this.renderColumn(column))}
      </div>
    `;
  }
}
