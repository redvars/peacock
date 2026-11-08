import { html, LitElement, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { when } from 'lit/directives/when.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './button.scss';

import type { ButtonSize, ButtonShape } from '@/button/ButtonTypes.js';
import { observerSlotChangesWithCallback } from '@/__internal/utils/observe-slot-change.js';
import {
  dispatchActivationClick,
  isActivationClick,
} from '@/__internal/utils/dispatch-event-utils.js';
import { DISABLED_REASON_ID } from '@/button/ButtonConstants.js';
import { mixinDelegatesAria } from '@/__internal/aria/delegate.js';
import { ARIAMixinStrict } from '@/__internal/aria/aria.js';
import { mixinFormSubmitter } from '@/__internal/mixins/form-submitter.js';
import { mixinElementInternals } from '@/__internal/mixins/element-internals.js';
import {
  mixinBaseButton,
  mixinButtonLevel,
  toggleButtonSelected,
} from '../base-button/base-button.js';
import { mixinFormAssociated } from '@/__internal/mixins/form-associated.js';

export type {
  ButtonSize,
  ButtonLevel,
  ButtonShape,
  ButtonVariant,
  ButtonColor,
} from '@/button/ButtonTypes.js';

/**
 * @label Button
 * @tag wc-button
 * @rawTag button
 *
 * @summary A button with a text label that runs an action, such as saving a form or sending a message; it can also toggle.
 * @overview
 * <p><code>level</code> is a preset of <code>color</code> and <code>variant</code>: <code>primary</code> (primary, filled), <code>secondary</code> (surface, tonal), <code>tertiary</code> (primary, text) and <code>danger</code> (danger, filled). A <code>color</code> or <code>variant</code> you set wins over it.</p>
 * <p>Set <code>toggle</code> to make a toggle button: it renders <code>aria-pressed</code>, flips <code>selected</code> on each click and fires <code>change</code>. <code>selected</code> does nothing without <code>toggle</code>.</p>
 * <p>For a link that looks like a button, use <code>wc-link-button</code>.</p>
 *
 * @cssprop --button-container-shape - Defines the border radius of the button container shape.
 *
 * @cssprop --button-container-shape-start-start - Defines the start position of the button container shape.
 * @cssprop --button-container-shape-start-end - Defines the end position of the button container shape.
 * @cssprop --button-container-shape-end-start - Defines the start position of the button container shape.
 * @cssprop --button-container-shape-end-end - Defines the end position of the button container shape.
 *
 * @cssprop --button-container-padding - Inline padding of the button container, on both sides.
 * @cssprop --button-container-padding-start - Inline-start padding of the button container; overrides `--button-container-padding`.
 * @cssprop --button-container-padding-end - Inline-end padding of the button container; overrides `--button-container-padding`.
 *
 *
 * @cssprop --filled-button-container-color - Color of the filled button container.
 * @cssprop --filled-button-label-text-color - Text color of the filled button label.
 *
 * @cssprop --outlined-button-container-color - Color of the outlined button container.
 * @cssprop --outlined-button-label-text-color - Text color of the outlined button label.
 *
 * @cssprop --text-button-label-text-color - Text color of the text button label.
 *
 * @cssprop --tonal-button-container-color - Color of the tonal button container.
 * @cssprop --tonal-button-label-text-color - Text color of the tonal button label.
 *
 * @cssprop --elevated-button-container-color - Color of the elevated button container.
 * @cssprop --elevated-button-label-text-color - Text color of the elevated button label.
 *
 * @cssprop --neo-button-container-color - Color of the neo button container.
 * @cssprop --neo-button-label-text-color - Text color of the neo button label.
 *
 * @fires {MouseEvent} click - Dispatched when the button is clicked. Not dispatched while `loading`, `soft-disabled` or `skeleton`.
 * @fires {CustomEvent<{ selected: boolean }>} change - Dispatched by a `toggle` button after a click flips `selected`.
 *
 * @example
 * ```html
 * <wc-button>Button</wc-button>
 * ```
 * @tags display
 */
@IndividualComponent
export class Button extends mixinButtonLevel(
  mixinBaseButton(
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

  static override styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /**
   * When `true`, the icon is placed after the label (trailing).
   * When `false` (default), the icon is placed before the label (leading).
   */
  @property({ type: Boolean, reflect: true, attribute: 'trailing-icon' })
  trailingIcon = false;

  /**
   * Button size.
   * Possible values are `"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"`. Defaults to `"sm"`.
   */
  @property({ reflect: true }) size: ButtonSize = 'sm';

  /** Shape of the button container. */
  @property({ type: String, reflect: true }) shape: ButtonShape = 'square';

  /** When true, renders the button as a placeholder skeleton while the page loads. */
  @property({ type: Boolean, reflect: true }) skeleton: boolean = false;

  /**
   * When true, the button is busy: it shows a spinner in place of its icon (or before the label),
   * sets `aria-busy="true"` and ignores clicks, like `soft-disabled`.
   */
  @property({ type: Boolean, reflect: true }) loading: boolean = false;

  /**
   * When true, the button is a toggle button: it renders `aria-pressed`, flips `selected` on click
   * and fires `change`.
   */
  @property({ type: Boolean, reflect: true }) toggle: boolean = false;

  /** The pressed state of a `toggle` button. Has no effect without `toggle`. */
  @property({ type: Boolean, reflect: true }) selected: boolean = false;

  /** Optional tooltip text displayed on hover. */
  @property() tooltip?: string;

  // ── Queries ───────────────────────────────────────────────────────────────

  @query('.button') private readonly buttonElement!: HTMLElement | null;

  // ── Private fields ────────────────────────────────────────────────────────

  /** Cleanup returned by observerSlotChangesWithCallback for the icon slot. */
  private __iconSlotCleanup: (() => void) | null = null;

  /** Cleanup returned by observerSlotChangesWithCallback for the label slot. */
  private __labelSlotCleanup: (() => void) | null = null;

  // ── Constructor ───────────────────────────────────────────────────────────

  constructor() {
    super();
    this.addEventListener('click', this.__dispatchClickWithThrottle);
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  override disconnectedCallback() {
    // disconnect slot observers first to avoid callbacks during teardown
    try {
      this.__iconSlotCleanup?.();
    } catch (e) {
      /* ignore */
    }
    try {
      this.__labelSlotCleanup?.();
    } catch (e) {
      /* ignore */
    }

    super.disconnectedCallback();
  }

  override firstUpdated(changedProperties: Map<PropertyKey, unknown>) {
    super.firstUpdated(changedProperties);
    // Initialize slot presence tracking for smooth transitions when label/icon are added/removed
    const iconSlot = this.renderRoot.querySelector(
      'slot[name="icon"]',
    ) as HTMLSlotElement | null;
    const labelSlot = this.renderRoot.querySelector(
      'slot.label',
    ) as HTMLSlotElement | null;

    // Use MutationObserver-based helper so we react to content/character changes
    if (iconSlot) {
      this.__iconSlotCleanup = observerSlotChangesWithCallback(
        iconSlot,
        has => {
          this.toggleAttribute('has-icon', has);
        },
      );
    }

    if (labelSlot) {
      this.__labelSlotCleanup = observerSlotChangesWithCallback(
        labelSlot,
        has => {
          this.toggleAttribute('has-label', has);
        },
      );
    }
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
    // If the button is soft-disabled or loading, we need to explicitly prevent
    // the click from propagating to other event listeners as well as prevent
    // the default action.
    if (this.softDisabled || this.loading || this.skeleton) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return;
    }

    // Each activation reaches this listener once: either the inner button's
    // click bubbling out, or a click fired at the host and forwarded below.
    toggleButtonSelected(this);

    if (!isActivationClick(event) || !this.buttonElement) {
      return;
    }

    this.focus();
    dispatchActivationClick(this.buttonElement);
  };

  // ── Render helpers ────────────────────────────────────────────────────────

  renderButtonElement() {
    const cssClasses = {
      button: true,
      'native-button': true,
      'trailing-icon': this.trailingIcon,
    };

    // Needed for closure conformance
    const { ariaLabel, ariaHasPopup, ariaExpanded } = this as ARIAMixinStrict;

    return html`<button
      class=${classMap(cssClasses)}
      id="button"
      aria-label="${ariaLabel || nothing}"
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
      ${this.renderButtonContent()}
    </button>`;
  }

  renderButtonContent() {
    return html`${this.renderLoadingIndicator()}
      <slot class="icon-slot" name="icon"></slot>
      <slot class="label"></slot>
      <div class="touch"></div>

      ${this.renderDisabledReason(this.softDisabled)}`;
  }

  renderLoadingIndicator() {
    if (!this.loading) return nothing;
    return html`<wc-circular-progress
      class="loading-indicator"
      indeterminate
      aria-hidden="true"
    ></wc-circular-progress>`;
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

  // ── Render ────────────────────────────────────────────────────────────────

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

      ${this.renderButtonElement()} ${this.renderTooltip()}
    `;
  }
}
