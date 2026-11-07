import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-BK7XZjE2.js';
import { Tabs } from './tabs.js';
import { TabPanel } from './tab-panel.js';
import './property-B2TG3KEE.js';
import './tab.js';
import './state-BCeDVCI9.js';
import './query-CHb9Ft_d.js';
import './base-Cl6v8-BZ.js';
import './class-map-NDIkZErE.js';
import './directive-ZPhl09Yt.js';
import './throttle-SQ9t-HL7.js';
import './observe-slot-change-DPxaZrZF.js';
import './is-link-Dk2OV3PM.js';
import './spread-B5cgadZl.js';
import './roving-focus-controller-fm95JkZJ.js';

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
  display: flex;
  flex-direction: column;
  height: 100%;
}`;

/** The key that links a tab to its panel: the tab's `value`. */
function tabKey(tab) {
    return tab.getAttribute('value') || tab.value || null;
}
/** Gives `element` an id if it has none, so ARIA attributes can point at it. */
function ensureId(element, prefix) {
    if (!element.id) {
        // eslint-disable-next-line no-param-reassign
        element.id = `${prefix}-${crypto.randomUUID()}`;
    }
    return element.id;
}
/**
 * @label Tab Group
 * @tag wc-tab-group
 * @rawTag tab-group
 *
 * @summary Pairs a row of tabs with their panels and shows the panel of the selected tab.
 * @overview
 * <p>Tabs and panels are matched by <code>value</code> (<code>&lt;wc-tab value="billing"&gt;</code> shows
 * <code>&lt;wc-tab-panel value="billing"&gt;</code>), or by position when no tab has a value.</p>
 * <p>The group wires the tabs pattern: each panel is labelled by its tab, and each tab points at
 * its panel. Tabs and panels added later are wired too. When the <code>wc-tabs</code> is
 * <code>managed</code>, the group leaves the selection to the consumer.</p>
 *
 * @example
 * ```html
 * <wc-tab-group>
 *   <wc-tabs aria-label="Sections">
 *    <wc-tab selected>Tab 1</wc-tab>
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
        // ── Static
        super(...arguments);
        // ── Private fields
        /** Re-wires when tabs or panels are added or removed, including tabs inside `wc-tabs`. */
        this.__observer = new MutationObserver(records => {
            const relevant = records.some(record => record.target === this ||
                (record.target instanceof Element &&
                    record.target.localName === 'wc-tabs'));
            if (relevant)
                this.__sync();
        });
        this.__handleChange = (event) => {
            // Only the group's own tab list; a `change` from a field inside a panel is not a tab change.
            const tabList = this.getTabList();
            if (!tabList || event.target !== tabList || tabList.managed)
                return;
            const { detail } = event;
            const tab = this.getTabs()[detail.index];
            const key = tab ? tabKey(tab) : null;
            if (key !== null && this.tabsHaveKey())
                this.selectTab(key);
            else
                this.selectTabByIndex(detail.index);
        };
    }
    // ── Lifecycle
    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('change', this.__handleChange);
        this.__observer.observe(this, { childList: true, subtree: true });
    }
    disconnectedCallback() {
        this.removeEventListener('change', this.__handleChange);
        this.__observer.disconnect();
        super.disconnectedCallback();
    }
    firstUpdated() {
        this.__sync();
    }
    // ── Public
    /** Selects the tab whose key (`value`) is `target`, and shows its panel. */
    selectTab(target) {
        const index = this.getTabs().findIndex(tab => tabKey(tab) === target);
        this.__select(index, target);
    }
    /** Selects the tab at `index`, and shows the panel at the same position. */
    selectTabByIndex(index) {
        this.__select(index, null);
    }
    // ── Private
    getTabs() {
        return Array.from(this.querySelectorAll(':scope > wc-tabs wc-tab'));
    }
    getTabPanels() {
        return Array.from(this.querySelectorAll(':scope > wc-tab-panel'));
    }
    getTabList() {
        return this.querySelector(':scope > wc-tabs');
    }
    tabsHaveKey() {
        return this.getTabs().some(tab => tabKey(tab) !== null);
    }
    /** The panel for the tab at `index`: by key when tabs have keys, else by position. */
    __panelFor(tab, index, keyed) {
        const panels = this.getTabPanels();
        if (!keyed)
            return panels[index] ?? null;
        const key = tabKey(tab);
        return key === null
            ? null
            : (panels.find(panel => panel.getAttribute('value') === key) ?? null);
    }
    __select(index, key) {
        const tabs = this.getTabs();
        const keyed = key !== null;
        tabs.forEach((tab, i) => {
            /* eslint-disable no-param-reassign */
            tab.selected = i === index;
            /* eslint-enable no-param-reassign */
            tab.classList.toggle('previous-tab', index >= 0 && i === index - 1);
            tab.classList.toggle('next-tab', index >= 0 && i === index + 1);
        });
        this.getTabPanels().forEach((panel, i) => {
            // eslint-disable-next-line no-param-reassign
            panel.active = keyed ? panel.getAttribute('value') === key : i === index;
        });
    }
    /** Links each tab and its panel, and makes sure one tab is selected. */
    __sync() {
        const tabs = this.getTabs();
        const keyed = this.tabsHaveKey();
        tabs.forEach((tab, index) => {
            const panel = this.__panelFor(tab, index, keyed);
            // eslint-disable-next-line no-param-reassign
            tab.panel = panel;
            if (panel) {
                panel.setAttribute('aria-labelledby', ensureId(tab, 'wc-tab'));
                ensureId(panel, 'wc-tab-panel');
            }
        });
        const selected = tabs.findIndex(tab => tab.selected);
        const index = selected >= 0 ? selected : 0;
        if (tabs.length === 0)
            return;
        if (keyed) {
            const key = tabKey(tabs[index]);
            if (key !== null)
                this.__select(index, key);
        }
        else {
            this.__select(index, null);
        }
    }
    // ── Render
    render() {
        return b `<slot @slotchange=${() => this.__sync()}></slot>`;
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
