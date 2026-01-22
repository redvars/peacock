import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styles } from './avatar.css.js';

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
