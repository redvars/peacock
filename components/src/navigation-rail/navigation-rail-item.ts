import { html, LitElement, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import {
  dispatchActivationClick,
  isActivationClick,
} from '@/__internal/utils/dispatch-event-utils.js';
import { observerSlotChangesWithCallback } from '@/__internal/utils/observe-slot-change.js';
import { throttle } from '@/__internal/utils/throttle.js';
import { isLink } from '@/__internal/utils/is-link.js';
import styles from './navigation-rail-item.scss';
import IndividualComponent from '@/IndividualComponent.js';

/**
 * @label Navigation Rail Item
 * @tag wc-navigation-rail-item
 * @rawTag navigation-rail-item
 *
 * @summary An individual item within a navigation rail.
 * @overview
 * <p>Navigation rail items display a destination with an icon and optional label.</p>
 *
 * @example
 * ```html
 * <wc-navigation-rail-item>
 *   <wc-icon slot="icon">home</wc-icon>
 *   Home
 * </wc-navigation-rail-item>
 * ```
 * @tags navigation
 */
@IndividualComponent
export class NavigationRailItem extends LitElement {
  #id = crypto.randomUUID();

  static styles = [styles];

  /** Whether this item is currently active/selected. */
  @property({ type: Boolean, reflect: true }) active = false;

  /** Whether this item is disabled. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Whether the parent rail is in collapsed mode (labels hidden). */
  @property({ type: Boolean, reflect: true }) collapsed = false;

  /** If provided, the item renders as a link. */
  @property({ reflect: true }) href?: string;

  /** Link target. */
  @property() target: string = '_self';

  /** Value used for identification when managing active state externally. */
  @property({ reflect: true }) value?: string;

  /** Reason the item is disabled (shown to screen readers). */
  @property({ attribute: 'disabled-reason' }) disabledReason: string = '';

  /** Sets the delay for throttle in milliseconds. When null (default), no throttle is applied. */
  @property({ type: Number }) throttleDelay: number | null = null;

  @state() private _hasLabel = false;

  @state() private _hasActiveIcon = false;

  @query('.item-element') readonly itemElement!: HTMLElement | null;

  constructor() {
    super();
    this.addEventListener('click', this.__dispatchClickWithThrottle);
  }

  override focus() {
    this.itemElement?.focus();
  }

  override blur() {
    this.itemElement?.blur();
  }

  override firstUpdated() {
    if (this.throttleDelay !== null) {
      this.__dispatchClickWithThrottle = throttle(
        this.__dispatchClick,
        this.throttleDelay,
      );
    }

    observerSlotChangesWithCallback(
      this.renderRoot.querySelector('slot.label'),
      hasContent => {
        this._hasLabel = hasContent;
        this.requestUpdate();
      },
    );

    observerSlotChangesWithCallback(
      this.renderRoot.querySelector('slot.active-icon-slot'),
      hasContent => {
        this._hasActiveIcon = hasContent;
        this.requestUpdate();
      },
    );
  }

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

    if (!isActivationClick(event) || !this.itemElement) {
      return;
    }

    this.focus();
    dispatchActivationClick(this.itemElement);
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

  __renderItemContent() {
    return html`
      <wc-focus-ring class="focus-ring" for="item"></wc-focus-ring>

      <div class="item-content">
        <div class="indicator">
          <wc-ripple class="ripple"></wc-ripple>
          <div class="icon-container">
            <slot name="active-icon" class="active-icon-slot"></slot>
            <slot name="icon" class="icon-slot"></slot>
          </div>
        </div>
        <div class="label ${this.collapsed ? 'hidden' : ''}"><slot></slot></div>
      </div>

      ${this.__renderDisabledReason()}
    `;
  }

  render() {
    const cssClasses = {
      item: true,
      'item-element': true,
      active: this.active,
      disabled: this.disabled,
      'has-label': this._hasLabel,
      'has-active-icon': this._hasActiveIcon,
    };

    if (!isLink(this)) {
      return html`<button
        id="item"
        class=${classMap(cssClasses)}
        ?disabled=${this.disabled}
        aria-disabled=${`${this.disabled}`}
        aria-current=${this.active ? 'page' : nothing}
        ?aria-describedby=${this.__getDisabledReasonID()}
      >
        ${this.__renderItemContent()}
      </button>`;
    }

    return html`<a
      id="item"
      class=${classMap(cssClasses)}
      href=${this.href}
      target=${this.target}
      aria-current=${this.active ? 'page' : nothing}
      aria-disabled=${`${this.disabled}`}
      ?aria-describedby=${this.__getDisabledReasonID()}
    >
      ${this.__renderItemContent()}
    </a>`;
  }
}
