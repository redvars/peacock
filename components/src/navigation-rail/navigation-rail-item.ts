import { html, LitElement, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { dispatchActivationClick, isActivationClick } from '@/__utils/dispatch-event-utils.js';
import { observerSlotChangesWithCallback } from '@/__utils/observe-slot-change.js';
import { throttle } from '@/__utils/throttle.js';
import styles from './navigation-rail-item.scss';

/**
 * @label Navigation Rail Item
 * @tag wc-navigation-rail-item
 * @rawTag navigation-rail-item
 * @parentRawTag navigation-rail
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

  /** Sets the delay for throttle in milliseconds. Defaults to 200 milliseconds. */
  @property({ type: Number }) throttleDelay = 200;

  @state() private _isPressed = false;

  @state() private _hasLabel = false;

  @state() private _hasActiveIcon = false;

  @query('.item-element') readonly itemElement!: HTMLElement | null;

  override focus() {
    this.itemElement?.focus();
  }

  override blur() {
    this.itemElement?.blur();
  }

  override firstUpdated() {
    this.__dispatchClickWithThrottle = throttle(
      this.__dispatchClick,
      this.throttleDelay,
    );

    observerSlotChangesWithCallback(
      this.renderRoot.querySelector('slot:not([name])'),
      hasContent => {
        this._hasLabel = hasContent;
        this.requestUpdate();
      },
    );

    observerSlotChangesWithCallback(
      this.renderRoot.querySelector('slot[name="active-icon"]'),
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

  __handlePress = (event: KeyboardEvent | MouseEvent) => {
    if (this.disabled) return;
    if (
      event instanceof KeyboardEvent &&
      event.type === 'keydown' &&
      (event.key === 'Enter' || event.key === ' ')
    ) {
      this._isPressed = true;
    } else if (event.type === 'mousedown') {
      this._isPressed = true;
    } else {
      this._isPressed = false;
    }
  };

  __isLink() {
    return !!this.href;
  }

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
      <wc-focus-ring class="focus-ring" for='item'></wc-focus-ring>

      <div class="item-content">
        <div class="indicator">
          <wc-ripple class="ripple"></wc-ripple>
          <div class="icon-container">
            <slot name="active-icon" class="active-icon-slot"></slot>
            <slot name="icon" class="icon-slot"></slot>
          </div>
        </div>
        ${this._hasLabel && !this.collapsed
          ? html`<div class="label"><slot></slot></div>`
          : html`<slot class="hidden-slot"></slot>`}
      </div>

      ${this.__renderDisabledReason()}
    `;
  }

  render() {
    const isLink = this.__isLink();

    const cssClasses = {
      item: true,
      'item-element': true,
      active: this.active,
      disabled: this.disabled,
      pressed: this._isPressed,
      'has-label': this._hasLabel,
      'has-active-icon': this._hasActiveIcon,
    };

    if (!isLink) {
      return html`<button
        id="item"
        class=${classMap(cssClasses)}
        ?disabled=${this.disabled}
        aria-disabled=${`${this.disabled}`}
        aria-current=${this.active ? 'page' : nothing}
        ?aria-describedby=${this.__getDisabledReasonID()}
        @click=${this.__dispatchClickWithThrottle}
        @mousedown=${this.__handlePress}
        @keydown=${this.__handlePress}
        @keyup=${this.__handlePress}
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
      @click=${this.__dispatchClickWithThrottle}
      @mousedown=${this.__handlePress}
      @keydown=${this.__handlePress}
      @keyup=${this.__handlePress}
    >
      ${this.__renderItemContent()}
    </a>`;
  }
}
