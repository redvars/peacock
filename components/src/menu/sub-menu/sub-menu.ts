import { html, LitElement } from 'lit';
import { property, queryAssignedElements } from 'lit/decorators.js';
import styles from './sub-menu.scss';
import { MenuItem } from '../menu-item/menu-item.js';
import { Menu, type MenuCloseDetail } from '../menu/menu.js';
import IndividualComponent from '@/IndividualComponent.js';

let subMenuIdCounter = 0;

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
@IndividualComponent
export class SubMenu extends LitElement {
  static styles = [styles];

  /** Milliseconds the pointer rests on the item before the submenu opens. */
  @property({ type: Number, attribute: 'hover-open-delay' })
  hoverOpenDelay = 120;

  /** Milliseconds after the pointer leaves before the submenu closes. */
  @property({ type: Number, attribute: 'hover-close-delay' })
  hoverCloseDelay = 180;

  @queryAssignedElements({ slot: 'item' })
  private readonly _items!: Element[];

  @queryAssignedElements({ slot: 'menu' })
  private readonly _menus!: Element[];

  private _openTimeout?: number;

  private _closeTimeout?: number;

  private _resolveAnchorElement(item: MenuItem): HTMLElement {
    return item.itemElement ?? item;
  }

  private readonly _onChildMenuOpened = (event: Event) => {
    const { item } = this;
    // `open` bubbles: a deeper submenu's event is not this menu's own.
    if (!item || event.target !== event.currentTarget) {
      return;
    }

    item.submenuOpen = true;
    item.setAttribute('aria-expanded', 'true');
  };

  private readonly _onChildMenuClosed = (event: Event) => {
    const { item } = this;
    // `close` bubbles: a deeper submenu's event is not this menu's own.
    if (!item || event.target !== event.currentTarget) {
      return;
    }

    item.submenuOpen = false;
    item.setAttribute('aria-expanded', 'false');

    const reason = (event as CustomEvent<Partial<MenuCloseDetail>>).detail
      ?.cause;
    if (reason?.kind === 'click-selection') {
      // Picking an item in the submenu completes the whole menu, so close the parent too.
      this._parentMenu()?.close({ kind: 'click-selection' });
    } else if (reason?.kind === 'keydown' && reason.key === 'Escape') {
      item.tabIndex = 0;
      item.focus();
    }
  };

  /** The menu this sub-menu sits in. */
  private _parentMenu(): Menu | null {
    const parent = this.parentElement?.closest('wc-menu');
    return parent instanceof Menu ? parent : null;
  }

  get item(): MenuItem | null {
    const [candidate] = this._items ?? [];
    return candidate instanceof MenuItem ? candidate : null;
  }

  get menu(): Menu | null {
    const [candidate] = this._menus ?? [];
    return candidate instanceof Menu ? candidate : null;
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('mouseenter', this._onMouseEnter);
    this.addEventListener('mouseleave', this._onMouseLeave);
  }

  disconnectedCallback() {
    const { menu } = this;
    menu?.removeEventListener('open', this._onChildMenuOpened);
    menu?.removeEventListener('close', this._onChildMenuClosed);
    this.removeEventListener('mouseenter', this._onMouseEnter);
    this.removeEventListener('mouseleave', this._onMouseLeave);
    window.clearTimeout(this._openTimeout);
    window.clearTimeout(this._closeTimeout);
    super.disconnectedCallback();
  }

  async show() {
    const { item, menu } = this;
    if (!item || !menu) {
      return;
    }

    menu.anchorElement = this._resolveAnchorElement(item);
    menu.isSubmenu = true;
    menu.variant = this._parentMenu()?.variant ?? menu.variant;
    // Hovering opens the submenu without moving focus; the keyboard path focuses the first item.
    menu.noAutofocus = true;
    menu.show();

    item.hasSubmenu = true;
    item.submenuOpen = true;
    item.setAttribute('aria-expanded', 'true');
  }

  async close() {
    const { item, menu } = this;
    if (!item || !menu) {
      return;
    }

    menu.close({ kind: 'programmatic' });
    item.submenuOpen = false;
    item.setAttribute('aria-expanded', 'false');
  }

  render() {
    return html`
      <slot
        name="item"
        @slotchange=${this._onSlotChange}
        @click=${this._onItemClick}
        @keydown=${this._onItemKeyDown}
      ></slot>
      <slot
        name="menu"
        @slotchange=${this._onSlotChange}
        @keydown=${this._onMenuKeyDown}
      ></slot>
    `;
  }

  private _onSlotChange = () => {
    const { item, menu } = this;
    if (!item || !menu) {
      return;
    }

    if (!menu.id) {
      subMenuIdCounter += 1;
      menu.id = `wc-sub-menu-${subMenuIdCounter}`;
    }

    item.keepOpen = true;
    item.hasSubmenu = true;
    item.submenuOpen = menu.open;
    item.setAttribute('aria-haspopup', 'menu');
    item.setAttribute('aria-expanded', String(menu.open));
    item.setAttribute('aria-controls', menu.id);

    menu.removeEventListener('open', this._onChildMenuOpened);
    menu.removeEventListener('close', this._onChildMenuClosed);
    menu.addEventListener('open', this._onChildMenuOpened);
    menu.addEventListener('close', this._onChildMenuClosed);

    menu.isSubmenu = true;
    menu.anchorElement = this._resolveAnchorElement(item);
    // Logical, so the submenu opens on the left in right-to-left pages.
    menu.placement = 'end-start';
    menu.offset = 4;
  };

  private _onItemClick = () => {
    if (this.menu?.open) {
      this.close();
      return;
    }

    this.show();
  };

  private _onItemKeyDown = async (event: KeyboardEvent) => {
    const isRtl = getComputedStyle(this).direction === 'rtl';
    const arrowEnter = isRtl ? 'ArrowLeft' : 'ArrowRight';

    const shouldOpen =
      event.key === arrowEnter || event.key === 'Enter' || event.key === ' ';

    if (!shouldOpen) {
      return;
    }

    event.preventDefault();
    if (event.key === arrowEnter) {
      event.stopPropagation();
    }

    await this.show();
    const firstItem = this.menu?.items.find(menuItem => !menuItem.disabled);
    if (firstItem) {
      firstItem.tabIndex = 0;
      firstItem.focus();
    }
  };

  private _onMenuKeyDown = async (event: KeyboardEvent) => {
    const isRtl = getComputedStyle(this).direction === 'rtl';
    const arrowExit = isRtl ? 'ArrowRight' : 'ArrowLeft';

    if (event.key !== 'Escape' && event.key !== arrowExit) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    await this.close();

    const { item } = this;
    if (item) {
      item.tabIndex = 0;
      item.focus();
    }
  };

  private _onMouseEnter = () => {
    window.clearTimeout(this._closeTimeout);
    this._openTimeout = window.setTimeout(() => {
      this.show();
    }, this.hoverOpenDelay);
  };

  private _onMouseLeave = (event: MouseEvent) => {
    const { relatedTarget: related } = event;
    if (related instanceof Node && this.contains(related)) {
      return;
    }

    window.clearTimeout(this._openTimeout);
    this._closeTimeout = window.setTimeout(() => {
      this.close();
    }, this.hoverCloseDelay);
  };
}
