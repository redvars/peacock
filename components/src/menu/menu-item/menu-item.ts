import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './menu-item.scss';
import colorStyles from './menu-item-colors.scss';

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
export class MenuItem extends LitElement {
  @property({ type: Boolean, reflect: true }) disabled = false;

  @property({ type: String }) value = '';

  @property({ type: Boolean, reflect: true }) selected = false;

  @property({ type: Boolean, attribute: 'keep-open' }) keepOpen = false;

  @property({ type: Boolean, attribute: 'has-submenu' }) hasSubmenu = false;

  @property({ type: Boolean, attribute: 'submenu-open' }) submenuOpen = false;

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

    if (!this.hasAttribute('tabindex')) {
      this.tabIndex = -1;
    }

    this.addEventListener('click', this._handleClick);
    this.addEventListener('keydown', this._handleKeyDown);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._handleClick);
    this.removeEventListener('keydown', this._handleKeyDown);
    super.disconnectedCallback();
  }

  private emitActivate(source: 'click' | 'keydown', key?: string) {
    this.dispatchEvent(
      new CustomEvent('menu-item-activate', {
        bubbles: true,
        composed: true,
        detail: { item: this, source, key },
      }),
    );
  }

  private requestClose(source: 'click' | 'keydown', key?: string) {
    this.dispatchEvent(
      new CustomEvent('menu-item-request-close', {
        bubbles: true,
        composed: true,
        detail: {
          item: this,
          source,
          key,
          reason: source === 'click' ? 'click-selection' : 'keydown',
        },
      }),
    );
  }

  private requestSubmenuKey(key: string) {
    this.dispatchEvent(
      new CustomEvent('menu-item-submenu-keydown', {
        bubbles: true,
        composed: true,
        detail: { item: this, key },
      }),
    );
  }

  private _handleKeyDown(e: KeyboardEvent) {
    if (this.disabled) {
      e.preventDefault();
      return;
    }

    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      this.requestSubmenuKey(e.key);
      return;
    }

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.emitActivate('keydown', e.key);
      if (!this.keepOpen) {
        this.requestClose('keydown', e.key);
      }
    }
  }

  private _handleClick(e: MouseEvent) {
    if (this.disabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    this.emitActivate('click');
    if (!this.keepOpen) {
      this.requestClose('click');
    }
  }

  __isLink() {
    return !!this.href;
  }

  get focusTarget() {
    return this;
  }

  render() {
    const isLink = this.__isLink();

    const cssClasses = {
      'menu-item': true,
      disabled: this.disabled,
      selected: this.selected,
    };

    const controls = this.getAttribute('aria-controls');

    if (isLink) {
      return html`<a
        class=${classMap(cssClasses)}
        href=${this.href}
        target=${this.target}
        aria-disabled=${String(this.disabled)}
        aria-haspopup=${this.hasSubmenu ? 'menu' : nothing}
        aria-controls=${this.hasSubmenu && controls ? controls : nothing}
        aria-expanded=${this.hasSubmenu ? String(this.submenuOpen) : nothing}
      >
        ${this.renderContent()}
      </a> `;
    }

    return html`<div
      class=${classMap(cssClasses)}
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
      <wc-focus-ring
        class="focus-ring"
        .control=${this}
        element="focusTarget"
      ></wc-focus-ring>
      <div class="background"></div>
      <wc-ripple class="ripple"></wc-ripple>

      <div class="menu-item-content">
        <slot name="leading-icon"></slot>
        <div class="slot-container">
          <slot></slot>
        </div>
        <slot name="trailing-supporting-text"></slot>
      </div>
    `;
  }
}
