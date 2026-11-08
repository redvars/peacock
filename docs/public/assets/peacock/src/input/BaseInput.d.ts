import { LitElement, type PropertyValues } from 'lit';
import { type FormRestoreState, type FormValue, getFormValue } from '../__internal/mixins/form-associated.js';
declare const VALIDITY_KEYS: readonly ["valueMissing", "typeMismatch", "patternMismatch", "tooLong", "tooShort", "rangeUnderflow", "rangeOverflow", "stepMismatch", "badInput"];
/** The flags `ElementInternals.setValidity()` takes, as the DOM's `ValidityStateFlags`. */
export type ValidityFlags = {
    [Key in (typeof VALIDITY_KEYS)[number] | 'customError']?: boolean;
};
/** What a control reports to `ElementInternals.setValidity()`. */
export interface ControlValidity {
    flags: ValidityFlags;
    message: string;
    /** Element the browser points at when it reports the problem; defaults to the host. */
    anchor?: HTMLElement;
}
/** The validity of a native control, for controls that wrap one. */
export declare function nativeValidity(control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): ControlValidity;
declare const BaseInput_base: import("../__internal/mixins/mixin.js").MixinReturn<(abstract new (...args: any[]) => import("../__internal/mixins/element-internals.js").WithElementInternals) & typeof LitElement & import("../__internal/mixins/form-associated.js").FormAssociatedConstructor, import("../__internal/mixins/form-associated.js").FormAssociated>;
/**
 * Base class for Peacock's form controls.
 *
 * It is form-associated: `value` is submitted with the surrounding `<form>`, `form.reset()`
 * restores the value the control started with, and a disabled `<fieldset>` disables it.
 * `name` and `disabled` come from `mixinFormAssociated`; they are backed by attributes, so
 * subclasses must not redeclare them.
 *
 * It takes part in constraint validation like a native control: `required` and the control's own
 * rules (from `computeValidity()`) block form submission, `checkValidity()`, `reportValidity()`,
 * `setCustomValidity()`, `validity` and `validationMessage` work as on `<input>`, and `:invalid`
 * matches. A control shows its message (`validationText`) once the person has committed a value
 * or the form was submitted.
 */
export default abstract class BaseInput extends BaseInput_base {
    /** Each control declares its own `value` (a property, or an accessor such as Switch's). */
    abstract value?: any;
    /** Shows the value but stops the user changing it; unlike `disabled`, it stays focusable and is submitted. */
    readonly: boolean;
    /** Requires a value before the form can submit. */
    required: boolean;
    /** Shows a loading placeholder in place of the control. */
    skeleton: boolean;
    /** Whether to show the validation message: after a commit, or after a failed submit. */
    protected showValidity: boolean;
    /** The value the control had when it was first connected; `form.reset()` returns to it. */
    private __defaultValue;
    private __defaultValueCaptured;
    private __customValidity;
    constructor();
    connectedCallback(): void;
    protected updated(changed: PropertyValues): void;
    get validity(): ValidityState;
    get validationMessage(): string;
    get willValidate(): boolean;
    checkValidity(): boolean;
    reportValidity(): boolean;
    /** Sets a custom error message, as on `<input>`; an empty string clears it. */
    setCustomValidity(message: string): void;
    /**
     * The control's own validity. The default checks `required` against an empty `value`;
     * controls that wrap a native input return `nativeValidity(input)`, others add their rules.
     */
    protected computeValidity(): ControlValidity;
    /** The message for a missing required value. */
    protected valueMissingText(): string;
    /** Pushes the current validity to `ElementInternals`. */
    protected updateValidity(): void;
    /** The element the browser points at when it reports a problem. */
    protected validityAnchor(): HTMLElement | undefined;
    /** The message to show under the control, or '' while there is nothing to show. */
    protected get validationText(): string;
    [getFormValue](): FormValue | null;
    formResetCallback(): void;
    formStateRestoreCallback(restored: FormRestoreState | null): void;
    /** Turns saved form state back into a value. Strings by default. */
    protected parseRestoreState(restored: FormRestoreState): unknown;
    private __handleInvalid;
    private __handleCommit;
}
export {};
