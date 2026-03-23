import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './container.scss';

type ContainerSize = 'max' | 'xl' | 'lg' | 'md' | 'sm' | 'full';

/**
 * @label Container
 * @tag wc-container
 * @rawTag container
 * @summary A responsive container component for layout.
 * @cssprop --container-max-width - Controls the maximum width of the container.
 * @cssprop --container-padding - Controls the padding of the container.
 * @tags layout
 *
 * @example
 * ```html
 * <wc-container size="lg">Content</wc-container>
 * ```
 */
export class Container extends LitElement {
  @property({ type: String, reflect: true })
  size: ContainerSize = 'full';

  static styles = [styles];

  render() {
    const wrapperClasses = {
      'container-wrapper': true,
      [`size-${this.size}`]: true,
    };

    return html`
      <div class=${classMap(wrapperClasses)}>
        <div class="container">
          <div class="content">
            <slot></slot>
          </div>
        </div>
      </div>
    `;
  }
}