import { html, LitElement, nothing } from 'lit';
import type { PropertyValues, TemplateResult } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import styles from './table.scss';
import IndividualComponent from '@/IndividualComponent.js';
import type { PaginationVariant } from '../pagination/pagination.js';

const DEFAULT_CELL_WIDTH = 16; // in rem
const CHECKBOX_CELL_WIDTH = 3; // in rem
const SKELETON_ROWS = 5;

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

type ColumnPlacement = 'start' | 'scroll' | 'end';

/** A rendered column: a data column, or the selection checkbox column. */
interface GridColumn {
  column?: TableColumn;
  placement: ColumnPlacement;
}

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
@IndividualComponent
export class Table extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /**
   * Grid columns configuration.
   * Each column can have: name, label, width (rem), fixed, align, type, sortable, wrap, template.
   */
  @property({ type: Array })
  columns: TableColumn[] = [];

  /**
   * Grid data to display on table.
   */
  @property({ type: Array })
  data: TableRow[] = [];

  /**
   * Row selection type. Set to `"checkbox"` to enable checkbox selection.
   */
  @property({ type: String, attribute: 'selection-type' })
  selectionType: 'checkbox' | undefined;

  /**
   * Array of selected row key values.
   */
  @property({ type: Array, attribute: 'selected-row-keys' })
  selectedRowKeys: string[] = [];

  /**
   * The field name used as the unique key for each row. Defaults to `"id"`.
   */
  @property({ type: String, attribute: 'key-field' })
  keyField: string = 'id';

  /**
   * If true, sorting and pagination are managed externally (controlled mode).
   */
  @property({ type: Boolean })
  managed: boolean = false;

  /**
   * If true, columns are sortable. Defaults to `true`.
   */
  @property({ type: Boolean })
  sortable: boolean = true;

  /**
   * The field name currently used for sorting.
   */
  @property({ type: String, attribute: 'sort-by' })
  sortBy: string = '';

  /**
   * The current sort order. Possible values are `"asc"` and `"desc"`. Defaults to `"asc"`.
   */
  @property({ type: String, attribute: 'sort-order' })
  sortOrder: 'asc' | 'desc' = 'asc';

  /**
   * If true, pagination is enabled. Defaults to `false`.
   */
  @property({ type: Boolean })
  paginate: boolean = false;

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
   * Supported page size options, passed to the pagination.
   */
  @property({ type: Array, attribute: 'page-sizes' })
  pageSizes: number[] | undefined;

  /**
   * Total number of items (used in managed/controlled mode). Leave it unset when the total is
   * unknown; the pagination then shows previous and next, driven by `has-next`.
   */
  @property({ type: Number, attribute: 'total-items' })
  totalItems: number | undefined;

  /**
   * Whether another page exists after this one, in managed mode with an unknown total.
   */
  @property({ type: Boolean, attribute: 'has-next' })
  hasNext: boolean = false;

  /**
   * Pagination variant: `full` (page numbers), `compact` or `simple`. Defaults to `full`.
   */
  @property({ type: String, attribute: 'pagination-variant' })
  paginationVariant: PaginationVariant = 'full';

  /**
   * Row height: `compact`, `default` or `comfortable`. Defaults to `default`.
   */
  @property({ type: String, reflect: true })
  density: 'compact' | 'default' | 'comfortable' = 'default';

  /**
   * Shades every other row.
   */
  @property({ type: Boolean, reflect: true })
  striped: boolean = false;

  /**
   * Shows a loading state: skeleton rows while there is no data, otherwise a progress bar
   * under the header so the current rows stay readable.
   */
  @property({ type: Boolean, reflect: true })
  loading: boolean = false;

  /**
   * Accessible name of the table.
   */
  @property({ type: String })
  label: string = '';

  /**
   * Headline text shown when the table has no data.
   */
  @property({ type: String, attribute: 'empty-state-headline' })
  emptyStateHeadline: string = 'No items';

  /**
   * Description text shown when the table has no data.
   */
  @property({ type: String, attribute: 'empty-state-description' })
  emptyStateDescription: string = 'There are no items to display';

  // ── States ───────────────────────────────────────────────────────────────

  /** True when every item across all pages is selected, not only the current page. */
  @state()
  private allPagesSelected: boolean = false;

  /** True when content is scrolled under the start-pinned columns. */
  @state()
  private scrolledFromStart: boolean = false;

  /** True when more content waits past the end-pinned columns. */
  @state()
  private scrolledFromEnd: boolean = false;

  /** The cell that holds the grid's single tab stop. Row 0 is the header. */
  @state()
  private activeCell: { row: number; col: number } = { row: 0, col: 0 };

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('.table-scroll-container')
  private scrollContainer?: HTMLElement;

  // ── Private fields ───────────────────────────────────────────────────────

  /** Set when a keyboard move must focus the active cell after the next render. */
  private pendingFocus: boolean = false;

  /** Watches the scroll container so the edge shadows follow resizes. */
  private resizeObserver?: ResizeObserver;

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

  protected override willUpdate(changed: PropertyValues<Table>): void {
    if (!Number.isFinite(this.page) || this.page < 1) {
      this.page = 1;
    }

    // Filtering the data can leave the current page past the end.
    // An empty data set (for example before the first load) keeps the requested page.
    if (
      this.paginate &&
      !this.managed &&
      changed.has('data') &&
      this.data?.length
    ) {
      const lastPage = Math.max(
        1,
        Math.ceil((this.data?.length ?? 0) / this.pageSize),
      );
      if (this.page > lastPage) this.page = lastPage;
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

  protected override updated(changed: PropertyValues<Table>): void {
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
  private getGridColumns(): GridColumn[] {
    const start: GridColumn[] = [];
    const scroll: GridColumn[] = [];
    const end: GridColumn[] = [];

    if (this.selectionType === 'checkbox') {
      start.push({ placement: 'start' });
    }
    (this.columns ?? []).forEach(column => {
      const placement = Table.getPlacement(column);
      const entry = { column, placement };
      if (placement === 'start') start.push(entry);
      else if (placement === 'end') end.push(entry);
      else scroll.push(entry);
    });
    return [...start, ...scroll, ...end];
  }

  private static getPlacement(column: TableColumn): ColumnPlacement {
    if (column.fixed === true || column.fixed === 'start') return 'start';
    if (column.fixed === 'end') return 'end';
    return 'scroll';
  }

  private static getAlign(column: TableColumn): 'start' | 'center' | 'end' {
    return column.align ?? (column.type === 'number' ? 'end' : 'start');
  }

  private static getWidth(column: TableColumn): number {
    const width = Number.parseFloat(String(column.width ?? ''));
    return Number.isFinite(width) && width > 0 ? width : DEFAULT_CELL_WIDTH;
  }

  private get totalColumnsWidth(): number {
    let total = this.selectionType === 'checkbox' ? CHECKBOX_CELL_WIDTH : 0;
    (this.columns ?? []).forEach(col => {
      total += Table.getWidth(col);
    });
    return total;
  }

  private isColumnSortable(column: TableColumn): boolean {
    return this.sortable && column.sortable !== false;
  }

  /** Total item count across pages, or `undefined` when it is unknown. */
  private getTotalItems(): number | undefined {
    if (!this.managed) return this.data?.length ?? 0;
    return this.totalItems ?? undefined;
  }

  /** Rows shown on the current page, sorted and sliced unless the table is managed. */
  private getPageRows(): TableRow[] {
    let rows = [...(this.data ?? [])];
    if (this.managed) return rows;

    if (this.sortable && this.sortBy) {
      const direction = this.sortOrder === 'desc' ? -1 : 1;
      const key = this.sortBy;
      rows = rows.sort((a, b) => Table.compare(a?.[key], b?.[key]) * direction);
    }
    if (this.paginate) {
      rows = rows.slice(
        (this.page - 1) * this.pageSize,
        this.page * this.pageSize,
      );
    }
    return rows;
  }

  /** Compares numbers by value and everything else as text with natural number order. */
  private static compare(a: unknown, b: unknown): number {
    if (a === b) return 0;
    if (a === undefined || a === null || a === '') return 1;
    if (b === undefined || b === null || b === '') return -1;
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    return collator.compare(String(a), String(b));
  }

  private getRowKey(row: TableRow): string {
    return row?.[this.keyField];
  }

  private onSortClick(col: TableColumn) {
    if (this.sortBy === col.name) {
      if (this.sortOrder === 'asc') {
        this.sortOrder = 'desc';
      } else {
        this.sortBy = '';
        this.sortOrder = 'asc';
      }
    } else {
      this.sortBy = col.name;
      this.sortOrder = 'asc';
    }
    this.dispatchEvent(
      new CustomEvent('sort', {
        detail: { sortBy: this.sortBy, sortOrder: this.sortOrder },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private onSelectAllClick(pageRows: TableRow[]) {
    const pageKeys = pageRows.map(row => this.getRowKey(row));
    const allSelected =
      pageKeys.length > 0 &&
      pageKeys.every(key => this.selectedRowKeys.includes(key));

    const next = allSelected
      ? this.selectedRowKeys.filter(key => !pageKeys.includes(key))
      : [...new Set([...this.selectedRowKeys, ...pageKeys])];
    this.allPagesSelected = false;
    this.onSelectChange(next, pageRows);
  }

  private onRowSelectClick(row: TableRow, pageRows: TableRow[]) {
    const key = this.getRowKey(row);
    const next = this.selectedRowKeys.includes(key)
      ? this.selectedRowKeys.filter(rowKey => rowKey !== key)
      : [...this.selectedRowKeys, key];
    this.allPagesSelected = false;
    this.onSelectChange(next, pageRows);
  }

  private selectAllPages(pageRows: TableRow[]) {
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

  private clearSelection() {
    this.allPagesSelected = false;
    this.onSelectChange([], this.getPageRows());
  }

  private onSelectChange(selectedRowKeys: string[], pageRows: TableRow[]) {
    this.selectedRowKeys = selectedRowKeys;
    const isSelectAll =
      pageRows.length > 0 &&
      pageRows.every(row => selectedRowKeys.includes(this.getRowKey(row)));
    this.dispatchEvent(
      new CustomEvent('selection-change', {
        detail: {
          value: this.selectedRowKeys,
          isSelectAll,
          allPages: this.allPagesSelected,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private onCellClick(row: TableRow, col: TableColumn, evt: MouseEvent) {
    const selection = window.getSelection();
    if (selection?.type === 'Range') return;
    this.dispatchCellEvents(row, col, evt);
  }

  private dispatchCellEvents(
    row: TableRow,
    col: TableColumn,
    evt: MouseEvent | KeyboardEvent,
  ) {
    this.dispatchEvent(
      new CustomEvent('cell-click', {
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
      }),
    );
    this.dispatchEvent(
      new CustomEvent('row-click', {
        detail: { record: row },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private onPage(event: CustomEvent<{ page: number; pageSize: number }>) {
    event.stopPropagation();
    this.page = event.detail.page;
    this.pageSize = event.detail.pageSize;
    this.dispatchEvent(
      new CustomEvent('page', {
        detail: { page: this.page, pageSize: this.pageSize },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private onScrollContainer = () => {
    this.updateScrollEdges();
  };

  private updateScrollEdges() {
    const el = this.scrollContainer;
    if (!el) return;
    // scrollLeft is negative in right-to-left layouts; the magnitude is what matters.
    const scrolled = Math.abs(el.scrollLeft);
    this.scrolledFromStart = scrolled > 0;
    this.scrolledFromEnd = scrolled + el.clientWidth < el.scrollWidth - 1;
  }

  private getCell(row: number, col: number): HTMLElement | null {
    return (
      this.renderRoot.querySelector<HTMLElement>(
        `[data-cell][data-row="${row}"][data-col="${col}"]`,
      ) ?? null
    );
  }

  /** The element that takes focus for a cell: its sort button, or the cell itself. */
  private getFocusTarget(row: number, col: number): HTMLElement | null {
    const cell = this.getCell(row, col);
    return cell?.querySelector<HTMLElement>('[data-focus-target]') ?? cell;
  }

  private tabIndexFor(row: number, col: number): string {
    return this.activeCell.row === row && this.activeCell.col === col
      ? '0'
      : '-1';
  }

  private onGridFocusIn = (event: FocusEvent) => {
    const cell = (event.target as HTMLElement).closest<HTMLElement>(
      '[data-cell]',
    );
    if (!cell) return;
    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);
    if (row !== this.activeCell.row || col !== this.activeCell.col) {
      this.activeCell = { row, col };
    }
  };

  private onGridKeydown = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    const cell = target.closest<HTMLElement>('[data-cell]');
    // Leave keys alone while focus is on interactive content inside a cell.
    if (!cell || (target !== cell && !target.hasAttribute('data-focus-target')))
      return;

    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);
    const lastRow = this.getPageRows().length;
    const lastCol = this.getGridColumns().length - 1;
    let next: { row: number; col: number } | undefined;

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
          if (column) this.dispatchCellEvents(pageRows[row - 1], column, event);
        }
        return;
      case 'c':
      case 'C':
        if ((event.ctrlKey || event.metaKey) && row > 0) {
          window.navigator.clipboard?.writeText(cell.innerText).catch(() => {});
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

  // ── Render helpers ───────────────────────────────────────────────────────

  private renderCellContent(row: TableRow, column: TableColumn) {
    if (column.template) {
      const content = column.template(row, column);
      return html`<div class="cell-template">
        ${typeof content === 'string' ? unsafeHTML(content) : content}
      </div>`;
    }
    const value = row?.[column.name];
    return html`<div class="cell-text" title=${value ?? ''}>${value}</div>`;
  }

  private cellClasses(entry: GridColumn, extra: Record<string, boolean> = {}) {
    const { column } = entry;
    return classMap({
      cell: true,
      'cell-checkbox': !column,
      [`align-${column ? Table.getAlign(column) : 'center'}`]: true,
      numeric: column?.type === 'number',
      wrap: !!column?.wrap,
      ...extra,
    });
  }

  private cellStyle(entry: GridColumn) {
    const width = entry.column
      ? Table.getWidth(entry.column)
      : CHECKBOX_CELL_WIDTH;
    return styleMap({ width: `${width}rem` });
  }

  /** Splits a row's cells into the start-pinned, scrolling and end-pinned groups. */
  private renderRowGroups(
    columns: GridColumn[],
    renderCell: (entry: GridColumn, index: number) => TemplateResult,
  ) {
    const groups: Record<ColumnPlacement, TemplateResult[]> = {
      start: [],
      scroll: [],
      end: [],
    };
    columns.forEach((entry, index) => {
      groups[entry.placement].push(renderCell(entry, index));
    });
    return html`
      ${groups.start.length
        ? html`<div class="columns pinned-group pinned-group-start" role="none">
            ${groups.start}
          </div>`
        : nothing}
      <div class="columns scroll-group" role="none">${groups.scroll}</div>
      ${groups.end.length
        ? html`<div class="columns pinned-group pinned-group-end" role="none">
            ${groups.end}
          </div>`
        : nothing}
    `;
  }

  private renderHeader(columns: GridColumn[], pageRows: TableRow[]) {
    const pageKeys = pageRows.map(row => this.getRowKey(row));
    const selectedOnPage = pageKeys.filter(key =>
      this.selectedRowKeys.includes(key),
    ).length;
    const allOnPage = pageKeys.length > 0 && selectedOnPage === pageKeys.length;

    return html`
      <div class="header" role="rowgroup">
        <div
          class="row"
          role="row"
          aria-rowindex="1"
          style="min-width: ${this.totalColumnsWidth}rem"
        >
          ${this.renderRowGroups(columns, (entry, index) => {
            const { column } = entry;
            if (!column) {
              return html`
                <div
                  class=${this.cellClasses(entry)}
                  style=${this.cellStyle(entry)}
                  role="columnheader"
                  data-cell
                  data-row="0"
                  data-col=${index}
                  tabindex=${this.tabIndexFor(0, index)}
                  aria-label="Select all rows on this page"
                  @keydown=${(event: KeyboardEvent) => {
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
            let ariaSort: 'ascending' | 'descending' | 'none' | undefined;
            if (sortable) {
              if (!sorted) ariaSort = 'none';
              else
                ariaSort =
                  this.sortOrder === 'asc' ? 'ascending' : 'descending';
            }

            return html`
              <div
                class=${this.cellClasses(entry, { sorted, sortable })}
                style=${this.cellStyle(entry)}
                role="columnheader"
                aria-sort=${ariaSort ?? nothing}
                data-cell
                data-row="0"
                data-col=${index}
                tabindex=${sortable ? nothing : this.tabIndexFor(0, index)}
              >
                ${sortable
                  ? html`
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
                  : html`<span class="header-label">${column.label}</span>`}
              </div>
            `;
          })}
        </div>
        ${this.loading && pageRows.length
          ? html`<wc-linear-progress
              class="loading-bar"
              indeterminate
              aria-label="Loading"
            ></wc-linear-progress>`
          : nothing}
      </div>
    `;
  }

  private renderBody(columns: GridColumn[], pageRows: TableRow[]) {
    const rowOffset = this.paginate ? (this.page - 1) * this.pageSize : 0;
    const selectable = this.selectionType === 'checkbox';

    const rows = pageRows.map((row, rowIndex) => {
      const gridRow = rowIndex + 1;
      const selected =
        selectable && this.selectedRowKeys.includes(this.getRowKey(row));

      return html`
        <div
          class=${classMap({ row: true, selected })}
          role="row"
          aria-rowindex=${rowOffset + rowIndex + 2}
          aria-selected=${selectable ? String(selected) : nothing}
          style="min-width: ${this.totalColumnsWidth}rem"
        >
          ${this.renderRowGroups(columns, (entry, index) => {
            const { column } = entry;
            if (!column) {
              return html`
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
            return html`
              <div
                class=${this.cellClasses(entry)}
                style=${this.cellStyle(entry)}
                role="gridcell"
                data-cell
                data-row=${gridRow}
                data-col=${index}
                tabindex=${this.tabIndexFor(gridRow, index)}
                @click=${(evt: MouseEvent) =>
                  this.onCellClick(row, column, evt)}
              >
                ${this.renderCellContent(row, column)}
              </div>
            `;
            /* eslint-enable lit-a11y/click-events-have-key-events */
          })}
        </div>
      `;
    });

    return html`<div class="body" role="rowgroup">${rows}</div>`;
  }

  private renderSkeletonBody(columns: GridColumn[]) {
    const count = this.paginate ? Math.min(this.pageSize, 10) : SKELETON_ROWS;
    return html`
      <div class="body" role="rowgroup">
        ${Array.from(
          { length: count },
          (_, rowIndex) => html`
            <div
              class="row skeleton-row"
              role="row"
              style="min-width: ${this.totalColumnsWidth}rem"
            >
              ${this.renderRowGroups(
                columns,
                (entry, index) => html`
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
                        : nothing}
                    ></wc-skeleton>
                  </div>
                `,
              )}
            </div>
          `,
        )}
      </div>
    `;
  }

  private renderEmptyState() {
    return html`
      <div class="empty-table">
        <wc-empty-state
          class="empty-state"
          headline=${this.emptyStateHeadline}
          description=${this.emptyStateDescription}
        ></wc-empty-state>
      </div>
    `;
  }

  private renderBulkBar(pageRows: TableRow[]) {
    if (this.selectionType !== 'checkbox') return nothing;
    const count = this.selectedRowKeys.length;
    if (count === 0) return nothing;

    const total = this.getTotalItems();
    const shownCount =
      this.allPagesSelected && total !== undefined ? total : count;
    const pageFullySelected =
      pageRows.length > 0 &&
      pageRows.every(row => this.selectedRowKeys.includes(this.getRowKey(row)));
    const canSelectAllPages =
      this.paginate &&
      !this.allPagesSelected &&
      pageFullySelected &&
      total !== undefined &&
      total > count;

    return html`
      <div class="bulk-bar" role="region" aria-label="Selection">
        <span class="bulk-count" aria-live="polite"
          >${shownCount} selected</span
        >
        ${canSelectAllPages
          ? html`<wc-button
              class="bulk-select-all"
              variant="text"
              size="sm"
              @click=${() => this.selectAllPages(pageRows)}
              >Select all ${total}</wc-button
            >`
          : nothing}
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

  private renderPagination() {
    if (!this.paginate) return nothing;

    return html`
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
    if (hasRows) body = this.renderBody(columns, pageRows);
    else if (this.loading) body = this.renderSkeletonBody(columns);
    else body = this.renderEmptyState();

    return html`
      <div
        class=${classMap({
          table: true,
          'scrolled-from-start': this.scrolledFromStart,
          'scrolled-from-end': this.scrolledFromEnd,
          'has-selection': this.selectedRowKeys.length > 0,
        })}
      >
        ${this.renderBulkBar(pageRows)}
        <div
          class="table-scroll-container"
          role="grid"
          aria-label=${this.label || nothing}
          aria-busy=${this.loading ? 'true' : nothing}
          aria-multiselectable=${this.selectionType === 'checkbox'
            ? 'true'
            : nothing}
          aria-rowcount=${this.paginate && total !== undefined
            ? total + 1
            : nothing}
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
}
