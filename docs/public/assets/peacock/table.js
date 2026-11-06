import { i, _ as __decorate, I as IndividualComponent, a as i$1, b, A } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { r } from './state-DkTK9EGF.js';
import { e } from './query-CHb9Ft_d.js';
import { e as e$1 } from './class-map-DG7CA1et.js';
import { o as o$1 } from './style-map-BQD5Et1D.js';
import { o } from './unsafe-html-Ct0N2_UU.js';
import './base-Cl6v8-BZ.js';
import './directive-ZPhl09Yt.js';

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
  height: 100%;
  min-width: 0;
  --table-row-height: 3rem;
  --table-border-color: var(--color-outline-variant);
  --table-cell-padding-inline: var(--spacing-200, 1rem);
  --table-header-background: var(--color-surface, #fff);
  --table-background: var(--color-surface, #fff);
  --_table-checkbox-width: 3rem;
  --_table-edge-shadow: color-mix(in srgb, var(--color-shadow) 14%, transparent);
}

:host([density=compact]) {
  --table-row-height: 2.25rem;
  --table-cell-padding-inline: var(--spacing-150, 0.75rem);
}

:host([density=comfortable]) {
  --table-row-height: 3.5rem;
}

.table {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--table-background);
  color: var(--color-on-surface);
  font-family: var(--typography-body-medium-font-family);
  font-size: var(--typography-body-medium-font-size);
  font-weight: var(--typography-body-medium-font-weight);
  line-height: var(--typography-body-medium-line-height);
  letter-spacing: var(--typography-body-medium-letter-spacing);
}

.table-scroll-container {
  contain: inline-size;
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  outline: none;
}

.row {
  --_cell-background: var(--table-background);
  display: flex;
  width: max-content;
  min-width: max(100%, var(--_row-min-width, 0rem));
}

.columns {
  display: flex;
}

.scroll-group {
  flex: 1 0 auto;
  isolation: isolate;
}
.scroll-group > .cell:last-child {
  flex-grow: 1;
}

.pinned-group {
  position: sticky;
  z-index: 1;
  flex: none;
}

.pinned-group-start {
  inset-inline-start: 0;
}

.pinned-group-end {
  inset-inline-end: 0;
}

.cell {
  position: relative;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  min-width: 0;
  min-height: var(--table-row-height);
  padding-inline: var(--table-cell-padding-inline);
  background: var(--_cell-background);
  border-bottom: 1px solid var(--table-border-color);
}
.cell:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}
.cell.align-start {
  justify-content: flex-start;
  text-align: start;
}
.cell.align-center {
  justify-content: center;
  text-align: center;
}
.cell.align-end {
  justify-content: flex-end;
  text-align: end;
}
.cell.numeric {
  font-variant-numeric: tabular-nums;
}
.cell.cell-checkbox {
  width: var(--_table-checkbox-width);
  padding-inline: 0;
}

