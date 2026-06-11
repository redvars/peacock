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
  display: block;
  container-type: inline-size;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--spacing-200, 1rem);
  row-gap: var(--spacing-100, 0.5rem);
  background: var(--color-surface, #fff);
  padding: var(--spacing-150, 0.75rem) var(--spacing-200, 1rem);
}
@container (min-width: 48rem) {
  .pagination {
    flex-wrap: nowrap;
    justify-content: flex-end;
    row-gap: 0;
  }
}
.pagination .page-size {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-100, 0.5rem);
  min-inline-size: max-content;
}
.pagination .page-size-label {
  font-family: var(--typography-body-small-font-family);
  font-size: var(--typography-body-small-font-size);
  font-weight: var(--typography-body-small-font-weight);
  line-height: var(--typography-body-small-line-height);
  letter-spacing: var(--typography-body-small-letter-spacing);
  color: var(--color-on-surface-variant);
  white-space: nowrap;
}
.pagination .page-size-select {
  inline-size: 5.5rem;
  min-inline-size: 5.5rem;
  --field-container-height: 2.5rem;
}
.pagination .pagination-item-count {
  order: 3;
  margin-inline-start: 0;
  inline-size: 100%;
  display: flex;
  align-items: center;
}
@container (min-width: 48rem) {
  .pagination .pagination-item-count {
    order: 0;
    margin-inline-start: auto;
    inline-size: auto;
  }
}
.pagination .pagination-text {
  font-family: var(--typography-body-medium-font-family);
  font-size: var(--typography-body-medium-font-size);
  font-weight: var(--typography-body-medium-font-weight);
  line-height: var(--typography-body-medium-line-height);
  letter-spacing: var(--typography-body-medium-letter-spacing);
  color: var(--color-on-surface-variant);
}
.pagination .pagination-actions {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-025, 0.125rem);
}
.pagination .nav-button {
  --button-container-shape: 999px;
}`;

const DEFAULT_PAGE_SIZES = [10, 25, 50, 100];
/**
 * @label Pagination
 * @tag wc-pagination
 * @rawTag pagination
 * @summary A pagination control with page size selector, item count display, and previous/next navigation.
 * @overview
 * <p>The pagination component provides controls for navigating through paged data sets.</p>
 *
 * @fires {CustomEvent} page - Dispatched when the page or page size changes. Detail: `{ page, pageSize }`.
 *
 * @example
 * ```html
 * <wc-pagination style="width: 100%;" page="1" page-size="10" total-items="100"></wc-pagination>
 * ```
 * @tags navigation, data
 */
let Pagination = class Pagination extends i$1 {
    constructor() {
        super(...arguments);
        /**
         * The current page number (1-based). Defaults to `1`.
         */
        this.page = 1;
        /**
         * The number of rows per page. Defaults to `10`.
         */
        this.pageSize = 10;
        /**
         * Total number of items.
         */
        this.totalItems = 0;
        /**
         * Supported page size options.
         */
        this.pageSizes = DEFAULT_PAGE_SIZES;
        this.handlePreviousPage = () => {
            this.setPage(this.page - 1);
        };
        this.handleNextPage = () => {
            this.setPage(this.page + 1);
        };
    }
    willUpdate(changedProperties) {
        // Normalize page-size options so the select always has valid numeric values.
        const normalizedPageSizes = [...new Set(this.pageSizes
                .map(size => Number(size))
                .filter(size => Number.isFinite(size) && size > 0)
                .map(size => Math.trunc(size)))];
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
        if (!Number.isFinite(this.totalItems) || this.totalItems < 0) {
            this.totalItems = 0;
        }
        if (!Number.isFinite(this.page) || this.page < 1) {
            this.page = 1;
        }
        const maxPage = this.getTotalPages();
        if (this.page > maxPage) {
            this.page = maxPage;
        }
    }
    getTotalPages() {
        if (this.totalItems <= 0)
            return 1;
        return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
    }
    setPage(nextPage) {
        const clampedPage = Math.min(Math.max(1, nextPage), this.getTotalPages());
        if (clampedPage === this.page)
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
        this.pageSize = parsedPageSize;
        this.page = 1;
        this.dispatchPageEvent();
    }
    dispatchPageEvent() {
        this.dispatchEvent(new CustomEvent('page', {
            detail: { page: this.page, pageSize: this.pageSize },
            bubbles: true,
            composed: true,
        }));
    }
    render() {
        const startItem = this.totalItems === 0 ? 0 : this.pageSize * (this.page - 1) + 1;
        const endItem = Math.min(this.pageSize * this.page, this.totalItems);
        const isFirstPage = this.page === 1;
        const isLastPage = this.pageSize * this.page >= this.totalItems;
        return b `
      <div class="pagination">
        <div class="page-size">
          <span class="page-size-label">Items per page:</span>
          <wc-select
            class="page-size-select"
            .value=${String(this.pageSize)}
            aria-label="Items per page"
            @change=${this.handlePageSizeChange}
          >
            ${this.pageSizes.map(size => b `<wc-option value=${String(size)}>${size}</wc-option>`)}
          </wc-select>
        </div>

        <div class="pagination-item-count">
          <span class="pagination-text">
            ${startItem} - ${endItem} of ${this.totalItems}
          </span>
        </div>

        <div class="pagination-actions">
          <wc-icon-button
            class="nav-button"
            color="secondary"
            variant="text"
            size="sm"
            title="Previous page"
            ?disabled=${isFirstPage}
            @click=${this.handlePreviousPage}
          >
            <wc-icon name="keyboard_arrow_left"></wc-icon>
          </wc-icon-button>
          <wc-icon-button
            class="nav-button"
            color="secondary"
            variant="text"
            size="sm"
            title="Next page"
            ?disabled=${isLastPage}
            @click=${this.handleNextPage}
          >
            <wc-icon name="keyboard_arrow_right"></wc-icon>
          </wc-icon-button>
        </div>
      </div>
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
Pagination = __decorate([
    IndividualComponent
], Pagination);

export { Pagination };
//# sourceMappingURL=pagination.js.map
