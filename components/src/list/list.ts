import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './list.scss';
import { ListItem } from './list-item.js';

/**
 * @label List
 * @tag wc-list
 * @rawTag list
 *
 * @summary A Material 3 list container for one or more list items.
 *
 * @example
 * ```html
 * <wc-list>
 *   <wc-list-item>
 *     <wc-icon slot="leading" name="inbox"></wc-icon>
 *     Inbox
 *     <span slot="trailing">24</span>
 *   </wc-list-item>
 * </wc-list>
 * ```
 * @tags display
 */
export class List extends LitElement {
  static styles = [styles];

  static Item = ListItem;

  @property({ type: String, reflect: true }) variant: 'standard' | 'vibrant' =
    'standard';

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'list');
  }

  render() {
    const cssClasses = {
      list: true,
      [`variant-${this.variant}`]: true,
    };

    return html`
      <div class=${classMap(cssClasses)}>
        <slot></slot>
      </div>
    `;
  }
}

