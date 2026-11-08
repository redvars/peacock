import { LitElement, type TemplateResult } from 'lit';
import type { PeacockStrings } from '../__internal/i18n/strings.js';
import { type WeekDay } from '../__internal/utils/date.js';
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
 * <p>It is a building block, not a form control: it has no <code>name</code> and is not submitted
 * with a form. In a form, use <code>wc-date-field</code> or <code>wc-datetime-field</code>.</p>
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
export declare class DatePicker extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /** The picked date (`YYYY-MM-DD`), or `start/end` with `range`. Empty when nothing is picked. */
    value: string;
    /** Picks a start and an end date instead of a single date. */
    range: boolean;
    /** Earliest date that can be picked (`YYYY-MM-DD`). */
    min: string;
    /** Latest date that can be picked (`YYYY-MM-DD`). */
    max: string;
    /** BCP 47 locale for names and the first day of the week; defaults to the page language. */
    locale: string;
    /** First day of the week, 0 (Sunday) to 6; defaults to the locale's. */
    firstDayOfWeek?: WeekDay;
    /** Number of months shown side by side: 1 or 2. */
    months: 1 | 2;
    /** Leaves the days of neighbouring months blank. Always on when two months are shown. */
    hideOutsideDays: boolean;
    /** Shows Today and Clear buttons below the calendar. */
    showActions: boolean;
    /** Disables the calendar: no date can be focused or picked. */
    disabled: boolean;
    /** Shows the selected date but stops the user changing it. */
    readonly: boolean;
    /** Return true for dates that cannot be picked, such as holidays. */
    isDateDisabled?: (iso: string) => boolean;
    /** Overrides Peacock's strings for this instance only. */
    strings?: Partial<PeacockStrings>;
    private view;
    /** First shown month, as year and 1-based month. */
    private viewYear;
    private viewMonth;
    /** The date holding the roving tab stop. */
    private activeDate;
    /** While choosing a range end, the day under the pointer or keyboard focus. */
    private hoverDate;
    /** The value this picker last emitted, so its own updates do not move the view. */
    private emittedValue;
    /** Set when the keyboard moved the active date, so focus follows it after render. */
    private focusAfterRender;
    /** Peacock's strings for the navigation and action buttons. */
    private readonly i18n;
    protected willUpdate(changed: Map<PropertyKey, unknown>): void;
    protected updated(): void;
    /** Moves focus to the active day (or month or year). */
    focus(): void;
    private get resolvedLocale();
    private get firstDay();
    private get rangeValue();
    /** True after a range start is picked and before its end is. */
    private get choosingEnd();
    private initialDate;
    private moveTo;
    /** The shown months as [year, month] pairs. */
    private shownMonths;
    private activeDateShown;
    private isDisabledDate;
    private emit;
    private select;
    private shiftView;
    private cycleView;
    private focusActive;
    private moveActive;
    private handleDayKeyDown;
    private handleGridKeyDown;
    private pickMonth;
    private pickYear;
    /** The active day moved into the shown month, keeping its day number where it can. */
    private dateInView;
    private monthDisabled;
    private yearDisabled;
    private handleToday;
    private handleClear;
    private renderHeader;
    private renderMonth;
    private renderDays;
    private renderMonths;
    private renderYears;
    private renderView;
    render(): TemplateResult<1>;
}
