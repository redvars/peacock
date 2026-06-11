import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-Bdwyrvd6.js';
import { Tabs } from './tabs.js';
import { TabPanel } from './tab-panel.js';
import './property-B49QQ8pS.js';
import './tab.js';
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

:host {
  display: flex;
  flex-direction: column;
  height: 100%;
}`;

/**
 * @label Tab Group
 * @tag wc-tab-group
 * @rawTag tab-group
 *
 * @summary The tab group component is used to display multiple panels of content in a container.
 * @overview
 * <p>The tab group component allows users to switch between different views or content sections.</p>
 *
 * @example
 * ```html
 * <wc-tab-group>
 *
 *   <wc-tabs>
 *    <wc-tab selected >Tab 1</wc-tab>
 *    <wc-tab>Tab 2</wc-tab>
 *   </wc-tabs>
 *
 *   <wc-tab-panel>Panel 1</wc-tab-panel>
 *   <wc-tab-panel>Panel 2</wc-tab-panel>
 * </wc-tab-group>
 * ```
 * @tags navigation
 */
let TabGroup = class TabGroup extends i$1 {
    constructor() {
        super(...arguments);
        this.onTabClick = (event) => {
            const custom = event;
            event.stopPropagation();
            const targetValue = custom.detail?.target || custom.detail?.value;
            if (targetValue) {
                this.selectTab(targetValue);
            }
            else if (typeof custom.detail?.index === 'number') {
                this.selectTabByIndex(custom.detail.index);
            }
        };
    }
    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('tab-click', this.onTabClick);
    }
    disconnectedCallback() {
        this.removeEventListener('tab-click', this.onTabClick);
        super.disconnectedCallback();
    }
    firstUpdated() {
        this.initializeTabs();
    }
    selectTab(target) {
        const tabs = this.getTabs();
        for (const tab of tabs) {
            tab.active = false;
            tab.selected = false;
            tab.classList.remove('previous-tab', 'next-tab');
        }
        let selectedIndex = -1;
        tabs.forEach((tab, index) => {
            const t = tab.getAttribute('target') || tab.getAttribute('value');
            if (t === target) {
                selectedIndex = index;
            }
        });
        if (selectedIndex >= 0) {
            const selectedTab = tabs[selectedIndex];
            selectedTab.active = true;
            selectedTab.selected = true;
            if (tabs[selectedIndex - 1]) {
                tabs[selectedIndex - 1].classList.add('previous-tab');
            }
            if (tabs[selectedIndex + 1]) {
                tabs[selectedIndex + 1].classList.add('next-tab');
            }
        }
        const panels = this.getTabPanels();
        for (const panel of panels) {
            const panelValue = panel.getAttribute('value');
            panel.active = panelValue === target;
        }
    }
    selectTabByIndex(index) {
        const tabs = this.getTabs();
        for (const tab of tabs) {
            tab.active = false;
            tab.selected = false;
            tab.classList.remove('previous-tab', 'next-tab');
        }
        if (index >= 0 && index < tabs.length) {
            tabs[index].active = true;
            tabs[index].selected = true;
            if (tabs[index - 1])
                tabs[index - 1].classList.add('previous-tab');
            if (tabs[index + 1])
                tabs[index + 1].classList.add('next-tab');
        }
        const panels = this.getTabPanels();
        for (let i = 0; i < panels.length; i += 1) {
            const panel = panels[i];
            panel.active = i === index;
        }
    }
    getTabs() {
        return Array.from(this.querySelectorAll(':scope > wc-tabs wc-tab'));
    }
    getTabPanels() {
        return Array.from(this.querySelectorAll(':scope > wc-tab-panel'));
    }
    getTabList() {
        return this.querySelector(':scope > wc-tabs');
    }
    tabsHaveTarget() {
        return !!this.querySelector(':scope > wc-tabs wc-tab[target]');
    }
    initializeTabs() {
        const tabs = Array.from(this.getTabs());
        if (!this.tabsHaveTarget()) {
            // No target/value attributes — use index-based activation
            const selectedIndex = tabs.findIndex(tab => tab.hasAttribute('active') ||
                tab.active ||
                tab.hasAttribute('selected') ||
                tab.selected);
            this.selectTabByIndex(selectedIndex >= 0 ? selectedIndex : 0);
        }
        else {
            const selectedTab = tabs.find(tab => tab.hasAttribute('active') ||
                tab.active ||
                tab.hasAttribute('selected') ||
                tab.selected);
            if (selectedTab) {
                const selectedTarget = selectedTab.getAttribute('target');
                if (selectedTarget)
                    this.selectTab(selectedTarget);
            }
            else if (tabs.length > 0) {
                const firstTarget = tabs[0].getAttribute('target');
                if (firstTarget)
                    this.selectTab(firstTarget);
            }
        }
    }
    render() {
        return b `<slot></slot>`;
    }
};
TabGroup.styles = [css_248z];
TabGroup.Tabs = Tabs;
TabGroup.TabPanel = TabPanel;
TabGroup = __decorate([
    IndividualComponent
], TabGroup);

export { TabGroup };
//# sourceMappingURL=tab-group.js.map
