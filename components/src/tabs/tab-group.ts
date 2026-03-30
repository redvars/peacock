import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './tab-group.scss';
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
export class TabGroup extends LitElement {
  static styles = [styles];

  static Tabs = Tabs;

  static TabPanel = TabPanel;

  @property({ reflect: true }) 
  variant: 'line' | 'line-secondary' | 'contained' | 'pill' = 'line';

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
    const targetValue = custom.detail?.target || custom.detail?.value;
    if (targetValue) {
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
      const t = tab.getAttribute('target') || tab.getAttribute('value');
      if (t === target) {
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
    return Array.from(this.querySelectorAll(':scope > tabs-list wc-tab'));
  }

  private getTabPanels(): HTMLElement[] {
    return Array.from(this.querySelectorAll(':scope > wc-tab-panel'));
  }

  private getTabList(): HTMLElement | null {
    return this.querySelector(':scope > tabs-list');
  }

  private tabsHaveTarget(): boolean {
    return !!this.querySelector(':scope > tabs-list wc-tab[target]');
  }

  private initializeTabs() {
    const tabs = Array.from(this.getTabs());
    if (!this.tabsHaveTarget()) {
      // No target/value attributes — use index-based activation
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
        const selectedTarget = selectedTab.getAttribute('target');
        if (selectedTarget) this.selectTab(selectedTarget);
      } else if (tabs.length > 0) {
        const firstTarget = tabs[0].getAttribute('target');
        if (firstTarget) this.selectTab(firstTarget);
      }
    }
  }

  render() {
    return html`<slot></slot>`;
  }
}
