import { html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './menu-item.scss';
import colorStyles from './menu-item-colors.scss';

/**
 * @label Menu Item
 * @tag wc-menu-item
 * @rawTag menu-item
 * @summary An item in a menu list.
 * @tags navigation
 *
 * @example
 * ```html
 * <wc-menu-item>Menu Item</wc-menu-item>
 * ```
 */
export class MenuItem extends LitElement {
  @property({ type: Boolean, reflect: true }) disabled = false;

  @property({ type: String }) value = '';

  @property({ type: Boolean }) selected = false;

  /*
   * Hyperlink to navigate to on click.
   */
  @property({ reflect: true }) href?: string;

   /**
   * Sets or retrieves the window or frame at which to target content.
   */
  @property() target: string = '_self';


  @property({ type: String, reflect: true }) variant: 'standard' | 'vibrant' =
    'standard';

  static styles = [styles, colorStyles];

  connectedCallback() {
    // eslint-disable-next-line wc/guard-super-call
    super.connectedCallback();
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'menuitem');
    }
  }

  // Handle keyboard activation (Enter/Space)
  private _handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.click();
    }
  }

   __isLink() {
    return !!this.href;
  }

   @query('.menu-item') private readonly menuItemElement!: HTMLElement | null;
  
    override focus() {
      this.menuItemElement?.focus();
    }
  
    override blur() {
      this.menuItemElement?.blur();
    }

  render() {

    const isLink = this.__isLink();

    const cssClasses = {
          'menu-item': true,
          disabled: this.disabled,
          selected: this.selected,
        };

    if (isLink) {
      return html`<a
        class=${classMap(cssClasses)}
        href=${this.href}
        target=${this.target}
      >
        ${this.renderContent()}
      </a>
    `;
    }


    return html`<div
        class=${classMap(cssClasses)}
        tabindex=${!this.disabled ? 0 : -1}
        @keydown="${this._handleKeyDown}"
      >
        ${this.renderContent()}
      </div>
    `;
  }

  renderContent() {
    return html`
      <focus-ring class="focus-ring" .control=${this}  element="menuItemElement"></focus-ring>
      <div class="background"></div>
      <base-ripple class="ripple"></base-ripple>

      <div class="menu-item-content">
        <slot name="leading-icon"></slot>
        <div class="slot-container">
          <slot></slot>
        </div>
        <slot
          name="trailing-supporting-text"
        ></slot>
      </div>
    `;
  }
}
