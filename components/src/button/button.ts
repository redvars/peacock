import { html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
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
  static styles = [styles];

  #id = crypto.randomUUID();

  #tabindex?: number = 0;

  // @ts-ignore
  private __handleClickWithThrottle: (
    event: MouseEvent | KeyboardEvent,
  ) => void;

  @property({ type: Boolean }) htmlType: 'button' | 'submit' | 'reset' =
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

  /**
   * If true, the button will be in a toggled state.
   */
  @property() toggle: boolean = false;

  /**
   * Sets the delay for throttle in milliseconds. Defaults to 200 milliseconds.
   */
  @property() throttleDelay = 200;

  /**
   * The `appendData` property allows you to attach additional data to the button component. This data can be of any type, making it versatile for various use cases. It's particularly useful for passing extra context or information that can be accessed in event handlers or other component logic.
   */
  @property() appendData: any;

  /**
   * States
   */
  @state()
  private hasFocus = false;

  @state()
  private isActive = false;

  @state()
  private slotHasContent = false;

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('mouseup', this.#onMouseUp);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('mouseup', this.#onMouseUp);
  }

  firstUpdated() {
    this.__handleClickWithThrottle = throttle(
      this.__handleClick,
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

  // eslint-disable-next-line class-methods-use-this
  __handleClick = (evt: MouseEvent | KeyboardEvent) => {
    evt.preventDefault();
    if (this.disabled) return;
    this.dispatchEvent(
      new CustomEvent('button-click', {
        bubbles: true,
        composed: true,
        detail: {
          appendData: this.appendData,
        },
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

  __setFocus = (flag: boolean) => {
    this.hasFocus = flag;
  };

  #onMouseUp = () => {
    if (this.isActive && !this.toggle) this.isActive = false;
  };

  #onMouseDown = () => {
    this.isActive = this.toggle ? !this.isActive : true;
  };

  #onKeyDown = (evt: KeyboardEvent) => {
    if (evt.key === 'Enter' || evt.key === ' ') {
      if (!this.href) {
        evt.preventDefault();
        this.isActive = this.toggle ? !this.isActive : true;
        this.__handleClickWithThrottle(evt);
      } else {
        evt.preventDefault();
        this.isActive = true;
        this.__handleClickWithThrottle(evt);
        window.open(this.href, this.target);
      }
    }
  };

  #onKeyUp = (evt: KeyboardEvent) => {
    if (!this.disabled && !this.toggle) {
      if (evt.key === 'Enter' || evt.key === ' ') {
        this.isActive = false;
      }
    }
  };

  private __isLink() {
    return !!this.href;
  }

  render() {
    // const isLink = this.__isLink();
    const { variant, subVariant } = this.getVariant();

    return html`<button
      class=${classMap({
        button: true,
        'native-button': true,
        [`size-${this.size}`]: true,
        [`variant-${variant}`]: true,
        [`variant-${subVariant}`]: !!subVariant,
        [`color-${this.color}`]: true,
        disabled: this.disabled,
        focus: this.hasFocus,
        active: this.isActive,
        'has-content': this.slotHasContent,
      })}
      tabindex=${this.#tabindex}
      type=${this.htmlType}
      @blur=${() => this.__setFocus(false)}
      @focus=${() => this.__setFocus(true)}
      @click=${this.__handleClickWithThrottle}
      @mousedown=${() => this.#onMouseDown()}
      onKeyDown=${(evt: KeyboardEvent) => this.#onKeyDown(evt)}
      onKeyUp=${(evt: KeyboardEvent) => this.#onKeyUp(evt)}
      aria-describedby=${this.disabled && this.disabledReason
        ? `disabled-reason-${this.#id}`
        : null}
      aria-disabled=${`${this.disabled}`}
    >
      ${this.renderButtonContent()}
    </button>`;
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
      <div class="outline"></div>
      <p-elevation class="elevation"></p-elevation>
      <div class="neo-background"></div>
      <div class="background"></div>
      <div class="state-background"></div>

      <div class="button-content">
        ${this.iconAlign === 'start' ? html`<slot name="icon"></slot>` : null}

        <div class="slot-container">
          <slot></slot>
        </div>

        ${this.iconAlign === 'end' ? html`<slot name="icon"></slot>` : null}
      </div>

      ${this.__renderDisabledReason()}
    `;
  }

  renderLink() {
    // {...this.configAria}

    return html`<a
      class="native-element native-link"
      tabindex=${this.#tabindex}
      href=${this.href}
      target=${this.target}
      @blur=${() => this.__setFocus(false)}
      @focus=${() => this.__setFocus(true)}
      @click=${this.__handleClickWithThrottle}
      onMouseDown=${() => this.#onMouseDown()}
      onKeyDown=${(evt: KeyboardEvent) => this.#onKeyDown(evt)}
      onKeyUp=${(evt: KeyboardEvent) => this.#onKeyUp(evt)}
      role="button"
      aria-describedby=${this.disabled && this.disabledReason
        ? `disabled-reason-${this.#id}`
        : null}
      aria-disabled=${`${this.disabled}`}
    >
      ${this.iconAlign === 'start' ? html`<slot name="icon"></slot>` : null}

      <div class="slot-container">
        <slot></slot>
      </div>

      ${this.iconAlign === 'end' ? html`<slot name="icon"></slot>` : null}
    </a>`;
  }
}
