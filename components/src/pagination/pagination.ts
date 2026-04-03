import { html, LitElement } from 'lit';
import type { PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './pagination.scss';

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
export class Pagination extends LitElement {
  static styles = [styles];

  /**
   * The current page number (1-based). Defaults to `1`.
   */
  @property({ type: Number })
  page: number = 1;

  /**
   * The number of rows per page. Defaults to `10`.
   */
  @property({ type: Number, attribute: 'page-size' })
  pageSize: number = 10;

  /**
   * Total number of items.
   */
  @property({ type: Number, attribute: 'total-items' })
  totalItems: number = 0;

  /**
   * Supported page size options.
   */
  @property({ type: Array, attribute: 'page-sizes' })
  pageSizes: number[] = DEFAULT_PAGE_SIZES;

  protected override willUpdate(
    changedProperties: PropertyValues<Pagination>,
  ): void {
    // Normalize page-size options so the select always has valid numeric values.
    const normalizedPageSizes = [...new Set(
      this.pageSizes
        .map(size => Number(size))
        .filter(size => Number.isFinite(size) && size > 0)
        .map(size => Math.trunc(size)),
    )];

    if (!normalizedPageSizes.length) {
      normalizedPageSizes.push(...DEFAULT_PAGE_SIZES);
    }

    if (
      changedProperties.has('pageSizes') &&
      (this.pageSizes.length !== normalizedPageSizes.length ||
        this.pageSizes.some((size, index) => size !== normalizedPageSizes[index]))
    ) {
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

  private getTotalPages(): number {
    if (this.totalItems <= 0) return 1;
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  private setPage(nextPage: number) {
    const clampedPage = Math.min(Math.max(1, nextPage), this.getTotalPages());
    if (clampedPage === this.page) return;
    this.page = clampedPage;
    this.dispatchPageEvent();
  }

  private handlePageSizeChange(event: CustomEvent<{ value?: string }>) {
    const rawValue = event.detail?.value;
    const parsedPageSize = Number.parseInt(rawValue ?? '', 10);

    if (!Number.isFinite(parsedPageSize) || parsedPageSize <= 0) {
      return;
    }

    this.pageSize = parsedPageSize;
    this.page = 1;
    this.dispatchPageEvent();
  }

  private handlePreviousPage = () => {
    this.setPage(this.page - 1);
  };

  private handleNextPage = () => {
    this.setPage(this.page + 1);
  };

  private dispatchPageEvent() {
    this.dispatchEvent(
      new CustomEvent('page', {
        detail: { page: this.page, pageSize: this.pageSize },
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    const startItem = this.totalItems === 0 ? 0 : this.pageSize * (this.page - 1) + 1;
    const endItem = Math.min(this.pageSize * this.page, this.totalItems);
    const isFirstPage = this.page === 1;
    const isLastPage = this.pageSize * this.page >= this.totalItems;

    return html`
      <div class="pagination">
        <div class="page-size">
          <span class="page-size-label">Items per page:</span>
          <wc-select
            class="page-size-select"
            .value=${String(this.pageSize)}
            aria-label="Items per page"
            @change=${this.handlePageSizeChange}
          >
            ${this.pageSizes.map(
              size => html`<wc-option value=${String(size)}>${size}</wc-option>`,
            )}
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
            name="keyboard_arrow_left"
            title="Previous page"
            ?disabled=${isFirstPage}
            @click=${this.handlePreviousPage}
          ></wc-icon-button>
          <wc-icon-button
            class="nav-button"
            color="secondary"
            variant="text"
            size="sm"
            name="keyboard_arrow_right"
            title="Next page"
            ?disabled=${isLastPage}
            @click=${this.handleNextPage}
          ></wc-icon-button>
        </div>
      </div>
    `;
  }
}
