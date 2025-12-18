import {
  Component,
  ComponentInterface,
  Element,
  Event,
  EventEmitter,
  h,
  Host,
  Listen,
  Method,
  Prop,
  State,
} from '@stencil/core';

import { getComponentIndex, hasSlot, throttle } from '../../utils/utils';

//@ts-ignore
const PREDEFINED_BUTTON_COLORS = [
  'primary',
  'secondary',
  'success',
  'info',
  'warning',
  'error',
  'white',
  'black',
  'danger',
];

/**
 * @label Button
 * @name button
 * @description Buttons help people initiate actions, from sending an email, to sharing a document, to liking a post.
 * @overview
 *  <p>Buttons are clickable elements that are used to trigger actions. They communicate calls to action to the user and allow users to interact with pages in a variety of ways. Button labels express what action will occur when the user interacts with it.</p>
 * @category Buttons
 * @tags controls
 * @example <pc-button>
 *   Button
 * </pc-button>
 */
@Component({
  tag: 'pc-button',
  styleUrl: 'button.scss',
  shadow: true,
})
export class Button implements ComponentInterface {
  @Element() host!: HTMLElement;

  private gid: string = getComponentIndex();
  private nativeElement: HTMLButtonElement;
  private tabindex?: string | number;
  private handleClickWithThrottle: () => void;

  /**
   *  Button type based on which actions are performed when the button is clicked.
   */
  @Prop({ reflect: true }) type: 'button' | 'submit' | 'reset' = 'button';

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
  @Prop() variant:
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
  @Prop() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'sm';

  /**
   * If true, the user cannot interact with the button. Defaults to `false`.
   */
  @Prop({ reflect: true }) disabled: boolean = false;

  /**
   * If button is disabled, the reason why it is disabled.
   */
  @Prop() disabledReason: string = '';

  /**
   * Defines the primary color of the button. This can be set to predefined color names to apply specific color themes.
   */
  @Prop({ reflect: true }) color:
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
  @Prop() iconAlign: 'start' | 'end' = 'end';

  /**
   * Hyperlink to navigate to on click.
   */
  @Prop({ reflect: true }) href: string;

  @Prop({ reflect: true, mutable: true }) configAria: any = {};

  /**
   * Sets or retrieves the window or frame at which to target content.
   */
  @Prop() target: string = '_self';

  /**
   * If true, the button will be in a toggled state.
   */
  @Prop() toggle: boolean = false;

  /**
   * Sets the delay for throttle in milliseconds. Defaults to 200 milliseconds.
   */
  @Prop() throttleDelay = 200;

  /**
   * The `appendData` property allows you to attach additional data to the button component. This data can be of any type, making it versatile for various use cases. It's particularly useful for passing extra context or information that can be accessed in event handlers or other component logic.
   */
  @Prop() appendData: any;

  /**
   * Triggered when the button is clicked.
   */
  @Event({ eventName: 'pc-button--click' }) clickEvent: EventEmitter<{
    appendData: any;
  }>;

  /**
   * Sets focus on the native `button` in `pc-button`. Use this method instead of the global
   * `button.focus()`.
   */
  @Method()
  async setFocus() {
    this.nativeElement.focus();
    this.hasFocus = true;
  }

  /**
   * Sets blur on the native `button` in `pc-button`. Use this method instead of the global
   * `button.blur()`.
   */
  @Method()
  async setBlur() {
    this.nativeElement.blur();
    this.hasFocus = false;
  }

  /**
   * Triggers a click event on the native `button` in `pc-button`. Use this method instead of the global
   * `button.click()`.
   */
  @Method()
  async triggerClick() {
    this.nativeElement.click();
  }

  /**
   * States
   */
  @State() hasFocus = false;
  @State() isActive = false;
  @State() hasHover = false;
  @State() slotHasContent = false;

  connectedCallback() {
    this.handleClickWithThrottle = throttle(
      this.handleClick,
      this.throttleDelay,
    );
  }

  @Listen('mouseup', { target: 'window' })
  windowMouseUp() {
    if (this.isActive && !this.toggle) this.isActive = false;
  }

  @Listen('keyup', { target: 'window' })
  windowKeyUp(evt: { key: string }) {
    if (this.isActive && !this.toggle && evt.key == ' ') this.isActive = false;
  }

