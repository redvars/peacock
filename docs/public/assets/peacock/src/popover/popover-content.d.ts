import { LitElement } from 'lit';
/**
 * @label Popover Content
 * @tag wc-popover-content
 * @rawTag popover-content
 * @summary The floating panel of a popover, with an optional heading and an arrow pointing at the trigger.
 * @overview
 * <p>The panel of a <code>wc-popover</code>. The popover shows it in the browser's top layer, gives it
 * <code>role="dialog"</code> and names it from the popover's <code>label</code> or from the element in the
 * <code>heading</code> slot.</p>
 * @tags display
 *
 * @slot - The popover body.
 * @slot heading - A heading for the panel; it names the dialog when the popover has no `label`.
 *
 * @csspart container - The panel surface.
 * @csspart arrow - The arrow pointing at the trigger; shown when the popover has `arrow`.
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
    /** Whether the popover content is visible. Set by the enclosing `wc-popover`. */
    open: boolean;
    /** Shows the arrow that points at the trigger. Set by the enclosing `wc-popover`. */
    arrow: boolean;
    /** The arrow element, positioned by the popover's floating-ui arrow middleware. */
    arrowElement?: HTMLElement | null;
    render(): import("lit-html").TemplateResult<1>;
}
