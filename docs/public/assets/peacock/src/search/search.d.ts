import { LitElement } from 'lit';
/**
 * @label Search
 * @tag wc-search
 * @rawTag search
 *
 * @summary A search bar for filtering and finding content.
 * @overview
 * <p>The search component provides a text input designed for search interactions.
 * It supports outlined and filled variants, an optional clear button, and leading/trailing icon slots.</p>
 *
 * @cssprop --search-container-shape - Border radius of the search bar. Defaults to full (pill shape).
 * @cssprop --search-container-color - Background color of the search container.
 * @cssprop --search-input-text-color - Color of the input text.
 * @cssprop --search-placeholder-color - Color of the placeholder text.
 * @cssprop --search-icon-color - Color of the leading and trailing icons.
 * @cssprop --search-outline-color - Border color for the outlined variant.
 * @cssprop --search-outline-width - Border width for the outlined variant.
 *
 * @fires {CustomEvent} input - Dispatched when the search value changes.
 * @fires {CustomEvent} change - Dispatched when the search input loses focus or Enter is pressed.
 * @fires {CustomEvent} clear - Dispatched when the clear button is activated.
 * @fires {CustomEvent} search - Dispatched when the user submits the search (presses Enter).
 *
 * @example
 * ```html
 * <wc-search placeholder="Search..."></wc-search>
 * ```
 * @tags form
 */
export declare class Search extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /**
     * Visual style variant.
     * Possible values: `"outlined"`, `"filled"`. Defaults to `"filled"`.
     */
    variant: 'outlined' | 'filled';
    /**
     * Placeholder text shown when the input is empty.
     */
    placeholder: string;
    /**
     * Current search value.
     */
    value: string;
    /**
     * Whether the search bar is disabled.
     */
    disabled: boolean;
    /**
     * Whether a clear button is shown when the input has a value.
     */
    clearable: boolean;
    /**
     * Size of the search bar.
     * Possible values: `"sm"`, `"md"`, `"lg"`. Defaults to `"md"`.
     */
    size: 'sm' | 'md' | 'lg';
    private focused;
    private leadingSlotHasContent;
    private inputElement?;
    firstUpdated(): void;
    focus(): Promise<void>;
    private __handleInput;
    private __handleChange;
    private __handleKeydown;
    private __handleFocusChange;
    private __clearValue;
    private __renderClearButton;
    private __renderLeadingIcon;
    render(): import("lit-html").TemplateResult<1>;
}
