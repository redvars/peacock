import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';

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
  display: none;
  flex: 1;
}

:host([active]) {
  display: block;
}`;

/**
 * @label Tab Panel
 * @tag wc-tab-panel
 * @rawTag tab-panel
 *
 * @summary The content of one tab, shown while that tab is selected.
 * @overview
 * <p>The panel has <code>role="tabpanel"</code>;
 * inside a <code>wc-tab-group</code> it is labelled by its tab (<code>aria-labelledby</code>) and
 * shown while that tab is selected. It is focusable, so keyboard users reach the content right
 * after the tab list.</p>
 *
 * @example
 * ```html
 * <wc-tab-panel>Content for this tab</wc-tab-panel>
 * ```
 * @tags navigation
 */
let TabPanel = class TabPanel extends i$1 {
    constructor() {
        // ── Static
        super(...arguments);
        /** Whether the panel is shown; set by `wc-tab-group` from the selected tab. */
        this.active = false;
    }
    // ── Lifecycle
    connectedCallback() {
        super.connectedCallback();
        if (!this.hasAttribute('role'))
            this.setAttribute('role', 'tabpanel');
        if (!this.hasAttribute('tabindex'))
            this.tabIndex = 0;
    }
    // ── Render
    render() {
        return b `<slot></slot>`;
    }
};
TabPanel.styles = [css_248z];
__decorate([
    n({ reflect: true })
], TabPanel.prototype, "value", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], TabPanel.prototype, "active", void 0);
TabPanel = __decorate([
    IndividualComponent
], TabPanel);

export { TabPanel };
//# sourceMappingURL=tab-panel.js.map
