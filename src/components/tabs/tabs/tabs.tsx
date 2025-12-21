import {
  Component,
  ComponentInterface,
  Element,
  h,
  Host,
  Listen,
  Prop,
} from '@stencil/core';
import { getComponentIndex } from '../../../utils/utils';
import { GoatTabCustomEvent } from '../../../components';

/**
 * @label Tabs
 * @name tabs
 * @description The tabs component is used to display multiple panels of content in a container.
 * @category Navigation
 * @tags navigation
 * @example <goat-tabs>
 *   <goat-tabs-list>
 *    <goat-tab selected >Tab 1</goat-tab>
 *    <goat-tab>Tab 2</goat-tab>
 *   </goat-tabs-list>
 * </goat-tabs>
 */
@Component({
  tag: 'goat-tabs',
  styleUrl: 'tabs.scss',
  shadow: true,
})
export class Tabs implements ComponentInterface {
  gid: string = getComponentIndex();
  @Element() elm!: HTMLElement;

  @Prop({ reflect: true }) layer?: 'background' | '01' | '02';

  @Prop({ reflect: true }) type: 'contained' | 'contained-bottom' | 'default' =
    'default';

  @Listen('goat-tab--click')
  tabClick(evt: GoatTabCustomEvent<any>) {
    evt.stopPropagation();
    if (evt.detail.target) {
      this.selectTab(evt.detail.target);
    }
  }

  selectTab(target) {
    const tabs = this.getTabs();
    for (let i = 0; i < tabs.length; i++) {
      const tab: any = tabs[i];
      tab.selected = false;
      tab.classList.remove('previous-tab', 'next-tab');
    }
    for (let i = 0; i < tabs.length; i++) {
      const tab: any = tabs[i];
      if (target === tab.target) {
        tab.selected = true;

        if (tabs[i - 1]) {
          // @ts-ignore
          tabs[i - 1].classList.add('previous-tab');
        }
        if (tabs[i + 1]) {
          // @ts-ignore
          tabs[i + 1].classList.add('next-tab');
        }
      }
    }
    const tabPanels = this.getTabPanels();
    for (let i = 0; i < tabPanels.length; i++) {
      const tabPanel: any = tabPanels[i];
      tabPanel.active = target === tabPanel.value;
    }
  }

  getTabs() {
    return this.elm.querySelectorAll(':scope > goat-tabs-list goat-tab');
  }

  getTabList() {
    return this.elm.querySelector(':scope > goat-tabs-list');
  }

  getTabPanels() {
    return this.elm.querySelectorAll(':scope > goat-tab-panel');
  }

  tabsHaveTarget() {
    return this.elm.querySelector(':scope > goat-tabs-list goat-tab[target]');
  }

  componentDidLoad() {
    if (!this.tabsHaveTarget()) {
      const tabs = this.getTabs();
      tabs.forEach((tab: HTMLGoatTabElement, index) => {
        tab.setAttribute('target', `tab-${this.gid}-${index}`);
        tab.type = this.type;
      });
      tabs[0].classList.add('first-tab');
      tabs[tabs.length - 1].classList.add('last-tab');

      const tabList: any = this.getTabList();
      tabList.type = this.type;
      this.getTabPanels().forEach((tab, index) => {
        tab.setAttribute('value', `tab-${this.gid}-${index}`);
      });
      if (tabs.length) this.selectTab(`tab-${this.gid}-0`);
    } else {
      const selectedTab = this.elm.querySelector('goat-tab[selected]');
      if (selectedTab) this.selectTab(selectedTab['target']);
    }
  }

  render() {
    return (
      <Host>
        <slot />
      </Host>
    );
  }
}
