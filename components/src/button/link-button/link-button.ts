import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, query } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { when } from 'lit/directives/when.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './link-button.scss';

import type { ButtonShape, ButtonSize } from '@/button/ButtonTypes.js';
import { observerSlotChangesWithCallback } from '@/__internal/utils/observe-slot-change.js';
import {
  dispatchActivationClick,
  isActivationClick,
} from '@/__internal/utils/dispatch-event-utils.js';
import { DISABLED_REASON_ID } from '@/button/ButtonConstants.js';
import { mixinDelegatesAria } from '@/__internal/aria/delegate.js';
import { ARIAMixinStrict } from '@/__internal/aria/aria.js';
import { mixinElementInternals } from '@/__internal/mixins/element-internals.js';
import { mixinHyperlink } from '@/__internal/mixins/hyperlink.js';
import {
  mixinBaseButton,
  mixinButtonLevel,
} from '../base-button/base-button.js';

/**
 * @label Link Button
 * @tag wc-link-button
 * @rawTag link-button
 *
 * @summary A link that looks like a button, for navigation that should read as a call to action.
 * @overview
 * <p>The link button renders a native <code>&lt;a&gt;</code> with the button's look: the same <code>variant</code>, <code>color</code>, <code>level</code>, <code>size</code>, <code>shape</code> and icon slot as <code>wc-button</code>. Use it when activating the control navigates (<code>href</code>, <code>target</code>, <code>rel</code>, <code>download</code>); use <code>wc-button</code> when it performs an action or submits a form.</p>
 * @cssprop --button-container-shape - Defines the border radius of the button container shape.
 * @cssprop --filled-button-container-color - Color of the filled button container.
 * @cssprop --filled-button-label-text-color - Text color of the filled button label.
 * @cssprop --outlined-button-label-text-color - Text color of the outlined button label.
 * @cssprop --text-button-label-text-color - Text color of the text button label.
 * @cssprop --tonal-button-container-color - Color of the tonal button container.
 * @cssprop --tonal-button-label-text-color - Text color of the tonal button label.
 *
 * @fires {MouseEvent} click - Dispatched when the link is clicked. Not dispatched while `disabled`, `soft-disabled` or `skeleton`.
 *
 * @example
 * ```html
 * <wc-link-button href="/docs">Read the docs</wc-link-button>
 * ```
 * @tags display
 */
@IndividualComponent
export class LinkButton extends mixinButtonLevel(
  mixinBaseButton(
    mixinHyperlink(mixinDelegatesAria(mixinElementInternals(LitElement))),
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

  /** When true, renders the link as a placeholder skeleton while the page loads. */
  @property({ type: Boolean, reflect: true }) skeleton: boolean = false;

  /** Optional tooltip text displayed on hover. */
  @property() tooltip?: string;

  // ── Queries ───────────────────────────────────────────────────────────────

  @query('.button') private readonly linkElement!: HTMLElement | null;

  // ── Private fields ────────────────────────────────────────────────────────

  private __iconSlotCleanup: (() => void) | null = null;

  private __labelSlotCleanup: (() => void) | null = null;

  // ── Constructor ───────────────────────────────────────────────────────────

  constructor() {
    super();
    this.addEventListener('click', this.__dispatchClickWithThrottle);
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  override disconnectedCallback() {
    this.__iconSlotCleanup?.();
    this.__labelSlotCleanup?.();
    this.__iconSlotCleanup = null;
    this.__labelSlotCleanup = null;
    super.disconnectedCallback();
  }

  override firstUpdated(changedProperties: PropertyValues<this>) {
    super.firstUpdated(changedProperties);
    const iconSlot =
      this.renderRoot.querySelector<HTMLSlotElement>('slot[name="icon"]');
    const labelSlot =
      this.renderRoot.querySelector<HTMLSlotElement>('slot.label');
    if (iconSlot) {
      this.__iconSlotCleanup = observerSlotChangesWithCallback(iconSlot, has =>
        this.toggleAttribute('has-icon', has),
      );
    }
    if (labelSlot) {
      this.__labelSlotCleanup = observerSlotChangesWithCallback(
        labelSlot,
        has => this.toggleAttribute('has-label', has),
      );
    }
  }

  // ── Public methods ────────────────────────────────────────────────────────

  override focus() {
    this.linkElement?.focus();
  }

  override blur() {
    this.linkElement?.blur();
  }

  // ── Private methods ───────────────────────────────────────────────────────

  __dispatchClick = (event: MouseEvent | KeyboardEvent) => {
    // A link has no native disabled state, so a disabled, soft-disabled or
    // skeleton link swallows the click and stops the navigation.
    if (this.disabled || this.softDisabled || this.skeleton) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return;
    }

    if (!isActivationClick(event) || !this.linkElement) {
      return;
    }

    this.focus();
    dispatchActivationClick(this.linkElement);
  };

  // ── Render helpers ────────────────────────────────────────────────────────

  renderDisabledReason() {
    if (!this.softDisabled) return nothing;
    return html`<div
      id=${DISABLED_REASON_ID}
      role="tooltip"
      aria-label=${this.disabledReason}
      class="screen-reader-only"
    >
      ${this.disabledReason}
    </div>`;
  }

  renderTooltip() {
    if (!this.tooltip) return nothing;
    return html`<wc-tooltip class="tooltip" for="link"
      >${this.tooltip}</wc-tooltip
    >`;
  }

  // ── Render ────────────────────────────────────────────────────────────────

  override render() {
    const { ariaLabel, ariaHasPopup, ariaExpanded } = this as ARIAMixinStrict;
    const inert = this.disabled || this.softDisabled;

    return html`
      <wc-focus-ring class="focus-ring" for="link"></wc-focus-ring>
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
      <wc-ripple class="ripple" for="link"></wc-ripple>
      <wc-skeleton class="skeleton"></wc-skeleton>

      <a
        class="button native-link"
        id="link"
        href=${ifDefined(this.href)}
        target=${this.target || nothing}
        rel=${this.rel || nothing}
        download=${this.download || nothing}
        tabindex=${this.disabled ? '-1' : nothing}
        aria-label=${ariaLabel || nothing}
        aria-haspopup=${ariaHasPopup || nothing}
        aria-expanded=${ariaExpanded || nothing}
        aria-describedby=${ifDefined(
          this.softDisabled ? DISABLED_REASON_ID : undefined,
        )}
        aria-disabled=${inert ? 'true' : nothing}
      >
        <slot class="icon-slot" name="icon"></slot>
        <slot class="label"></slot>
        <div class="touch"></div>
        ${this.renderDisabledReason()}
      </a>
      ${this.renderTooltip()}
    `;
  }
}
