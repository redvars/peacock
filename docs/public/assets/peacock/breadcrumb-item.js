import { i, _ as __decorate, I as IndividualComponent, a as i$1, A, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { r } from './state-DkTK9EGF.js';
import { e } from './class-map-DG7CA1et.js';
import { o } from './if-defined-BXZpRQ4P.js';
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
  display: contents;
}

.breadcrumb-item {
  display: inline-flex;
  align-items: center;
  font-family: var(--typography-body-medium-font-family) !important;
  font-size: var(--typography-body-medium-font-size) !important;
  font-weight: var(--typography-body-medium-font-weight) !important;
  line-height: var(--typography-body-medium-line-height) !important;
  letter-spacing: var(--typography-body-medium-letter-spacing) !important;
}

.breadcrumb-item.active {
  font-family: var(--typography-body-medium-emphasized-font-family) !important;
  font-size: var(--typography-body-medium-emphasized-font-size) !important;
  font-weight: var(--typography-body-medium-emphasized-font-weight) !important;
  line-height: var(--typography-body-medium-emphasized-line-height) !important;
  letter-spacing: var(--typography-body-medium-emphasized-letter-spacing) !important;
  color: var(--color-on-surface);
}

.breadcrumb-link {
  color: var(--color-primary);
  text-decoration: none;
  border-radius: var(--border-radius-050);
  transition: color 0.2s ease, text-decoration 0.2s ease;
}
.breadcrumb-link:hover {
  color: var(--color-primary);
  text-decoration: underline;
}
.breadcrumb-link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  text-decoration: underline;
}
.breadcrumb-link:active {
  color: var(--color-primary);
}

.separator {
  display: inline-block;
  margin-left: var(--spacing-100);
  color: var(--color-outline);
  user-select: none;
  pointer-events: none;
}`;

/**
 * @label Breadcrumb Item
 * @tag wc-breadcrumb-item
 * @rawTag breadcrumb-item
 * @summary A breadcrumb item component that represents a single item in a breadcrumb navigation.
 * @tags navigation
 *
 * @example
 * ```html
 * <wc-breadcrumb-item href="#">Home</wc-breadcrumb-item>
 * ```
 */
let BreadcrumbItem = class BreadcrumbItem extends i$1 {
    constructor() {
        super(...arguments);
        /**
         * Indicates if this is the active (current) breadcrumb item.
         */
        this.active = false;
        /** 1-based position among sibling breadcrumb items, used for schema.org `ListItem` metadata. */
        this.position = 1;
    }
    connectedCallback() {
        super.connectedCallback();
        this.calculatePosition();
    }
    calculatePosition() {
        // Calculate position by counting sibling breadcrumb items
        if (this.parentElement) {
            const items = Array.from(this.parentElement.querySelectorAll('p-breadcrumb-item'));
            this.position = items.indexOf(this) + 1;
        }
    }
    render() {
        return b `
      <li
        class=${e({ 'breadcrumb-item': true, active: this.active })}
        itemprop="itemListElement"
        itemscope
        itemtype="https://schema.org/ListItem"
      >
        ${this.active
            ? b `
              <span aria-current="page" itemprop="name">
                <slot></slot>
              </span>
            `
            : b `
              <a
                class="breadcrumb-link"
                itemprop="item"
                href=${o(this.href)}
                target=${o(this.target)}
                ${this.target === '_blank'
                ? b `rel="noopener noreferrer"`
                : A}
              >
                <span itemprop="name">
                  <slot></slot>
                </span>
              </a>
            `}
        <meta itemprop="position" content=${String(this.position)} />
        ${this.separator
            ? b `<span class="separator" aria-hidden="true"
              >${this.separator}</span
            >`
            : A}
      </li>
    `;
    }
};
BreadcrumbItem.styles = [css_248z];
__decorate([
    n({ reflect: true })
], BreadcrumbItem.prototype, "href", void 0);
__decorate([
    n()
], BreadcrumbItem.prototype, "target", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], BreadcrumbItem.prototype, "active", void 0);
__decorate([
    n({ type: String })
], BreadcrumbItem.prototype, "separator", void 0);
__decorate([
    r()
], BreadcrumbItem.prototype, "position", void 0);
BreadcrumbItem = __decorate([
    IndividualComponent
], BreadcrumbItem);

export { BreadcrumbItem };
//# sourceMappingURL=breadcrumb-item.js.map
