import BaseInput from '../input/BaseInput.js';
/**
 * @label Number Field
 * @tag wc-number-field
 * @rawTag number-field
 *
 * @summary The Number Field component is used to capture numeric user input.
 *
 * @example
 * ```html
 * <wc-number-field label="Age" placeholder="Enter your age"></wc-number-field>
 * ```
 */
export declare class NumberField extends BaseInput {
    #private;
    static styles: import("lit").CSSResultGroup[];
    value?: number;
    name: string;
    placeholder: string;
    label: string;
    inline: boolean;
    size: 'sm' | 'md' | 'lg';
    max?: number;
    min?: number;
    step?: number;
    autocomplete: 'on' | 'off';
    configAria: Record<string, string>;
    /**
     * Helper text to display below the input.
     */
    helperText: string;
    error: boolean;
    errorText: string;
    warning: boolean;
    warningText: string;
    stepper: boolean;
    private focused;
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
    private stepUp;
    private stepDown;
    render(): import("lit-html").TemplateResult<1>;
}
