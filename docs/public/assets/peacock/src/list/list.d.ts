import { LitElement } from 'lit';
import { ListItem } from './list-item.js';
/**
 * @label List
 * @tag wc-list
 * @rawTag list
 *
 * @summary A list container for one or more list items.
 *
 * @example
 * ```html
 * <wc-list>
 *   <wc-list-item>
 *     <wc-icon slot="leading" name="inbox"></wc-icon>
 *     Inbox
 *     <span slot="trailing">24</span>
 *   </wc-list-item>
 *    <wc-list-item>
 *       <wc-avatar slot="leading" name="Shivaji Varma"></wc-avatar>
 *        Shivaji Varma
 *       <span slot="supporting-text">Software Engineer</span>
 *       <span slot="trailing-supporting-text">7</span>
 *       <wc-icon slot="trailing" name="chevron_right"></wc-icon>
 *     </wc-list-item>
 * </wc-list>
 * ```
 * @tags display
 */
export declare class List extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    static Item: typeof ListItem;
    /**  */
    variant: 'standard' | 'segmented';
    /** Index of the currently active item within the clickable items list. */
    private activeIndex;
    connectedCallback(): void;
    disconnectedCallback(): void;
    focus(): void;
    get items(): ListItem[];
    private _clickableItems;
    private _syncRovingTabIndex;
    private _setActiveByOffset;
    private _setBoundaryActive;
    private _getActiveItem;
    private _getFirstClickableItem;
    private _isEventFromThisList;
    private _clickableItemFromEvent;
    private _setActiveItem;
    private _onKeyDown;
    private _onClick;
    private _onSlotChange;
    render(): import("lit-html").TemplateResult<1>;
}
