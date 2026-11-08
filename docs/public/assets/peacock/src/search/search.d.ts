import BaseInput, { type ControlValidity } from '../input/BaseInput.js';
/**
 * @label Search
 * @tag wc-search
 * @rawTag search
 *
 * @summary A search box with a search icon and a clear button, for finding or filtering content.
 * @overview
 * <p>Search has the field variants (<code>default</code>, <code>filled</code>, <code>outlined</code>), a
 * clear button, and <code>start</code>/<code>end</code> slots for icons and actions.</p>
 * <p><code>label</code> is the accessible name of the search box (it is not shown); without it the
 * placeholder names it.</p>
 * <p>The clear button is on by default (<code>clearable</code> is <code>true</code>), unlike on
 * fields, because a search box is cleared often; turn it off with <code>clearable="false"</code>
 * or <code>.clearable=${false}</code>. Escape clears the value too; when there is nothing to clear,
 * Escape is left to the page, so a dialog around the search still closes.</p>
 * <p>Search is form-associated: inside a <code>&lt;form&gt;</code> its <code>value</code> is
 * submitted under its <code>name</code>, and <code>form.reset()</code> restores the starting value.
 * It shows no validation message, so use <code>wc-input</code> for a search term that must be
 * validated.</p>
 * <p><b>Ask.</b> With <code>ask</code>, the box is also where people ask the assistant
 * (ADR-030002): an <strong>Ask</strong> button and Ctrl+Enter (⌘Enter) fire <code>ask</code> with
 * the text, while Enter still searches. <code>ask-placeholder</code> replaces the placeholder, such
 * as "Ask for something, or search apps and records". With AI off for the page, the box is a plain
 * search: no button, the usual placeholder, and no <code>ask</code>.</p>
 *
 * @slot start - Leading content; replaces the search icon.
 * @slot end - Trailing content, after the clear button.
 *
 * @cssprop --search-container-shape - Border radius of the search bar. Defaults to full (pill shape).
 * @cssprop --search-container-color - Background color of the search container.
 * @cssprop --search-input-text-color - Color of the input text.
 * @cssprop --search-placeholder-color - Color of the placeholder text.
 * @cssprop --search-icon-color - Color of the leading and trailing icons.
 * @cssprop --search-outline-color - Border color for the outlined variant.
 * @cssprop --search-outline-width - Border width for the outlined variant.
 *
 * @fires {CustomEvent<{value: string}>} input - Dispatched when the search value changes.
 * @fires {CustomEvent<{value: string}>} change - Dispatched when the value is committed: on blur, Enter, or when it is cleared.
 * @fires {CustomEvent} clear - Dispatched when the value is cleared with the clear button or Escape.
 * @fires {CustomEvent<{value: string}>} search - Dispatched when the user submits the search (presses Enter).
 * @fires {CustomEvent<{value: string}>} ask - With `ask`: the person pressed Ask or Ctrl+Enter (⌘Enter) to ask the assistant.
 *
 * @example
 * ```html
 * <wc-search label="Search products" placeholder="Search..."></wc-search>
 * ```
 * @tags form
 */
export declare class Search extends BaseInput {
    static styles: import("lit").CSSResultGroup[];
    /**
     * Visual style, as on fields: `default` (a filled container), `filled` or `outlined`.
     * `default` and `filled` look the same.
     */
    variant: 'default' | 'filled' | 'outlined';
    /** Accessible name of the search box; the placeholder names it when it is empty. */
    label: string;
    /**
     * Placeholder text shown when the input is empty. Defaults to Peacock's "Search".
     */
    placeholder: string;
    /**
     * Current search value.
     */
    value: string;
    /**
     * Whether a clear button is shown when the input has a value. On by default; set
     * `clearable="false"` to hide it.
     */
    clearable: boolean;
    /**
     * Size of the search bar.
     * Possible values: `"sm"`, `"md"`, `"lg"`. Defaults to `"md"`.
     */
    size: 'sm' | 'md' | 'lg';
    /** Lets people ask the assistant from the box: an Ask button and Ctrl+Enter fire `ask`. */
    ask: boolean;
    /** Placeholder while asking is offered, such as "Ask for something, or search apps and records". */
    askPlaceholder: string;
    private focused;
    private inputElement?;
    /** Peacock's strings for the placeholder and clear button. */
    private readonly i18n;
    private readonly ai;
    /** Whether Ask is offered now: `ask`, and AI on for the page. */
    private get __asking();
    focus(): void;
    blur(): void;
    protected computeValidity(): ControlValidity;
    protected validityAnchor(): HTMLInputElement | undefined;
    private __emit;
    private __handleInput;
    private __handleChange;
    private __handleKeydown;
    private __handleFocusChange;
    private __clearValue;
    private __ask;
    private __renderAskButton;
    private __renderClearButton;
    private __renderLeadingIcon;
    render(): import("lit-html").TemplateResult<1>;
}
