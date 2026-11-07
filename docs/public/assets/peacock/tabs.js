import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { Tab } from './tab.js';
import { R as RovingFocusController } from './roving-focus-controller-fm95JkZJ.js';
import { i as isLink } from './is-link-Dk2OV3PM.js';
import './state-BCeDVCI9.js';
import './query-CHb9Ft_d.js';
import './base-Cl6v8-BZ.js';
import './class-map-NDIkZErE.js';
import './directive-ZPhl09Yt.js';
import './throttle-SQ9t-HL7.js';
import './observe-slot-change-DPxaZrZF.js';
import './spread-B5cgadZl.js';

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
.tabs {
  display: flex;
  position: relative;
  width: 100%;
  height: var(--tabs-height);
}

:host([variant=primary]) {
  --tabs-height: 4rem;
}
:host([variant=primary]) .tabs {
  border-bottom: 1px solid var(--color-surface-variant);
}

:host([variant=secondary]) {
  --tabs-height: 3rem;
}
:host([variant=secondary]) .tabs {
  border-bottom: 1px solid var(--color-surface-variant);
}

:host([variant=filled]) {
  --tabs-height: 3rem;
}
:host([variant=filled]) .tabs {
  align-items: stretch;
  gap: 0.25rem;
  padding: 0.25rem;
  border-radius: var(--shape-corner-small);
  background: var(--color-surface-container-high);
}

