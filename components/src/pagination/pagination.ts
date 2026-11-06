import { html, LitElement, nothing } from 'lit';
import type { PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './pagination.scss';
import IndividualComponent from '@/IndividualComponent.js';
import { getPageItems } from './page-items.js';

const DEFAULT_PAGE_SIZES = [10, 25, 50, 100];

export type PaginationVariant = 'full' | 'compact' | 'simple';

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
@IndividualComponent
export class Pagination extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

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
   * Total number of items. Leave it unset when the total is unknown; the control then shows
   * previous and next only, and `has-next` decides whether next is enabled.
   */
  @property({ type: Number, attribute: 'total-items' })
  totalItems: number | undefined;

  /**
   * Supported page size options.
   */
  @property({ type: Array, attribute: 'page-sizes' })
  pageSizes: number[] = DEFAULT_PAGE_SIZES;

  /**
   * How the pages are shown: `full` (page numbers), `compact` ("Page [n] of N") or `simple`
   * (previous and next only). Defaults to `full`.
   */
  @property({ type: String, reflect: true })
  variant: PaginationVariant = 'full';

  /**
   * Whether another page exists after this one. Used only when `total-items` is unset.
   */
  @property({ type: Boolean, attribute: 'has-next' })
  hasNext: boolean = false;

  /**
   * Shows buttons that jump to the first and the last page.
   */
  @property({ type: Boolean, attribute: 'show-first-last' })
  showFirstLast: boolean = false;

  /**
   * Hides the rows-per-page selector.
   */
  @property({ type: Boolean, attribute: 'hide-page-size' })
  hidePageSize: boolean = false;

  /**
   * Accessible name of the navigation landmark. Defaults to `"Pagination"`.
   */
  @property({ type: String })
  label: string = 'Pagination';

  // ── Lifecycle ────────────────────────────────────────────────────────────

  protected override willUpdate(
    changedProperties: PropertyValues<Pagination>,
  ): void {
    // Normalize page-size options so the select always has valid numeric values.
    const normalizedPageSizes = [
      ...new Set(
        this.pageSizes
          .map(size => Number(size))
          .filter(size => Number.isFinite(size) && size > 0)
          .map(size => Math.trunc(size)),
      ),
    ];

    if (!normalizedPageSizes.length) {
      normalizedPageSizes.push(...DEFAULT_PAGE_SIZES);
    }

    if (
      changedProperties.has('pageSizes') &&
      (this.pageSizes.length !== normalizedPageSizes.length ||
        this.pageSizes.some(
          (size, index) => size !== normalizedPageSizes[index],
        ))
    ) {
      this.pageSizes = normalizedPageSizes;
    }

    if (!this.pageSizes.includes(this.pageSize)) {
      this.pageSize = this.pageSizes[0] ?? DEFAULT_PAGE_SIZES[0];
    }

    if (
      this.totalItems !== undefined &&
      this.totalItems !== null &&
      (!Number.isFinite(this.totalItems) || this.totalItems < 0)
    ) {
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
  private get hasTotal(): boolean {
    return this.totalItems !== undefined && this.totalItems !== null;
  }

  /** The number of pages, or `undefined` when the total is unknown. */
  private getTotalPages(): number | undefined {
    if (!this.hasTotal) return undefined;
    const total = this.totalItems ?? 0;
    if (total <= 0) return 1;
    return Math.max(1, Math.ceil(total / this.pageSize));
  }

  private get isFirstPage(): boolean {
    return this.page <= 1;
  }

  private get isLastPage(): boolean {
    const totalPages = this.getTotalPages();
    return totalPages === undefined ? !this.hasNext : this.page >= totalPages;
  }

  /** The variant actually rendered: an unknown total can only go previous and next. */
  private get effectiveVariant(): PaginationVariant {
    return this.hasTotal ? this.variant : 'simple';
  }

  private getRangeText(): string {
    const total = this.totalItems ?? 0;
    if (this.hasTotal && total === 0) return '0 of 0';
    const start = this.pageSize * (this.page - 1) + 1;
    if (!this.hasTotal) return `${start}–${this.pageSize * this.page}`;
    const end = Math.min(this.pageSize * this.page, total);
    return `${start}–${end} of ${total}`;
  }

  private setPage(nextPage: number) {
    const totalPages = this.getTotalPages() ?? Number.MAX_SAFE_INTEGER;
    const lastAllowed =
      this.hasTotal || this.hasNext ? totalPages : Math.max(1, this.page);
    const clampedPage = Math.min(
      Math.max(1, Math.trunc(nextPage)),
      lastAllowed,
    );
    if (!Number.isFinite(clampedPage) || clampedPage === this.page) return;
    this.page = clampedPage;
    this.dispatchPageEvent();
  }

  private handlePageSizeChange(event: CustomEvent<{ value?: string }>) {
    const rawValue = event.detail?.value;
    const parsedPageSize = Number.parseInt(rawValue ?? '', 10);

    if (!Number.isFinite(parsedPageSize) || parsedPageSize <= 0) {
      return;
    }
    if (parsedPageSize === this.pageSize) return;

    // Keep the first visible item on screen instead of jumping back to page 1.
    const firstItemIndex = this.pageSize * (this.page - 1);
    this.pageSize = parsedPageSize;
    this.page = Math.floor(firstItemIndex / parsedPageSize) + 1;
    this.dispatchPageEvent();
  }

  private handlePageInput = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const value = Number.parseInt(input.value, 10);
    if (Number.isFinite(value)) {
      this.setPage(value);
    }
    // Show the page actually used, for example after clamping 99 to the last page.
    input.value = String(this.page);
  };

  private handlePageInputKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      this.handlePageInput(event);
    }
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

  // ── Render helpers ───────────────────────────────────────────────────────

  private renderNavButton(
    icon: string,
    label: string,
    disabled: boolean,
    target: () => number,
    className: string,
  ) {
    return html`
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

  private renderPageList(totalPages: number) {
    return html`
      <ol class="page-list">
        ${getPageItems(this.page, totalPages).map(item =>
          item === 'ellipsis'
            ? html`<li class="page-ellipsis" aria-hidden="true">…</li>`
            : html`
                <li>
                  <button
                    type="button"
                    class=${classMap({
                      'page-button': true,
                      current: item === this.page,
                    })}
                    aria-label="Page ${item}"
                    aria-current=${item === this.page ? 'page' : nothing}
                    @click=${() => this.setPage(item)}
                  >
                    ${item}
                  </button>
                </li>
              `,
        )}
      </ol>
    `;
  }

  private renderPageJump(totalPages: number) {
    return html`
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

  private renderPageSize() {
    if (this.hidePageSize) return nothing;
    return html`
      <div class="page-size">
        <span class="page-size-label" aria-hidden="true">Rows per page</span>
        <wc-select
          class="page-size-select"
          .value=${String(this.pageSize)}
          aria-label="Rows per page"
          @change=${this.handlePageSizeChange}
        >
          ${this.pageSizes.map(
            size => html`<wc-option value=${String(size)}>${size}</wc-option>`,
          )}
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

    return html`
      <nav
        class=${classMap({ pagination: true, [`variant-${variant}`]: true })}
        aria-label=${this.label}
      >
        <div class="range" aria-hidden="true">${rangeText}</div>
        <span class="visually-hidden" aria-live="polite">
          Showing ${rangeText}
        </span>

        ${this.renderPageSize()}

        <div class="controls">
          ${showFirstLast
            ? this.renderNavButton(
                'first_page',
                'First page',
                this.isFirstPage,
                () => 1,
                'first',
              )
            : nothing}
          ${this.renderNavButton(
            'chevron_left',
            'Previous page',
            this.isFirstPage,
            () => this.page - 1,
            'previous',
          )}
          ${variant === 'full' ? this.renderPageList(totalPages) : nothing}
          ${variant === 'full' || variant === 'compact'
            ? this.renderPageJump(totalPages)
            : nothing}
          ${this.renderNavButton(
            'chevron_right',
            'Next page',
            this.isLastPage,
            () => this.page + 1,
            'next',
          )}
          ${showFirstLast
            ? this.renderNavButton(
                'last_page',
                'Last page',
                this.isLastPage,
                () => totalPages,
                'last',
              )
            : nothing}
        </div>
      </nav>
    `;
  }
}
