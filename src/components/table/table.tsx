import {
  Component,
  Element,
  Event,
  EventEmitter,
  h,
  Host,
  Prop,
  State,
} from '@stencil/core';
import { getNextLayer, throttle } from '../../utils/utils';

const DEFAULT_CELL_WIDTH = 16; // in rem
const SUPPORTED_PAGE_SIZES = [
  {
    value: 10,
    label: 10,
  },
  {
    value: 25,
    label: 25,
  },
  {
    value: 50,
    label: 50,
  },
  {
    value: 100,
    label: 100,
  },
];

/**
 * @name Table
 * @description A configurable component for displaying tabular data.
 * @category Data Display
 * @img /assets/img/table.webp
 * @imgDark /assets/img/table-dark.webp
 */
@Component({
  tag: 'goat-table',
  styleUrl: 'table.scss',
  shadow: true,
})
export class Table {
  @Element() elm!: HTMLElement;

  /**
   * Grid columns configuration.
   * [
   * {
   *   "name":"name",
   *   "label":"Name",
   *   "width":300,
   *   "fixed":true,
   *   "template": function(row, column) { return row[column.name];}
   *  },
   * {
   *   "name":"age",
   *   "label":"Age"
   * }
   * ]
   */
  @Prop() columns: any[] = [];

  /**
   * Grid data to display on table
   * [{
   *  'id': '5e7118ddce4b3d577956457f',
   *  'age': 21,
   *  'name': 'John',
   *  'company': 'India',
   *  'email': 'john@example.com',
   *  'phone': '+1 (839) 560-3581',
   *  'address': '326 Irving Street, Grimsley, Texas, 4048'
   *  }]
   */
  @Prop() data: any[] = [];

  @Prop() selectionType: 'checkbox' | undefined;

  @Prop({ mutable: true }) selectedRowKeys: string[] = [];

  @Prop() keyField: string = 'id';

  @Prop() managed: boolean = false;

  @Prop() sortable: boolean = true;

  @Prop({ mutable: true }) sortBy: string;

  @Prop({ mutable: true }) sortOrder: 'asc' | 'desc' = 'asc';

  @Prop() paginate: boolean = true;

  @Prop() page: number = 1;

  @Prop() pageSize: number = 10;

  @Prop({ reflect: true }) layer?: 'background' | '01' | '02';

  @Prop({ mutable: true }) totalItems;

  @Prop({ mutable: true }) emptyStateHeadline: string = 'No items';

  @Prop({ mutable: true }) emptyStateDescription: string =
    'There are no items to display';

  @State() private hoveredCell: any = {};
  @State() private isSelectAll: boolean = false;
  @State() private isSelectAllIntermediate: boolean = false;
  @State() private isHorizontallyScrolled: boolean = false;

  /**
   * Emitted when a table cell is clicked.
   */
  @Event({ eventName: 'goat-table--cell-click' }) goatCellClick: EventEmitter;

  /**
   * Emitted when the selection changes.
   */
  @Event({ eventName: 'goat-table--selection-change' })
  goatSelectChange: EventEmitter;

  /**
   * Emitted when the table is sorted.
   */
  @Event({ eventName: 'goat-table--sort' }) goatSort: EventEmitter;

  /**
   * Emitted when the page changes.
   */
  @Event({ eventName: 'goat-table--page' }) goatPage: EventEmitter;

  onSelectAllClick = () => {
    let selectedRowKeys = [];
    this.isSelectAll = !this.isSelectAll;
    if (this.isSelectAll)
      selectedRowKeys = this.data
        .map(row => row[this.keyField])
        .slice((this.page - 1) * this.pageSize, this.page * this.pageSize);
    this.onSelectChange(selectedRowKeys);
  };

