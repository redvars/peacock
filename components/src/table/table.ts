import { html, LitElement, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { throttle } from '../utils.js';
import styles from './table.scss';

const DEFAULT_CELL_WIDTH = 16; // in rem

const SUPPORTED_PAGE_SIZES = [10, 25, 50, 100];

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
 * <wc-table></wc-table>
 * ```
 * @tags display, data
 */
export class Table extends LitElement {
  static styles = [styles];

  /**
   * Grid columns configuration.
   * Each column can have: name, label, width (px), fixed (boolean), template (function).
   */
  @property({ type: Array })
  columns: TableColumn[] = [];

  /**
   * Grid data to display on table.
   */
  @property({ type: Array })
  data: any[] = [];

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
   * If true, pagination is enabled. Defaults to `true`.
   */
  @property({ type: Boolean })
  paginate: boolean = true;

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
   * Total number of items (used in managed/controlled mode).
   */
  @property({ type: Number, attribute: 'total-items' })
  totalItems: number | undefined;

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

  @state()
  private hoveredCell: { row?: any; column?: any } = {};

  @state()
  private isSelectAll: boolean = false;

  @state()
  private isSelectAllIntermediate: boolean = false;

  @state()
  private isHorizontallyScrolled: boolean = false;

  private onCellMouseOverThrottled = throttle((row: any, column: any) => {
    this.hoveredCell = { row, column };
  }, 30);

  private onSelectAllClick = () => {
    this.isSelectAll = !this.isSelectAll;
    let selectedRowKeys: string[] = [];
    if (this.isSelectAll) {
      selectedRowKeys = this.data
        .slice((this.page - 1) * this.pageSize, this.page * this.pageSize)
        .map(row => row[this.keyField]);
    }
    this.onSelectChange(selectedRowKeys);
  };

  private onRowSelectClick = (row: any) => {
    let selectedRowKeys = [...this.selectedRowKeys];
    if (selectedRowKeys.includes(row[this.keyField])) {
      this.isSelectAll = false;
      selectedRowKeys = selectedRowKeys.filter(
        rowId => rowId !== row[this.keyField],
      );
    } else {
      selectedRowKeys.push(row[this.keyField]);
    }
    this.onSelectChange(selectedRowKeys);
  };

  private onSelectChange(selectedRowKeys: string[]) {
    this.selectedRowKeys = selectedRowKeys;
    this.dispatchEvent(
      new CustomEvent('selection-change', {
        detail: {
          value: this.selectedRowKeys,
          isSelectAll: this.isSelectAll,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private onCellClick(row: any, col: TableColumn, evt: MouseEvent) {
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
  }

  private onScrollContainer = (event: Event) => {
    const target = event.target as HTMLElement;
    this.isHorizontallyScrolled = !!target.scrollLeft;
  };

  private getTotalItems(): number {
    if (this.paginate && !this.managed) return this.data.length;
    return this.totalItems ?? 0;
  }

  private getSortIcon(col: TableColumn): string {
    if (this.sortBy === col.name) {
      return this.sortOrder === 'asc' ? 'arrow--up' : 'arrow--down';
    }
    return 'arrows--vertical';
  }

  private onSortClick(col: TableColumn) {
    if (this.sortBy === col.name) {
      if (this.sortOrder === 'asc') {
        this.sortOrder = 'desc';
      } else {
        this.sortBy = '';
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

  private renderHeader() {
    const fixedCols: any[] = [];
    const scrollCols: any[] = [];

    if (this.selectionType === 'checkbox') {
      fixedCols.push(html`
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
      const colEl = html`
        <div
          class=${classMap({ col: true, sort: this.sortBy === col.name })}
          style="width: ${colWidth}rem"
        >
          <div class="col-content">
            <div class="col-text">${col.label}</div>
            <div class="col-actions">
              ${this.sortable
                ? html`
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
                : nothing}
            </div>
          </div>
        </div>
      `;
      if (col.fixed) {
        fixedCols.push(colEl);
      } else {
        scrollCols.push(colEl);
      }
    });

    return html`
      <div class="header">
        <div class="row">
          <div class="fixed-columns columns-container">${fixedCols}</div>
          <div class="scrollable-columns columns-container">${scrollCols}</div>
        </div>
      </div>
    `;
  }

  private renderBody() {
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
        data = data.slice(
          (this.page - 1) * this.pageSize,
          this.page * this.pageSize,
        );
      }
    }

    const rows = data.map(row => {
      const fixedCols: any[] = [];
      const scrollCols: any[] = [];

      if (this.selectionType === 'checkbox') {
        fixedCols.push(html`
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
        const colEl = html`
          <div
            tabindex="0"
            class=${classMap({
              col: true,
              'col-hover':
                this.hoveredCell.row === row &&
                this.hoveredCell.column === column,
            })}
            style="width: ${colWidth}rem"
            @mouseover=${() => this.onCellMouseOverThrottled(row, column)}
            @focus=${() => this.onCellMouseOverThrottled(row, column)}
            @keydown=${(event: KeyboardEvent) => {
              if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
                const elem = event.target as HTMLElement;
                window.navigator.clipboard
                  .writeText(elem.innerText)
                  .catch(() => {});
              }
            }}
            @click=${(evt: MouseEvent) => {
              const selection = window.getSelection();
              if (selection?.type !== 'Range')
                this.onCellClick(row, column, evt);
            }}
          >
            <div class="col-content">
              ${column.template
                ? html`<div class="col-template">
                    ${unsafeHTML(column.template(row, column))}
                  </div>`
                : html`<div class="col-text" title=${row?.[column.name] ?? ''}>
                    ${row?.[column.name]}
                  </div>`}
            </div>
          </div>
        `;
        if (column.fixed) {
          fixedCols.push(colEl);
        } else {
          scrollCols.push(colEl);
        }
      });

      return html`
        <div
          class=${classMap({
            row: true,
            'row-hover': this.hoveredCell.row === row,
          })}
        >
          <div class="fixed-columns columns-container">${fixedCols}</div>
          <div class="scrollable-columns columns-container">${scrollCols}</div>
        </div>
      `;
    });

    return html`<div class="body">${rows}</div>`;
  }

  private renderEmptyState() {
    return html`
      <div class="empty-table">
        <wc-empty-state
          class="empty-state content-center"
          headline=${this.emptyStateHeadline}
          description=${this.emptyStateDescription}
        ></wc-empty-state>
      </div>
    `;
  }

  private renderPagination() {
    if (!this.paginate) return nothing;

    const totalItems = this.getTotalItems();
    const startItem = this.pageSize * (this.page - 1);
    const endItem = Math.min(this.pageSize * this.page, totalItems);
    const isFirstPage = this.page === 1;
    const isLastPage = this.pageSize * this.page >= totalItems;

    return html`
      <div class="pagination">
        <div class="page-sizes-select">
          <label class="page-size-label">
            Items per page:
            <select
              class="page-size-select"
              .value=${String(this.pageSize)}
              @change=${(e: Event) => {
                this.pageSize = parseInt(
                  (e.target as HTMLSelectElement).value,
                  10,
                );
                this.dispatchEvent(
                  new CustomEvent('page', {
                    detail: { page: this.page, pageSize: this.pageSize },
                    bubbles: true,
                    composed: true,
                  }),
                );
              }}
            >
              ${SUPPORTED_PAGE_SIZES.map(
                size => html`
                  <option value=${size} ?selected=${this.pageSize === size}>
                    ${size}
                  </option>
                `,
              )}
            </select>
          </label>
        </div>
        <div class="pagination-item-count">
          <span class="pagination-text">
            ${startItem} - ${endItem} of ${totalItems} items
          </span>
        </div>
        <div class="pagination-right">
          <div class="table-footer-right-content">
            <div class="table-footer-right-content-pagination">
              <wc-button
                class="arrows"
                color="secondary"
                variant="text"
                ?disabled=${isFirstPage}
                @click=${() => {
                  if (!isFirstPage) {
                    this.page -= 1;
                    this.dispatchEvent(
                      new CustomEvent('page', {
                        detail: { page: this.page, pageSize: this.pageSize },
                        bubbles: true,
                        composed: true,
                      }),
                    );
                  }
                }}
              >
                <wc-icon slot="icon" name="arrow--left"></wc-icon>
              </wc-button>
              <wc-button
                color="secondary"
                variant="text"
                class="arrows"
                ?disabled=${isLastPage}
                @click=${() => {
                  if (!isLastPage) {
                    this.page += 1;
                    this.dispatchEvent(
                      new CustomEvent('page', {
                        detail: { page: this.page, pageSize: this.pageSize },
                        bubbles: true,
                        composed: true,
                      }),
                    );
                  }
                }}
              >
                <wc-icon slot="icon" name="arrow--right"></wc-icon>
              </wc-button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  render() {
    const tableClasses = {
      table: true,
      sortable: this.sortable,
      paginate: this.paginate,
      'horizontal-scrolled': this.isHorizontallyScrolled,
    };

    return html`
      <div class=${classMap(tableClasses)}>
        <div class="table-scroll-container" @scroll=${this.onScrollContainer}>
          ${this.renderHeader()}
          ${this.data.length ? this.renderBody() : this.renderEmptyState()}
        </div>
        <div class="table-footer">${this.renderPagination()}</div>
      </div>
    `;
  }
}
