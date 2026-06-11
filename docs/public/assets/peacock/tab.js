import { i, _ as __decorate, I as IndividualComponent, a as i$1, b, A, c as __classPrivateFieldGet } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { r } from './state-DkTK9EGF.js';
import { e } from './query-CHb9Ft_d.js';
import { e as e$1 } from './class-map-DG7CA1et.js';
import { i as isActivationClick, d as dispatchActivationClick } from './dispatch-event-utils-CuEqjlPT.js';
import { o as observerSlotChangesWithCallback } from './observe-slot-change-DPxaZrZF.js';
import { t as throttle } from './throttle-C7ZAPqtu.js';
import { i as isLink } from './is-link-Dk2OV3PM.js';
import { s as spread } from './spread-B5cgadZl.js';
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
  display: inline-block;
  height: 100%;
  --tab-outline-color: var(--color-primary);
}

.tab-element {
  background: transparent;
  border: none;
  appearance: none;
  margin: 0;
  outline: none;
  text-decoration: none;
}

.tab {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 var(--_container-padding);
  width: 100%;
  cursor: pointer;
}
.tab .tab-content {
  position: relative;
  font-family: var(--typography-title-small-font-family) !important;
  font-size: var(--typography-title-small-font-size) !important;
  font-weight: var(--typography-title-small-font-weight) !important;
  line-height: var(--typography-title-small-line-height) !important;
  letter-spacing: var(--typography-title-small-letter-spacing) !important;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  z-index: 0;
  color: var(--_label-text-color);
  opacity: var(--_label-text-opacity, 1);
  transition: color var(--duration-short4) var(--easing-standard), opacity var(--duration-short4) var(--easing-standard);
  --icon-size: var(--tab-icon-size, var(--_tab-icon-size));
  --icon-color: var(--_label-text-color);
}
.tab .tab-content ::slotted([slot=icon]) {
  color: var(--_label-text-color);
  --icon-size: var(--tab-icon-size, var(--_tab-icon-size));
  --icon-color: var(--_label-text-color);
}
.tab .tab-content ::slotted([slot=badge]) {
  --badge-color: var(--_tab-badge-color, var(--color-error));
}
.tab .indicator {
  position: absolute;
  pointer-events: none;
  z-index: 1;
  background: var(--_active-indicator-color);
  border-radius: var(--_active-indicator-shape);
  transform: scaleX(0.6);
  transform-origin: center bottom;
  height: var(--_active-indicator-height);
  inset: auto 0px 0px;
  opacity: 0;
  transition: transform var(--duration-medium2) var(--easing-standard), opacity var(--duration-short4) var(--easing-standard);
  will-change: transform, opacity;
}
.tab .background {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0;
  transform: scaleX(0.6);
  transform-origin: center center;
  transition: transform var(--duration-medium2) var(--easing-standard), opacity var(--duration-short4) var(--easing-standard), background-color var(--duration-short4) var(--easing-standard);
  will-change: transform, opacity;
}
.tab.has-content .slot-container {
  display: flex;
  flex: none;
  justify-content: center;
}
.tab.disabled {
  cursor: not-allowed;
}
.tab {
  /*
    Background layers
   */
}
.tab .focus-ring {
  z-index: 2;
  --focus-ring-container-shape-start-start: var(--_container-shape-start-start);
  --focus-ring-container-shape-start-end: var(--_container-shape-start-end);
  --focus-ring-container-shape-end-start: var(--_container-shape-end-start);
  --focus-ring-container-shape-end-end: var(--_container-shape-end-end);
  --focus-ring-container-shape-variant: var(--_container-corner-shape-variant);
}
.tab .ripple {
  corner-shape: var(--_container-corner-shape-variant);
  --ripple-state-opacity: var(--_container-state-opacity, 0);
  --ripple-pressed-color: var(--_container-state-color);
}
.tab .outline {
  z-index: 1;
  display: none;
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  border: var(--_outline-width) solid var(--_outline-color);
  border-start-start-radius: var(--_container-shape-start-start);
  border-start-end-radius: var(--_container-shape-start-end);
  border-end-start-radius: var(--_container-shape-end-start);
  border-end-end-radius: var(--_container-shape-end-end);
}

