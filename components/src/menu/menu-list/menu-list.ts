import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './menu-list.scss';

export class MenuList extends LitElement {
  static styles = [styles];

  @property({ type: String, reflect: true }) variant: 'standard' | 'vibrant' =
    'standard';

  connectedCallback() {
    // eslint-disable-next-line wc/guard-super-call
    super.connectedCallback();
    this.setAttribute('role', 'menu');
  }

  render() {
    return html`<div
      class=${classMap({
        'menu-list': true,
        [`variant-${this.variant}`]: true,
      })}
    >
      <div class="background"></div>
      <base-elevation class="elevation"></base-elevation>

      <div class="menu-list-content">
        <slot></slot>
      </div>
    </div>`;
  }
}
