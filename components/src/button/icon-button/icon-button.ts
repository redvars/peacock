import { html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from '../button/button.scss';
import colorStyles from '../button/button-colors.scss';
import sizeStyles from './icon-button-sizes.scss';
import { observerSlotChangesWithCallback, throttle } from '../../utils.js';
import { spread } from '../../spread.js';
import { BaseButton } from '../BaseButton.js';
import { IconProvider } from '../../icon/icon.js';

/**
 * @label Icon Button
 * @tag p-icon-button
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
 * <p-icon-button name="home"></p-icon-button>
 * ```
 * @tags display
 */
export class IconButton extends BaseButton {
  static override styles = [styles, colorStyles, sizeStyles];

  #id = crypto.randomUUID();

  #tabindex?: number = 0;

  @property({ type: String, reflect: true }) name?: string;

  @property({ type: String, reflect: true }) src?: string;

  @property({ type: String }) provider: IconProvider = 'material-symbols';

  @state()
  private slotHasContent = false;

  override firstUpdated() {
    this.__dispatchClickWithThrottle = throttle(
      this.__dispatchClick,
      this.throttleDelay,
    );
    observerSlotChangesWithCallback(
      this.renderRoot.querySelector('slot'),
      hasContent => {
        this.slotHasContent = hasContent;
        this.requestUpdate();
      },
    );

    this.__convertTypeToVariantAndColor();
  }

  __renderDisabledReason() {
    if (this.disabled && this.disabledReason)
      return html`<div
        id="disabled-reason-${this.#id}"
        role="tooltip"
        aria-label=${this.disabledReason}
        class="sr-only"
      >
        {this.disabledReason}
      </div>`;
    return null;
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
      'has-content': this.slotHasContent,
    };

    if (!isLink) {
      return html`<button
        class=${classMap(cssClasses)}
        tabindex=${this.#tabindex}
        type=${this.htmlType}
        @click=${this.__dispatchClickWithThrottle}
        @mousedown=${this.__handlePress}
        @keydown=${this.__handlePress}
        @keyup=${this.__handlePress}
        ?aria-describedby=${(this.disabled || this.softDisabled) &&
        this.disabledReason
          ? `disabled-reason-${this.#id}`
          : null}
        aria-disabled=${`${this.disabled || this.softDisabled}`}
        ?disabled=${this.disabled}
        ${spread(this.configAria)}
      >
        ${this.renderButtonContent()}
      </button>`;
    }
    return html`<a
      class=${classMap(cssClasses)}
      tabindex=${this.#tabindex}
      href=${this.href}
      target=${this.target}
      @click=${this.__dispatchClickWithThrottle}
      @mousedown=${this.__handlePress}
      @keydown=${this.__handlePress}
      @keyup=${this.__handlePress}
      role="button"
      aria-describedby=${this.disabled && this.disabledReason
        ? `disabled-reason-${this.#id}`
        : null}
      aria-disabled=${`${this.disabled}`}
      ${spread(this.configAria)}
    >
      ${this.renderButtonContent()}
    </a>`;
  }

  renderButtonContent() {
    return html`
      <p-focus-ring class="focus-ring" .control=${this}></p-focus-ring>
      <p-elevation class="elevation"></p-elevation>
      <div class="neo-background"></div>
      <div class="background"></div>
      <div class="outline"></div>
      <p-ripple class="ripple"></p-ripple>

      <div class="button-content">
        <p-icon
          name=${this.name}
          src=${this.src}
          provider=${this.provider}
        ></p-icon>
      </div>

      ${this.__renderDisabledReason()}
    `;
  }
}
