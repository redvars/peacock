import { i, _ as __decorate, I as IndividualComponent, a as i$1, A, b } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { r } from './state-BCeDVCI9.js';
import { e } from './query-CHb9Ft_d.js';
import { e as e$1 } from './class-map-NDIkZErE.js';
import { F as FloatingController } from './floating-controller-CABF4tBT.js';
import { t as toPhysicalPlacement } from './placement-C4GO0JP9.js';
import { MenuItem } from './menu-item.js';
import './base-Cl6v8-BZ.js';
import './directive-ZPhl09Yt.js';
import './if-defined-D9DEJR_6.js';
import './base-button-BJMGMcMv.js';
import './throttle-SQ9t-HL7.js';
import './warn-once-BNxX1Y98.js';
import './hyperlink-DycWPKwU.js';
import './element-internals-QME0yEz4.js';
import './is-link-Dk2OV3PM.js';

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
  /* Public colour tokens; items read them because custom properties inherit through the slot. */
  --menu-container-color: var(--color-surface-container);
  --menu-item-label-color: var(--color-on-surface);
  --menu-item-icon-color: var(--color-on-surface-variant);
  --menu-item-selected-container-color: var(--color-secondary-container);
  --menu-item-selected-label-color: var(--color-on-secondary-container);
  /* Expressive segments: off unless the variant turns them on. */
  --_menu-item-segment-display: none;
  /* Leading space for text-only items when another item has an icon (see has-icons). */
  --_menu-item-leading-space: 0px;
}

:host([has-icons]) {
  --_menu-item-leading-space: calc(
    var(--menu-item-icon-size, 1.25rem) + var(--spacing-150)
  );
}

:host([variant=expressive]) {
  --_menu-item-segment-display: block;
}

.menu {
  /* Reset the UA popover styles; Floating UI positions the surface. */
  margin: 0;
  padding: 0;
  border: 0;
  inset: auto;
  overflow: visible;
  color: inherit;
  background: transparent;
  display: flex;
  flex-direction: column;
  position: fixed;
  z-index: var(--menu-z-index, 1000);
  box-sizing: border-box;
  width: var(--menu-width, max-content);
  min-width: var(--menu-min-width, 112px);
  max-width: min(var(--menu-max-width, 100vw), var(--floating-available-width, 100vw));
  max-height: min(var(--menu-max-height, 20rem), var(--floating-available-height, 100vh));
  transform-origin: top center;
  --_menu-enter-duration: var(--duration-medium1);
  --_menu-exit-duration: var(--duration-short4);
  --_menu-enter-easing: var(--easing-emphasized-decelerate);
  --_menu-exit-easing: var(--easing-standard);
  transition-property: opacity, transform;
  transition-duration: var(--_menu-exit-duration);
  transition-timing-function: var(--_menu-exit-easing);
}
.menu.closed {
  opacity: 0;
  pointer-events: none;
  transform: translateY(-4px) scale(0.97);
}
.menu.open {
  opacity: 1;
  transform: none;
  transition-duration: var(--_menu-enter-duration);
  transition-timing-function: var(--_menu-enter-easing);
}
@starting-style {
  .menu.open {
    opacity: 0;
    transform: translateY(-4px) scale(0.97);
  }
}
.menu.preview {
  position: relative;
  z-index: auto;
  max-height: var(--menu-max-height, none);
}
.menu .elevation {
  --elevation-level: 2;
  --elevation-container-shape: var(--shape-corner-large);
}
.menu .menu-content {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-block: var(--spacing-050);
  border-radius: var(--shape-corner-large);
  background-color: var(--menu-container-color);
}
.menu .menu-content ::slotted(wc-divider) {
  --divider-color: var(--color-outline-variant);
  --divider-spacing: var(--spacing-050);
}

/* Expressive: no shared surface, each group between dividers is its own rounded segment. */
:host([variant=expressive]) .menu .elevation {
  display: none;
}
:host([variant=expressive]) .menu .menu-content {
  background-color: transparent;
  border-radius: 0;
  /* Room for the segments' shadows, which overflow-y: auto would otherwise clip. */
  padding: var(--spacing-050);
  margin: calc(-1 * var(--spacing-050));
}
:host([variant=expressive]) .menu .menu-content ::slotted(wc-divider) {
  --divider-color: transparent;
  --divider-spacing: var(--spacing-025);
}

