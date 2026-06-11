import { LitElement } from 'lit';
/**
 * @label Popover Content
 * @tag wc-popover-content
 * @rawTag popover-content
 * @summary Content container for the wc-popover component.
 * @tags display
 *
 * @cssprop --popover-content-background - Background color of the popover content. Defaults to `var(--color-surface-container)`.
 * @cssprop --popover-content-padding - Padding of the popover content. Defaults to `var(--spacing-200)`.
 * @cssprop --popover-content-border-radius - Border radius of the popover content. Defaults to `var(--shape-corner-small)`.
 * @cssprop --popover-content-min-width - Minimum width of the popover content. Defaults to `10rem`.
 *
 * @example
 * ```html
 * <wc-popover-content>
 *   <p>Popover body text</p>
 * </wc-popover-content>
 * ```
 */
export declare class PopoverContent extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /**
     * Whether the popover content is visible.
     */
    open: boolean;
    render(): import("lit-html").TemplateResult<1>;
}
