import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';

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
 * @summary Content panel for tabs.
 * @overview
 * <p>TabPanel contains the content associated with a tab.</p>
 *
 * @example
 * ```html
 * <wc-tab-panel>Content for this tab</wc-tab-panel>
 * ```
 * @tags navigation
 */
let TabPanel = class TabPanel extends i$1 {
    constructor() {
        super(...arguments);
        this.active = false;
    }
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
