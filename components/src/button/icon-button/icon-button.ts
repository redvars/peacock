import { html, LitElement, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { when } from 'lit/directives/when.js';
import buttonLayers from '../button/button-layers.scss';
import styles from '../button/button.scss';
import colorStyles from '../button/button-colors.scss';
import sizeStyles from './icon-button-sizes.scss';
import { spread } from '@/__directive/spread.js';
import { throttle } from '@/__utils/throttle.js';
import { isLink } from '@/__utils/is-link.js';
import { observerSlotChangesWithCallback } from '@/__utils/observe-slot-change.js';
import {
  dispatchActivationClick,
  isActivationClick,
} from '@/__utils/dispatch-event-utils.js';
import NativeButtonMixin from '@/__mixins/NativeButtonMixin.js';
import NativeHyperlinkMixin from '@/__mixins/NativeHyperlinkMixin.js';
import { GroupButtonInterface } from '@/button/GroupButtonInterface.js';
import { DISABLED_REASON_ID } from '@/button/ButtonConstants.js';

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
 * <wc-icon-button><wc-icon name="home"></wc-icon></wc-icon-button>
 * ```
 * @tags display
 */
export class IconButton
  extends NativeButtonMixin(NativeHyperlinkMixin(LitElement))
  implements GroupButtonInterface
{
  static override styles = [buttonLayers, styles, colorStyles, sizeStyles];

  /**
   * Button size.
   * Possible values are `"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"`. Defaults to `"sm"`.
   */
  @property({ reflect: true }) size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'sm';

  /**
   * Type is preset of color and variant. Type will be only applied.
   *
   */
  @property({ type: String }) type?: 'primary' | 'secondary' | 'tertiary';

  /**
   * The visual style of the button.
   *
   *  Possible variant values:
   * `"filled"` is a filled button.
   * `"outlined"` is an outlined button.
   * `"text"` is a transparent button.
   * `"tonal"` is a light color button.
   * `"elevated"` is elevated button
   */
  @property({ reflect: true }) variant:
    | 'elevated'
    | 'filled'
    | 'tonal'
    | 'outlined'
    | 'text'
    | 'neo' = 'filled';

  /**
   * Defines the primary color of the button. This can be set to predefined color names to apply specific color themes.
   */
  @property({ reflect: true }) color:
    | 'primary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'surface'
    | 'on-surface' = 'primary';

  /**
   * Additional ARIA attributes to pass to the inner button/anchor element.
   */
  @property({ reflect: true })
  configAria?: { [key: string]: any };

  @property({ type: Boolean, reflect: true }) skeleton: boolean = false;

  @property({ type: Boolean, reflect: true }) toggle: boolean = false;

  @property({ type: Boolean, reflect: true }) selected: boolean = false;

  /**
   * Sets the delay for throttle in milliseconds. Defaults to 200 milliseconds.
   */
  @property() throttleDelay = 200;

  @property() tooltip?: string;

  @property({ type: Boolean, reflect: true })
  pressed = false;

  @query('.button') readonly buttonElement!: HTMLElement | null;

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

  __handlePress = (event: KeyboardEvent | MouseEvent) => {
    if (this.disabled || this.skeleton || this.softDisabled) return;
    this.pressed =
      (event instanceof KeyboardEvent &&
        event.type === 'keydown' &&
        (event.key === 'Enter' || event.key === ' ')) ||
      event.type === 'mousedown';
  };

  __dispatchClickWithThrottle: (event: MouseEvent | KeyboardEvent) => void =
    event => {
      this.__dispatchClick(event);
    };

  __dispatchClick = (event: MouseEvent | KeyboardEvent) => {
    // If the button is soft-disabled or a disabled link, we need to explicitly
    // prevent the click from propagating to other event listeners as well as
    // prevent the default action.
    if (this.softDisabled || (this.disabled && this.href) || this.skeleton) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return;
    }

    if (!isActivationClick(event) || !this.buttonElement) {
      return;
    }

    if (this.toggle) {
      this.selected = !this.selected;
    }

    this.focus();
    dispatchActivationClick(this.buttonElement);
  };

  __renderDisabledReason(softDisabled: boolean) {
    if (softDisabled)
      return html`<div
        id=${DISABLED_REASON_ID}
        role="tooltip"
        aria-label=${this.disabledReason}
        class="screen-reader-only"
      >
        ${this.disabledReason}
      </div>`;
    return nothing;
  }

  __renderTooltip() {
    if (this.tooltip) {
      return html`<wc-tooltip for="button">${this.tooltip}</wc-tooltip>`;
    }
    return nothing;
  }

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
    this.__convertTypeToVariantAndColor();
  }

  __convertTypeToVariantAndColor() {
    if (this.type === 'primary') {
      this.color = 'primary';
      this.variant = 'filled';
    } else if (this.type === 'secondary') {
      this.color = 'surface';
      this.variant = 'filled';
    } else if (this.type === 'tertiary') {
      this.color = 'primary';
      this.variant = 'text';
    } else if (this.type === 'danger') {
      this.color = 'danger';
      this.variant = 'filled';
    }
  }

  override render() {
    return html`
      <wc-focus-ring class="focus-ring" for="button"></wc-focus-ring>
      <wc-elevation class="elevation"></wc-elevation>
      ${when(
        this.variant === 'neo',
        () => html`<div class="neo-background"></div>`,
      )}
      <div class="background"></div>
      ${when(
        this.variant === 'outlined' || this.variant === 'neo',
        () => html`<div class="outline"></div>`,
      )}
      <wc-ripple class="ripple" for="button"></wc-ripple>
      <wc-skeleton class="skeleton"></wc-skeleton>

      ${this.renderButtonElement()} ${this.__renderTooltip()}
    `;
  }

  renderButtonElement() {
    const cssClasses = {
      button: true,
      'button-element': true,
      [`size-${this.size}`]: true,
      [`variant-${this.variant}`]: true,
      [`color-${this.color}`]: true,
      disabled: this.disabled || this.softDisabled,
      pressed: this.pressed,
      skeleton: this.skeleton,
    };

    if (!isLink(this)) {
      cssClasses['native-button'] = true;
      return html`<button
        class=${classMap(cssClasses)}
        id="button"
        type=${this.htmlType}
        @click=${this.__dispatchClickWithThrottle}
        @mousedown=${this.__handlePress}
        @keydown=${this.__handlePress}
        @keyup=${this.__handlePress}
        aria-describedby=${ifDefined(
          this.softDisabled ? DISABLED_REASON_ID : undefined,
        )}
        ?aria-disabled=${this.softDisabled}
        ?disabled=${this.disabled}
        ${spread(this.configAria)}
      >
        ${this.renderButtonContent()}
      </button>`;
    }
    cssClasses['native-link'] = true;
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
      aria-describedby=${ifDefined(
        this.softDisabled ? DISABLED_REASON_ID : undefined,
      )}
      ?aria-disabled=${this.softDisabled}
      ${spread(this.configAria)}
    >
      ${this.renderButtonContent()}
    </a>`;
  }

  renderButtonContent() {
    return html`
      <slot class="icon-slot"></slot>
      ${this.__renderDisabledReason(this.softDisabled)}
    `;
  }
}
