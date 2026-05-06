import { html, LitElement, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';

import IndividualComponent from '@/IndividualComponent.js';
import {
  dispatchActivationClick,
  isActivationClick,
} from '@/__internal/utils/dispatch-event-utils.js';
import { isLink } from '@/__internal/utils/is-link.js';
import styles from './fab.scss';
import colorStyles from './fab-colors.scss';
import sizeStyles from './fab-sizes.scss';
import { DISABLED_REASON_ID } from '@/button/ButtonConstants.js';
import { mixinBaseButton } from '../base-button/base-button.js';
import { mixinDelegatesAria } from '@/__internal/aria/delegate.js';
import { mixinFormSubmitter } from '@/__internal/mixins/form-submitter.js';
import { mixinHyperlink } from '@/__internal/mixins/hyperlink.js';
import { mixinElementInternals } from '@/__internal/mixins/element-internals.js';
import { mixinFormAssociated } from '@/__internal/mixins/form-associated.js';
import { ARIAMixinStrict } from '@/__internal/aria/aria.js';

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
export class Fab extends mixinBaseButton(
  mixinHyperlink(
    mixinDelegatesAria(
      mixinFormSubmitter(
        mixinFormAssociated(mixinElementInternals(LitElement)),
      ),
    ),
  ),
) {
  // ── Static ───────────────────────────────────────────────────────────────

  /** @nocollapse */ // eslint-disable-next-line
  static override shadowRootOptions: ShadowRootInit = {
    mode: 'open',
    delegatesFocus: true,
  };

  static override styles = [styles, colorStyles, sizeStyles];

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
   * Tooltip text shown on hover.
   */
  @property() tooltip?: string;

  @property({ type: Boolean, reflect: true }) skeleton: boolean = false;

  @property({ type: Boolean, reflect: true }) toggle: boolean = false;

  @property({ type: Boolean, reflect: true }) selected: boolean = false;

  @query('.button') readonly buttonElement!: HTMLElement | null;

  constructor() {
    super();
    this.addEventListener('click', this.__dispatchClickWithThrottle);
  }

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

  override focus() {
    this.buttonElement?.focus();
  }

  override blur() {
    this.buttonElement?.blur();
  }

  renderDisabledReason(softDisabled: boolean) {
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

  renderTooltip() {
    if (this.tooltip) {
      return html`<wc-tooltip class="tooltip" for="button"
        >${this.tooltip}</wc-tooltip
      >`;
    }
    return nothing;
  }

  renderFabElement(isExtended: boolean) {
    const { ariaLabel, ariaHasPopup, ariaExpanded } = this as ARIAMixinStrict;

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
    };

    if (!isLink(this)) {
      return html`<button
        class=${classMap(cssClasses)}
        id="button"
        type="button"
        aria-label="${ariaLabel || nothing}"
        aria-haspopup="${ariaHasPopup || nothing}"
        aria-expanded="${ariaExpanded || nothing}"
        aria-describedby=${ifDefined(
          this.softDisabled ? DISABLED_REASON_ID : undefined,
        )}
        ?aria-disabled=${this.softDisabled}
        ?disabled=${this.disabled}
      >
        ${this.renderFabContent(isExtended)}
      </button>`;
    }

    return html`<a
      class=${classMap(cssClasses)}
      id="button"
      tabindex=${this.disabled ? '-1' : '0'}
      href=${ifDefined(this.href)}
      target=${this.target}
      role="button"
      aria-label="${ariaLabel || nothing}"
      aria-haspopup="${ariaHasPopup || nothing}"
      aria-expanded="${ariaExpanded || nothing}"
      aria-describedby=${ifDefined(
        this.softDisabled ? DISABLED_REASON_ID : undefined,
      )}
      ?aria-disabled=${this.softDisabled}
    >
      ${this.renderFabContent(isExtended)}
    </a>`;
  }

  renderFabContent(isExtended: boolean) {
    return html`
      <div class="fab-content">
        <slot></slot>
        ${isExtended
          ? html`<span class="fab-label">${this.label}</span>`
          : nothing}
      </div>
      ${this.renderDisabledReason(this.softDisabled)}
    `;
  }

  // ── Render ────────────────────────────────────────────────────────────────

  override render() {
    const isExtended = !!this.label;

    return html`
      <wc-focus-ring class="focus-ring" for="button"></wc-focus-ring>
      <wc-elevation class="elevation"></wc-elevation>
      <div class="background"></div>
      <wc-ripple class="ripple" for="button"></wc-ripple>
      <wc-skeleton class="skeleton"></wc-skeleton>

      ${this.renderFabElement(isExtended)} ${this.renderTooltip()}
    `;
  }
}
