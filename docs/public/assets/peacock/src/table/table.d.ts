import { LitElement } from 'lit';
import type { PropertyValues, TemplateResult } from 'lit';
import type { PeacockStrings } from '../__internal/i18n/strings.js';
import type { GridColumn, TableColumn, TableExportOptions, TableRow, TableSelection, TableSort, TableSortOrder } from './table-types.js';
export type { TableAggregate, TableColumn, TableEditor, TableEditorOption, TableExportOptions, TableRow, TableSelection, TableSort, TableSortOrder, } from './table-types.js';
export type { TableCellEditDetail, TableColumnReorderDetail, TableColumnResizeDetail, TableColumnVisibilityDetail, TableGroupToggleDetail, TablePageDetail, TableRowExpandDetail, TableSelectionChangeDetail, TableSortDetail, } from './table-types.js';
/** Context handed to the per-row render methods. */
export interface TableRowContext {
    columns: GridColumn[];
    pageRows: TableRow[];
    /** Navigation row of the row: 1 for the first body row on the page. */
    gridRow: number;
    /** The row's `aria-rowindex`. */
    ariaRowIndex: number;
    key: string;
    selected: boolean;
    selectable: boolean;
    /** True when the row's detail row is shown. */
    expanded: boolean;
}
/**
 * @label Table
 * @tag wc-table
 * @rawTag table
 * @summary A data table with sorting, row selection, resizable and reorderable columns, inline editing and paging.
 * @overview
 * <p>The table displays rows of data with sorting (also by several columns), row selection, a sticky header, sticky start or end columns, and columns the user can resize, reorder and hide.</p>
 * <p>It follows the grid keyboard pattern: the table is one tab stop and the arrow keys move between cells. <kbd>Space</kbd> selects the focused row, <kbd>Enter</kbd> activates the focused cell, and <kbd>Ctrl</kbd>+<kbd>C</kbd> copies its text. On a column header, <kbd>Shift</kbd>+<kbd>Enter</kbd> adds a sort level and <kbd>Alt</kbd>+<kbd>Left</kbd>/<kbd>Right</kbd> moves a reorderable column.</p>
 * <p>Put a <code>wc-pagination</code> in the <code>footer</code> slot to page the rows. When rows are selected, a bar over the header shows the count and the actions placed in the <code>bulk-actions</code> slot.</p>
 * <p>Rows can expand into a detail row (<code>detailTemplate</code>), be grouped under collapsible headers (<code>group-by</code>), and be edited in place (<code>editable</code> columns). Columns can show a footer aggregate (<code>aggregate</code>). <code>virtual</code> renders only the rows in view, for large data sets, and <code>exportCsv()</code> returns the rows as CSV.</p>
 *
 * @fires {CustomEvent} cell-click - Dispatched when a cell is clicked or activated with Enter. Detail: `{ record, column, altKey, ctrlKey, metaKey, shiftKey }`.
 * @fires {CustomEvent} row-click - Dispatched when a row is clicked or activated with Enter. Detail: `{ record }`.
 * @fires {CustomEvent} selection-change - Dispatched when the row selection changes. Detail: `{ value, isSelectAll, allPages }`; `value` holds string keys.
 * @fires {CustomEvent} sort - Dispatched when the table is sorted. Detail: `{ sortBy, sortOrder, sorts }`: the primary column and order, and every level as `{ name, order }`.
 * @fires {CustomEvent} column-resize - Dispatched when the user finishes resizing a column. Detail: `{ name, width }`, width in rem.
 * @fires {CustomEvent} column-reorder - Dispatched when the user moves a column. Detail: `{ order }`, every column name in display order.
 * @fires {CustomEvent} column-visibility - Dispatched when the user shows or hides a column from the column menu. Detail: `{ name, hidden }`.
 * @fires {CustomEvent} row-expand - Dispatched when the user expands or collapses a row's details. Detail: `{ key, expanded }`.
 * @fires {CustomEvent} cell-edit - Dispatched when an inline edit is committed with a new value. Detail: `{ key, column, value, oldValue, record }`. Cancelable: call `preventDefault()` to reject the value. Unless the table is `managed`, it then updates `data` itself.
 * @fires {CustomEvent} group-toggle - Dispatched when the user expands or collapses a group. Detail: `{ group, expanded }`.
 *
 * @slot bulk-actions - Actions shown in the selection bar while rows are selected.
 * @slot footer - Content under the table, usually a `wc-pagination`. In client mode the table pages its rows with it; with `managed`, handle its `page` event and load the page yourself.
 * @slot empty - Content shown when there are no rows. Defaults to an empty state.
 * @slot error - Content shown while `error` is set. Defaults to an error empty state.
 *
 * @cssprop --table-row-height - Minimum height of a row. Set by `density`. With `virtual`, the fixed height of every row.
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
     * Grid columns configuration. Each column can have: name, label, width, minWidth, maxWidth
     * and flex (rem and grow factor), fixed, align, type, sortable, wrap, hidden, hideable,
     * resizable, reorderable, group, headerTemplate, template; editable, editor, options,
     * required, min, max, step and validate for inline editing; exportValue; aggregate.
     */
    columns: TableColumn[];
    /**
     * Grid data to display on table.
     */
    data: TableRow[];
    /**
     * How rows are selected: `none` (default), `single` (one row, with radio buttons) or
     * `multiple` (checkboxes, a select-all checkbox and the selection bar).
     */
    selection: TableSelection;
    /**
     * Keys of the selected rows. Keys are compared as strings, so a numeric `id` of `1` matches
     * `"1"`.
     */
    selectedRowKeys: string[];
    /**
     * Decides whether a row can be selected. Rows it returns `false` for show a disabled control
     * and are skipped by select-all.
     */
    isRowSelectable?: (row: TableRow) => boolean;
    /**
     * The field name used as the unique key for each row. Defaults to `"id"`.
     */
    keyField: string;
    /**
     * If true, sorting and pagination are managed externally (controlled mode): the table shows
     * `data` as given and only reports `sort` and page changes.
     */
    managed: boolean;
    /**
     * If true, columns are sortable. Defaults to `true`.
     */
    sortable: boolean;
    /**
     * The field name currently used for sorting (the primary sort).
     */
    sortBy: string;
    /**
     * The current sort order. Possible values are `"asc"` and `"desc"`. Defaults to `"asc"`.
     */
    sortOrder: TableSortOrder;
    /**
     * Every sort level, primary first, as `{ name, order }`. Shift+click on a header adds a level.
     * Kept in step with `sort-by` and `sort-order`, which describe the first level.
     */
    sorts: TableSort[];
    /**
     * Lets the user resize columns by dragging the header edges or with the arrow keys on the
     * focused handle. A column's own `resizable` overrides it.
     */
    resizable: boolean;
    /**
     * Lets the user move columns by dragging a header or with Alt+Left/Right. Pinned columns move
     * only among the columns pinned to the same edge. A column's own `reorderable` overrides it.
     */
    reorderable: boolean;
    /**
     * Adds a column menu button at the end of the header that shows or hides columns.
     */
    columnMenu: boolean;
    /**
     * The current page number (1-based). Defaults to `1`. Follows a slotted `wc-pagination`.
     */
    page: number;
    /**
     * The number of rows per page. Defaults to `10`. Follows a slotted `wc-pagination`.
     */
    pageSize: number;
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
     * Shows an error in place of the rows, for example when loading failed. Announced politely.
     */
    error: boolean;
    /**
     * Text of the error state. Defaults to Peacock's `tableErrorDescription` string.
     */
    errorText: string;
    /**
     * Accessible name of the table.
     */
    label: string;
    /**
     * Headline text shown when the table has no data. Defaults to Peacock's `noItems` string
     * (`"No items"`).
     */
    emptyStateHeadline: string;
    /**
     * Description text shown when the table has no data. Defaults to Peacock's
     * `noItemsDescription` string (`"There are no items to display"`).
     */
    emptyStateDescription: string;
    /**
     * Content of the detail row under an expanded row. Setting it adds a leading column of
     * expander buttons. A string is shown as text. Turns `virtual` off: detail rows vary in height.
     */
    detailTemplate?: (row: TableRow) => string | TemplateResult;
    /** Keys of the rows whose details are shown. Keys are compared as strings. */
    expandedRowKeys: string[];
    /**
     * Groups the rows by this field under collapsible header rows. Groups are ordered by value
     * (descending when the table is sorted descending by this field); sorting applies within
     * groups. In managed mode, groups keep the order the rows come in.
     */
    groupBy: string;
    /** Keys of the collapsed groups: their `group-by` values as strings (`""` for empty values). */
    collapsedGroups: string[];
    /** Custom content of a group header's label. Defaults to the group's value. */
    groupTemplate?: (group: string, rows: TableRow[]) => string | TemplateResult;
    /**
     * Renders only the rows in view (plus a few on each side), for large `data` without
     * pagination. Every row must have the same height, `--table-row-height`; cells do not wrap.
     * Give the table a height. Has no effect with `detailTemplate`.
     */
    virtual: boolean;
    /** Rows the footer aggregates cover: `all` rows (default) or the current `page`. */
    aggregateScope: 'all' | 'page';
    /** Overrides Peacock's strings for this instance only. */
    strings?: Partial<PeacockStrings>;
    /** True when every item across all pages is selected, not only the current page. */
    private allPagesSelected;
    /** True when content is scrolled under the start-pinned columns. */
    private scrolledFromStart;
    /** True when more content waits past the end-pinned columns. */
    private scrolledFromEnd;
    /** The cell that holds the grid's single tab stop. Row 0 is the column header row. */
    private activeCell;
    /** Column widths, visibility and order changed in the table. */
    private columnState;
    /** The `wc-pagination` in the footer slot, if any. */
    private slottedPagination;
    /** True when the footer slot has content. */
    private hasFooterContent;
    /** The column being dragged to a new place. */
    private dragColumn;
    /** The column a dragged column would be dropped on. */
    private dropTarget;
    /** True while the column menu is open. */
    private columnMenuOpen;
    /** Text for screen readers, for example after a column moved. */
    private announcement;
    /** The cell whose editor is open. */
    private editingCell?;
    /** Scroll offset of the virtual body, in pixels. */
    private virtualScrollTop;
    private scrollContainer?;
    private columnMenuElement?;
    /** Set when a keyboard move must focus the active cell after the next render. */
    private pendingFocus;
    /** Watches the scroll container so the edge shadows follow resizes. */
    private resizeObserver?;
    /** Peacock's strings and the locale counts are formatted in. */
    private readonly i18n;
    /** The selected keys, for quick lookups while rendering. */
    private selectedKeys;
    /** The column resize in progress with the pointer. */
    private resizeSession?;
    /** The header press that may become a column drag. */
    private dragSession?;
    /** Swallows the click that ends a drag, so it does not also sort. */
    private suppressClick;
    /** Prefix of the ids in the shadow root (detail rows). */
    private readonly idPrefix;
    /** The memoised rows, with the inputs they were worked out from. */
    private viewCache?;
    /** Set when the open editor must take focus after the next render. */
    private pendingEditorFocus;
    /** Set while an edit updates `data`, which must not reset the selection. */
    private applyingEdit;
    /** Measured height of a virtual row, in pixels. */
    private virtualRowHeight;
    /** Measured height a virtual body shows rows in, in pixels. */
    private virtualViewport;
    /** The row holding the tab stop when the active row is outside the virtual window. */
    private tabRowOverride?;
    disconnectedCallback(): void;
    firstUpdated(): void;
    protected willUpdate(changed: PropertyValues<Table>): void;
    protected updated(changed: PropertyValues<Table>): void;
    /**
     * The rows as CSV text (RFC 4180): a header row of column labels, then one line per row, in
     * the current sort and grouping. By default the visible columns in display order and the
     * rows on the current page; `allRows` exports every row, `columns` picks columns by name
     * (hidden ones too). Cells hold `exportValue(row)` when the column has it, else the field.
     */
    exportCsv(options?: TableExportOptions): string;
    /** Downloads `exportCsv(options)` as a file named `options.filename` (default `table.csv`). */
    downloadCsv(options?: TableExportOptions): void;
    /** The selection mode in effect: unknown values select nothing. */
    private get selectionMode();
    /** True when rows are split into pages. */
    private get isPaging();
    /** Rows above the data rows: the column header row, plus the column group row. */
    private get headerRowCount();
    /** True when the body renders only the rows in view. */
    private get isVirtual();
    /** Keeps `sorts` and `sort-by`/`sort-order` describing the same primary sort. */
    private syncSorts;
    private getGridColumns;
    private getHeaderGroups;
    private isColumnSortable;
    private isColumnResizable;
    private isColumnReorderable;
    private isRowSelectableNow;
    private isRtl;
    /** Total item count across pages, or `undefined` when it is unknown. */
    private getTotalItems;
    /** The rows, memoised while the inputs they come from stay the same. */
    private getView;
    /**
     * The row pipeline: the data, sorted unless the table is managed, then grouped; the rows on
     * the page; and the page's display items.
     */
    private computeView;
    /** Rows shown on the current page. */
    private getPageRows;
    /** The group header or data row at navigation row `row` (1 for the first body row). */
    private getNavItem;
    /** True when a visible column has a footer aggregate. */
    private hasAggregates;
    /** `aria-rowcount`: header rows plus every body and footer row, or -1 when it is unknown. */
    private getAriaRowCount;
    private findRecord;
    private detailId;
    private dispatch;
    private onSortActivate;
    private selectableKeys;
    private onSelectAllClick;
    private onRowSelect;
    private selectAllPages;
    private clearSelection;
    private onSelectChange;
    private toggleRow;
    private toggleGroup;
    private isCellEditable;
    private isEditing;
    private startEdit;
    private getEditor;
    private focusEditor;
    /** Ends the edit; with `restoreFocus`, focus goes back to the cell. */
    private endEdit;
    private cancelEdit;
    /**
     * Commits the open editor. An invalid value keeps the editor open with its message. A new
     * value fires `cell-edit`; unless that is cancelled or the table is managed, the row in
     * `data` is replaced by a copy with the new value.
     */
    private commitEdit;
    private onEditorKeydown;
    private onEditorChange;
    private onEditorFocusOut;
    private onCellClick;
    private dispatchCellEvents;
    /** A slotted pagination's page event: followed, and left to bubble to the consumer. */
    private onSlottedPage;
    private onFooterSlotChange;
    private onScrollContainer;
    /** Measures the row height and the space for rows of a virtual body. */
    private measureVirtual;
    /** Scrolls a virtual body so navigation row `row` is in view. */
    private scrollRowIntoView;
    private updateScrollEdges;
    private getCell;
    /** The element that takes focus for a cell: its sort or menu button, or the cell itself. */
    private getFocusTarget;
    /** The navigation row holding the tab stop. */
    private get tabRow();
    private tabIndexFor;
    /** The tab index of a one-cell row (a group header), whichever column is active. */
    private tabIndexForRow;
    private onGridFocusIn;
    private onGridKeydown;
    /** Sort and reorder keys on a data column header. Returns true when the key was handled. */
    private onHeaderKeydown;
    /**
     * Space, Enter, F2 and Ctrl+C on a body cell. Enter and Space toggle a group header or a row's
     * details from the expander; Enter and F2 open the editor of an editable cell.
     */
    private onCellKeydown;
    private applyColumnOrder;
    private moveColumn;
    private onHeaderPointerDown;
    /** The reorderable header under `clientX` pinned like the dragged column. */
    private findDropTarget;
    private setColumnWidth;
    /** The rendered width of a column in rem. */
    private measureColumn;
    private onResizePointerDown;
    private onResizeKeydown;
    private startPointerSession;
    private endPointerSession;
    private onWindowPointerMove;
    private onWindowPointerUp;
    private onColumnMenuButtonClick;
    private onColumnMenuActivate;
    private onColumnMenuOpenChange;
    private renderGroupRow;
    private renderSelectAllHeader;
    private renderColumnMenuHeader;
    private renderSortButton;
    private renderResizeHandle;
    /** One column header. */
    private renderHeaderCell;
    private renderHeader;
    /** The selection control cell of a row. */
    private renderSelectCell;
    /** The expander cell of a row with details. */
    private renderExpandCell;
    /** The editor in place of a cell's content. */
    private renderCellEditor;
    /** One cell of a data row. */
    private renderBodyCell;
    /** One data row. Every data row is rendered here. */
    private renderRow;
    /** The detail row under an expanded row: one cell across every column. */
    private renderDetailRow;
    /** A group header: one cell across every column with the toggle, label and row count. */
    private renderGroupHeaderRow;
    private renderBodyItem;
    /** The page's body rows; with `virtual`, only those in view between two spacers. */
    private renderBodyRows;
    private renderBody;
    /**
     * Takes the height the rows leave free in a taller table, so the pinned column edges
     * run down to the footer instead of stopping at the last row. Not part of the grid.
     */
    private renderFillerRow;
    /** The footer row of column aggregates, after the body. */
    private renderAggregateRow;
    private renderSkeletonBody;
    /** A full-width row in place of the data: the empty or the error state. */
    private renderStateRow;
    /** The table's own empty and error message: a small illustration, a headline and a line of text. */
    private renderStateMessage;
    private renderEmptyState;
    private renderErrorState;
    private renderBulkBar;
    private renderColumnMenu;
    /** The footer: the `footer` slot, usually holding a `wc-pagination`. */
    private renderFooter;
    render(): TemplateResult<1>;
}
