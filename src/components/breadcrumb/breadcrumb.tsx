import { Component, ComponentInterface, Element, h, Host } from '@stencil/core';

/**
 * @label Breadcrumb
 * @name breadcrumb
 * @description A breadcrumb is a secondary navigation scheme that reveals the user's location in a website or web application.
 * @category Navigation
 * @tags navigation
 * @example <pc-breadcrumb><pc-breadcrumb-item href="#">Home</pc-breadcrumb-item><pc-breadcrumb-item href="#" active>Page</pc-breadcrumb-item></pc-breadcrumb>
 */
@Component({
  tag: 'pc-breadcrumb',
  styleUrl: 'breadcrumb.scss',
  shadow: true,
})
export class Breadcrumb implements ComponentInterface {
  @Element() elm!: HTMLElement;

  componentWillLoad() {
    this.elm
      .querySelectorAll('pc-breadcrumb-item')
      .forEach((item: HTMLPcBreadcrumbItemElement, i) => {
        item.position = `${i + 1}`;
      });
  }

  render() {
    return (
      <Host itemscope itemtype="http://schema.org/BreadcrumbList">
        <div class="breadcrumb">
          <slot />
        </div>
      </Host>
    );
  }
}
