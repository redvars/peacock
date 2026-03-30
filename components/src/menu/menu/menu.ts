import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './menu.scss';
import { MenuItem } from '../menu-item/menu-item.js';

/**
 * @label Menu
 * @tag wc-menu
 * @rawTag menu
 * @summary A list of menu items.
 * @tags navigation
 *
 * @example
 * ```html
 * <wc-menu>
 *   <wc-menu-item>Item 1</wc-menu-item>
 *   <wc-menu-item>Item 2</wc-menu-item>
 * </wc-menu>
 * ```
 */
export class Menu extends LitElement {
  static styles = [styles];

  static Item = MenuItem;

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
      <wc-elevation class="elevation"></wc-elevation>

      <div class="menu-list-content">
        <slot></slot>
      </div>
    </div>`;
  }
}
