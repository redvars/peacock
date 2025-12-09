import {
  Component,
  Element,
  Event,
  EventEmitter,
  h,
  Host,
  Prop,
  State,
} from '@stencil/core';
import { getComponentIndex } from '../../../utils/utils';

/**
 * @name Accordion Item
 * @description An accordion item is single item in an accordion list. It contains a header and a content section that can be expanded or collapsed by the user.
 * @overview
 *  <p>The accordion item component is a single item in an accordion list. It contains a header and a content section that can be expanded or collapsed by the user. The accordion item can be used in conjunction with the accordion component to create a list of expandable items.</p>
 * @category Data Display
 * @subcategory Accordion
 * @childComponent true
 */
@Component({
  tag: 'goat-accordion-item',
  styleUrl: 'accordion-item.scss',
  shadow: true,
})
export class GoatAccordionItem {
  gid: string = getComponentIndex();

  /**
   * The menu item value.
   */
  @Prop() heading: string;

  /**
   * If true, the user cannot interact with the button. Defaults to `false`.
   */
  @Prop() disabled: boolean = false;

  /**
   * Menu item selection state.
   */
  @Prop({ reflect: true, mutable: true }) open: boolean = false;

  @State() hasFocus = false;

  /**
   * Emitted when the menu item is clicked.
   */
  @Event({ eventName: 'goat-accordion-item--click' })
  goatAccordionItemClick: EventEmitter;

  @State() startSlotHasContent = false;
  @State() endSlotHasContent = false;

  @Element() elm!: HTMLElement;

  private blurHandler = () => {
    this.hasFocus = false;
  };

  private focusHandler = () => {
    this.hasFocus = true;
  };

  render = () => {
    return (
      <Host open={this.open}>
        <div
          class={{
            'accordion-item': true,
            'open': this.open,
            'disabled': this.disabled,
          }}
        >
          <button
            type="button"
            id={`accordion-heading-${this.gid}`}
            aria-controls={`accordion-control-${this.gid}`}
            class={{ 'accordion-heading': true, 'has-focus': this.hasFocus }}
            onBlur={this.blurHandler}
            onFocus={this.focusHandler}
            aria-disabled={this.disabled + ''}
            on-click={() => {
              if (!this.disabled) {
                this.open = !this.open;
                this.hasFocus = true;
                this.goatAccordionItemClick.emit({
                  gid: this.gid,
                  open: this.open,
                  element: this.elm,
                });
              }
            }}
            aria-expanded={this.open + ''}
          >
            <pc-icon name="chevron--down" class="accordion-icon inherit" />
            <div part="title" class="accordion-title">
              <slot name="heading">{this.heading}</slot>
            </div>
          </button>
          <div
            class="item-section slot-main"
            id={`accordion-control-${this.gid}`}
            aria-labelledby={`accordion-heading-${this.gid}`}
            role="region"
          >
            <slot />
          </div>
        </div>
      </Host>
    );
  };
}
