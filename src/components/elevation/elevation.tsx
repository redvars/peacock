import { Component, h } from '@stencil/core';

/**
 * @label Elevation
 * @name elevation
 * @description Icons are visual symbols used to represent ideas, objects, or actions.
 * @overview Icons are visual symbols used to represent ideas, objects, or actions. They communicate messages at a glance, afford interactivity, and draw attention to important information.
 * @category General
 * @example <pc-elevation></pc-elevation>
 */
@Component({
  tag: 'pc-elevation',
  styleUrl: 'elevation.scss',
  shadow: true,
})
export class Elevation {
  render() {
    return <span class="shadow"></span>;
  }
}
