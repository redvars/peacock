import { LitElement } from 'lit';
import { Tabs } from './tabs.js';
import { TabPanel } from './tab-panel.js';
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
export declare class TabGroup extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    static Tabs: typeof Tabs;
    static TabPanel: typeof TabPanel;
    /** Re-wires when tabs or panels are added or removed, including tabs inside `wc-tabs`. */
    private readonly __observer;
    connectedCallback(): void;
    disconnectedCallback(): void;
    firstUpdated(): void;
    /** Selects the tab whose key (`value`) is `target`, and shows its panel. */
    selectTab(target: string): void;
    /** Selects the tab at `index`, and shows the panel at the same position. */
    selectTabByIndex(index: number): void;
    private getTabs;
    private getTabPanels;
    private getTabList;
    private tabsHaveKey;
    /** The panel for the tab at `index`: by key when tabs have keys, else by position. */
    private __panelFor;
    private __select;
    /** Links each tab and its panel, and makes sure one tab is selected. */
    private __sync;
    private __handleChange;
    render(): import("lit-html").TemplateResult<1>;
}
