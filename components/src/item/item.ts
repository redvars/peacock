import { html, LitElement } from 'lit';
import { property, queryAll } from 'lit/decorators.js';
import styles from './item.scss';
import IndividualComponent from '@/IndividualComponent.js';
import { mixinDelegatesAria } from '@/__internal/aria/delegate.js';
import { mixinElementInternals } from '@/__internal/mixins/element-internals.js';

import { hasMeaningfulContent } from '@/__internal/utils/observe-slot-change.js';

/**
 * @label Item
 * @tag wc-item
 * @rawTag item
 *
 * @summary The layout that list items and menu items are built on, with start, text and end areas.
 *
 * @overview
 * <p>Not used on its own: <code>wc-list-item</code> and <code>wc-menu-item</code> render it.</p>
 * <p>Content goes in named slots: <code>start</code> before the text; <code>overline</code>, the
 * default slot, <code>headline</code> and <code>supporting-text</code> in the text column;
 * <code>trailing-supporting-text</code> and <code>end</code> after it; and <code>container</code>
 * behind the item. The start, trailing supporting text and end areas are hidden while they are
 * empty.</p>
 * <p>When more than one text slot has content the item sets <code>multiline</code>, which gives it a
 * taller minimum height. Set <code>multiline</code> yourself only for server-side rendering of a
 * two-line item, to avoid a flash of unstyled content.</p>
 *
 * @internal Not part of the public API: use `wc-list-item` or `wc-menu-item`. It stays
 * registered because those components render it.
 *
 * @example
 * ```html
 * <wc-item>
 *   <wc-icon slot="start" name="notifications"></wc-icon>
 *
 *   <span slot="headline">Notifications</span>
 *   <span slot="supporting-text">Manage alerts and reminders</span>
 *
 *   <span slot="trailing-supporting-text">3</span>
 *   <wc-icon slot="end" name="chevron_right"></wc-icon>
 * </wc-item>
 * ```
 * @tags display
 */
@IndividualComponent
export class Item extends mixinDelegatesAria(
  mixinElementInternals(LitElement),
) {
  static styles = [styles];

  /**
   * Only needed for SSR.
   *
   * Add this attribute when an item has two lines to avoid a Flash Of Unstyled
   * Content. This attribute is not needed for single line items or items with
   * three or more lines.
   */
  @property({ type: Boolean, reflect: true }) multiline = false;

  @queryAll('.text slot') private readonly textSlots!: HTMLSlotElement[];

  private __hasNamedSlot(...names: string[]) {
    return names.some(name =>
      Array.from(this.children).some(
        child => child.getAttribute('slot') === name,
      ),
    );
  }

  override render() {
    const hasStart = this.__hasNamedSlot('start');
    const hasEnd = this.__hasNamedSlot('end');
    const hasTrailingSupportingText = this.__hasNamedSlot(
      'trailing-supporting-text',
    );

    return html`
      <slot name="container"></slot>

      <div class="item">
        <slot class="non-text" name="start" ?hidden=${!hasStart}></slot>
        <div class="text">
          <slot name="overline" @slotchange=${this.handleTextSlotChange}></slot>
          <slot
            class="default-slot"
            @slotchange=${this.handleTextSlotChange}
          ></slot>
          <slot name="headline" @slotchange=${this.handleTextSlotChange}></slot>
          <slot
            name="supporting-text"
            @slotchange=${this.handleTextSlotChange}
          ></slot>
        </div>
        <slot
          class="non-text"
          name="trailing-supporting-text"
          ?hidden=${!hasTrailingSupportingText}
        ></slot>
        <slot class="non-text" name="end" ?hidden=${!hasEnd}></slot>
      </div>
    `;
  }

  private handleTextSlotChange() {
    // Check if there's more than one text slot with content. If so, the item is
    // multiline, which has a different min-height than single line items.
    let isMultiline = false;
    let slotsWithContent = 0;
    for (const slot of this.textSlots) {
      if (hasMeaningfulContent(slot)) {
        slotsWithContent += 1;
      }

      if (slotsWithContent > 1) {
        isMultiline = true;
        break;
      }
    }

    this.multiline = isMultiline;
  }
}
