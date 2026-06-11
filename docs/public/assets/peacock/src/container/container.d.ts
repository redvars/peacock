import { LitElement } from 'lit';
type ContainerSize = 'max' | 'xl' | 'lg' | 'md' | 'sm' | 'full';
/**
 * @label Container
 * @tag wc-container
 * @rawTag container
 * @summary A responsive container component for layout.
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
