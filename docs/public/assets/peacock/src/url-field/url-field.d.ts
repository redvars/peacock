import BaseField from '../input/BaseField.js';
import { type ControlValidity } from '../input/BaseInput.js';
/**
 * @label URL Field
 * @tag wc-url-field
 * @rawTag url-field
 *
 * @summary A field for a web address that shows it as a link until the person edits it, and checks that it is valid.
 * @overview
 * <p>URL Field wraps an input with URL validation, showing a clickable link preview when not in edit mode.
 * The edit button or focusing the field starts editing; leaving the field with a valid URL ends it,
 * and Escape ends it and restores the URL editing started with. The <code>start</code> and
 * <code>end</code> slots show in both modes.</p>
 * <p>It is form-associated: the URL is submitted under its <code>name</code>, and
 * <code>required</code> or an invalid URL blocks form submission.</p>
 *
 * @fires {CustomEvent<{value: string}>} input - Dispatched as the user types.
 * @fires {CustomEvent<{value: string}>} change - Dispatched when the value is committed.
 *
 * @example
 * ```html
 * <wc-url-field label="Website" value="https://example.com"></wc-url-field>
 * ```
 * @tags form
 */
export declare class UrlField extends BaseField {
    static styles: import("lit").CSSResultGroup[];
    value: string;
    private isValid;
    /** Whether the input shows instead of the link. Starts when the person clicks edit or focuses. */
    private isEditing;
    private inputElement?;
    /** The value when editing started; Escape restores it. */
    private valueBeforeEditing;
    /** Peacock's strings for the invalid URL message. */
    private readonly i18n;
    focus(): void;
    blur(): void;
    protected computeValidity(): ControlValidity;
    protected validityAnchor(): HTMLInputElement | undefined;
    private startEditing;
    /** Leaves editing, restores the value editing started with and keeps focus on the field. */
    private cancelEditing;
    private closeEditing;
    private validateUrl;
    private handleInput;
    private handleChange;
    private handleBlur;
    private handleKeyDown;
    private renderDisplayValue;
    private renderEditButton;
    render(): import("lit-html").TemplateResult;
}
