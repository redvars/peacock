import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { Tab } from './tab.js';
import './state-DkTK9EGF.js';
import './query-CHb9Ft_d.js';
import './base-Cl6v8-BZ.js';
import './class-map-DG7CA1et.js';
import './directive-ZPhl09Yt.js';
import './dispatch-event-utils-CuEqjlPT.js';
import './observe-slot-change-DPxaZrZF.js';
import './throttle-C7ZAPqtu.js';
import './is-link-Dk2OV3PM.js';
import './spread-B5cgadZl.js';

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
 * @summary Container for tab components.
 * @overview
 * <p>Tabs holds the tab buttons and manages their layout.</p>
 *
 * @example
 * ```html
 * <wc-tabs>
 *   <wc-tab active>Tab 1</wc-tab>
 *   <wc-tab>Tab 2</wc-tab>
 * </wc-tabs>
 * ```
 * @tags navigation
 */
let Tabs = Tabs_1 = class Tabs extends i$1 {
    constructor() {
        super(...arguments);
        this.variant = 'primary';
        this.managed = false;
        this.__handleTabClick = (event) => {
            if (this.managed)
                return;
            const detailEvent = event;
            const path = detailEvent.composedPath();
            const clickedTab = path.find(node => node instanceof Element && node.tagName.toLowerCase() === 'wc-tab');
            if (!clickedTab)
                return;
            const previousActiveTab = this.__getActiveTab();
            const tabs = this.__getTabs();
            let clickedIndex = -1;
            for (let index = 0; index < tabs.length; index += 1) {
                const tab = tabs[index];
                tab.active = false;
                if (tab === clickedTab)
                    clickedIndex = index;
            }
            clickedTab.active = true;
            this.__animateIndicatorTransition(previousActiveTab, clickedTab);
            this.__lastActiveTab = clickedTab;
            this.dispatchEvent(new CustomEvent('tab-click', {
                bubbles: true,
                composed: true,
                detail: {
                    index: clickedIndex,
                    value: clickedTab.value,
                },
            }));
        };
    }
    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('click', this.__handleTabClick);
    }
    firstUpdated() {
        this.__mutationObserver = new MutationObserver(() => {
            this.__syncIndicatorsFromActiveState();
        });
        this.__mutationObserver.observe(this, {
            subtree: true,
            childList: true,
            attributes: true,
            attributeFilter: ['active', 'disabled'],
        });
        this.__lastActiveTab = this.__getActiveTab();
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
    __getTabs() {
        return Array.from(this.querySelectorAll('wc-tab'));
    }
    __getActiveTab() {
        return this.__getTabs().find(tab => tab.active && !tab.disabled);
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
        if (this.__lastActiveTab && activeTab && this.__lastActiveTab !== activeTab) {
            this.__animateIndicatorTransition(this.__lastActiveTab, activeTab);
        }
        this.__lastActiveTab = activeTab;
    }
    render() {
        return b `
      <div class="tabs">
        <slot></slot>
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
