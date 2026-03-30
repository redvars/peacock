import { Component, h, Host, Prop } from '@stencil/core';

@Component({
  tag: 'pc-card',
  styleUrl: 'card.scss',
  shadow: true,
})
export class Card {
  @Prop() shadowLevel: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | undefined;

  render() {
    return (
      <Host shadow-level={this.shadowLevel}>
        <div class="card">
          <slot />
        </div>
      </Host>
    );
  }
}
