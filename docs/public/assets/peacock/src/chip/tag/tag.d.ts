import { LitElement } from 'lit';
/**
 * @label Tag
 * @tag wc-tag
 * @rawTag tag
 * @summary Tag component for displaying labels or values with optional dismiss functionality.
 * @tags display
 *
 * @fires {CustomEvent} dismiss - Dispatched when the dismiss button is clicked.
 * @fires {CustomEvent} tag--dismiss - Deprecated alias of `dismiss`, fired alongside it.
 *
 * @example
 * ```html
 * <wc-tag color="red">Tag</wc-tag>
 * ```
 */
export declare class Tag extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /** If true, the tag will have a close icon. */
    dismissible: boolean;
    variant: 'elevated' | 'filled' | 'tonal' | 'outlined';
    /** Tag color. */
    color?: 'default' | 'blue' | 'green' | 'red' | 'yellow';
    /** Tag size. Possible values are `"sm"`, `"md"`, `"lg"`. Defaults to `"md"`. */
    size?: 'sm' | 'md' | 'lg';
    private _dismissClickHandler;
    private __renderDismissButton;
    render(): import("lit-html").TemplateResult<1>;
}
