import { LitElement } from 'lit';
import { MenuItem } from '../menu-item/menu-item.js';
import { Menu } from '../menu/menu.js';
/**
 * @label Sub Menu
 * @tag wc-sub-menu
 * @rawTag sub-menu
 * @summary Connects a menu item to a nested menu.
 */
export declare class SubMenu extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    hoverOpenDelay: number;
    hoverCloseDelay: number;
    anchorCorner: string;
    menuCorner: string;
    private readonly _items;
    private readonly _menus;
    private _openTimeout?;
    private _closeTimeout?;
    private _resolveAnchorElement;
    private readonly _onChildMenuOpened;
    private readonly _onChildMenuClosed;
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
    private _onCloseMenu;
    private _onMouseEnter;
    private _onMouseLeave;
}
