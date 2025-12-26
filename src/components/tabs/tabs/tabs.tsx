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
import { PcTabCustomEvent } from '../../../components';

/**
 * @label Tabs
 * @name tabs
 * @description The tabs component is used to display multiple panels of content in a container.
 * @category Navigation
 * @tags navigation
 * @example <pc-tabs>
 *   <pc-tabs-list>
 *    <pc-tab selected >Tab 1</pc-tab>
 *    <pc-tab>Tab 2</pc-tab>
 *   </pc-tabs-list>
 * </pc-tabs>
 */
@Component({
  tag: 'pc-tabs',
  styleUrl: 'tabs.scss',
  shadow: true,
})
export class Tabs implements ComponentInterface {
  gid: string = getComponentIndex();
  @Element() elm!: HTMLElement;

  @Prop({ reflect: true }) layer?: 'background' | '01' | '02';

  @Prop({ reflect: true }) type: 'contained' | 'contained-bottom' | 'default' =
    'default';

  @Listen('pc-tab--click')
  tabClick(evt: PcTabCustomEvent<any>) {
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
    return this.elm.querySelectorAll(':scope > pc-tabs-list pc-tab');
  }

  getTabList() {
    return this.elm.querySelector(':scope > pc-tabs-list');
  }

  getTabPanels() {
    return this.elm.querySelectorAll(':scope > pc-tab-panel');
  }

  tabsHaveTarget() {
    return this.elm.querySelector(':scope > pc-tabs-list pc-tab[target]');
  }

  componentDidLoad() {
    if (!this.tabsHaveTarget()) {
      const tabs = this.getTabs();
      tabs.forEach((tab: HTMLPcTabElement, index) => {
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
      const selectedTab = this.elm.querySelector('pc-tab[selected]');
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
