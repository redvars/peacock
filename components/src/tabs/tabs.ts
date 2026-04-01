import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './tabs.scss';
import { Tab } from './tab.js';

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
export class Tabs extends LitElement {
  static styles = [styles];

  static Tab = Tab;

  @property({ reflect: true }) 
  variant: 'primary' | 'secondary' | 'contained' | 'filled' = 'primary';

  @property({ type: Boolean }) managed = false;

  private __mutationObserver?: MutationObserver;

  private __lastActiveTab?: Tab;

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

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('variant')) {
      this.__lastActiveTab = this.__getActiveTab();
    }
  }

  disconnectedCallback() {
    this.__mutationObserver?.disconnect();

    this.removeEventListener('click', this.__handleTabClick);
    super.disconnectedCallback();
  }

  private __getTabs() {
    return Array.from(this.querySelectorAll('wc-tab')) as Tab[];
  }

  private __getActiveTab() {
    return this.__getTabs().find(tab => tab.active && !tab.disabled);
  }

  private static __getTabIndicator(tab?: Tab) {
    if (!tab?.shadowRoot) return undefined;
    return tab.shadowRoot.querySelector('.indicator') as HTMLElement | null;
  }

  private static __getTabBackground(tab?: Tab) {
    if (!tab?.shadowRoot) return undefined;
    return tab.shadowRoot.querySelector('.background') as HTMLElement | null;
  }

  private __getAnimationElements(previousTab?: Tab, nextTab?: Tab) {
    if (this.variant === 'primary' || this.variant === 'secondary') {
      return {
        previous: Tabs.__getTabIndicator(previousTab),
        next: Tabs.__getTabIndicator(nextTab),
      };
    }

    if (this.variant === 'filled' || this.variant === 'contained') {
      return {
        previous: Tabs.__getTabBackground(previousTab),
        next: Tabs.__getTabBackground(nextTab),
      };
    }

    return {
      previous: undefined,
      next: undefined,
    };
  }

  private __animateIndicatorTransition(previousTab?: Tab, nextTab?: Tab) {
    if (!previousTab || !nextTab || previousTab === nextTab) return;

    const { previous: previousAnimationElement, next: nextAnimationElement } =
      this.__getAnimationElements(previousTab, nextTab);
    if (!previousAnimationElement || !nextAnimationElement) return;

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

  private __syncIndicatorsFromActiveState() {
    const activeTab = this.__getActiveTab();
    if (this.__lastActiveTab && activeTab && this.__lastActiveTab !== activeTab) {
      this.__animateIndicatorTransition(this.__lastActiveTab, activeTab);
    }

    this.__lastActiveTab = activeTab;
  }

  private __handleTabClick = (event: Event) => {
    if (this.managed) return;

    const detailEvent = event as CustomEvent;
    const path = detailEvent.composedPath();
    const clickedTab: Tab | undefined = path.find(
      node => node instanceof Element && (node as Element).tagName.toLowerCase() === 'wc-tab',
    ) as Tab | undefined;

    if (!clickedTab) return;

    const previousActiveTab = this.__getActiveTab();
    const tabs = this.__getTabs();
    let clickedIndex = -1;
    for (let index = 0; index < tabs.length; index += 1) {
      const tab = tabs[index];
      tab.active = false;
      if (tab === clickedTab) clickedIndex = index;
    }
    (clickedTab as Tab).active = true;
    this.__animateIndicatorTransition(previousActiveTab, clickedTab);
    this.__lastActiveTab = clickedTab;

    this.dispatchEvent(new CustomEvent('tab-click', {
      bubbles: true,
      composed: true,
      detail: {
        index: clickedIndex,
        value: (clickedTab as Tab).value,
      },
    }));
  };

  render() {
    return html`
      <div class="tabs">
        <slot></slot>
      </div>
    `;
  }
}
