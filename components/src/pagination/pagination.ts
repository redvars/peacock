import { html, LitElement, nothing } from 'lit';
import type { PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './pagination.scss';
import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import type { PeacockStrings } from '@/__internal/i18n/strings.js';
import { getPageItems } from './page-items.js';

const DEFAULT_PAGE_SIZES = [10, 25, 50, 100];

export type PaginationVariant = 'full' | 'compact' | 'simple';

let variantWarned = false;

/** Warns once per page that a `full` or `compact` variant shows as `simple` without a total. */
function warnVariantForced(variant: PaginationVariant) {
  if (variantWarned) return;
  variantWarned = true;
  // eslint-disable-next-line no-console
  console.warn(
    `[peacock] wc-pagination: variant="${variant}" needs total-items; it shows as "simple" while the total is unknown.`,
  );
}

/** Lets the next forced variant warn again. For tests only. */
export function resetPaginationWarnings(): void {
  variantWarned = false;
}

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
   * (previous and next only). Defaults to `full`. Without `total-items` the control can only show
   * `simple`; a `full` or `compact` set explicitly then logs one console warning.
   */
  @property({ type: String, reflect: true })
  get variant(): PaginationVariant {
    return this._variant;
  }

  set variant(value: PaginationVariant) {
    this._variant = value;
    this.variantSet = true;
  }

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
   * Accessible name of the navigation landmark. Defaults to Peacock's `pagination` string
   * (`"Pagination"`).
   */
  @property({ type: String })
  label: string = '';

  /** Overrides Peacock's strings for this instance only. */
  @property({ attribute: false }) strings?: Partial<PeacockStrings>;

  // ── Private fields ───────────────────────────────────────────────────────

  /** Peacock's strings and the locale page numbers are formatted in. */
  private readonly i18n = new I18nController(this);

  /** Backing field of `variant`. */
  private _variant: PaginationVariant = 'full';

  /** True once `variant` was set by the consumer rather than left at its default. */
  private variantSet: boolean = false;

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

    if (this.variantSet && this.variant !== 'simple' && !this.hasTotal) {
      warnVariantForced(this.variant);
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

  /** Formats a number in the resolved locale. */
  private formatNumber(value: number): string {
    return new Intl.NumberFormat(this.i18n.locale).format(value);
  }

  private getRangeText(): string {
    const total = this.totalItems ?? 0;
    if (this.hasTotal && total === 0) {
      return this.i18n.t('emptyPageRange')(this.formatNumber(0));
    }
    const pageRange = this.i18n.t('pageRange');
    const start = this.formatNumber(this.pageSize * (this.page - 1) + 1);
    if (!this.hasTotal) {
      return pageRange(start, this.formatNumber(this.pageSize * this.page));
    }
    const end = Math.min(this.pageSize * this.page, total);
    return pageRange(start, this.formatNumber(end), this.formatNumber(total));
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
                    aria-label=${this.i18n.t('pageNumber')(
                      this.formatNumber(item),
                    )}
                    aria-current=${item === this.page ? 'page' : nothing}
                    @click=${() => this.setPage(item)}
                  >
                    ${this.formatNumber(item)}
                  </button>
                </li>
              `,
        )}
      </ol>
    `;
  }

  private renderPageJump(totalPages: number) {
    const pages = this.formatNumber(totalPages);
    return html`
      <div class="page-jump">
        <span>${this.i18n.t('page')}</span>
        <input
          class="page-input"
          type="number"
          inputmode="numeric"
          min="1"
          max=${totalPages}
          .value=${String(this.page)}
          aria-label=${this.i18n.t('pageNumberField')(pages)}
          @change=${this.handlePageInput}
          @keydown=${this.handlePageInputKeydown}
        />
        <span>${this.i18n.t('ofPages')(pages)}</span>
      </div>
    `;
  }

  private renderPageSize() {
    if (this.hidePageSize) return nothing;
    return html`
      <div class="page-size">
        <span class="page-size-label" aria-hidden="true"
          >${this.i18n.t('rowsPerPage')}</span
        >
        <wc-select
          class="page-size-select"
          .value=${String(this.pageSize)}
          aria-label=${this.i18n.t('rowsPerPage')}
          @change=${this.handlePageSizeChange}
        >
          ${this.pageSizes.map(
            size =>
              html`<wc-option value=${String(size)}
                >${this.formatNumber(size)}</wc-option
              >`,
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
        aria-label=${this.label || this.i18n.t('pagination')}
      >
        <div class="range" aria-hidden="true">${rangeText}</div>
        <span class="visually-hidden" aria-live="polite">
          ${this.i18n.t('showingRange')(rangeText)}
        </span>

        ${this.renderPageSize()}

        <div class="controls">
          ${showFirstLast
            ? this.renderNavButton(
                'first_page',
                this.i18n.t('firstPage'),
                this.isFirstPage,
                () => 1,
                'first',
              )
            : nothing}
          ${this.renderNavButton(
            'chevron_left',
            this.i18n.t('previousPage'),
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
            this.i18n.t('nextPage'),
            this.isLastPage,
            () => this.page + 1,
            'next',
          )}
          ${showFirstLast
            ? this.renderNavButton(
                'last_page',
                this.i18n.t('lastPage'),
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