.cell-text {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.wrap .cell-text {
  padding-block: var(--spacing-100, 0.5rem);
  white-space: normal;
  overflow-wrap: anywhere;
}

.cell-template {
  display: flex;
  align-items: center;
  min-width: 0;
  max-width: 100%;
}

.header {
  position: sticky;
  top: 0;
  z-index: 3;
}
.header .row {
  --_cell-background: var(--table-header-background);
}
.header .cell {
  color: var(--color-on-surface-variant);
  font-family: var(--typography-label-large-font-family);
  font-size: var(--typography-label-large-font-size);
  font-weight: var(--typography-label-large-font-weight);
  line-height: var(--typography-label-large-line-height);
  letter-spacing: var(--typography-label-large-letter-spacing);
}
.header .cell.sortable {
  padding-inline: 0;
}
.header .cell.sorted {
  color: var(--color-on-surface);
}
.header .header-label {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.sort-button {
  background: transparent;
  border: none;
  appearance: none;
  margin: 0;
  outline: none;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: inherit;
  gap: var(--spacing-050, 0.25rem);
  align-self: stretch;
  width: 100%;
  min-width: 0;
  padding-inline: var(--table-cell-padding-inline);
  color: inherit;
  font: inherit;
  letter-spacing: inherit;
  text-align: inherit;
  cursor: pointer;
}
.align-end .sort-button {
  flex-direction: row-reverse;
}
.sort-button:hover {
  background: color-mix(in srgb, var(--color-on-surface) 6%, transparent);
}
.sort-button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

.sort-icon {
  flex: none;
  --icon-size: 1.125rem;
  font-size: 1.125rem;
  opacity: 0;
  transition: opacity var(--duration-short2, 100ms) ease;
}
.sort-button:hover .sort-icon, .sort-button:focus-visible .sort-icon {
  opacity: 0.6;
}
.sorted .sort-icon {
  opacity: 1;
}

.loading-bar {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  --progress-height: 2px;
}

.body .cell {
  cursor: pointer;
}
.body .cell.cell-checkbox {
  cursor: default;
}
.body .row:hover {
  --_cell-background: var(--color-surface-container-low);
}
.body .row.selected {
  --_cell-background: color-mix(
    in srgb,
    var(--color-secondary-container) 55%,
    var(--table-background)
  );
}
.body .row.selected > .columns:first-child > .cell:first-child {
  box-shadow: inset 2px 0 0 var(--color-primary);
}
.body .row.selected:hover {
  --_cell-background: var(--color-secondary-container);
}
.body .skeleton-row .cell {
  cursor: default;
}

.has-footer .body .row:last-child .cell {
  border-bottom-color: transparent;
}

:host([striped]) .body .row:nth-child(even):not(.selected) {
  --_cell-background: color-mix(
    in srgb,
    var(--color-surface-container) 45%,
    var(--table-background)
  );
}
:host([striped]) .body .row:nth-child(even):not(.selected):hover {
  --_cell-background: var(--color-surface-container-low);
}

.skeleton-bar {
  block-size: 0.75rem;
  max-inline-size: 100%;
  --skeleton-container-shape: var(--shape-corner-extra-small);
}
.cell-checkbox .skeleton-bar {
  inline-size: 1.125rem;
  block-size: 1.125rem;
}

.checkbox {
  display: flex;
}

.pinned-group-start::after,
.pinned-group-end::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  width: 0.75rem;
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--duration-short4, 200ms) ease;
}

.pinned-group-start::after {
  inset-inline-end: -0.75rem;
  background: linear-gradient(to right, var(--_table-edge-shadow), transparent);
}

.pinned-group-end::before {
  inset-inline-start: -0.75rem;
  background: linear-gradient(to left, var(--_table-edge-shadow), transparent);
}

.scrolled-from-start .pinned-group-start::after,
.scrolled-from-end .pinned-group-end::before {
  opacity: 1;
}

.bulk-bar {
  position: absolute;
  top: 0;
  inset-inline: var(--_table-checkbox-width) 0;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: var(--spacing-100, 0.5rem);
  height: var(--table-row-height);
  padding-inline: var(--spacing-100, 0.5rem) var(--spacing-100, 0.5rem);
  background: var(--color-secondary-container);
  color: var(--color-on-secondary-container);
  border-bottom: 1px solid var(--table-border-color);
  overflow-x: auto;
  scrollbar-width: none;
  white-space: nowrap;
  font-family: var(--typography-label-large-font-family);
  font-size: var(--typography-label-large-font-size);
  font-weight: var(--typography-label-large-font-weight);
  line-height: var(--typography-label-large-line-height);
  letter-spacing: var(--typography-label-large-letter-spacing);
}
.bulk-bar > *,
.bulk-bar ::slotted(*) {
  flex: none;
}

.bulk-count {
  padding-inline-start: var(--spacing-050, 0.25rem);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.bulk-spacer {
  flex: 1;
}

::slotted([slot=bulk-actions]) {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-050, 0.25rem);
}

.empty-table {
  position: sticky;
  inset-inline-start: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 16rem;
  padding: var(--spacing-400, 2rem) var(--spacing-200, 1rem);
}
.empty-table .empty-state {
  max-width: 24rem;
}

