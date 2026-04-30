import { html, LitElement, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';

import IndividualComponent from '@/IndividualComponent.js';
import {
  dispatchActivationClick,
  isActivationClick,
} from '@/__utils/dispatch-event-utils.js';
import { isLink } from '@/__utils/is-link.js';
import { throttle } from '@/__utils/throttle.js';
import { spread } from '@/__directive/spread.js';

import styles from './fab.scss';
import colorStyles from './fab-colors.scss';
import sizeStyles from './fab-sizes.scss';
import NativeButtonMixin from '@/__mixins/NativeButtonMixin.js';
import NativeHyperlinkMixin from '@/__mixins/NativeHyperlinkMixin.js';
import { DISABLED_REASON_ID } from '@/button/ButtonConstants.js';

/**
 * @label FAB
 * @tag wc-fab
 * @rawTag fab
 *
 * @summary The FAB (Floating Action Button) represents the primary action on a screen.
 * @overview
 * <p>A Floating Action Button (FAB) is a circular button that represents the primary action on a screen. It follows the Material Design 3 specification and supports four color roles and two variants.</p>
 *
 * @cssprop --fab-container-color: Background color of the FAB container.
 * @cssprop --fab-label-text-color: Text and icon color of the FAB label.
 * @cssprop --fab-container-shape: Corner radius of the FAB. Defaults to var(--shape-corner-large).
 * @cssprop --fab-container-elevation-level: Elevation level of the FAB. Defaults to 3.
 *
 * @fires {MouseEvent} click - Dispatched when the FAB is clicked.
 *
 * @example
 * ```html
 * <wc-fab><wc-icon name="add"></wc-icon></wc-fab>
 * ```
 * @tags controls
 */
@IndividualComponent
export class Fab extends NativeButtonMixin(NativeHyperlinkMixin(LitElement)) {
  static override styles = [styles, colorStyles, sizeStyles];

  #id = crypto.randomUUID();

  /**
   * Optional label text for the extended FAB variant.
   * When set, the FAB displays both the icon and a text label.
   */
  @property({ type: String }) label?: string;

  /**
   * The color role of the FAB.
   * `"surface"` uses the surface color role.
   * `"primary"` uses the primary color role.
   * `"secondary"` uses the secondary color role.
   * `"tertiary"` uses the tertiary color role.
   */
  @property({ reflect: true }) color:
    | 'surface'
    | 'primary'
    | 'secondary'
    | 'tertiary' = 'surface';

  /**
   * The style variant of the FAB.
   * `"tonal"` uses container colors.
   * `"filled"` uses solid role colors.
   */
  @property({ reflect: true }) variant: 'tonal' | 'filled' = 'tonal';

  /**
   * The size of the FAB.
   * `"sm"` renders a small FAB (40×40dp).
   * `"md"` renders a standard FAB (56×56dp). This is the default.
   * `"lg"` renders a large FAB (96×96dp).
   */
  @property({ reflect: true }) size: 'sm' | 'md' | 'lg' = 'md';

  /**
   * If `true`, the FAB is in a lowered (resting) state with reduced elevation.
   */
  @property({ type: Boolean, reflect: true }) lowered: boolean = false;

  /**
   * Additional ARIA attributes to pass to the inner button/anchor element.
   */
  @property({ reflect: true })
  configAria?: { [key: string]: any };

  /**
   * Sets the delay for throttle in milliseconds. Defaults to 200 milliseconds.
   */
  @property() throttleDelay = 200;

  /**
   * Tooltip text shown on hover.
   */
  @property() tooltip?: string;

  @property({ type: Boolean, reflect: true }) skeleton: boolean = false;

  @property({ type: Boolean, reflect: true }) toggle: boolean = false;

  @property({ type: Boolean, reflect: true }) selected: boolean = false;

  /**
   * States
   */
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
    if (
      event instanceof KeyboardEvent &&
      event.type === 'keydown' &&
      (event.key === 'Enter' || event.key === ' ')
    ) {
      this.pressed = true;
    } else if (event.type === 'mousedown') {
      this.pressed = true;
    } else {
      this.pressed = false;
    }
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
  }

  override render() {
    const isExtended = !!this.label;

    return html`
      <wc-focus-ring class="focus-ring" for="button"></wc-focus-ring>
      <wc-elevation class="elevation"></wc-elevation>
      <div class="background"></div>
      <wc-ripple class="ripple" for="button"></wc-ripple>
      <wc-skeleton class="skeleton"></wc-skeleton>

      ${this.__renderFabElement(isExtended)} ${this.__renderTooltip()}
    `;
  }

  __renderFabElement(isExtended: boolean) {
    const cssClasses = {
      button: true,
      fab: true,
      'fab-element': true,
      [`size-${this.size}`]: true,
      [`color-${this.color}`]: true,
      [`variant-${this.variant}`]: true,
      extended: isExtended,
      lowered: this.lowered,
      disabled: this.disabled,
      pressed: this.pressed,
    };

    if (!isLink(this)) {
      return html`<button
        class=${classMap(cssClasses)}
        id="button"
        type="button"
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
        ${this.__renderFabContent(isExtended)}
      </button>`;
    }

    return html`<a
      class=${classMap(cssClasses)}
      id="button"
      tabindex=${this.disabled ? '-1' : '0'}
      href=${ifDefined(this.href)}
      target=${this.target}
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
      ${this.__renderFabContent(isExtended)}
    </a>`;
  }

  __renderFabContent(isExtended: boolean) {
    return html`
      <div class="fab-content">
        <slot></slot>
        ${isExtended
          ? html`<span class="fab-label">${this.label}</span>`
          : nothing}
      </div>
      ${this.__renderDisabledReason(this.softDisabled)}
    `;
  }
}
