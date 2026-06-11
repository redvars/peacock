import { LitElement } from 'lit';
import { AccordionItem } from './accordion-item.js';
/**
 * @label Accordion
 * @tag wc-accordion
 * @rawTag accordion
 * @summary A vertically stacked set of expansion panels.
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
    items: Array<AccordionItem>;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private _onItemToggle;
    private _onKeyDown;
    render(): import("lit-html").TemplateResult<1>;
    static Item: typeof AccordionItem;
}
