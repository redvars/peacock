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

  private uid = crypto.randomUUID();

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('tab-click', this.onTabClick as EventListener);
  }

  disconnectedCallback() {
    this.removeEventListener('tab-click', this.onTabClick as EventListener);
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
    }
  };

  selectTab(target: string) {
    const tabs = this.getTabs();
    tabs.forEach((tab: HTMLElement) => {
      (tab as any).selected = false;
      tab.classList.remove('previous-tab', 'next-tab');
    });

    let selectedIndex = -1;
    tabs.forEach((tab: HTMLElement, index: number) => {
      const t = tab.getAttribute('target') || tab.getAttribute('value');
      if (t === target) {
        selectedIndex = index;
      }
    });

    if (selectedIndex >= 0) {
      const selectedTab = tabs[selectedIndex];
      (selectedTab as any).selected = true;
      if (tabs[selectedIndex - 1]) {
        tabs[selectedIndex - 1].classList.add('previous-tab');
      }
      if (tabs[selectedIndex + 1]) {
        tabs[selectedIndex + 1].classList.add('next-tab');
      }
    }

    const panels = this.getTabPanels();
    panels.forEach(panel => {
      const panelValue = panel.getAttribute('value');
      (panel as any).active = panelValue === target;
    });
  }

  private getTabs(): NodeListOf<HTMLElement> {
    return this.querySelectorAll(':scope > tabs-list wc-tab');
  }

  private getTabPanels(): NodeListOf<HTMLElement> {
    return this.querySelectorAll(':scope > wc-tab-panel');
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
     
      this.getTabPanels().forEach((panel, index) => {
        if (!panel.getAttribute('value')) {
          panel.setAttribute('value', `tab-${this.uid}-${index}`);
        }
      });

      if (tabs.length > 0) {
        const firstTarget = tabs[0].getAttribute('target');
        if (firstTarget) {
          this.selectTab(firstTarget);
        }
      }
    } else {
      const selectedTab = this.querySelector(':scope > tabs-list wc-tab[selected]') as HTMLElement;
      if (selectedTab) {
        const selectedTarget = selectedTab.getAttribute('target');
        if (selectedTarget) this.selectTab(selectedTarget);
      }
    }
  }

  render() {
    return html`<slot></slot>`;
  }
}
