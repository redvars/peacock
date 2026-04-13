import { html, LitElement, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './menu-item.scss';
import colorStyles from './menu-item-colors.scss';
import BaseButtonMixin from '@/__mixins/BaseButtonMixin.js';
import BaseHyperlinkMixin from '@/__mixins/BaseHyperlinkMixin.js';
import { dispatchActivationClick, isActivationClick } from '@/__utils/dispatch-event-utils.js';

/**
 * @label Menu Item
 * @tag wc-menu-item
 * @rawTag menu-item
 * @parentRawTag menu
 * @summary An item in a menu list.
 * @tags navigation
 *
 * @example
 * ```html
 * <wc-menu-item>Menu Item</wc-menu-item>
 * ```
 */
export class MenuItem extends BaseButtonMixin(BaseHyperlinkMixin(LitElement)) {
  
  @property({ type: String }) value = '';

  @property({ type: Boolean, reflect: true }) selected = false;

  @property({ type: Boolean, attribute: 'keep-open' }) keepOpen = false;

  @property({ type: Boolean, attribute: 'has-submenu' }) hasSubmenu = false;

  @property({ type: Boolean, attribute: 'submenu-open' }) submenuOpen = false;

  @property({ type: String, reflect: true }) variant: 'standard' | 'vibrant' =
    'standard';

  static styles = [styles, colorStyles];

  @query('#item') readonly itemElement!: HTMLElement | null;

  /**
     * States
     */
    @state()
    isPressed = false;

  connectedCallback() {
    // eslint-disable-next-line wc/guard-super-call
    super.connectedCallback();
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'menuitem');
    }

    this.addEventListener('click', this.__dispatchClickWithThrottle);
    window.addEventListener('mouseup', this.__handlePress);
  }

  disconnectedCallback() {
    window.removeEventListener('mouseup', this.__handlePress);
    this.removeEventListener('click', this.__dispatchClickWithThrottle);
    super.disconnectedCallback();
  }

  override focus() {
    this.itemElement?.focus();
  }

  override blur() {
    this.itemElement?.blur();
  }

  __dispatchClickWithThrottle: (event: MouseEvent | KeyboardEvent) => void =
      event => {
        this.__dispatchClick(event);
      };
  
  __dispatchClick = (event: MouseEvent | KeyboardEvent) => {
    // If the button is soft-disabled or a disabled link, we need to explicitly
    // prevent the click from propagating to other event listeners as well as
    // prevent the default action.
    if (this.softDisabled || (this.disabled && this.href)) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return;
    }

    if (!isActivationClick(event) || !this.itemElement) {
      return;
    }

    this.focus();
    dispatchActivationClick(this.itemElement);
  };

  __handleKeyDown = (event: KeyboardEvent) => {
    this.__handlePress(event);

    if (this.disabled || this.softDisabled || !this.itemElement) {
      return;
    }

    if (event.key === ' ') {
      event.preventDefault();
      this.itemElement.click();
      return;
    }

    if (event.key === 'Enter' && !this.__isLink()) {
      event.preventDefault();
      this.itemElement.click();
    }
  };

   __handlePress = (event: KeyboardEvent | MouseEvent) => {
    if (this.disabled || this.softDisabled) return;
    if (
      event instanceof KeyboardEvent &&
      event.type === 'keydown' &&
      (event.key === 'Enter' || event.key === ' ')
    ) {
      this.isPressed = true;
    } else if (event.type === 'mousedown') {
      this.isPressed = true;
    } else {
      this.isPressed = false;
    }
  };

  render() {
    const isLink = this.__isLink();

    const cssClasses = {
      'menu-item': true,
      disabled: this.disabled,
      selected: this.selected,
      pressed: this.isPressed,
    };

    const controls = this.getAttribute('aria-controls');

    if (isLink) {
      return html`<a
        id="item"
        class=${classMap(cssClasses)}
        href=${this.href}
        target=${this.target}
        tabindex=${this.disabled ? '-1' : '0'}

        @click=${this.__dispatchClickWithThrottle}
        @mousedown=${this.__handlePress}
        @keydown=${this.__handleKeyDown}
        @keyup=${this.__handlePress}

        aria-disabled=${String(this.disabled)}
        aria-haspopup=${this.hasSubmenu ? 'menu' : nothing}
        aria-controls=${this.hasSubmenu && controls ? controls : nothing}
        aria-expanded=${this.hasSubmenu ? String(this.submenuOpen) : nothing}
      >
        ${this.renderContent()}
      </a> `;
    }

    return html`<div
      id="item"
      class=${classMap(cssClasses)}
      tabindex=${this.disabled ? '-1' : '0'}

      @click=${this.__dispatchClick}
      @mousedown=${this.__handlePress}
      @keydown=${this.__handleKeyDown}
      @keyup=${this.__handlePress}

      aria-disabled=${String(this.disabled)}
      aria-haspopup=${this.hasSubmenu ? 'menu' : nothing}
      aria-controls=${this.hasSubmenu && controls ? controls : nothing}
      aria-expanded=${this.hasSubmenu ? String(this.submenuOpen) : nothing}
    >
      ${this.renderContent()}
    </div>`;
  }

  renderContent() {
    return html`
      <wc-focus-ring class="focus-ring" for='item'></wc-focus-ring>
      <div class="background"></div>
      <wc-ripple class="ripple"></wc-ripple>

      <div class="menu-item-content" data-variant=${this.variant}>
        <slot name="leading-icon"></slot>
        <div class="slot-container">
          <slot></slot>
        </div>
        <slot name="trailing-supporting-text"></slot>
      </div>
    `;
  }
}
