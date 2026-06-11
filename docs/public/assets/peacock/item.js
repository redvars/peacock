import { i, a as i$1, b, _ as __decorate, I as IndividualComponent } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { e as e$1 } from './base-Cl6v8-BZ.js';
import { m as mixinDelegatesAria, a as mixinElementInternals } from './element-internals-2CMts_0M.js';
import { h as hasMeaningfulContent } from './observe-slot-change-DPxaZrZF.js';

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
let e;function r(r){return (n,o)=>e$1(n,o,{get(){return (this.renderRoot??(e??=document.createDocumentFragment())).querySelectorAll(r)}})}

var css_248z = i`* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.screen-reader-only {
  display: none !important;
}

[hidden] {
  display: none !important;
}

:host {
  --item-container-color: transparent;
  --item-height: 3rem;
  --item-multiline-height: 4rem;
  --item-label-text-color: var(--color-on-surface);
}

:host {
  position: relative;
  display: flex;
  min-width: 0;
  max-width: 100%;
}

.item {
  position: relative;
  display: flex;
  flex: 1;
  gap: var(--item-spacing, 1rem);
  padding-block: 0.625rem;
  padding-inline: var(--item-padding-inline, 1rem);
  overflow: hidden;
  color: var(--item-label-text-color);
  --icon-color: var(--item-label-text-color);
  opacity: var(--item-label-text-opacity, 1);
  font-family: var(--item-label-font-family, var(--typography-body-large-font-family)) !important;
  font-size: var(--item-label-font-size, var(--typography-body-large-font-size)) !important;
  font-weight: var(--item-label-font-weight, var(--typography-body-large-font-weight)) !important;
  line-height: var(--item-label-line-height, var(--typography-body-large-line-height)) !important;
  letter-spacing: var(--item-label-letter-spacing, var(--typography-body-large-letter-spacing)) !important;
}
.item [name=overline] {
  color: var(--item-outline-text-color);
  font-family: var(--item-outline-label-font-family, var(--typography-body-medium-font-family)) !important;
  font-size: var(--item-outline-label-font-size, var(--typography-body-medium-font-size)) !important;
  font-weight: var(--item-outline-label-font-weight, var(--typography-body-medium-font-weight)) !important;
  line-height: var(--item-outline-label-line-height, var(--typography-body-medium-line-height)) !important;
  letter-spacing: var(--item-outline-label-letter-spacing, var(--typography-body-medium-letter-spacing)) !important;
}
.item [name=supporting-text] {
  color: var(--item-supporting-text-color, var(--color-on-surface-variant));
  font-family: var(--item-supporting-text-font-family, var(--typography-body-medium-font-family)) !important;
  font-size: var(--item-supporting-text-font-size, var(--typography-body-medium-font-size)) !important;
  font-weight: var(--item-supporting-text-font-weight, var(--typography-body-medium-font-weight)) !important;
  line-height: var(--item-supporting-text-line-height, var(--typography-body-medium-line-height)) !important;
  letter-spacing: var(--item-supporting-text-letter-spacing, var(--typography-body-medium-letter-spacing)) !important;
}
.item [name=trailing-supporting-text] {
  color: var(--item-trailing-supporting-text-color, var(--color-on-surface-variant));
  font-family: var(--item-trailing-supporting-text-font-family) !important;
  font-size: var(--item-trailing-supporting-text-font-size) !important;
  font-weight: var(--item-trailing-supporting-text-font-weight) !important;
  line-height: var(--item-trailing-supporting-text-line-height) !important;
  letter-spacing: var(--item-trailing-supporting-text-letter-spacing) !important;
}
.item .default-slot {
  display: inline;
}
.item .default-slot,
.item .text ::slotted(*) {
  overflow: hidden;
  text-overflow: ellipsis;
}
.item .text {
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
  justify-content: center;
}
.item .non-text {
  align-items: center;
  display: flex;
  height: fit-content;
  --icon-size: 1.5rem;
}
.item .non-text,
.item .text {
  z-index: 0;
  min-height: var(--item-height);
}

:host([multiline]) .non-text,
:host([multiline]) .text {
  min-height: var(--item-multiline-height);
}

[name=container]::slotted(*) {
  inset: 0;
  position: absolute;
}`;

/**
 * @label Item
 * @tag wc-item
 * @rawTag item
 *
 * @summary A primitive element used to build higher-level item components such as menu-item, navigation-item, and list-item. Provides start, text, and end slots for flexible content composition.
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
let Item = class Item extends mixinDelegatesAria(mixinElementInternals(i$1)) {
    constructor() {
        super(...arguments);
        /**
         * Only needed for SSR.
         *
         * Add this attribute when an item has two lines to avoid a Flash Of Unstyled
         * Content. This attribute is not needed for single line items or items with
         * three or more lines.
         */
        this.multiline = false;
    }
    __hasNamedSlot(...names) {
        return names.some(name => Array.from(this.children).some(child => child.getAttribute('slot') === name));
    }
    render() {
        const hasStart = this.__hasNamedSlot('start');
        const hasEnd = this.__hasNamedSlot('end');
        const hasTrailingSupportingText = this.__hasNamedSlot('trailing-supporting-text');
        return b `
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
    handleTextSlotChange() {
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
};
Item.styles = [css_248z];
__decorate([
    n({ type: Boolean, reflect: true })
], Item.prototype, "multiline", void 0);
__decorate([
    r('.text slot')
], Item.prototype, "textSlots", void 0);
Item = __decorate([
    IndividualComponent
], Item);

export { Item };
//# sourceMappingURL=item.js.map
