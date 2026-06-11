import { i, _ as __decorate, I as IndividualComponent, a as i$1, A, c as __classPrivateFieldGet, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { r } from './state-DkTK9EGF.js';
import { e } from './query-CHb9Ft_d.js';
import { e as e$1 } from './class-map-DG7CA1et.js';
import { i as isActivationClick, d as dispatchActivationClick } from './dispatch-event-utils-CuEqjlPT.js';
import { o as observerSlotChangesWithCallback } from './observe-slot-change-DPxaZrZF.js';
import { t as throttle } from './throttle-C7ZAPqtu.js';
import { i as isLink } from './is-link-Dk2OV3PM.js';
import './base-Cl6v8-BZ.js';
import './directive-ZPhl09Yt.js';

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

/* Reset native button/link styles */
.item-element {
  background: transparent;
  border: none;
  appearance: none;
  margin: 0;
  outline: none;
  text-decoration: none;
  text-align: unset;
  color: inherit;
}

.item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 3.5rem; /* 56dp */
  padding-block: 0.25rem; /* 4dp vertical padding */
  cursor: pointer;
  gap: 0.25rem; /* 4dp gap between indicator and label */
  box-sizing: border-box;
  /* Color tokens */
  --_inactive-icon-color: var(
    --nav-rail-inactive-icon-color,
    var(--color-on-surface-variant)
  );
  --_active-icon-color: var(
    --nav-rail-active-icon-color,
    var(--color-on-secondary-container)
  );
  --_inactive-label-color: var(
    --nav-rail-inactive-label-color,
    var(--color-on-surface-variant)
  );
  --_active-label-color: var(
    --nav-rail-active-label-color,
    var(--color-on-surface)
  );
  --_indicator-color: var(
    --nav-rail-indicator-color,
    var(--color-secondary-container)
  );
  --_indicator-shape: var(--nav-rail-indicator-shape, var(--shape-corner-full));
  --_indicator-width: var(--nav-rail-indicator-width, 3.5rem); /* 56dp */
  --_indicator-height: var(--nav-rail-indicator-height, 2rem); /* 32dp */
  --_state-color: var(--_inactive-icon-color);
  /* Focus ring */
}
.item .focus-ring {
  z-index: 3;
  --focus-ring-container-shape-start-start: var(--shape-corner-small);
  --focus-ring-container-shape-start-end: var(--shape-corner-small);
  --focus-ring-container-shape-end-start: var(--shape-corner-small);
  --focus-ring-container-shape-end-end: var(--shape-corner-small);
}
.item {
  /* Active indicator (pill behind icon) */
}
.item .indicator {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--_indicator-width);
  height: var(--_indicator-height);
  border-radius: var(--_indicator-shape);
  overflow: hidden;
  flex-shrink: 0;
  transition: background-color var(--duration-short4, 200ms) var(--easing-standard, ease);
}
.item .indicator .ripple {
  inset: 0;
  z-index: 0;
  --ripple-pressed-color: var(--_state-color);
  border-radius: inherit;
}
.item .indicator .icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  position: relative;
  pointer-events: none;
}
.item .indicator .icon-container ::slotted(*) {
  --icon-size: 1.5rem; /* 24dp */
  --icon-color: var(--_inactive-icon-color);
  color: var(--_inactive-icon-color);
  display: flex;
}
.item {
  /* Label */
}
.item .label {
  font-family: var(--typography-label-medium-font-family) !important;
  font-size: var(--typography-label-medium-font-size) !important;
  font-weight: var(--typography-label-medium-font-weight) !important;
  line-height: var(--typography-label-medium-line-height) !important;
  letter-spacing: var(--typography-label-medium-letter-spacing) !important;
  color: var(--_inactive-label-color);
  text-align: center;
  pointer-events: none;
  z-index: 1;
  transition: color var(--duration-short4, 200ms) var(--easing-standard, ease), font-weight var(--duration-short4, 200ms) var(--easing-standard, ease);
}
.item {
  /* Hide label when collapsed via class */
}
.item .label.hidden {
  display: none;
}
.item {
  /* Active icon slot: hidden by default */
}
.item .active-icon-slot {
  display: none;
}
.item .hidden-slot {
  display: none;
}
.item {
  /* Item content layout */
}
.item .item-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  width: 100%;
  z-index: 1;
}
.item {
  /* Active state */
}
.item.active {
  --_state-color: var(--_active-icon-color);
}
.item.active .indicator {
  background-color: var(--_indicator-color);
}
.item.active .indicator .icon-container ::slotted(*) {
  --icon-color: var(--_active-icon-color);
  color: var(--_active-icon-color);
}
.item.active .label {
  color: var(--_active-label-color);
  font-weight: var(--font-weight-bold) !important;
}
.item {
  /* Active icon slot: show when active and slot has content */
}
.item.active.has-active-icon .active-icon-slot {
  display: flex;
}
.item.active.has-active-icon .icon-slot {
  display: none;
}
.item {
  /* Disabled state */
}
.item.disabled {
  cursor: not-allowed;
}
.item.disabled .indicator .icon-container ::slotted(*) {
  --icon-color: var(--color-on-surface);
  color: var(--color-on-surface);
  opacity: 0.38;
}
.item.disabled .label {
  color: var(--color-on-surface);
  opacity: 0.38;
}
.item.disabled .ripple {
  display: none;
}

