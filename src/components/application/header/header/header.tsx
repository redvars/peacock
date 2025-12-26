import { Component, Element, h, Host, Prop, State, Watch } from '@stencil/core';
import {
  hasSlot,
  isDarkMode,
  isLightOrDark,
  observeThemeChange,
} from '../../../../utils/utils';

/**
 * @label Header
 * @name header
 * @description Header component is used to display a header with a brand, navigation, and actions.
 * @category Navigation
 * @img /assets/img/header.webp
 * @imgDark /assets/img/header-dark.webp
 */
@Component({
  tag: 'pc-header',
  styleUrl: 'header.scss',
  shadow: true,
})
export class Header {
  @Element() host!: HTMLElement;

  @Prop() float: boolean = false;

  /**
   * Defines the primary color of the header. This can be set to predefined color names to apply specific color themes.
   */
  @Prop() color:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'white'
    | 'black'
    | string = 'black';

  /**
   * Color variant for dark mode, applicable when [data-theme="dark"] is set.
   */
  @Prop() darkModeColor?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'white'
    | 'black'
    | string;

  @Watch('color')
  colorChanged() {
    this.#computedColor();
  }

  /**
   * States
   */
  @State() computedColor: string;
  @State() themeMode: 'light' | 'dark' = 'light';
  @State() centerSlotHasContent = false;

  #computeColorLightOrDark() {
    const color = getComputedStyle(document.documentElement).getPropertyValue(
      `--color-${this.computedColor}`,
    );
    return isLightOrDark(color);
  }

  #computedColor() {
    this.computedColor = this.color;
    if (isDarkMode() && this.darkModeColor) {
      this.computedColor = this.darkModeColor;
    }
    this.host.querySelectorAll('goat-header-action').forEach(el => {
      el.setColor(this.computedColor);
    });
    this.host.querySelector('goat-header-brand')?.setColor(this.computedColor);
  }

  #getColumnType() {
    return this.centerSlotHasContent ? 'three-column' : 'two-column';
  }

  #computeCenterSlotHasContent() {
    this.centerSlotHasContent = hasSlot(this.host, 'center');
  }

  componentWillLoad() {
    this.colorChanged();
    this.#computeCenterSlotHasContent();
    observeThemeChange(() => {
      this.themeMode = isDarkMode() ? 'dark' : 'light';
      this.colorChanged();
    });
  }

  render() {
    return (
      <Host color-is={this.#computeColorLightOrDark()}>
        <header
          class={{
            header: true,
            float: this.float,
            [`color-${this.computedColor}`]: true,
            [this.#getColumnType()]: true,
          }}
        >
          <div class="header-container">
            <div class="left-section section">
              <slot name="left" />
            </div>
            {this.centerSlotHasContent && (
              <div class="center-section section">
                <slot
                  name="center"
                  onSlotchange={() => this.#computeCenterSlotHasContent()}
                />
              </div>
            )}
            <div class="right-section section">
              <slot name="right" />
            </div>
          </div>
        </header>
      </Host>
    );
  }
}
