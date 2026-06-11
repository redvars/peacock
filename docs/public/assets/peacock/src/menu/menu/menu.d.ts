import { LitElement } from 'lit';
import type { Placement } from '@floating-ui/dom';
import { MenuItem } from '../menu-item/menu-item.js';
type CloseReason = {
    kind: 'click-selection';
} | {
    kind: 'keydown';
    key: string;
} | {
    kind: 'outside-click';
} | {
    kind: 'focusout';
} | {
    kind: 'programmatic';
};
/**
 * @label Menu
 * @tag wc-menu
 * @rawTag menu
 * @summary A list of menu items.
 * @tags navigation
 *
 * @example
 * ```html
 * <wc-menu preview>
 *   <wc-menu-item>Item 1</wc-menu-item>
 *   <wc-menu-item selected>Item 2</wc-menu-item>
 * </wc-menu>
 * ```
 */
export declare class Menu extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    static Item: typeof MenuItem;
    /** Whether the menu is currently visible. */
    open: boolean;
    /** Visual variant of the menu. `"vibrant"` applies stronger color emphasis. */
    variant: 'standard' | 'vibrant';
    /** ID of the anchor element the menu is positioned relative to. */
    anchor: string;
    /** When true, renders the menu in a static preview state (always visible, no animation). */
    preview: boolean;
    /** When true, the menu will not close when a click occurs outside it. */
    stayOpenOnOutsideClick: boolean;
    /** When true, the menu will not close when focus leaves it. */
    stayOpenOnFocusout: boolean;
    /** Set to true when this menu is being used as a submenu inside another menu. */
    isSubmenu: boolean;
    /** Floating UI placement of the menu relative to its anchor. */
    placement: Placement;
    /** Distance in pixels between the menu and its anchor element. */
    offset: number;
    /** Index of the currently focused/active item within the enabled items list. */
    private activeIndex;
    private readonly menuListElement;
    /** Direct reference to the anchor element; takes precedence over the `anchor` ID property. */
    anchorElement: HTMLElement | null;
    /** Controller managing floating-UI positioning. */
    private readonly _floatingController;
    /** Element that had focus before the menu opened; restored on close. */
    private _lastFocusedElement;
    /** Reason that triggered the most recent close, included in the `closed` event detail. */
    private _closeReason;
    connectedCallback(): void;
    disconnectedCallback(): void;
    get items(): MenuItem[];
    show(): void;
    close(reason?: CloseReason): void;
    focus(): void;
    private _resolveAnchorElement;
    private _syncAnchorAria;
    private _enabledItems;
    private _syncRovingTabIndex;
    private _setActiveByOffset;
    private _setBoundaryActive;
    private _getActiveItem;
    private _getFirstEnabledItem;
    private _isEventFromThisMenu;
    private _ownedItemFromEvent;
    private _setActiveItem;
    private _dispatchItemActivate;
    private _onClick;
    private _onKeyDown;
    private _onSlotChange;
    private _applyPositioning;
    protected updated(changedProperties: Map<string, unknown>): void;
    render(): import("lit-html").TemplateResult<1>;
}
export {};
