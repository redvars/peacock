import { Component, ComponentInterface, h, Host, Prop } from '@stencil/core';

@Component({
  tag: 'pc-tab-panel',
  styleUrl: 'tab-panel.scss',
  shadow: true,
})
export class TabPanel implements ComponentInterface {
  @Prop({ reflect: true }) value: string;

  @Prop({ reflect: true }) active: boolean = false;

  @Prop({ reflect: true }) layer?: 'background' | '01' | '02';

  render() {
    return (
      <Host>
        <slot />
      </Host>
    );
  }
}
