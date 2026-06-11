import { LitElement } from 'lit';
export interface TableColumn {
    name: string;
    label: string;
    width?: number;
    fixed?: boolean;
    template?: (row: any, column: TableColumn) => string;
}
/**
 * @label Table
 * @tag wc-table
 * @rawTag table
 * @summary A configurable component for displaying tabular data.
 * @overview
 * <p>The table component displays rows of data with support for sorting, pagination, row selection, and fixed columns.</p>
 *
 * @fires {CustomEvent} cell-click - Dispatched when a table cell is clicked.
 * @fires {CustomEvent} selection-change - Dispatched when the row selection changes.
 * @fires {CustomEvent} sort - Dispatched when the table is sorted.
 * @fires {CustomEvent} page - Dispatched when the page or page size changes.
 *
 * @example
 * ```html
 * <wc-table columns="[{'name': 'name','label': 'Name','width': 16},{'name': 'age','label': 'Age','width': 7}]" data="[{'name': 'John','age': 30},{'name': 'Jane','age': 25}]"></wc-table>
 * ```
 * @tags display, data
 */
export declare class Table extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /**
     * Grid columns configuration.
     * Each column can have: name, label, width (px), fixed (boolean), template (function).
     */
    columns: TableColumn[];
    /**
     * Grid data to display on table.
     */
    data: any[];
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
     * If true, pagination is enabled. Defaults to `true`.
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
     * Total number of items (used in managed/controlled mode).
     */
    totalItems: number | undefined;
    /**
     * Headline text shown when the table has no data.
     */
    emptyStateHeadline: string;
    /**
     * Description text shown when the table has no data.
     */
    emptyStateDescription: string;
    /** Tracks the currently hovered row and column for hover-highlight CSS. */
    private hoveredCell;
    /** True when all rows on the current page are selected. */
    private isSelectAll;
    /** True when some (but not all) rows on the current page are selected. */
    private isSelectAllIntermediate;
    /** True when the scroll container has been scrolled horizontally. */
    private isHorizontallyScrolled;
    /** Throttled version of the cell-mouseover handler to avoid excessive state updates. */
    private onCellMouseOverThrottled;
    private onSelectAllClick;
    private onRowSelectClick;
    private onSelectChange;
    private onCellClick;
    private onScrollContainer;
    private get totalColumnsWidth();
    private getTotalItems;
    private getSortIcon;
    private onSortClick;
    private renderHeader;
    private renderBody;
    private renderEmptyState;
    private renderPagination;
    render(): import("lit-html").TemplateResult<1>;
}
