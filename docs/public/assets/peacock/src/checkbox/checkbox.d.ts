import { LitElement } from 'lit';
import { type FormRestoreState, type FormValue, getFormState, getFormValue } from '@/__internal/mixins/form-associated.js';
declare const Checkbox_base: import("../__internal/mixins/mixin.js").MixinReturn<(abstract new (...args: any[]) => import("@/__internal/mixins/element-internals.js").WithElementInternals) & typeof LitElement & import("@/__internal/mixins/form-associated.js").FormAssociatedConstructor, import("@/__internal/mixins/form-associated.js").FormAssociated>;
/**
 * @label Checkbox
 * @tag wc-checkbox
 * @rawTag checkbox
 * @summary Captures boolean input with an optional indeterminate mode.
 * @overview
 * <p>Checkboxes allow users to select one or more items from a set. Checkboxes can turn an option on or off.</p>
 * <p>checkboxes feature a smooth animation and clear visual states for checked, unchecked, and indeterminate.</p>
 * <p>The checkbox is form-associated: when <code>checked</code>, it submits <code>on</code> under its <code>name</code>.</p>
 * @cssprop --checkbox-size: Size of the checkbox container.
 * @cssprop --checkbox-selected-color: Color of the checkbox when selected.
 * @cssprop --checkbox-unselected-color: Color of the checkbox border when unselected.
 * @cssprop --checkbox-checkmark-color: Color of the checkmark icon.
 * @cssprop --checkbox-state-layer-size: Size of the state layer for touch target.
 * @fires {CustomEvent} change - Dispatched when the checkbox is toggled. Detail: `{ checked, value, originalEvent }`.
 * @fires {CustomEvent} blur - Dispatched when the checkbox loses focus.
 * @fires {CustomEvent} focus - Dispatched when the checkbox receives focus.
 * @tags input, form
 *
 * @example
 * ```html
 * <wc-checkbox label="Accept terms" checked></wc-checkbox>
 * ```
 */
export declare class Checkbox extends Checkbox_base {
    static styles: import("lit").CSSResultGroup[];
    /**
     * The checkbox label.
     */
    label: string;
    /**
     * Whether the checkbox is checked.
     */
    checked: boolean;
    /**
     * @deprecated Use `checked`. Kept as an alias of `checked`.
     */
    get value(): boolean;
    set value(value: boolean);
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
    /** Captured `tabindex` attribute value forwarded to the inner container. */
    private tabindex?;
    /** `checked` when first connected; `form.reset()` returns to it. */
    private defaultChecked?;
    connectedCallback(): void;
    disconnectedCallback(): void;
    firstUpdated(): void;
    /**
     * Sets focus on the checkbox.
     */
    focus(): void;
    /**
     * Removes focus from the checkbox.
     */
    blur(): void;
    [getFormValue](): FormValue | null;
    [getFormState](): FormValue | null;
    formResetCallback(): void;
    formStateRestoreCallback(state: FormRestoreState | null): void;
    private handleInitialAttributes;
    private windowMouseUp;
    private windowKeyUp;
    private mouseDownHandler;
    private keyDownHandler;
    private clickHandler;
    private blurHandler;
    private focusHandler;
    private handleKeyUp;
    render(): import("lit-html").TemplateResult<1>;
}
export {};