.table-footer {
  flex: none;
  border-top: 1px solid var(--table-border-color);
}`;

var Table_1;
const DEFAULT_CELL_WIDTH = 16; // in rem
const CHECKBOX_CELL_WIDTH = 3; // in rem
const SKELETON_ROWS = 5;
const collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: 'base',
});
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
let Table = Table_1 = class Table extends i$1 {
    constructor() {
        // ── Static ───────────────────────────────────────────────────────────────
        super(...arguments);
        // ── Properties ───────────────────────────────────────────────────────────
        /**
         * Grid columns configuration.
         * Each column can have: name, label, width (rem), fixed, align, type, sortable, wrap, template.
         */
        this.columns = [];
        /**
         * Grid data to display on table.
         */
        this.data = [];
        /**
         * Array of selected row key values.
         */
        this.selectedRowKeys = [];
        /**
         * The field name used as the unique key for each row. Defaults to `"id"`.
         */
        this.keyField = 'id';
        /**
         * If true, sorting and pagination are managed externally (controlled mode).
         */
        this.managed = false;
        /**
         * If true, columns are sortable. Defaults to `true`.
         */
        this.sortable = true;
        /**
         * The field name currently used for sorting.
         */
        this.sortBy = '';
        /**
         * The current sort order. Possible values are `"asc"` and `"desc"`. Defaults to `"asc"`.
         */
        this.sortOrder = 'asc';
        /**
         * If true, pagination is enabled. Defaults to `false`.
         */
        this.paginate = false;
        /**
         * The current page number (1-based). Defaults to `1`.
         */
        this.page = 1;
        /**
         * The number of rows per page. Defaults to `10`.
         */
        this.pageSize = 10;
        /**
         * Whether another page exists after this one, in managed mode with an unknown total.
         */
        this.hasNext = false;
        /**
         * Pagination variant: `full` (page numbers), `compact` or `simple`. Defaults to `full`.
         */
        this.paginationVariant = 'full';
        /**
         * Row height: `compact`, `default` or `comfortable`. Defaults to `default`.
         */
        this.density = 'default';
        /**
         * Shades every other row.
         */
        this.striped = false;
        /**
         * Shows a loading state: skeleton rows while there is no data, otherwise a progress bar
         * under the header so the current rows stay readable.
         */
        this.loading = false;
        /**
         * Accessible name of the table.
         */
        this.label = '';
        /**
         * Headline text shown when the table has no data.
         */
        this.emptyStateHeadline = 'No items';
        /**
         * Description text shown when the table has no data.
         */
        this.emptyStateDescription = 'There are no items to display';
        // ── States ───────────────────────────────────────────────────────────────
        /** True when every item across all pages is selected, not only the current page. */
        this.allPagesSelected = false;
        /** True when content is scrolled under the start-pinned columns. */
        this.scrolledFromStart = false;
        /** True when more content waits past the end-pinned columns. */
        this.scrolledFromEnd = false;
        /** The cell that holds the grid's single tab stop. Row 0 is the header. */
        this.activeCell = { row: 0, col: 0 };
        // ── Private fields ───────────────────────────────────────────────────────
        /** Set when a keyboard move must focus the active cell after the next render. */
        this.pendingFocus = false;
        this.onScrollContainer = () => {
            this.updateScrollEdges();
        };
        this.onGridFocusIn = (event) => {
            const cell = event.target.closest('[data-cell]');
            if (!cell)
                return;
            const row = Number(cell.dataset.row);
            const col = Number(cell.dataset.col);
            if (row !== this.activeCell.row || col !== this.activeCell.col) {
                this.activeCell = { row, col };
            }
        };
        this.onGridKeydown = (event) => {
            const target = event.target;
            const cell = target.closest('[data-cell]');
            // Leave keys alone while focus is on interactive content inside a cell.
            if (!cell || (target !== cell && !target.hasAttribute('data-focus-target')))
                return;
            const row = Number(cell.dataset.row);
            const col = Number(cell.dataset.col);
            const lastRow = this.getPageRows().length;
            const lastCol = this.getGridColumns().length - 1;
            let next;
            switch (event.key) {
                case 'ArrowRight':
                    next = { row, col: Math.min(col + 1, lastCol) };
                    break;
                case 'ArrowLeft':
                    next = { row, col: Math.max(col - 1, 0) };
                    break;
                case 'ArrowDown':
                    next = { row: Math.min(row + 1, lastRow), col };
                    break;
                case 'ArrowUp':
                    next = { row: Math.max(row - 1, 0), col };
                    break;
                case 'Home':
                    next = { row: event.ctrlKey ? 0 : row, col: 0 };
                    break;
                case 'End':
                    next = { row: event.ctrlKey ? lastRow : row, col: lastCol };
                    break;
                case ' ':
                    if (row > 0 && this.selectionType === 'checkbox') {
                        event.preventDefault();
                        const pageRows = this.getPageRows();
                        this.onRowSelectClick(pageRows[row - 1], pageRows);
                    }
                    return;
                case 'Enter':
                    if (row > 0) {
                        const pageRows = this.getPageRows();
                        const column = this.getGridColumns()[col]?.column;
                        if (column)
                            this.dispatchCellEvents(pageRows[row - 1], column, event);
                    }
                    return;
                case 'c':
                case 'C':
                    if ((event.ctrlKey || event.metaKey) && row > 0) {
                        window.navigator.clipboard?.writeText(cell.innerText).catch(() => { });
                    }
                    return;
                default:
                    return;
            }
            event.preventDefault();
            this.activeCell = next;
            this.pendingFocus = true;
            // The cell may already be active (an edge was reached): focus it anyway.
            if (next.row === row && next.col === col) {
                this.pendingFocus = false;
            }
        };
    }
    // ── Lifecycle ────────────────────────────────────────────────────────────
    disconnectedCallback() {
        super.disconnectedCallback();
        this.resizeObserver?.disconnect();
    }
    firstUpdated() {
        if (typeof ResizeObserver !== 'undefined' && this.scrollContainer) {
            this.resizeObserver = new ResizeObserver(() => this.updateScrollEdges());
            this.resizeObserver.observe(this.scrollContainer);
        }
        this.updateScrollEdges();
    }
    willUpdate(changed) {
        if (!Number.isFinite(this.page) || this.page < 1) {
            this.page = 1;
        }
        // Filtering the data can leave the current page past the end.
        // An empty data set (for example before the first load) keeps the requested page.
        if (this.paginate &&
            !this.managed &&
            changed.has('data') &&
            this.data?.length) {
            const lastPage = Math.max(1, Math.ceil((this.data?.length ?? 0) / this.pageSize));
            if (this.page > lastPage)
                this.page = lastPage;
        }
        if (changed.has('data') && !this.managed) {
            this.allPagesSelected = false;
        }
        const rowCount = this.getPageRows().length;
        const colCount = this.getGridColumns().length;
        const row = Math.min(this.activeCell.row, rowCount);
        const col = Math.min(this.activeCell.col, Math.max(0, colCount - 1));
        if (row !== this.activeCell.row || col !== this.activeCell.col) {
            this.activeCell = { row, col };
        }
    }
    updated(changed) {
        if (changed.has('columns') || changed.has('data')) {
            this.updateScrollEdges();
        }
        if (this.pendingFocus) {
            this.pendingFocus = false;
            this.getFocusTarget(this.activeCell.row, this.activeCell.col)?.focus();
        }
    }
    // ── Private methods ──────────────────────────────────────────────────────
    /** Columns in visual order: checkbox, start-pinned, scrolling, end-pinned. */
    getGridColumns() {
        const start = [];
        const scroll = [];
        const end = [];
        if (this.selectionType === 'checkbox') {
            start.push({ placement: 'start' });
        }
        (this.columns ?? []).forEach(column => {
            const placement = Table_1.getPlacement(column);
            const entry = { column, placement };
            if (placement === 'start')
                start.push(entry);
            else if (placement === 'end')
                end.push(entry);
            else
                scroll.push(entry);
        });
        return [...start, ...scroll, ...end];
    }
    static getPlacement(column) {
        if (column.fixed === true || column.fixed === 'start')
            return 'start';
        if (column.fixed === 'end')
            return 'end';
        return 'scroll';
    }
    static getAlign(column) {
        return column.align ?? (column.type === 'number' ? 'end' : 'start');
    }
    static getWidth(column) {
        const width = Number.parseFloat(String(column.width ?? ''));
        return Number.isFinite(width) && width > 0 ? width : DEFAULT_CELL_WIDTH;
    }
    get totalColumnsWidth() {
        let total = this.selectionType === 'checkbox' ? CHECKBOX_CELL_WIDTH : 0;
        (this.columns ?? []).forEach(col => {
            total += Table_1.getWidth(col);
        });
        return total;
    }
    isColumnSortable(column) {
        return this.sortable && column.sortable !== false;
    }
    /** Total item count across pages, or `undefined` when it is unknown. */
    getTotalItems() {
        if (!this.managed)
            return this.data?.length ?? 0;
        return this.totalItems ?? undefined;
    }
    /** Rows shown on the current page, sorted and sliced unless the table is managed. */
    getPageRows() {
        let rows = [...(this.data ?? [])];
        if (this.managed)
            return rows;
        if (this.sortable && this.sortBy) {
            const direction = this.sortOrder === 'desc' ? -1 : 1;
            const key = this.sortBy;
            rows = rows.sort((a, b) => Table_1.compare(a?.[key], b?.[key]) * direction);
        }
        if (this.paginate) {
            rows = rows.slice((this.page - 1) * this.pageSize, this.page * this.pageSize);
        }
        return rows;
    }
    /** Compares numbers by value and everything else as text with natural number order. */
    static compare(a, b) {
        if (a === b)
            return 0;
        if (a === undefined || a === null || a === '')
            return 1;
        if (b === undefined || b === null || b === '')
            return -1;
        if (typeof a === 'number' && typeof b === 'number')
            return a - b;
        return collator.compare(String(a), String(b));
    }
    getRowKey(row) {
        return row?.[this.keyField];
    }
    onSortClick(col) {
        if (this.sortBy === col.name) {
            if (this.sortOrder === 'asc') {
                this.sortOrder = 'desc';
            }
            else {
                this.sortBy = '';
                this.sortOrder = 'asc';
            }
        }
        else {
            this.sortBy = col.name;
            this.sortOrder = 'asc';
        }
        this.dispatchEvent(new CustomEvent('sort', {
            detail: { sortBy: this.sortBy, sortOrder: this.sortOrder },
            bubbles: true,
            composed: true,
        }));
    }
    onSelectAllClick(pageRows) {
        const pageKeys = pageRows.map(row => this.getRowKey(row));
        const allSelected = pageKeys.length > 0 &&
            pageKeys.every(key => this.selectedRowKeys.includes(key));
        const next = allSelected
            ? this.selectedRowKeys.filter(key => !pageKeys.includes(key))
            : [...new Set([...this.selectedRowKeys, ...pageKeys])];
        this.allPagesSelected = false;
        this.onSelectChange(next, pageRows);
    }
    onRowSelectClick(row, pageRows) {
        const key = this.getRowKey(row);
        const next = this.selectedRowKeys.includes(key)
            ? this.selectedRowKeys.filter(rowKey => rowKey !== key)
            : [...this.selectedRowKeys, key];
        this.allPagesSelected = false;
        this.onSelectChange(next, pageRows);
    }
    selectAllPages(pageRows) {
        // Without the full data set (managed mode), the flag tells the owner to act on every item.
        const keys = this.managed
            ? [
                ...new Set([
                    ...this.selectedRowKeys,
                    ...pageRows.map(row => this.getRowKey(row)),
                ]),
            ]
            : (this.data ?? []).map(row => this.getRowKey(row));
        this.allPagesSelected = true;
        this.onSelectChange(keys, pageRows);
    }
    clearSelection() {
        this.allPagesSelected = false;
        this.onSelectChange([], this.getPageRows());
    }
    onSelectChange(selectedRowKeys, pageRows) {
        this.selectedRowKeys = selectedRowKeys;
        const isSelectAll = pageRows.length > 0 &&
            pageRows.every(row => selectedRowKeys.includes(this.getRowKey(row)));
        this.dispatchEvent(new CustomEvent('selection-change', {
            detail: {
                value: this.selectedRowKeys,
                isSelectAll,
                allPages: this.allPagesSelected,
            },
            bubbles: true,
            composed: true,
        }));
    }
    onCellClick(row, col, evt) {
        const selection = window.getSelection();
        if (selection?.type === 'Range')
            return;
        this.dispatchCellEvents(row, col, evt);
    }
    dispatchCellEvents(row, col, evt) {
        this.dispatchEvent(new CustomEvent('cell-click', {
            detail: {
                record: row,
                column: col,
                altKey: evt.altKey,
                ctrlKey: evt.ctrlKey,
                metaKey: evt.metaKey,
                shiftKey: evt.shiftKey,
            },
            bubbles: true,
            composed: true,
        }));
        this.dispatchEvent(new CustomEvent('row-click', {
            detail: { record: row },
            bubbles: true,
            composed: true,
        }));
    }
    onPage(event) {
        event.stopPropagation();
        this.page = event.detail.page;
        this.pageSize = event.detail.pageSize;
        this.dispatchEvent(new CustomEvent('page', {
            detail: { page: this.page, pageSize: this.pageSize },
            bubbles: true,
            composed: true,
        }));
    }
    updateScrollEdges() {
        const el = this.scrollContainer;
        if (!el)
            return;
        // scrollLeft is negative in right-to-left layouts; the magnitude is what matters.
        const scrolled = Math.abs(el.scrollLeft);
        this.scrolledFromStart = scrolled > 0;
        this.scrolledFromEnd = scrolled + el.clientWidth < el.scrollWidth - 1;
    }
    getCell(row, col) {
        return (this.renderRoot.querySelector(`[data-cell][data-row="${row}"][data-col="${col}"]`) ?? null);
    }
    /** The element that takes focus for a cell: its sort button, or the cell itself. */
    getFocusTarget(row, col) {
        const cell = this.getCell(row, col);
        return cell?.querySelector('[data-focus-target]') ?? cell;
    }
    tabIndexFor(row, col) {
        return this.activeCell.row === row && this.activeCell.col === col
            ? '0'
            : '-1';
    }
    // ── Render helpers ───────────────────────────────────────────────────────
    renderCellContent(row, column) {
        if (column.template) {
            const content = column.template(row, column);
            return b `<div class="cell-template">
        ${typeof content === 'string' ? o(content) : content}
      </div>`;
        }
        const value = row?.[column.name];
        return b `<div class="cell-text" title=${value ?? ''}>${value}</div>`;
    }
    cellClasses(entry, extra = {}) {
        const { column } = entry;
        return e$1({
            cell: true,
            'cell-checkbox': !column,
            [`align-${column ? Table_1.getAlign(column) : 'center'}`]: true,
            numeric: column?.type === 'number',
            wrap: !!column?.wrap,
            ...extra,
        });
    }
    cellStyle(entry) {
        const width = entry.column
            ? Table_1.getWidth(entry.column)
            : CHECKBOX_CELL_WIDTH;
        return o$1({ width: `${width}rem` });
    }
    /** Splits a row's cells into the start-pinned, scrolling and end-pinned groups. */
    renderRowGroups(columns, renderCell) {
        const groups = {
            start: [],
            scroll: [],
            end: [],
        };
        columns.forEach((entry, index) => {
            groups[entry.placement].push(renderCell(entry, index));
        });
        return b `
      ${groups.start.length
            ? b `<div class="columns pinned-group pinned-group-start" role="none">
            ${groups.start}
          </div>`
            : A}
      <div class="columns scroll-group" role="none">${groups.scroll}</div>
      ${groups.end.length
            ? b `<div class="columns pinned-group pinned-group-end" role="none">
            ${groups.end}
          </div>`
            : A}
    `;
    }
    renderHeader(columns, pageRows) {
        const pageKeys = pageRows.map(row => this.getRowKey(row));
        const selectedOnPage = pageKeys.filter(key => this.selectedRowKeys.includes(key)).length;
        const allOnPage = pageKeys.length > 0 && selectedOnPage === pageKeys.length;
        return b `
      <div class="header" role="rowgroup">
        <div
          class="row"
          role="row"
          aria-rowindex="1"
          style="--_row-min-width: ${this.totalColumnsWidth}rem"
        >
          ${this.renderRowGroups(columns, (entry, index) => {
            const { column } = entry;
            if (!column) {
                return b `
                <div
                  class=${this.cellClasses(entry)}
                  style=${this.cellStyle(entry)}
                  role="columnheader"
                  data-cell
                  data-row="0"
                  data-col=${index}
                  tabindex=${this.tabIndexFor(0, index)}
                  aria-label="Select all rows on this page"
                  @keydown=${(event) => {
                    if (event.key === ' ' || event.key === 'Enter') {
                        event.preventDefault();
                        this.onSelectAllClick(pageRows);
                    }
                }}
                >
                  <wc-checkbox
                    class="checkbox"
                    tabindex="-1"
                    aria-label="Select all rows on this page"
                    .checked=${allOnPage}
                    .indeterminate=${selectedOnPage > 0 && !allOnPage}
                    ?disabled=${pageKeys.length === 0}
                    @change=${() => this.onSelectAllClick(pageRows)}
                  ></wc-checkbox>
                </div>
              `;
            }
            const sortable = this.isColumnSortable(column);
            const sorted = this.sortBy === column.name;
            let ariaSort;
            if (sortable) {
                if (!sorted)
                    ariaSort = 'none';
                else
                    ariaSort =
                        this.sortOrder === 'asc' ? 'ascending' : 'descending';
            }
            return b `
              <div
                class=${this.cellClasses(entry, { sorted, sortable })}
                style=${this.cellStyle(entry)}
                role="columnheader"
                aria-sort=${ariaSort ?? A}
                data-cell
                data-row="0"
                data-col=${index}
                tabindex=${sortable ? A : this.tabIndexFor(0, index)}
              >
                ${sortable
                ? b `
                      <button
                        type="button"
                        class="sort-button"
                        data-focus-target
                        tabindex=${this.tabIndexFor(0, index)}
                        @click=${() => this.onSortClick(column)}
                      >
                        <span class="header-label">${column.label}</span>
                        <wc-icon
                          class="sort-icon"
                          aria-hidden="true"
                          name=${sorted && this.sortOrder === 'desc'
                    ? 'arrow_downward'
                    : 'arrow_upward'}
                        ></wc-icon>
                      </button>
                    `
                : b `<span class="header-label">${column.label}</span>`}
              </div>
            `;
        })}
        </div>
        ${this.loading && pageRows.length
            ? b `<wc-linear-progress
              class="loading-bar"
              indeterminate
              aria-label="Loading"
            ></wc-linear-progress>`
            : A}
      </div>
    `;
    }
    renderBody(columns, pageRows) {
        const rowOffset = this.paginate ? (this.page - 1) * this.pageSize : 0;
        const selectable = this.selectionType === 'checkbox';
        const rows = pageRows.map((row, rowIndex) => {
            const gridRow = rowIndex + 1;
            const selected = selectable && this.selectedRowKeys.includes(this.getRowKey(row));
            return b `
        <div
          class=${e$1({ row: true, selected })}
          role="row"
          aria-rowindex=${rowOffset + rowIndex + 2}
          aria-selected=${selectable ? String(selected) : A}
          style="--_row-min-width: ${this.totalColumnsWidth}rem"
        >
          ${this.renderRowGroups(columns, (entry, index) => {
                const { column } = entry;
                if (!column) {
                    return b `
                <div
                  class=${this.cellClasses(entry)}
                  style=${this.cellStyle(entry)}
                  role="gridcell"
                  data-cell
                  data-row=${gridRow}
                  data-col=${index}
                  tabindex=${this.tabIndexFor(gridRow, index)}
                >
                  <wc-checkbox
                    class="checkbox"
                    tabindex="-1"
                    aria-label="Select row"
                    .checked=${selected}
                    @change=${() => this.onRowSelectClick(row, pageRows)}
                  ></wc-checkbox>
                </div>
              `;
                }
                // Enter on a cell is handled by the grid's keydown listener.
                /* eslint-disable lit-a11y/click-events-have-key-events */
                return b `
              <div
                class=${this.cellClasses(entry)}
                style=${this.cellStyle(entry)}
                role="gridcell"
                data-cell
                data-row=${gridRow}
                data-col=${index}
                tabindex=${this.tabIndexFor(gridRow, index)}
                @click=${(evt) => this.onCellClick(row, column, evt)}
              >
                ${this.renderCellContent(row, column)}
              </div>
            `;
                /* eslint-enable lit-a11y/click-events-have-key-events */
            })}
        </div>
      `;
        });
        return b `<div class="body" role="rowgroup">${rows}</div>`;
    }
    renderSkeletonBody(columns) {
        const count = this.paginate ? Math.min(this.pageSize, 10) : SKELETON_ROWS;
        return b `
      <div class="body" role="rowgroup">
        ${Array.from({ length: count }, (_, rowIndex) => b `
            <div
              class="row skeleton-row"
              role="row"
              style="--_row-min-width: ${this.totalColumnsWidth}rem"
            >
              ${this.renderRowGroups(columns, (entry, index) => b `
                  <div
                    class=${this.cellClasses(entry)}
                    style=${this.cellStyle(entry)}
                    role="gridcell"
                  >
                    <wc-skeleton
                      class="skeleton-bar"
                      visible
                      style=${entry.column
            ? `inline-size: ${40 + ((rowIndex * 7 + index * 13) % 45)}%`
            : A}
                    ></wc-skeleton>
                  </div>
                `)}
            </div>
          `)}
      </div>
    `;
    }
    renderEmptyState() {
        return b `
      <div class="empty-table">
        <wc-empty-state
          class="empty-state"
          headline=${this.emptyStateHeadline}
          description=${this.emptyStateDescription}
        ></wc-empty-state>
      </div>
    `;
    }
    renderBulkBar(pageRows) {
        if (this.selectionType !== 'checkbox')
            return A;
        const count = this.selectedRowKeys.length;
        if (count === 0)
            return A;
        const total = this.getTotalItems();
        const shownCount = this.allPagesSelected && total !== undefined ? total : count;
        const pageFullySelected = pageRows.length > 0 &&
            pageRows.every(row => this.selectedRowKeys.includes(this.getRowKey(row)));
        const canSelectAllPages = this.paginate &&
            !this.allPagesSelected &&
            pageFullySelected &&
            total !== undefined &&
            total > count;
        return b `
      <div class="bulk-bar" role="region" aria-label="Selection">
        <span class="bulk-count" aria-live="polite"
          >${shownCount} selected</span
        >
        ${canSelectAllPages
            ? b `<wc-button
              class="bulk-select-all"
              variant="text"
              size="sm"
              @click=${() => this.selectAllPages(pageRows)}
              >Select all ${total}</wc-button
            >`
            : A}
        <span class="bulk-spacer"></span>
        <slot name="bulk-actions"></slot>
        <wc-button
          class="bulk-clear"
          variant="text"
          size="sm"
          @click=${this.clearSelection}
          >Clear</wc-button
        >
      </div>
    `;
    }
    renderPagination() {
        if (!this.paginate)
            return A;
        return b `
      <div class="table-footer">
        <wc-pagination
          .page=${this.page}
          .pageSize=${this.pageSize}
          .totalItems=${this.getTotalItems()}
          .hasNext=${this.hasNext}
          .variant=${this.paginationVariant}
          .pageSizes=${this.pageSizes ?? [10, 25, 50, 100]}
          @page=${this.onPage}
        ></wc-pagination>
      </div>
    `;
    }
    // ── Render ───────────────────────────────────────────────────────────────
    render() {
        const columns = this.getGridColumns();
        const pageRows = this.getPageRows();
        const total = this.getTotalItems();
        const hasRows = pageRows.length > 0;
        let body;
        if (hasRows)
            body = this.renderBody(columns, pageRows);
        else if (this.loading)
            body = this.renderSkeletonBody(columns);
        else
            body = this.renderEmptyState();
        return b `
      <div
        class=${e$1({
            table: true,
            'scrolled-from-start': this.scrolledFromStart,
            'scrolled-from-end': this.scrolledFromEnd,
            'has-selection': this.selectedRowKeys.length > 0,
            'has-footer': this.paginate,
        })}
      >
        ${this.renderBulkBar(pageRows)}
        <div
          class="table-scroll-container"
          role="grid"
          aria-label=${this.label || A}
          aria-busy=${this.loading ? 'true' : A}
          aria-multiselectable=${this.selectionType === 'checkbox'
            ? 'true'
            : A}
          aria-rowcount=${this.paginate && total !== undefined
            ? total + 1
            : A}
          aria-colcount=${columns.length}
          @scroll=${this.onScrollContainer}
          @focusin=${this.onGridFocusIn}
          @keydown=${this.onGridKeydown}
        >
          ${this.renderHeader(columns, pageRows)} ${body}
        </div>
        ${this.renderPagination()}
      </div>
    `;
    }
};
Table.styles = [css_248z];
__decorate([
    n({ type: Array })
], Table.prototype, "columns", void 0);
__decorate([
    n({ type: Array })
], Table.prototype, "data", void 0);
__decorate([
    n({ type: String, attribute: 'selection-type' })
], Table.prototype, "selectionType", void 0);
__decorate([
    n({ type: Array, attribute: 'selected-row-keys' })
], Table.prototype, "selectedRowKeys", void 0);
__decorate([
    n({ type: String, attribute: 'key-field' })
], Table.prototype, "keyField", void 0);
__decorate([
    n({ type: Boolean })
], Table.prototype, "managed", void 0);
__decorate([
    n({ type: Boolean })
], Table.prototype, "sortable", void 0);
__decorate([
    n({ type: String, attribute: 'sort-by' })
], Table.prototype, "sortBy", void 0);
__decorate([
    n({ type: String, attribute: 'sort-order' })
], Table.prototype, "sortOrder", void 0);
__decorate([
    n({ type: Boolean })
], Table.prototype, "paginate", void 0);
__decorate([
    n({ type: Number })
], Table.prototype, "page", void 0);
__decorate([
    n({ type: Number, attribute: 'page-size' })
], Table.prototype, "pageSize", void 0);
__decorate([
    n({ type: Array, attribute: 'page-sizes' })
], Table.prototype, "pageSizes", void 0);
__decorate([
    n({ type: Number, attribute: 'total-items' })
], Table.prototype, "totalItems", void 0);
__decorate([
    n({ type: Boolean, attribute: 'has-next' })
], Table.prototype, "hasNext", void 0);
__decorate([
    n({ type: String, attribute: 'pagination-variant' })
], Table.prototype, "paginationVariant", void 0);
__decorate([
    n({ type: String, reflect: true })
], Table.prototype, "density", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Table.prototype, "striped", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Table.prototype, "loading", void 0);
__decorate([
    n({ type: String })
], Table.prototype, "label", void 0);
__decorate([
    n({ type: String, attribute: 'empty-state-headline' })
], Table.prototype, "emptyStateHeadline", void 0);
__decorate([
    n({ type: String, attribute: 'empty-state-description' })
], Table.prototype, "emptyStateDescription", void 0);
__decorate([
    r()
], Table.prototype, "allPagesSelected", void 0);
__decorate([
    r()
], Table.prototype, "scrolledFromStart", void 0);
__decorate([
    r()
], Table.prototype, "scrolledFromEnd", void 0);
__decorate([
    r()
], Table.prototype, "activeCell", void 0);
__decorate([
    e('.table-scroll-container')
], Table.prototype, "scrollContainer", void 0);
Table = Table_1 = __decorate([
    IndividualComponent
], Table);

export { Table };
//# sourceMappingURL=table.js.map
