import { LitElement } from 'lit';
declare const Item_base: import("../__internal/mixins/mixin.js").MixinReturn<import("../__internal/mixins/mixin.js").MixinReturn<typeof LitElement, import("@/__internal/mixins/element-internals.js").WithElementInternals>>;
/**
 * @label Item
 * @tag wc-item
 * @rawTag item
 *
 * @summary A primitive element used to build higher-level item components such as menu-item, navigation-item, and list-item. Provides start, text, and end slots for flexible content composition.
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