@media (prefers-reduced-motion: reduce) {
  .menu,
  .menu.open,
  .menu.closed {
    transition: none;
    transform: none;
  }
}`;

var Menu_1;
/** Maps a menu close reason onto the reason every overlay uses. */
function toCloseReason(reason) {
    switch (reason.kind) {
        case 'click-selection':
            return 'action';
        case 'keydown':
            if (reason.key === 'Escape')
                return 'escape';
            // Tab moves focus out of the menu, like a press outside.
            return reason.key === 'Tab' ? 'light-dismiss' : 'action';
        case 'outside-click':
            return 'light-dismiss';
        default:
            return 'api';
    }
}
/** Time after the last typed character before the typeahead buffer resets. */
const TYPEAHEAD_RESET_MS = 500;
/** Fallback for removing the menu from the top layer when no transitionend arrives. */
const EXIT_FALLBACK_MS = 300;
const POSITION_ATTRIBUTES = [
    'data-position-first',
    'data-position-last',
    'data-position-after-divider',
    'data-position-before-divider',
];
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
let Menu = Menu_1 = class Menu extends i$1 {
    constructor() {
        super(...arguments);
        /** Whether the menu is currently visible. */
        this.open = false;
        /**
         * Visual variant.
         * `"standard"` is one elevated surface; dividers are hairlines.
         * `"expressive"` splits the menu into separate rounded segments at each `wc-divider`.
         */
        this.variant = 'standard';
        /** ID of the anchor element the menu is positioned relative to. */
        this.anchor = '';
        /**
         * Renders the menu statically in the page flow, without positioning or the top layer. For the
         * documentation demos only; not part of the public API.
         * @internal
         */
        this.preview = false;
        /** When true, the menu will not close when a click occurs outside it. */
        this.stayOpenOnOutsideClick = false;
        /** When true, opening the menu leaves focus where it is instead of moving it to an item. */
        this.noAutofocus = false;
        /**
         * Set by `wc-sub-menu` on the menu it nests.
         * @internal
         */
        this.isSubmenu = false;
        /**
         * Where the menu opens relative to its anchor: `top`, `bottom`, `start` or `end`, optionally
         * followed by `-start` or `-end` (ADR-030001). `start` and `end` follow the writing direction.
         * Defaults to `"bottom-start"`.
         */
        this.placement = 'bottom-start';
        /** Distance in pixels between the menu and its anchor element. */
        this.offset = 4;
        /** Index of the currently focused/active item within the enabled items list. */
        this.activeIndex = -1;
        /**
         * Direct reference to the anchor element; takes precedence over the `anchor` ID property. Set by
         * the components that own a menu (dropdown button, split button, select, sub-menu).
         * @internal
         */
        this.anchorElement = null;
        /** Controller managing floating-UI positioning. */
        this._floatingController = new FloatingController(this, {
            trigger: 'manual',
            closeOnClickOutside: false,
            strategy: 'fixed',
            fitViewport: true,
            viewportPadding: 8,
            onOpenChange: isOpen => {
                if (isOpen || !this.open) {
                    return;
                }
                this.close({ kind: 'outside-click' });
            },
        });
        /** Element that had focus before the menu opened; restored on close. */
        this._lastFocusedElement = null;
        /** Reason that triggered the most recent close, sent as `cause` in the `close` event detail. */
        this._closeReason = { kind: 'programmatic' };
        /** Item to focus when the menu opens; set by `show()`. */
        this._openFocus = 'active';
        this._typeaheadBuffer = '';
        /** Elements that carry `data-position-*` attributes from the last sync. */
        this._positionedElements = [];
        this._onClick = (event) => {
            if (!this.open) {
                return;
            }
            const item = this._ownedItemFromEvent(event);
            if (!item || item.disabled || item.softDisabled) {
                return;
            }
            this._setActiveItem(item);
            this._applyChoice(item);
            this._dispatchItemActivate(item);
            // A checkbox item stays open, like native menus, so several can be toggled in a row.
            if (item.keepOpen || item.type === 'checkbox') {
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
                    const activeItem = this._getActiveItem();
                    if (!activeItem) {
                        return;
                    }
                    activeItem.click();
                    break;
                }
                default:
                    if (event.key.length === 1 &&
                        !event.ctrlKey &&
                        !event.metaKey &&
                        !event.altKey) {
                        this._typeahead(event.key);
                    }
                    break;
            }
        };
        this._onSlotChange = () => {
            this._syncRovingTabIndex();
            this._syncLayout();
        };
    }
    connectedCallback() {
        // eslint-disable-next-line wc/guard-super-call
        super.connectedCallback();
        if (!this.hasAttribute('role')) {
            this.setAttribute('role', 'menu');
        }
        this.addEventListener('keydown', this._onKeyDown);
        this.addEventListener('click', this._onClick);
        this._syncAnchorAria();
    }
    disconnectedCallback() {
        this.removeEventListener('keydown', this._onKeyDown);
        this.removeEventListener('click', this._onClick);
        window.clearTimeout(this._typeaheadTimer);
        window.clearTimeout(this._exitTimer);
        this._floatingController.close();
        super.disconnectedCallback();
    }
    /** The items this menu owns: slotted `wc-menu-item`s (and subclasses) and the items of slotted `wc-sub-menu`s. */
    get items() {
        const items = [];
        for (const element of this._slottedElements()) {
            const item = this._resolveItem(element);
            if (item) {
                items.push(item);
            }
        }
        return items;
    }
    /** Opens the menu. `focusTarget` picks the item that receives focus. */
    show(focusTarget = 'active') {
        this._openFocus = focusTarget;
        if (this.open) {
            this.focus(focusTarget);
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
    /** Opens the menu when it is closed and closes it when it is open. */
    toggle() {
        if (this.open) {
            this.close();
        }
        else {
            this.show();
        }
    }
    /** Focuses an item: the selected or last active one (`"active"`), the first or the last. */
    // eslint-disable-next-line no-undef
    focus(target = 'active') {
        const enabledItems = this._enabledItems();
        if (!enabledItems.length) {
            return;
        }
        let index;
        if (target === 'first') {
            index = 0;
        }
        else if (target === 'last') {
            index = enabledItems.length - 1;
        }
        else {
            const selectedIndex = enabledItems.findIndex(item => item.selected);
            if (selectedIndex >= 0) {
                index = selectedIndex;
            }
            else if (this.activeIndex >= 0 &&
                this.activeIndex < enabledItems.length) {
                index = this.activeIndex;
            }
            else {
                index = 0;
            }
        }
        this.activeIndex = index;
        this._syncRovingTabIndex();
        enabledItems[index]?.focus();
    }
    _slottedElements() {
        const slot = this.shadowRoot?.querySelector('slot');
        return slot?.assignedElements({ flatten: true }) ?? [];
    }
    /** The item that represents a slotted element: the element itself or the item of a `wc-sub-menu`. */
    _resolveItem(element) {
        if (element instanceof MenuItem) {
            return element;
        }
        const maybeItem = element.item;
        return maybeItem instanceof MenuItem ? maybeItem : null;
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
        // Only an anchor given by ID is in the same tree as the menu, so aria-controls can point at it.
        // Components that pass anchorElement manage their own trigger ARIA.
        if (this.anchorElement || !this.anchor) {
            return;
        }
        const anchorEl = this._resolveAnchorElement();
        if (!anchorEl) {
            return;
        }
        if (!this.id) {
            this.id = `wc-menu-${Math.random().toString(36).slice(2, 9)}`;
        }
        anchorEl.setAttribute('aria-haspopup', this.getAttribute('role') ?? 'menu');
        anchorEl.setAttribute('aria-controls', this.id);
        anchorEl.setAttribute('aria-expanded', String(this.open));
    }
    _enabledItems() {
        return this.items.filter(item => !item.disabled && !item.hidden);
    }
    /** Re-reads the items after they change (for example when a select filters its options). */
    syncItems() {
        this._syncRovingTabIndex();
        this._syncLayout();
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
            const selectedIndex = enabledItems.findIndex(item => item.selected);
            this.activeIndex = Math.max(selectedIndex, 0);
        }
        enabledItems[this.activeIndex].tabIndex = 0;
    }
    _setActiveByOffset(offset) {
        const enabledItems = this._enabledItems();
        if (!enabledItems.length) {
            return;
        }
        if (this.activeIndex < 0) {
            this.activeIndex = offset === 1 ? 0 : enabledItems.length - 1;
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
    /** Moves focus to the next item whose label starts with the typed characters. */
    _typeahead(key) {
        window.clearTimeout(this._typeaheadTimer);
        this._typeaheadTimer = window.setTimeout(() => {
            this._typeaheadBuffer = '';
        }, TYPEAHEAD_RESET_MS);
        const enabledItems = this._enabledItems();
        if (!enabledItems.length) {
            return;
        }
        const repeated = this._typeaheadBuffer.length > 0 &&
            [...this._typeaheadBuffer].every(char => char === key.toLowerCase());
        this._typeaheadBuffer += key.toLowerCase();
        // Typing the same letter again cycles through the items that start with it.
        const prefix = repeated ? key.toLowerCase() : this._typeaheadBuffer;
        const start = Math.max(this.activeIndex, 0);
        const count = enabledItems.length;
        const firstOffset = prefix.length === 1 ? 1 : 0;
        for (let step = firstOffset; step < count + firstOffset; step += 1) {
            const index = (start + step) % count;
            if (enabledItems[index].typeaheadText.startsWith(prefix)) {
                this._setBoundaryActive(index);
                return;
            }
        }
    }
    /** Toggles a checkbox item, or selects a radio item and clears the others of its group. */
    _applyChoice(item) {
        if (item.type === 'checkbox') {
            // eslint-disable-next-line no-param-reassign
            item.selected = !item.selected;
        }
        else if (item.type === 'radio') {
            for (const other of this._radioGroup(item)) {
                other.selected = other === item;
            }
        }
    }
    /** The radio items in the same group as `item`: those between the same `wc-divider`s. */
    _radioGroup(item) {
        let group = [];
        let found = false;
        for (const element of this._slottedElements()) {
            if (element.tagName.toLowerCase() === 'wc-divider') {
                if (found)
                    break;
                group = [];
            }
            else {
                const candidate = this._resolveItem(element);
                if (candidate?.type === 'radio') {
                    group.push(candidate);
                    found ||= candidate === item;
                }
            }
        }
        return found ? group : [item];
    }
    /** Sets `has-icons` and, for the expressive variant, the segment position attributes. */
    _syncLayout() {
        const elements = this._slottedElements();
        this.toggleAttribute('has-icons', this.items.some(item => item.hasStartContent));
        for (const el of this._positionedElements) {
            for (const name of POSITION_ATTRIBUTES) {
                el.removeAttribute(name);
            }
        }
        this._positionedElements = [];
        if (this.variant !== 'expressive') {
            return;
        }
        const isDivider = (el) => el.tagName.toLowerCase() === 'wc-divider';
        const mark = (el, name) => {
            if (!el) {
                return;
            }
            // Set the attribute on the item itself (not a wrapping wc-sub-menu) so it styles its own host.
            const target = this._resolveItem(el) ?? el;
            if (target instanceof HTMLElement) {
                target.setAttribute(name, '');
                this._positionedElements.push(target);
            }
        };
        const entries = elements.filter(el => !isDivider(el));
        mark(entries[0], 'data-position-first');
        mark(entries[entries.length - 1], 'data-position-last');
        elements.forEach((el, index) => {
            if (!isDivider(el)) {
                return;
            }
            const previous = elements
                .slice(0, index)
                .reverse()
                .find(candidate => !isDivider(candidate));
            const next = elements
                .slice(index + 1)
                .find(candidate => !isDivider(candidate));
            mark(previous, 'data-position-before-divider');
            mark(next, 'data-position-after-divider');
        });
    }
    /** Shows the menu surface in the top layer, or hides it there once the exit transition ends. */
    _syncLayer() {
        const layer = this.menuListElement;
        if (!layer ||
            typeof layer.showPopover !== 'function' ||
            !layer.hasAttribute('popover')) {
            return;
        }
        window.clearTimeout(this._exitTimer);
        const showing = layer.matches(':popover-open');
        if (this.open && this.isConnected) {
            if (!showing) {
                layer.showPopover();
            }
            return;
        }
        if (!showing) {
            return;
        }
        const controller = new AbortController();
        const hide = () => {
            window.clearTimeout(this._exitTimer);
            controller.abort();
            if (!this.open && layer.matches(':popover-open')) {
                layer.hidePopover();
            }
        };
        layer.addEventListener('transitionend', (event) => {
            if (event.target === layer && event.propertyName === 'opacity') {
                hide();
            }
        }, { signal: controller.signal });
        this._exitTimer = window.setTimeout(hide, EXIT_FALLBACK_MS);
    }
    _applyPositioning() {
        if (!this.open || !this.menuListElement || this.preview) {
            return;
        }
        const anchorEl = this._resolveAnchorElement();
        if (!anchorEl) {
            return;
        }
        this._floatingController.setOptions({
            placement: toPhysicalPlacement(this.placement, this),
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
        if (changedProperties.has('variant')) {
            this._syncLayout();
        }
        if (changedProperties.has('open')) {
            this._syncLayer();
            // While open, the menu handles Escape itself: an overlay around it (popover, modal) must
            // let it close first (see the overlay controller).
            this.toggleAttribute('data-handles-escape', this.open);
            if (this.open) {
                this._lastFocusedElement = this._deepActiveElement();
                this._syncRovingTabIndex();
                this._syncLayout();
                this._applyPositioning();
                if (!this.noAutofocus && !this.preview) {
                    this.focus(this._openFocus);
                }
                this._openFocus = 'active';
                this.dispatchEvent(new CustomEvent('open', { bubbles: true, composed: true }));
            }
            else if (changedProperties.get('open') === true) {
                this._floatingController.close();
                const reason = this._closeReason;
                this.dispatchEvent(new CustomEvent('close', {
                    detail: { reason: toCloseReason(reason), cause: reason },
                    bubbles: true,
                    composed: true,
                }));
                const shouldRestoreFocus = reason.kind !== 'outside-click' &&
                    !(reason.kind === 'keydown' && reason.key === 'Tab');
                if (!this.isSubmenu && shouldRestoreFocus && this._focusIsInside()) {
                    this._lastFocusedElement?.focus();
                }
                this._lastFocusedElement = null;
            }
        }
        if ((changedProperties.has('anchor') ||
            changedProperties.has('placement') ||
            changedProperties.has('offset')) &&
            !changedProperties.has('open') &&
            this.open) {
            this._applyPositioning();
        }
    }
    /** The focused element, looking through open shadow roots. */
    _deepActiveElement() {
        let active = document.activeElement;
        while (active?.shadowRoot?.activeElement) {
            active = active.shadowRoot.activeElement;
        }
        return active instanceof HTMLElement ? active : null;
    }
    /** Whether focus is in this menu (or nowhere), so restoring it does not steal focus from elsewhere. */
    _focusIsInside() {
        const active = document.activeElement;
        if (!active || active === document.body) {
            return true;
        }
        return (active === this ||
            this.contains(active) ||
            this.shadowRoot?.contains(active) === true);
    }
    render() {
        return b `
      <div
        class="${e$1({
            menu: true,
            open: !this.preview && this.open,
            closed: !this.preview && !this.open,
            preview: this.preview,
        })}"
        popover=${this.preview ? A : 'manual'}
        part="surface"
      >
        <wc-elevation class="elevation"></wc-elevation>
        <div class="menu-content">
          <slot @slotchange="${this._onSlotChange}"></slot>
        </div>
      </div>
    `;
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
    n({ type: Boolean, attribute: 'no-autofocus' })
], Menu.prototype, "noAutofocus", void 0);
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
