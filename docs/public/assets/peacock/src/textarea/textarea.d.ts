import { type PropertyValues } from 'lit';
import BaseField from '../input/BaseField.js';
import { type ControlValidity } from '../input/BaseInput.js';
/**
 * @label Textarea
 * @tag wc-textarea
 * @rawTag textarea
 * @summary A multi-line text field that can grow with its content.
 * @overview
 * <p>Textarea is form-associated: inside a <code>&lt;form&gt;</code> its <code>value</code> is
 * submitted under its <code>name</code>, and <code>form.reset()</code> restores the starting value.</p>
 * <p>It validates like a native textarea: <code>required</code>, <code>minlength</code> and
 * <code>maxlength</code> block form submission, and the message shows under the field once the
 * value is committed or the form is submitted. With <code>maxlength</code> a character counter
 * shows under the field.</p>
 * <p><code>rows</code> sets the starting height. With <code>auto-grow</code> the height follows the
 * content, up to <code>max-rows</code> when it is set; <code>resize</code> controls whether the
 * person can drag the corner to resize it.</p>
 * @tags input
 *
 * @fires {CustomEvent<{value: string}>} input - Dispatched as the user types.
 * @fires {CustomEvent<{value: string}>} change - Dispatched when the value is committed.
 *
 * @example
 * ```html
 * <wc-textarea label="Description" placeholder="Enter text"></wc-textarea>
 * ```
 * @example
 * ```html
 * <wc-textarea label="Bio" maxlength="280" auto-grow max-rows="8"></wc-textarea>
 * ```
 */
export declare class Textarea extends BaseField {
    static styles: import("lit").CSSResultGroup[];
    value: string;
    /** Whether the browser may autofill the field: `"on"` or `"off"` (default). */
    autocomplete: 'on' | 'off';
    /** Visible lines of text; the starting height with `auto-grow`. */
    rows: number;
    /** Fewest characters allowed. */
    minLength?: number;
    /** Most characters allowed; the textarea stops taking more and shows a character counter. */
    maxLength?: number;
    /** Grows the height with the content instead of scrolling. */
    autoGrow: boolean;
    /** With `auto-grow`, the most lines it grows to before it scrolls; unset for no limit. */
    maxRows?: number;
    /** Which way the person can resize it by dragging the corner. */
    resize: 'none' | 'vertical' | 'both';
    private inputElement?;
    protected updated(changed: PropertyValues<this>): void;
    focus(): void;
    blur(): void;
    protected computeValidity(): ControlValidity;
    protected validityAnchor(): HTMLTextAreaElement | undefined;
    /** With `auto-grow`, sets the height to the content's, capped at `max-rows` lines. */
    private fitToContent;
    private handleInput;
    private handleChange;
    render(): import("lit-html").TemplateResult;
}