@media (prefers-reduced-motion: reduce) {
  .item .indicator,
  .item .label {
    transition: none;
  }
}`;

var _NavigationRailItem_id;
/**
 * @label Navigation Rail Item
 * @tag wc-navigation-rail-item
 * @rawTag navigation-rail-item
 *
 * @summary An individual item within a navigation rail.
 * @overview
 * <p>Navigation rail items display a destination with an icon and optional label.</p>
 *
 * @example
 * ```html
 * <wc-navigation-rail-item>
 *   <wc-icon slot="icon">home</wc-icon>
 *   Home
 * </wc-navigation-rail-item>
 * ```
 * @tags navigation
 */
let NavigationRailItem = class NavigationRailItem extends i$1 {
    constructor() {
        super();
        _NavigationRailItem_id.set(this, crypto.randomUUID());
        /** Whether this item is currently active/selected. */
        this.active = false;
        /** Whether this item is disabled. */
        this.disabled = false;
        /** Whether the parent rail is in collapsed mode (labels hidden). */
        this.collapsed = false;
        /** Link target. */
        this.target = '_self';
        /** Reason the item is disabled (shown to screen readers). */
        this.disabledReason = '';
        /** Sets the delay for throttle in milliseconds. When null (default), no throttle is applied. */
        this.throttleDelay = null;
        /** True when the default slot contains label content. */
        this._hasLabel = false;
        /** True when the `active-icon` slot contains content. */
        this._hasActiveIcon = false;
        this.__dispatchClickWithThrottle = event => {
            this.__dispatchClick(event);
        };
        this.__dispatchClick = (event) => {
            if (this.disabled && this.href) {
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
    focus() {
        this.itemElement?.focus();
    }
    blur() {
        this.itemElement?.blur();
    }
    firstUpdated() {
        if (typeof this.throttleDelay === 'number') {
            this.__dispatchClickWithThrottle = throttle(this.__dispatchClick, this.throttleDelay);
        }
        observerSlotChangesWithCallback(this.renderRoot.querySelector('slot.label'), hasContent => {
            this._hasLabel = hasContent;
            this.requestUpdate();
        });
        observerSlotChangesWithCallback(this.renderRoot.querySelector('slot.active-icon-slot'), hasContent => {
            this._hasActiveIcon = hasContent;
            this.requestUpdate();
        });
    }
    __getDisabledReasonID() {
        return this.disabled && this.disabledReason
            ? `disabled-reason-${__classPrivateFieldGet(this, _NavigationRailItem_id, "f")}`
            : A;
    }
    __renderDisabledReason() {
        const disabledReasonID = this.__getDisabledReasonID();
        if (disabledReasonID)
            return b `<div
        id="disabled-reason-${__classPrivateFieldGet(this, _NavigationRailItem_id, "f")}"
        role="tooltip"
        aria-label=${this.disabledReason}
        class="screen-reader-only"
      >
        ${this.disabledReason}
      </div>`;
        return A;
    }
    __renderItemContent() {
        return b `
      <wc-focus-ring class="focus-ring" for="item"></wc-focus-ring>

      <div class="item-content">
        <div class="indicator">
          <wc-ripple class="ripple"></wc-ripple>
          <div class="icon-container">
            <slot name="active-icon" class="active-icon-slot"></slot>
            <slot name="icon" class="icon-slot"></slot>
          </div>
        </div>
        <div class="label ${this.collapsed ? 'hidden' : ''}"><slot></slot></div>
      </div>

      ${this.__renderDisabledReason()}
    `;
    }
    render() {
        const cssClasses = {
            item: true,
            'item-element': true,
            active: this.active,
            disabled: this.disabled,
            'has-label': this._hasLabel,
            'has-active-icon': this._hasActiveIcon,
        };
        if (!isLink(this)) {
            return b `<button
        id="item"
        class=${e$1(cssClasses)}
        ?disabled=${this.disabled}
        aria-disabled=${`${this.disabled}`}
        aria-current=${this.active ? 'page' : A}
        ?aria-describedby=${this.__getDisabledReasonID()}
      >
        ${this.__renderItemContent()}
      </button>`;
        }
        return b `<a
      id="item"
      class=${e$1(cssClasses)}
      href=${this.href}
      target=${this.target}
      aria-current=${this.active ? 'page' : A}
      aria-disabled=${`${this.disabled}`}
      ?aria-describedby=${this.__getDisabledReasonID()}
    >
      ${this.__renderItemContent()}
    </a>`;
    }
};
_NavigationRailItem_id = new WeakMap();
NavigationRailItem.styles = [css_248z];
__decorate([
    n({ type: Boolean, reflect: true })
], NavigationRailItem.prototype, "active", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], NavigationRailItem.prototype, "disabled", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], NavigationRailItem.prototype, "collapsed", void 0);
__decorate([
    n({ reflect: true })
], NavigationRailItem.prototype, "href", void 0);
__decorate([
    n()
], NavigationRailItem.prototype, "target", void 0);
__decorate([
    n({ reflect: true })
], NavigationRailItem.prototype, "value", void 0);
__decorate([
    n({ attribute: 'disabled-reason' })
], NavigationRailItem.prototype, "disabledReason", void 0);
__decorate([
    n({ type: Number })
], NavigationRailItem.prototype, "throttleDelay", void 0);
__decorate([
    r()
], NavigationRailItem.prototype, "_hasLabel", void 0);
__decorate([
    r()
], NavigationRailItem.prototype, "_hasActiveIcon", void 0);
__decorate([
    e('.item-element')
], NavigationRailItem.prototype, "itemElement", void 0);
NavigationRailItem = __decorate([
    IndividualComponent
], NavigationRailItem);

export { NavigationRailItem };
//# sourceMappingURL=navigation-rail-item.js.map
