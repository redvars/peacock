import { Component, h, Host, Prop } from '@stencil/core';

/**
 * @name Badge
 * @description The badge component is used to display a small amount of information to the user.
 * @category Informational
 * @tag content
 * @example <goat-badge content="5"> <pc-icon name="notification" size="2rem"></pc-icon></goat-badge>
 */
@Component({
  tag: 'goat-badge',
  styleUrl: 'badge.scss',
  shadow: true,
})
export class Badge {
  @Prop() content: string;

  @Prop({ reflect: true }) color:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'error'
    | 'warning' = 'error';

  render() {
    return (
      <Host>
        <div class={{ badge: true, [`color-${this.color}`]: true }}>
          <div
            class={{
              'badge-content': true,
              'has-content': this.content !== '',
            }}
          >
            {this.content}
          </div>
          <slot />
        </div>
      </Host>
    );
  }
}
