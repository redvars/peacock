import { Component, Element, h, Host, Listen, Prop } from '@stencil/core';
import { PcAccordionItemCustomEvent } from '../../../components';

/**
 * @label Accordion
 * @name accordion
 * @description An accordion is a vertically stacked list of headers that reveal or hide associated sections of content.
 * @overview
 *  <p>The accordion component delivers large amounts of content in a small space through progressive disclosure. The header title give the user a high level overview of the content allowing the user to decide which sections to read.</p>
 *  <p>Accordions can make information processing and discovering more effective. However, it does hide content from users and it’s important to account for a user not noticing or reading all of the included content. If a user is likely to read all of the content then don’t use an accordion as it adds the burden of an extra click; instead use a full scrolling page with normal headers.</p>
 * @category Data Display
 * @subcategory Accordion
 * @tags display
 * @img /assets/img/accordion.webp
 * @imgDark /assets/img/accordion-dark.webp
 */
@Component({
  tag: 'pc-accordion',
  styleUrl: 'accordion.scss',
  shadow: true,
})
export class Accordion {
  @Element() elm!: HTMLElement;

  /**
   * The According size.
   */
  @Prop({ reflect: true }) size: 'sm' | 'md' | 'lg' = 'md';

  /**
   * Accordion item dropdown alignment.
   */
  @Prop({ reflect: true }) align: 'start' | 'end' = 'end';

  @Prop() multiple: boolean = false;

  @Listen('accordion--item-click')
  accordionItemClick(evt: PcAccordionItemCustomEvent<any>) {
    if (!this.multiple) {
      const accordionItems = this.elm.querySelectorAll('pc-accordion-item');
      accordionItems.forEach(item => {
        if (item !== evt.detail.element) {
          //@ts-ignore
          item.open = false;
        }
      });
    }
  }

  render() {
    return (
      <Host>
        <slot />
      </Host>
    );
  }
}
