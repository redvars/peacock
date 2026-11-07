import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { o } from './query-assigned-elements-BJaGSqM0.js';
import { MenuItem } from './menu-item.js';
import { Menu } from './menu.js';
import './base-Cl6v8-BZ.js';
import './query-CHb9Ft_d.js';
import './if-defined-D9DEJR_6.js';
import './class-map-NDIkZErE.js';
import './directive-ZPhl09Yt.js';
import './base-button-Do2TUy8M.js';
import './throttle-SQ9t-HL7.js';
import './warn-once-BNxX1Y98.js';
import './hyperlink-DhE9RlVS.js';
import './element-internals-QME0yEz4.js';
import './is-link-Dk2OV3PM.js';
import './state-BCeDVCI9.js';
import './floating-controller-CbbD1i-z.js';
import './floating-ui.dom-IXnOdYJ1.js';
import './placement-C4GO0JP9.js';

var css_248z = i`* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.screen-reader-only {
  position: absolute !important;
  inline-size: 1px !important;
  block-size: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip-path: inset(50%) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

[hidden] {
  display: none !important;
}

@media (forced-colors: active) {
  .selected,
  [aria-selected=true],
  [aria-pressed=true],
  [aria-checked=true],
  [aria-current]:not([aria-current=false]) {
    outline: 2px solid Highlight;
    outline-offset: -2px;
  }
  .disabled,
  [aria-disabled=true] {
    color: GrayText;
  }
}
:host {
  display: contents;
}

slot[name=menu]::slotted(wc-menu) {
  display: contents;
}`;

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
let SubMenu = class SubMenu extends i$1 {
    constructor() {
        super(...arguments);
        /** Milliseconds the pointer rests on the item before the submenu opens. */
        this.hoverOpenDelay = 120;
        /** Milliseconds after the pointer leaves before the submenu closes. */
        this.hoverCloseDelay = 180;
        this._onChildMenuOpened = (event) => {
            const { item } = this;
            // `open` bubbles: a deeper submenu's event is not this menu's own.
            if (!item || event.target !== event.currentTarget) {
                return;
            }
            item.submenuOpen = true;
            item.setAttribute('aria-expanded', 'true');
        };
        this._onChildMenuClosed = (event) => {
            const { item } = this;
            // `close` bubbles: a deeper submenu's event is not this menu's own.
            if (!item || event.target !== event.currentTarget) {
                return;
            }
            item.submenuOpen = false;
            item.setAttribute('aria-expanded', 'false');
            const reason = event.detail
                ?.cause;
            if (reason?.kind === 'click-selection') {
                // Picking an item in the submenu completes the whole menu, so close the parent too.
                this._parentMenu()?.close({ kind: 'click-selection' });
            }
            else if (reason?.kind === 'keydown' && reason.key === 'Escape') {
                item.tabIndex = 0;
                item.focus();
            }
        };
        this._onSlotChange = () => {
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
        this._onItemClick = () => {
            if (this.menu?.open) {
                this.close();
                return;
            }
            this.show();
        };
        this._onItemKeyDown = async (event) => {
            const isRtl = getComputedStyle(this).direction === 'rtl';
            const arrowEnter = isRtl ? 'ArrowLeft' : 'ArrowRight';
            const shouldOpen = event.key === arrowEnter || event.key === 'Enter' || event.key === ' ';
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
        this._onMenuKeyDown = async (event) => {
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
        this._onMouseEnter = () => {
            window.clearTimeout(this._closeTimeout);
            this._openTimeout = window.setTimeout(() => {
                this.show();
            }, this.hoverOpenDelay);
        };
        this._onMouseLeave = (event) => {
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
    _resolveAnchorElement(item) {
        return item.itemElement ?? item;
    }
    /** The menu this sub-menu sits in. */
    _parentMenu() {
        const parent = this.parentElement?.closest('wc-menu');
        return parent instanceof Menu ? parent : null;
    }
    get item() {
        const [candidate] = this._items ?? [];
        return candidate instanceof MenuItem ? candidate : null;
    }
    get menu() {
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
        return b `
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
};
SubMenu.styles = [css_248z];
__decorate([
    n({ type: Number, attribute: 'hover-open-delay' })
], SubMenu.prototype, "hoverOpenDelay", void 0);
__decorate([
    n({ type: Number, attribute: 'hover-close-delay' })
], SubMenu.prototype, "hoverCloseDelay", void 0);
__decorate([
    o({ slot: 'item' })
], SubMenu.prototype, "_items", void 0);
__decorate([
    o({ slot: 'menu' })
], SubMenu.prototype, "_menus", void 0);
SubMenu = __decorate([
    IndividualComponent
], SubMenu);

export { SubMenu };
//# sourceMappingURL=sub-menu.js.map