:host-context([variant=primary]) .tab {
  --_container-padding: 1rem;
  --_tab-icon-size: 1.5rem;
  --_tab-icon-label-spacing: 0.5rem;
  --_tab-badge-label-spacing: 0.25rem;
  --_tab-badge-color: var(--color-error);
  --_label-text-color: var(--color-on-surface);
  --_container-state-color: var(--_label-text-color);
  --_container-shape-start-start: var(--shape-corner-small);
  --_container-shape-start-end: var(--shape-corner-small);
  --_container-shape-end-start: var(--shape-corner-small);
  --_container-shape-end-end: var(--shape-corner-small);
  --_active-indicator-color: var(--color-primary);
  --_active-indicator-shape: 3px 3px 0 0;
  --_active-indicator-height: 2px;
}
:host-context([variant=primary]) .tab .focus-ring {
  inset: 3px 3px 4px 3px;
}
:host-context([variant=primary]) .tab .tab-content {
  flex-direction: column;
}
:host-context([variant=primary]) .tab .tab-content .icon-section {
  position: relative;
}
:host-context([variant=primary]) .tab .tab-content .icon-section ::slotted([slot=badge]) {
  position: absolute;
  top: 0;
  left: calc(100% - 3px);
}
:host-context([variant=primary]) .tab .tab-content .icon-section ::slotted([slot=badge][value]) {
  position: absolute;
  top: 0;
  left: calc(100% - 6px);
}
:host-context([variant=primary]) .tab.active .indicator {
  opacity: 1;
  transform: scaleX(1);
}
:host-context([variant=primary]) .tab.active .focus-ring {
  inset: 3px 3px calc(4px + var(--_active-indicator-height)) 3px;
}
:host-context([variant=primary]) .tab:hover:not(:where(.disabled)) {
  --_container-state-opacity: 0.08;
}
:host-context([variant=primary]) .tab:active:not(:where(.disabled)) {
  --_container-state-opacity: 0.12;
}
:host-context([variant=primary]) .tab.disabled {
  --_label-text-color: var(--color-on-surface);
  --_label-text-opacity: 0.38;
}
:host-context([variant=primary]) .tab.disabled .ripple {
  display: none;
}

:host-context([variant=secondary]) .tab {
  --_container-padding: 1rem;
  --_tab-icon-size: 1.25rem;
  --_tab-icon-label-spacing: 0.5rem;
  --_tab-badge-label-spacing: 0.25rem;
  --_tab-badge-color: var(--color-error);
  --_label-text-color: var(--color-on-surface);
  --_container-state-color: var(--_label-text-color);
  --_container-shape-start-start: var(--shape-corner-small);
  --_container-shape-start-end: var(--shape-corner-small);
  --_container-shape-end-start: var(--shape-corner-small);
  --_container-shape-end-end: var(--shape-corner-small);
  --_active-indicator-color: var(--color-primary);
  --_active-indicator-shape: 0;
  --_active-indicator-height: 2px;
}
:host-context([variant=secondary]) .tab .focus-ring {
  inset: 3px 3px 4px 3px;
}
:host-context([variant=secondary]) .tab .tab-content ::slotted([slot=icon]) {
  margin-inline-end: var(--_tab-icon-label-spacing);
}
:host-context([variant=secondary]) .tab .tab-content ::slotted([slot=badge]) {
  margin-inline-start: var(--_tab-badge-label-spacing);
}
:host-context([variant=secondary]) .tab.active .indicator {
  opacity: 1;
  transform: scaleX(1);
}
:host-context([variant=secondary]) .tab.active .focus-ring {
  inset: 3px 3px calc(4px + var(--_active-indicator-height)) 3px;
}
:host-context([variant=secondary]) .tab:hover:not(:where(.disabled)) {
  --_container-state-opacity: 0.08;
}
:host-context([variant=secondary]) .tab:active:not(:where(.disabled)) {
  --_container-state-opacity: 0.12;
}
:host-context([variant=secondary]) .tab.disabled {
  --_label-text-color: var(--color-on-surface);
  --_label-text-opacity: 0.38;
}
:host-context([variant=secondary]) .tab.disabled .ripple {
  display: none;
}

