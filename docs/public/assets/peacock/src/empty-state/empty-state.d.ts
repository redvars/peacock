import { LitElement, nothing } from 'lit';
/**
 * @label Empty State
 * @tag wc-empty-state
 * @rawTag empty-state
 * @summary A message that displays when there is no information to display.
 * @tags display
 *
 * @example
 * ```html
 * <wc-empty-state style="width:100%" headline="No items found"></wc-empty-state>
 * ```
 */
export declare class EmptyState extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    illustration: 'no-document' | 'page' | 'search';
    headline: string;
    description: string;
    /** True when the component width is below 768px; triggers a stacked layout. */
    private vertical;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private handleResize;
    __renderTitle(): typeof nothing | import("lit-html").TemplateResult<1>;
    __renderDescription(): typeof nothing | import("lit-html").TemplateResult<1>;
    protected render(): import("lit-html").TemplateResult<1>;
}
