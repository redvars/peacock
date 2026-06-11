import { LitElement } from 'lit';
import { Tabs } from './tabs.js';
import { TabPanel } from './tab-panel.js';
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
export declare class TabGroup extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    static Tabs: typeof Tabs;
    static TabPanel: typeof TabPanel;
    connectedCallback(): void;
    disconnectedCallback(): void;
    firstUpdated(): void;
    private onTabClick;
    selectTab(target: string): void;
    selectTabByIndex(index: number): void;
    private getTabs;
    private getTabPanels;
    private getTabList;
    private tabsHaveTarget;
    private initializeTabs;
    render(): import("lit-html").TemplateResult<1>;
}
