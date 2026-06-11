import { i, a as i$1, A, b, _ as __decorate, I as IndividualComponent } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { r } from './state-DkTK9EGF.js';
import { e } from './class-map-DG7CA1et.js';
import { e as e$1 } from './query-CHb9Ft_d.js';
import { i as isLink } from './is-link-Dk2OV3PM.js';
import { i as isActivationClick, d as dispatchActivationClick } from './dispatch-event-utils-CuEqjlPT.js';
import { m as mixinBaseButton, a as mixinHyperlink } from './hyperlink-DLvb6MXE.js';
import { m as mixinDelegatesAria, a as mixinElementInternals } from './element-internals-2CMts_0M.js';

var css_248z$1 = i`* {
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
  display: block;
}

.list {
  display: flex;
  flex-direction: column;
}`;

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
  display: flex;
}

/*
  * Reset native button/link styles
  */
.native-button {
  background: transparent;
  border: none;
  appearance: none;
  margin: 0;
  outline: none;
  padding: 0;
}

.native-link {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  outline: none;
}
.native-link:link, .native-link:visited, .native-link:hover, .native-link:active {
  text-decoration: none;
  color: inherit;
}

.list-item {
  position: relative;
  width: 100%;
  text-align: start;
}
.list-item .list-item-content {
  --item-padding-inline: 1rem;
  --item-height: 1.5rem;
  --item-multiline-height: 3rem;
  --item-label-text-color: var(--_label-text-color);
  --item-label-text-opacity: var(--_label-text-opacity, 1);
}
.list-item .leading,
.list-item .trailing {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  color: var(--_leading-trailing-color);
}
.list-item .trailing {
  margin-inline-start: auto;
}
.list-item .content {
  display: block;
  flex: 1;
  min-inline-size: 0;
}
.list-item .background {
  background-color: var(--_container-color);
  opacity: var(--_container-opacity, 1);
  border-radius: var(--shape-corner-medium);
}
.list-item .focus-ring {
  --focus-ring-container-shape-start-start: var(--shape-corner-medium);
  --focus-ring-container-shape-start-end: var(--shape-corner-medium);
  --focus-ring-container-shape-end-start: var(--shape-corner-medium);
  --focus-ring-container-shape-end-end: var(--shape-corner-medium);
  z-index: 2;
  --focus-ring-inset: 0px;
}
.list-item .ripple {
  --ripple-state-opacity: var(--_container-state-opacity, 0);
  --ripple-pressed-color: var(--_container-state-color);
  border-radius: var(--shape-corner-medium);
}
.list-item .skeleton {
  z-index: 2;
  --skeleton-container-shape-start-start: var(--shape-corner-medium);
  --skeleton-container-shape-start-end: var(--shape-corner-medium);
  --skeleton-container-shape-end-start: var(--shape-corner-medium);
  --skeleton-container-shape-end-end: var(--shape-corner-medium);
}

:host([actionable]:not([disabled]):not([soft-disabled])),
:host([href]:not([disabled]):not([soft-disabled])) {
  cursor: pointer;
}

:host(:not([skeleton])) .skeleton {
  display: none;
}

