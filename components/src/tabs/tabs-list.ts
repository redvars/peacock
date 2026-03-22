import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './tabs-list.scss';

export class TabsList extends LitElement {
  static styles = [styles];

  @property({ type: Boolean }) managed = false;

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('base-tab-click', this.handleTabClick as EventListener);
  }

  disconnectedCallback() {
    this.removeEventListener('base-tab-click', this.handleTabClick as EventListener);
    super.disconnectedCallback();
  }

  private handleTabClick = (event: Event) => {
    if (this.managed) return;

    const detailEvent = event as CustomEvent;
    const path = detailEvent.composedPath();
    const clickedTab = path.find(
      node => node instanceof Element && (node as Element).tagName.toLowerCase() === 'base-tab',
    ) as HTMLElement | undefined;

    if (!clickedTab) return;

    const tabs = this.querySelectorAll('base-tab');
    tabs.forEach(tab => {
      (tab as any).selected = false;
    });
    (clickedTab as any).selected = true;
  };

  render() {
    return html`
      <div class="tabs-list">
        <slot></slot>
      </div>
    `;
  }
}
