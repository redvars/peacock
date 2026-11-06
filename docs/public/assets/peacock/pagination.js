import { i, _ as __decorate, I as IndividualComponent, a as i$1, b, A } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { e } from './class-map-DG7CA1et.js';
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
  display: block;
  container-type: inline-size;
  --pagination-background: var(--color-surface, #fff);
  --_pagination-target-size: 2.5rem;
}

.pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-100, 0.5rem) var(--spacing-300, 1.5rem);
  padding: var(--spacing-100, 0.5rem) var(--spacing-200, 1rem);
  background: var(--pagination-background);
  color: var(--color-on-surface-variant);
  font-family: var(--typography-body-medium-font-family);
  font-size: var(--typography-body-medium-font-size);
  font-weight: var(--typography-body-medium-font-weight);
  line-height: var(--typography-body-medium-line-height);
  letter-spacing: var(--typography-body-medium-letter-spacing);
}

.range {
  flex: 1 1 auto;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.page-size {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-100, 0.5rem);
}

.page-size-label {
  white-space: nowrap;
}

.page-size-select {
  inline-size: 5.5rem;
  --field-height: var(--_pagination-target-size);
  --field-padding-block: 0;
}

.controls {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-050, 0.25rem);
}

.nav-button {
  --button-container-shape: var(--shape-corner-full);
}

.page-list {
  display: flex;
  align-items: center;
  gap: var(--spacing-025, 0.125rem);
  margin: 0;
  padding: 0;
  list-style: none;
}

.page-button {
  background: transparent;
  border: none;
  appearance: none;
  margin: 0;
  outline: none;
  padding: 0;
  font-family: var(--typography-label-large-font-family);
  font-size: var(--typography-label-large-font-size);
  font-weight: var(--typography-label-large-font-weight);
  line-height: var(--typography-label-large-line-height);
  letter-spacing: var(--typography-label-large-letter-spacing);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-inline-size: var(--_pagination-target-size);
  block-size: var(--_pagination-target-size);
  padding: 0 var(--spacing-100, 0.5rem);
  border-radius: var(--shape-corner-full);
  color: var(--color-on-surface-variant);
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  transition: background-color var(--duration-short2, 100ms) ease;
}
.page-button:hover {
  background: color-mix(in srgb, var(--color-on-surface) 8%, transparent);
}
.page-button:active {
  background: color-mix(in srgb, var(--color-on-surface) 12%, transparent);
}
.page-button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
.page-button.current {
  background: var(--color-secondary-container);
  color: var(--color-on-secondary-container);
  cursor: default;
}

.page-ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-inline-size: var(--_pagination-target-size);
  block-size: var(--_pagination-target-size);
  user-select: none;
}

.page-jump {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-100, 0.5rem);
  padding-inline: var(--spacing-050, 0.25rem);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.page-input {
  font-family: var(--typography-body-medium-font-family);
  font-size: var(--typography-body-medium-font-size);
  font-weight: var(--typography-body-medium-font-weight);
  line-height: var(--typography-body-medium-line-height);
  letter-spacing: var(--typography-body-medium-letter-spacing);
  inline-size: 3.5rem;
  block-size: 2rem;
  padding: 0 var(--spacing-100, 0.5rem);
  border: 1px solid var(--color-outline-variant);
  border-radius: var(--shape-corner-small);
  background: var(--color-surface);
  color: var(--color-on-surface);
  text-align: center;
  font-variant-numeric: tabular-nums;
  appearance: textfield;
}
.page-input::-webkit-inner-spin-button, .page-input::-webkit-outer-spin-button {
  appearance: none;
  margin: 0;
}
.page-input:hover {
  border-color: var(--color-outline);
}
.page-input:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -1px;
  border-color: transparent;
}

.variant-full .page-jump {
  display: none;
}

