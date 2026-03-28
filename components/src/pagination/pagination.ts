import { html, LitElement } from 'lit';
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
 * <wc-pagination page="1" page-size="10" total-items="100"></wc-pagination>
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
    const startItem = this.pageSize * (this.page - 1);
    const endItem = Math.min(this.pageSize * this.page, this.totalItems);
    const isFirstPage = this.page === 1;
    const isLastPage = this.pageSize * this.page >= this.totalItems;

    return html`
      <div class="pagination">
        <div class="page-sizes-select">
          <label class="page-size-label">
            Items per page:
            <select
              class="page-size-select"
              .value=${String(this.pageSize)}
              @change=${(e: Event) => {
                this.pageSize = parseInt(
                  (e.target as HTMLSelectElement).value,
                  10,
                );
                this.page = 1;
                this.dispatchPageEvent();
              }}
            >
              ${this.pageSizes.map(
                size => html`
                  <option value=${size} ?selected=${this.pageSize === size}>
                    ${size}
                  </option>
                `,
              )}
            </select>
          </label>
        </div>
        <div class="pagination-item-count">
          <span class="pagination-text">
            ${startItem} - ${endItem} of ${this.totalItems} items
          </span>
        </div>
        <div class="pagination-right">
          <div class="table-footer-right-content">
            <div class="table-footer-right-content-pagination">
              <wc-button
                class="arrows"
                color="secondary"
                variant="text"
                ?disabled=${isFirstPage}
                @click=${() => {
                  if (!isFirstPage) {
                    this.page -= 1;
                    this.dispatchPageEvent();
                  }
                }}
              >
                <wc-icon slot="icon" name="arrow--left"></wc-icon>
              </wc-button>
              <wc-button
                color="secondary"
                variant="text"
                class="arrows"
                ?disabled=${isLastPage}
                @click=${() => {
                  if (!isLastPage) {
                    this.page += 1;
                    this.dispatchPageEvent();
                  }
                }}
              >
                <wc-icon slot="icon" name="arrow--right"></wc-icon>
              </wc-button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
