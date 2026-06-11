import { LitElement } from 'lit';
/**
 * @label Segmented Button
 * @tag wc-segmented-button
 * @rawTag segmented-button
 * @summary An individual segment within a segmented button group.
 * @overview
 * <p>Segmented buttons help people select options, switch views, or sort elements. They are used within a <code>wc-segmented-button-group</code>.</p>
 *
 * @cssprop --segmented-button-height: Height of the segmented button.
 * @cssprop --segmented-button-selected-container-color: Background color when the segment is selected.
 * @cssprop --segmented-button-selected-label-text-color: Text color when the segment is selected.
 * @cssprop --segmented-button-unselected-label-text-color: Text color when the segment is unselected.
 * @cssprop --segmented-button-outline-color: Outline / border color.
 * @cssprop --segmented-button-disabled-opacity: Opacity when the segment is disabled.
 *
 * @fires {CustomEvent} segmented-button--change - Dispatched when the selected state changes.
 *
 * @example
 * ```html
 * <wc-segmented-button-group>
 *   <wc-segmented-button value="day">Day</wc-segmented-button>
 *   <wc-segmented-button value="week" selected>Week</wc-segmented-button>
 *   <wc-segmented-button value="month">Month</wc-segmented-button>
 * </wc-segmented-button-group>
 * ```
 *
 * @tags controls
 */
export declare class SegmentedButton extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /**
     * The value associated with this segment.
     */
    value: string;
    /**
     * Whether this segment is currently selected.
     */
    selected: boolean;
    /**
     * If true, the user cannot interact with this segment.
     */
    disabled: boolean;
    /**
     * Optional icon name to display (uses wc-icon).
     */
    icon?: string;
    /** True while the segment has keyboard focus. */
    private hasFocus;
    /** True while the user is actively pressing the segment. */
    private isActive;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private _windowMouseUp;
    private _mouseDownHandler;
    private _keyDownHandler;
    private _clickHandler;
    private _toggle;
    private _blurHandler;
    private _focusHandler;
    /** Sets focus on the segment. */
    focus(): void;
    /** Removes focus from the segment. */
    blur(): void;
    render(): import("lit-html").TemplateResult<1>;
}
