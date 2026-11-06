import { html, LitElement } from 'lit';
import styles from './tab-group.scss';
import { Tabs, type TabsChangeDetail } from './tabs.js';
import { TabPanel } from './tab-panel.js';
import type { Tab } from './tab.js';
import IndividualComponent from '@/IndividualComponent.js';
import { deprecate } from '@/__internal/utils/deprecate.js';

/**
 * The key that links a tab to its panel: the tab's `value`. A tab without `value` and without
 * `href` may still use `target` (deprecated); a link tab's `target` is a link target, never a key.
 */
function tabKey(tab: HTMLElement): string | null {
  const value = tab.getAttribute('value') ?? (tab as Tab).value;
  if (value) return value;
  const target = tab.getAttribute('target');
  if (target && !tab.hasAttribute('href')) {
    deprecate(
      'wc-tab-group',
      "linking panels by the tab's `target`",
      '`value` on wc-tab',
    );
    return target;
  }
  return null;
}

/** Gives `element` an id if it has none, so ARIA attributes can point at it. */
function ensureId(element: HTMLElement, prefix: string): string {
  if (!element.id) {
    // eslint-disable-next-line no-param-reassign
    element.id = `${prefix}-${crypto.randomUUID()}`;
  }
  return element.id;
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
@IndividualComponent
export class TabGroup extends LitElement {
  // ── Static

  static styles = [styles];

  static Tabs = Tabs;

  static TabPanel = TabPanel;

  // ── Private fields

  /** Re-wires when tabs or panels are added or removed, including tabs inside `wc-tabs`. */
  private readonly __observer = new MutationObserver(records => {
    const relevant = records.some(
      record =>
        record.target === this ||
        (record.target instanceof Element &&
          record.target.localName === 'wc-tabs'),
    );
    if (relevant) this.__sync();
  });

  // ── Lifecycle

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('change', this.__handleChange);
    this.__observer.observe(this, { childList: true, subtree: true });
  }

  disconnectedCallback() {
    this.removeEventListener('change', this.__handleChange);
    this.__observer.disconnect();
    super.disconnectedCallback();
  }

  firstUpdated() {
    this.__sync();
  }

  // ── Public

  /** Selects the tab whose key (`value`) is `target`, and shows its panel. */
  selectTab(target: string) {
    const index = this.getTabs().findIndex(tab => tabKey(tab) === target);
    this.__select(index, target);
  }

  /** Selects the tab at `index`, and shows the panel at the same position. */
  selectTabByIndex(index: number) {
    this.__select(index, null);
  }

  // ── Private

  private getTabs(): Tab[] {
    return Array.from(this.querySelectorAll<Tab>(':scope > wc-tabs wc-tab'));
  }

  private getTabPanels(): TabPanel[] {
    return Array.from(this.querySelectorAll<TabPanel>(':scope > wc-tab-panel'));
  }

  private getTabList(): Tabs | null {
    return this.querySelector<Tabs>(':scope > wc-tabs');
  }

  private tabsHaveKey(): boolean {
    return this.getTabs().some(tab => tabKey(tab) !== null);
  }

  /** The panel for the tab at `index`: by key when tabs have keys, else by position. */
  private __panelFor(tab: Tab, index: number, keyed: boolean) {
    const panels = this.getTabPanels();
    if (!keyed) return panels[index] ?? null;
    const key = tabKey(tab);
    return key === null
      ? null
      : (panels.find(panel => panel.getAttribute('value') === key) ?? null);
  }

  private __select(index: number, key: string | null) {
    const tabs = this.getTabs();
    const keyed = key !== null;
    tabs.forEach((tab, i) => {
      /* eslint-disable no-param-reassign */
      tab.selected = i === index;
      /* eslint-enable no-param-reassign */
      tab.classList.toggle('previous-tab', index >= 0 && i === index - 1);
      tab.classList.toggle('next-tab', index >= 0 && i === index + 1);
    });

    this.getTabPanels().forEach((panel, i) => {
      // eslint-disable-next-line no-param-reassign
      panel.active = keyed ? panel.getAttribute('value') === key : i === index;
    });
  }

  /** Links each tab and its panel, and makes sure one tab is selected. */
  private __sync() {
    const tabs = this.getTabs();
    const keyed = this.tabsHaveKey();

    tabs.forEach((tab, index) => {
      const panel = this.__panelFor(tab, index, keyed);
      // eslint-disable-next-line no-param-reassign
      tab.panel = panel;
      if (panel) {
        panel.setAttribute('aria-labelledby', ensureId(tab, 'wc-tab'));
        ensureId(panel, 'wc-tab-panel');
      }
    });

    const selected = tabs.findIndex(
      tab => tab.selected || tab.hasAttribute('active'),
    );
    const index = selected >= 0 ? selected : 0;
    if (tabs.length === 0) return;
    if (keyed) {
      const key = tabKey(tabs[index]);
      if (key !== null) this.__select(index, key);
    } else {
      this.__select(index, null);
    }
  }

  private __handleChange = (event: Event) => {
    // Only the group's own tab list; a `change` from a field inside a panel is not a tab change.
    const tabList = this.getTabList();
    if (!tabList || event.target !== tabList || tabList.managed) return;
    const { detail } = event as CustomEvent<TabsChangeDetail>;
    const tab = this.getTabs()[detail.index];
    const key = tab ? tabKey(tab) : null;
    if (key !== null && this.tabsHaveKey()) this.selectTab(key);
    else this.selectTabByIndex(detail.index);
  };

  // ── Render

  render() {
    return html`<slot @slotchange=${() => this.__sync()}></slot>`;
  }
}
