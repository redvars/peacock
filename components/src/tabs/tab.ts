import { html, LitElement, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import { dispatchActivationClick, isActivationClick } from '@/__utils/dispatch-event-utils.js';
import { observerSlotChangesWithCallback } from '@/__utils/observe-slot-change.js';
import { throttle } from '@/__utils/throttle.js';
import { spread } from '@/__directive/spread.js';

import styles from './tab.scss';
import type { Tabs } from './tabs.js';

/**
 * @label Tab
 * @tag wc-tab
 * @rawTag tab
 * @parentRawTag tabs
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
   * Sets the delay for throttle in milliseconds. Defaults to 200 milliseconds.
   */
  @property() throttleDelay = 200;

  @state() hasFocus = false;

  @state() slotHasContent = false;

  @state() slotHasIcon = false;

  @state() slotHasBadge = false;

   /**
     * States
     */
    @state()
    isPressed = false;

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
  }

  override firstUpdated() {
    this.__dispatchClickWithThrottle = throttle(
      this.__dispatchClick,
      this.throttleDelay,
    );
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

  __handlePress = (event: KeyboardEvent | MouseEvent) => {
    if (this.disabled) return;
    if (
      event instanceof KeyboardEvent &&
      event.type === 'keydown' &&
      (event.key === 'Enter' || event.key === ' ')
    ) {
      this.isPressed = true;
    } else if (event.type === 'mousedown') {
      this.isPressed = true;
    } else {
      this.isPressed = false;
    }
  };

  __isLink() {
    return !!this.href;
  }

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

    const isLink = this.__isLink();
    const variant = this.__getParentTabsVariant();

    const cssClasses = {
      tab: true,
      'tab-element': true,
      disabled: this.disabled,
      pressed: this.isPressed,
      active: this.active,
      [`variant-${variant}`]: true,
      'has-content': this.slotHasContent,
      'has-icon': this.slotHasIcon,
      'has-badge': this.slotHasBadge,
    };


    if (!isLink) {
          return html`<button
              class=${classMap(cssClasses)}
              tabindex="0"
              @mousedown=${this.__handlePress}
              @keydown=${this.__handlePress}
              @keyup=${this.__handlePress}
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
        @mousedown=${this.__handlePress}
        @keydown=${this.__handlePress}
        @keyup=${this.__handlePress}
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
      <wc-focus-ring class="focus-ring" .control=${this} .forElement=${this.tabElement}></wc-focus-ring>
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
      <wc-focus-ring class="focus-ring" .control=${this} .forElement=${this.tabElement}></wc-focus-ring>
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
      <wc-focus-ring class="focus-ring" .control=${this} .forElement=${this.tabElement}></wc-focus-ring>
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
