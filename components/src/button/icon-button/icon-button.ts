import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from '../button/button.scss';
import colorStyles from '../button/button-colors.scss';
import sizeStyles from './icon-button-sizes.scss';
import { spread } from '@/__directive/spread.js';
import { throttle } from '@/__utils/throttle.js';
import { BaseButton } from '../BaseButton.js';
import { IconProvider } from '../../icon/icon.js';

/**
 * @label Icon Button
 * @tag wc-icon-button
 * @rawTag icon-button
 *
 * @summary Icon buttons allow users to take actions, and make choices, with a single tap.
 *
 * @overview
 * <p>Icon buttons are clickable elements that are used to trigger actions. They communicate calls to action to the user and allow users to interact with pages in a variety of ways. IconButton labels express what action will occur when the user interacts with it.</p>
 *
 * @cssprop --button-container-shape: Defines the border radius of the button container shape.
 *
 * @cssprop --button-container-shape-start-start: Defines the start position of the button container shape.
 * @cssprop --button-container-shape-start-end: Defines the end position of the button container shape.
 * @cssprop --button-container-shape-end-start: Defines the start position of the button container shape.
 * @cssprop --button-container-shape-end-end: Defines the end position of the button container shape.
 *
 *
 * @cssprop --filled-button-container-color: Color of the filled button container.
 * @cssprop --filled-button-label-text-color: Text color of the filled button label.
 *
 * @cssprop --outlined-button-container-color: Color of the outlined button container.
 * @cssprop --outlined-button-label-text-color: Text color of the outlined button label.
 *
 * @cssprop --text-button-label-text-color: Text color of the text button label.
 *
 * @cssprop --tonal-button-container-color: Color of the tonal button container.
 * @cssprop --tonal-button-label-text-color: Text color of the tonal button label.
 *
 * @cssprop --elevated-button-container-color: Color of the elevated button container.
 * @cssprop --elevated-button-label-text-color: Text color of the elevated button label.
 *
 * @cssprop --neo-button-container-color: Color of the neo button container.
 * @cssprop --neo-button-label-text-color: Text color of the neo button label.
 *
 * @fires {CustomEvent} button:click - Dispatched when the button is clicked.
 *
 * @example
 * ```html
 * <wc-icon-button name="home"></wc-icon-button>
 * ```
 * @tags display
 */
export class IconButton extends BaseButton {
  static override styles = [styles, colorStyles, sizeStyles];

  #tabindex?: number = 0;

  @property({ type: String, reflect: true }) name?: string;

  @property({ type: String, reflect: true }) src?: string;

  @property({ type: String }) provider: IconProvider = 'material-symbols';

  override focus() {
    this.buttonElement?.focus();
  }

  override blur() {
    this.buttonElement?.blur();
  }

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this.__dispatchClickWithThrottle);
    window.addEventListener('mouseup', this.__handlePress);
  }

  override disconnectedCallback() {
    window.removeEventListener('mouseup', this.__handlePress);
    this.removeEventListener('click', this.__dispatchClickWithThrottle);
    super.disconnectedCallback();
  }
  
  override firstUpdated() {
    this.__dispatchClickWithThrottle = throttle(
      this.__dispatchClick,
      this.throttleDelay,
    );
    this.__convertTypeToVariantAndColor();
  }

  override render() {
    const isLink = this.__isLink();

    const cssClasses = {
      button: true,
      'button-element': true,
      [`size-${this.size}`]: true,
      [`variant-${this.variant}`]: true,
      [`color-${this.color}`]: true,
      disabled: this.disabled || this.softDisabled,
      pressed: this.isPressed,
      skeleton: this.skeleton,
    };

    if (!isLink) {
      return html`<button
          class=${classMap(cssClasses)}
          id="button"
          tabindex=${this.#tabindex}
          type=${this.htmlType}
          @click=${this.__dispatchClickWithThrottle}
          @mousedown=${this.__handlePress}
          @keydown=${this.__handlePress}
          @keyup=${this.__handlePress}
          aria-describedby=${this.__disabledReasonID}
          aria-disabled=${`${this.disabled || this.softDisabled}`}
          ?disabled=${this.disabled}
          ${spread(this.configAria)}
        >
          ${this.renderButtonContent()}
        </button>
        ${this.__renderTooltip()}`;
    }
    return html`<a
        class=${classMap(cssClasses)}
        id="button"
        tabindex=${this.#tabindex}
        href=${this.href}
        target=${this.target}
        @click=${this.__dispatchClickWithThrottle}
        @mousedown=${this.__handlePress}
        @keydown=${this.__handlePress}
        @keyup=${this.__handlePress}
        role="button"
        aria-describedby=${this.__disabledReasonID}
        aria-disabled=${`${this.disabled}`}
        ${spread(this.configAria)}
      >
        ${this.renderButtonContent()}
      </a>
      ${this.__renderTooltip()}`;
  }

  renderButtonContent() {
    return html`
      <wc-focus-ring class="focus-ring" .control=${this} .forElement=${this.buttonElement}></wc-focus-ring>
      <wc-elevation class="elevation"></wc-elevation>
      <div class="neo-background"></div>
      <div class="background"></div>
      <div class="outline"></div>
      <wc-ripple class="ripple"></wc-ripple>
      <wc-skeleton class="skeleton"></wc-skeleton>

      <div class="button-content">
        <wc-icon
          name=${this.name}
          src=${this.src}
          provider=${this.provider}
        ></wc-icon>
      </div>

      ${this.__renderDisabledReason()}
    `;
  }
}
