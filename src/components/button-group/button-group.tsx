import { Component, ComponentInterface, h, Host } from '@stencil/core';

/**
 * @name Button Group
 * @description Group a series of buttons together on a single line with the button group, and super-power.
 * @category General
 * @tags controls
 * @example <goat-button-group>
 *   <goat-button block icon="home"></goat-button>
 *   <goat-button block icon="alarm"></goat-button>
 *   </goat-button-group>
 */
@Component({
  tag: 'goat-button-group',
  styleUrl: 'button-group.scss',
  shadow: true,
})
export class ButtonGroup implements ComponentInterface {


  render() {
    return (<Host>
      <div class='button-group'>
        <slot/>
      </div>
    </Host>);
  }

}
