import { LitElement } from 'lit';
/**
 * @label CB Divider
 * @tag wc-cb-divider
 * @rawTag cb-divider
 * @summary A divider line used within a condition builder to visually connect expressions with operator tags.
 * @tags condition-builder
 *
 * @example
 * ```html
 * <wc-cb-divider>
 *   <wc-tag color="green">and</wc-tag>
 * </wc-cb-divider>
 * ```
 */
export declare class CbDivider extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /** Whether to render the divider vertically instead of horizontally. */
    vertical: boolean;
    /** Whether to render a connecting line at the start. */
    connectStart: boolean;
    /** Whether to render a connecting line at the end. */
    connectEnd: boolean;
    render(): import("lit-html").TemplateResult<1>;
}
