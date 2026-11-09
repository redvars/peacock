import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { BreadcrumbItem } from './breadcrumb-item.js';
import { I as I18nController } from './i18n-controller-DLJcJ5gO.js';
import './state-BCeDVCI9.js';
import './class-map-NDIkZErE.js';
import './directive-ZPhl09Yt.js';
import './if-defined-D9DEJR_6.js';
import './strings-MXyrGrNs.js';
import './locale-DEsJZCQG.js';

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
  margin-bottom: var(--spacing-050);
}

.breadcrumb {
  width: 100%;
}

ol {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin: 0;
  padding: 0;
  list-style: none;
}

::slotted(:not(:last-child))::after {
  display: inline-block;
  padding-inline: var(--spacing-100);
  color: var(--color-outline);
  content: "/";
  user-select: none;
  pointer-events: none;
}`;

/**
 * @label Breadcrumb
 * @tag wc-breadcrumb
 * @rawTag breadcrumb
 * @summary A trail of links that shows where the current page sits in the site and leads back up it.
 * @overview
 * <ul>
 * <li>Breadcrumbs provide a trail for users to follow back to the starting or entry point.</li>
 * <li>They help users understand their current location within the site hierarchy.</li>
 * <li>Follows WCAG 2.1 guidelines for accessible navigation landmarks: the breadcrumb is a
 * <code>&lt;nav&gt;</code> landmark named by <code>label</code> (by default Peacock's
 * <code>breadcrumb</code> string) holding an ordered list, and each
 * <code>wc-breadcrumb-item</code> is one of its list items.</li>
 * <li>Mark the page the user is on with <code>current</code> on its item: it renders as text with
 * <code>aria-current="page"</code>.</li>
 * </ul>
 * @tags navigation
 *
 * @example
 * ```html
 * <wc-breadcrumb label="Breadcrumb">
 *   <wc-breadcrumb-item href="#">Home</wc-breadcrumb-item>
 *   <wc-breadcrumb-item href="#">Category</wc-breadcrumb-item>
 *   <wc-breadcrumb-item current>Current Page</wc-breadcrumb-item>
 * </wc-breadcrumb>
 * ```
 */
let Breadcrumb = class Breadcrumb extends i$1 {
    constructor() {
        super(...arguments);
        /**
         * Accessible label for the breadcrumb navigation landmark. Defaults to Peacock's `breadcrumb` string.
         */
        this.label = '';
        /** Peacock's strings for the default landmark label. */
        this.i18n = new I18nController(this);
    }
    render() {
        return b `<nav
      aria-label=${this.label || this.i18n.t('breadcrumb')}
      class="breadcrumb"
    >
      <ol itemscope itemtype="https://schema.org/BreadcrumbList">
        <slot></slot>
      </ol>
    </nav>`;
    }
};
Breadcrumb.styles = [css_248z];
Breadcrumb.Item = BreadcrumbItem;
__decorate([
    n({ type: String })
], Breadcrumb.prototype, "label", void 0);
Breadcrumb = __decorate([
    IndividualComponent
], Breadcrumb);

export { Breadcrumb };
//# sourceMappingURL=breadcrumb.js.map
