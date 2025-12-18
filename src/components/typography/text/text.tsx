import { Component, ComponentInterface } from '@stencil/core';

/**
 * @label Text
 * @name text
 * @description Typography are used for rendering headlines, paragraphs, and captions.
 * @category General
 * @example <h1 class=>Heading</h1>
 */
@Component({
  tag: 'pc-text',
  styleUrl: 'text.scss',
  shadow: false,
})
export class Text implements ComponentInterface {
  render() {
    return '';
  }
}
