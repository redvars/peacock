import { LitElement } from 'lit';
/**
 * @label Divider
 * @tag wc-divider
 * @rawTag divider
 *
 * @summary The divider component is used to visually separate content.
 * @overview
 *  - Dividers are used to separate content into clear groups, making it easier for users to scan and understand the information presented.
 *  - They can be oriented either vertically or horizontally, depending on the layout requirements.
 *
 * @cssprop --divider-color - Controls the color of the divider.
 * @cssprop --divider-padding - Controls the padding of the divider.
 *
 * @example
 * ```html
 * <wc-divider style="width: 12rem;">or</wc-divider>
 * ```
 * @tags display
 */
export declare class Divider extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /** When true, renders the divider vertically. Defaults to horizontal. */
    vertical: boolean;
    /** True when the default slot contains content, used to show the label variant. */
    slotHasContent: boolean;
    firstUpdated(): void;
    render(): import("lit-html").TemplateResult<1>;
}
