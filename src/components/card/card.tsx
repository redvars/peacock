import { Component, h, Host, Prop } from '@stencil/core';

@Component({
  tag: 'pc-card',
  styleUrl: 'card.scss',
  shadow: true,
})
export class Card {
  @Prop({ reflect: true }) variant: 'elevated' | 'filled' | 'outlined' = 'elevated';
  @Prop() shadowLevel: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | undefined;

  render() {
    return (
      <Host shadow-level={this.shadowLevel} variant={this.variant}>
        <div class="card">
          <slot />
        </div>
      </Host>
    );
  }
}
