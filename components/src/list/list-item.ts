import { html, LitElement } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import styles from './list-item.scss';
import BaseButtonMixin from '@/__mixins/BaseButtonMixin.js';
import BaseHyperlinkMixin from '@/__mixins/BaseHyperlinkMixin.js';
import {
  dispatchActivationClick,
  isActivationClick,
} from '@/__utils/dispatch-event-utils.js';

/**
 * @label List Item
 * @tag wc-list-item
 * @rawTag list-item
 * @parentRawTag list
 *
 * @summary A Material 3 list item with leading, trailing and content slots.
 *
 * @example
 * ```html
 * <wc-list-item selected>
 *   <wc-icon slot="leading" name="person"></wc-icon>
 *   Profile
 *   <wc-icon slot="trailing" name="chevron_right"></wc-icon>
 * </wc-list-item>
 * ```
 * @tags display
 */
export class ListItem extends BaseButtonMixin(BaseHyperlinkMixin(LitElement)) {
  static styles = [styles];

  @property({ type: Boolean, reflect: true }) selected = false;

  @query('#item') readonly itemElement!: HTMLElement | null;

  @state() isPressed = false;

  connectedCallback() {
    // eslint-disable-next-line wc/guard-super-call
    super.connectedCallback();

    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'listitem');
    }
  }

  override focus() {
    this.itemElement?.focus();
  }

  override blur() {
    this.itemElement?.blur();
  }

  __dispatchClick = (event: MouseEvent | KeyboardEvent) => {
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
      'list-item': true,
      'item-element': true,
      selected: this.selected,
      disabled: this.disabled || this.softDisabled,
      pressed: this.isPressed,
    };

    if (!isLink) {
      return html`
        <button
          id="item"
          class=${classMap(cssClasses)}
          type=${this.htmlType}
          ?disabled=${this.disabled}
          ?aria-disabled=${this.softDisabled}
          @click=${this.__dispatchClick}
          @mousedown=${this.__handlePress}
          @keydown=${this.__handleKeyDown}
          @keyup=${this.__handlePress}
        >
          ${this.renderContent()}
        </button>
      `;
    }

    return html`
      <a
        id="item"
        class=${classMap(cssClasses)}
        href=${this.href}
        target=${this.target}
        rel=${ifDefined(this.rel)}
        download=${ifDefined(this.download)}
        tabindex=${this.disabled ? '-1' : '0'}
        aria-disabled=${String(this.disabled || this.softDisabled)}
        @click=${this.__dispatchClick}
        @mousedown=${this.__handlePress}
        @keydown=${this.__handleKeyDown}
        @keyup=${this.__handlePress}
      >
        ${this.renderContent()}
      </a>
    `;
  }

  renderContent() {
    return html`
      <wc-focus-ring class="focus-ring" for='item'></wc-focus-ring>
      <div class="background"></div>
      <wc-ripple class="ripple"></wc-ripple>

      <div class="list-item-content">
        <div class="leading">
          <slot name="leading"></slot>
        </div>
        <div class="content">
          <slot></slot>
        </div>
        <div class="trailing">
          <slot name="trailing"></slot>
        </div>
      </div>
    `;
  }
}

