import { LitElement } from 'lit';
/**
 * @label Skeleton
 * @tag wc-skeleton
 * @rawTag skeleton
 * @summary Adds a skeleton effect to an element.
 * @tags display
 *
 * @example
 * ```html
 * <wc-skeleton visible></wc-skeleton>
 * ```
 */
export declare class Skeleton extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /** When true, the skeleton animation is shown. */
    visible: boolean;
    render(): import("lit-html").TemplateResult<1>;
}
