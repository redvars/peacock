import { Component, Fragment, h, Method, Prop, State } from '@stencil/core';

@Component({
  tag: 'goat-header-brand',
  styleUrl: 'header-brand.scss',
  shadow: true,
})
export class HeaderBrand {
  @Prop() logo: string;
  @Prop() name: string;
  @Prop() href: string = '#';
  @Prop() subTitle: string;

  @State() color: any;

  /*
   * @internal
   */
  @Method()
  async setColor(color: string) {
    this.color = color;
  }

  render() {
    const isLogoSVG = this.logo.endsWith('.svg');
    return (
      <div class="header-brand">
        <pc-button
          variant={'text'}
          color={this.color}
          class="brand-link no-style"
          href={this.href}
        >
          <div class="brand">
            {(() => {
              if (this.logo) {
                if (isLogoSVG) {
                  return <p-icon class="logo inherit" src={this.logo} />;
                } else {
                  return <img src={this.logo} class="logo" alt={this.name} />;
                }
              }
            })()}
            {this.name && <span class="brand-name">{this.name}</span>}
          </div>
        </pc-button>
        {(() => {
          if (this.subTitle)
            return (
              <Fragment>
                <pc-divider vertical={true} class="subtitle-divider" />
                <div class="subtitle">{this.subTitle}</div>
              </Fragment>
            );
        })()}
      </div>
    );
  }
}
