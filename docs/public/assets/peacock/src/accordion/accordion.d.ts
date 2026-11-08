import { LitElement } from 'lit';
import { AccordionItem } from './accordion-item.js';
/**
 * @label Accordion
 * @tag wc-accordion
 * @rawTag accordion
 * @summary A stack of panels whose headers the person opens to show or hide their content.
 * @overview
 * <p>Every panel header is in the Tab order; the Up and Down arrow keys also move focus between
 * the headers, Home and End jump to the first and last. Disabled panels are skipped. Without
 * <code>multiple</code>, opening a panel (by the person or by setting <code>open</code>) closes
 * the others.</p>
 * <p>Items fire <code>open</code> and <code>close</code>.</p>
 *
 * @example
 * ```html
 * <wc-accordion>
 *   <wc-accordion-item>
 *     <span slot="heading">Panel 1</span>
 *     <span slot="description">Summary text</span>
 *     Content
 *   </wc-accordion-item>
 *   <wc-accordion-item>
 *     <span slot="heading">Panel 2</span>
 *     Content
 *   </wc-accordion-item>
 * </wc-accordion>
 * ```
 * @tags display
 */
export declare class Accordion extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    static Item: typeof AccordionItem;
    /**
     * Whether multiple panels can be expanded simultaneously.
     * When `false` (default), expanding one panel collapses all others.
     */
    multiple: boolean;
    /**
     * Variant for the accordion.
     * `'default'` renders panels with a subtle background on expand and dividers between items.
     * `'flat'` renders panels without borders or background changes — suitable for use inside cards.
     */
    variant: 'default' | 'flat';
    /**
     * When `true`, the toggle icon is placed at the leading start of the header.
     * When `false` (default), the icon is placed at the trailing end.
     */
    leadingToggle: boolean;
    /** The `wc-accordion-item` children slotted into the accordion. */
    items: Array<AccordionItem>;
    /** Up/Down, Home and End move focus between the header buttons. */
    private readonly roving;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private __handleItemOpen;
    private __handleSlotChange;
    render(): import("lit-html").TemplateResult<1>;
}
