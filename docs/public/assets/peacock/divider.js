import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { r } from './state-BCeDVCI9.js';
import { e } from './class-map-NDIkZErE.js';
import { o as observerSlotChangesWithCallback } from './observe-slot-change-DPxaZrZF.js';
import './directive-ZPhl09Yt.js';

var css_248z = i`* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.screen-reader-only {
  position: absolute !important;
  inline-size: 1px !important;
  block-size: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip-path: inset(50%) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

[hidden] {
  display: none !important;
}

@media (forced-colors: active) {
  .selected,
  [aria-selected=true],
  [aria-pressed=true],
  [aria-checked=true],
  [aria-current]:not([aria-current=false]) {
    outline: 2px solid Highlight;
    outline-offset: -2px;
  }
  .disabled,
  [aria-disabled=true] {
    color: GrayText;
  }
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
  inline-size: 100%;
  padding-block: var(--divider-spacing);
  align-items: center;
  justify-content: center;
}
.divider:not(.vertical) .line {
  inline-size: 100%;
  border-block-start: var(--_line-border);
}
.divider:not(.vertical).slot-has-content .slot-container {
  padding-inline: var(--spacing-200);
}
.divider.vertical {
  block-size: 100%;
  padding-inline: var(--divider-spacing);
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.divider.vertical .line {
  block-size: 100%;
  border-inline-end: var(--_line-border);
}
.divider.vertical.slot-has-content .slot-container {
  padding-block: var(--spacing-200);
}

:host(:not([orientation=vertical])) {
  inline-size: auto;
}

:host([orientation=vertical]) {
  block-size: auto;
}`;

/**
 * @label Divider
 * @tag wc-divider
 * @rawTag divider
 *
 * @summary A horizontal or vertical line that separates groups of content, with an optional label such as "or".
 * @overview
 * <ul>
 * <li>Dividers are used to separate content into clear groups, making it easier for users to scan
 * and understand the information presented.</li>
 * <li>Set <code>orientation</code> to <code>horizontal</code> (the default) or
 * <code>vertical</code>, depending on the layout.</li>
 * <li>Content in the default slot, such as "or", shows in the middle of the line.</li>
 * <li>The host is <code>role="separator"</code> with a matching <code>aria-orientation</code>.</li>
 * </ul>
 *
 * @cssprop --divider-color - Controls the color of the divider.
 * @cssprop --divider-spacing - Controls the space around the divider.
 * @cssprop [--divider-line-thickness=1px] - Controls the thickness of the line.
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
        /** Direction of the line. */
        this.orientation = 'horizontal';
        /** True when the default slot contains content, used to show the label variant. */
        this.slotHasContent = false;
    }
    // ── Lifecycle ─────────────────────────────────────────────────────────────
    connectedCallback() {
        super.connectedCallback();
        if (!this.hasAttribute('role')) {
            this.setAttribute('role', 'separator');
        }
    }
    willUpdate(changed) {
        if (changed.has('orientation')) {
            this.setAttribute('aria-orientation', this.orientation);
        }
    }
    firstUpdated() {
        observerSlotChangesWithCallback(this.renderRoot.querySelector('slot'), hasContent => {
            this.slotHasContent = hasContent;
        });
    }
    // ── Render ────────────────────────────────────────────────────────────────
    render() {
        return b `<div
      class=${e({
            divider: true,
            vertical: this.orientation === 'vertical',
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
    n({ reflect: true })
], Divider.prototype, "orientation", void 0);
__decorate([
    r()
], Divider.prototype, "slotHasContent", void 0);
Divider = __decorate([
    IndividualComponent
], Divider);

export { Divider };
//# sourceMappingURL=divider.js.map
