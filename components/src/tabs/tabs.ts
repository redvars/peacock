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

  @property({ type: Boolean }) managed = false;

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this.__handleTabClick);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.__handleTabClick);
    super.disconnectedCallback();
  }

  private __handleTabClick = (event: Event) => {
    if (this.managed) return;

    const detailEvent = event as CustomEvent;
    const path = detailEvent.composedPath();
    const clickedTab: Tab | undefined = path.find(
      node => node instanceof Element && (node as Element).tagName.toLowerCase() === 'wc-tab',
    ) as Tab | undefined;

    if (!clickedTab) return;

    const tabs: NodeListOf<Tab> = this.querySelectorAll('wc-tab');
    tabs.forEach(tab => {
      tab.active = false;
    });
    (clickedTab as Tab).active = true;
  };

  render() {
    return html`
      <div class="tabs">
        <slot></slot>
      </div>
    `;
  }
}
