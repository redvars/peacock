import {
  Component,
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
import { getComponentIndex } from '../../../utils/utils';

/**
 * @label Menu Item
 * @name menu-item
 * @description Menu items display a list of choices on temporary surfaces.
 * @category Navigation
 * @subcategory Menu
 * @childComponent true
 */
@Component({
  tag: 'pc-menu-item',
  styleUrl: 'menu-item.scss',
  shadow: true,
})
export class GoatMenu {
  @Element() elm!: HTMLElement;

  gid: string = getComponentIndex();

  /**
   * The menu item value.
   */
  @Prop({ mutable: true }) value?: string | number | null;

  @Prop() color:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'white'
    | 'black' = 'default';

  /**
   * If true, the user cannot interact with the button. Defaults to `false`.
   */
  @Prop({ reflect: true }) disabled: boolean = false;

  @Prop({ reflect: true }) selectable: boolean = false;

  /**
   * Menu item selection state.
   */
  @Prop({ reflect: true }) selected: boolean = false;

  @Prop({ reflect: true }) layer?: 'background' | '01' | '02';

  /**
   * Hyperlink to navigate to on click.
   */
  @Prop({ reflect: true }) href: string;

  /**
   * Sets or retrieves the window or frame at which to target content.
   */
  @Prop() target: string = '_self';

  /**
   * Emitted when the menu item is clicked.
   */
  @Event({ eventName: 'pc-menu-item--click' })
  goatMenuItemClick: EventEmitter;

  @State() startSlotHasContent = false;
  @State() endSlotHasContent = false;
  @State() hasFocus = false;
  @State() isActive = false;

  private nativeElement?: HTMLElement;
  private tabindex?: string | number = 1;

  /**
   * Sets focus on the native `input` in `pc-input`. Use this method instead of the global
   * `input.focus()`.
   */
  @Method()
  async setFocus() {
    if (this.nativeElement) {
      this.nativeElement.focus();
    }
  }

  /**
   * Sets blur on the native `input` in `pc-input`. Use this method instead of the global
   * `input.blur()`.
   */
  @Method()
  async setBlur() {
    if (this.nativeElement) {
      this.nativeElement.blur();
    }
  }

  @Listen('mouseup', { target: 'window' })
  windowMouseUp() {
    if (this.isActive) this.isActive = false;
  }

  @Listen('keyup', { target: 'window' })
  windowKeyUp(evt) {
    if (this.isActive && evt.key == ' ') this.isActive = false;
  }

  getNativeElementTagName() {
    if (this.href) return 'a';
    else return 'div';
  }

  async componentWillLoad() {
    // If the ion-input has a tabindex attribute we get the value
    // and pass it down to the native input, then remove it from the
    // pc-input to avoid causing tabbing twice on the same element
    if (this.elm.hasAttribute('tabindex')) {
      const tabindex = this.elm.getAttribute('tabindex');
      this.tabindex = tabindex !== null ? tabindex : undefined;
      this.elm.removeAttribute('tabindex');
    }
    this.endSlotHasContent = !!this.elm.querySelector('[slot="end"]');
  }

  render = () => {
    const NativeElementTag = this.getNativeElementTagName();

    return (
      <Host active={this.isActive} has-focus={this.hasFocus}>
        <NativeElementTag
          ref={el => (this.nativeElement = el as HTMLElement)}
          href={this.href}
          target={this.target}
          class={{
            'menu-item': true,
            'selected': this.selected,
            'active': this.isActive,
            'disabled': this.disabled,
            'has-focus': this.hasFocus,
            [`color-${this.color}`]: true,
            'end-slot-has-content': this.endSlotHasContent,
          }}
          tabindex={this.tabindex}
          onBlur={this.blurHandler}
          onFocus={this.focusHandler}
          onClick={this.clickHandler}
          onMouseDown={this.mouseDownHandler}
          onKeyDown={this.keyDownHandler}
          aria-disabled={this.disabled}
        >
          {this.selectable && (
            <div class="item-section start">
              {this.selected && <p-icon name="checkmark" class="checkmark" />}
            </div>
          )}

          <div class="item-section slot-main">
            <slot />
          </div>

          <div class="item-section slot-end">
            <slot name="end" />
          </div>
        </NativeElementTag>
      </Host>
    );
  };

  private clickHandler = event => {
    if (!this.disabled) {
      this.setFocus();
      this.goatMenuItemClick.emit({
        value: this.value || this.elm.innerText,
      });
      if (this.href) window.open(this.href, this.target);
    } else {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
  };

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
    if (evt.key == ' ' || evt.key == 'Enter') {
      evt.preventDefault();
      this.isActive = true;
      this.clickHandler(evt);
    }
  };
}
