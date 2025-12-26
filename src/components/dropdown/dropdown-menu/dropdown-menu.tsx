import {
  Component,
  ComponentInterface,
  Element,
  h,
  Host,
  Method,
} from '@stencil/core';
import { getComponentIndex } from '../../../utils/utils';

/**
 * @label Dropdown Menu
 * @name dropdown-menu
 * @description The Dropdown Menu component is used to display a list of options.
 * @category Navigation
 * @subcategory Dropdown
 * @childComponent true
 */
@Component({
  tag: 'pc-dropdown-menu',
  styleUrl: 'dropdown-menu.scss',
  shadow: true,
})
export class DropdownMenu implements ComponentInterface {
  @Element() host!: HTMLElement;

  gid: string = getComponentIndex();
  menuRef: HTMLPcMenuElement;

  /**
   * Sets focus on first menu item. Use this method instead of the global
   * `element.focus()`.
   */
  @Method()
  async setFocus() {
    await this.menuRef.setFocus();
  }

  render() {
    return (
      <Host>
        <pc-menu class="dropdown-content" ref={elm => (this.menuRef = elm)}>
          <slot />
        </pc-menu>
      </Host>
    );
  }
}
