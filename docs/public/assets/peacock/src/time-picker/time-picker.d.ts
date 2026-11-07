import { LitElement, type TemplateResult } from 'lit';
import { type HourCycle } from '@/__internal/utils/date.js';
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
export declare class TimePicker extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /** The time as `HH:mm` (or `HH:mm:ss` with `seconds`), 24-hour. Empty when none is picked. */
    value: string;
    /** Minutes between entries in the minute column, such as 15 for 00, 15, 30 and 45. */
    minuteStep: number;
    /** The value's format: `HH:mm:ss` with seconds (and a seconds column), else `HH:mm`. */
    seconds: boolean;
    /** `h12` shows 1–12 with AM/PM, `h23` shows 0–23; defaults to the locale's. */
    hourCycle?: HourCycle;
    /** Earliest time that can be picked (`HH:mm`). */
    min: string;
    /** Latest time that can be picked (`HH:mm`). */
    max: string;
    /** BCP 47 locale for AM/PM names and the default hour cycle. */
    locale: string;
    disabled: boolean;
    readonly: boolean;
    /** The column holding the tab stop. */
    private activeColumn;
    /** Peacock's strings for the column labels, and the resolved locale. */
    private readonly i18n;
    protected updated(changed: Map<PropertyKey, unknown>): void;
    /** Moves focus to the active column and scrolls every column to its selected entry. */
    focus(): void;
    /**
     * Scrolls each column so its selected entry (or, with no value, the current time's) sits in
     * the middle row, so the picked time reads across the columns.
     */
    scrollToSelected(): void;
    private get columnElements();
    private get resolvedHourCycle();
    private get columns();
    /** The picked time, or the current time when none is picked so a first pick has a base. */
    private get parts();
    private columnFor;
    private withColumn;
    /** Whether any time in [from, to] (seconds since midnight) is within min/max. */
    private spanAllowed;
    private optionDisabled;
    private options;
    /** The entry a column shows for a time. */
    private columnValue;
    private selectedValue;
    private emit;
    private pick;
    private handleKeyDown;
    private renderColumn;
    render(): TemplateResult<1>;
}
