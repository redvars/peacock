import BaseField from './BaseField.js';
import { type ControlValidity } from './BaseInput.js';
/**
 * @label Input
 * @tag wc-input
 * @rawTag input
 *
 * @summary A single-line text field for plain text, an email address or a phone number.
 * @overview
 * <p>Input is form-associated: inside a <code>&lt;form&gt;</code> its <code>value</code> is submitted
 * under its <code>name</code>, and <code>form.reset()</code> restores the starting value.</p>
 * <p>It validates like a native input: <code>required</code> and an invalid <code>type="email"</code>
 * block form submission, and the message shows under the field once the value is committed or the
 * form is submitted. <code>checkValidity()</code>, <code>reportValidity()</code> and
 * <code>setCustomValidity()</code> work as on <code>&lt;input&gt;</code>, and so do
 * <code>minlength</code>, <code>maxlength</code> and <code>pattern</code>. With
 * <code>maxlength</code> a character counter shows under the field.</p>
 * <p>For a password, use <code>wc-password-field</code>.</p>
 *
 * @fires {CustomEvent<{value: string}>} input - Dispatched as the user types.
 * @fires {CustomEvent<{value: string}>} change - Dispatched when the value is committed.
 *
 * @example
 * ```html
 * <wc-input label="Name" required placeholder="Enter your name"></wc-input>
 * ```
 * @tags input, form
 */
export declare class Input extends BaseField {
    static styles: import("lit").CSSResultGroup[];
    value: string;
    /** Kind of text. For a password, use `wc-password-field`. */
    type: 'text' | 'email' | 'tel';
    /**
     * Autofill hint for the browser, any `autocomplete` token such as `email`, `username`, `name`,
     * `tel`, `one-time-code` or `off`. Unset by default, so the browser decides.
     */
    autocomplete: string;
    /** Fewest characters allowed. */
    minLength?: number;
    /** Most characters allowed; the input stops taking more and shows a character counter. */
    maxLength?: number;
    /** Regular expression the whole value must match, as on `<input pattern>`. */
    pattern: string;
    /**
     * The `inputmode` attribute: which virtual keyboard to show (`numeric`, `decimal`, `email`,
     * `tel`, `url`, `search`, `none`). Passed to the native input only when set.
     */
    protected inputModeAttribute: string | null;
    /**
     * The `spellcheck` attribute (`true` or `false`). Passed to the native input only when set, so
     * the browser default applies otherwise.
     */
    protected spellcheckAttribute: string | null;
    private inputElement?;
    focus(): void;
    blur(): void;
    protected computeValidity(): ControlValidity;
    protected validityAnchor(): HTMLInputElement | undefined;
    private handleInput;
    private handleChange;
    render(): import("lit-html").TemplateResult;
}
