import { LitElement } from 'lit';
type ContainerSize = 'max' | 'xl' | 'lg' | 'md' | 'sm' | 'full';
/**
 * @label Container
 * @tag wc-container
 * @rawTag container
 * @summary A centred block that caps the width of page content at a breakpoint size and pads it.
 *
 * @overview
 * <p><code>size</code> sets the maximum width: <code>sm</code>, <code>md</code>, <code>lg</code>,
 * <code>xl</code> or <code>max</code>, from the matching <code>--container-*</code> tokens, or
 * <code>full</code> (the default) for no maximum. <code>--container-max-width</code> overrides the
 * width for any size. The content is centred and padded with <code>--container-padding</code>,
 * and gains side margins once the container is 672px wide or more (measured with a container
 * query, not the viewport).</p>
 * <p>It is layout only, with no behaviour or events.</p>
 * @cssprop --container-max-width - Controls the maximum width of the container.
 * @cssprop --container-padding - Controls the padding of the container.
 * @tags layout
 *
 * @example
 * ```html
 * <wc-container style="width: 80%; border: 1px dotted black;" size="md">Content</wc-container>
 * ```
 */
export declare class Container extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /**
     * Max-width breakpoint of the container.
     * Possible values are `"max"`, `"xl"`, `"lg"`, `"md"`, `"sm"`, `"full"`. Defaults to `"full"`.
     */
    size: ContainerSize;
    render(): import("lit-html").TemplateResult<1>;
}
export {};
