import { html, LitElement, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { observerSlotChangesWithCallback } from '@/__internal/utils/observe-slot-change.js';
import {
  dispatchActivationClick,
  isActivationClick,
} from '@/__internal/utils/dispatch-event-utils.js';
import { isLink } from '@/__internal/utils/is-link.js';
import { throttle } from '@/__internal/utils/throttle.js';
import styles from './chip.scss';
import sizeStyles from './chip-sizes.scss';
import { spread } from '@/__internal/directive/spread.js';
import { DISABLED_REASON_ID } from '@/button/ButtonConstants.js';
import IndividualComponent from '@/IndividualComponent.js';
import { mixinBaseButton } from '@/button/base-button/base-button.js';
import { mixinHyperlink } from '@/__internal/mixins/hyperlink.js';
import { mixinDelegatesAria } from '@/__internal/aria/delegate.js';
import { mixinElementInternals } from '@/__internal/mixins/element-internals.js';

/**
 * @label Chip
 * @tag wc-chip
 * @rawTag chip
 * @summary Chip component for displaying compact information with optional actions.
 * @tags display
 *
 * @example
 * ```html
 * <wc-chip>Chip content</wc-chip>
 * ```
 */
@IndividualComponent
export class Chip extends mixinBaseButton(
  mixinHyperlink(mixinDelegatesAria(mixinElementInternals(LitElement))),
) {
  /** @nocollapse */ // eslint-disable-next-line
  static override shadowRootOptions: ShadowRootInit = {
    mode: 'open',
    delegatesFocus: true,
  };

  // Define styles (Lit handles Scoping via Shadow DOM by default)
  // You would typically import your tag.scss.js here or use the css tag
  static styles = [styles, sizeStyles];

  /** If true, the tag will have a close icon. */
  @property({ type: Boolean }) dismissible = false;

  /**
   * Additional ARIA attributes to pass to the inner button/anchor element.
   */
  @property({ reflect: true })
  configAria?: { [key: string]: any };

  /** True when the `icon` slot contains at least one node. */
  @state() private _hasIconSlotContent = false;

  /** When true, renders the chip in a loading skeleton state. */
  @property({ type: Boolean, reflect: true }) skeleton: boolean = false;

  /** When true, the chip is in the selected/pressed state. */
  @property({ type: Boolean, reflect: true }) selected: boolean = false;

  /**
   * Sets the delay for throttle in milliseconds. When null (default), no throttle is applied.
   */
  @property() throttleDelay?: number;

  /** Optional tooltip text displayed on hover. */
  @property() tooltip?: string;

  @query('.button') readonly buttonElement!: HTMLElement | null;

  constructor() {
    super();
    this.addEventListener('click', this.__dispatchClickWithThrottle);
  }

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
      return html`<wc-tooltip class="tooltip" for="button"
        >${this.tooltip}</wc-tooltip
      >`;
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
    if (typeof this.throttleDelay === 'number') {
      this.__dispatchClickWithThrottle = throttle(
        this.__dispatchClick,
        this.throttleDelay,
      );
    }
    observerSlotChangesWithCallback(
      this.renderRoot.querySelector('slot[name="icon"]'),
      hasContent => {
        this._hasIconSlotContent = hasContent;
        this.requestUpdate();
      },
    );
  }

  private _dismissClickHandler(e: MouseEvent) {
    e.stopPropagation();

    // Custom Event: tag--dismiss
    this.dispatchEvent(
      new CustomEvent('tag--dismiss', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _renderCloseButton() {
    if (!this.dismissible) return nothing;

    return html`
      <button
        class="close-btn"
        @click=${this._dismissClickHandler}
        aria-label="Dismiss"
      >
        <wc-icon class="close-btn-icon" name="close"></wc-icon>
      </button>
    `;
  }

  render() {
    return html`
      <wc-focus-ring class="focus-ring" for="button"></wc-focus-ring>
      <wc-elevation class="elevation"></wc-elevation>
      <div class="background"></div>
      <div class="outline"></div>
      <wc-ripple class="ripple" for="button"></wc-ripple>

      ${this.renderChipElement()} ${this.__renderTooltip()}
    `;
  }

  renderChipElement() {
    const cssClasses = {
      chip: true,
      button: true,
      selected: this.selected,
      dismissible: this.dismissible,
      'icon-slot-has-content': this._hasIconSlotContent,
    };

    if (!isLink(this)) {
      return html`<button
        class=${classMap(cssClasses)}
        id="button"
        aria-describedby=${ifDefined(
          this.softDisabled ? DISABLED_REASON_ID : undefined,
        )}
        ?aria-disabled=${this.softDisabled}
        ?disabled=${this.disabled}
        ${spread(this.configAria)}
      >
        ${this.renderChipContent()}
      </button>`;
    }
    return html`<a
      class=${classMap(cssClasses)}
      id="button"
      href=${this.href}
      target=${this.target}
      tabindex=${this.disabled ? '-1' : '0'}
      role="button"
      aria-describedby=${ifDefined(
        this.softDisabled ? DISABLED_REASON_ID : undefined,
      )}
      ?aria-disabled=${this.softDisabled}
      ${spread(this.configAria)}
    >
      ${this.renderChipContent()}
    </a>`;
  }

  renderChipContent() {
    return html`
      <div class="tag-content">
        <div class="icon-slot-container">
          ${this.selected
            ? html`<wc-icon class="selected-icon" name="check"></wc-icon>`
            : html`<slot name="icon"></slot>`}
        </div>
        <div class="label-container">
          <slot></slot>
        </div>
        ${this._renderCloseButton()}
      </div>
    `;
  }
}
