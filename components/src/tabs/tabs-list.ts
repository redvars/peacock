import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './tabs-list.scss';
import { Tab } from './tab.js';

export class TabsList extends LitElement {
  static styles = [styles];

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
      node => node instanceof Element && (node as Element).tagName.toLowerCase() === 'base-tab',
    ) as Tab | undefined;

    if (!clickedTab) return;

    const tabs: NodeListOf<Tab> = this.querySelectorAll('base-tab');
    tabs.forEach(tab => {
      tab.active = false;
    });
    (clickedTab as Tab).active = true;
  };

  render() {
    return html`
      <div class="tabs-list">
        <slot></slot>
      </div>
    `;
  }
}
