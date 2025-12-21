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

@Component({
  tag: 'goat-sidenav-menu-item',
  styleUrl: 'sidenav-menu-item.scss',
  shadow: true,
})
export class SidenavMenuItem {
  gid: string = getComponentIndex();

  private nativeElement?: HTMLElement;

  private tabindex?: string | number = 1;

  /**
   * The menu item value.
   */
  @Prop({ mutable: true }) value?: string | number | null;

  /**
   * If true, the user cannot interact with the button. Defaults to `false`.
   */
  @Prop({ reflect: true }) disabled: boolean = false;

  /**
   * Menu item selection state.
   */
  @Prop({ reflect: true }) selected: boolean = false;

  /**
   * Emitted when the menu item is clicked.
   */
  @Event({ eventName: 'goat:sidenav-menu-item-click' })
  goatMenuItemClick: EventEmitter;

  @State() startSlotHasContent = false;
  @State() endSlotHasContent = false;

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

  @State() hasFocus = false;
  @State() isActive = false;
  @Element() elm!: HTMLElement;

  private clickHandler = event => {
    if (!this.disabled) {
      this.goatMenuItemClick.emit({
        value: this.value || this.elm.innerText,
      });
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
    if (evt.key == ' ') {
      evt.preventDefault();
      this.isActive = true;
      this.clickHandler(evt);
    }
  };

  componentWillLoad() {
    // If the ion-input has a tabindex attribute we get the value
    // and pass it down to the native input, then remove it from the
    // pc-input to avoid causing tabbing twice on the same element
    if (this.elm.hasAttribute('tabindex')) {
      const tabindex = this.elm.getAttribute('tabindex');
      this.tabindex = tabindex !== null ? tabindex : undefined;
      this.elm.removeAttribute('tabindex');
    }
    this.startSlotHasContent = !!this.elm.querySelector('[slot="start"]');
    this.endSlotHasContent = !!this.elm.querySelector('[slot="end"]');
  }

  render = () => {
    return (
      <Host active={this.isActive} has-focus={this.hasFocus}>
        <div
          ref={el => (this.nativeElement = el as HTMLElement)}
          class={{
            'sidenav-menu-item': true,
            'selected': this.selected,
            'active': this.isActive,
            'disabled': this.disabled,
            'has-focus': this.hasFocus,
            'start-slot-has-content': this.startSlotHasContent,
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
          <div class="item-section slot-start">
            <slot name="start" />
          </div>

          <div class="item-section slot-main">
            <slot />
          </div>

          <div class="item-section slot-end">
            <slot name="end" />
          </div>
        </div>
      </Host>
    );
  };
}
