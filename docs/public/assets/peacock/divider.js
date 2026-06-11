import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { r } from './state-DkTK9EGF.js';
import { e } from './class-map-DG7CA1et.js';
import { o as observerSlotChangesWithCallback } from './observe-slot-change-DPxaZrZF.js';
import './directive-ZPhl09Yt.js';

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
  display: block;
  --divider-color: var(--color-outline-variant);
  --divider-spacing: var(--spacing-200);
  --divider-line-thickness: 1px;
}

.divider {
  display: flex;
  margin: 0;
  font-family: var(--typography-body-medium-font-family) !important;
  font-size: var(--typography-body-medium-font-size) !important;
  font-weight: var(--typography-body-medium-font-weight) !important;
  line-height: var(--typography-body-medium-line-height) !important;
  letter-spacing: var(--typography-body-medium-letter-spacing) !important;
  color: var(--divider-color);
  --_line-border: var(--divider-line-thickness) solid var(--divider-color);
}
.divider:not(.vertical) {
  width: 100%;
  padding: var(--divider-spacing) 0;
  align-items: center;
  justify-content: center;
}
.divider:not(.vertical) .line {
  width: 100%;
  border-top: var(--_line-border);
}
.divider:not(.vertical).slot-has-content .slot-container {
  padding: 0 var(--spacing-200);
}
.divider.vertical {
  height: 100%;
  padding: 0 var(--divider-spacing);
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.divider.vertical .line {
  height: 100%;
  border-right: var(--_line-border);
}
.divider.vertical.slot-has-content .slot-container {
  padding: var(--spacing-200) 0;
}

:host(:not([vertical])) {
  width: auto;
}

:host([vertical]) {
  height: auto;
}`;

/**
 * @label Divider
 * @tag wc-divider
 * @rawTag divider
 *
 * @summary The divider component is used to visually separate content.
 * @overview
 *  - Dividers are used to separate content into clear groups, making it easier for users to scan and understand the information presented.
 *  - They can be oriented either vertically or horizontally, depending on the layout requirements.
 *
 * @cssprop --divider-color - Controls the color of the divider.
 * @cssprop --divider-padding - Controls the padding of the divider.
 *
 * @example
 * ```html
 * <wc-divider style="width: 12rem;">or</wc-divider>
 * ```
 * @tags display
 */
let Divider = class Divider extends i$1 {
    constructor() {
        super(...arguments);
        /** When true, renders the divider vertically. Defaults to horizontal. */
        this.vertical = false;
        /** True when the default slot contains content, used to show the label variant. */
        this.slotHasContent = false;
    }
    firstUpdated() {
        observerSlotChangesWithCallback(this.renderRoot.querySelector('slot'), hasContent => {
            this.slotHasContent = hasContent;
            this.requestUpdate();
        });
    }
    render() {
        return b `<div
      class=${e({
            divider: true,
            vertical: this.vertical,
            'slot-has-content': this.slotHasContent,
        })}
    >
      <div class="line"></div>
      <div class="slot-container">
        <slot></slot>
      </div>
      <div class="line"></div>
    </div>`;
    }
};
Divider.styles = [css_248z];
__decorate([
    n({ type: Boolean, reflect: true })
], Divider.prototype, "vertical", void 0);
__decorate([
    r()
], Divider.prototype, "slotHasContent", void 0);
Divider = __decorate([
    IndividualComponent
], Divider);

export { Divider };
//# sourceMappingURL=divider.js.map
