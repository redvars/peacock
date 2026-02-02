import {
  Component,
  ComponentInterface,
  Element,
  h,
  Host,
  Listen,
  Method,
  Prop,
  State,
} from '@stencil/core';
import { getComponentIndex } from '../../utils/utils';

/**
 * @name Link
 * @description Links allow users to click their way from page to page.
 * @category Navigation
 * @example <goat-link href="#">Link</goat-link>
 */
@Component({
  tag: 'goat-link',
  styleUrl: 'link.scss',
  shadow: true,
})
export class Link implements ComponentInterface {
  gid: string = getComponentIndex();

  /**
   * Hyperlink to navigate to on click.
   */
  @Prop({ reflect: true }) href: string;

  /**
   * Sets or retrieves the window or frame at which to target content.
   */
  @Prop() target: string;

  @State() hasFocus = false;
  @State() isActive = false;

  @Element() elm!: HTMLElement;
  private tabindex?: string | number;
  private itemprop?: string;
  private nativeElement?: HTMLAnchorElement;

  @Listen('mouseup', { target: 'window' })
  windowMouseUp() {
    if (this.isActive) this.isActive = false;
  }

  @Listen('keyup', { target: 'window' })
  windowKeyUp(evt) {
    if (this.isActive && (evt.key == 'Enter' || evt.key == ' '))
      this.isActive = false;
  }

  @Method()
  async triggerClick() {
    if (this.nativeElement) {
      this.nativeElement.click();
    }
  }

  private blurHandler = () => {
    this.hasFocus = false;
  };

  private focusHandler = () => {
    this.hasFocus = true;
  };

  private mouseDownHandler = () => {
    this.isActive = true;
  };

  private keyDownHandler = evt => {
    if (evt.key == 'Enter' || evt.key == ' ') {
      this.isActive = true;
    }
  };

  componentWillLoad() {
    // If the ion-input has a tabindex attribute we get the value
    // and pass it down to the native input, then remove it from the
    // goat-input to avoid causing tabbing twice on the same element
    if (this.elm.hasAttribute('tabindex')) {
      const tabindex = this.elm.getAttribute('tabindex');
      this.tabindex = tabindex !== null ? tabindex : undefined;
      this.elm.removeAttribute('tabindex');
    }
    if (this.elm.hasAttribute('itemprop')) {
      const tabindex = this.elm.getAttribute('itemprop');
      this.itemprop = tabindex !== null ? tabindex : undefined;
      this.elm.removeAttribute('itemprop');
    }
  }

  render() {
    return (
      <Host has-focus={this.hasFocus} active={this.isActive}>
        <a
          class={{
            'link': true,
            'has-focus': this.hasFocus,
            'active': this.isActive,
          }}
          href={this.href}
          target={this.target}
          itemprop={this.itemprop}
          ref={input => (this.nativeElement = input)}
          tabindex={this.tabindex}
          onBlur={this.blurHandler}
          onFocus={this.focusHandler}
          onMouseDown={this.mouseDownHandler}
          onKeyDown={this.keyDownHandler}
        >
          <slot />
        </a>
      </Host>
    );
  }
}
