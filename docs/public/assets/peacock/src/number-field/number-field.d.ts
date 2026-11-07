import type { FormRestoreState } from '@/__internal/mixins/form-associated.js';
import BaseField from '../input/BaseField.js';
import { type ControlValidity } from '../input/BaseInput.js';
/**
 * @label Number Field
 * @tag wc-number-field
 * @rawTag number-field
 *
 * @summary A text field for a number, with optional buttons that step it down and up.
 * @overview
 * <p>Number Field is form-associated: inside a <code>&lt;form&gt;</code> its <code>value</code> is
 * submitted under its <code>name</code>, and <code>form.reset()</code> restores the starting value.</p>
 * <p>It validates like a native number input: <code>required</code>, <code>min</code>,
 * <code>max</code> and <code>step</code> block form submission, and the message shows under the
 * field once the value is committed or the form is submitted.</p>
 * <p>For money, use <code>wc-currency-field</code>: its value is an exact decimal string with the
 * currency's number of decimals, where this field's value is a JavaScript number.</p>
 *
 * @fires {CustomEvent<{value: number | undefined}>} input - Dispatched as the user types or steps the value.
 * @fires {CustomEvent<{value: number | undefined}>} change - Dispatched when the value is committed.
 *
 * @example
 * ```html
 * <wc-number-field label="Age" placeholder="Enter your age"></wc-number-field>
 * ```
 */
export declare class NumberField extends BaseField {
    static styles: import("lit").CSSResultGroup[];
    value?: number;
    max?: number;
    min?: number;
    step?: number;
    autocomplete: 'on' | 'off';
    /** Shows buttons that step the value down and up. */
    stepper: boolean;
    /**
     * How to show the value while the field is not focused, as `Intl.NumberFormat` options (for
     * example `{ style: 'currency', currency: 'EUR' }`). While focused the field shows the plain
     * number to edit. `value` stays a number either way. Formatted in the field's locale: the
     * nearest `lang`, else the browser's.
     */
    format?: Intl.NumberFormatOptions;
    private inputElement?;
    /** Peacock's strings for the stepper buttons. */
    private readonly i18n;
    focus(): void;
    blur(): void;
    protected computeValidity(): ControlValidity;
    protected validityAnchor(): HTMLInputElement | undefined;
    protected parseRestoreState(state: FormRestoreState): unknown;
    protected clearValue(): void;
    /** The value as `format` shows it, or '' when there is nothing to format. */
    private formattedValue;
    /** The input's value as a number, or `undefined` when it is empty or not a number. */
    private static __toValue;
    private __handleInput;
    private __handleChange;
    private stepUp;
    private stepDown;
    /**
     * Steps the value like the native spinner. `stepUp()`/`stepDown()` fire no events, so this
     * updates `value` and emits `input` and `change` itself.
     */
    private __step;
    private renderStepper;
    render(): import("lit-html").TemplateResult;
}
