import { Component, Element, h, Host, State } from '@stencil/core';
import { hasSlot } from '../../utils/utils';

/**
 * @label Badge
 * @name badge
 * @description The badge component is used to display a small amount of information to the user.
 * @category Informational
 * @tag content
 * @example <pc-badge content="5"> <pc-icon name="notification" size="2rem"></pc-icon></goat-badge>
 */
@Component({
  tag: 'pc-badge',
  styleUrl: 'badge.scss',
  shadow: true,
})
export class Badge {
  @State() slotHasContent = false;
  @Element() host!: HTMLElement;

  #computeSlotHasContent() {
    this.slotHasContent = hasSlot(this.host);
  }

  render() {
    return (
      <Host>
        <div class={{ 'badge': true, 'has-content': this.slotHasContent }}>
          <slot onSlotchange={() => this.#computeSlotHasContent()} />
        </div>
      </Host>
    );
  }
}
