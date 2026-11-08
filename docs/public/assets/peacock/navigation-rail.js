import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { e } from './class-map-NDIkZErE.js';
import { NavigationRailItem } from './navigation-rail-item.js';
import { I as I18nController } from './i18n-controller-Cp43HjJl.js';
import { s as selectNavigationItem } from './navigation-item-base-kUrvJgCx.js';
import './directive-ZPhl09Yt.js';
import './indicator-navigation-item-CmyhsOmy.js';
import './state-BCeDVCI9.js';
import './observe-slot-change-DPxaZrZF.js';
import './query-CHb9Ft_d.js';
import './base-Cl6v8-BZ.js';
import './throttle-SQ9t-HL7.js';
import './strings-BJPuhKJk.js';
import './locale-DEsJZCQG.js';

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
  display: block;
  height: 100%;
  width: var(--nav-rail-width, 6rem); /* 96dp */
  overflow-y: auto;
  overflow-x: hidden;
  --nav-rail-padding-block: 1.5rem;
  --nav-rail-container-color: var(--color-surface);
  --nav-rail-label-text-color: var(--color-on-surface);
}

.rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: calc(100% - var(--nav-rail-padding-block) * 2);
  width: 100%;
  border-radius: inherit;
  background-color: var(--nav-rail-container-color);
  color: var(--nav-rail-label-text-color);
  margin-block: var(--nav-rail-padding-block); /* 24dp */
  box-sizing: border-box;
}
.rail .header {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  flex-shrink: 0;
  padding-block-end: 2.5rem;
}
.rail .header:empty {
  display: none;
}
.rail wc-divider {
  width: calc(100% - 1rem);
  flex-shrink: 0;
}
.rail .items {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 0.75rem; /* 12dp between items */
  flex: 1;
}
.rail .items ::slotted(wc-navigation-rail-item) {
  width: 100%;
}
.rail .footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: auto;
  background-color: var(--nav-rail-container-color);
}
.rail .footer:empty {
  display: none;
}`;

/**
 * @label Navigation Rail
 * @tag wc-navigation-rail
 * @rawTag navigation-rail
 *
 * @summary A vertical side navigation for medium-sized screens.
 * @overview
 * <p>Navigation rail provides access to primary destinations in an app using icons—with or without labels—on a vertical rail.</p>
 * <p>Use navigation rail on medium-sized screens (tablets) with 3–7 destinations. Clicking an item makes it the
 * current one (<code>aria-current="page"</code>) and fires <code>change</code>.</p>
 *
 * @slot - The rail items.
 * @slot header - Content displayed above the rail items.
 * @slot footer - Content pinned to the bottom of the rail.
 *
 * @fires {CustomEvent<{value: string | undefined, index: number, item: NavigationRailItem}>} change - Dispatched when the user activates an item. *
 * @cssprop --nav-rail-width - Width of the rail container. Defaults to 5rem (80dp).
 * @cssprop --nav-rail-container-color - Background color of the rail. Defaults to surface color.
 * @cssprop --nav-rail-indicator-color - Color of the active indicator. Defaults to secondary-container.
 * @cssprop --nav-rail-indicator-shape - Shape (border-radius) of the active indicator. Defaults to full (pill).
 * @cssprop --nav-rail-indicator-width - Width of the active indicator. Defaults to 3.5rem (56dp).
 * @cssprop --nav-rail-indicator-height - Height of the active indicator. Defaults to 2rem (32dp).
 * @cssprop --nav-rail-inactive-icon-color - Color of inactive icons. Defaults to on-surface-variant.
 * @cssprop --nav-rail-active-icon-color - Color of active icons. Defaults to on-secondary-container.
 * @cssprop --nav-rail-inactive-label-color - Color of inactive labels. Defaults to on-surface-variant.
 * @cssprop --nav-rail-active-label-color - Color of active labels. Defaults to on-surface.
 *
 * @example
 * ```html
 * <wc-navigation-rail>
 *   <wc-navigation-rail-item current>
 *     <wc-icon slot="icon" name="home"></wc-icon>
 *     Home
 *   </wc-navigation-rail-item>
 *   <wc-navigation-rail-item>
 *     <wc-icon slot="icon" name="search"></wc-icon>
 *     Search
 *   </wc-navigation-rail-item>
 * </wc-navigation-rail>
 * ```
 * @tags navigation
 */
let NavigationRail = class NavigationRail extends i$1 {
    constructor() {
        // ── Static ───────────────────────────────────────────────────────────────
        super(...arguments);
        // ── Properties ───────────────────────────────────────────────────────────
        /**
         * Display mode of the navigation rail.
         * - `"expanded"`: shows labels.
         * - `"collapsed"`: hides labels.
         */
        this.mode = 'expanded';
        /** Whether to show a divider between the header and items sections. */
        this.showDivider = false;
        // ── Private fields ───────────────────────────────────────────────────────
        /** Peacock's strings for the default landmark label. */
        this.i18n = new I18nController(this);
        // ── Private methods ──────────────────────────────────────────────────────
        this.handleItemClick = (event) => {
            selectNavigationItem(this, event, 'wc-navigation-rail-item');
        };
        this.syncItemMode = () => {
            const isCollapsed = this.mode === 'collapsed';
            for (const railItem of this.getItems()) {
                railItem.collapsed = isCollapsed;
            }
        };
    }
    // ── Lifecycle ────────────────────────────────────────────────────────────
    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('click', this.handleItemClick);
        this.setAttribute('role', 'navigation');
        this.syncLabel();
    }
    disconnectedCallback() {
        this.removeEventListener('click', this.handleItemClick);
        super.disconnectedCallback();
    }
    willUpdate() {
        this.syncLabel();
    }
    firstUpdated() {
        this.syncItemMode();
    }
    updated(changedProperties) {
        if (changedProperties.has('mode')) {
            this.syncItemMode();
        }
    }
    /** Gives the landmark the default label unless the author set one. */
    syncLabel() {
        const current = this.getAttribute('aria-label');
        if (current !== null && current !== this.defaultLabel)
            return;
        this.defaultLabel = this.i18n.t('mainNavigation');
        this.setAttribute('aria-label', this.defaultLabel);
    }
    getItems() {
        return Array.from(this.querySelectorAll('wc-navigation-rail-item'));
    }
    // ── Render ───────────────────────────────────────────────────────────────
    render() {
        const cssClasses = {
            rail: true,
            [`mode-${this.mode}`]: true,
        };
        return b `
      <div class=${e(cssClasses)}>
        <div class="header">
          <slot name="header"></slot>
        </div>
        ${this.showDivider ? b `<wc-divider></wc-divider>` : ''}
        <div class="items">
          <slot @slotchange=${this.syncItemMode}></slot>
        </div>
        <div class="footer">
          <slot name="footer"></slot>
        </div>
      </div>
    `;
    }
};
NavigationRail.styles = [css_248z];
NavigationRail.Item = NavigationRailItem;
__decorate([
    n({ reflect: true })
], NavigationRail.prototype, "mode", void 0);
__decorate([
    n({ type: Boolean, attribute: 'show-divider' })
], NavigationRail.prototype, "showDivider", void 0);
NavigationRail = __decorate([
    IndividualComponent
], NavigationRail);

export { NavigationRail };
//# sourceMappingURL=navigation-rail.js.map
