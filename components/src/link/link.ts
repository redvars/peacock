import { html, LitElement, nothing } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import NativeHyperlinkMixin from '@/__internal/mixins/NativeHyperlinkMixin.js';
import styles from './link.scss';
import IndividualComponent from '@/IndividualComponent.js';

/**
 * @label Link
 * @tag wc-link
 * @rawTag link
 * @summary A text link to another page, or to a section of the current one.
 *
 * @overview
 * <p>Renders a native <code>&lt;a&gt;</code> around its content, so it behaves and is announced
 * like any link. Set <code>href</code>, and <code>target</code>, <code>rel</code> and
 * <code>download</code> as on a native anchor. Its color is set with <code>--link-color</code>.</p>
 * <p>Use a link to go somewhere. For an action that does something on the page use
 * <code>wc-button</code>, and for a link styled as a button use <code>wc-link-button</code>.</p>
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
