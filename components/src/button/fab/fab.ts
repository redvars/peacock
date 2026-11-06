import { html, LitElement, nothing, type PropertyValues } from 'lit';
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
import {
  iconButtonLabel,
  mixinBaseButton,
  toggleButtonSelected,
  warnIfUnnamed,
} from '../base-button/base-button.js';
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
 * <p>A Floating Action Button (FAB) is a circular button that represents the primary action on a screen. It follows the specification and supports four color roles and two variants.</p>
 * <p>An icon-only FAB needs an accessible name: set <code>aria-label</code>, or a <code>tooltip</code>, which is used when no <code>aria-label</code> is set. With neither (and no <code>label</code>), a warning is logged once.</p>
 * <p>Set <code>toggle</code> for a toggle FAB with <code>aria-pressed</code>; <code>selected</code> does nothing without it. Link mode (<code>href</code>) stays supported on the FAB.</p>
 *
 * @cssprop --fab-container-color: Background color of the FAB container.
 * @cssprop --fab-label-text-color: Text and icon color of the FAB label.
 * @cssprop --fab-container-shape: Corner radius of the FAB. Defaults to var(--shape-corner-large).
 * @cssprop --fab-container-elevation-level: Elevation level of the FAB. Defaults to 3.
 *
 * @fires {MouseEvent} click - Dispatched when the FAB is clicked. Not dispatched while `loading`, `soft-disabled` or `skeleton`.
 * @fires {CustomEvent<{ selected: boolean }>} change - Dispatched by a `toggle` FAB after a click flips `selected`.
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
   * When true, the FAB is busy: it shows a spinner in place of its icon, sets `aria-busy="true"`
   * and ignores clicks, like `soft-disabled`.
   */
  @property({ type: Boolean, reflect: true }) loading: boolean = false;

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
   * Tooltip text shown on hover. Without a `label`, also the accessible name when no
   * `aria-label` is set.
   */
  @property() tooltip?: string;

  /** When true, renders the FAB as a placeholder skeleton while the page loads. */
  @property({ type: Boolean, reflect: true }) skeleton: boolean = false;

  /**
   * When true, the FAB is a toggle button: it renders `aria-pressed`, flips `selected` on click
   * and fires `change`.
   */
  @property({ type: Boolean, reflect: true }) toggle: boolean = false;

  /** The pressed state of a `toggle` FAB. Has no effect without `toggle`. */
  @property({ type: Boolean, reflect: true }) selected: boolean = false;

  // ── Queries ───────────────────────────────────────────────────────────────

  @query('.button') readonly buttonElement!: HTMLElement | null;

  // ── Constructor ───────────────────────────────────────────────────────────

  constructor() {
    super();
    this.addEventListener('click', this.__dispatchClickWithThrottle);
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  override firstUpdated(changedProperties: PropertyValues<this>) {
    super.firstUpdated(changedProperties);
    warnIfUnnamed(
      this,
      (this as ARIAMixinStrict).ariaLabel,
      this.label,
      this.tooltip,
    );
  }

  // ── Public methods ────────────────────────────────────────────────────────

  override focus() {
    this.buttonElement?.focus();
  }

  override blur() {
    this.buttonElement?.blur();
  }

  // ── Private methods ───────────────────────────────────────────────────────

  __dispatchClick = (event: MouseEvent | KeyboardEvent) => {
    // If the button is soft-disabled, loading or a disabled link, we need to
    // explicitly prevent the click from propagating to other event listeners
    // as well as prevent the default action.
    if (
      this.softDisabled ||
      this.loading ||
      (this.disabled && this.href) ||
      this.skeleton
    ) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return;
    }

    // Each activation reaches this listener once: either the inner button's
    // click bubbling out, or a click fired at the host and forwarded below.
    if (!isLink(this)) toggleButtonSelected(this);

    if (!isActivationClick(event) || !this.buttonElement) {
      return;
    }

    this.focus();
    dispatchActivationClick(this.buttonElement);
  };

  // ── Render helpers ────────────────────────────────────────────────────────

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
    // An extended FAB is named by its label; an icon-only one falls back to its tooltip.
    const label = isExtended
      ? ariaLabel
      : iconButtonLabel(ariaLabel, this.tooltip);

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
        aria-label="${label || nothing}"
        aria-haspopup="${ariaHasPopup || nothing}"
        aria-expanded="${ariaExpanded || nothing}"
        aria-describedby=${ifDefined(
          this.softDisabled ? DISABLED_REASON_ID : undefined,
        )}
        aria-disabled=${this.softDisabled ? 'true' : nothing}
        aria-pressed=${this.toggle ? String(this.selected) : nothing}
        aria-busy=${this.loading ? 'true' : nothing}
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
      aria-label="${label || nothing}"
      aria-haspopup="${ariaHasPopup || nothing}"
      aria-expanded="${ariaExpanded || nothing}"
      aria-describedby=${ifDefined(
        this.softDisabled ? DISABLED_REASON_ID : undefined,
      )}
      aria-disabled=${this.softDisabled ? 'true' : nothing}
      aria-busy=${this.loading ? 'true' : nothing}
    >
      ${this.renderFabContent(isExtended)}
    </a>`;
  }

  renderFabContent(isExtended: boolean) {
    return html`
      <div class="fab-content">
        ${this.loading
          ? html`<wc-circular-progress
              class="loading-indicator"
              indeterminate
              aria-hidden="true"
            ></wc-circular-progress>`
          : nothing}
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
