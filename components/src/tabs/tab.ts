import { html, LitElement, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { dispatchActivationClick, isActivationClick } from 'src/utils/dispatch-event-utils.js';
import { observerSlotChangesWithCallback, throttle } from 'src/utils.js';
import { spread } from 'src/spread.js';
import styles from './tab.scss';

export class Tab extends LitElement {

  #id = crypto.randomUUID();

  static styles = [styles];

  @property({ type: Boolean, reflect: true }) active = false;
  
  @property({ type: Boolean, reflect: true }) disabled = false;

  @property({ type: String }) disabledReason = '';

  @property({ type: String }) icon?: string;

  @property({ type: String }) label?: string;

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

    const cssClasses = {
      tab: true,
      'tab-element': true,
      disabled: this.disabled,
      pressed: this.isPressed,
      active: this.active,
      'has-content': this.slotHasContent
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
              ${this.renderTabContent()}
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
        ${this.renderTabContent()}
      </a>`;
  }

  renderTabContent() {
    return html`
      <focus-ring class="focus-ring" .control=${this} element="tabElement"></focus-ring>
      <base-elevation class="elevation"></base-elevation>
      <div class="background"></div>
      <div class="outline"></div>
      <base-ripple class="ripple"></base-ripple>
      
      <div class="tab-content">
        <div class="slot-container">
          <slot></slot>
        </div>

        <slot name="icon"></slot>

        <div class="indicator"></div>
      </div>

      <div class="indicator"></div>

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
