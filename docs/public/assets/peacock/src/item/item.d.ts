import { LitElement } from 'lit';
declare const Item_base: import("../__internal/mixins/mixin.js").MixinReturn<import("../__internal/mixins/mixin.js").MixinReturn<typeof LitElement, import("@/__internal/mixins/element-internals.js").WithElementInternals>>;
/**
 * @label Item
 * @tag wc-item
 * @rawTag item
 *
 * @summary The layout that list items and menu items are built on, with start, text and end areas.
 *
 * @overview
 * <p>Not used on its own: <code>wc-list-item</code> and <code>wc-menu-item</code> render it.</p>
 * <p>Content goes in named slots: <code>start</code> before the text; <code>overline</code>, the
 * default slot, <code>headline</code> and <code>supporting-text</code> in the text column;
 * <code>trailing-supporting-text</code> and <code>end</code> after it; and <code>container</code>
 * behind the item. The start, trailing supporting text and end areas are hidden while they are
 * empty.</p>
 * <p>When more than one text slot has content the item sets <code>multiline</code>, which gives it a
 * taller minimum height. Set <code>multiline</code> yourself only for server-side rendering of a
 * two-line item, to avoid a flash of unstyled content.</p>
 *
 * @internal Not part of the public API: use `wc-list-item` or `wc-menu-item`. It stays
 * registered because those components render it.
 *
 * @example
 * ```html
 * <wc-item>
 *   <wc-icon slot="start" name="notifications"></wc-icon>
 *
 *   <span slot="headline">Notifications</span>
 *   <span slot="supporting-text">Manage alerts and reminders</span>
 *
 *   <span slot="trailing-supporting-text">3</span>
 *   <wc-icon slot="end" name="chevron_right"></wc-icon>
 * </wc-item>
 * ```
 * @tags display
 */
export declare class Item extends Item_base {
    static styles: import("lit").CSSResultGroup[];
    /**
     * Only needed for SSR.
     *
     * Add this attribute when an item has two lines to avoid a Flash Of Unstyled
     * Content. This attribute is not needed for single line items or items with
     * three or more lines.
     */
    multiline: boolean;
    private readonly textSlots;
    private __hasNamedSlot;
    render(): import("lit-html").TemplateResult<1>;
    private handleTextSlotChange;
}
export {};
