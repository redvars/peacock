import { html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './link.scss';

/**
 * @label Link
 * @tag p-link
 * @rawTag link
 * @summary The link component is used to navigate to a new page or section within the current page.
 *
 * @cssprop --badge-color - Controls the color of the badge.
 *
 * @example
 * ```html
 * <p-link href="#">Link</p-link>
 * ```
 * @tags display
 */
export class Link extends LitElement {
  static styles = [styles];

  /**
   * Hyperlink to navigate to on click.
   */
  @property({ reflect: true }) href?: string;

  /**
   * Sets or retrieves the window or frame at which to target content.
   */
  @property() target: '_self' | '_parent' | '_blank' | '_top' | string =
    '_self';

  @state() tabIndexValue?: number;

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