:host([variant=contained]) {
  --tabs-height: 3rem;
}
:host([variant=contained]) .tabs {
  align-items: stretch;
  gap: 0.25rem;
  padding: 0.25rem;
  border-radius: var(--shape-corner-extra-small);
  border: 1px solid var(--color-outline-variant);
  background: var(--color-surface);
}`;

var Tabs_1;
/**
 * @label Tabs
 * @tag wc-tabs
 * @rawTag tabs
 *
 * @summary The row of tabs, which the person moves between by clicking or with the arrow keys.
 * @overview
 * <p>Tabs holds the tab buttons and manages their layout. It follows the WAI-ARIA tabs pattern:
 * the host has <code>role="tablist"</code> (give it an <code>aria-label</code>), only the selected
 * tab is a tab stop, and the Left and Right arrow keys (mirrored in right-to-left layouts), Home
 * and End move between tabs. Moving to a tab selects it, so its panel shows at once. Disabled
 * tabs are skipped.</p>
 * <p>With <code>managed</code>, the tabs do not change the selection themselves: they fire
 * <code>change</code> and the consumer sets <code>selected</code> on the chosen tab.</p>
 * <p>When every tab is a link (<code>href</code>), the tabs are navigation rather than a tablist:
 * the host gets no tablist role, so wrap it in a <code>&lt;nav&gt;</code>.</p>
 *
 * @fires {CustomEvent<{index: number, value: string | undefined}>} change - Dispatched when the user selects a tab, by click or with the arrow keys.
 *
 * @example
 * ```html
 * <wc-tabs aria-label="Sections">
 *   <wc-tab selected>Tab 1</wc-tab>
 *   <wc-tab>Tab 2</wc-tab>
 * </wc-tabs>
 * ```
 * @tags navigation
 */
let Tabs = Tabs_1 = class Tabs extends i$1 {
    constructor() {
        // ── Static
        super(...arguments);
        // ── Properties
        this.variant = 'primary';
        /** The consumer controls the selection: the tabs fire `change` but do not select a tab. */
        this.managed = false;
        // ── Private fields
        /** One tab stop, on the selected tab; the arrow keys move it and select the tab they reach. */
        this.roving = new RovingFocusController(this, {
            items: () => this.__getTabs(),
            orientation: () => 'horizontal',
            initialItem: items => items.find(tab => tab.selected) ?? items[0],
            onMove: item => this.__selectFromUser(item),
        });
        /** Set while a click is handled, so a click on a link tab still selects it. */
        this.__clicking = false;
        this.__handleTabClick = (event) => {
            const clickedTab = event
                .composedPath()
                .find(node => node instanceof Element && node.localName === 'wc-tab');
            if (!clickedTab || !this.__getTabs().includes(clickedTab))
                return;
            this.__clicking = true;
            try {
                this.__selectFromUser(clickedTab);
            }
            finally {
                this.__clicking = false;
            }
        };
        this.__handleSlotChange = () => {
            this.roving.sync();
            this.__syncRole();
        };
    }
    // ── Lifecycle
    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('click', this.__handleTabClick);
        this.__syncRole();
    }
    firstUpdated() {
        this.__mutationObserver = new MutationObserver(() => {
            this.__syncIndicatorsFromActiveState();
            this.__syncRole();
        });
        this.__mutationObserver.observe(this, {
            subtree: true,
            childList: true,
            attributes: true,
            attributeFilter: ['selected', 'disabled', 'href'],
        });
        this.__lastActiveTab = this.__getActiveTab();
        this.__syncRole();
    }
    updated(changedProperties) {
        if (changedProperties.has('variant')) {
            this.__lastActiveTab = this.__getActiveTab();
        }
    }
    disconnectedCallback() {
        this.__mutationObserver?.disconnect();
        this.removeEventListener('click', this.__handleTabClick);
        super.disconnectedCallback();
    }
    // ── Private
    __getTabs() {
        return Array.from(this.querySelectorAll('wc-tab'));
    }
    __getActiveTab() {
        return this.__getTabs().find(tab => tab.selected && !tab.disabled);
    }
    /** A tablist, unless every tab is a link: then the tabs are navigation. */
    __syncRole() {
        const tabs = this.__getTabs();
        const navigation = tabs.length > 0 && tabs.every(tab => isLink(tab));
        if (navigation) {
            if (this.getAttribute('role') === 'tablist')
                this.removeAttribute('role');
        }
        else if (!this.hasAttribute('role')) {
            this.setAttribute('role', 'tablist');
        }
    }
    static __getTabIndicator(tab) {
        if (!tab?.shadowRoot)
            return undefined;
        return tab.shadowRoot.querySelector('.indicator');
    }
    static __getTabBackground(tab) {
        if (!tab?.shadowRoot)
            return undefined;
        return tab.shadowRoot.querySelector('.background');
    }
    __getAnimationElements(previousTab, nextTab) {
        if (this.variant === 'primary' || this.variant === 'secondary') {
            return {
                previous: Tabs_1.__getTabIndicator(previousTab),
                next: Tabs_1.__getTabIndicator(nextTab),
            };
        }
        if (this.variant === 'filled' || this.variant === 'contained') {
            return {
                previous: Tabs_1.__getTabBackground(previousTab),
                next: Tabs_1.__getTabBackground(nextTab),
            };
        }
        return {
            previous: undefined,
            next: undefined,
        };
    }
    __animateIndicatorTransition(previousTab, nextTab) {
        if (!previousTab || !nextTab || previousTab === nextTab)
            return;
        const { previous: previousAnimationElement, next: nextAnimationElement } = this.__getAnimationElements(previousTab, nextTab);
        if (!previousAnimationElement || !nextAnimationElement)
            return;
        const previousRect = previousTab.getBoundingClientRect();
        const nextRect = nextTab.getBoundingClientRect();
        const incomingOffset = previousRect.left - nextRect.left;
        const outgoingOffset = nextRect.left - previousRect.left;
        const incomingScale = previousRect.width / nextRect.width;
        const outgoingScale = nextRect.width / previousRect.width;
        nextAnimationElement.style.transition = 'none';
        nextAnimationElement.style.opacity = '0';
        nextAnimationElement.style.transform = `translateX(${incomingOffset}px) scaleX(${incomingScale})`;
        previousAnimationElement.style.transition = 'none';
        previousAnimationElement.style.opacity = '1';
        previousAnimationElement.style.transform = 'translateX(0) scaleX(1)';
        requestAnimationFrame(() => {
            nextAnimationElement.style.transition = '';
            previousAnimationElement.style.transition = '';
            nextAnimationElement.style.opacity = '1';
            nextAnimationElement.style.transform = 'translateX(0) scaleX(1)';
            previousAnimationElement.style.opacity = '0';
            previousAnimationElement.style.transform = `translateX(${outgoingOffset}px) scaleX(${outgoingScale})`;
        });
    }
    __syncIndicatorsFromActiveState() {
        const activeTab = this.__getActiveTab();
        if (this.__lastActiveTab &&
            activeTab &&
            this.__lastActiveTab !== activeTab) {
            this.__animateIndicatorTransition(this.__lastActiveTab, activeTab);
        }
        this.__lastActiveTab = activeTab;
        // The tab stop follows the selection, also when it is set from outside.
        if (activeTab && this.roving.activeItem !== activeTab) {
            this.roving.setActive(activeTab, false);
        }
    }
    /** Selects `tab` (unless managed) and tells the consumer, after a click or an arrow key. */
    __selectFromUser(tab) {
        if (tab.disabled)
            return;
        // Arrowing onto a link only moves focus; following it is the person's choice.
        if (isLink(tab) && !this.__clicking)
            return;
        const tabs = this.__getTabs();
        if (!this.managed) {
            const previousActiveTab = this.__getActiveTab();
            for (const other of tabs)
                other.selected = other === tab;
            this.__animateIndicatorTransition(previousActiveTab, tab);
            this.__lastActiveTab = tab;
        }
        const detail = {
            index: tabs.indexOf(tab),
            value: tab.value,
        };
        this.dispatchEvent(new CustomEvent('change', { bubbles: true, composed: true, detail }));
    }
    // ── Render
    render() {
        return b `
      <div
        class="tabs"
        @keydown=${this.roving.handleKeyDown}
        @focusin=${this.roving.handleFocusIn}
      >
        <slot @slotchange=${this.__handleSlotChange}></slot>
      </div>
    `;
    }
};
Tabs.styles = [css_248z];
Tabs.Tab = Tab;
__decorate([
    n({ reflect: true })
], Tabs.prototype, "variant", void 0);
__decorate([
    n({ type: Boolean })
], Tabs.prototype, "managed", void 0);
Tabs = Tabs_1 = __decorate([
    IndividualComponent
], Tabs);

export { Tabs };
//# sourceMappingURL=tabs.js.map
