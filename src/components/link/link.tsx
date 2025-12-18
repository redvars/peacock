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
 * @label Link
 * @name link
 * @description Links allow users to click their way from page to page.
 * @category Navigation
 * @example <a href="#">Link</pc-link>
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
