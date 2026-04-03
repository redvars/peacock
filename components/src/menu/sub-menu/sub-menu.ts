import { html, LitElement } from 'lit';
import { property, queryAssignedElements } from 'lit/decorators.js';
import styles from './sub-menu.scss';
import { MenuItem } from '../menu-item/menu-item.js';
import { Menu } from '../menu/menu.js';

let subMenuIdCounter = 0;

/**
 * @label Sub Menu
 * @tag wc-sub-menu
 * @rawTag sub-menu
 * @parentRawTag menu
 * @summary Connects a menu item to a nested menu.
 */
export class SubMenu extends LitElement {
  static styles = [styles];

  @property({ type: Number, attribute: 'hover-open-delay' })
  hoverOpenDelay = 120;

  @property({ type: Number, attribute: 'hover-close-delay' })
  hoverCloseDelay = 180;

  @property({ type: String, attribute: 'anchor-corner' })
  anchorCorner = 'start-end';

  @property({ type: String, attribute: 'menu-corner' })
  menuCorner = 'start-start';

  @queryAssignedElements({ slot: 'item' })
  private readonly _items!: Element[];

  @queryAssignedElements({ slot: 'menu' })
  private readonly _menus!: Element[];

  private _openTimeout?: number;

  private _closeTimeout?: number;

  private readonly _onChildMenuOpened = () => {
    const { item } = this;
    if (!item) {
      return;
    }

    item.submenuOpen = true;
    item.setAttribute('aria-expanded', 'true');
  };

  private readonly _onChildMenuClosed = () => {
    const { item } = this;
    if (!item) {
      return;
    }

    item.submenuOpen = false;
    item.setAttribute('aria-expanded', 'false');
  };

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
    menu?.removeEventListener('opened', this._onChildMenuOpened);
    menu?.removeEventListener('closed', this._onChildMenuClosed);
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

    menu.anchorElement = item;
    menu.isSubmenu = true;
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
        @close-menu=${this._onCloseMenu}
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

    menu.removeEventListener('opened', this._onChildMenuOpened);
    menu.removeEventListener('closed', this._onChildMenuClosed);
    menu.addEventListener('opened', this._onChildMenuOpened);
    menu.addEventListener('closed', this._onChildMenuClosed);

    menu.isSubmenu = true;
    menu.anchorElement = item;
    menu.placement =
      getComputedStyle(this).direction === 'rtl' ? 'left-start' : 'right-start';
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

  private _onCloseMenu = async (
    event: CustomEvent<{ reason?: { kind?: string; key?: string } }>,
  ) => {
    const { reason } = event.detail ?? {};
    const { key } = reason ?? {};
    if (reason?.kind === 'keydown' && key === 'Escape') {
      event.stopPropagation();
      await this.close();
      this.item?.focus();
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
