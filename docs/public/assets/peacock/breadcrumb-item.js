import { i, _ as __decorate, I as IndividualComponent, a as i$1, A, b } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { r } from './state-BCeDVCI9.js';
import { e } from './class-map-NDIkZErE.js';
import { o } from './if-defined-D9DEJR_6.js';
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
  display: inline-flex;
  align-items: center;
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

.breadcrumb-item.current {
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
  margin-inline-start: var(--spacing-100);
  color: var(--color-outline);
  user-select: none;
  pointer-events: none;
}`;

/**
 * @label Breadcrumb Item
 * @tag wc-breadcrumb-item
 * @rawTag breadcrumb-item
 * @summary One link in a breadcrumb trail, or the current page as plain text.
 * @overview
 * <p>The item is the list item of the breadcrumb's list (<code>role="listitem"</code> on the
 * element itself, since the list sits in the breadcrumb's shadow root). Mark the page the user is on
 * with <code>current</code>: it renders as text with <code>aria-current="page"</code>.</p>
 * @tags navigation
 *
 * @example
 * ```html
 * <wc-breadcrumb-item href="#">Home</wc-breadcrumb-item>
 * ```
 */
let BreadcrumbItem = class BreadcrumbItem extends i$1 {
    constructor() {
        // ── Static ───────────────────────────────────────────────────────────────
        super(...arguments);
        /** Whether this item is the current page. Sets `aria-current="page"`. */
        this.current = false;
        // ── State ────────────────────────────────────────────────────────────────
        /** 1-based position among sibling breadcrumb items, used for schema.org `ListItem` metadata. */
        this.position = 1;
    }
    // ── Lifecycle ────────────────────────────────────────────────────────────
    connectedCallback() {
        super.connectedCallback();
        // The breadcrumb's `<ol>` is in its shadow root, so the item itself is the list item.
        if (!this.hasAttribute('role'))
            this.setAttribute('role', 'listitem');
        this.calculatePosition();
    }
    // ── Private methods ──────────────────────────────────────────────────────
    calculatePosition() {
        // Calculate position by counting sibling breadcrumb items
        if (this.parentElement) {
            const items = Array.from(this.parentElement.querySelectorAll(':scope > wc-breadcrumb-item'));
            this.position = items.indexOf(this) + 1;
        }
    }
    // ── Render ───────────────────────────────────────────────────────────────
    render() {
        return b `
      <div
        class=${e({ 'breadcrumb-item': true, current: this.current })}
        itemprop="itemListElement"
        itemscope
        itemtype="https://schema.org/ListItem"
      >
        ${this.current
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
                rel=${this.target === '_blank'
                ? 'noopener noreferrer'
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
      </div>
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
], BreadcrumbItem.prototype, "current", void 0);
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
