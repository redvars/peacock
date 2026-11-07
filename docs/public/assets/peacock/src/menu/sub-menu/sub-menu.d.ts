import { LitElement } from 'lit';
import { MenuItem } from '../menu-item/menu-item.js';
import { Menu } from '../menu/menu.js';
/**
 * @label Sub Menu
 * @tag wc-sub-menu
 * @rawTag sub-menu
 * @summary Connects a menu item to a nested menu.
 *
 * @overview
 * <p>Put it inside a <code>wc-menu</code>, with a <code>wc-menu-item</code> in the
 * <code>item</code> slot and a <code>wc-menu</code> in the <code>menu</code> slot. The nested menu
 * opens beside the item (on the left in right-to-left pages), takes the parent menu's
 * <code>variant</code>, and the item gets <code>aria-haspopup</code>,
 * <code>aria-expanded</code> and <code>aria-controls</code>.</p>
 * <p>Clicking the item opens or closes the nested menu. Resting the pointer on it opens the menu
 * after <code>hover-open-delay</code> (120ms) without moving focus, and leaving closes it after
 * <code>hover-close-delay</code> (180ms).</p>
 * <p>ArrowRight (ArrowLeft in right-to-left pages), Enter or Space on the item opens the nested
 * menu and focuses its first enabled item. Escape or ArrowLeft (ArrowRight in right-to-left
 * pages) closes it and returns focus to the item. Choosing an item in the nested menu closes the
 * parent menu too. <code>show()</code> and <code>close()</code> open and close it from code.</p>
 */
export declare class SubMenu extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /** Milliseconds the pointer rests on the item before the submenu opens. */
    hoverOpenDelay: number;
    /** Milliseconds after the pointer leaves before the submenu closes. */
    hoverCloseDelay: number;
    private readonly _items;
    private readonly _menus;
    private _openTimeout?;
    private _closeTimeout?;
    private _resolveAnchorElement;
    private readonly _onChildMenuOpened;
    private readonly _onChildMenuClosed;
    /** The menu this sub-menu sits in. */
    private _parentMenu;
    get item(): MenuItem | null;
    get menu(): Menu | null;
    connectedCallback(): void;
    disconnectedCallback(): void;
    show(): Promise<void>;
    close(): Promise<void>;
    render(): import("lit-html").TemplateResult<1>;
    private _onSlotChange;
    private _onItemClick;
    private _onItemKeyDown;
    private _onMenuKeyDown;
    private _onMouseEnter;
    private _onMouseLeave;
}
