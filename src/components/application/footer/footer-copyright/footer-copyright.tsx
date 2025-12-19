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
        <span class={'legal pc-text-body-small-emphasized'}>
          &copy; {this.year}&nbsp;
          <a class={'link'} href={this.copyrightHref}>
            {this.copyright}
          </a>
          . All Rights Reserved.
        </span>
      </Host>
    );
  }
}
