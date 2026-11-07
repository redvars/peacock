import { LitElement, PropertyValues } from 'lit';
export type DividerOrientation = 'horizontal' | 'vertical';
/**
 * @label Divider
 * @tag wc-divider
 * @rawTag divider
 *
 * @summary A horizontal or vertical line that separates groups of content, with an optional label such as "or".
 * @overview
 * <ul>
 * <li>Dividers are used to separate content into clear groups, making it easier for users to scan
 * and understand the information presented.</li>
 * <li>Set <code>orientation</code> to <code>horizontal</code> (the default) or
 * <code>vertical</code>, depending on the layout.</li>
 * <li>Content in the default slot, such as "or", shows in the middle of the line.</li>
 * <li>The host is <code>role="separator"</code> with a matching <code>aria-orientation</code>.</li>
 * </ul>
 *
 * @cssprop --divider-color - Controls the color of the divider.
 * @cssprop --divider-spacing - Controls the space around the divider.
 * @cssprop [--divider-line-thickness=1px] - Controls the thickness of the line.
 *
 * @example
 * ```html
 * <wc-divider style="width: 12rem;">or</wc-divider>
 * ```
 * @tags display
 */
export declare class Divider extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /** Direction of the line. */
    orientation: DividerOrientation;
    /** True when the default slot contains content, used to show the label variant. */
    slotHasContent: boolean;
    connectedCallback(): void;
    protected willUpdate(changed: PropertyValues<this>): void;
    firstUpdated(): void;
    render(): import("lit-html").TemplateResult<1>;
}
