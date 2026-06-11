import BaseInput from '../input/BaseInput.js';
/**
 * @label Textarea
 * @tag wc-textarea
 * @rawTag textarea
 * @summary The Textarea component is used to capture user input.
 * @tags input
 *
 * @example
 * ```html
 * <wc-textarea label="Description" placeholder="Enter text"></wc-textarea>
 * ```
 */
export declare class Textarea extends BaseInput {
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
    rows: string;
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
