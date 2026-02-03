import { html, LitElement } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './button.scss';
import { observerSlotChangesWithCallback, throttle } from '../utils.js';

/**
 * @label Button
 * @tag p-button
 * @rawTag button
 *
 * @summary Buttons help people initiate actions, from sending an email, to sharing a document, to liking a post.
 * @overview
 * <p>Buttons are clickable elements that are used to trigger actions. They communicate calls to action to the user and allow users to interact with pages in a variety of ways. Button labels express what action will occur when the user interacts with it.</p>
 *
 * @cssprop --divider-color - Controls the color of the divider.
 * @cssprop --divider-padding - Controls the padding of the divider.
 *
 * @example
 * ```html
 * <pc-button>Button</pc-button>
 * ```
 * @tags display
 */
export class Button extends LitElement {
  static override styles = [styles];

  #id = crypto.randomUUID();

  #tabindex?: number = 0;

  @query('.button') private readonly buttonElement!: HTMLElement | null;

  @property({ type: String }) htmlType: 'button' | 'submit' | 'reset' =
    'button';

  /**
   * The visual style of the button.
   *
   *  Possible variant values:
   * `"filled"` is a filled button.
   * `"outlined"` is an outlined button.
   * `"text"` is a transparent button.
   * `"tonal"` is a light color button.
   *
   */
  @property() variant:
    | 'elevated'
    | 'filled'
    | 'tonal'
    | 'outlined'
    | 'text'
    | 'neo' = 'filled';

  /**
   * Button size.
   * Possible values are `"sm"`, `"md"`, `"lg"`. Defaults to `"md"`.
   */
  @property() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'sm';

  /**
   * If true, the user cannot interact with the button. Defaults to `false`.
   */
  @property({ reflect: true }) disabled: boolean = false;

  /**
   * If true, the user cannot interact with the button and the button is visually styled as disabled. But the button is still focusable. Defaults to `false`.
   */
  @property({ reflect: true }) softDisabled: boolean = false;

  /**
   * If button is disabled, the reason why it is disabled.
   */
  @property() disabledReason: string = '';

  /**
   * Defines the primary color of the button. This can be set to predefined color names to apply specific color themes.
   */
  @property({ reflect: true }) color:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'white'
    | 'black' = 'primary';

  /**
   * Icon alignment.
   * Possible values are `"start"`, `"end"`. Defaults to `"end"`.
   */
  @property() iconAlign: 'start' | 'end' = 'end';

  /**
   * Hyperlink to navigate to on click.
   */
  @property({ reflect: true }) href?: string;

  @property({ reflect: true }) configAria?: { [key: string]: any };

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
  private isPressed = false;

  @state()
  private slotHasContent = false;

  override focus() {
    this.buttonElement?.focus();
  }

  override blur() {
    this.buttonElement?.blur();
  }

  override connectedCallback() {
    super.connectedCallback();
    window.addEventListener('mouseup', this.__handlePress);
  }

  override disconnectedCallback() {
    window.removeEventListener('mouseup', this.__handlePress);
    super.disconnectedCallback();
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

  private __dispatchClickWithThrottle: (
    event: MouseEvent | KeyboardEvent,
  ) => void = event => {
    this.__dispatchClick(event);
  };

  __dispatchClick = (event: MouseEvent | KeyboardEvent) => {
    // If the button is soft-disabled or a disabled link, we need to explicitly
    // prevent the click from propagating to other event listeners as well as
    // prevent the default action.
    if (this.softDisabled || (this.disabled && this.href)) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return;
    }

    this.focus();
    this.dispatchEvent(
      new CustomEvent('button:click', {
        bubbles: true,
        composed: true,
      }),
    );
  };

  __renderDisabledReason() {
    if (this.disabled && this.disabledReason)
      return html`<div
        id="disabled-reason-${this.#id}"
        role="tooltip"
        aria-label=${this.disabledReason}
        class="sr-only"
      >
        {this.disabledReason}
      </div>`;
    return null;
  }

  __handlePress = (event: KeyboardEvent | MouseEvent) => {
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

  /* @ts-ignore */
  private __isLink() {
    return !!this.href;
  }

  override render() {
    const isLink = this.__isLink();
    const { variant, subVariant } = this.getVariant();

    const cssClasses = {
      button: true,
      'button-element': true,
      [`size-${this.size}`]: true,
      [`variant-${variant}`]: true,
      [`variant-${subVariant}`]: !!subVariant,
      [`color-${this.color}`]: true,
      disabled: this.disabled || this.softDisabled,
      pressed: this.isPressed,
      'has-content': this.slotHasContent,
    };

    if (!isLink) {
      return html`<button
        class=${classMap(cssClasses)}
        tabindex=${this.#tabindex}
        type=${this.htmlType}
        @click=${this.__dispatchClickWithThrottle}
        @mousedown=${this.__handlePress}
        @keydown=${this.__handlePress}
        @keyup=${this.__handlePress}
        ?aria-describedby=${(this.disabled || this.softDisabled) &&
        this.disabledReason
          ? `disabled-reason-${this.#id}`
          : null}
        aria-disabled=${`${this.disabled || this.softDisabled}`}
        ?disabled=${this.disabled}
      >
        ${this.renderButtonContent()}
      </button>`;
    }
    return html`<a
      class=${classMap(cssClasses)}
      tabindex=${this.#tabindex}
      href=${this.href}
      target=${this.target}
      @click=${this.__dispatchClickWithThrottle}
      @mousedown=${this.__handlePress}
      @keydown=${this.__handlePress}
      @keyup=${this.__handlePress}
      role="button"
      aria-describedby=${this.disabled && this.disabledReason
        ? `disabled-reason-${this.#id}`
        : null}
      aria-disabled=${`${this.disabled}`}
    >
      <div class="icon">
        <slot name="icon"></slot>
      </div>

      <div class="slot-container">
        <slot></slot>
      </div>
    </a>`;
  }

  getVariant() {
    const variants = this.variant?.split('.');
    if (!['filled', 'outlined', 'text', 'tonal', 'neo'].includes(variants[0])) {
      variants.unshift('filled');
    }
    const [variant, subVariant] = variants as [string, string?];
    return { variant, subVariant };
  }

  renderButtonContent() {
    return html`
      <p-focus-ring class="focus-ring" .control=${this}></p-focus-ring>
      <p-elevation class="elevation"></p-elevation>
      <div class="neo-background"></div>
      <div class="background"></div>
      <div class="outline"></div>
      <p-ripple class="ripple"></p-ripple>

      <div class="button-content">
        ${this.iconAlign === 'start'
          ? html`<slot name="icon"></slot></div>`
          : null}

        <div class="slot-container">
          <slot></slot>
        </div>

        ${this.iconAlign === 'end' ? html`<slot name="icon"></slot>` : null}
      </div>

      ${this.__renderDisabledReason()}
    `;
  }
}
