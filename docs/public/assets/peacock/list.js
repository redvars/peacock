import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { r } from './state-DkTK9EGF.js';
import { e } from './class-map-DG7CA1et.js';
import { ListItem } from './list-item.js';
import './directive-ZPhl09Yt.js';
import './query-CHb9Ft_d.js';
import './base-Cl6v8-BZ.js';
import './is-link-Dk2OV3PM.js';
import './dispatch-event-utils-CuEqjlPT.js';
import './hyperlink-DLvb6MXE.js';
import './throttle-C7ZAPqtu.js';
import './delegate-py-Ets8N.js';
import './element-internals-QME0yEz4.js';

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
  display: block;
}

.list {
  display: flex;
  flex-direction: column;
}`;

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
 *       <wc-avatar slot="leading" name="Ada Lovelace"></wc-avatar>
 *        Ada Lovelace
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
List.styles = [css_248z];
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

export { List };
//# sourceMappingURL=list.js.map
