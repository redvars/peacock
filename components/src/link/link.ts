import { html, LitElement, nothing } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import NativeHyperlinkMixin from '@/__internal/mixins/NativeHyperlinkMixin.js';
import styles from './link.scss';
import IndividualComponent from '@/IndividualComponent.js';

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
@IndividualComponent
export class Link extends NativeHyperlinkMixin(LitElement) {
  static styles = [styles];

  render() {
    return html`<a
      class=${classMap({
        link: true,
      })}
      href=${this.href}
      download=${this.download || nothing}
      target=${this.target}
      rel=${this.rel || nothing}
    >
      <slot></slot>
    </a>`;
  }
}
