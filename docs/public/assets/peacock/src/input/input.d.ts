import BaseInput from "./BaseInput.js";
/**
 * @label Input
 * @tag wc-input
 * @rawTag input
 *
 * @summary The Input component is used to capture user input.
 *
 * @example
 * ```html
 * <wc-input label="Name" required placeholder="Enter your name"></wc-input>
 * ```
 */
export declare class Input extends BaseInput {
    static styles: import("lit").CSSResultGroup[];
    value: string;
    name: string;
    placeholder: string;
    label: string;
    inline: boolean;
    size: "sm" | "md" | "lg";
    type: "text" | "password" | "email" | "tel";
    autocomplete: "on" | "off";
    configAria: Record<string, string>;
    variant: "filled" | "outlined" | "default";
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
    focus(): Promise<void>;
    connectedCallback(): void;
    private handleInitialAttributes;
    private __handleInput;
    private __handleFocusChange;
    private __redispatchEvent;
    render(): import("lit-html").TemplateResult<1>;
}
