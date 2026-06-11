import { i, _ as __decorate, I as IndividualComponent, a as i$1, b, A } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { r } from './state-DkTK9EGF.js';
import { e } from './class-map-DG7CA1et.js';
import { o } from './unsafe-html-Ct0N2_UU.js';
import { t as throttle } from './throttle-C7ZAPqtu.js';
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
  min-height: 20em;
  --table-border-color: var(--color-outline-variant);
  --table-border: 1px solid var(--table-border-color);
  --table-col-content-padding: var(--spacing-150, 0.75rem)
    var(--spacing-200, 1rem);
}

.table {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-surface, #fff);
  font-family: var(--typography-body-medium-font-family);
  font-size: var(--typography-body-medium-font-size);
  font-weight: var(--typography-body-medium-font-weight);
  line-height: var(--typography-body-medium-line-height);
  letter-spacing: var(--typography-body-medium-letter-spacing);
}
.table .table-scroll-container {
  position: relative;
  overflow: auto;
  height: 100%;
}
.table .empty-table {
  height: 80%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.table .empty-table .empty-state {
  width: 10rem;
}
.table wc-pagination {
  border-top: 1px solid var(--table-border-color);
}
.table.horizontal-scrolled .fixed-columns::after {
  box-shadow: 10px 0 20px -20px var(--color-outline) inset;
  content: " ";
  height: 100%;
  position: absolute;
  top: 0;
  right: -20px;
  width: 20px;
}

.row {
  display: flex;
  box-sizing: border-box;
  width: max-content;
  min-width: 100%;
}
.row .columns-container {
  display: flex;
}
.row .col {
  margin: 0;
  color: var(--color-on-surface);
  flex-shrink: 0;
}
.row .col .col-content {
  display: flex;
  align-items: center;
  height: 100%;
}
.row .col .col-content .col-text {
  padding: var(--table-col-content-padding);
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.row .col .col-content .col-template {
  width: 100%;
}
.row .col .col-content .col-action {
  --button-container-shape: 0;
}
.row .col .col-content .checkbox {
  padding: 0 var(--spacing-100, 0.5rem);
}
.row .col.center .col-content {
  justify-content: center;
}
.row .col:last-child {
  flex: 1;
}
.row .fixed-columns {
  position: sticky;
  left: 0;
}
.row .scrollable-columns {
  flex: 0 0 auto;
}

.header {
  position: sticky;
  top: 0;
  font-family: var(--typography-label-medium-font-family);
  font-size: var(--typography-label-medium-font-size);
  font-weight: var(--typography-label-medium-font-weight);
  line-height: var(--typography-label-medium-line-height);
  letter-spacing: var(--typography-label-medium-letter-spacing);
}
.header .col {
  background: var(--color-surface-variant, #f4f4f4);
}
.header .col.sort {
  background: var(--color-secondary-container, #e8eaf6);
}

.body .row .col {
  cursor: pointer;
  background: var(--color-surface, #fff);
  border-bottom: 1px solid var(--color-surface-variant, #f4f4f4);
}
.body .row .col.col-checkbox .col-content {
  border: 0;
}
.body .row .col .col-content {
  border: 2px solid transparent;
  border-bottom: 1px solid transparent;
}
.body .row .col .col-content .col-text {
  text-wrap: wrap;
}
.body .row .col:focus {
  outline: none;
  border-bottom-color: var(--color-primary);
}
.body .row .col:focus .col-content {
  border-color: var(--color-primary);
}
.body .row:hover .col {
  background-color: var(--color-surface-container-low, #f8f8f8);
}`;

const DEFAULT_CELL_WIDTH = 16; // in rem
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
let Table = class Table extends i$1 {
    constructor() {
        super(...arguments);
        /**
         * Grid columns configuration.
         * Each column can have: name, label, width (px), fixed (boolean), template (function).
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
         * If true, pagination is enabled. Defaults to `true`.
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
         * Headline text shown when the table has no data.
         */
        this.emptyStateHeadline = 'No items';
        /**
         * Description text shown when the table has no data.
         */
        this.emptyStateDescription = 'There are no items to display';
        /** Tracks the currently hovered row and column for hover-highlight CSS. */
        this.hoveredCell = {};
        /** True when all rows on the current page are selected. */
        this.isSelectAll = false;
        /** True when some (but not all) rows on the current page are selected. */
        this.isSelectAllIntermediate = false;
        /** True when the scroll container has been scrolled horizontally. */
        this.isHorizontallyScrolled = false;
        // ── Private fields ────────────────────────────────────────────────────────
        /** Throttled version of the cell-mouseover handler to avoid excessive state updates. */
        this.onCellMouseOverThrottled = throttle((row, column) => {
            this.hoveredCell = { row, column };
        }, 30);
        this.onSelectAllClick = () => {
            this.isSelectAll = !this.isSelectAll;
            let selectedRowKeys = [];
            if (this.isSelectAll) {
                selectedRowKeys = this.data
                    .slice((this.page - 1) * this.pageSize, this.page * this.pageSize)
                    .map(row => row[this.keyField]);
            }
            this.onSelectChange(selectedRowKeys);
        };
        this.onRowSelectClick = (row) => {
            let selectedRowKeys = [...this.selectedRowKeys];
            if (selectedRowKeys.includes(row[this.keyField])) {
                this.isSelectAll = false;
                selectedRowKeys = selectedRowKeys.filter(rowId => rowId !== row[this.keyField]);
            }
            else {
                selectedRowKeys.push(row[this.keyField]);
            }
            this.onSelectChange(selectedRowKeys);
        };
        this.onScrollContainer = (event) => {
            const target = event.target;
            this.isHorizontallyScrolled = !!target.scrollLeft;
        };
    }
    onSelectChange(selectedRowKeys) {
        this.selectedRowKeys = selectedRowKeys;
        this.dispatchEvent(new CustomEvent('selection-change', {
            detail: {
                value: this.selectedRowKeys,
                isSelectAll: this.isSelectAll,
            },
            bubbles: true,
            composed: true,
        }));
    }
    onCellClick(row, col, evt) {
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
    }
    get totalColumnsWidth() {
        let total = 0;
        if (this.selectionType === 'checkbox') {
            total += 3; // approximate checkbox column width in rem
        }
        this.columns.forEach(col => {
            total += col.width ?? DEFAULT_CELL_WIDTH;
        });
        return total;
    }
    getTotalItems() {
        if (this.paginate && !this.managed && this.data)
            return this.data.length;
        return this.totalItems ?? 0;
    }
    getSortIcon(col) {
        if (this.sortBy === col.name) {
            return this.sortOrder === 'asc'
                ? 'keyboard_arrow_up'
                : 'keyboard_arrow_down';
        }
        return 'unfold_more';
    }
    onSortClick(col) {
        if (this.sortBy === col.name) {
            if (this.sortOrder === 'asc') {
                this.sortOrder = 'desc';
            }
            else {
                this.sortBy = '';
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
    renderHeader() {
        const fixedCols = [];
        const scrollCols = [];
        if (this.selectionType === 'checkbox') {
            fixedCols.push(b `
        <div class="col col-checkbox center">
          <div class="col-content">
            <wc-checkbox
              class="checkbox"
              .value=${this.isSelectAll}
              .indeterminate=${this.isSelectAllIntermediate}
              @change=${this.onSelectAllClick}
            ></wc-checkbox>
          </div>
        </div>
      `);
        }
        this.columns.forEach(col => {
            const colWidth = col.width
                ? parseInt(String(col.width), 10)
                : DEFAULT_CELL_WIDTH;
            const colEl = b `
        <div
          class=${e({ col: true, sort: this.sortBy === col.name })}
          style="width: ${colWidth}rem"
        >
          <div class="col-content">
            <div class="col-text">${col.label}</div>
            <div class="col-actions">
              ${this.sortable
                ? b `
                    <wc-button
                      class="col-action"
                      color="secondary"
                      variant="text"
                      @click=${() => this.onSortClick(col)}
                    >
                      <wc-icon
                        slot="icon"
                        name=${this.getSortIcon(col)}
                      ></wc-icon>
                    </wc-button>
                  `
                : A}
            </div>
          </div>
        </div>
      `;
            if (col.fixed) {
                fixedCols.push(colEl);
            }
            else {
                scrollCols.push(colEl);
            }
        });
        return b `
      <div class="header">
        <div class="row" style="min-width: ${this.totalColumnsWidth}rem">
          <div class="fixed-columns columns-container">${fixedCols}</div>
          <div class="scrollable-columns columns-container">${scrollCols}</div>
        </div>
      </div>
    `;
    }
    renderBody() {
        let data = [...this.data];
        if (!this.managed) {
            if (this.sortable && this.sortBy) {
                data = data.sort((a, b) => {
                    if (a[this.sortBy] < b[this.sortBy])
                        return this.sortOrder === 'asc' ? -1 : 1;
                    if (a[this.sortBy] > b[this.sortBy])
                        return this.sortOrder === 'asc' ? 1 : -1;
                    return 0;
                });
            }
            if (this.paginate) {
                data = data.slice((this.page - 1) * this.pageSize, this.page * this.pageSize);
            }
        }
        const rows = data.map(row => {
            const fixedCols = [];
            const scrollCols = [];
            if (this.selectionType === 'checkbox') {
                fixedCols.push(b `
          <div class="col center col-checkbox">
            <div class="col-content">
              <wc-checkbox
                class="checkbox"
                .value=${this.selectedRowKeys.includes(row[this.keyField])}
                @change=${() => this.onRowSelectClick(row)}
              ></wc-checkbox>
            </div>
          </div>
        `);
            }
            this.columns.forEach(column => {
                const colWidth = column.width
                    ? parseInt(String(column.width), 10)
                    : DEFAULT_CELL_WIDTH;
                const colEl = b `
          <div
            tabindex="0"
            class=${e({
                    col: true,
                    'col-hover': this.hoveredCell.row === row &&
                        this.hoveredCell.column === column,
                })}
            style="width: ${colWidth}rem"
            @mouseover=${() => this.onCellMouseOverThrottled(row, column)}
            @focus=${() => this.onCellMouseOverThrottled(row, column)}
            @keydown=${(event) => {
                    if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
                        const elem = event.target;
                        window.navigator.clipboard
                            .writeText(elem.innerText)
                            .catch(() => { });
                    }
                }}
            @click=${(evt) => {
                    const selection = window.getSelection();
                    if (selection?.type !== 'Range') {
                        this.onCellClick(row, column, evt);
                    }
                }}
          >
            <div class="col-content">
              ${column.template
                    ? b `<div class="col-template">
                    ${o(column.template(row, column))}
                  </div>`
                    : b `<div class="col-text" title=${row?.[column.name] ?? ''}>
                    ${row?.[column.name]}
                  </div>`}
            </div>
          </div>
        `;
                if (column.fixed) {
                    fixedCols.push(colEl);
                }
                else {
                    scrollCols.push(colEl);
                }
            });
            return b `
        <div
          class=${e({
                row: true,
                'row-hover': this.hoveredCell.row === row,
            })}
          style="min-width: ${this.totalColumnsWidth}rem"
        >
          <div class="fixed-columns columns-container">${fixedCols}</div>
          <div class="scrollable-columns columns-container">${scrollCols}</div>
        </div>
      `;
        });
        return b `<div class="body">${rows}</div>`;
    }
    renderEmptyState() {
        return b `
      <div class="empty-table">
        <wc-empty-state
          class="empty-state content-center"
          headline=${this.emptyStateHeadline}
          description=${this.emptyStateDescription}
        ></wc-empty-state>
      </div>
    `;
    }
    renderPagination() {
        if (!this.paginate)
            return A;
        return b `
      <wc-pagination
        .page=${this.page}
        .pageSize=${this.pageSize}
        .totalItems=${this.getTotalItems()}
        @page=${(e) => {
            this.page = e.detail.page;
            this.pageSize = e.detail.pageSize;
            this.dispatchEvent(new CustomEvent('page', {
                detail: { page: this.page, pageSize: this.pageSize },
                bubbles: true,
                composed: true,
            }));
        }}
      ></wc-pagination>
    `;
    }
    render() {
        const tableClasses = {
            table: true,
            sortable: this.sortable,
            paginate: this.paginate,
            'horizontal-scrolled': this.isHorizontallyScrolled,
        };
        return b `
      <div class=${e(tableClasses)}>
        <div class="table-scroll-container" @scroll=${this.onScrollContainer}>
          ${this.renderHeader()}
          ${this.data && this.data.length
            ? this.renderBody()
            : this.renderEmptyState()}
        </div>
        <div class="table-footer">${this.renderPagination()}</div>
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
    n({ type: Number, attribute: 'total-items' })
], Table.prototype, "totalItems", void 0);
__decorate([
    n({ type: String, attribute: 'empty-state-headline' })
], Table.prototype, "emptyStateHeadline", void 0);
__decorate([
    n({ type: String, attribute: 'empty-state-description' })
], Table.prototype, "emptyStateDescription", void 0);
__decorate([
    r()
], Table.prototype, "hoveredCell", void 0);
__decorate([
    r()
], Table.prototype, "isSelectAll", void 0);
__decorate([
    r()
], Table.prototype, "isSelectAllIntermediate", void 0);
__decorate([
    r()
], Table.prototype, "isHorizontallyScrolled", void 0);
Table = __decorate([
    IndividualComponent
], Table);

export { Table };
//# sourceMappingURL=table.js.map
