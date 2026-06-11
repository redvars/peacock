import BaseInput from '../input/BaseInput.js';
/**
 * @label URL Field
 * @tag wc-url-field
 * @rawTag url-field
 *
 * @summary A field for entering and displaying URLs with validation.
 * @overview
 * <p>URL Field wraps an input with URL validation, showing a clickable link preview when not in edit mode.</p>
 *
 * @example
 * ```html
 * <wc-url-field label="Website" value="https://example.com"></wc-url-field>
 * ```
 * @tags form
 */
export declare class UrlField extends BaseInput {
    static styles: import("lit").CSSResultGroup[];
    value: string;
    name: string;
    placeholder: string;
    label: string;
    editing: boolean;
    debounce: number;
    size: 'sm' | 'md' | 'lg';
    variant: 'filled' | 'outlined' | 'default';
    helperText: string;
    error: boolean;
    errorText: string;
    warning: boolean;
    warningText: string;
    private focused;
    private isValid;
    private inputElement?;
    private debounceTimer?;
    disconnectedCallback(): void;
    focus(): void;
    blur(): void;
    private startEditing;
    private closeEditing;
    private validateUrl;
    private handleInput;
    private handleFocusChange;
    private handleBlur;
    private handleChange;
    private renderDisplayValue;
    render(): import("lit-html").TemplateResult<1>;
}
