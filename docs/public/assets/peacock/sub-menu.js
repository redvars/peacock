import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { o } from './query-assigned-elements-BJaGSqM0.js';
import { MenuItem } from './menu-item.js';
import { Menu } from './menu.js';
import './base-Cl6v8-BZ.js';
import './query-CHb9Ft_d.js';
import './if-defined-BXZpRQ4P.js';
import './NativeHyperlinkMixin-D9J4aBTy.js';
import './is-link-Dk2OV3PM.js';
import './class-map-DG7CA1et.js';
import './directive-ZPhl09Yt.js';
import './state-DkTK9EGF.js';
import './floating-controller-CZYwnRVu.js';
import './floating-ui.dom-oQieRCpS.js';

var css_248z = i`* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.screen-reader-only {
  display: none !important;
}

[hidden] {
  display: none !important;
}

:host {
  display: contents;
  --sub-menu-item-backdrop-container-shape-start-start: none;
  --sub-menu-item-backdrop-container-shape-start-end: none;
  --sub-menu-item-backdrop-container-shape-end-start: none;
  --sub-menu-item-backdrop-container-shape-end-end: none;
  --sub-menu-item-backdrop-elevation-level-block-start: none;
  --sub-menu-item-backdrop-elevation-level-block-end: none;
}

slot[name=item]::slotted(wc-menu-item) {
  --menu-item-backdrop-container-shape-start-start: var(
    --sub-menu-item-backdrop-container-shape-start-start
  );
  --menu-item-backdrop-container-shape-start-end: var(
    --sub-menu-item-backdrop-container-shape-start-end
  );
  --menu-item-backdrop-container-shape-end-start: var(
    --sub-menu-item-backdrop-container-shape-end-start
  );
  --menu-item-backdrop-container-shape-end-end: var(
    --sub-menu-item-backdrop-container-shape-end-end
  );
  --menu-item-backdrop-elevation-level-block-start: var(
    --sub-menu-item-backdrop-elevation-level-block-start
  );
  --menu-item-backdrop-elevation-level-block-end: var(
    --sub-menu-item-backdrop-elevation-level-block-end
  );
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
 */
let SubMenu = class SubMenu extends i$1 {
    constructor() {
        super(...arguments);
        this.hoverOpenDelay = 120;
        this.hoverCloseDelay = 180;
        this.anchorCorner = 'start-end';
        this.menuCorner = 'start-start';
        this._onChildMenuOpened = () => {
            const { item } = this;
            if (!item) {
                return;
            }
            item.submenuOpen = true;
            item.setAttribute('aria-expanded', 'true');
        };
        this._onChildMenuClosed = () => {
            const { item } = this;
            if (!item) {
                return;
            }
            item.submenuOpen = false;
            item.setAttribute('aria-expanded', 'false');
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
            menu.removeEventListener('opened', this._onChildMenuOpened);
            menu.removeEventListener('closed', this._onChildMenuClosed);
            menu.addEventListener('opened', this._onChildMenuOpened);
            menu.addEventListener('closed', this._onChildMenuClosed);
            menu.isSubmenu = true;
            menu.anchorElement = this._resolveAnchorElement(item);
            menu.placement =
                getComputedStyle(this).direction === 'rtl' ? 'left-start' : 'right-start';
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
        this._onCloseMenu = async (event) => {
            const { reason } = event.detail ?? {};
            const { key } = reason ?? {};
            if (reason?.kind === 'keydown' && key === 'Escape') {
                event.stopPropagation();
                await this.close();
                this.item?.focus();
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
        //@ts-ignore
        return item.itemElement?.itemElement ?? item.itemElement ?? item;
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
        menu.anchorElement = this._resolveAnchorElement(item);
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
        @close-menu=${this._onCloseMenu}
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
    n({ type: String, attribute: 'anchor-corner' })
], SubMenu.prototype, "anchorCorner", void 0);
__decorate([
    n({ type: String, attribute: 'menu-corner' })
], SubMenu.prototype, "menuCorner", void 0);
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