  onRowSelectClick = row => {
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

  onCellMouseOver = throttle((row: any, column: any) => {
    this.hoveredCell = { row, column };
  }, 30);

  onSelectChange(selectedRowKeys: any) {
    this.selectedRowKeys = selectedRowKeys;
    this.goatSelectChange.emit({
      value: this.selectedRowKeys,
      isSelectAll: this.isSelectAll,
    });
  }

  onCellClick(row: any, col: any, evt: MouseEvent) {
    this.goatCellClick.emit({
      record: row,
      column: col,
      altKey: evt.altKey,
      ctrlKey: evt.ctrlKey,
      metaKey: evt.metaKey,
      shiftKey: evt.shiftKey,
    });
  }

  renderHeader() {
    const fixedCols = [];
    const scrollCols = [];

    if (this.selectionType === 'checkbox') {
      fixedCols.push(
        <div class="col col-checkbox center">
          <div class="col-content">
            <goat-checkbox
              class="checkbox"
              layer={'01'}
              value={this.isSelectAll}
              intermediate={this.isSelectAllIntermediate}
              onGoat-checkbox--change={this.onSelectAllClick}
            />
          </div>
        </div>,
      );
    }
    this.columns.forEach(col => {
      let colWidth = DEFAULT_CELL_WIDTH;
      if (col.width) colWidth = parseInt(col.width);
      const colEl = (
        <div
          class={{ col: true, sort: this.sortBy === col.name }}
          style={{ width: colWidth + 'rem' }}
        >
          <div class="col-content">
            <div class="col-text">{col.label}</div>
            <div class="col-actions">
              {(() => {
                if (!this.sortable) return;
                let icon = 'arrows--vertical';
                if (this.sortBy === col.name) {
                  if (this.sortOrder === 'asc') icon = 'arrow--up';
                  else icon = 'arrow--down';
                }
                return (
                  <pc-button
                    class="col-action"
                    color="secondary"
                    dark-mode-color="white"
                    variant="text"
                    onClick={() => {
                      if (this.sortBy === col.name) {
                        if (this.sortOrder === 'asc') this.sortOrder = 'desc';
                        else this.sortBy = null;
                      } else {
                        this.sortBy = col.name;
                        this.sortOrder = 'asc';
                      }
                      this.goatSort.emit({
                        sortBy: this.sortBy,
                        sortOrder: this.sortOrder,
                      });
                    }}
                  >
                    <pc-icon slot="icon" name={icon}></pc-icon>
                  </pc-button>
                );
              })()}
            </div>
          </div>
        </div>
      );
      col.fixed ? fixedCols.push(colEl) : scrollCols.push(colEl);
    });

    return (
      <div class="header">
        <div class="row">
          <div class="fixed-columns columns-container">{fixedCols}</div>
          <div class="scrollable-columns columns-container">{scrollCols}</div>
        </div>
      </div>
    );
  }

  renderBody() {
    const rows = [];

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

    data.forEach(row => {
      const fixedCols = [];
      const scrollCols = [];

      if (this.selectionType === 'checkbox')
        fixedCols.push(
          <div class={{ 'col': true, 'center': true, 'col-checkbox': true }}>
            <div class="col-content">
              <goat-checkbox
                class="checkbox"
                layer={getNextLayer(this.layer)}
                value={this.selectedRowKeys.includes(row[this.keyField])}
                onGoat-checkbox--change={() => this.onRowSelectClick(row)}
              />
            </div>
          </div>,
        );

      this.columns.forEach(column => {
        let colWidth = DEFAULT_CELL_WIDTH;
        if (column.width) colWidth = parseInt(column.width);
        const colEl = (
          <div
            tabindex="1"
            class={{
              'col': true,
              'col-hover':
                this.hoveredCell.row === row &&
                this.hoveredCell.column === column,
            }}
            style={{ width: colWidth + 'rem' }}
            onMouseOver={() => {
              //@ts-ignore
              this.onCellMouseOver(row, column);
            }}
            onKeyDown={event => {
              if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
                const elem: any = event.target;
                window.navigator.clipboard.writeText(elem.innerText);
              }
            }}
            onClick={(evt: MouseEvent) => {
              const selection = window.getSelection();
              if (selection.type != 'Range') this.onCellClick(row, column, evt);
            }}
          >
            <div class="col-content">
              {(() => {
                if (column.template)
                  return (
                    <div
                      class="col-template"
                      innerHTML={column.template(row, column)}
                    ></div>
                  );
                else
                  return (
                    <div class="col-text" title={row?.[column.name]}>
                      {row?.[column.name]}
                    </div>
                  );
              })()}
            </div>
          </div>
        );

        column.fixed ? fixedCols.push(colEl) : scrollCols.push(colEl);
      });
      rows.push(
        <div class={{ 'row': true, 'row-hover': this.hoveredCell.row === row }}>
          <div class="fixed-columns columns-container">{fixedCols}</div>
          <div class="scrollable-columns columns-container">{scrollCols}</div>
        </div>,
      );
    });

    return <div class="body">{rows}</div>;
  }

