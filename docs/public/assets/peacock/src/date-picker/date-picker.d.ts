import BaseInput from '../input/BaseInput.js';
/**
 * @label Date Picker
 * @tag wc-date-picker
 * @rawTag date-picker
 * @summary The Date Picker component is used to capture date user input.
 * @tags input
 *
 * @example
 * ```html
 * <wc-date-picker label="Date" placeholder="Select a date"></wc-date-picker>
 * ```
 */
export declare class DatePicker extends BaseInput {
    static styles: import("lit").CSSResultGroup[];
    value: string;
    name: string;
    placeholder: string;
    label: string;
    inline: boolean;
    size: 'sm' | 'md' | 'lg';
    autocomplete: 'on' | 'off';
    configAria: Record<string, string>;
    variant: 'filled' | 'outlined' | 'default';
    /**
     * Helper text to display below the input.
     */
    helperText: string;
    error: boolean;
    errorText: string;
    warning: boolean;
    warningText: string;
    private focused;
    private passwordVisible;
    /**
     * Returns true when the text field has been interacted with. Native
     * validation errors only display in response to user interactions.
     */
    private dirty;
    private inputElement?;
    private tabindex?;
    connectedCallback(): void;
    private handleInitialAttributes;
    private __handleInput;
    focus(): void;
    blur(): void;
    private __handleFocusChange;
    private __redispatchEvent;
    render(): import("lit-html").TemplateResult<1>;
}
