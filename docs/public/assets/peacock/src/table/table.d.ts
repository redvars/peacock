import { LitElement } from 'lit';
import type { PropertyValues, TemplateResult } from 'lit';
import type { PaginationVariant } from '../pagination/pagination.js';
/** A record shown in one row. */
export type TableRow = Record<string, any>;
export interface TableColumn {
    /** Field of the row shown in this column. */
    name: string;
    /** Header text. */
    label: string;
    /** Width in rem. Defaults to 16. */
    width?: number;
    /**
     * Keeps the column in view while the table scrolls sideways. `true` or `"start"` pins it to
     * the start edge, `"end"` to the end edge (for example a row-actions column).
     */
    fixed?: boolean | 'start' | 'end';
    /** Horizontal alignment. Number columns default to `"end"`, others to `"start"`. */
    align?: 'start' | 'center' | 'end';
    /** Data type. `"number"` aligns to the end and uses tabular figures. */
    type?: 'text' | 'number';
    /** Set to `false` to turn sorting off for this column only. */
    sortable?: boolean;
    /** Lets long text wrap instead of truncating with an ellipsis. */
    wrap?: boolean;
    /**
     * Custom cell content. Return a Lit `TemplateResult` (preferred), or a string of trusted
     * HTML. A string is inserted as HTML without escaping, so never build it from user input.
     */
    template?: (row: TableRow, column: TableColumn) => string | TemplateResult;
}
/**
 * @label Table
 * @tag wc-table
 * @rawTag table
 * @summary A configurable component for displaying tabular data.
 * @overview
 * <p>The table displays rows of data with sorting, pagination, row selection, sticky header and sticky start or end columns.</p>
 * <p>It follows the grid keyboard pattern: the table is one tab stop and the arrow keys move between cells. <kbd>Space</kbd> selects the focused row, <kbd>Enter</kbd> activates the focused cell, and <kbd>Ctrl</kbd>+<kbd>C</kbd> copies its text.</p>
 * <p>When rows are selected, a bar over the header shows the count and the actions placed in the <code>bulk-actions</code> slot.</p>
 *
 * @fires {CustomEvent} cell-click - Dispatched when a cell is clicked or activated with Enter. Detail: `{ record, column, altKey, ctrlKey, metaKey, shiftKey }`.
 * @fires {CustomEvent} row-click - Dispatched when a row is clicked or activated with Enter. Detail: `{ record }`.
 * @fires {CustomEvent} selection-change - Dispatched when the row selection changes. Detail: `{ value, isSelectAll, allPages }`.
 * @fires {CustomEvent} sort - Dispatched when the table is sorted. Detail: `{ sortBy, sortOrder }`.
 * @fires {CustomEvent} page - Dispatched when the page or page size changes. Detail: `{ page, pageSize }`.
 *
 * @slot bulk-actions - Actions shown in the selection bar while rows are selected.
 *
 * @cssprop --table-row-height - Minimum height of a row. Set by `density`.
 * @cssprop --table-border-color - Color of the row dividers.
 * @cssprop --table-cell-padding-inline - Horizontal padding of a cell.
 *
 * @example
 * ```html
 * <wc-table columns="[{'name': 'name','label': 'Name','width': 16},{'name': 'age','label': 'Age','width': 7,'type': 'number'}]" data="[{'name': 'John','age': 30},{'name': 'Jane','age': 25}]"></wc-table>
 * ```
 * @tags display, data
 */
