import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './container.scss';

type ContainerSize = 'max' | 'xl' | 'lg' | 'md' | 'sm' | 'full';

/**
 * @label Container
 * @tag base-container
 * @rawTag container
 * @summary The Avatar component is used to represent user, and displays the profile picture, initials or fallback icon.
 *
 * @cssprop --avatar-border-radius - Controls the border radius of the avatar.
 * @cssprop --avatar-background-color - Controls the color of the avatar.
 * @cssprop --avatar-size - Controls the size of the avatar.
 * @cssprop --avatar-text-color - Controls the color of the text inside the avatar.
 *
 *
 * @example
 * ```html
 * <base-container>Container</base-avatar>
 * ```
 *
 * @tags display
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