:host-context([variant=filled]) .tab {
  --_container-padding: 1rem;
  --_tab-icon-size: 1.25rem;
  --_tab-icon-label-spacing: 0.5rem;
  --_tab-badge-label-spacing: 0.25rem;
  --_tab-badge-color: var(--color-error);
  --_label-text-color: var(--color-on-surface-variant);
  --_container-state-color: var(--color-on-surface);
  --_container-shape-start-start: var(--shape-corner-medium);
  --_container-shape-start-end: var(--shape-corner-medium);
  --_container-shape-end-start: var(--shape-corner-medium);
  --_container-shape-end-end: var(--shape-corner-medium);
  --_container-corner-shape-variant: squircle;
  --_active-surface-color: var(--color-surface);
}
:host-context([variant=filled]) .tab .focus-ring {
  inset: 2px;
}
:host-context([variant=filled]) .tab .tab-content ::slotted([slot=icon]) {
  margin-inline-end: var(--_tab-icon-label-spacing);
}
:host-context([variant=filled]) .tab .tab-content ::slotted([slot=badge]) {
  margin-inline-start: var(--_tab-badge-label-spacing);
}
:host-context([variant=filled]) .tab .indicator {
  display: none;
}
:host-context([variant=filled]) .tab .ripple {
  border-start-start-radius: var(--_container-shape-start-start);
  border-start-end-radius: var(--_container-shape-start-end);
  border-end-start-radius: var(--_container-shape-end-start);
  border-end-end-radius: var(--_container-shape-end-end);
}
:host-context([variant=filled]) .tab .background {
  corner-shape: var(--_container-corner-shape-variant);
  border-start-start-radius: var(--_container-shape-start-start);
  border-start-end-radius: var(--_container-shape-start-end);
  border-end-start-radius: var(--_container-shape-end-start);
  border-end-end-radius: var(--_container-shape-end-end);
  background: var(--_active-surface-color);
}
:host-context([variant=filled]) .tab.active {
  --_label-text-color: var(--color-on-surface);
}
:host-context([variant=filled]) .tab.active .background {
  opacity: 1;
  transform: scaleX(1);
}
:host-context([variant=filled]) .tab.active .ripple {
  display: none;
}
:host-context([variant=filled]) .tab:hover:not(:where(.disabled)) {
  --_container-state-opacity: 0.08;
}
:host-context([variant=filled]) .tab:active:not(:where(.disabled)) {
  --_container-state-opacity: 0.12;
}
:host-context([variant=filled]) .tab.disabled {
  --_label-text-color: var(--color-on-surface);
  --_label-text-opacity: 0.38;
}
:host-context([variant=filled]) .tab.disabled .ripple {
  display: none;
}

:host-context([variant=contained]) .tab {
  --_container-padding: 1rem;
  --_tab-icon-size: 1.25rem;
  --_tab-icon-label-spacing: 0.5rem;
  --_tab-badge-label-spacing: 0.25rem;
  --_tab-badge-color: var(--color-error);
  --_label-text-color: var(--color-on-surface);
  --_container-state-color: var(--color-primary);
  --_container-shape-start-start: var(--shape-corner-small);
  --_container-shape-start-end: var(--shape-corner-small);
  --_container-shape-end-start: var(--shape-corner-small);
  --_container-shape-end-end: var(--shape-corner-small);
  --_container-corner-shape-variant: squircle;
  --_active-surface-color: var(--color-secondary-container);
}
:host-context([variant=contained]) .tab .focus-ring {
  inset: 2px;
}
:host-context([variant=contained]) .tab .tab-content ::slotted([slot=icon]) {
  margin-inline-end: var(--_tab-icon-label-spacing);
}
:host-context([variant=contained]) .tab .tab-content ::slotted([slot=badge]) {
  margin-inline-start: var(--_tab-badge-label-spacing);
}
:host-context([variant=contained]) .tab .indicator {
  display: none;
}
:host-context([variant=contained]) .tab .ripple {
  border-start-start-radius: var(--_container-shape-start-start);
  border-start-end-radius: var(--_container-shape-start-end);
  border-end-start-radius: var(--_container-shape-end-start);
  border-end-end-radius: var(--_container-shape-end-end);
}
:host-context([variant=contained]) .tab .background {
  corner-shape: var(--_container-corner-shape-variant);
  border-start-start-radius: var(--_container-shape-start-start);
  border-start-end-radius: var(--_container-shape-start-end);
  border-end-start-radius: var(--_container-shape-end-start);
  border-end-end-radius: var(--_container-shape-end-end);
  background: var(--_active-surface-color);
}
:host-context([variant=contained]) .tab.active {
  --_label-text-color: var(--color-on-secondary-container);
}
:host-context([variant=contained]) .tab.active .background {
  opacity: 1;
  transform: scaleX(1);
}
:host-context([variant=contained]) .tab:hover:not(:where(.disabled)) {
  --_container-state-opacity: 0.08;
}
:host-context([variant=contained]) .tab:active:not(:where(.disabled)) {
  --_container-state-opacity: 0.12;
}
:host-context([variant=contained]) .tab.disabled {
  --_label-text-color: var(--color-on-surface);
  --_label-text-opacity: 0.38;
}
:host-context([variant=contained]) .tab.disabled .ripple {
  display: none;
}

