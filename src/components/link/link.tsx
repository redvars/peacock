import { Component, ComponentInterface, h, Host } from '@stencil/core';

/**
 * @label Link
 * @name link
 * @description Links allow users to click their way from page to page.
 * @category Navigation
 * @example <a class="pc-link" href="#">Link</a>
 */
@Component({
  tag: 'pc-link',
  styleUrl: 'link.scss',
  shadow: true,
})
export class Link implements ComponentInterface {
  render() {
    return <Host></Host>;
  }
}
