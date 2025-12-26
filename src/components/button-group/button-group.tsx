import { Component, ComponentInterface, h, Host } from '@stencil/core';

/**
 * @label Button Group
 * @name button-group
 * @description Group a series of buttons together on a single line with the button group, and super-power.
 * @category General
 * @tags controls
 * @example <pc-button-group>
 *   <pc-button block icon="home"></pc-button>
 *   <pc-button block icon="alarm"></pc-button>
 *   </pc-button-group>
 */
@Component({
  tag: 'pc-button-group',
  styleUrl: 'button-group.scss',
  shadow: true,
})
export class ButtonGroup implements ComponentInterface {
  render() {
    return (
      <Host>
        <div class="button-group">
          <slot />
        </div>
      </Host>
    );
  }
}
