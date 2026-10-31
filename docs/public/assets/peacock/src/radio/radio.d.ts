import { LitElement } from 'lit';
import { type FormRestoreState, type FormValue, getFormState, getFormValue } from '@/__internal/mixins/form-associated.js';
declare const Radio_base: import("../__internal/mixins/mixin.js").MixinReturn<(abstract new (...args: any[]) => import("@/__internal/mixins/element-internals.js").WithElementInternals) & typeof LitElement & import("@/__internal/mixins/form-associated.js").FormAssociatedConstructor, import("@/__internal/mixins/form-associated.js").FormAssociated>;
export declare class Radio extends Radio_base {
    private static readonly DIRECTION_NEXT;
    private static readonly DIRECTION_PREVIOUS;
    static styles: import("lit").CSSResultGroup[];
    /**
     * The submitted value when this radio is selected.
     */
    value: string;
    /**
     * The radio label.
     */
    label: string;
    /**
     * Whether the radio is selected.
     */
    checked: boolean;
    /**
     * If true, required icon is shown. Defaults to `false`.
     */
    required: boolean;
    /**
     * If true, the radio is readonly. Defaults to `false`.
     */
    readonly: boolean;
    /**
     * Configuration object for aria attributes.
     */
    configAria: Record<string, string>;
    /** True while the radio container has keyboard focus. */
    private hasFocus;
    /** True while the user is actively pressing the radio (mouse/keyboard). */
    private isActive;
    /** True when slotted label content or `label` property is present. */
    private slotHasContent;
    /** True for the one radio in the group that should receive tab focus (roving tabindex). */
    private isGroupFocusTarget;
    private containerElement?;
    /** Captured `tabindex` attribute value forwarded to the inner container. */
    private tabindex?;
    /** `checked` when first connected; `form.reset()` returns to it. */
    private defaultChecked?;
    connectedCallback(): void;
    disconnectedCallback(): void;
    firstUpdated(): void;
    updated(changedProps: Map<string, unknown>): void;
    /**
     * Sets focus on the radio.
     */
    focus(): void;
    /**
     * Removes focus from the radio.
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
    private selectRadio;
    private dispatchChange;
    private uncheckSiblings;
    private getGroupRadios;
    private isRadioEnabled;
    private updateGroupFocusTarget;
    private navigateGroup;
    render(): import("lit-html").TemplateResult<1>;
}
export {};
