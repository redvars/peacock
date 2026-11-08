import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { Button } from './button.js';
import { IconButton } from './icon-button.js';
import './query-CHb9Ft_d.js';
import './base-Cl6v8-BZ.js';
import './class-map-NDIkZErE.js';
import './directive-ZPhl09Yt.js';
import './if-defined-D9DEJR_6.js';
import './when-DEJm_QN9.js';
import './observe-slot-change-DPxaZrZF.js';
import './throttle-SQ9t-HL7.js';
import './ButtonConstants-CahP2_NA.js';
import './delegate-Bw2wdPFP.js';
import './form-submitter-beG1CXAn.js';
import './element-internals-QME0yEz4.js';
import './base-button-BJMGMcMv.js';
import './warn-once-BNxX1Y98.js';
import './form-associated-BHbg72PG.js';
import './is-link-Dk2OV3PM.js';
import './hyperlink-DycWPKwU.js';

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
  --button-group-spacing: unset;
  display: flex;
  gap: var(--button-group-spacing, var(--_button-group-spacing));
}

:host([size=xs]) {
  --_button-group-spacing: var(--spacing-200);
}

:host([size=sm]) {
  --_button-group-spacing: var(--spacing-150);
}

:host([size=md]),
:host([size=lg]),
:host([size=xl]) {
  --_button-group-spacing: var(--spacing-100);
}

:host([connected]) {
  --_button-group-spacing: var(--spacing-025);
}

:host([connected]) slot::slotted(*) {
  --button-container-shape-start-start: var(--shape-corner-medium);
  --button-container-shape-end-start: var(--shape-corner-medium);
  --button-container-shape-start-end: var(--shape-corner-medium);
  --button-container-shape-end-end: var(--shape-corner-medium);
  --button-container-shape-variant: round;
}

:host([connected]) slot::slotted(:first-child:not([selected])) {
  --button-container-shape-start-start: calc(var(--button-height) / 2);
  --button-container-shape-end-start: calc(var(--button-height) / 2);
  --button-container-shape-start-end: var(--shape-corner-medium);
  --button-container-shape-end-end: var(--shape-corner-medium);
  --button-container-shape-variant: round;
}

:host([connected]) slot::slotted(:last-child:not([selected])) {
  --button-container-shape-start-start: var(--shape-corner-medium);
  --button-container-shape-end-start: var(--shape-corner-medium);
  --button-container-shape-start-end: calc(var(--button-height) / 2);
  --button-container-shape-end-end: calc(var(--button-height) / 2);
  --button-container-shape-variant: round;
}

:host([connected]) slot::slotted(:only-child:not([selected])) {
  --button-container-shape-start-start: var(--shape-corner-medium);
  --button-container-shape-end-start: var(--shape-corner-medium);
  --button-container-shape-start-end: var(--shape-corner-medium);
  --button-container-shape-end-end: var(--shape-corner-medium);
  --button-container-shape-variant: round;
}`;

/**
 * @label Button Group
 * @tag wc-button-group
 * @rawTag button-group
 *
 * @summary A row of related buttons or icon buttons that share one size, color and style.
 *
 * @overview
 * <p>Put <code>wc-button</code> or <code>wc-icon-button</code> elements inside. The group passes
 * its <code>size</code> (<code>sm</code> by default), and its <code>color</code> and
 * <code>variant</code> when set, to every button, overriding what the buttons set themselves.</p>
 * <p>By default the buttons sit with a small gap between them. With <code>connected</code> they sit
 * 2px apart with rounded outer corners, for a set such as bold, italic and underline toggles.</p>
 * <p>The group is layout only: it adds no group role, keyboard handling or selection, so each
 * button keeps its own focus stop and toggle state. For choosing one or several options from a
 * set use <code>wc-segmented-button-group</code>.</p>
 *
 * @example
 * ```html
 * <wc-button-group connected>
 *  <wc-icon-button toggle="true" shape="wide" selected>
 *    <wc-icon name="format_bold"></wc-icon>
 *  </wc-icon-button>
 *  <wc-icon-button toggle="true" shape="wide">
 *    <wc-icon name="format_italic"></wc-icon>
 *  </wc-icon-button>
 *  <wc-icon-button toggle="true" shape="wide">
 *    <wc-icon name="format_underlined"></wc-icon>
 *  </wc-icon-button>
 * </wc-button-group>
 * ```
 *
 * @tags controls
 */
let ButtonGroup = class ButtonGroup extends i$1 {
    constructor() {
        super(...arguments);
        /**
         * Button size.
         * Possible values are `"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"`. Defaults to `"sm"`.
         */
        this.size = 'sm';
        /**
         * Layout variant of the button group.
         * `"standard"` shows buttons with a small gap between them.
         * `"connected"` places buttons with a 2px gap;
         * rounded outer corners and middle buttons keep standard rounded corners.
         * Defaults to `"standard"`.
         */
        this.connected = false;
    }
    updated() {
        this._syncButtonProperties();
    }
    _getSlottedElements() {
        const slot = this.shadowRoot?.querySelector('slot');
        return (slot?.assignedElements({ flatten: true }) ?? []);
    }
    _syncButtonProperties() {
        const children = this._getSlottedElements();
        children.forEach((child, index) => {
            ['color', 'variant', 'toggle', 'size'].forEach(prop => {
                // @ts-ignore
                if (this[prop] && prop in child) {
                    // @ts-ignore
                    child[prop] = this[prop];
                }
            });
        });
    }
    render() {
        return b `
      <slot @slotchange=${() => this._syncButtonProperties()}></slot>
    `;
    }
};
// Lit prefers CSS-in-JS for better performance and scoping.
// If you prefer keeping the SCSS file, you'll need a build tool (like Vite or Webpack)
// that can import .scss files as lit-css.
ButtonGroup.styles = [css_248z];
ButtonGroup.Button = Button;
ButtonGroup.IconButton = IconButton;
__decorate([
    n({ reflect: true })
], ButtonGroup.prototype, "size", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], ButtonGroup.prototype, "connected", void 0);
__decorate([
    n({ reflect: true })
], ButtonGroup.prototype, "color", void 0);
__decorate([
    n({ attribute: 'variant', reflect: true })
], ButtonGroup.prototype, "variant", void 0);
ButtonGroup = __decorate([
    IndividualComponent
], ButtonGroup);
var ButtonGroup$1 = ButtonGroup;

export { ButtonGroup$1 as default };
//# sourceMappingURL=button-group.js.map
