import { html, LitElement } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import BaseHyperlink from '../__base_element/BaseHyperlink.js';
import styles from './link.scss';

/**
 * @label Link
 * @tag wc-link
 * @rawTag link
 * @summary The link component is used to navigate to a new page or section within the current page.
 * @cssprop --link-color - Controls the color of the link.
 * @tags navigation
 *
 * @example
 * ```html
 * <wc-link href="#">Link</wc-link>
 * ```
 */
export class Link extends BaseHyperlink(LitElement) {
  static styles = [styles];

  render() {
    return html`<a
      class=${classMap({
        link: true,
      })}
      href=${this.href}
      target=${this.target}
      ?tabindex=${this.parentElement?.tabIndex}
    >
      <slot></slot>
    </a>`;
  }
}
