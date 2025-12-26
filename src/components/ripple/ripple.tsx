import { Component, h } from '@stencil/core';

/**
 * @label Ripple
 * @name ripple
 * @description Ripples are state layers used to communicate the status of a component or interactive element.
 * @category General
 * @example <pc-ripple></pc-ripple>
 */
@Component({
  tag: 'pc-ripple',
  styleUrl: 'ripple.scss',
  shadow: true,
})
export class Ripple {
  render() {
    return <span class="ripple"></span>;
  }
}
