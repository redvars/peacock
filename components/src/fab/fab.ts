import { html, LitElement, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';

import IndividualComponent from '@/IndividualComponent.js';
import { dispatchActivationClick, isActivationClick } from '@/__utils/dispatch-event-utils.js';
import { throttle } from '@/__utils/throttle.js';
import { spread } from '@/__directive/spread.js';

import { IconProvider } from '../icon/icon.js';
import styles from './fab.scss';
import colorStyles from './fab-colors.scss';
import sizeStyles from './fab-sizes.scss';
import BaseHyperlinkMixin from '@/__mixins/BaseHyperlinkMixin.js';

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
 * <wc-fab name="add"></wc-fab>
 * ```
 * @tags controls
 */
@IndividualComponent
export class Fab extends BaseHyperlinkMixin(LitElement) {
  static override styles = [styles, colorStyles, sizeStyles];

  #id = crypto.randomUUID();

  #tabindex?: number = 0;

  /**
   * Name of the icon to display inside the FAB.
   */
  @property({ type: String, reflect: true }) name?: string;

  /**
   * Source URL for a custom icon.
   */
  @property({ type: String, reflect: true }) src?: string;

  /**
   * Icon provider. Defaults to `"material-symbols"`.
   */
  @property({ type: String }) provider: IconProvider = 'material-symbols';

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
  @property({ reflect: true }) color: 'surface' | 'primary' | 'secondary' | 'tertiary' = 'surface';

  /**
   * The style variant of the FAB.
   * `"tonal"` uses container colors.
   * `"filled"` uses solid role colors.
   */
  @property({ reflect: true }) variant: 'tonal' | 'filled' = 'tonal';

  /**
   * The size of the FAB.
   * `"s"` renders a small FAB (40×40dp).
   * `"m"` renders a standard FAB (56×56dp). This is the default.
   * `"l"` renders a large FAB (96×96dp).
   */
  @property({ reflect: true }) size: 's' | 'm' | 'l' = 'm';

  /**
   * If `true`, the FAB is in a lowered (resting) state with reduced elevation.
   */
  @property({ type: Boolean, reflect: true }) lowered: boolean = false;

  /**
   * If `true`, the user cannot interact with the FAB.
   */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;

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

  @state()
  isPressed = false;

  @query('#fab') readonly fabElement!: HTMLElement | null;

  override focus() {
    this.fabElement?.focus();
  }

  override blur() {
    this.fabElement?.blur();
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
  }

  __handlePress = (event: KeyboardEvent | MouseEvent) => {
    if (this.disabled) return;
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
  

  __dispatchClickWithThrottle: (event: MouseEvent | KeyboardEvent) => void =
    event => {
      this.__dispatchClick(event);
    };

  __dispatchClick = (event: MouseEvent | KeyboardEvent) => {
    if (this.disabled && this.href) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return;
    }

    if (!isActivationClick(event) || !this.fabElement) {
      return;
    }

    this.focus();
    dispatchActivationClick(this.fabElement);
  };

  __getDisabledReasonID() {
    return this.disabled ? `disabled-reason-${this.#id}` : nothing;
  }

  override render() {
    const isLink = this.__isLink();
    const isExtended = !!this.label;

    const cssClasses = {
      fab: true,
      'fab-element': true,
      [`size-${this.size}`]: true,
      [`color-${this.color}`]: true,
      [`variant-${this.variant}`]: true,
      extended: isExtended,
      lowered: this.lowered,
      disabled: this.disabled,
      pressed: this.isPressed,
    };

    if (!isLink) {
      return html`<button
          class=${classMap(cssClasses)}
          id="fab"
          tabindex=${this.#tabindex}
          type="button"
          @click=${this.__dispatchClickWithThrottle}
          @mousedown=${this.__handlePress}
          @keydown=${this.__handlePress}
          @keyup=${this.__handlePress}
          aria-label=${this.label ?? this.name ?? nothing}
          aria-disabled=${`${this.disabled}`}
          ?disabled=${this.disabled}
          ${spread(this.configAria)}
        >
          ${this.__renderFabContent(isExtended)}
        </button>
        ${this.__renderTooltip()}`;
    }

    return html`<a
        class=${classMap(cssClasses)}
        id="fab"
        tabindex=${this.#tabindex}
        href=${ifDefined(this.href)}
        target=${this.target}
        @click=${this.__dispatchClickWithThrottle}
        @mousedown=${this.__handlePress}
        @keydown=${this.__handlePress}
        @keyup=${this.__handlePress}
        role="button"
        aria-label=${this.label ?? this.name ?? nothing}
        aria-disabled=${`${this.disabled}`}
        ${spread(this.configAria)}
      >
        ${this.__renderFabContent(isExtended)}
      </a>
      ${this.__renderTooltip()}`;
  }

  __renderFabContent(isExtended: boolean) {
    return html`
      <wc-focus-ring class="focus-ring" .control=${this.fabElement}></wc-focus-ring>
      <wc-elevation class="elevation"></wc-elevation>
      <div class="background"></div>
      <wc-ripple class="ripple"></wc-ripple>

      <div class="fab-content">
        <wc-icon
          class="fab-icon"
          name=${ifDefined(this.name)}
          src=${ifDefined(this.src)}
          provider=${this.provider}
        ></wc-icon>
        ${isExtended
          ? html`<span class="fab-label">${this.label}</span>`
          : nothing}
      </div>
    `;
  }

  __renderTooltip() {
    if (this.tooltip) {
      return html`<wc-tooltip for="fab">${this.tooltip}</wc-tooltip>`;
    }
    return nothing;
  }
}
