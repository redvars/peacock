import { LitElement } from 'lit';
/**
 * @label Checkbox
 * @tag wc-checkbox
 * @rawTag checkbox
 * @summary Captures boolean input with an optional indeterminate mode.
 * @overview
 * <p>Checkboxes allow users to select one or more items from a set. Checkboxes can turn an option on or off.</p>
 * <p>checkboxes feature a smooth animation and clear visual states for checked, unchecked, and indeterminate.</p>
 * @cssprop --checkbox-size: Size of the checkbox container.
 * @cssprop --checkbox-selected-color: Color of the checkbox when selected.
 * @cssprop --checkbox-unselected-color: Color of the checkbox border when unselected.
 * @cssprop --checkbox-checkmark-color: Color of the checkmark icon.
 * @cssprop --checkbox-state-layer-size: Size of the state layer for touch target.
 * @fires {CustomEvent} change - Dispatched when the checkbox value changes.
 * @fires {CustomEvent} blur - Dispatched when the checkbox loses focus.
 * @fires {CustomEvent} focus - Dispatched when the checkbox receives focus.
 * @tags input, form
 *
 * @example
 * ```html
 * <wc-checkbox label="Accept terms"></wc-checkbox>
 * ```
 */
export declare class Checkbox extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /**
     * The input field name.
     */
    name: string;
    /**
     * The checkbox label.
     */
    label: string;
    /**
     * The input field value (checked state).
     */
    value: boolean;
    /**
     * If true, displays the checkbox in an indeterminate state.
     */
    indeterminate: boolean;
    /**
     * If true, the checkbox has rounded corners. Defaults to `false`.
     */
    rounded: boolean;
    /**
     * The checkbox size.
     * Possible values are: `"sm"`, `"md"`, `"lg"`. Defaults to `"md"`.
     */
    size: 'sm' | 'md' | 'lg';
    /**
     * If true, required icon is shown. Defaults to `false`.
     */
    required: boolean;
    /**
     * If true, the checkbox is readonly. Defaults to `false`.
     */
    readonly: boolean;
    /**
     * If true, the user cannot interact with the checkbox. Defaults to `false`.
     */
    disabled: boolean;
    /**
     * Configuration object for aria attributes.
     */
    configAria: Record<string, string>;
    /** True while the checkbox container has keyboard focus. */
    private hasFocus;
    /** True while the user is actively pressing the checkbox (mouse/keyboard). */
    private isActive;
    /** True when slotted label content is present. */
    private slotHasContent;
    private containerElement?;
    private nativeElement?;
    /** Captured `tabindex` attribute value forwarded to the inner container. */
    private tabindex?;
    connectedCallback(): void;
    disconnectedCallback(): void;
    firstUpdated(): void;
    private handleInitialAttributes;
    private windowMouseUp;
    private windowKeyUp;
    private mouseDownHandler;
    private keyDownHandler;
    private clickHandler;
    private blurHandler;
    private focusHandler;
    private handleKeyUp;
    /**
     * Sets focus on the checkbox.
     */
    focus(): void;
    /**
     * Removes focus from the checkbox.
     */
    blur(): void;
    render(): import("lit-html").TemplateResult<1>;
}
