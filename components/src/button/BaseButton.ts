import { html, LitElement, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { dispatchActivationClick, isActivationClick } from '../__utils/dispatch-event-utils.js';
import BaseHyperlinkMixin from '@/__mixins/BaseHyperlinkMixin.js';
import BaseButtonMixin from '@/__mixins/BaseButtonMixin.js';



export class BaseButton extends BaseButtonMixin(BaseHyperlinkMixin(LitElement)) {
  protected static readonly DISABLED_REASON_ID = 'disabled-reason';

  
  color?: string;

  variant?: string;

  @property({ type: Boolean, reflect: true }) skeleton: boolean = false;
  
  @property({ type: Boolean, reflect: true }) toggle: boolean = false;

  @property({ type: Boolean, reflect: true }) selected: boolean = false;

  /**
   * Sets the delay for throttle in milliseconds. Defaults to 200 milliseconds.
   */
  @property() throttleDelay = 200;

  @property() tooltip?: string;

  /**
   * States
   */
  @state()
  isPressed = false;

  @query('.button') readonly buttonElement!: HTMLElement | null;

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this.__dispatchClickWithThrottle);
    window.addEventListener('mouseup', this.__handlePress);
  }

  override disconnectedCallback() {
    window.removeEventListener('mouseup', this.__handlePress);
    this.removeEventListener('click', this.__dispatchClickWithThrottle);
    super.disconnectedCallback();
  }

  __handlePress = (event: KeyboardEvent | MouseEvent) => {
    if (this.disabled || this.skeleton || this.softDisabled) return;
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

    if (this.toggle) {
      this.selected = !this.selected;
    }

    this.focus();
    dispatchActivationClick(this.buttonElement);
  };

  

  __renderDisabledReason(softDisabled: boolean) {
    if (softDisabled)
      return html`<div
        id=${BaseButton.DISABLED_REASON_ID}
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
      return html`<wc-tooltip for="button">${this.tooltip}</wc-tooltip>`;
    }
    return nothing;
  }
}
