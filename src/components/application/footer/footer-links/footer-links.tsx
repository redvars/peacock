import { Component, Element, h, Host, Prop } from '@stencil/core';

@Component({
  tag: 'goat-footer-links',
  styleUrl: 'footer-links.scss',
  shadow: true,
})
export class FooterLinks {
  @Element() elm!: HTMLElement;

  @Prop() links: { name: string; href: string }[] = [];

  getLinks() {
    if (typeof this.links == 'string') return JSON.parse(this.links);
    return this.links;
  }

  render() {
    return (
      <Host>
        <ul class={'nav-links'}>
          {this.getLinks().map(link => {
            return (
              <li>
                <base-link class={'no-style link'} href={link.href}>
                  {link.name}
                </base-link>
              </li>
            );
          })}
        </ul>
      </Host>
    );
  }
}
