import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { BreadcrumbItem } from './breadcrumb-item.js';
import './state-DkTK9EGF.js';
import './class-map-DG7CA1et.js';
import './directive-ZPhl09Yt.js';
import './if-defined-BXZpRQ4P.js';

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
  padding-right: var(--spacing-100);
  padding-left: var(--spacing-100);
  color: var(--color-outline);
  content: "/";
  user-select: none;
  pointer-events: none;
}`;

/**
 * @label Breadcrumb
 * @tag wc-breadcrumb
 * @rawTag breadcrumb
 * @summary A breadcrumb is a secondary navigation scheme that reveals the user's location in a website or web application.
 * @overview
 *  - Breadcrumbs provide a trail for users to follow back to the starting or entry point.
 *  - They help users understand their current location within the site hierarchy.
 *  - Follows WCAG 2.1 guidelines for accessible navigation landmarks.
 * @tags navigation
 *
 * @example
 * ```html
 * <wc-breadcrumb label="Breadcrumb">
 *   <wc-breadcrumb-item href="#">Home</wc-breadcrumb-item>
 *   <wc-breadcrumb-item href="#">Category</wc-breadcrumb-item>
 *   <wc-breadcrumb-item active>Current Page</wc-breadcrumb-item>
 * </wc-breadcrumb>
 * ```
 */
let Breadcrumb = class Breadcrumb extends i$1 {
    constructor() {
        super(...arguments);
        /**
         * Accessible label for the breadcrumb navigation landmark.
         */
        this.label = 'Breadcrumb';
    }
    render() {
        return b `<nav aria-label=${this.label} class="breadcrumb">
      <ol>
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
