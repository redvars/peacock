import { Component, Element, h, Host, Prop } from '@stencil/core';

@Component({
  tag: 'goat-footer-copyright',
  styleUrl: 'footer-copyright.scss',
  shadow: true,
})
export class FooterCopyright {
  @Element() elm!: HTMLElement;

  @Prop() copyright: string;

  @Prop() copyrightHref: string;

  @Prop() year = new Date().getFullYear();

  render() {
    return (
      <Host>
        <span class={'legal text-body-small-emphasized'}>
          &copy; {this.year}&nbsp;
          <goat-link href={this.copyrightHref}>{this.copyright}</goat-link>. All
          Rights Reserved.
        </span>
      </Host>
    );
  }
}
