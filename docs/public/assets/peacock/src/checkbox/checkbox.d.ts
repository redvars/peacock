import ToggleBase from '@/__internal/toggle-base.js';
/**
 * @label Checkbox
 * @tag wc-checkbox
 * @rawTag checkbox
 * @summary A box the person checks to turn an option on or off, with a mixed state for a partly checked group.
 * @overview
 * <p>Set <code>indeterminate</code> for the mixed state, such as on a checkbox for a group whose
 * items are only partly checked.</p>
 * <p>The checkbox is form-associated: when <code>checked</code>, it submits its <code>value</code>
 * (<code>on</code> by default) under its <code>name</code>. With <code>required</code> it blocks form
 * submission until it is checked.</p>
 * @cssprop --checkbox-size: Size of the checkbox container.
 * @cssprop --checkbox-selected-color: Color of the checkbox when selected.
 * @cssprop --checkbox-unselected-color: Color of the checkbox border when unselected.
 * @cssprop --checkbox-checkmark-color: Color of the checkmark icon.
 * @cssprop --checkbox-state-layer-size: Size of the state layer for touch target.
 * @fires {CustomEvent<{checked: boolean, value: string, originalEvent?: Event}>} change - Dispatched when the checkbox is toggled.
 * @tags input, form
 *
 * @example
 * ```html
 * <wc-checkbox label="Accept terms" checked></wc-checkbox>
 * ```
 */
export declare class Checkbox extends ToggleBase {
    static styles: import("lit").CSSResultGroup[];
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
    formResetCallback(): void;
    protected valueMissingText(): string;
    protected afterToggle(): void;
    private keyDownHandler;
    private clickHandler;
    render(): import("lit-html").TemplateResult<1>;
}
