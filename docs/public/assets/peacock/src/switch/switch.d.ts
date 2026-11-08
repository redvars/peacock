import ToggleBase from '../__internal/toggle-base.js';
/**
 * @label Switch
 * @tag wc-switch
 * @rawTag switch
 *
 * @summary An on and off switch for a single setting, such as turning notifications on.
 * @overview
 * <p>The switch is form-associated: when <code>checked</code>, it submits its <code>value</code>
 * (<code>on</code> by default) under its <code>name</code>. With <code>required</code> it blocks form
 * submission until it is on.</p>
 *
 * @cssprop --switch-track-color: Color of the switch track when checked.
 * @cssprop --switch-track-off-color: Color of the switch track when unchecked.
 * @cssprop --switch-width: Width of the switch track.
 * @cssprop --switch-height: Height of the switch track.
 * @cssprop --switch-handle-radius: Size of the switch handle.
 * @cssprop --switch-handle-color: Color of the switch handle.
 *
 * @fires {CustomEvent<{checked: boolean, value: string, originalEvent?: Event}>} change - Dispatched when the switch is toggled.
 *
 * @example
 * ```html
 * <wc-switch checked label="Wi-Fi"></wc-switch>
 * ```
 * @tags input, form
 */
export declare class Switch extends ToggleBase {
    static styles: import("lit").CSSResultGroup[];
    /**
     * If true, the toggle has rounded corners. Defaults to `true`.
     */
    rounded: boolean;
    /** Shows a check icon in the handle when on and a close icon when off. */
    withIcon: boolean;
    protected valueMissingText(): string;
    private keyDownHandler;
    private clickHandler;
    private renderIcon;
    render(): import("lit-html").TemplateResult<1>;
}