export declare class Table extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /**
     * Grid columns configuration.
     * Each column can have: name, label, width (rem), fixed, align, type, sortable, wrap, template.
     */
    columns: TableColumn[];
    /**
     * Grid data to display on table.
     */
    data: TableRow[];
    /**
     * Row selection type. Set to `"checkbox"` to enable checkbox selection.
     */
    selectionType: 'checkbox' | undefined;
    /**
     * Array of selected row key values.
     */
    selectedRowKeys: string[];
    /**
     * The field name used as the unique key for each row. Defaults to `"id"`.
     */
    keyField: string;
    /**
     * If true, sorting and pagination are managed externally (controlled mode).
     */
    managed: boolean;
    /**
     * If true, columns are sortable. Defaults to `true`.
     */
    sortable: boolean;
    /**
     * The field name currently used for sorting.
     */
    sortBy: string;
    /**
     * The current sort order. Possible values are `"asc"` and `"desc"`. Defaults to `"asc"`.
     */
    sortOrder: 'asc' | 'desc';
    /**
     * If true, pagination is enabled. Defaults to `false`.
     */
    paginate: boolean;
    /**
     * The current page number (1-based). Defaults to `1`.
     */
    page: number;
    /**
     * The number of rows per page. Defaults to `10`.
     */
    pageSize: number;
    /**
     * Supported page size options, passed to the pagination.
     */
    pageSizes: number[] | undefined;
    /**
     * Total number of items (used in managed/controlled mode). Leave it unset when the total is
     * unknown; the pagination then shows previous and next, driven by `has-next`.
     */
    totalItems: number | undefined;
    /**
     * Whether another page exists after this one, in managed mode with an unknown total.
     */
    hasNext: boolean;
    /**
     * Pagination variant: `full` (page numbers), `compact` or `simple`. Defaults to `full`.
     */
    paginationVariant: PaginationVariant;
    /**
     * Row height: `compact`, `default` or `comfortable`. Defaults to `default`.
     */
    density: 'compact' | 'default' | 'comfortable';
    /**
     * Shades every other row.
     */
    striped: boolean;
    /**
     * Shows a loading state: skeleton rows while there is no data, otherwise a progress bar
     * under the header so the current rows stay readable.
     */
    loading: boolean;
    /**
     * Accessible name of the table.
     */
    label: string;
    /**
     * Headline text shown when the table has no data.
     */
    emptyStateHeadline: string;
    /**
     * Description text shown when the table has no data.
     */
    emptyStateDescription: string;
    /** True when every item across all pages is selected, not only the current page. */
    private allPagesSelected;
    /** True when content is scrolled under the start-pinned columns. */
    private scrolledFromStart;
    /** True when more content waits past the end-pinned columns. */
    private scrolledFromEnd;
    /** The cell that holds the grid's single tab stop. Row 0 is the header. */
    private activeCell;
    private scrollContainer?;
    /** Set when a keyboard move must focus the active cell after the next render. */
    private pendingFocus;
    /** Watches the scroll container so the edge shadows follow resizes. */
    private resizeObserver?;
    disconnectedCallback(): void;
    firstUpdated(): void;
    protected willUpdate(changed: PropertyValues<Table>): void;
    protected updated(changed: PropertyValues<Table>): void;
    /** Columns in visual order: checkbox, start-pinned, scrolling, end-pinned. */
    private getGridColumns;
    private static getPlacement;
    private static getAlign;
    private static getWidth;
    private get totalColumnsWidth();
    private isColumnSortable;
    /** Total item count across pages, or `undefined` when it is unknown. */
    private getTotalItems;
    /** Rows shown on the current page, sorted and sliced unless the table is managed. */
    private getPageRows;
    /** Compares numbers by value and everything else as text with natural number order. */
    private static compare;
    private getRowKey;
    private onSortClick;
    private onSelectAllClick;
    private onRowSelectClick;
    private selectAllPages;
    private clearSelection;
    private onSelectChange;
    private onCellClick;
    private dispatchCellEvents;
    private onPage;
    private onScrollContainer;
    private updateScrollEdges;
    private getCell;
    /** The element that takes focus for a cell: its sort button, or the cell itself. */
    private getFocusTarget;
    private tabIndexFor;
    private onGridFocusIn;
    private onGridKeydown;
    private renderCellContent;
    private cellClasses;
    private cellStyle;
    /** Splits a row's cells into the start-pinned, scrolling and end-pinned groups. */
    private renderRowGroups;
    private renderHeader;
    private renderBody;
    private renderSkeletonBody;
    private renderEmptyState;
    private renderBulkBar;
    private renderPagination;
    render(): TemplateResult<1>;
}
