import { nothing } from 'lit';
import BaseInput from '../input/BaseInput.js';
/**
 * @label Switch
 * @tag wc-switch
 * @rawTag switch
 *
 * @summary Captures boolean input with an on/off switch interaction.
 * @overview
 * <p>Toggles are used to enable or disable a single option. They provide immediate feedback about whether an option is active or inactive.</p>
 *
 * @cssprop --switch-track-color: Color of the switch track when checked.
 * @cssprop --switch-track-off-color: Color of the switch track when unchecked.
 * @cssprop --switch-width: Width of the switch track.
 * @cssprop --switch-height: Height of the switch track.
 * @cssprop --switch-handle-radius: Size of the switch handle.
 * @cssprop --switch-handle-color: Color of the switch handle.
 *
 * @fires {CustomEvent} change - Dispatched when the switch value changes.
 * @fires {CustomEvent} blur - Dispatched when the switch loses focus.
 * @fires {CustomEvent} focus - Dispatched when the switch receives focus.
 *
 * @example
 * ```html
 * <wc-switch value="true"></wc-switch>
 * ```
 * @tags input, form
 */
export declare class Switch extends BaseInput {
    static styles: import("lit").CSSResultGroup[];
    value: boolean;
    /**
     * The input field name.
     */
    name: string;
    /**
     * The switch label.
     */
    label: string;
    /**
     * If true, the toggle has rounded corners. Defaults to `true`.
     */
    rounded: boolean;
    /**
     * If true, required icon is shown. Defaults to `false`.
     */
    required: boolean;
    /**
     * If true, the toggle is readonly. Defaults to `false`.
     */
    readonly: boolean;
    /**
     * If true, the user cannot interact with the toggle. Defaults to `false`.
     */
    disabled: boolean;
    withIcon: boolean;
    /**
     * Configuration object for aria attributes.
     */
    configAria: Record<string, string>;
    private hasFocus;
    private isActive;
    private slotHasContent;
    private trackElement?;
    private nativeElement?;
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
     * Sets focus on the toggle.
     */
    focus(): void;
    /**
     * Removes focus from the toggle.
     */
    blur(): void;
    __renderIcon(): typeof nothing | import("lit-html").TemplateResult<1>;
    render(): import("lit-html").TemplateResult<1>;
}
