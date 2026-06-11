import { LitElement } from 'lit';
import type { PropertyValues } from 'lit';
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
     * Total number of items.
     */
    totalItems: number;
    /**
     * Supported page size options.
     */
    pageSizes: number[];
    protected willUpdate(changedProperties: PropertyValues<Pagination>): void;
    private getTotalPages;
    private setPage;
    private handlePageSizeChange;
    private handlePreviousPage;
    private handleNextPage;
    private dispatchPageEvent;
    render(): import("lit-html").TemplateResult<1>;
}
