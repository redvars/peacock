import { LitElement } from 'lit';
/**
 * @label Badge
 * @tag wc-badge
 * @rawTag badge
 * @summary A small count or dot on an icon or a label, such as the number of unread messages.
 * @overview
 * <p>A badge shows a count, or with <code>dot</code> (or no <code>value</code>) a small dot. A
 * number above <code>max</code> (default 99) shows as <code>99+</code>.</p>
 * <p>A dot alone means nothing to a screen reader, so it is hidden from assistive technology
 * unless it has a <code>label</code>. Give a count a <code>label</code> such as "3 unread
 * messages" when the number alone is not enough. When the badge sits on an icon button, put the
 * full meaning in the button's <code>aria-label</code> instead (for example "Inbox, 3 unread") and
 * leave the badge without a label.</p>
 * <p><code>intent</code> (<code>info</code>, <code>success</code>, <code>warning</code>,
 * <code>danger</code>) sets its color; without it the badge uses the theme's badge color.</p>
 *
 * @cssprop --badge-color - Controls the color of the badge.
 * @cssprop --badge-text-color - Controls the color of the count.
 *
 * @example
 * ```html
 * <wc-badge value="1"></wc-badge>
 * <wc-badge value="120" label="120 unread messages"></wc-badge>
 * <wc-badge dot intent="success"></wc-badge>
 * ```
 * @tags display
 */
export declare class Badge extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /**
     * The value to display in the badge.
     */
    value: string;
    /** The largest number shown; a larger numeric `value` shows as `max+`. Defaults to `99`. */
    max: number;
    /** Shows a small dot without the value. */
    dot: boolean;
    /** The accessible name, read instead of the visible value (for example "3 unread messages"). */
    label?: string;
    /** What the badge means: `info`, `success`, `warning` or `danger`. */
    intent?: 'info' | 'success' | 'warning' | 'danger';
    /** The text the badge shows: the value, capped at `max+` when it is a number. */
    get displayValue(): string;
    render(): import("lit-html").TemplateResult<1>;
}