:host-context([variant=standard]) {
  --_container-color: transparent;
  --_label-text-color: var(--color-on-surface);
  --_leading-trailing-color: var(--color-on-surface-variant);
  --_container-state-color: var(--color-on-surface);
}
:host-context([variant=standard]):host(:hover:not([disabled], [soft-disabled], [skeleton])) {
  --_container-state-opacity: 0.08;
}
:host-context([variant=standard]):host(:active:not([disabled], [soft-disabled], [skeleton])) {
  --_container-state-opacity: 0.12;
}
:host-context([variant=standard]):host([selected]) {
  --_container-color: var(--color-secondary-container);
  --_label-text-color: var(--color-on-secondary-container);
  --_leading-trailing-color: var(--color-on-secondary-container);
  --_container-state-color: var(--color-on-secondary-container);
}
:host-context([variant=standard]):host([disabled]), :host-context([variant=standard]):host([soft-disabled]) {
  cursor: not-allowed;
  --_label-text-color: var(--color-on-surface);
  --_label-text-opacity: 0.38;
  --_leading-trailing-color: var(--color-on-surface);
  --_container-opacity: 0.12;
}
:host-context([variant=standard]):host([disabled]) .ripple, :host-context([variant=standard]):host([soft-disabled]) .ripple {
  display: none;
}`;

/**
 * @label List Item
 * @tag wc-list-item
 * @rawTag list-item
 *
 * @summary A list item with leading, trailing and content slots.
 *
 * @example
 * ```html
 * <wc-list-item selected>
 *   <wc-icon slot="leading" name="person"></wc-icon>
 *   Profile
 *   <wc-icon slot="trailing" name="chevron_right"></wc-icon>
 * </wc-list-item>
 * ```
 * @tags display
 */
class ListItem extends mixinBaseButton(mixinHyperlink(mixinDelegatesAria(mixinElementInternals(i$1)))) {
    constructor() {
        super();
        this.selected = false;
        /** When true, renders the list-item in a loading skeleton state. */
        this.skeleton = false;
        this.actionable = false;
        this.__dispatchClick = (event) => {
            // If the button is soft-disabled or a disabled link, we need to explicitly
            // prevent the click from propagating to other event listeners as well as
            // prevent the default action.
            if (this.softDisabled || (this.disabled && this.href) || this.skeleton) {
                event.stopImmediatePropagation();
                event.preventDefault();
                return;
            }
            if (!isActivationClick(event) || !this.itemElement) {
                return;
            }
            this.focus();
            dispatchActivationClick(this.itemElement);
        };
        this.addEventListener('click', this.__dispatchClickWithThrottle);
    }
    connectedCallback() {
        // eslint-disable-next-line wc/guard-super-call
        super.connectedCallback();
        if (!this.hasAttribute('role')) {
            this.setAttribute('role', 'listitem');
        }
    }
    focus() {
        this.itemElement?.focus();
    }
    blur() {
        this.itemElement?.blur();
    }
    __hasNamedSlot(...names) {
        return names.some(name => Array.from(this.children).some(child => child.getAttribute('slot') === name));
    }
    isClickable() {
        return this.actionable || isLink(this);
    }
    render() {
        const isElementLink = isLink(this);
        const clickable = this.isClickable();
        const cssClasses = {
            'list-item': true,
            'native-button': !isElementLink,
            'native-link': isElementLink,
        };
        // Needed for closure conformance
        const { ariaLabel } = this;
        if (!clickable) {
            return b `
        <div
          id="list-item"
          class=${e(cssClasses)}
          aria-label="${ariaLabel || A}"
        >
          ${this.renderContent(clickable)}
        </div>
      `;
        }
        if (!isElementLink) {
            return b `
        <button
          id="list-item"
          class=${e(cssClasses)}
          ?disabled=${this.disabled}
          aria-label="${ariaLabel || A}"
          ?aria-disabled=${this.softDisabled}
          @click=${this.__dispatchClick}
        >
          ${this.renderContent(clickable)}
        </button>
      `;
        }
        return b `
      <a
        id="list-item"
        class=${e(cssClasses)}
        href=${this.href}
        target=${this.target}
        ?rel=${this.rel}
        ?download=${this.download}
        tabindex=${this.disabled ? '-1' : '0'}
        aria-disabled=${String(this.disabled || this.softDisabled)}
        @click=${this.__dispatchClick}
      >
        ${this.renderContent(clickable)}
      </a>
    `;
    }
    renderContent(clickable) {
        const hasLeading = this.__hasNamedSlot('leading');
        const hasTrailingSupportingText = this.__hasNamedSlot('trailing-supporting-text');
        const hasTrailing = this.__hasNamedSlot('trailing');
        return b `
      <wc-item class="list-item-content" ?inert=${clickable}>
        ${clickable
            ? b `<wc-focus-ring
                class="focus-ring"
                for="list-item"
                slot="container"
              ></wc-focus-ring>
              <div class="background" slot="container"></div>
              <wc-ripple
                class="ripple"
                for="list-item"
                slot="container"
              ></wc-ripple>
              <wc-skeleton class="skeleton" slot="container"></wc-skeleton> `
            : null}

        <slot name="leading" slot="start" ?hidden=${!hasLeading}></slot>
        <slot name="overline" slot="overline"></slot>
        <slot name="headline" slot="headline"></slot>
        <slot></slot>
        <slot name="supporting-text" slot="supporting-text"></slot>

        <slot
          name="trailing-supporting-text"
          slot="trailing-supporting-text"
          ?hidden=${!hasTrailingSupportingText}
        ></slot>
        <slot name="trailing" slot="end" ?hidden=${!hasTrailing}></slot>
      </wc-item>
    `;
    }
}
// ── Static ───────────────────────────────────────────────────────────────
/** @nocollapse */ // eslint-disable-next-line
ListItem.shadowRootOptions = {
    mode: 'open',
    delegatesFocus: true,
};
ListItem.styles = [css_248z];
__decorate([
    n({ type: Boolean, reflect: true })
], ListItem.prototype, "selected", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], ListItem.prototype, "skeleton", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], ListItem.prototype, "actionable", void 0);
__decorate([
    e$1('#list-item')
], ListItem.prototype, "itemElement", void 0);

var List_1;
/**
 * @label List
 * @tag wc-list
 * @rawTag list
 *
 * @summary A list container for one or more list items.
 *
 * @example
 * ```html
 * <wc-list>
 *   <wc-list-item>
 *     <wc-icon slot="leading" name="inbox"></wc-icon>
 *     Inbox
 *     <span slot="trailing">24</span>
 *   </wc-list-item>
 *    <wc-list-item>
 *       <wc-avatar slot="leading" name="Shivaji Varma"></wc-avatar>
 *        Shivaji Varma
 *       <span slot="supporting-text">Software Engineer</span>
 *       <span slot="trailing-supporting-text">7</span>
 *       <wc-icon slot="trailing" name="chevron_right"></wc-icon>
 *     </wc-list-item>
 * </wc-list>
 * ```
 * @tags display
 */
let List = List_1 = class List extends i$1 {
    constructor() {
        super(...arguments);
        /**  */
        this.variant = 'standard';
        /** Index of the currently active item within the clickable items list. */
        this.activeIndex = -1;
        // ── Handlers ──────────────────────────────────────────────────────────────
        this._onKeyDown = (event) => {
            if (!this._isEventFromThisList(event))
                return;
            const eventItem = this._clickableItemFromEvent(event);
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
                case 'End':
                    event.preventDefault();
                    this._setBoundaryActive(Math.max(this._clickableItems().length - 1, 0));
                    break;
            }
        };
        this._onClick = (event) => {
            const item = this._clickableItemFromEvent(event);
            if (!item)
                return;
            this._setActiveItem(item);
        };
        this._onSlotChange = () => {
            this._syncRovingTabIndex();
        };
    }
    connectedCallback() {
        super.connectedCallback();
        this.setAttribute('role', 'list');
        this.addEventListener('keydown', this._onKeyDown);
        this.addEventListener('click', this._onClick);
    }
    disconnectedCallback() {
        this.removeEventListener('keydown', this._onKeyDown);
        this.removeEventListener('click', this._onClick);
        super.disconnectedCallback();
    }
    focus() {
        const target = this._getActiveItem() ?? this._getFirstClickableItem();
        target?.focus();
    }
    // ── Items ─────────────────────────────────────────────────────────────────
    get items() {
        const slot = this.shadowRoot?.querySelector('slot');
        const elements = slot?.assignedElements({ flatten: true }) ?? [];
        return elements.filter(el => el instanceof ListItem);
    }
    _clickableItems() {
        return this.items.filter(item => item.isClickable());
    }
    // ── Roving tabindex ───────────────────────────────────────────────────────
    _syncRovingTabIndex() {
        const allItems = this.items;
        const clickable = this._clickableItems();
        for (const item of allItems) {
            item.tabIndex = -1;
        }
        if (!clickable.length) {
            this.activeIndex = -1;
            return;
        }
        if (this.activeIndex < 0 || this.activeIndex >= clickable.length) {
            this.activeIndex = 0;
        }
        clickable[this.activeIndex].tabIndex = 0;
    }
    _setActiveByOffset(offset) {
        const clickable = this._clickableItems();
        if (!clickable.length)
            return;
        if (this.activeIndex < 0) {
            this.activeIndex = 0;
        }
        else {
            const count = clickable.length;
            this.activeIndex = (this.activeIndex + offset + count) % count;
        }
        this._syncRovingTabIndex();
        clickable[this.activeIndex]?.focus();
    }
    _setBoundaryActive(index) {
        const clickable = this._clickableItems();
        if (!clickable.length)
            return;
        this.activeIndex = index;
        this._syncRovingTabIndex();
        clickable[this.activeIndex]?.focus();
    }
    _getActiveItem() {
        const clickable = this._clickableItems();
        if (!clickable.length || this.activeIndex < 0)
            return null;
        return clickable[this.activeIndex] ?? null;
    }
    _getFirstClickableItem() {
        return this._clickableItems()[0] ?? null;
    }
    // ── Event helpers ─────────────────────────────────────────────────────────
    _isEventFromThisList(event) {
        const path = event.composedPath();
        const sourceList = path.find(target => target instanceof List_1);
        return sourceList === this;
    }
    _clickableItemFromEvent(event) {
        if (!this._isEventFromThisList(event))
            return null;
        const path = event.composedPath();
        const clickable = this._clickableItems();
        for (const target of path) {
            if (target instanceof ListItem) {
                const owned = clickable.find(item => item === target);
                if (owned)
                    return owned;
            }
        }
        return null;
    }
    _setActiveItem(item) {
        const clickable = this._clickableItems();
        const nextIndex = clickable.indexOf(item);
        if (nextIndex < 0)
            return;
        this.activeIndex = nextIndex;
        this._syncRovingTabIndex();
    }
    render() {
        const cssClasses = {
            list: true,
            [`variant-${this.variant}`]: true,
        };
        return b `
      <div class=${e(cssClasses)}>
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
    `;
    }
};
List.styles = [css_248z$1];
List.Item = ListItem;
__decorate([
    n({ type: String, reflect: true })
], List.prototype, "variant", void 0);
__decorate([
    r()
], List.prototype, "activeIndex", void 0);
List = List_1 = __decorate([
    IndividualComponent
], List);

export { List as L, ListItem as a };
//# sourceMappingURL=list-BBmnHm8f.js.map
