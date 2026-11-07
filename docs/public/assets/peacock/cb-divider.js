import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { e } from './class-map-NDIkZErE.js';
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
  height: 100%;
  width: 100%;
  --cb-divider-line-color: var(--color-outline-variant);
}

.divider {
  display: flex;
}

.divider:not(.vertical) {
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.divider:not(.vertical) .line {
  height: 100%;
}
.divider:not(.vertical).connect-start .line-start {
  width: var(--cb-divider-arm-length, 1rem);
  margin-inline-start: var(--cb-divider-arm-length, 1rem);
  border-inline-start: 1px solid var(--cb-divider-line-color);
  border-top: 1px solid var(--cb-divider-line-color);
  border-start-start-radius: var(--shape-corner-extra-small);
}
.divider:not(.vertical):not(.connect-start) .line-start {
  border-inline-start: 1px solid var(--cb-divider-line-color);
}
.divider:not(.vertical).connect-end .line-end {
  width: var(--cb-divider-arm-length, 1rem);
  margin-inline-start: var(--cb-divider-arm-length, 1rem);
  border-inline-start: 1px solid var(--cb-divider-line-color);
  border-bottom: 1px solid var(--cb-divider-line-color);
  border-end-start-radius: var(--shape-corner-extra-small);
}
.divider:not(.vertical):not(.connect-end) .line-end {
  border-inline-start: 1px solid var(--cb-divider-line-color);
}
.divider:not(.vertical) .content {
  padding: var(--spacing-050) 0;
}

.divider.vertical {
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}
.divider.vertical .line {
  width: 100%;
}
.divider.vertical.connect-start .line-start {
  height: 1rem;
  margin-top: 1rem;
  border-top: 1px solid var(--cb-divider-line-color);
  border-inline-start: 1px solid var(--cb-divider-line-color);
  border-start-start-radius: var(--shape-corner-extra-small);
}
.divider.vertical:not(.connect-start) .line-start {
  border-top: 1px solid var(--cb-divider-line-color);
}
.divider.vertical.connect-end .line-end {
  height: 1rem;
  margin-top: 1rem;
  border-top: 1px solid var(--cb-divider-line-color);
  border-inline-end: 1px solid var(--cb-divider-line-color);
  border-start-end-radius: var(--shape-corner-extra-small);
}
.divider.vertical:not(.connect-end) .line-end {
  border-top: 1px solid var(--cb-divider-line-color);
}
.divider.vertical .content {
  padding: 0 var(--spacing-050);
}`;

/**
 * @label CB Divider
 * @tag wc-cb-divider
 * @rawTag cb-divider
 * @summary A divider line used within a condition builder to visually connect rules with an operator.
 *
 * @overview
 * <p>A line with its content, usually a tag naming the operator such as "and", in the middle.
 * It is drawn horizontally, or vertically with <code>vertical</code>.
 * <code>connect-start</code> and <code>connect-end</code> add connecting arms at either end, whose
 * length is set with <code>--cb-divider-arm-length</code>. It is decoration only, with no
 * behaviour or events.</p>
 * @cssprop --cb-divider-line-color - Color of the divider line.
 * @cssprop --cb-divider-arm-length - Length of the connecting arms drawn by `connect-start` and `connect-end`.
 * @tags condition-builder
 *
 * @example
 * ```html
 * <wc-cb-divider>
 *   <wc-tag accent="green">and</wc-tag>
 * </wc-cb-divider>
 * ```
 */
let CbDivider = class CbDivider extends i$1 {
    constructor() {
        super(...arguments);
        /** Whether to render the divider vertically instead of horizontally. */
        this.vertical = false;
        /** Whether to render a connecting line at the start. */
        this.connectStart = false;
        /** Whether to render a connecting line at the end. */
        this.connectEnd = false;
    }
    render() {
        const classes = {
            divider: true,
            'connect-start': this.connectStart,
            'connect-end': this.connectEnd,
            vertical: this.vertical,
        };
        return b `
      <div class=${e(classes)}>
        <div class="line line-start"></div>
        <div class="content">
          <slot></slot>
        </div>
        <div class="line line-end"></div>
      </div>
    `;
    }
};
CbDivider.styles = [css_248z];
__decorate([
    n({ type: Boolean, reflect: true })
], CbDivider.prototype, "vertical", void 0);
__decorate([
    n({ type: Boolean, reflect: true, attribute: 'connect-start' })
], CbDivider.prototype, "connectStart", void 0);
__decorate([
    n({ type: Boolean, reflect: true, attribute: 'connect-end' })
], CbDivider.prototype, "connectEnd", void 0);
CbDivider = __decorate([
    IndividualComponent
], CbDivider);

export { CbDivider };
//# sourceMappingURL=cb-divider.js.map