  getTotalItems() {
    let totalItems = this.totalItems;
    if (this.paginate && !this.managed) totalItems = this.data.length;
    return totalItems;
  }

  renderPagination() {
    if (this.paginate)
      return (
        <div class="pagination">
          <div class="page-sizes-select">
            <goat-select
              label="Items per page:"
              layer={getNextLayer(this.layer)}
              inline={true}
              class="select"
              items={SUPPORTED_PAGE_SIZES}
              placements="top-start"
              value={this.pageSize}
              onGoat-select--change={e => {
                this.pageSize = e.detail.value;
                this.goatPage.emit({
                  page: this.page,
                  pageSize: this.pageSize,
                });
              }}
            />
          </div>
          <div class="pagination-item-count">
            <span class={'text-body inline secondary'}>
              {this.pageSize * (this.page - 1)} -{' '}
              {this.pageSize * this.page < this.getTotalItems()
                ? this.pageSize * this.page
                : this.getTotalItems()}{' '}
              of {this.getTotalItems()} items
            </span>
          </div>
          <div class="pagination-right">
            <div class="table-footer-right-content">
              <div class="table-footer-right-content-pagination">
                <pc-button
                  class="arrows"
                  color="secondary"
                  dark-mode-color="light"
                  variant="text"
                  disabled={this.page === 1}
                  onClick={() => {
                    this.page = this.page - 1;
                    this.goatPage.emit({
                      page: this.page,
                      pageSize: this.pageSize,
                    });
                  }}
                >
                  <pc-icon slot="icon" name="arrow--left"></pc-icon>
                </pc-button>
                <pc-button
                  color="secondary"
                  dark-mode-color="light"
                  variant="text"
                  class="arrows"
                  disabled={this.pageSize * this.page >= this.getTotalItems()}
                  onClick={() => {
                    this.page = this.page + 1;
                    this.goatPage.emit({
                      page: this.page,
                      pageSize: this.pageSize,
                    });
                  }}
                >
                  <pc-icon slot="icon" name="arrow--right"></pc-icon>
                </pc-button>
              </div>
            </div>
          </div>
        </div>
      );
  }

  render() {
    return (
      <Host>
        <div
          class={{
            'table': true,
            'sortable': this.sortable,
            'paginate': this.paginate,
            'horizontal-scrolled': this.isHorizontallyScrolled,
          }}
        >
          <div
            class="table-scroll-container"
            onScroll={event => {
              // @ts-ignore
              this.isHorizontallyScrolled = !!event.target.scrollLeft;
            }}
          >
            {this.renderHeader()}
            {this.data.length ? this.renderBody() : this.renderEmptyState()}
          </div>
          <div class="table-footer">{this.renderPagination()}</div>
        </div>
      </Host>
    );
  }

  private renderEmptyState() {
    return (
      <div class="empty-table">
        <goat-empty-state
          class="empty-state content-center"
          headline={this.emptyStateHeadline}
          description={this.emptyStateDescription}
        />
      </div>
    );
  }
}
