import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { r } from './state-DkTK9EGF.js';
import { e } from './query-CHb9Ft_d.js';
import { e as e$1 } from './class-map-DG7CA1et.js';
import { F as FloatingController } from './floating-controller-CZYwnRVu.js';
import { MenuItem } from './menu-item.js';
import './base-Cl6v8-BZ.js';
import './directive-ZPhl09Yt.js';
import './floating-ui.dom-oQieRCpS.js';
import './if-defined-BXZpRQ4P.js';
import './NativeHyperlinkMixin-D9J4aBTy.js';
import './is-link-Dk2OV3PM.js';

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

.menu {
  display: flex;
  position: fixed;
  z-index: var(--menu-z-index, 1000);
  width: var(--menu-width, max-content);
  max-width: 100vw;
  min-width: 112px;
  transform-origin: top center;
  --_menu-enter-duration: var(--duration-medium1);
  --_menu-exit-duration: var(--duration-medium2);
  --_menu-enter-easing: cubic-bezier(0.05, 0.7, 0.1, 1);
  --_menu-exit-easing: cubic-bezier(0.3, 0, 0.8, 0.15);
  transition-property: opacity, transform, visibility;
  transition-duration: var(--_menu-exit-duration), var(--_menu-exit-duration), 0ms;
  transition-delay: 0ms, 0ms, var(--_menu-exit-duration);
  transition-timing-function: var(--_menu-exit-easing), var(--_menu-exit-easing), linear;
}
.menu.closed {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translateY(-4px) scale(0.97);
}
.menu.open {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translateY(0) scale(1);
  transition-duration: var(--_menu-enter-duration), var(--_menu-enter-duration), 0ms;
  transition-delay: 0ms, 0ms, 0ms;
  transition-timing-function: var(--_menu-enter-easing), var(--_menu-enter-easing), linear;
}
.menu.preview {
  position: relative;
  pointer-events: auto;
}
.menu .menu-content {
  display: flex;
  flex-direction: column;
  z-index: 1;
  width: 100%;
}
.menu .menu-content ::slotted(:first-child) {
  --menu-item-container-shape-start-start: var(--shape-corner-medium);
  --menu-item-container-shape-start-end: var(--shape-corner-medium);
}
.menu .menu-content ::slotted(:last-child) {
  --menu-item-container-shape-end-start: var(--shape-corner-medium);
  --menu-item-container-shape-end-end: var(--shape-corner-medium);
}
.menu .menu-content ::slotted(wc-divider) {
  --divider-spacing: var(--spacing-100);
  padding-inline: var(--spacing-050);
}
.menu .background {
  display: block;
  position: absolute;
  inset: 0;
  border: 1px solid var(--color-red);
  border-start-start-radius: var(--_container-shape-start-start);
  border-start-end-radius: var(--_container-shape-start-end);
  border-end-start-radius: var(--_container-shape-end-start);
  border-end-end-radius: var(--_container-shape-end-end);
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .menu {
    transition: none;
    transform: none;
  }
}
.menu {
  --_container-shape-start-start: var(--shape-corner-large);
  --_container-shape-start-end: var(--shape-corner-large);
  --_container-shape-end-start: var(--shape-corner-large);
  --_container-shape-end-end: var(--shape-corner-large);
}
.menu.variant-standard {
  --menu-item-container-color: var(--color-surface-container);
}
.menu.variant-vibrant {
  --menu-item-container-color: var(--color-tertiary-container);
}`;

var Menu_1;
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
let Menu = Menu_1 = class Menu extends i$1 {
    constructor() {
        super(...arguments);
        /** Whether the menu is currently visible. */
        this.open = false;
        /** Visual variant of the menu. `"vibrant"` applies stronger color emphasis. */
        this.variant = 'standard';
        /** ID of the anchor element the menu is positioned relative to. */
        this.anchor = '';
        /** When true, renders the menu in a static preview state (always visible, no animation). */
        this.preview = false;
        /** When true, the menu will not close when a click occurs outside it. */
        this.stayOpenOnOutsideClick = false;
        /** When true, the menu will not close when focus leaves it. */
        this.stayOpenOnFocusout = false;
        /** Set to true when this menu is being used as a submenu inside another menu. */
        this.isSubmenu = false;
        /** Floating UI placement of the menu relative to its anchor. */
        this.placement = 'bottom-start';
        /** Distance in pixels between the menu and its anchor element. */
        this.offset = 6;
        /** Index of the currently focused/active item within the enabled items list. */
        this.activeIndex = -1;
        /** Direct reference to the anchor element; takes precedence over the `anchor` ID property. */
        this.anchorElement = null;
        /** Controller managing floating-UI positioning. */
        this._floatingController = new FloatingController(this, {
            trigger: 'manual',
            closeOnClickOutside: false,
            strategy: 'fixed',
            onOpenChange: isOpen => {
                if (isOpen || !this.open) {
                    return;
                }
                this.close({ kind: 'outside-click' });
            },
        });
        /** Element that had focus before the menu opened; restored on close. */
        this._lastFocusedElement = null;
        /** Reason that triggered the most recent close, included in the `closed` event detail. */
        this._closeReason = { kind: 'programmatic' };
        this._onClick = (event) => {
            if (!this.open) {
                return;
            }
            const item = this._ownedItemFromEvent(event);
            if (!item) {
                return;
            }
            this._setActiveItem(item);
            this._dispatchItemActivate(item);
            if (item.keepOpen) {
                return;
            }
            this.close({ kind: 'click-selection' });
        };
        this._onKeyDown = (event) => {
            if (!this.open) {
                return;
            }
            if (!this._isEventFromThisMenu(event)) {
                return;
            }
            const eventItem = this._ownedItemFromEvent(event);
            if (eventItem) {
                this._setActiveItem(eventItem);
            }
            switch (event.key) {
                case 'ArrowDown':
                    event.preventDefault();
                    this._setActiveByOffset(1);
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    this._setActiveByOffset(-1);
                    break;
                case 'Home':
                    event.preventDefault();
                    this._setBoundaryActive(0);
                    break;
                case 'End': {
                    event.preventDefault();
                    const last = Math.max(this._enabledItems().length - 1, 0);
                    this._setBoundaryActive(last);
                    break;
                }
                case 'Escape':
                    event.preventDefault();
                    this.close({ kind: 'keydown', key: 'Escape' });
                    break;
                case 'Tab':
                    this.close({ kind: 'keydown', key: 'Tab' });
                    break;
                case 'Enter':
                case ' ': {
                    event.preventDefault();
                    const activeItem = this._getActiveItem() ?? this._getFirstEnabledItem();
                    if (!activeItem) {
                        return;
                    }
                    this._setActiveItem(activeItem);
                    activeItem.click();
                    break;
                }
            }
        };
        this._onSlotChange = () => {
            this._syncRovingTabIndex();
        };
    }
    connectedCallback() {
        // eslint-disable-next-line wc/guard-super-call
        super.connectedCallback();
        this.setAttribute('role', 'menu');
        this.addEventListener('keydown', this._onKeyDown);
        this.addEventListener('click', this._onClick);
        this._syncAnchorAria();
    }
    disconnectedCallback() {
        this.removeEventListener('keydown', this._onKeyDown);
        this.removeEventListener('click', this._onClick);
        this._floatingController.close();
        super.disconnectedCallback();
    }
    get items() {
        const slot = this.shadowRoot?.querySelector('slot');
        const elements = slot?.assignedElements({ flatten: true }) ?? [];
        const items = [];
        for (const element of elements) {
            if (element instanceof MenuItem) {
                items.push(element);
            }
            else {
                const maybeItem = element.item;
                if (maybeItem instanceof MenuItem) {
                    items.push(maybeItem);
                }
            }
        }
        return items;
    }
    show() {
        if (this.open) {
            return;
        }
        this._closeReason = { kind: 'programmatic' };
        this.open = true;
    }
    close(reason = { kind: 'programmatic' }) {
        if (!this.open) {
            return;
        }
        this._closeReason = reason;
        this.open = false;
    }
    focus() {
        const target = this._getActiveItem() ?? this._getFirstEnabledItem();
        target?.focus();
    }
    _resolveAnchorElement() {
        if (this.anchorElement) {
            return this.anchorElement;
        }
        if (!this.anchor) {
            return null;
        }
        const root = this.getRootNode();
        if ('getElementById' in root) {
            return root.getElementById(this.anchor);
        }
        return document.getElementById(this.anchor);
    }
    _syncAnchorAria() {
        const anchorEl = this._resolveAnchorElement();
        if (!anchorEl) {
            return;
        }
        if (!this.id) {
            this.id = `wc-menu-${Math.random().toString(36).slice(2, 9)}`;
        }
        anchorEl.setAttribute('aria-haspopup', 'menu');
        anchorEl.setAttribute('aria-controls', this.id);
        anchorEl.setAttribute('aria-expanded', String(this.open));
    }
    _enabledItems() {
        return this.items.filter(item => !item.disabled);
    }
    _syncRovingTabIndex() {
        const ownedItems = this.items;
        const enabledItems = this._enabledItems();
        for (const item of ownedItems) {
            item.tabIndex = -1;
        }
        if (!enabledItems.length) {
            this.activeIndex = -1;
            return;
        }
        if (this.activeIndex < 0 || this.activeIndex >= enabledItems.length) {
            this.activeIndex = 0;
        }
        enabledItems[this.activeIndex].tabIndex = 0;
    }
    _setActiveByOffset(offset) {
        const enabledItems = this._enabledItems();
        if (!enabledItems.length) {
            return;
        }
        if (this.activeIndex < 0) {
            this.activeIndex = 0;
        }
        else {
            const count = enabledItems.length;
            this.activeIndex = (this.activeIndex + offset + count) % count;
        }
        this._syncRovingTabIndex();
        enabledItems[this.activeIndex]?.focus();
    }
    _setBoundaryActive(index) {
        const enabledItems = this._enabledItems();
        if (!enabledItems.length) {
            return;
        }
        this.activeIndex = index;
        this._syncRovingTabIndex();
        enabledItems[this.activeIndex]?.focus();
    }
    _getActiveItem() {
        const enabledItems = this._enabledItems();
        if (!enabledItems.length || this.activeIndex < 0) {
            return null;
        }
        return enabledItems[this.activeIndex] ?? null;
    }
    _getFirstEnabledItem() {
        return this._enabledItems()[0] ?? null;
    }
    _isEventFromThisMenu(event) {
        const path = event.composedPath();
        const sourceMenu = path.find(target => target instanceof Menu_1);
        return sourceMenu === this;
    }
    _ownedItemFromEvent(event) {
        if (!this._isEventFromThisMenu(event)) {
            return null;
        }
        const path = event.composedPath();
        const ownedItems = this.items;
        for (const target of path) {
            if (target instanceof MenuItem) {
                const ownedItem = ownedItems.find(item => item === target);
                if (ownedItem) {
                    return ownedItem;
                }
            }
        }
        return null;
    }
    _setActiveItem(item) {
        const enabledItems = this._enabledItems();
        const nextIndex = enabledItems.indexOf(item);
        if (nextIndex < 0) {
            return;
        }
        this.activeIndex = nextIndex;
        this._syncRovingTabIndex();
    }
    _dispatchItemActivate(item) {
        this.dispatchEvent(new CustomEvent('menu-item-activate', {
            bubbles: true,
            composed: true,
            detail: { item },
        }));
    }
    _applyPositioning() {
        if (!this.open || !this.menuListElement) {
            return;
        }
        const anchorEl = this._resolveAnchorElement();
        if (!anchorEl) {
            return;
        }
        this._floatingController.setOptions({
            placement: this.placement,
            offset: this.offset,
            strategy: 'fixed',
            closeOnClickOutside: !this.stayOpenOnOutsideClick,
        });
        this._floatingController.setElements(anchorEl, this.menuListElement);
        this._floatingController.open();
    }
    updated(changedProperties) {
        if (changedProperties.has('anchor') || changedProperties.has('open')) {
            this._syncAnchorAria();
        }
        if (changedProperties.has('open')) {
            if (this.open) {
                this._lastFocusedElement = document.activeElement;
                this._syncRovingTabIndex();
                this.dispatchEvent(new CustomEvent('opened', {
                    bubbles: true,
                    composed: true,
                }));
                this._applyPositioning();
            }
            else {
                this._floatingController.close();
                const reason = this._closeReason;
                this.dispatchEvent(new CustomEvent('close-menu', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        reason,
                        itemPath: [],
                    },
                }));
                this.dispatchEvent(new CustomEvent('closed', {
                    bubbles: true,
                    composed: true,
                    detail: { reason },
                }));
                const shouldRestoreFocus = reason.kind !== 'keydown' || reason.key !== 'Tab';
                if (!this.isSubmenu && shouldRestoreFocus) {
                    this._lastFocusedElement?.focus();
                }
            }
        }
        if ((changedProperties.has('open') ||
            changedProperties.has('anchor') ||
            changedProperties.has('placement') ||
            changedProperties.has('offset')) &&
            this.open) {
            this._applyPositioning();
        }
    }
    render() {
        return b `<div
      class=${e$1({
            menu: true,
            open: !this.preview && this.open,
            closed: !this.preview && !this.open,
            preview: this.preview,
            [`variant-${this.variant}`]: true,
        })}
      aria-hidden=${String(!this.open)}
    >
      <div class="background"></div>

      <div class="menu-content">
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
    </div>`;
    }
};
Menu.styles = [css_248z];
Menu.Item = MenuItem;
__decorate([
    n({ type: Boolean, reflect: true })
], Menu.prototype, "open", void 0);
__decorate([
    n({ type: String, reflect: true })
], Menu.prototype, "variant", void 0);
__decorate([
    n({ type: String })
], Menu.prototype, "anchor", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Menu.prototype, "preview", void 0);
__decorate([
    n({ type: Boolean, attribute: 'stay-open-on-outside-click' })
], Menu.prototype, "stayOpenOnOutsideClick", void 0);
__decorate([
    n({ type: Boolean, attribute: 'stay-open-on-focusout' })
], Menu.prototype, "stayOpenOnFocusout", void 0);
__decorate([
    n({ type: Boolean, attribute: 'is-submenu' })
], Menu.prototype, "isSubmenu", void 0);
__decorate([
    n({ type: String })
], Menu.prototype, "placement", void 0);
__decorate([
    n({ type: Number })
], Menu.prototype, "offset", void 0);
__decorate([
    r()
], Menu.prototype, "activeIndex", void 0);
__decorate([
    e('.menu')
], Menu.prototype, "menuListElement", void 0);
Menu = Menu_1 = __decorate([
    IndividualComponent
], Menu);

export { Menu };
//# sourceMappingURL=menu.js.map
