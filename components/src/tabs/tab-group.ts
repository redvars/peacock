import { html, LitElement } from 'lit';
import styles from './tab-group.scss';
import { Tabs } from './tabs.js';
import { TabPanel } from './tab-panel.js';
import IndividualComponent from '@/IndividualComponent.js';
import { deprecate } from '@/__internal/utils/deprecate.js';

/**
 * The key that links a tab to its panel: the tab's `value`. A tab without `value` and without
 * `href` may still use `target` (deprecated); a link tab's `target` is a link target, never a key.
 */
function tabKey(tab: HTMLElement): string | null {
  const value = tab.getAttribute('value');
  if (value) return value;
  const target = tab.getAttribute('target');
  if (target && !tab.hasAttribute('href')) {
    deprecate('wc-tab-group', 'linking panels by the tab\'s `target`', '`value` on wc-tab');
    return target;
  }
  return null;
}

/**
 * @label Tab Group
 * @tag wc-tab-group
 * @rawTag tab-group
 *
 * @summary The tab group component is used to display multiple panels of content in a container.
 * @overview
 * <p>The tab group component allows users to switch between different views or content sections.</p>
 * <p>Tabs and panels are matched by <code>value</code> (<code>&lt;wc-tab value="billing"&gt;</code> shows
 * <code>&lt;wc-tab-panel value="billing"&gt;</code>), or by position when no tab has a value.
 * Matching by the tab's <code>target</code> is deprecated and will be removed in 4.0; a link tab's
 * <code>target</code> is always a link target.</p>
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
@IndividualComponent
export class TabGroup extends LitElement {
  static styles = [styles];

  static Tabs = Tabs;

  static TabPanel = TabPanel;

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

  private onTabClick = (event: Event) => {
    const custom = event as CustomEvent;
    event.stopPropagation();
    const targetValue = custom.detail?.value;
    if (targetValue && this.tabsHaveKey()) {
      this.selectTab(targetValue);
    } else if (typeof custom.detail?.index === 'number') {
      this.selectTabByIndex(custom.detail.index);
    }
  };

  selectTab(target: string) {
    const tabs = this.getTabs();
    for (const tab of tabs) {
      (tab as any).active = false;
      (tab as any).selected = false;
      tab.classList.remove('previous-tab', 'next-tab');
    }

    let selectedIndex = -1;
    tabs.forEach((tab: HTMLElement, index: number) => {
      if (tabKey(tab) === target) {
        selectedIndex = index;
      }
    });

    if (selectedIndex >= 0) {
      const selectedTab = tabs[selectedIndex];
      (selectedTab as any).active = true;
      (selectedTab as any).selected = true;
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
      (panel as any).active = panelValue === target;
    }
  }

  selectTabByIndex(index: number) {
    const tabs = this.getTabs();
    for (const tab of tabs) {
      (tab as any).active = false;
      (tab as any).selected = false;
      tab.classList.remove('previous-tab', 'next-tab');
    }

    if (index >= 0 && index < tabs.length) {
      (tabs[index] as any).active = true;
      (tabs[index] as any).selected = true;
      if (tabs[index - 1]) tabs[index - 1].classList.add('previous-tab');
      if (tabs[index + 1]) tabs[index + 1].classList.add('next-tab');
    }

    const panels = this.getTabPanels();
    for (let i = 0; i < panels.length; i += 1) {
      const panel = panels[i];
      (panel as any).active = i === index;
    }
  }

  private getTabs(): HTMLElement[] {
    return Array.from(this.querySelectorAll(':scope > wc-tabs wc-tab'));
  }

  private getTabPanels(): HTMLElement[] {
    return Array.from(this.querySelectorAll(':scope > wc-tab-panel'));
  }

  private getTabList(): HTMLElement | null {
    return this.querySelector(':scope > wc-tabs');
  }

  private tabsHaveKey(): boolean {
    return this.getTabs().some(tab => tabKey(tab) !== null);
  }

  private initializeTabs() {
    const tabs = Array.from(this.getTabs());
    if (!this.tabsHaveKey()) {
      // No tab has a key: use index-based activation
      const selectedIndex = tabs.findIndex(
        tab =>
          tab.hasAttribute('active') ||
          (tab as any).active ||
          tab.hasAttribute('selected') ||
          (tab as any).selected,
      );
      this.selectTabByIndex(selectedIndex >= 0 ? selectedIndex : 0);
    } else {
      const selectedTab = tabs.find(
        tab =>
          tab.hasAttribute('active') ||
          (tab as any).active ||
          tab.hasAttribute('selected') ||
          (tab as any).selected,
      );
      if (selectedTab) {
        const selectedKey = tabKey(selectedTab);
        if (selectedKey) this.selectTab(selectedKey);
      } else if (tabs.length > 0) {
        const firstKey = tabKey(tabs[0]);
        if (firstKey) this.selectTab(firstKey);
      }
    }
  }

  render() {
    return html`<slot></slot>`;
  }
}
