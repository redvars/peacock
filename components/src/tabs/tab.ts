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
import { spread } from '@/__internal/directive/spread.js';

import styles from './tab.scss';
import type { Tabs } from './tabs.js';
import IndividualComponent from '@/IndividualComponent.js';

/**
 * @label Tab
 * @tag wc-tab
 * @rawTag tab
 *
 * @summary A tab component for use within tabs.
 * @overview
 * <p>Tab represents an individual tab in a tabs component.</p>
 *
 * @example
 * ```html
 * <wc-tab>Tab Label</wc-tab>
 * ```
 * @tags navigation
 */
@IndividualComponent
export class Tab extends LitElement {
  #id = crypto.randomUUID();

  static styles = [styles];

  @property({ type: Boolean, reflect: true }) active = false;

  @property({ type: Boolean, reflect: true }) disabled = false;

  @property({ type: String }) disabledReason = '';

  @property({ type: String }) value?: string;

  @property({ reflect: true })
  configAria?: { [key: string]: any };

  /**
   * Sets or retrieves the window or frame at which to target content.
   */
  @property() target: string = '_self';

  @property({ type: String, reflect: true }) href?: string;

  /**
   * Sets the delay for throttle in milliseconds. When null (default), no throttle is applied.
   */
  @property() throttleDelay?: number;

  @state() hasFocus = false;

  @state() slotHasContent = false;

  @state() slotHasIcon = false;

  @state() slotHasBadge = false;

  private _tabindex = 0;

  @query('.tab-element') readonly tabElement!: HTMLElement | null;

  override focus() {
    this.tabElement?.focus();
  }

  override blur() {
    this.tabElement?.blur();
  }

  constructor() {
    super();
    this._tabindex = 0;
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
      this.renderRoot.querySelector('slot:not([name])'),
      hasContent => {
        this.slotHasContent = hasContent;
        this.requestUpdate();
      },
    );

    observerSlotChangesWithCallback(
      this.renderRoot.querySelector('slot[name="icon"]'),
      hasContent => {
        this.slotHasIcon = hasContent;
        this.requestUpdate();
      },
    );

    observerSlotChangesWithCallback(
      this.renderRoot.querySelector('slot[name="badge"]'),
      hasContent => {
        this.slotHasBadge = hasContent;
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

    if (!isActivationClick(event) || !this.tabElement) {
      return;
    }

    this.focus();
    dispatchActivationClick(this.tabElement);
  };

  __getParentTabsVariant(): Tabs['variant'] {
    return (this.closest('wc-tabs') as Tabs | null)?.variant ?? 'primary';
  }

  // private handleKeyDown(evt: KeyboardEvent) {
  //   if (this.disabled || this.showLoader) return;
  //   if (evt.key === 'Enter' || evt.key === ' ') {
  //     evt.preventDefault();
  //     this.isActive = true;
  //     this.dispatchTabClick();
  //   }
  // }

  render() {
    const variant = this.__getParentTabsVariant();

    const cssClasses = {
      tab: true,
      'tab-element': true,
      disabled: this.disabled,
      active: this.active,
      [`variant-${variant}`]: true,
      'has-content': this.slotHasContent,
      'has-icon': this.slotHasIcon,
      'has-badge': this.slotHasBadge,
    };

    if (!isLink(this)) {
      return html`<button
        id="button"
        class=${classMap(cssClasses)}
        tabindex="0"
        ?aria-describedby=${this.__getDisabledReasonID()}
        aria-disabled=${`${this.disabled}`}
        ?disabled=${this.disabled}
        ${spread(this.configAria)}
      >
        ${this.renderTabContent(variant)}
      </button>`;
    }

    return html`<a
      class=${classMap(cssClasses)}
      id="button"
      tabindex="0"
      href=${this.href}
      target=${this.target}
      role="button"
      ?aria-describedby=${this.__getDisabledReasonID()}
      aria-disabled=${`${this.disabled}`}
      ${spread(this.configAria)}
    >
      ${this.renderTabContent(variant)}
    </a>`;
  }

  renderTabContent(variant: Tabs['variant']) {
    switch (variant) {
      case 'secondary':
        return this.renderSecondaryTabContent();
      case 'contained':
        return this.renderContainedTabContent();
      case 'filled':
        return this.renderFilledTabContent();
      case 'primary':
      default:
        return this.renderPrimaryTabContent();
    }
  }

  renderPrimaryTabContent() {
    return html`
      <wc-focus-ring class="focus-ring" for="button"></wc-focus-ring>
      <wc-elevation class="elevation"></wc-elevation>
      <div class="background"></div>
      <div class="outline"></div>
      <wc-ripple class="ripple"></wc-ripple>

      <div class="tab-content">
        <div class="icon-section">
          <slot name="badge"></slot>
          <slot name="icon"></slot>
        </div>
        <div class="slot-container">
          <slot></slot>
        </div>

        <div class="indicator"></div>
      </div>

      ${this.__renderDisabledReason()}
    `;
  }

  renderSecondaryTabContent() {
    return html`
      <wc-focus-ring class="focus-ring" for="button"></wc-focus-ring>
      <wc-elevation class="elevation"></wc-elevation>
      <div class="background"></div>
      <div class="outline"></div>
      <wc-ripple class="ripple"></wc-ripple>

      <div class="tab-content">
        <slot name="icon"></slot>

        <div class="slot-container">
          <slot></slot>
        </div>

        <slot name="badge"></slot>
      </div>

      <div class="indicator"></div>

      ${this.__renderDisabledReason()}
    `;
  }

  renderContainedTabContent() {
    return this.renderSegmentedTabContent();
  }

  renderFilledTabContent() {
    return this.renderSegmentedTabContent();
  }

  renderSegmentedTabContent() {
    return html`
      <wc-focus-ring class="focus-ring" for="button"></wc-focus-ring>
      <wc-elevation class="elevation"></wc-elevation>
      <div class="background"></div>
      <div class="outline"></div>
      <wc-ripple class="ripple"></wc-ripple>

      <div class="tab-content">
        <slot name="icon"></slot>

        <div class="slot-container">
          <slot></slot>
        </div>

        <slot name="badge"></slot>
      </div>

      ${this.__renderDisabledReason()}
    `;
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
        {this.disabledReason}
      </div>`;
    return nothing;
  }
}
