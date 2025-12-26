import {
  Component,
  ComponentInterface,
  Element,
  h,
  Host,
  Prop,
} from '@stencil/core';

@Component({
  tag: 'pc-container',
  styleUrl: 'container.scss',
  shadow: true,
})
export class Container implements ComponentInterface {
  @Element() host!: HTMLElement;

  @Prop({ reflect: true })
  size: 'max' | 'xl' | 'lg' | 'md' | 'sm' | 'full' = 'full';

  render() {
    return (
      <Host>
        <div
          class={{
            'container-wrapper': true,
            [`size-${this.size}`]: true,
          }}
        >
          <div class="container">
            <div class="content">
              <slot />
            </div>
          </div>
        </div>
      </Host>
    );
  }
}
