import { LitElement } from 'lit';
/**
 * @label Tag
 * @tag wc-tag
 * @rawTag tag
 * @summary Tag component for displaying labels or values with optional dismiss functionality.
 * @tags display
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
    size?: 'sm' | 'md';
    private _dismissClickHandler;
    private __renderDismissButton;
    render(): import("lit-html").TemplateResult<1>;
}
