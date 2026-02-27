import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './menu-item.scss';
import colorStyles from './menu-item-colors.scss';

export class MenuItem extends LitElement {
  @property({ type: Boolean, reflect: true }) disabled = false;

  @property({ type: String }) value = '';

  @property({ type: Boolean }) selected = false;

  @property({ type: String, reflect: true }) variant: 'standard' | 'vibrant' =
    'standard';

  static styles = [styles, colorStyles];

  connectedCallback() {
    // eslint-disable-next-line wc/guard-super-call
    super.connectedCallback();
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'menuitem');
    }
    if (!this.hasAttribute('tabindex') && !this.disabled) {
      this.setAttribute('tabindex', '0');
    }
  }

  // Handle keyboard activation (Enter/Space)
  private _handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.click();
    }
  }

  render() {
    return html`
      <div
        class=${classMap({
          'menu-item': true,
          disabled: this.disabled,
          selected: this.selected,
        })}
        @keydown="${this._handleKeyDown}"
      >
        <div class="background"></div>
        <base-ripple class="ripple"></base-ripple>

        <div class="menu-item-content">
          <slot name="leading-icon"></slot>
          <base-icon name="home"></base-icon>
          <div class="slot-container">
            <slot></slot>
          </div>
          <slot
            name="trailing-supporting-text"
            slot="trailing-supporting-text"
          ></slot>
        </div>
      </div>
    `;
  }
}
