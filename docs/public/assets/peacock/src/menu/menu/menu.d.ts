import { LitElement } from 'lit';
import type { CloseReason } from '../../__internal/controllers/overlay-controller.js';
import { type OverlayPlacement } from '../../__internal/utils/placement.js';
import { MenuItem } from '../menu-item/menu-item.js';
export type MenuCloseReason = {
    kind: 'click-selection';
} | {
    kind: 'keydown';
    key: string;
} | {
    kind: 'outside-click';
} | {
    kind: 'programmatic';
};
/** `detail` of the menu's `close` event. */
export interface MenuCloseDetail {
    /** The shared overlay close reason (ADR-030001). */
    reason: CloseReason;
    /** The menu's own, more detailed reason. */
    cause: MenuCloseReason;
}
/** Which item receives focus when the menu opens or `focus()` is called. */
export type MenuFocusTarget = 'active' | 'first' | 'last';
/**
 * @label Menu
 * @tag wc-menu
 * @rawTag menu
 * @summary A list of actions or choices that opens next to a button or another element.
 * @overview
 * <p>A menu opens next to an anchor element, in the browser's top layer, so it shows above dialogs,
 * sticky headers and any parent with <code>overflow: hidden</code>. Items are <code>wc-menu-item</code>
 * elements; a <code>wc-divider</code> separates groups and a <code>wc-sub-menu</code> nests a menu.</p>
 * <p>Keyboard: when the menu opens, focus moves to the selected item or the first enabled one. Arrow
 * Up/Down move with wrap-around, Home/End jump to the ends, typing a letter jumps to the next item
 * starting with it, Enter/Space activate, Escape closes and returns focus to the trigger, Tab closes.</p>
 * <p>Choices: items with <code>type="checkbox"</code> toggle <code>selected</code> and keep the menu
 * open; items with <code>type="radio"</code> select themselves, clear the other radio items between
 * the same <code>wc-divider</code>s and close the menu. The new state is set before
 * <code>menu-item-activate</code> fires.</p>
 *
 * @cssprop --menu-container-color - Background of the standard menu surface.
 * @cssprop --menu-item-label-color - Text color of the items.
 * @cssprop --menu-item-icon-color - Color of leading and trailing icons.
 * @cssprop --menu-item-selected-container-color - Background of selected items.
 * @cssprop --menu-item-selected-label-color - Text and icon color of selected items.
 * @cssprop --menu-max-height - Maximum height before the menu scrolls. Defaults to `20rem`; the menu never grows past the viewport.
 * @cssprop --menu-min-width - Minimum width of the menu. Defaults to `112px`.
 * @cssprop --menu-width - Width of the menu. Defaults to `max-content`.
 *
 * @fires {CustomEvent} open - Dispatched after the menu opens. Bubbles and is composed: check `event.target` to tell a submenu's event from the menu's own.
 * @fires {CustomEvent<{reason: 'escape' | 'light-dismiss' | 'action' | 'api', cause: MenuCloseReason}>} close - Dispatched after the menu closes. `reason` is the shared overlay reason (an item pick is `action`, Escape `escape`, a press outside or Tab `light-dismiss`, `close()` / `open = false` `api`); `cause` is the menu's detailed reason. Bubbles and is composed.
 * @fires {CustomEvent<{item: MenuItem}>} menu-item-activate - Dispatched when an item is activated.
 *
 * @example
 * ```html
 * <wc-menu preview>
 *   <wc-menu-item>Item 1</wc-menu-item>
 *   <wc-menu-item selected>Item 2</wc-menu-item>
 * </wc-menu>
 * ```
 * @tags navigation
 */
