import { LitElement } from 'lit';
/**
 * @label CB Divider
 * @tag wc-cb-divider
 * @rawTag cb-divider
 * @summary A divider line used within a condition builder to visually connect rules with an operator.
 *
 * @overview
 * <p>A line with its content, usually a tag naming the operator such as "and", in the middle.
 * It is drawn horizontally, or vertically with <code>vertical</code>.
 * <code>connect-start</code> and <code>connect-end</code> add connecting arms at either end, whose
 * length is set with <code>--cb-divider-arm-length</code>. It is decoration only, with no
 * behaviour or events.</p>
 * @cssprop --cb-divider-line-color - Color of the divider line.
 * @cssprop --cb-divider-arm-length - Length of the connecting arms drawn by `connect-start` and `connect-end`.
 * @tags condition-builder
 *
 * @example
 * ```html
 * <wc-cb-divider>
 *   <wc-tag accent="green">and</wc-tag>
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
