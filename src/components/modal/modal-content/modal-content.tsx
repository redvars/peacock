import { Component, h, Host, Prop } from '@stencil/core';

/**
 * @label Modal Content
 * @name modal-content
 * @description The Modal Content component is used to display the content within a modal.
 * @category Informational
 * @subcategory Modal
 * @childComponent true
 */
@Component({
  tag: 'pc-modal-content',
  styleUrl: 'modal-content.scss',
  shadow: true,
})
export class ModalContent {
  @Prop({ reflect: true }) type: 'text' | 'borderless' | 'default' = 'default';

  render() {
    return (
      <Host>
        <div class="modal-content">
          <slot />
        </div>
      </Host>
    );
  }
}