@container (max-width: 40rem) {
  .variant-full .page-list {
    display: none;
  }
  .variant-full .page-jump {
    display: inline-flex;
  }
  .page-size-label {
    display: none;
  }
}
@container (max-width: 26rem) {
  .controls {
    flex-basis: 100%;
    justify-content: space-between;
  }
}
.visually-hidden {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}`;

function range(from, to) {
    return Array.from({ length: to - from + 1 }, (_, index) => from + index);
}
/**
 * Builds the page list shown by the `full` pagination variant.
 *
 * The list always keeps the first and last page, the current page and `siblings` pages on each
 * side of it, and fills the rest with an ellipsis. It never holds more than
 * `2 * siblings + 5` slots, so the control keeps its width while the user moves through pages.
 *
 * @example
 * getPageItems(5, 24); // [1, 'ellipsis', 4, 5, 6, 'ellipsis', 24]
 * getPageItems(2, 24); // [1, 2, 3, 4, 5, 'ellipsis', 24]
 */
function getPageItems(current, total, siblings = 1) {
    const totalPages = Math.max(1, Math.trunc(total));
    const page = Math.min(Math.max(1, Math.trunc(current)), totalPages);
    const maxSlots = 2 * siblings + 5;
    if (totalPages <= maxSlots) {
        return range(1, totalPages);
    }
    const start = Math.max(page - siblings, 1);
    const end = Math.min(page + siblings, totalPages);
    // A gap of one page is shown as that page; only a gap of two or more becomes an ellipsis.
    const showStartGap = start > 3;
    const showEndGap = end < totalPages - 2;
    // Pages shown on the side without a gap: the window, the edge page and the slot the
    // ellipsis would have taken.
    const edgeCount = 2 * siblings + 3;
    if (!showStartGap && showEndGap) {
        return [...range(1, edgeCount), 'ellipsis', totalPages];
    }
    if (showStartGap && !showEndGap) {
        return [1, 'ellipsis', ...range(totalPages - edgeCount + 1, totalPages)];
    }
    return [1, 'ellipsis', ...range(start, end), 'ellipsis', totalPages];
}

const DEFAULT_PAGE_SIZES = [10, 25, 50, 100];
/**
 * @label Pagination
 * @tag wc-pagination
 * @rawTag pagination
 * @summary A pagination control with page numbers, a rows-per-page selector and the current item range.
 * @overview
 * <p>The pagination component moves through paged data. It shows the current item range, the pages and a rows-per-page selector.</p>
 * <p>Three variants cover different data sets: <code>full</code> lists page numbers with ellipses, <code>compact</code> shows "Page [n] of N" with a field to jump to a page, and <code>simple</code> shows previous and next only. When <code>total-items</code> is not set, the total is unknown (cursor-based APIs): the control shows previous and next, and <code>has-next</code> says whether another page exists.</p>
 * <p>On a narrow container the <code>full</code> variant collapses to <code>compact</code>.</p>
 *
 * @fires {CustomEvent} page - Dispatched when the page or page size changes. Detail: `{ page, pageSize }`.
 *
 * @cssprop --pagination-background - Background of the control. Defaults to the surface color.
 *
 * @example
 * ```html
 * <wc-pagination style="width: 100%;" page="1" page-size="10" total-items="240"></wc-pagination>
 * ```
 * @tags navigation, data
 */
let Pagination = class Pagination extends i$1 {
    constructor() {
        // ── Static ───────────────────────────────────────────────────────────────
        super(...arguments);
        // ── Properties ───────────────────────────────────────────────────────────
        /**
         * The current page number (1-based). Defaults to `1`.
         */
        this.page = 1;
        /**
         * The number of rows per page. Defaults to `10`.
         */
        this.pageSize = 10;
        /**
         * Supported page size options.
         */
        this.pageSizes = DEFAULT_PAGE_SIZES;
        /**
         * How the pages are shown: `full` (page numbers), `compact` ("Page [n] of N") or `simple`
         * (previous and next only). Defaults to `full`.
         */
        this.variant = 'full';
        /**
         * Whether another page exists after this one. Used only when `total-items` is unset.
         */
        this.hasNext = false;
        /**
         * Shows buttons that jump to the first and the last page.
         */
        this.showFirstLast = false;
        /**
         * Hides the rows-per-page selector.
         */
        this.hidePageSize = false;
        /**
         * Accessible name of the navigation landmark. Defaults to `"Pagination"`.
         */
        this.label = 'Pagination';
        this.handlePageInput = (event) => {
            const input = event.target;
            const value = Number.parseInt(input.value, 10);
            if (Number.isFinite(value)) {
                this.setPage(value);
            }
            // Show the page actually used, for example after clamping 99 to the last page.
            input.value = String(this.page);
        };
        this.handlePageInputKeydown = (event) => {
            if (event.key === 'Enter') {
                this.handlePageInput(event);
            }
        };
    }
    // ── Lifecycle ────────────────────────────────────────────────────────────
    willUpdate(changedProperties) {
        // Normalize page-size options so the select always has valid numeric values.
        const normalizedPageSizes = [
            ...new Set(this.pageSizes
                .map(size => Number(size))
                .filter(size => Number.isFinite(size) && size > 0)
                .map(size => Math.trunc(size))),
        ];
        if (!normalizedPageSizes.length) {
            normalizedPageSizes.push(...DEFAULT_PAGE_SIZES);
        }
        if (changedProperties.has('pageSizes') &&
            (this.pageSizes.length !== normalizedPageSizes.length ||
                this.pageSizes.some((size, index) => size !== normalizedPageSizes[index]))) {
            this.pageSizes = normalizedPageSizes;
        }
        if (!this.pageSizes.includes(this.pageSize)) {
            this.pageSize = this.pageSizes[0] ?? DEFAULT_PAGE_SIZES[0];
        }
        if (this.totalItems !== undefined &&
            this.totalItems !== null &&
            (!Number.isFinite(this.totalItems) || this.totalItems < 0)) {
            this.totalItems = 0;
        }
        if (!Number.isFinite(this.page) || this.page < 1) {
            this.page = 1;
        }
        const totalPages = this.getTotalPages();
        if (totalPages !== undefined && this.page > totalPages) {
            this.page = totalPages;
        }
    }
    // ── Private methods ──────────────────────────────────────────────────────
    /** True when the total is known. */
    get hasTotal() {
        return this.totalItems !== undefined && this.totalItems !== null;
    }
    /** The number of pages, or `undefined` when the total is unknown. */
    getTotalPages() {
        if (!this.hasTotal)
            return undefined;
        const total = this.totalItems ?? 0;
        if (total <= 0)
            return 1;
        return Math.max(1, Math.ceil(total / this.pageSize));
    }
    get isFirstPage() {
        return this.page <= 1;
    }
    get isLastPage() {
        const totalPages = this.getTotalPages();
        return totalPages === undefined ? !this.hasNext : this.page >= totalPages;
    }
    /** The variant actually rendered: an unknown total can only go previous and next. */
    get effectiveVariant() {
        return this.hasTotal ? this.variant : 'simple';
    }
    getRangeText() {
        const total = this.totalItems ?? 0;
        if (this.hasTotal && total === 0)
            return '0 of 0';
        const start = this.pageSize * (this.page - 1) + 1;
        if (!this.hasTotal)
            return `${start}–${this.pageSize * this.page}`;
        const end = Math.min(this.pageSize * this.page, total);
        return `${start}–${end} of ${total}`;
    }
    setPage(nextPage) {
        const totalPages = this.getTotalPages() ?? Number.MAX_SAFE_INTEGER;
        const lastAllowed = this.hasTotal || this.hasNext ? totalPages : Math.max(1, this.page);
        const clampedPage = Math.min(Math.max(1, Math.trunc(nextPage)), lastAllowed);
        if (!Number.isFinite(clampedPage) || clampedPage === this.page)
            return;
        this.page = clampedPage;
        this.dispatchPageEvent();
    }
    handlePageSizeChange(event) {
        const rawValue = event.detail?.value;
        const parsedPageSize = Number.parseInt(rawValue ?? '', 10);
        if (!Number.isFinite(parsedPageSize) || parsedPageSize <= 0) {
            return;
        }
        if (parsedPageSize === this.pageSize)
            return;
        // Keep the first visible item on screen instead of jumping back to page 1.
        const firstItemIndex = this.pageSize * (this.page - 1);
        this.pageSize = parsedPageSize;
        this.page = Math.floor(firstItemIndex / parsedPageSize) + 1;
        this.dispatchPageEvent();
    }
    dispatchPageEvent() {
        this.dispatchEvent(new CustomEvent('page', {
            detail: { page: this.page, pageSize: this.pageSize },
            bubbles: true,
            composed: true,
        }));
    }
    // ── Render helpers ───────────────────────────────────────────────────────
    renderNavButton(icon, label, disabled, target, className) {
        return b `
      <wc-icon-button
        class="nav-button ${className}"
        color="secondary"
        variant="text"
        size="sm"
        aria-label=${label}
        title=${label}
        ?disabled=${disabled}
        @click=${() => this.setPage(target())}
      >
        <wc-icon name=${icon}></wc-icon>
      </wc-icon-button>
    `;
    }
    renderPageList(totalPages) {
        return b `
      <ol class="page-list">
        ${getPageItems(this.page, totalPages).map(item => item === 'ellipsis'
            ? b `<li class="page-ellipsis" aria-hidden="true">…</li>`
            : b `
                <li>
                  <button
                    type="button"
                    class=${e({
                'page-button': true,
                current: item === this.page,
            })}
                    aria-label="Page ${item}"
                    aria-current=${item === this.page ? 'page' : A}
                    @click=${() => this.setPage(item)}
                  >
                    ${item}
                  </button>
                </li>
              `)}
      </ol>
    `;
    }
    renderPageJump(totalPages) {
        return b `
      <div class="page-jump">
        <span>Page</span>
        <input
          class="page-input"
          type="number"
          inputmode="numeric"
          min="1"
          max=${totalPages}
          .value=${String(this.page)}
          aria-label="Page number, ${totalPages} pages"
          @change=${this.handlePageInput}
          @keydown=${this.handlePageInputKeydown}
        />
        <span>of ${totalPages}</span>
      </div>
    `;
    }
    renderPageSize() {
        if (this.hidePageSize)
            return A;
        return b `
      <div class="page-size">
        <span class="page-size-label" aria-hidden="true">Rows per page</span>
        <wc-select
          class="page-size-select"
          .value=${String(this.pageSize)}
          aria-label="Rows per page"
          @change=${this.handlePageSizeChange}
        >
          ${this.pageSizes.map(size => b `<wc-option value=${String(size)}>${size}</wc-option>`)}
        </wc-select>
      </div>
    `;
    }
    // ── Render ───────────────────────────────────────────────────────────────
    render() {
        const variant = this.effectiveVariant;
        const totalPages = this.getTotalPages() ?? 1;
        const rangeText = this.getRangeText();
        const showFirstLast = this.showFirstLast && this.hasTotal;
        return b `
      <nav
        class=${e({ pagination: true, [`variant-${variant}`]: true })}
        aria-label=${this.label}
      >
        <div class="range" aria-hidden="true">${rangeText}</div>
        <span class="visually-hidden" aria-live="polite">
          Showing ${rangeText}
        </span>

        ${this.renderPageSize()}

        <div class="controls">
          ${showFirstLast
            ? this.renderNavButton('first_page', 'First page', this.isFirstPage, () => 1, 'first')
            : A}
          ${this.renderNavButton('chevron_left', 'Previous page', this.isFirstPage, () => this.page - 1, 'previous')}
          ${variant === 'full' ? this.renderPageList(totalPages) : A}
          ${variant === 'full' || variant === 'compact'
            ? this.renderPageJump(totalPages)
            : A}
          ${this.renderNavButton('chevron_right', 'Next page', this.isLastPage, () => this.page + 1, 'next')}
          ${showFirstLast
            ? this.renderNavButton('last_page', 'Last page', this.isLastPage, () => totalPages, 'last')
            : A}
        </div>
      </nav>
    `;
    }
};
Pagination.styles = [css_248z];
__decorate([
    n({ type: Number })
], Pagination.prototype, "page", void 0);
__decorate([
    n({ type: Number, attribute: 'page-size' })
], Pagination.prototype, "pageSize", void 0);
__decorate([
    n({ type: Number, attribute: 'total-items' })
], Pagination.prototype, "totalItems", void 0);
__decorate([
    n({ type: Array, attribute: 'page-sizes' })
], Pagination.prototype, "pageSizes", void 0);
__decorate([
    n({ type: String, reflect: true })
], Pagination.prototype, "variant", void 0);
__decorate([
    n({ type: Boolean, attribute: 'has-next' })
], Pagination.prototype, "hasNext", void 0);
__decorate([
    n({ type: Boolean, attribute: 'show-first-last' })
], Pagination.prototype, "showFirstLast", void 0);
__decorate([
    n({ type: Boolean, attribute: 'hide-page-size' })
], Pagination.prototype, "hidePageSize", void 0);
__decorate([
    n({ type: String })
], Pagination.prototype, "label", void 0);
Pagination = __decorate([
    IndividualComponent
], Pagination);

export { Pagination };
//# sourceMappingURL=pagination.js.map
