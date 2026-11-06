import { LitElement } from 'lit';
import type { PropertyValues } from 'lit';
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
export declare class Pagination extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /**
     * The current page number (1-based). Defaults to `1`.
     */
    page: number;
    /**
     * The number of rows per page. Defaults to `10`.
     */
    pageSize: number;
    /**
     * Total number of items. Leave it unset when the total is unknown; the control then shows
     * previous and next only, and `has-next` decides whether next is enabled.
     */
    totalItems: number | undefined;
    /**
     * Supported page size options.
     */
    pageSizes: number[];
    /**
     * How the pages are shown: `full` (page numbers), `compact` ("Page [n] of N") or `simple`
     * (previous and next only). Defaults to `full`.
     */
    variant: PaginationVariant;
    /**
     * Whether another page exists after this one. Used only when `total-items` is unset.
     */
    hasNext: boolean;
    /**
     * Shows buttons that jump to the first and the last page.
     */
    showFirstLast: boolean;
    /**
     * Hides the rows-per-page selector.
     */
    hidePageSize: boolean;
    /**
     * Accessible name of the navigation landmark. Defaults to `"Pagination"`.
     */
    label: string;
    protected willUpdate(changedProperties: PropertyValues<Pagination>): void;
    /** True when the total is known. */
    private get hasTotal();
    /** The number of pages, or `undefined` when the total is unknown. */
    private getTotalPages;
    private get isFirstPage();
    private get isLastPage();
    /** The variant actually rendered: an unknown total can only go previous and next. */
    private get effectiveVariant();
    private getRangeText;
    private setPage;
    private handlePageSizeChange;
    private handlePageInput;
    private handlePageInputKeydown;
    private dispatchPageEvent;
    private renderNavButton;
    private renderPageList;
    private renderPageJump;
    private renderPageSize;
    render(): import("lit-html").TemplateResult<1>;
}
