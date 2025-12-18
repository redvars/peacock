import { Component, ComponentInterface, h, Host, Prop } from '@stencil/core';

@Component({
  tag: 'pc-breadcrumb-item',
  styleUrl: 'breadcrumb-item.scss',
  shadow: true,
})
export class BreadcrumbItem implements ComponentInterface {
  /**
   * Hyperlink to navigate to on click.
   */
  @Prop({ reflect: true }) href: string;

  /**
   * Sets or retrieves the window or frame at which to target content.
   */
  @Prop() target: string;

  @Prop({ reflect: true }) position: string;

  @Prop({ reflect: true }) active: boolean = false;

  render() {
    return (
      <Host
        itemprop="itemListElement"
        itemscope
        itemtype="https://schema.org/ListItem"
      >
        {this.active ? (
          <span class={'breadcrumb-item active'}>
            <span itemprop="name">
              <slot />
            </span>
            <meta itemprop="position" content={this.position} />
          </span>
        ) : (
          <span class={'breadcrumb-item'}>
            <goat-link itemprop="item" href={this.href} target={this.target}>
              <span itemprop="name">
                <slot />
              </span>
              <meta itemprop="position" content={this.position} />
            </goat-link>
          </span>
        )}
      </Host>
    );
  }
}
