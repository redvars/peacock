import { LitElement, type PropertyValues } from 'lit';
import { type FormRestoreState, type FormValue, getFormValue } from '../__internal/mixins/form-associated.js';
import { type SuggestionAcceptCause } from '../__internal/ai/suggestion-controller.js';
import type { AiSuggestion } from '../__internal/ai/types.js';
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
 *
 * It can hold a value the assistant suggested (ADR-030002): `suggestion` fills the control and
 * marks it until the person accepts or clears it. `sensitive` keeps the control out of AI
 * altogether. Subclasses show the marker with `suggestionBadge()` and `suggestionReason`, and
 * override `readSuggestionValue()`, `writeSuggestionValue()` and `emitSuggestionValue()` when
 * their value is not `value` with `input`/`change` events.
 *
 * @fires {CustomEvent<SuggestionAcceptDetail>} accept - Fired when a suggested value is accepted: the person edited it (`cause: 'edit'`), the form was submitted (`'submit'`) or `acceptSuggestion()` was called (`'action'`).
 * @fires {CustomEvent<SuggestionDismissDetail>} dismiss - Fired when the person clears a suggestion, before `input` and `change` with the restored value.
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
    /**
     * Holds data that must never reach a model, such as a salary or a bank account: the control
     * takes no suggestions and offers no AI features.
     */
    sensitive: boolean;
    /**
     * A value the assistant suggests, with why. The control takes the value and shows a Suggested
     * badge and the reason until the person edits it, the form is submitted, or the badge clears it,
     * which puts the previous value back. `null` drops the marker and keeps the value. Ignored while
     * AI is off and on `sensitive` controls.
     */
    get suggestion(): AiSuggestion | null;
    set suggestion(suggestion: AiSuggestion | null);
    /** Whether to show the validation message: after a commit, or after a failed submit. */
    protected showValidity: boolean;
    /** The value the control had when it was first connected; `form.reset()` returns to it. */
    private __defaultValue;
    private __defaultValueCaptured;
    private __customValidity;
    private readonly __suggestions;
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
    /** Whether the control holds a suggestion the person hasn't accepted or cleared. */
    get suggested(): boolean;
    /** Accepts the suggestion: the value stays and the marker goes. Fires `accept`. */
    acceptSuggestion(cause?: SuggestionAcceptCause): void;
    /** Clears the suggestion and puts the previous value back. Fires `dismiss`, `input` and `change`. */
    dismissSuggestion(): void;
    /**
     * The Suggested badge with its clear button, while a suggestion shows; else nothing. Controls
     * without helper text pass `withReason` so the badge's tooltip carries the reason.
     */
    protected suggestionBadge(options?: {
        slot?: string;
        withReason?: boolean;
        iconOnly?: boolean;
    }): typeof import("lit-html").nothing | import("lit-html").TemplateResult;
    /**
     * A group's label with the Suggested badge beside it while a suggestion shows. The badge stays
     * outside the label element, so it is not part of the group's accessible name. Style
     * `.label-row` as a row.
     */
    protected labelWithSuggestion(label: unknown): unknown;
    /** Why the value was suggested, while the suggestion shows; else `''`. */
    protected get suggestionReason(): string;
    /** Whether a suggestion shows as one now (AI on, not sensitive). */
    protected get suggestionVisible(): boolean;
    /** The value a suggestion replaces and a dismissed one restores. */
    protected readSuggestionValue(): unknown;
    /** Puts a suggested or restored value into the control. */
    protected writeSuggestionValue(value: unknown): void;
    /** Fires `input` and `change` after the person cleared a suggestion. */
    protected emitSuggestionValue(): void;
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
