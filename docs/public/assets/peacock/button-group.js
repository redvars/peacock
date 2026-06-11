import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { Button } from './button.js';
import { IconButton } from './icon-button.js';
import './query-CHb9Ft_d.js';
import './base-Cl6v8-BZ.js';
import './class-map-DG7CA1et.js';
import './directive-ZPhl09Yt.js';
import './if-defined-BXZpRQ4P.js';
import './when-DEJm_QN9.js';
import './is-link-Dk2OV3PM.js';
import './observe-slot-change-DPxaZrZF.js';
import './dispatch-event-utils-CuEqjlPT.js';
import './ButtonConstants-CahP2_NA.js';
import './element-internals-2CMts_0M.js';
import './form-associated-BXADnjOB.js';
import './hyperlink-DLvb6MXE.js';
import './throttle-C7ZAPqtu.js';

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
  --button-group-spacing: unset;
  display: flex;
  gap: var(--button-group-spacing, var(--private-button-group-spacing));
}

:host([size=xs]),
:host([size=extra-small]) {
  --private-button-group-spacing: var(--spacing-200);
}

:host([size=sm]),
:host([size=small]) {
  --private-button-group-spacing: var(--spacing-150);
}

:host([size=md]),
:host([size=medium]),
:host([size=lg]),
:host([size=large]),
:host([size=xl]),
:host([size=extra-large]) {
  --private-button-group-spacing: var(--spacing-100);
}

:host([connected]) {
  --private-button-group-spacing: var(--spacing-025);
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
 * @summary Group a series of buttons together on a single line with the button group, and super-power.

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
         * Possible values are `"sm"`, `"md"`, `"lg"`. Defaults to `"md"`.
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
