import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './tabs.scss';
import { Tab } from './tab.js';
import IndividualComponent from '@/IndividualComponent.js';
import { RovingFocusController } from '@/__internal/controllers/roving-focus-controller.js';
import { isLink } from '@/__internal/utils/is-link.js';

/** Detail of the `change` event. */
export interface TabsChangeDetail {
  index: number;
  value?: string;
}

/**
 * @label Tabs
 * @tag wc-tabs
 * @rawTag tabs
 *
 * @summary The row of tabs, which the person moves between by clicking or with the arrow keys.
 * @overview
 * <p>Tabs holds the tab buttons and manages their layout. It follows the WAI-ARIA tabs pattern:
 * the host has <code>role="tablist"</code> (give it an <code>aria-label</code>), only the selected
 * tab is a tab stop, and the Left and Right arrow keys (mirrored in right-to-left layouts), Home
 * and End move between tabs. Moving to a tab selects it, so its panel shows at once. Disabled
 * tabs are skipped.</p>
 * <p>With <code>managed</code>, the tabs do not change the selection themselves: they fire
 * <code>change</code> and the consumer sets <code>selected</code> on the chosen tab.</p>
 * <p>When every tab is a link (<code>href</code>), the tabs are navigation rather than a tablist:
 * the host gets no tablist role, so wrap it in a <code>&lt;nav&gt;</code>.</p>
 *
 * @fires {CustomEvent<{index: number, value: string | undefined}>} change - Dispatched when the user selects a tab, by click or with the arrow keys.
 *
 * @example
 * ```html
 * <wc-tabs aria-label="Sections">
 *   <wc-tab selected>Tab 1</wc-tab>
 *   <wc-tab>Tab 2</wc-tab>
 * </wc-tabs>
 * ```
 * @tags navigation
 */
@IndividualComponent
export class Tabs extends LitElement {
  // ── Static

  static styles = [styles];

  static Tab = Tab;

  // ── Properties

  /** The visual style of the tabs: `"primary"` (default), `"secondary"`, `"contained"` or `"filled"`. */
  @property({ reflect: true })
  variant: 'primary' | 'secondary' | 'contained' | 'filled' = 'primary';

  /** The consumer controls the selection: the tabs fire `change` but do not select a tab. */
  @property({ type: Boolean }) managed = false;

  // ── Private fields

  /** One tab stop, on the selected tab; the arrow keys move it and select the tab they reach. */
  private readonly roving = new RovingFocusController(this, {
    items: () => this.__getTabs(),
    orientation: () => 'horizontal',
    initialItem: items => items.find(tab => (tab as Tab).selected) ?? items[0],
    onMove: item => this.__selectFromUser(item as Tab),
  });

  private __mutationObserver?: MutationObserver;

  private __lastActiveTab?: Tab;

  /** Set while a click is handled, so a click on a link tab still selects it. */
  private __clicking = false;

  // ── Lifecycle

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this.__handleTabClick);
    this.__syncRole();
  }

  firstUpdated() {
    this.__mutationObserver = new MutationObserver(() => {
      this.__syncIndicatorsFromActiveState();
      this.__syncRole();
    });

    this.__mutationObserver.observe(this, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['selected', 'disabled', 'href'],
    });

    this.__lastActiveTab = this.__getActiveTab();
    this.__syncRole();
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

  // ── Private

  private __getTabs() {
    return Array.from(this.querySelectorAll('wc-tab')) as Tab[];
  }

  private __getActiveTab() {
    return this.__getTabs().find(tab => tab.selected && !tab.disabled);
  }

  /** A tablist, unless every tab is a link: then the tabs are navigation. */
  private __syncRole() {
    const tabs = this.__getTabs();
    const navigation = tabs.length > 0 && tabs.every(tab => isLink(tab));
    if (navigation) {
      if (this.getAttribute('role') === 'tablist') this.removeAttribute('role');
    } else if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'tablist');
    }
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
    if (
      this.__lastActiveTab &&
      activeTab &&
      this.__lastActiveTab !== activeTab
    ) {
      this.__animateIndicatorTransition(this.__lastActiveTab, activeTab);
    }

    this.__lastActiveTab = activeTab;
    // The tab stop follows the selection, also when it is set from outside.
    if (activeTab && this.roving.activeItem !== activeTab) {
      this.roving.setActive(activeTab, false);
    }
  }

  /** Selects `tab` (unless managed) and tells the consumer, after a click or an arrow key. */
  private __selectFromUser(tab: Tab) {
    if (tab.disabled) return;
    // Arrowing onto a link only moves focus; following it is the person's choice.
    if (isLink(tab) && !this.__clicking) return;

    const tabs = this.__getTabs();
    if (!this.managed) {
      const previousActiveTab = this.__getActiveTab();
      for (const other of tabs) other.selected = other === tab;
      this.__animateIndicatorTransition(previousActiveTab, tab);
      this.__lastActiveTab = tab;
    }

    const detail: TabsChangeDetail = {
      index: tabs.indexOf(tab),
      value: tab.value,
    };
    this.dispatchEvent(
      new CustomEvent('change', { bubbles: true, composed: true, detail }),
    );
  }

  private __handleTabClick = (event: Event) => {
    const clickedTab = event
      .composedPath()
      .find(node => node instanceof Element && node.localName === 'wc-tab') as
      | Tab
      | undefined;
    if (!clickedTab || !this.__getTabs().includes(clickedTab)) return;

    this.__clicking = true;
    try {
      this.__selectFromUser(clickedTab);
    } finally {
      this.__clicking = false;
    }
  };

  private __handleSlotChange = () => {
    this.roving.sync();
    this.__syncRole();
  };

  // ── Render

  render() {
    return html`
      <div
        class="tabs"
        @keydown=${this.roving.handleKeyDown}
        @focusin=${this.roving.handleFocusIn}
      >
        <slot @slotchange=${this.__handleSlotChange}></slot>
      </div>
    `;
  }
}
