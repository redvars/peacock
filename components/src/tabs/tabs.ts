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
 *   <wc-tab>Tab 1</wc-tab>
 *   <wc-tab>Tab 2</wc-tab>
 * </wc-tabs>
 * ```
 * @tags navigation
 */
export class Tabs extends LitElement {
  static styles = [styles];

  static Tab = Tab;

  @property({ reflect: true }) 
  variant: 'primary' | 'secondary' | 'contained' | 'pill' = 'primary';

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

  private __animateIndicatorTransition(previousTab?: Tab, nextTab?: Tab) {
    if (!(this.variant === 'primary' || this.variant === 'secondary')) return;
    if (!previousTab || !nextTab || previousTab === nextTab) return;

    const previousIndicator = Tabs.__getTabIndicator(previousTab);
    const nextIndicator = Tabs.__getTabIndicator(nextTab);
    if (!previousIndicator || !nextIndicator) return;

    const previousRect = previousTab.getBoundingClientRect();
    const nextRect = nextTab.getBoundingClientRect();

    const incomingOffset = previousRect.left - nextRect.left;
    const outgoingOffset = nextRect.left - previousRect.left;
    const incomingScale = previousRect.width / nextRect.width;
    const outgoingScale = nextRect.width / previousRect.width;

    nextIndicator.style.transition = 'none';
    nextIndicator.style.opacity = '0';
    nextIndicator.style.transform = `translateX(${incomingOffset}px) scaleX(${incomingScale})`;

    previousIndicator.style.transition = 'none';
    previousIndicator.style.opacity = '1';
    previousIndicator.style.transform = 'translateX(0) scaleX(1)';

    requestAnimationFrame(() => {
      nextIndicator.style.transition = '';
      previousIndicator.style.transition = '';

      nextIndicator.style.opacity = '1';
      nextIndicator.style.transform = 'translateX(0) scaleX(1)';

      previousIndicator.style.opacity = '0';
      previousIndicator.style.transform = `translateX(${outgoingOffset}px) scaleX(${outgoingScale})`;
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
