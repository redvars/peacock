import { html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './button.scss';
import colorStyles from './button-colors.scss';
import sizeStyles from './button-sizes.scss';
import { observerSlotChangesWithCallback } from '@/__utils/observe-slot-change.js';
import { throttle } from '@/__utils/throttle.js';
import { spread } from '@/__directive/spread.js';
import { BaseButton } from '../BaseButton.js';

/**
 * @label Button
 * @tag wc-button
 * @rawTag button
 *
 * @summary Buttons help people initiate actions, from sending an email, to sharing a document, to liking a post.
 * @overview
 * <p>Buttons are clickable elements that are used to trigger actions. They communicate calls to action to the user and allow users to interact with pages in a variety of ways. Button labels express what action will occur when the user interacts with it.</p>
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
 * @fires {MouseEvent} click - Dispatched when the button is clicked.
 *
 * @example
 * ```html
 * <wc-button>Button</wc-button>
 * ```
 * @tags display
 */
@IndividualComponent
export class Button extends BaseButton {
  static override styles = [styles, colorStyles, sizeStyles];

  /**
   * Icon alignment.
   * Possible values are `"start"`, `"end"`. Defaults to `"end"`.
   */
  @property({ attribute: 'icon-align' })
  iconAlign: 'start' | 'end' = 'end';

  @state()
  private slotHasContent = false;

  override focus() {
    this.buttonElement?.focus();
  }

  override blur() {
    this.buttonElement?.blur();
  }

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
      'show-skeleton': this.skeleton,
      [`icon-align-${this.iconAlign}`]: true,
    };

    if (!isLink) {
      return html`<button
          class=${classMap(cssClasses)}
          id="button"
          type=${this.htmlType}
          @click=${this.__dispatchClickWithThrottle}
          @mousedown=${this.__handlePress}
          @keydown=${this.__handlePress}
          @keyup=${this.__handlePress}

          aria-describedby=${ifDefined(this.softDisabled ? BaseButton.DISABLED_REASON_ID : undefined)}
          ?aria-disabled=${this.softDisabled}

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
        href=${this.href}
        target=${this.target}
        tabindex=${this.disabled ? '-1' : '0'}
        @click=${this.__dispatchClick}
        @mousedown=${this.__handlePress}
        @keydown=${this.__handlePress}
        @keyup=${this.__handlePress}
        role="button"

        aria-describedby=${ifDefined(this.softDisabled ? BaseButton.DISABLED_REASON_ID : undefined)}
        ?aria-disabled=${this.softDisabled}

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
        <div class="slot-container">
          <slot></slot>
        </div>

        <slot name="icon"></slot>
      </div>

      ${this.__renderDisabledReason(this.softDisabled)}
    `;
  }
}