@media (prefers-reduced-motion: reduce) {
  .tab .tab-content,
  .tab .indicator,
  .tab .background {
    transition: none;
  }
}`;

var _Tab_id;
/**
 * @label Tab
 * @tag wc-tab
 * @rawTag tab
 *
 * @summary A tab component for use within tabs.
 * @overview
 * <p>Tab represents an individual tab in a tabs component.</p>
 *
 * @example
 * ```html
 * <wc-tab>Tab Label</wc-tab>
 * ```
 * @tags navigation
 */
let Tab = class Tab extends i$1 {
    focus() {
        this.tabElement?.focus();
    }
    blur() {
        this.tabElement?.blur();
    }
    constructor() {
        super();
        _Tab_id.set(this, crypto.randomUUID());
        this.active = false;
        this.disabled = false;
        this.disabledReason = '';
        /**
         * Sets or retrieves the window or frame at which to target content.
         */
        this.target = '_self';
        this.hasFocus = false;
        this.slotHasContent = false;
        this.slotHasIcon = false;
        this.slotHasBadge = false;
        this._tabindex = 0;
        this.__dispatchClickWithThrottle = event => {
            this.__dispatchClick(event);
        };
        this.__dispatchClick = (event) => {
            // If the button is soft-disabled or a disabled link, we need to explicitly
            // prevent the click from propagating to other event listeners as well as
            // prevent the default action.
            if (this.disabled && this.href) {
                event.stopImmediatePropagation();
                event.preventDefault();
                return;
            }
            if (!isActivationClick(event) || !this.tabElement) {
                return;
            }
            this.focus();
            dispatchActivationClick(this.tabElement);
        };
        this._tabindex = 0;
        this.addEventListener('click', this.__dispatchClickWithThrottle);
    }
    firstUpdated() {
        if (typeof this.throttleDelay === 'number') {
            this.__dispatchClickWithThrottle = throttle(this.__dispatchClick, this.throttleDelay);
        }
        observerSlotChangesWithCallback(this.renderRoot.querySelector('slot:not([name])'), hasContent => {
            this.slotHasContent = hasContent;
            this.requestUpdate();
        });
        observerSlotChangesWithCallback(this.renderRoot.querySelector('slot[name="icon"]'), hasContent => {
            this.slotHasIcon = hasContent;
            this.requestUpdate();
        });
        observerSlotChangesWithCallback(this.renderRoot.querySelector('slot[name="badge"]'), hasContent => {
            this.slotHasBadge = hasContent;
            this.requestUpdate();
        });
    }
    __getParentTabsVariant() {
        return this.closest('wc-tabs')?.variant ?? 'primary';
    }
    // private handleKeyDown(evt: KeyboardEvent) {
    //   if (this.disabled || this.showLoader) return;
    //   if (evt.key === 'Enter' || evt.key === ' ') {
    //     evt.preventDefault();
    //     this.isActive = true;
    //     this.dispatchTabClick();
    //   }
    // }
    render() {
        const variant = this.__getParentTabsVariant();
        const cssClasses = {
            tab: true,
            'tab-element': true,
            disabled: this.disabled,
            active: this.active,
            [`variant-${variant}`]: true,
            'has-content': this.slotHasContent,
            'has-icon': this.slotHasIcon,
            'has-badge': this.slotHasBadge,
        };
        if (!isLink(this)) {
            return b `<button
        id="button"
        class=${e$1(cssClasses)}
        tabindex="0"
        ?aria-describedby=${this.__getDisabledReasonID()}
        aria-disabled=${`${this.disabled}`}
        ?disabled=${this.disabled}
        ${spread(this.configAria)}
      >
        ${this.renderTabContent(variant)}
      </button>`;
        }
        return b `<a
      class=${e$1(cssClasses)}
      id="button"
      tabindex="0"
      href=${this.href}
      target=${this.target}
      role="button"
      ?aria-describedby=${this.__getDisabledReasonID()}
      aria-disabled=${`${this.disabled}`}
      ${spread(this.configAria)}
    >
      ${this.renderTabContent(variant)}
    </a>`;
    }
    renderTabContent(variant) {
        switch (variant) {
            case 'secondary':
                return this.renderSecondaryTabContent();
            case 'contained':
                return this.renderContainedTabContent();
            case 'filled':
                return this.renderFilledTabContent();
            case 'primary':
            default:
                return this.renderPrimaryTabContent();
        }
    }
    renderPrimaryTabContent() {
        return b `
      <wc-focus-ring class="focus-ring" for="button"></wc-focus-ring>
      <wc-elevation class="elevation"></wc-elevation>
      <div class="background"></div>
      <div class="outline"></div>
      <wc-ripple class="ripple"></wc-ripple>

      <div class="tab-content">
        <div class="icon-section">
          <slot name="badge"></slot>
          <slot name="icon"></slot>
        </div>
        <div class="slot-container">
          <slot></slot>
        </div>

        <div class="indicator"></div>
      </div>

      ${this.__renderDisabledReason()}
    `;
    }
    renderSecondaryTabContent() {
        return b `
      <wc-focus-ring class="focus-ring" for="button"></wc-focus-ring>
      <wc-elevation class="elevation"></wc-elevation>
      <div class="background"></div>
      <div class="outline"></div>
      <wc-ripple class="ripple"></wc-ripple>

      <div class="tab-content">
        <slot name="icon"></slot>

        <div class="slot-container">
          <slot></slot>
        </div>

        <slot name="badge"></slot>
      </div>

      <div class="indicator"></div>

      ${this.__renderDisabledReason()}
    `;
    }
    renderContainedTabContent() {
        return this.renderSegmentedTabContent();
    }
    renderFilledTabContent() {
        return this.renderSegmentedTabContent();
    }
    renderSegmentedTabContent() {
        return b `
      <wc-focus-ring class="focus-ring" for="button"></wc-focus-ring>
      <wc-elevation class="elevation"></wc-elevation>
      <div class="background"></div>
      <div class="outline"></div>
      <wc-ripple class="ripple"></wc-ripple>

      <div class="tab-content">
        <slot name="icon"></slot>

        <div class="slot-container">
          <slot></slot>
        </div>

        <slot name="badge"></slot>
      </div>

      ${this.__renderDisabledReason()}
    `;
    }
    __getDisabledReasonID() {
        return this.disabled && this.disabledReason
            ? `disabled-reason-${__classPrivateFieldGet(this, _Tab_id, "f")}`
            : A;
    }
    __renderDisabledReason() {
        const disabledReasonID = this.__getDisabledReasonID();
        if (disabledReasonID)
            return b `<div
        id="disabled-reason-${__classPrivateFieldGet(this, _Tab_id, "f")}"
        role="tooltip"
        aria-label=${this.disabledReason}
        class="screen-reader-only"
      >
        {this.disabledReason}
      </div>`;
        return A;
    }
};
_Tab_id = new WeakMap();
Tab.styles = [css_248z];
__decorate([
    n({ type: Boolean, reflect: true })
], Tab.prototype, "active", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Tab.prototype, "disabled", void 0);
__decorate([
    n({ type: String })
], Tab.prototype, "disabledReason", void 0);
__decorate([
    n({ type: String })
], Tab.prototype, "value", void 0);
__decorate([
    n({ reflect: true })
], Tab.prototype, "configAria", void 0);
__decorate([
    n()
], Tab.prototype, "target", void 0);
__decorate([
    n({ type: String, reflect: true })
], Tab.prototype, "href", void 0);
__decorate([
    n()
], Tab.prototype, "throttleDelay", void 0);
__decorate([
    r()
], Tab.prototype, "hasFocus", void 0);
__decorate([
    r()
], Tab.prototype, "slotHasContent", void 0);
__decorate([
    r()
], Tab.prototype, "slotHasIcon", void 0);
__decorate([
    r()
], Tab.prototype, "slotHasBadge", void 0);
__decorate([
    e('.tab-element')
], Tab.prototype, "tabElement", void 0);
Tab = __decorate([
    IndividualComponent
], Tab);

export { Tab };
//# sourceMappingURL=tab.js.map
