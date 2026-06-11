import { LitElement, nothing } from 'lit';
/**
 * @label Field
 * @tag wc-field
 * @rawTag field
 *
 * @summary Wrapper for form fields with label and help text.
 * @overview
 * <p>Field provides consistent styling and behavior for form inputs.</p>
 *
 * @example
 * ```html
 * <wc-field label="Name" required>
 *   some text
 * </wc-field>
 * ```
 * @tags form
 */
export declare class Field extends LitElement {
    static shadowRootOptions: ShadowRootInit;
    static styles: import("lit").CSSResultGroup[];
    /** Label text shown above the field input. */
    label: string;
    /** Help text (deprecated — prefer `helperText`). */
    help: string;
    /** When true, marks the field as required and shows a required indicator. */
    required: boolean;
    /** When true, the field and its slotted input are disabled. */
    disabled: boolean;
    /** When true, the field and its slotted input are read-only. */
    readonly: boolean;
    /** When true, renders the field in a loading skeleton state. */
    skeleton: boolean;
    /** Helper/hint text shown in the field footer. */
    helperText: string;
    /** When true, the field is in an error state and `errorText` is shown. */
    error: boolean;
    /** Error message displayed when `error` is true. */
    errorText: string;
    /** When true, the field is in a warning state and `warningText` is shown. */
    warning: boolean;
    /** Warning message displayed when `warning` is true. */
    warningText: string;
    /** Character / word count string displayed at the trailing end of the footer. */
    textCount: string;
    /** When true, applies focused styling (controlled externally by the slotted input). */
    focused: boolean;
    /** When true, applies populated styling (controlled externally by the slotted input). */
    populated: boolean;
    /** Visual variant of the field container. */
    variant: 'filled' | 'outlined' | 'default';
    /** Reference to the host input element; used to forward click-on-label focus. */
    host?: HTMLElement;
    /** True when the `field-start` slot contains at least one node. */
    slotStartHasContent: boolean;
    /** True when the `field-end` slot contains at least one node. */
    slotEndHasContent: boolean;
    firstUpdated(): void;
    __handleClick(): void;
    __renderInputSlot(): import("lit-html").TemplateResult<1>;
    __renderFieldHeader(): typeof nothing | import("lit-html").TemplateResult<1>;
    __renderFieldFooter(): typeof nothing | import("lit-html").TemplateResult<1>;
    __renderHelperText(): typeof nothing | import("lit-html").TemplateResult<1>;
    __renderWordCount(): typeof nothing | import("lit-html").TemplateResult<1>;
    render(): import("lit-html").TemplateResult<1>;
}
