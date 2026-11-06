import { LitElement, html, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import {
  dispatchActivationClick,
  isActivationClick,
} from '../__internal/utils/dispatch-event-utils.js';
import { isLink } from '@/__internal/utils/is-link.js';
import { observerSlotChangesWithCallback } from '@/__internal/utils/observe-slot-change.js';
import { throttle } from '@/__internal/utils/throttle.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './card.scss';
import colorStyles from './card-colors.scss';
import NativeHyperlinkMixin from '@/__internal/mixins/NativeHyperlinkMixin.js';

type CardVariant = 'elevated' | 'filled' | 'outlined';

const DISABLED_REASON_ID = 'disabled-reason';

/**
 * @label Card
 * @tag wc-card
 * @rawTag card
 * @summary A surface that groups content and actions about one subject. Set `actionable` to make the whole card a button, or `href` to make it a link.
 * @cssprop --card-container-shape - Corner radius of the card. Defaults to `--shape-corner-large`.
 * @cssprop --card-padding - Padding inside the card, around its children. Defaults to 0; `wc-card-content` adds its own padding.
 * @cssprop --card-gap - Gap between the card's children. Defaults to 0.
 *
 * @example
 * ```html
 * <wc-card variant="outlined">
 *   <wc-card-content>
 *     <h3 class="text-title-large">Title</h3>
 *     <p class="text-body-medium">Supporting text</p>
 *   </wc-card-content>
 * </wc-card>
 * ```
 */
@IndividualComponent
export class Card extends NativeHyperlinkMixin(LitElement) {
  // ── Static ────────────────────────────────────────────────────────────────

  static styles = [styles, colorStyles];

  // ── Properties ────────────────────────────────────────────────────────────

  /**
   * Visual style of the card: `elevated` (a raised surface with a shadow), `filled` (a tonal surface)
   * or `outlined` (a bordered surface). Defaults to `elevated`.
   */
  @property({ type: String, reflect: true })
  variant: CardVariant = 'elevated';

  /**
   * Dims the card and makes its content inert. An actionable or link card also stops responding
   * to clicks and leaves the tab order, unless `disabled-reason` is set.
   */
  @property({ type: Boolean, reflect: true })
  disabled: boolean = false;

  /**
   * Makes the whole card a single button that fires `click`. Its content becomes inert, so don't
   * put buttons or links inside an actionable card.
   */
  @property({ type: Boolean, reflect: true })
  actionable: boolean = false;

  /**
   * Why an actionable or link card is disabled. The card stays focusable and screen readers read
   * the reason with it.
   */
  @property({ attribute: 'disabled-reason' })
  disabledReason: string = '';

  /**
   * Delay in milliseconds for throttling activation of an actionable or link card. When unset
   * (default), no throttle is applied.
   */
  @property({ type: Number, attribute: 'throttle-delay' })
  throttleDelay?: number;

  /** Whether the default slot holds meaningful content. */
  @state()
  private slotHasContent = false;

  // ── Queries ───────────────────────────────────────────────────────────────

  @query('.card') readonly cardElement!: HTMLElement | null;

  // ── Constructor ───────────────────────────────────────────────────────────

  constructor() {
    super();
    // Look the handler up on every click, so the throttled version set in
    // firstUpdated() is the one that runs.
    this.addEventListener('click', event => this.__handleClick(event));
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  override firstUpdated() {
    if (typeof this.throttleDelay === 'number') {
      this.__dispatchClickWithThrottle = throttle(
        this.__dispatchClick,
        this.throttleDelay,
      );
    }
    observerSlotChangesWithCallback(
      this.renderRoot.querySelector('slot'),
      hasContent => {
        this.slotHasContent = hasContent;
      },
    );
  }

  // ── Private methods ───────────────────────────────────────────────────────

  __handleClick(event: MouseEvent | KeyboardEvent) {
    // A disabled card never activates, and consumer click listeners on it never run.
    if (this.disabled) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return;
    }
    this.__dispatchClickWithThrottle(event);
  }

  __dispatchClickWithThrottle: (event: MouseEvent | KeyboardEvent) => void =
    event => {
      this.__dispatchClick(event);
    };

  __dispatchClick = (event: MouseEvent | KeyboardEvent) => {
    if (!isActivationClick(event) || !this.cardElement) {
      return;
    }

    this.focus();
    dispatchActivationClick(this.cardElement);
  };

  /** True when a disabled interactive card should stay focusable to expose its reason. */
  __isSoftDisabled() {
    return this.disabled && !!this.disabledReason;
  }

  __getDisabledReasonID() {
    return this.__isSoftDisabled() ? DISABLED_REASON_ID : undefined;
  }

  // ── Render helpers ────────────────────────────────────────────────────────

  renderDisabledReason() {
    if (!this.__isSoftDisabled()) return nothing;
    return html`<div
      id=${DISABLED_REASON_ID}
      role="tooltip"
      aria-label=${this.disabledReason}
      class="screen-reader-only"
    >
      ${this.disabledReason}
    </div>`;
  }

  renderCardElement(isLinkElement: boolean) {
    const interactive = this.actionable || isLinkElement;
    const cssClasses = {
      card: true,
      'card-element': true,
      [`variant-${this.variant}`]: true,
      actionable: interactive && !this.disabled,
      disabled: this.disabled,
      'has-content': this.slotHasContent,
    };
    const inertContent = interactive || this.disabled;

    if (!interactive) {
      return html`<div class=${classMap(cssClasses)} id="card">
        ${this.renderCardContent(inertContent)}
      </div>`;
    }

    const softDisabled = this.__isSoftDisabled();
    const removedFromTabOrder = this.disabled && !softDisabled;

    if (!isLinkElement) {
      return html`<button
        class=${classMap(cssClasses)}
        id="card"
        type="button"
        aria-describedby=${ifDefined(this.__getDisabledReasonID())}
        aria-disabled=${ifDefined(this.disabled ? 'true' : undefined)}
        ?disabled=${removedFromTabOrder}
      >
        ${this.renderCardContent(inertContent)} ${this.renderDisabledReason()}
      </button>`;
    }

    return html`<a
      class=${classMap(cssClasses)}
      id="card"
      href=${ifDefined(this.disabled ? undefined : this.href)}
      target=${ifDefined(this.disabled ? undefined : this.target)}
      rel=${ifDefined(this.disabled ? undefined : this.rel)}
      download=${ifDefined(this.disabled ? undefined : this.download)}
      role=${ifDefined(this.disabled ? 'link' : undefined)}
      tabindex=${removedFromTabOrder ? '-1' : '0'}
      aria-describedby=${ifDefined(this.__getDisabledReasonID())}
      aria-disabled=${ifDefined(this.disabled ? 'true' : undefined)}
    >
      ${this.renderCardContent(inertContent)} ${this.renderDisabledReason()}
    </a>`;
  }

  renderCardContent(inertContent: boolean) {
    return html`
      <div class="card-content">
        <div class="slot-container" ?inert=${inertContent}>
          <slot></slot>
        </div>
      </div>
    `;
  }

  // ── Render ────────────────────────────────────────────────────────────────

  render() {
    return html`
      <wc-focus-ring class="focus-ring" for="card"></wc-focus-ring>
      <wc-elevation class="elevation"></wc-elevation>
      <div class="background"></div>
      <div class="outline"></div>
      <wc-ripple class="ripple" for="card"></wc-ripple>

      ${this.renderCardElement(isLink(this))}
    `;
  }
}
