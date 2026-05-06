import { LitElement, html, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
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

/**
 * @label Card
 * @tag wc-card
 * @rawTag card
 * @summary A Material 3 inspired card surface for grouping related content.
 * @cssprop --card-padding - Inner padding for the card container. Defaults to 1rem.
 * @cssprop --card-shape - Corner radius for the card container. Defaults to a large radius.
 * @cssprop --card-gap - Gap between slotted children.
 *
 * @example
 * ```html
 * <wc-card variant="outlined" style="padding-block: 1rem;">
 *   <wc-card-content>
 *     <h3 class="text-headline">Title</h3>
 *     <p class="text-body">Supportive text</p>
 *   </wc-card-content>
 * </wc-card>
 * ```
 */
@IndividualComponent
export class Card extends NativeHyperlinkMixin(LitElement) {
  static styles = [styles, colorStyles];

  #id = crypto.randomUUID();

  @property({ type: String, reflect: true })
  variant: CardVariant = 'elevated';

  @property({ type: Boolean, reflect: true })
  disabled: boolean = false;

  @property({ type: Boolean, reflect: true })
  actionable: boolean = false;

  /**
   * If button is disabled, the reason why it is disabled.
   */
  @property({ attribute: 'disabled-reason' })
  disabledReason: string = '';

  /**
   * Sets the delay for throttle in milliseconds. When null (default), no throttle is applied.
   */
  @property() throttleDelay?: number;

  /**
   * States
   */
  @state()
  private slotHasContent = false;

  @query('.card') readonly cardElement!: HTMLElement | null;

  #tabindex?: number = 0;

  constructor() {
    super();
    this.addEventListener('click', this.__dispatchClickWithThrottle);
  }

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
        this.requestUpdate();
      },
    );
  }

  __dispatchClickWithThrottle: (event: MouseEvent | KeyboardEvent) => void =
    event => {
      this.__dispatchClick(event);
    };

  __dispatchClick = (event: MouseEvent | KeyboardEvent) => {
    // If the button is soft-disabled or a disabled link, we need to explicitly
    // prevent the click from propagating to other event listeners as well as
    // prevent the default action.
    if (this.disabled && this.href) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return;
    }

    if (!isActivationClick(event) || !this.cardElement) {
      return;
    }

    this.focus();
    dispatchActivationClick(this.cardElement);
  };

  __getDisabledReasonID() {
    return this.disabled && this.disabledReason
      ? `disabled-reason-${this.#id}`
      : nothing;
  }

  __renderDisabledReason() {
    const disabledReasonID = this.__getDisabledReasonID();
    if (disabledReasonID)
      return html`<div
        id="disabled-reason-${this.#id}"
        role="tooltip"
        aria-label=${this.disabledReason}
        class="screen-reader-only"
      >
        ${this.disabledReason}
      </div>`;
    return nothing;
  }

  render() {
    const isLinkElement = isLink(this);
    const disableSlotTabbing = this.actionable || isLinkElement;

    return html`
      <wc-focus-ring class="focus-ring" for="card"></wc-focus-ring>
      <wc-elevation class="elevation"></wc-elevation>
      <div class="background"></div>
      <div class="outline"></div>
      <wc-ripple class="ripple" for="card"></wc-ripple>

      ${this.renderCardElement(isLinkElement, disableSlotTabbing)}
    `;
  }

  renderCardElement(isLinkElement: boolean, disableSlotTabbing: boolean) {
    const cssClasses = {
      card: true,
      'card-element': true,
      [`variant-${this.variant}`]: true,
      actionable: (this.actionable && !this.disabled) || isLinkElement,
      disabled: this.disabled,
      'has-content': this.slotHasContent,
    };

    if (!this.actionable && !isLinkElement) {
      return html`<div class=${classMap(cssClasses)} id="card">
        ${this.renderCardContent(disableSlotTabbing)}
      </div>`;
    }

    if (!isLinkElement) {
      return html`<button
        class=${classMap(cssClasses)}
        id="card"
        tabindex=${this.#tabindex}
        ?aria-describedby=${this.__getDisabledReasonID()}
        aria-disabled=${`${this.disabled}`}
        ?disabled=${this.disabled}
      >
        ${this.renderCardContent(disableSlotTabbing)}
      </button>`;
    }
    return html`<a
      class=${classMap(cssClasses)}
      id="card"
      tabindex=${this.#tabindex}
      href=${this.href}
      target=${this.target}
      role="button"
      ?aria-describedby=${this.__getDisabledReasonID()}
      aria-disabled=${`${this.disabled}`}
    >
      ${this.renderCardContent(disableSlotTabbing)}
    </a>`;
  }

  renderCardContent(disableSlotTabbing: boolean) {
    return html`
      <div class="card-content">
        <div class="slot-container" ?inert=${disableSlotTabbing}>
          <slot></slot>
        </div>
      </div>
    `;
  }
}