  #renderIcon() {
    return <slot name="icon" />;
  }

  handleClick = () => {
    this.clickEvent.emit({
      appendData: this.appendData,
    });
  };

  #onClick(evt: MouseEvent) {
    if (!this.disabled) {
      this.handleClickWithThrottle();
    } else {
      evt.preventDefault();
      evt.stopPropagation();
      evt.stopImmediatePropagation();
    }
  }

  #onBlur = () => {
    this.hasFocus = false;
  };

  #onFocus = () => {
    this.hasFocus = true;
  };

  #onMouseOver = () => {
    this.hasHover = true;
  };

  #onMouseOut = () => {
    this.hasHover = false;
  };

  #onMouseDown = () => {
    this.isActive = this.toggle ? !this.isActive : true;
  };

  #onKeyDown = (evt: KeyboardEvent) => {
    if (!this.disabled) {
      if (evt.key == 'Enter' || evt.key == ' ') {
        if (!this.href) {
          evt.preventDefault();
          this.isActive = this.toggle ? !this.isActive : true;
          this.handleClickWithThrottle();
        } else {
          evt.preventDefault();
          this.isActive = true;
          this.handleClickWithThrottle();
          window.open(this.href, this.target);
        }
      }
    }
  };

  #onKeyUp = (evt: KeyboardEvent) => {
    if (!this.disabled && !this.toggle) {
      if (evt.key == 'Enter' || evt.key == ' ') {
        this.isActive = false;
      }
    }
  };

  #computeSlotHasContent() {
    this.slotHasContent = hasSlot(this.host);
  }

  componentWillLoad() {
    // If the pc-button has a tabindex attribute we get the value
    // and pass it down to the native input, then remove it from the
    // pc-button to avoid causing tabbing twice on the same element
    if (this.host.hasAttribute('tabindex')) {
      const tabindex = this.host.getAttribute('tabindex');
      this.tabindex = tabindex !== null ? tabindex : undefined;
      this.host.removeAttribute('tabindex');
    }
    if (this.host.getAttributeNames)
      this.host.getAttributeNames().forEach((name: string) => {
        if (name.includes('aria-')) {
          this.configAria[name] = this.host.getAttribute(name);
          this.host.removeAttribute(name);
        }
      });
    this.#computeSlotHasContent();
  }

  #renderDisabledReason() {
    if (this.disabled && this.disabledReason)
      return (
        <div id={`disabled-reason-${this.gid}`} role="tooltip" class="sr-only">
          {this.disabledReason}
        </div>
      );
  }

  #isLink() {
    return !!this.href;
  }

  render() {
    const isLink = this.#isLink();

    const variants = this.variant?.split('.');
    if (
      ['filled', 'outlined', 'text', 'tonal', 'neo'].includes(variants[0]) ==
      false
    ) {
      variants.unshift('filled');
    }

    const [variant, subVariant] = variants as [string, string?];

    return (
      <Host active={this.isActive}>
        <div
          class={{
            'button': true,
            [`size-${this.size}`]: true,
            [`variant-${variant}`]: true,
            [`variant-${subVariant}`]: !!subVariant,
            [`color-${this.color}`]: true,
            'hover': this.hasHover,
            'disabled': this.disabled,
            'has-focus': this.hasFocus,
            'active': this.isActive,
            'has-content': this.slotHasContent,
          }}
        >
          <div class="outline"></div>

          <pc-elevation class="elevation"></pc-elevation>

          <div class="neo-background" />

          <div class="background"></div>

          <div class="state-background"></div>

          {isLink ? this.renderLink() : this.renderButton()}

          {this.#renderDisabledReason()}
        </div>
      </Host>
    );
  }

  renderButton() {
    return (
      <button
        class="native-element native-button"
        tabIndex={this.tabindex}
        href={this.href}
        target={this.target}
        type={this.type}
        ref={(elm: HTMLButtonElement) => (this.nativeElement = elm)}
        onBlur={() => this.#onBlur()}
        onFocus={() => this.#onFocus()}
        onMouseOver={() => this.#onMouseOver()}
        onMouseOut={() => this.#onMouseOut()}
        onClick={evt => this.#onClick(evt)}
        onMouseDown={() => this.#onMouseDown()}
        onKeyDown={evt => this.#onKeyDown(evt)}
        onKeyUp={evt => this.#onKeyUp(evt)}
        role="button"
        aria-describedby={
          this.disabled && this.disabledReason
            ? `disabled-reason-${this.gid}`
            : null
        }
        aria-disabled={this.disabled + ''}
        {...this.configAria}
      >
        {this.iconAlign == 'start' && this.#renderIcon()}

        <div class="slot-container">
          <slot onSlotchange={() => this.#computeSlotHasContent()} />
        </div>

        {this.iconAlign == 'end' && this.#renderIcon()}
      </button>
    );
  }

  renderLink() {
    return (
      <a
        class="native-element native-link"
        tabindex={this.tabindex}
        href={this.href}
        target={this.target}
        type={this.type}
        ref={(elm: HTMLButtonElement) => (this.nativeElement = elm)}
        onBlur={() => this.#onBlur()}
        onFocus={() => this.#onFocus()}
        onMouseOver={() => this.#onMouseOver()}
        onMouseOut={() => this.#onMouseOut()}
        onClick={evt => this.#onClick(evt)}
        onMouseDown={() => this.#onMouseDown()}
        onKeyDown={evt => this.#onKeyDown(evt)}
        onKeyUp={evt => this.#onKeyUp(evt)}
        role="button"
        aria-describedby={
          this.disabled && this.disabledReason
            ? `disabled-reason-${this.gid}`
            : null
        }
        aria-disabled={this.disabled + ''}
        {...this.configAria}
      >
        {this.iconAlign == 'start' && this.#renderIcon()}

        <div class="slot-container">
          <slot onSlotchange={() => this.#computeSlotHasContent()} />
        </div>

        {this.iconAlign == 'end' && this.#renderIcon()}
      </a>
    );
  }
}