export declare class Menu extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    static Item: typeof MenuItem;
    /** Whether the menu is currently visible. */
    open: boolean;
    /**
     * Visual variant.
     * `"standard"` is one elevated surface; dividers are hairlines.
     * `"expressive"` splits the menu into separate rounded segments at each `wc-divider`.
     */
    variant: 'standard' | 'expressive';
    /** ID of the anchor element the menu is positioned relative to. */
    anchor: string;
    /**
     * Renders the menu statically in the page flow, without positioning or the top layer. For the
     * documentation demos only; not part of the public API.
     * @internal
     */
    preview: boolean;
    /** When true, the menu will not close when a click occurs outside it. */
    stayOpenOnOutsideClick: boolean;
    /** When true, opening the menu leaves focus where it is instead of moving it to an item. */
    noAutofocus: boolean;
    /**
     * Set by `wc-sub-menu` on the menu it nests.
     * @internal
     */
    isSubmenu: boolean;
    /**
     * Where the menu opens relative to its anchor: `top`, `bottom`, `start` or `end`, optionally
     * followed by `-start` or `-end` (ADR-030001). `start` and `end` follow the writing direction.
     * Defaults to `"bottom-start"`.
     */
    placement: OverlayPlacement;
    /** Distance in pixels between the menu and its anchor element. */
    offset: number;
    /** Index of the currently focused/active item within the enabled items list. */
    private activeIndex;
    private readonly menuListElement;
    /**
     * Direct reference to the anchor element; takes precedence over the `anchor` ID property. Set by
     * the components that own a menu (dropdown button, split button, select, sub-menu).
     * @internal
     */
    anchorElement: HTMLElement | null;
    /** Controller managing floating-UI positioning. */
    private readonly _floatingController;
    /** Element that had focus before the menu opened; restored on close. */
    private _lastFocusedElement;
    /** Reason that triggered the most recent close, sent as `cause` in the `close` event detail. */
    private _closeReason;
    /** Item to focus when the menu opens; set by `show()`. */
    private _openFocus;
    private _typeaheadBuffer;
    private _typeaheadTimer?;
    private _exitTimer?;
    /** Elements that carry `data-position-*` attributes from the last sync. */
    private _positionedElements;
    connectedCallback(): void;
    disconnectedCallback(): void;
    /** The items this menu owns: slotted `wc-menu-item`s (and subclasses) and the items of slotted `wc-sub-menu`s. */
    get items(): MenuItem[];
    /** Opens the menu. `focusTarget` picks the item that receives focus. */
    show(focusTarget?: MenuFocusTarget): void;
    close(reason?: MenuCloseReason): void;
    /** Opens the menu when it is closed and closes it when it is open. */
    toggle(): void;
    /** Focuses an item: the selected or last active one (`"active"`), the first or the last. */
    focus(target?: MenuFocusTarget | FocusOptions): void;
    private _slottedElements;
    /** The item that represents a slotted element: the element itself or the item of a `wc-sub-menu`. */
    private _resolveItem;
    private _resolveAnchorElement;
    private _syncAnchorAria;
    private _enabledItems;
    /** Re-reads the items after they change (for example when a select filters its options). */
    syncItems(): void;
    private _syncRovingTabIndex;
    private _setActiveByOffset;
    private _setBoundaryActive;
    private _getActiveItem;
    private _isEventFromThisMenu;
    private _ownedItemFromEvent;
    private _setActiveItem;
    private _dispatchItemActivate;
    /** Moves focus to the next item whose label starts with the typed characters. */
    private _typeahead;
    private _onClick;
    /** Toggles a checkbox item, or selects a radio item and clears the others of its group. */
    private _applyChoice;
    /** The radio items in the same group as `item`: those between the same `wc-divider`s. */
    private _radioGroup;
    private _onKeyDown;
    private _onSlotChange;
    /** Sets `has-icons` and, for the expressive variant, the segment position attributes. */
    private _syncLayout;
    /** Shows the menu surface in the top layer, or hides it there once the exit transition ends. */
    private _syncLayer;
    private _applyPositioning;
    protected updated(changedProperties: Map<string, unknown>): void;
    /** The focused element, looking through open shadow roots. */
    private _deepActiveElement;
    /** Whether focus is in this menu (or nowhere), so restoring it does not steal focus from elsewhere. */
    private _focusIsInside;
    render(): import("lit-html").TemplateResult<1>;
}
