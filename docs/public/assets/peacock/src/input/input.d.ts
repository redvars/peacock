import BaseInput from './BaseInput.js';
/**
 * @label Input
 * @tag wc-input
 * @rawTag input
 *
 * @summary The Input component is used to capture user input.
 * @overview
 * <p>Input is form-associated: inside a <code>&lt;form&gt;</code> its <code>value</code> is submitted
 * under its <code>name</code>, and <code>form.reset()</code> restores the starting value.</p>
 *
 * @fires {Event} input - Re-fired from the native input as the user types.
 * @fires {Event} change - Re-fired from the native input when the value is committed.
 *
 * @example
 * ```html
 * <wc-input label="Name" required placeholder="Enter your name"></wc-input>
 * ```
 * @tags input, form
 */
export declare class Input extends BaseInput {
    static styles: import("lit").CSSResultGroup[];
    value: string;
    placeholder: string;
    label: string;
    inline: boolean;
    /** Field size. Possible values are `"sm"`, `"md"`, `"lg"`. Defaults to `"md"`. */
    size: 'sm' | 'md' | 'lg';
    type: 'text' | 'password' | 'email' | 'tel';
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
    connectedCallback(): void;
    focus(): Promise<void>;
    private handleInitialAttributes;
    private __handleInput;
    private __handleFocusChange;
    private __redispatchEvent;
    private __renderPasswordToggle;
    render(): import("lit-html").TemplateResult<1>;
}
