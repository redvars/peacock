import {
  Component,
  ComponentInterface,
  Element,
  h,
  Host,
  Prop,
  State,
} from '@stencil/core';

/**
 * @label Divider
 * @name divider
 * @description A divider can be used to segment content vertically or horizontally.
 * @overview
 *  <p>Dividers are used to separate content into clear groups, making it easier for users to scan and understand the information presented. They can be oriented either vertically or horizontally, depending on the layout requirements.</p>
 * @category Layout
 * @example <pc-divider style="width: 12rem;">or</pc-divider>
 */
@Component({
  tag: 'pc-divider',
  styleUrl: 'divider.scss',
  shadow: true,
})
export class Divider implements ComponentInterface {
  @Prop({ reflect: true }) vertical: boolean = false;

  @State() slotHasContent = false;
  @Element() elm!: HTMLElement;

  componentWillLoad() {
    this.slotHasContent = this.elm.hasChildNodes();
  }

  render() {
    return (
      <Host>
        <div
          class={{
            'divider': true,
            'vertical': this.vertical,
            'has-content': this.slotHasContent,
          }}
        >
          <div class="line" />
          <div class="slot-container">
            <slot />
          </div>
          <div class="line" />
        </div>
      </Host>
    );
  }
}
