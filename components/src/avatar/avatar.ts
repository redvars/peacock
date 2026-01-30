import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styles } from './avatar.css.js';

/**
 * @label Avatar
 * @tag p-avatar
 * @rawTag avatar
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
 * <p-avatar name="Shivaji Varma" src="https://peacock.redvars.com/assets/img/avatar.webp"></p-avatar>
 * ```
 *
 * @tags display
 */
export class Avatar extends LitElement {
  static styles = [styles];

  @property({ type: String, reflect: true }) name: string = '';

  @property({ type: String, reflect: true }) src?: string;

  render() {
    return html`<div class="avatar-container">
      <div
        class=${classMap({
          avatar: true,
          initials: !this.src,
          image: !!this.src,
        })}
      >
        ${this.src
          ? html`<img class="image" src=${this.src} alt=${this.name} />`
          : html`<div class="initials">${this.__getInitials()}</div>`}
      </div>
    </div>`;
  }

  private __getInitials() {
    const [first = '', last = ''] = this.name.split(' ');
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  }
}
