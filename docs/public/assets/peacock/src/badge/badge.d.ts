import { LitElement } from 'lit';
/**
 * @label Badge
 * @tag wc-badge
 * @rawTag badge
 * @summary The badge component is used to display a small amount of information to the user.
 *
 * @cssprop --badge-color - Controls the color of the badge.
 *
 * @example
 * ```html
 * <wc-badge value="1"></wc-badge>
 * ```
 * @tags display
 */
export declare class Badge extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /**
     * The value to display in the badge.
     */
    value: string;
    render(): import("lit-html").TemplateResult<1>;
}
