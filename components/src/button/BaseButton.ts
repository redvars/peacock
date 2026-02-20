import { html, LitElement } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { dispatchActivationClick, isActivationClick } from '../utils.js';

export class BaseButton extends LitElement {
  #id = crypto.randomUUID();

  @property({ type: String }) htmlType: 'button' | 'submit' | 'reset' =
    'button';

  /**
   * Type is preset of color and variant. Type will be only applied.
   *
   */
  @property({ type: String }) type?: 'primary' | 'secondary' | 'tertiary';

  /**
   * The visual style of the button.
   *
   *  Possible variant values:
   * `"filled"` is a filled button.
   * `"outlined"` is an outlined button.
   * `"text"` is a transparent button.
   * `"tonal"` is a light color button.
   * `"elevated"` is elevated button
   */
  @property() variant:
    | 'elevated'
    | 'filled'
    | 'tonal'
    | 'outlined'
    | 'text'
    | 'neo' = 'filled';

  /**
   * Defines the primary color of the button. This can be set to predefined color names to apply specific color themes.
   */
  @property({ reflect: true }) color:
    | 'primary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'light'
    | 'dark' = 'primary';

  /**
   * Button size.
   * Possible values are `"sm"`, `"md"`, `"lg"`. Defaults to `"md"`.
   */
  @property() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'sm';

  /**
   * If true, the user cannot interact with the button. Defaults to `false`.
   */
  @property({ type: Boolean, reflect: true })
  disabled: boolean = false;

  @property() skeleton: boolean = false;

  /**
   * If true, the user cannot interact with the button and the button is visually styled as disabled. But the button is still focusable. Defaults to `false`.
   */
  @property({ reflect: true, attribute: 'soft-disabled' })
  softDisabled: boolean = false;

  /**
   * If button is disabled, the reason why it is disabled.
   */
  @property({ attribute: 'disabled-reason' })
  disabledReason: string = '';

  /**
   * Hyperlink to navigate to on click.
   */
  @property({ reflect: true }) href?: string;

  @property({ reflect: true })
  configAria?: { [key: string]: any };

  /**
   * Sets or retrieves the window or frame at which to target content.
   */
  @property() target: string = '_self';

  @property() selected: boolean = false;

  /**
   * Sets the delay for throttle in milliseconds. Defaults to 200 milliseconds.
   */
  @property() throttleDelay = 200;

  /**
   * States
   */
  @state()
  isPressed = false;

  @query('.button') private readonly buttonElement!: HTMLElement | null;

  override focus() {
    this.buttonElement?.focus();
  }

  override blur() {
    this.buttonElement?.blur();
  }

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

  __isLink() {
    return !!this.href;
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

  __convertTypeToVariantAndColor() {
    if (this.type === 'primary') {
      this.color = 'primary';
      this.variant = 'filled';
    } else if (this.type === 'secondary') {
      this.color = 'dark';
      this.variant = 'outlined';
    } else if (this.type === 'tertiary') {
      this.color = 'primary';
      this.variant = 'text';
    } else if (this.type === 'danger') {
      this.color = 'danger';
      this.variant = 'filled';
    }
  }

  __getDisabledReasonID() {
    return this.disabled && this.disabledReason
      ? `disabled-reason-${this.#id}`
      : null;
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
    return null;
  }
}
