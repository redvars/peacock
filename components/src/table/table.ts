/*
 * wc-table is one element split over focused modules in this folder:
 *
 *   table-types.ts      TableColumn, TableRow, TableSort, GridColumn, event details
 *   table-sort.ts       comparing values, multi-level sorting, the next sort after a click
 *   table-selection.ts  row keys (always strings) and selection set helpers
 *   table-columns.ts    widths (width, minWidth, maxWidth, flex), pinning, hidden columns,
 *                       reorder and resize maths, column groups
 *   table-keyboard.ts   the grid keyboard model (navigation rows: 0 = column headers, 1.. = body)
 *   table-render.ts     stateless render helpers: cell classes and sizing, pinned groups, content
 *   table-rows.ts       grouping, the display items of a page (group headers, data rows, detail
 *                       rows) with their aria-rowindex, and the virtual scroll window
 *   table-edit.ts       inline editors (Peacock fields) and reading their value
 *   table-aggregate.ts  footer aggregates
 *   table-export.ts     CSV export
 *
 * The row pipeline:
 *
 *   getView()           Memoised: data, sorted (client mode), grouped by `group-by`; the page's
 *                       rows; and the display items of the page. Every item has an
 *                       `aria-rowindex` counted over all pages. Group headers and data rows are
 *                       navigation rows (`navRow`, `navItems[navRow - 1]`); detail rows are not
 *                       and carry no `data-cell`.
 *   renderBodyRows()    Renders the page's items, windowed when `virtual` is on.
 *   renderRow()         One data row; renderGroupHeaderRow() and renderDetailRow() the others.
 *   renderBodyCell()    One cell of a data row: its content, or the editor while it is edited.
 *   renderHeaderCell()  One column header.
 *   renderAggregateRow() The footer row of aggregates, after the body; renderFooter() below it.
 *   headerRowCount      Rows above the data in aria-rowindex terms (column groups add one).
 */
import { html, LitElement, nothing } from 'lit';
import type { PropertyValues, TemplateResult } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { repeat } from 'lit/directives/repeat.js';

import styles from './table.scss';
import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import type { PeacockStrings } from '@/__internal/i18n/strings.js';
import type { Pagination } from '../pagination/pagination.js';
import {
  buildGridColumns,
  buildHeaderGroups,
  clampResizeWidth,
  emptyColumnState,
  isColumnHidden,
  MIN_RESIZE_WIDTH,
  moveColumnBy,
  moveColumnTo,
  orderColumns,
  reconcileColumnState,
  RESIZE_STEP,
  totalWidth,
} from './table-columns.js';
import {
  clampGridPosition,
  horizontalDirection,
  nextGridPosition,
} from './table-keyboard.js';
import type { GridPosition } from './table-keyboard.js';
import {
  cellClasses,
  cellStyle,
  renderCellContent,
  renderHeaderLabel,
  renderRowGroups,
} from './table-render.js';
import {
  getRowKey,
  normalizeKeys,
  toggleKey,
  togglePageKeys,
} from './table-selection.js';
import { nextSorts, normalizeSorts, sortRows } from './table-sort.js';
import { aggregateValue } from './table-aggregate.js';
import {
  commitsOnChange,
  editorKind,
  readEditorValue,
  renderEditor,
} from './table-edit.js';
import type { EditorElement } from './table-edit.js';
import { toCsv } from './table-export.js';
import { buildDisplayItems, groupRows, virtualWindow } from './table-rows.js';
import type { TableDisplayItem, TableGroup } from './table-rows.js';
import { writeClipboardText } from '@/__internal/utils/clipboard.js';
import type {
  ColumnState,
  GridColumn,
  HeaderGroupCell,
  TableCellEditDetail,
  TableColumn,
  TableExportOptions,
  TableRow,
  TableSelection,
  TableSort,
  TableSortOrder,
} from './table-types.js';

export type {
  TableAggregate,
  TableColumn,
  TableEditor,
  TableEditorOption,
  TableExportOptions,
  TableRow,
  TableSelection,
  TableSort,
  TableSortOrder,
} from './table-types.js';
export type {
  TableCellEditDetail,
  TableColumnReorderDetail,
  TableColumnResizeDetail,
  TableColumnVisibilityDetail,
  TableGroupToggleDetail,
  TablePageDetail,
  TableRowExpandDetail,
  TableSelectionChangeDetail,
  TableSortDetail,
} from './table-types.js';

const SKELETON_ROWS = 5;
/** Pointer travel in pixels before a header press becomes a drag. */
const DRAG_THRESHOLD = 4;
/** Rows a virtual body renders beyond each edge of the viewport. */
const VIRTUAL_OVERSCAN = 6;
/** Row height in pixels a virtual body assumes before it can measure one. */
const FALLBACK_ROW_HEIGHT = 48;
/** Rows a virtual body renders before it can measure the viewport. */
const FALLBACK_VIRTUAL_ROWS = 20;
/** States that never change the rows, so they keep the memoised view. */
const VIEW_STABLE_STATES = new Set<PropertyKey>([
  'activeCell',
  'allPagesSelected',
  'announcement',
  'columnMenuOpen',
  'dragColumn',
  'dropTarget',
  'editingCell',
  'hasFooterContent',
  'scrolledFromEnd',
  'scrolledFromStart',
  'virtualScrollTop',
]);

let tableCount = 0;

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

/** The rows of the table, worked out once per change of the inputs. */
interface TableView {
  /** Every row, sorted and grouped, across pages. */
  rows: TableRow[];
  /** The rows on the current page. */
  pageRows: TableRow[];
  /** The page's body rows: group headers, data rows and detail rows. */
  items: TableDisplayItem[];
  /** The page's navigation rows (group headers and data rows): `navItems[navRow - 1]`. */
  navItems: TableDisplayItem[];
  /** Body rows across every page, for `aria-rowcount`. */
  itemCount: number;
  /** Keys of the expanded rows. */
  expanded: Set<string>;
  /** Keys of the collapsed groups. */
  collapsed: Set<string>;
}

/** The cell being edited. */
interface EditingCell {
  key: string;
  column: string;
}

interface ResizeSession {
  name: string;
  startX: number;
  startWidth: number;
  width: number;
  rtl: boolean;
}

interface DragSession {
  name: string;
  startX: number;
  active: boolean;
}

function remSize(): number {
  return (
    Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
  );
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
@IndividualComponent
export class Table extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /**
   * Grid columns configuration. Each column can have: name, label, width, minWidth, maxWidth
   * and flex (rem and grow factor), fixed, align, type, sortable, wrap, hidden, hideable,
   * resizable, reorderable, group, headerTemplate, template; editable, editor, options,
   * required, min, max, step and validate for inline editing; exportValue; aggregate.
   */
  @property({ type: Array })
  columns: TableColumn[] = [];

  /**
   * Grid data to display on table.
   */
  @property({ type: Array })
  data: TableRow[] = [];

  /**
   * How rows are selected: `none` (default), `single` (one row, with radio buttons) or
   * `multiple` (checkboxes, a select-all checkbox and the selection bar).
   */
  @property({ type: String })
  selection: TableSelection = 'none';

  /**
   * Keys of the selected rows. Keys are compared as strings, so a numeric `id` of `1` matches
   * `"1"`.
   */
  @property({ type: Array, attribute: 'selected-row-keys' })
  selectedRowKeys: string[] = [];

  /**
   * Decides whether a row can be selected. Rows it returns `false` for show a disabled control
   * and are skipped by select-all.
   */
  @property({ attribute: false })
  isRowSelectable?: (row: TableRow) => boolean;

  /**
   * The field name used as the unique key for each row. Defaults to `"id"`.
   */
  @property({ type: String, attribute: 'key-field' })
  keyField: string = 'id';

  /**
   * If true, sorting and pagination are managed externally (controlled mode): the table shows
   * `data` as given and only reports `sort` and page changes.
   */
  @property({ type: Boolean })
  managed: boolean = false;

  /**
   * If true, columns are sortable. Defaults to `true`.
   */
  @property({ type: Boolean })
  sortable: boolean = true;

  /**
   * The field name currently used for sorting (the primary sort).
   */
  @property({ type: String, attribute: 'sort-by' })
  sortBy: string = '';

  /**
   * The current sort order. Possible values are `"asc"` and `"desc"`. Defaults to `"asc"`.
   */
  @property({ type: String, attribute: 'sort-order' })
  sortOrder: TableSortOrder = 'asc';

  /**
   * Every sort level, primary first, as `{ name, order }`. Shift+click on a header adds a level.
   * Kept in step with `sort-by` and `sort-order`, which describe the first level.
   */
  @property({ type: Array })
  sorts: TableSort[] = [];

  /**
   * Lets the user resize columns by dragging the header edges or with the arrow keys on the
   * focused handle. A column's own `resizable` overrides it.
   */
  @property({ type: Boolean })
  resizable: boolean = false;

  /**
   * Lets the user move columns by dragging a header or with Alt+Left/Right. Pinned columns move
   * only among the columns pinned to the same edge. A column's own `reorderable` overrides it.
   */
  @property({ type: Boolean })
  reorderable: boolean = false;

  /**
   * Adds a column menu button at the end of the header that shows or hides columns.
   */
  @property({ type: Boolean, attribute: 'column-menu' })
  columnMenu: boolean = false;

  /**
   * The current page number (1-based). Defaults to `1`. Follows a slotted `wc-pagination`.
   */
  @property({ type: Number })
  page: number = 1;

  /**
   * The number of rows per page. Defaults to `10`. Follows a slotted `wc-pagination`.
   */
  @property({ type: Number, attribute: 'page-size' })
  pageSize: number = 10;

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
   * Shows an error in place of the rows, for example when loading failed. Announced politely.
   */
  @property({ type: Boolean, reflect: true })
  error: boolean = false;

  /**
   * Text of the error state. Defaults to Peacock's `tableErrorDescription` string.
   */
  @property({ type: String, attribute: 'error-text' })
  errorText: string = '';

  /**
   * Accessible name of the table.
   */
  @property({ type: String })
  label: string = '';

  /**
   * Headline text shown when the table has no data. Defaults to Peacock's `noItems` string
   * (`"No items"`).
   */
  @property({ type: String, attribute: 'empty-state-headline' })
  emptyStateHeadline: string = '';

  /**
   * Description text shown when the table has no data. Defaults to Peacock's
   * `noItemsDescription` string (`"There are no items to display"`).
   */
  @property({ type: String, attribute: 'empty-state-description' })
  emptyStateDescription: string = '';

  /**
   * Content of the detail row under an expanded row. Setting it adds a leading column of
   * expander buttons. A string is shown as text. Turns `virtual` off: detail rows vary in height.
   */
  @property({ attribute: false })
  detailTemplate?: (row: TableRow) => string | TemplateResult;

  /** Keys of the rows whose details are shown. Keys are compared as strings. */
  @property({ type: Array, attribute: 'expanded-row-keys' })
  expandedRowKeys: string[] = [];

  /**
   * Groups the rows by this field under collapsible header rows. Groups are ordered by value
   * (descending when the table is sorted descending by this field); sorting applies within
   * groups. In managed mode, groups keep the order the rows come in.
   */
  @property({ type: String, attribute: 'group-by' })
  groupBy: string = '';

  /** Keys of the collapsed groups: their `group-by` values as strings (`""` for empty values). */
  @property({ type: Array, attribute: 'collapsed-groups' })
  collapsedGroups: string[] = [];

  /** Custom content of a group header's label. Defaults to the group's value. */
  @property({ attribute: false })
  groupTemplate?: (group: string, rows: TableRow[]) => string | TemplateResult;

  /**
   * Renders only the rows in view (plus a few on each side), for large `data` without
   * pagination. Every row must have the same height, `--table-row-height`; cells do not wrap.
   * Give the table a height. Has no effect with `detailTemplate`.
   */
  @property({ type: Boolean })
  virtual: boolean = false;

  /** Rows the footer aggregates cover: `all` rows (default) or the current `page`. */
  @property({ type: String, attribute: 'aggregate-scope' })
  aggregateScope: 'all' | 'page' = 'all';

  /** Overrides Peacock's strings for this instance only. */
  @property({ attribute: false }) strings?: Partial<PeacockStrings>;

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

  /** The cell that holds the grid's single tab stop. Row 0 is the column header row. */
  @state()
  private activeCell: GridPosition = { row: 0, col: 0 };

  /** Column widths, visibility and order changed in the table. */
  @state()
  private columnState: ColumnState = emptyColumnState();

  /** The `wc-pagination` in the footer slot, if any. */
  @state()
  private slottedPagination: Pagination | null = null;

  /** True when the footer slot has content. */
  @state()
  private hasFooterContent: boolean = false;

  /** The column being dragged to a new place. */
  @state()
  private dragColumn: string = '';

  /** The column a dragged column would be dropped on. */
  @state()
  private dropTarget: string = '';

  /** True while the column menu is open. */
  @state()
  private columnMenuOpen: boolean = false;

  /** Text for screen readers, for example after a column moved. */
  @state()
  private announcement: string = '';

  /** The cell whose editor is open. */
  @state()
  private editingCell?: EditingCell;

  /** Scroll offset of the virtual body, in pixels. */
  @state()
  private virtualScrollTop: number = 0;

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('.table-scroll-container')
  private scrollContainer?: HTMLElement;

  @query('.column-menu')
  private columnMenuElement?: HTMLElement & {
    anchorElement: HTMLElement | null;
    toggle(): void;
  };

  // ── Private fields ───────────────────────────────────────────────────────

  /** Set when a keyboard move must focus the active cell after the next render. */
  private pendingFocus: boolean = false;

  /** Watches the scroll container so the edge shadows follow resizes. */
  private resizeObserver?: ResizeObserver;

  /** Peacock's strings and the locale counts are formatted in. */
  private readonly i18n = new I18nController(this);

  /** The selected keys, for quick lookups while rendering. */
  private selectedKeys: Set<string> = new Set();

  /** The column resize in progress with the pointer. */
  private resizeSession?: ResizeSession;

  /** The header press that may become a column drag. */
  private dragSession?: DragSession;

  /** Swallows the click that ends a drag, so it does not also sort. */
  private suppressClick: boolean = false;

  /** Prefix of the ids in the shadow root (detail rows). */
  private readonly idPrefix = `wc-table-${(tableCount += 1)}`;

  /** The memoised rows, with the inputs they were worked out from. */
  private viewCache?: { deps: unknown[]; view: TableView };

  /** Set when the open editor must take focus after the next render. */
  private pendingEditorFocus: boolean = false;

  /** Set while an edit updates `data`, which must not reset the selection. */
  private applyingEdit: boolean = false;

  /** Measured height of a virtual row, in pixels. */
  private virtualRowHeight: number = 0;

  /** Measured height a virtual body shows rows in, in pixels. */
  private virtualViewport: number = 0;

  /** The row holding the tab stop when the active row is outside the virtual window. */
  private tabRowOverride?: number;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  disconnectedCallback() {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
    this.endPointerSession();
  }

  firstUpdated() {
    if (typeof ResizeObserver !== 'undefined' && this.scrollContainer) {
      this.resizeObserver = new ResizeObserver(() => {
        this.updateScrollEdges();
        this.measureVirtual();
      });
      this.resizeObserver.observe(this.scrollContainer);
    }
    this.updateScrollEdges();
  }

  protected override willUpdate(changed: PropertyValues<Table>): void {
    if (changed.has('selectedRowKeys')) {
      const keys = normalizeKeys(this.selectedRowKeys);
      if (keys !== this.selectedRowKeys) this.selectedRowKeys = keys;
      this.selectedKeys = new Set(keys);
    }
    if (changed.has('expandedRowKeys')) {
      const keys = normalizeKeys(this.expandedRowKeys);
      if (keys !== this.expandedRowKeys) this.expandedRowKeys = keys;
    }
    if (changed.has('collapsedGroups')) {
      const keys = normalizeKeys(this.collapsedGroups);
      if (keys !== this.collapsedGroups) this.collapsedGroups = keys;
    }

    // Rows may have changed in place (for example `data.push()` and requestUpdate()): only
    // internal states that never change them keep the memoised view.
    if (
      changed.size === 0 ||
      [...changed.keys()].some(name => !VIEW_STABLE_STATES.has(name))
    ) {
      this.viewCache = undefined;
    }

    if (changed.has('columns') && this.hasUpdated) {
      this.columnState = reconcileColumnState(
        this.columnState,
        changed.get('columns'),
        this.columns ?? [],
      );
    }

    this.syncSorts(changed);

    if (!Number.isFinite(this.page) || this.page < 1) {
      this.page = 1;
    }

    // Filtering the data can leave the current page past the end.
    // An empty data set (for example before the first load) keeps the requested page.
    if (
      this.isPaging &&
      !this.managed &&
      (changed.has('data') || changed.has('pageSize')) &&
      this.data?.length
    ) {
      const lastPage = Math.max(
        1,
        Math.ceil((this.data?.length ?? 0) / this.pageSize),
      );
      if (this.page > lastPage) this.page = lastPage;
    }

    if (changed.has('data') && !this.managed && !this.applyingEdit) {
      this.allPagesSelected = false;
    }
    this.applyingEdit = false;

    // An edit ends when its row or column goes away.
    const editing = this.editingCell;
    if (
      editing &&
      (!this.findRecord(editing.key) ||
        !(this.columns ?? []).some(column => column.name === editing.column))
    ) {
      this.editingCell = undefined;
    }

    const next = clampGridPosition(this.activeCell, {
      lastRow: this.getView().navItems.length,
      lastCol: this.getGridColumns().length - 1,
    });
    if (next.row !== this.activeCell.row || next.col !== this.activeCell.col) {
      this.activeCell = next;
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
    if (this.pendingEditorFocus) {
      this.pendingEditorFocus = false;
      this.focusEditor();
    }
    if (this.isVirtual) {
      // Measure after this update has finished, so a new size schedules a fresh one.
      queueMicrotask(() => this.measureVirtual());
    }
    // In client mode the table drives the slotted pagination.
    const pagination = this.slottedPagination;
    if (pagination && !this.managed) {
      pagination.totalItems = this.data?.length ?? 0;
      pagination.page = this.page;
      pagination.pageSize = this.pageSize;
    }
  }

  // ── Public methods ───────────────────────────────────────────────────────

  /**
   * The rows as CSV text (RFC 4180): a header row of column labels, then one line per row, in
   * the current sort and grouping. By default the visible columns in display order and the
   * rows on the current page; `allRows` exports every row, `columns` picks columns by name
   * (hidden ones too). Cells hold `exportValue(row)` when the column has it, else the field.
   */
  exportCsv(options: TableExportOptions = {}): string {
    const view = this.getView();
    const rows = options.allRows ? view.rows : view.pageRows;
    const all = this.columns ?? [];
    const columns = options.columns
      ? options.columns.flatMap(name => {
          const column = all.find(entry => entry.name === name);
          return column ? [column] : [];
        })
      : this.getGridColumns().flatMap(entry =>
          entry.column ? [entry.column] : [],
        );
    return toCsv(columns, rows);
  }

  /** Downloads `exportCsv(options)` as a file named `options.filename` (default `table.csv`). */
  downloadCsv(options: TableExportOptions = {}): void {
    // The byte order mark makes spreadsheet apps read the file as UTF-8.
    const blob = new Blob(['﻿', this.exportCsv(options)], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = options.filename || 'table.csv';
    link.hidden = true;
    this.renderRoot.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url));
  }

  // ── Private methods ──────────────────────────────────────────────────────

  /** The selection mode in effect: unknown values select nothing. */
  private get selectionMode(): TableSelection {
    return this.selection === 'single' || this.selection === 'multiple'
      ? this.selection
      : 'none';
  }

  /** True when rows are split into pages. */
  private get isPaging(): boolean {
    return !!this.slottedPagination;
  }

  /** Rows above the data rows: the column header row, plus the column group row. */
  private get headerRowCount(): number {
    return this.getHeaderGroups() ? 2 : 1;
  }

  /** True when the body renders only the rows in view. */
  private get isVirtual(): boolean {
    return this.virtual && !this.detailTemplate;
  }

  /** Keeps `sorts` and `sort-by`/`sort-order` describing the same primary sort. */
  private syncSorts(changed: PropertyValues<Table>) {
    if (
      changed.has('sorts') &&
      (this.hasUpdated || (this.sorts?.length ?? 0) > 0)
    ) {
      const sorts = normalizeSorts(this.sorts);
      if (sorts.length !== this.sorts?.length) this.sorts = sorts;
      this.sortBy = sorts[0]?.name ?? '';
      this.sortOrder = sorts[0]?.order ?? 'asc';
      return;
    }
    if (changed.has('sortBy') || changed.has('sortOrder')) {
      const primary = this.sorts?.[0];
      if (primary?.name === this.sortBy && primary.order === this.sortOrder) {
        return;
      }
      // A new primary sort set through sort-by replaces every level.
      this.sorts = this.sortBy
        ? [{ name: this.sortBy, order: this.sortOrder }]
        : [];
    }
  }

  private getGridColumns(): GridColumn[] {
    return buildGridColumns(this.columns ?? [], this.columnState, {
      select: this.selectionMode !== 'none',
      menu: this.columnMenu,
      expand: !!this.detailTemplate,
    });
  }

  private getHeaderGroups(columns = this.getGridColumns()) {
    return buildHeaderGroups(columns);
  }

  private isColumnSortable(column: TableColumn): boolean {
    return this.sortable && column.sortable !== false;
  }

  private isColumnResizable(column: TableColumn): boolean {
    return column.resizable ?? this.resizable;
  }

  private isColumnReorderable(column: TableColumn): boolean {
    return column.reorderable ?? this.reorderable;
  }

  private isRowSelectableNow(row: TableRow): boolean {
    return this.isRowSelectable ? this.isRowSelectable(row) !== false : true;
  }

  private isRtl(): boolean {
    return getComputedStyle(this).direction === 'rtl';
  }

  /** Total item count across pages, or `undefined` when it is unknown. */
  private getTotalItems(): number | undefined {
    if (!this.managed) return this.data?.length ?? 0;
    return this.slottedPagination?.totalItems ?? undefined;
  }

  /** The rows, memoised while the inputs they come from stay the same. */
  private getView(): TableView {
    const deps: unknown[] = [
      this.data,
      this.managed,
      this.sortable,
      this.sorts,
      this.groupBy,
      this.collapsedGroups,
      this.expandedRowKeys,
      !!this.detailTemplate,
      this.page,
      this.pageSize,
      this.isPaging,
      this.keyField,
      this.headerRowCount,
    ];
    const cached = this.viewCache;
    if (cached && cached.deps.every((dep, index) => dep === deps[index])) {
      return cached.view;
    }
    const view = this.computeView();
    this.viewCache = { deps, view };
    return view;
  }

  /**
   * The row pipeline: the data, sorted unless the table is managed, then grouped; the rows on
   * the page; and the page's display items.
   */
  private computeView(): TableView {
    let rows = [...(this.data ?? [])];
    if (!this.managed && this.sortable && this.sorts?.length) {
      rows = sortRows(rows, this.sorts);
    }
    let groups: TableGroup[] | undefined;
    if (this.groupBy) {
      const level = this.sortable
        ? this.sorts?.find(sort => sort.name === this.groupBy)
        : undefined;
      groups = groupRows(
        rows,
        this.groupBy,
        this.managed ? 'appearance' : (level?.order ?? 'asc'),
      );
      rows = groups.flatMap(group => group.rows);
    }

    const paged = !this.managed && this.isPaging;
    const start = paged ? (this.page - 1) * this.pageSize : 0;
    const end = paged ? this.page * this.pageSize : rows.length;
    const expanded = new Set(
      this.detailTemplate ? normalizeKeys(this.expandedRowKeys) : [],
    );
    const collapsed = new Set(
      this.groupBy ? normalizeKeys(this.collapsedGroups) : [],
    );
    // In managed mode `data` is one page: count on from the rows of earlier pages.
    const offset =
      this.managed && this.isPaging ? (this.page - 1) * this.pageSize : 0;
    const { items, count } = buildDisplayItems(rows, {
      keyField: this.keyField,
      groups,
      collapsed,
      expanded: this.detailTemplate ? expanded : undefined,
      firstAriaRowIndex: offset + this.headerRowCount + 1,
      start,
      end,
    });
    return {
      rows,
      pageRows: rows.slice(start, end),
      items,
      navItems: items.filter(item => item.kind !== 'detail'),
      itemCount: count,
      expanded,
      collapsed,
    };
  }

  /** Rows shown on the current page. */
  private getPageRows(): TableRow[] {
    return this.getView().pageRows;
  }

  /** The group header or data row at navigation row `row` (1 for the first body row). */
  private getNavItem(row: number): TableDisplayItem | undefined {
    return row > 0 ? this.getView().navItems[row - 1] : undefined;
  }

  /** True when a visible column has a footer aggregate. */
  private hasAggregates(): boolean {
    return this.getGridColumns().some(entry => !!entry.column?.aggregate);
  }

  /** `aria-rowcount`: header rows plus every body and footer row, or -1 when it is unknown. */
  private getAriaRowCount(hasRows: boolean): number {
    const headerRows = this.headerRowCount;
    if (!hasRows) return headerRows + (this.loading && !this.error ? 0 : 1);
    const footerRows = this.hasAggregates() ? 1 : 0;
    if (!this.managed || !this.isPaging) {
      return headerRows + this.getView().itemCount + footerRows;
    }
    const total = this.getTotalItems();
    return total === undefined ? -1 : headerRows + total + footerRows;
  }

  private findRecord(key: string): TableRow | undefined {
    return (this.data ?? []).find(row => getRowKey(row, this.keyField) === key);
  }

  private detailId(key: string): string {
    return `${this.idPrefix}-detail-${encodeURIComponent(key)}`;
  }

  private dispatch<T>(name: string, detail: T) {
    this.dispatchEvent(
      new CustomEvent<T>(name, { detail, bubbles: true, composed: true }),
    );
  }

  // Sorting

  private onSortActivate(column: TableColumn, additive: boolean) {
    if (this.suppressClick) return;
    const sorts = nextSorts(this.sorts ?? [], column.name, additive);
    this.sorts = sorts;
    this.sortBy = sorts[0]?.name ?? '';
    this.sortOrder = sorts[0]?.order ?? 'asc';
    this.dispatch('sort', {
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
      sorts: sorts.map(sort => ({ ...sort })),
    });
  }

  // Selection

  private selectableKeys(rows: TableRow[]): string[] {
    return rows
      .filter(row => this.isRowSelectableNow(row))
      .map(row => getRowKey(row, this.keyField));
  }

  private onSelectAllClick(pageRows: TableRow[]) {
    const next = togglePageKeys(
      this.selectedRowKeys,
      this.selectableKeys(pageRows),
    );
    this.allPagesSelected = false;
    this.onSelectChange(next, pageRows);
  }

  private onRowSelect(row: TableRow, pageRows: TableRow[]) {
    if (!row || !this.isRowSelectableNow(row)) return;
    const key = getRowKey(row, this.keyField);
    let next: string[];
    if (this.selectionMode === 'single') {
      if (this.selectedKeys.has(key) && this.selectedRowKeys.length === 1) {
        return;
      }
      next = [key];
    } else {
      next = toggleKey(this.selectedRowKeys, key);
    }
    this.allPagesSelected = false;
    this.onSelectChange(next, pageRows);
  }

  private selectAllPages(pageRows: TableRow[]) {
    // Without the full data set (managed mode), the flag tells the owner to act on every item.
    const keys = [
      ...new Set([
        ...this.selectedRowKeys,
        ...this.selectableKeys(this.managed ? pageRows : (this.data ?? [])),
      ]),
    ];
    this.allPagesSelected = true;
    this.onSelectChange(keys, pageRows);
  }

  private clearSelection() {
    this.allPagesSelected = false;
    this.onSelectChange([], this.getPageRows());
  }

  private onSelectChange(selectedRowKeys: string[], pageRows: TableRow[]) {
    this.selectedRowKeys = selectedRowKeys;
    this.selectedKeys = new Set(selectedRowKeys);
    const pageKeys = this.selectableKeys(pageRows);
    const isSelectAll =
      pageKeys.length > 0 && pageKeys.every(key => this.selectedKeys.has(key));
    this.dispatch('selection-change', {
      value: this.selectedRowKeys,
      isSelectAll,
      allPages: this.allPagesSelected,
    });
  }

  // Row details and groups

  private toggleRow(key: string) {
    const expanded = !this.getView().expanded.has(key);
    const keys = normalizeKeys(this.expandedRowKeys);
    this.expandedRowKeys = expanded
      ? [...keys, key]
      : keys.filter(entry => entry !== key);
    this.dispatch('row-expand', { key, expanded });
  }

  private toggleGroup(group: string) {
    const expanded = this.getView().collapsed.has(group);
    const keys = normalizeKeys(this.collapsedGroups);
    this.collapsedGroups = expanded
      ? keys.filter(entry => entry !== group)
      : [...keys, group];
    this.dispatch('group-toggle', { group, expanded });
  }

  // Inline editing

  private isCellEditable(column: TableColumn | undefined): boolean {
    return !!column?.editable;
  }

  private isEditing(key: string, column: TableColumn | undefined): boolean {
    const editing = this.editingCell;
    return (
      !!editing &&
      !!column &&
      editing.key === key &&
      editing.column === column.name
    );
  }

  private startEdit(
    key: string,
    column: TableColumn,
    row: number,
    col: number,
  ) {
    if (!this.isCellEditable(column)) return;
    this.editingCell = { key, column: column.name };
    this.activeCell = { row, col };
    this.pendingEditorFocus = true;
  }

  private getEditor(): EditorElement | null {
    return this.renderRoot.querySelector<EditorElement>('.cell-editor .editor');
  }

  private async focusEditor() {
    const editor = this.getEditor();
    if (!editor) return;
    await editor.updateComplete;
    editor.focus();
  }

  /** Ends the edit; with `restoreFocus`, focus goes back to the cell. */
  private endEdit(restoreFocus: boolean) {
    this.editingCell = undefined;
    if (restoreFocus) this.pendingFocus = true;
  }

  private cancelEdit(restoreFocus: boolean) {
    if (!this.editingCell) return;
    this.endEdit(restoreFocus);
  }

  /**
   * Commits the open editor. An invalid value keeps the editor open with its message. A new
   * value fires `cell-edit`; unless that is cancelled or the table is managed, the row in
   * `data` is replaced by a copy with the new value.
   */
  private commitEdit(restoreFocus: boolean) {
    const editing = this.editingCell;
    if (!editing) return;
    const editor = this.getEditor();
    const record = this.findRecord(editing.key);
    const column = (this.columns ?? []).find(
      entry => entry.name === editing.column,
    );
    if (!editor || !record || !column) {
      this.endEdit(restoreFocus);
      return;
    }

    const kind = editorKind(column);
    const value = readEditorValue(editor, kind);
    editor.setCustomValidity?.(column.validate?.(value, record) || '');
    if (editor.checkValidity && !editor.checkValidity()) {
      editor.reportValidity?.();
      return;
    }

    const oldValue = record[column.name];
    this.endEdit(restoreFocus);
    if (Object.is(value, oldValue)) return;

    const detail: TableCellEditDetail = {
      key: editing.key,
      column: column.name,
      value,
      oldValue,
      record,
    };
    const applied = this.dispatchEvent(
      new CustomEvent<TableCellEditDetail>('cell-edit', {
        detail,
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
    if (!applied || this.managed) return;
    this.applyingEdit = true;
    this.data = (this.data ?? []).map(row =>
      row === record ? { ...row, [column.name]: value } : row,
    );
  }

  private onEditorKeydown(event: KeyboardEvent) {
    // A field that used the key itself (an open select list or date picker) has the say.
    if (event.defaultPrevented) return;
    if (event.key === 'Enter') {
      event.preventDefault();
      this.commitEdit(true);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelEdit(true);
    }
  }

  private onEditorChange(event: Event, column: TableColumn) {
    // The editor's events are the table's business, not the consumer's.
    event.stopPropagation();
    if (event.type !== 'change' || !commitsOnChange(editorKind(column))) return;
    const editor = this.getEditor();
    const active = (this.renderRoot as ShadowRoot).activeElement;
    this.commitEdit(!!editor && active === editor);
  }

  private onEditorFocusOut() {
    const editing = this.editingCell;
    // Wait for focus to land: a field moves it inside itself, for example into its popup.
    setTimeout(() => {
      if (this.editingCell !== editing) return;
      const editor = this.getEditor();
      const active = (this.renderRoot as ShadowRoot).activeElement;
      if (editor && active && editor.contains(active)) return;
      this.commitEdit(false);
    });
  }

  // Cells

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
    this.dispatch('cell-click', {
      record: row,
      column: col,
      altKey: evt.altKey,
      ctrlKey: evt.ctrlKey,
      metaKey: evt.metaKey,
      shiftKey: evt.shiftKey,
    });
    this.dispatch('row-click', { record: row });
  }

  // Pagination

  /** A slotted pagination's page event: followed, and left to bubble to the consumer. */
  private onSlottedPage = (event: Event) => {
    const { detail } = event as CustomEvent<{ page: number; pageSize: number }>;
    if (!detail || typeof detail.page !== 'number') return;
    this.page = detail.page;
    this.pageSize = detail.pageSize;
  };

  private onFooterSlotChange = (event: Event) => {
    const slot = event.target as HTMLSlotElement;
    const elements = slot.assignedElements({ flatten: true });
    this.hasFooterContent = elements.length > 0;
    let pagination: Pagination | null = null;
    for (const element of elements) {
      const found =
        element.localName === 'wc-pagination'
          ? element
          : element.querySelector('wc-pagination');
      if (found) {
        pagination = found as Pagination;
        break;
      }
    }
    if (pagination && pagination !== this.slottedPagination) {
      // The slotted pagination's page and page size are the starting point.
      this.page = pagination.page;
      this.pageSize = pagination.pageSize;
    }
    this.slottedPagination = pagination;
  };

  // Scrolling and focus

  private onScrollContainer = () => {
    this.updateScrollEdges();
    if (this.isVirtual && this.scrollContainer) {
      this.virtualScrollTop = this.scrollContainer.scrollTop;
    }
  };

  /** Measures the row height and the space for rows of a virtual body. */
  private measureVirtual() {
    const container = this.scrollContainer;
    if (!this.isVirtual || !container) return;
    const header = this.renderRoot.querySelector<HTMLElement>('.header');
    const footer = this.renderRoot.querySelector<HTMLElement>('.aggregates');
    const row = this.renderRoot.querySelector<HTMLElement>(
      '.body .row[data-key], .body .group-header-row',
    );
    const rowHeight = row?.getBoundingClientRect().height ?? 0;
    const viewport = Math.max(
      0,
      container.clientHeight -
        (header?.offsetHeight ?? 0) -
        (footer?.offsetHeight ?? 0),
    );
    let changed = false;
    if (rowHeight > 0 && Math.abs(rowHeight - this.virtualRowHeight) > 0.5) {
      this.virtualRowHeight = rowHeight;
      changed = true;
    }
    if (viewport !== this.virtualViewport) {
      this.virtualViewport = viewport;
      changed = true;
    }
    if (changed) this.requestUpdate();
  }

  /** Scrolls a virtual body so navigation row `row` is in view. */
  private scrollRowIntoView(row: number) {
    const container = this.scrollContainer;
    if (!container || row < 1) return;
    const index = this.getView().items.findIndex(item => item.navRow === row);
    if (index < 0) return;
    const rowHeight = this.virtualRowHeight || FALLBACK_ROW_HEIGHT;
    const viewport = this.virtualViewport || container.clientHeight;
    const top = index * rowHeight;
    let { scrollTop } = container;
    if (top < scrollTop) scrollTop = top;
    else if (top + rowHeight > scrollTop + viewport) {
      scrollTop = top + rowHeight - viewport;
    }
    if (scrollTop !== container.scrollTop) container.scrollTop = scrollTop;
    this.virtualScrollTop = container.scrollTop;
  }

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

  /** The element that takes focus for a cell: its sort or menu button, or the cell itself. */
  private getFocusTarget(row: number, col: number): HTMLElement | null {
    const cell = this.getCell(row, col);
    return cell?.querySelector<HTMLElement>('[data-focus-target]') ?? cell;
  }

  /** The navigation row holding the tab stop. */
  private get tabRow(): number {
    return this.tabRowOverride ?? this.activeCell.row;
  }

  private tabIndexFor(row: number, col: number): string {
    return this.tabRow === row && this.activeCell.col === col ? '0' : '-1';
  }

  /** The tab index of a one-cell row (a group header), whichever column is active. */
  private tabIndexForRow(row: number): string {
    return this.tabRow === row ? '0' : '-1';
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
    const columns = this.getGridColumns();
    const entry = columns[col];
    const rtl = this.isRtl();

    if (row === 0 && entry?.column && this.onHeaderKeydown(event, entry, rtl)) {
      return;
    }

    const next = nextGridPosition(
      event.key,
      { row, col },
      {
        lastRow: this.getView().navItems.length,
        lastCol: columns.length - 1,
      },
      { ctrlKey: event.ctrlKey, rtl },
    );
    if (!next) {
      this.onCellKeydown(event, row, col, entry, cell);
      return;
    }

    event.preventDefault();
    // A group header is one cell: moving along it keeps the column for the rows around it.
    if (cell.hasAttribute('data-group') && next.row === row) return;
    if (this.isVirtual) this.scrollRowIntoView(next.row);
    this.activeCell = next;
    // The cell may already be active (an edge was reached): then there is nothing to focus.
    this.pendingFocus = next.row !== row || next.col !== col;
  };

  /** Sort and reorder keys on a data column header. Returns true when the key was handled. */
  private onHeaderKeydown(
    event: KeyboardEvent,
    entry: GridColumn,
    rtl: boolean,
  ): boolean {
    const { column } = entry;
    if (!column) return false;
    const direction = horizontalDirection(event.key, rtl);
    if (event.altKey && direction !== 0 && this.isColumnReorderable(column)) {
      event.preventDefault();
      this.moveColumn(column, direction);
      return true;
    }
    if (event.key === 'Enter' && this.isColumnSortable(column)) {
      event.preventDefault();
      this.onSortActivate(column, event.shiftKey);
      return true;
    }
    return false;
  }

  /**
   * Space, Enter, F2 and Ctrl+C on a body cell. Enter and Space toggle a group header or a row's
   * details from the expander; Enter and F2 open the editor of an editable cell.
   */
  private onCellKeydown(
    event: KeyboardEvent,
    row: number,
    col: number,
    entry: GridColumn | undefined,
    cell: HTMLElement,
  ) {
    const item = this.getNavItem(row);
    if (!item) return;
    const isToggleKey = event.key === 'Enter' || event.key === ' ';
    if (item.kind === 'group') {
      if (isToggleKey) {
        event.preventDefault();
        this.toggleGroup(item.group.key);
      }
      return;
    }
    if (item.kind !== 'data') return;
    if (entry?.kind === 'expand' && isToggleKey) {
      event.preventDefault();
      this.toggleRow(item.key);
      return;
    }
    const pageRows = this.getPageRows();
    const { column } = entry ?? {};
    switch (event.key) {
      case ' ':
        if (this.selectionMode !== 'none') {
          event.preventDefault();
          this.onRowSelect(item.row, pageRows);
        }
        break;
      case 'Enter':
      case 'F2':
        if (column && this.isCellEditable(column)) {
          event.preventDefault();
          this.startEdit(item.key, column, row, col);
        } else if (column && event.key === 'Enter') {
          this.dispatchCellEvents(item.row, column, event);
        }
        break;
      case 'c':
      case 'C':
        if (event.ctrlKey || event.metaKey) {
          writeClipboardText(cell.innerText).catch(() => {});
        }
        break;
      default:
        break;
    }
  }

  // Column reorder

  private applyColumnOrder(order: string[], moved: TableColumn) {
    this.columnState = { ...this.columnState, order };
    this.dispatch('column-reorder', { order: [...order] });
    const columns = this.getGridColumns();
    const index = columns.findIndex(entry => entry.column === moved);
    if (index >= 0) {
      const visible = columns.filter(entry => entry.kind === 'data');
      this.announcement = this.i18n.t('columnMoved')(
        moved.label || moved.name,
        String(visible.indexOf(columns[index]) + 1),
        String(visible.length),
      );
    }
    return index;
  }

  private moveColumn(column: TableColumn, direction: number) {
    const order = moveColumnBy(
      this.columns ?? [],
      this.columnState,
      column.name,
      direction,
    );
    if (!order) return;
    const index = this.applyColumnOrder(order, column);
    if (index >= 0) {
      this.activeCell = { row: 0, col: index };
      this.pendingFocus = true;
    }
  }

  private onHeaderPointerDown(event: PointerEvent, entry: GridColumn) {
    const { column } = entry;
    if (event.button !== 0 || !column || !this.isColumnReorderable(column)) {
      return;
    }
    this.dragSession = {
      name: column.name,
      startX: event.clientX,
      active: false,
    };
    this.startPointerSession();
  }

  /** The reorderable header under `clientX` pinned like the dragged column. */
  private findDropTarget(clientX: number, name: string): string {
    const source = this.renderRoot.querySelector<HTMLElement>(
      `.header-row [data-name="${CSS.escape(name)}"]`,
    );
    const placement = source?.dataset.placement;
    const headers = this.renderRoot.querySelectorAll<HTMLElement>(
      '.header-row [data-name]',
    );
    for (const header of headers) {
      const rect = header.getBoundingClientRect();
      if (
        header.dataset.placement === placement &&
        clientX >= rect.left &&
        clientX <= rect.right
      ) {
        return header.dataset.name ?? '';
      }
    }
    return '';
  }

  // Column resize

  private setColumnWidth(name: string, width: number) {
    if (this.columnState.widths[name] === width) return;
    this.columnState = {
      ...this.columnState,
      widths: { ...this.columnState.widths, [name]: width },
    };
  }

  /** The rendered width of a column in rem. */
  private measureColumn(name: string, fallback: number): number {
    const header = this.renderRoot.querySelector<HTMLElement>(
      `.header-row [data-name="${CSS.escape(name)}"]`,
    );
    const width = header?.getBoundingClientRect().width ?? 0;
    return width > 0 ? width / remSize() : fallback;
  }

  private onResizePointerDown(event: PointerEvent, entry: GridColumn) {
    const { column } = entry;
    if (event.button !== 0 || !column) return;
    event.preventDefault();
    event.stopPropagation();
    const startWidth = this.measureColumn(column.name, entry.width);
    this.resizeSession = {
      name: column.name,
      startX: event.clientX,
      startWidth,
      width: startWidth,
      rtl: this.isRtl(),
    };
    this.startPointerSession();
  }

  private onResizeKeydown(event: KeyboardEvent, entry: GridColumn) {
    const { column } = entry;
    if (!column) return;
    const direction = horizontalDirection(event.key, this.isRtl());
    if (direction === 0) return;
    event.preventDefault();
    event.stopPropagation();
    const current = this.measureColumn(column.name, entry.width);
    const width = clampResizeWidth(column, current + direction * RESIZE_STEP);
    this.setColumnWidth(column.name, width);
    this.dispatch('column-resize', { name: column.name, width });
  }

  // Pointer sessions (resize and drag)

  private startPointerSession() {
    window.addEventListener('pointermove', this.onWindowPointerMove);
    window.addEventListener('pointerup', this.onWindowPointerUp);
    window.addEventListener('pointercancel', this.onWindowPointerUp);
  }

  private endPointerSession() {
    window.removeEventListener('pointermove', this.onWindowPointerMove);
    window.removeEventListener('pointerup', this.onWindowPointerUp);
    window.removeEventListener('pointercancel', this.onWindowPointerUp);
    this.resizeSession = undefined;
    this.dragSession = undefined;
    this.dragColumn = '';
    this.dropTarget = '';
  }

  private onWindowPointerMove = (event: PointerEvent) => {
    const resize = this.resizeSession;
    if (resize) {
      const column = this.columns.find(entry => entry.name === resize.name);
      if (!column) return;
      const delta =
        ((event.clientX - resize.startX) * (resize.rtl ? -1 : 1)) / remSize();
      resize.width = clampResizeWidth(column, resize.startWidth + delta);
      this.setColumnWidth(resize.name, resize.width);
      return;
    }
    const drag = this.dragSession;
    if (!drag) return;
    if (
      !drag.active &&
      Math.abs(event.clientX - drag.startX) > DRAG_THRESHOLD
    ) {
      drag.active = true;
      this.dragColumn = drag.name;
    }
    if (drag.active) {
      const target = this.findDropTarget(event.clientX, drag.name);
      this.dropTarget = target === drag.name ? '' : target;
    }
  };

  private onWindowPointerUp = (event: PointerEvent) => {
    const resize = this.resizeSession;
    const drag = this.dragSession;
    let swallowClick = false;
    if (resize) {
      swallowClick = true;
      if (resize.width !== resize.startWidth) {
        this.dispatch('column-resize', {
          name: resize.name,
          width: resize.width,
        });
      }
    } else if (drag?.active) {
      swallowClick = true;
      const target =
        this.dropTarget || this.findDropTarget(event.clientX, drag.name);
      const column = this.columns.find(entry => entry.name === drag.name);
      const order =
        target && column
          ? moveColumnTo(this.columns, this.columnState, drag.name, target)
          : undefined;
      if (order && column) this.applyColumnOrder(order, column);
    }
    this.endPointerSession();
    if (swallowClick) {
      this.suppressClick = true;
      setTimeout(() => {
        this.suppressClick = false;
      });
    }
  };

  // Column visibility

  private onColumnMenuButtonClick = (event: Event) => {
    const menu = this.columnMenuElement;
    if (!menu) return;
    menu.anchorElement = event.currentTarget as HTMLElement;
    menu.toggle();
  };

  private onColumnMenuActivate = (event: Event) => {
    event.stopPropagation();
    const { item } = (
      event as CustomEvent<{
        item: HTMLElement & { value: string; selected: boolean };
      }>
    ).detail;
    const column = (this.columns ?? []).find(
      entry => entry.name === item?.value,
    );
    if (!column) return;
    const hidden = !item.selected;
    if (isColumnHidden(column, this.columnState) === hidden) return;
    this.columnState = {
      ...this.columnState,
      hidden: { ...this.columnState.hidden, [column.name]: hidden },
    };
    this.dispatch('column-visibility', { name: column.name, hidden });
  };

  private onColumnMenuOpenChange = (event: Event) => {
    // The table's own menu is an implementation detail: keep its events inside.
    event.stopPropagation();
    if (event.type === 'open') this.columnMenuOpen = true;
    if (event.type === 'close') this.columnMenuOpen = false;
  };

  // ── Render helpers ───────────────────────────────────────────────────────

  private renderGroupRow(columns: GridColumn[]) {
    const groups = this.getHeaderGroups(columns);
    if (!groups) return nothing;
    return html`
      <div
        class="row group-row"
        role="row"
        aria-rowindex="1"
        style="--_row-min-width: ${totalWidth(columns)}rem"
      >
        ${renderRowGroups<HeaderGroupCell>(
          groups,
          group => html`
            <div
              class=${classMap({
                cell: true,
                'group-cell': true,
                'has-group': !!group.label,
              })}
              style=${cellStyle(group.columns)}
              role="columnheader"
              aria-colspan=${group.span}
            >
              <span class="header-label">${group.label}</span>
            </div>
          `,
        )}
      </div>
    `;
  }

  private renderSelectAllHeader(
    entry: GridColumn,
    index: number,
    pageRows: TableRow[],
  ) {
    if (this.selectionMode === 'single') {
      return html`
        <div
          class=${cellClasses(entry)}
          style=${cellStyle(entry)}
          role="columnheader"
          data-cell
          data-row="0"
          data-col=${index}
          tabindex=${this.tabIndexFor(0, index)}
          aria-label=${this.i18n.t('selection')}
        ></div>
      `;
    }
    const pageKeys = this.selectableKeys(pageRows);
    const selectedOnPage = pageKeys.filter(key =>
      this.selectedKeys.has(key),
    ).length;
    const allOnPage = pageKeys.length > 0 && selectedOnPage === pageKeys.length;
    return html`
      <div
        class=${cellClasses(entry)}
        style=${cellStyle(entry)}
        role="columnheader"
        data-cell
        data-row="0"
        data-col=${index}
        tabindex=${this.tabIndexFor(0, index)}
        aria-label=${this.i18n.t('selectAllRowsOnPage')}
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
          aria-label=${this.i18n.t('selectAllRowsOnPage')}
          .checked=${allOnPage}
          .indeterminate=${selectedOnPage > 0 && !allOnPage}
          ?disabled=${pageKeys.length === 0}
          @change=${(event: Event) => {
            event.stopPropagation();
            this.onSelectAllClick(pageRows);
          }}
        ></wc-checkbox>
      </div>
    `;
  }

  private renderColumnMenuHeader(entry: GridColumn, index: number) {
    return html`
      <div
        class=${cellClasses(entry)}
        style=${cellStyle(entry)}
        role="columnheader"
        data-cell
        data-row="0"
        data-col=${index}
      >
        <wc-icon-button
          class="column-menu-button"
          variant="text"
          size="xs"
          shape="round"
          color="secondary"
          data-focus-target
          tabindex=${this.tabIndexFor(0, index)}
          aria-label=${this.i18n.t('showHideColumns')}
          title=${this.i18n.t('showHideColumns')}
          aria-haspopup="menu"
          aria-expanded=${this.columnMenuOpen ? 'true' : 'false'}
          @click=${this.onColumnMenuButtonClick}
        >
          <wc-icon name="view_column"></wc-icon>
        </wc-icon-button>
      </div>
    `;
  }

  private renderSortButton(column: TableColumn, index: number) {
    const sorts = this.sorts ?? [];
    const position = sorts.findIndex(sort => sort.name === column.name);
    const sort = sorts[position];
    const showPriority = sort && sorts.length > 1;
    return html`
      <button
        type="button"
        class="sort-button"
        data-focus-target
        tabindex=${this.tabIndexFor(0, index)}
        @click=${(event: MouseEvent) =>
          this.onSortActivate(column, event.shiftKey)}
      >
        ${renderHeaderLabel(column)}
        <wc-icon
          class="sort-icon"
          aria-hidden="true"
          name=${sort?.order === 'desc' ? 'arrow_downward' : 'arrow_upward'}
        ></wc-icon>
        ${showPriority
          ? html`<span class="sort-priority" aria-hidden="true"
                >${position + 1}</span
              ><span class="visually-hidden"
                >${this.i18n.t('sortPriority')(
                  String(position + 1),
                  sort.order === 'asc',
                )}</span
              >`
          : nothing}
      </button>
    `;
  }

  private renderResizeHandle(entry: GridColumn, index: number) {
    const column = entry.column as TableColumn;
    const width = Math.round(entry.width * 10) / 10;
    const min = Math.max(entry.minWidth ?? 0, MIN_RESIZE_WIDTH);
    return html`
      <div
        class="resize-handle"
        role="separator"
        aria-orientation="vertical"
        aria-label=${this.i18n.t('resizeColumn')(column.label || column.name)}
        aria-valuenow=${width}
        aria-valuemin=${min}
        aria-valuemax=${entry.maxWidth ?? nothing}
        tabindex=${this.tabIndexFor(0, index)}
        @pointerdown=${(event: PointerEvent) =>
          this.onResizePointerDown(event, entry)}
        @keydown=${(event: KeyboardEvent) => this.onResizeKeydown(event, entry)}
      ></div>
    `;
  }

  /** One column header. */
  private renderHeaderCell(
    entry: GridColumn,
    index: number,
    pageRows: TableRow[],
  ) {
    if (entry.kind === 'select') {
      return this.renderSelectAllHeader(entry, index, pageRows);
    }
    if (entry.kind === 'menu') return this.renderColumnMenuHeader(entry, index);
    if (entry.kind === 'expand') {
      return html`
        <div
          class=${cellClasses(entry)}
          style=${cellStyle(entry)}
          role="columnheader"
          data-cell
          data-row="0"
          data-col=${index}
          tabindex=${this.tabIndexFor(0, index)}
          aria-label=${this.i18n.t('rowDetails')}
        ></div>
      `;
    }

    const column = entry.column as TableColumn;
    const sortable = this.isColumnSortable(column);
    const primary = this.sorts?.[0];
    const sorted = (this.sorts ?? []).some(sort => sort.name === column.name);
    let ariaSort: 'ascending' | 'descending' | 'none' | undefined;
    if (sortable) {
      // ARIA allows one sorted header: the primary sort. Other levels say so in text.
      if (primary?.name !== column.name) ariaSort = 'none';
      else ariaSort = primary.order === 'asc' ? 'ascending' : 'descending';
    }
    const resizable = this.isColumnResizable(column);
    const reorderable = this.isColumnReorderable(column);

    return html`
      <div
        class=${cellClasses(entry, {
          sorted,
          sortable,
          resizable,
          reorderable,
          dragging: this.dragColumn === column.name,
          'drop-target': this.dropTarget === column.name,
        })}
        style=${cellStyle(entry)}
        role="columnheader"
        aria-sort=${ariaSort ?? nothing}
        data-cell
        data-row="0"
        data-col=${index}
        data-name=${column.name}
        data-placement=${entry.placement}
        tabindex=${sortable ? nothing : this.tabIndexFor(0, index)}
        @pointerdown=${(event: PointerEvent) =>
          this.onHeaderPointerDown(event, entry)}
      >
        ${sortable
          ? this.renderSortButton(column, index)
          : renderHeaderLabel(column)}
        ${resizable ? this.renderResizeHandle(entry, index) : nothing}
      </div>
    `;
  }

  private renderHeader(columns: GridColumn[], pageRows: TableRow[]) {
    return html`
      <div class="header" role="rowgroup">
        ${this.renderGroupRow(columns)}
        <div
          class="row header-row"
          role="row"
          aria-rowindex=${this.headerRowCount}
          style="--_row-min-width: ${totalWidth(columns)}rem"
        >
          ${renderRowGroups(columns, (entry, index) =>
            this.renderHeaderCell(entry, index, pageRows),
          )}
        </div>
        ${this.loading && pageRows.length && !this.error
          ? html`<wc-linear-progress
              class="loading-bar"
              indeterminate
              aria-label=${this.i18n.t('loading')}
            ></wc-linear-progress>`
          : nothing}
      </div>
    `;
  }

  /** The selection control cell of a row. */
  private renderSelectCell(
    entry: GridColumn,
    index: number,
    row: TableRow,
    ctx: TableRowContext,
  ) {
    const label = this.i18n.t('selectRow');
    const onChange = (event: Event) => {
      event.stopPropagation();
      this.onRowSelect(row, ctx.pageRows);
    };
    return html`
      <div
        class=${cellClasses(entry)}
        style=${cellStyle(entry)}
        role="gridcell"
        data-cell
        data-row=${ctx.gridRow}
        data-col=${index}
        tabindex=${this.tabIndexFor(ctx.gridRow, index)}
      >
        ${this.selectionMode === 'single'
          ? html`<wc-radio
              class="checkbox"
              tabindex="-1"
              aria-label=${label}
              .checked=${ctx.selected}
              ?disabled=${!ctx.selectable}
              @change=${onChange}
            ></wc-radio>`
          : html`<wc-checkbox
              class="checkbox"
              tabindex="-1"
              aria-label=${label}
              .checked=${ctx.selected}
              ?disabled=${!ctx.selectable}
              @change=${onChange}
            ></wc-checkbox>`}
      </div>
    `;
  }

  /** The expander cell of a row with details. */
  private renderExpandCell(
    entry: GridColumn,
    index: number,
    ctx: TableRowContext,
  ) {
    // A native button: aria-controls must point at the detail row in this shadow root.
    return html`
      <div
        class=${cellClasses(entry)}
        style=${cellStyle(entry)}
        role="gridcell"
        data-cell
        data-row=${ctx.gridRow}
        data-col=${index}
      >
        <button
          type="button"
          class="row-toggle expand-button"
          data-focus-target
          tabindex=${this.tabIndexFor(ctx.gridRow, index)}
          aria-expanded=${ctx.expanded ? 'true' : 'false'}
          aria-controls=${ctx.expanded ? this.detailId(ctx.key) : nothing}
          aria-label=${ctx.expanded
            ? this.i18n.t('collapseRow')
            : this.i18n.t('expandRow')}
          @click=${() => this.toggleRow(ctx.key)}
        >
          <wc-icon name="chevron_right" aria-hidden="true"></wc-icon>
        </button>
      </div>
    `;
  }

  /** The editor in place of a cell's content. */
  private renderCellEditor(row: TableRow, column: TableColumn) {
    const onEvent = (event: Event) => this.onEditorChange(event, column);
    return html`<div
      class="cell-editor"
      @keydown=${this.onEditorKeydown}
      @focusout=${this.onEditorFocusOut}
      @input=${onEvent}
      @change=${onEvent}
      @click=${(event: Event) => event.stopPropagation()}
      @dblclick=${(event: Event) => event.stopPropagation()}
    >
      ${renderEditor(column, row?.[column.name], column.label || column.name)}
    </div>`;
  }

  /** One cell of a data row. */
  private renderBodyCell(
    entry: GridColumn,
    index: number,
    row: TableRow,
    ctx: TableRowContext,
  ) {
    if (entry.kind === 'select')
      return this.renderSelectCell(entry, index, row, ctx);
    if (entry.kind === 'expand')
      return this.renderExpandCell(entry, index, ctx);
    const { column } = entry;
    const editable = this.isCellEditable(column);
    const editing = editable && this.isEditing(ctx.key, column);
    let content: unknown = nothing;
    if (column) {
      content = editing
        ? this.renderCellEditor(row, column)
        : renderCellContent(row, column);
    }
    // Enter on a cell is handled by the grid's keydown listener.
    /* eslint-disable lit-a11y/click-events-have-key-events */
    return html`
      <div
        class=${cellClasses(entry, { editable, editing })}
        style=${cellStyle(entry)}
        role="gridcell"
        data-cell
        data-row=${ctx.gridRow}
        data-col=${index}
        tabindex=${this.tabIndexFor(ctx.gridRow, index)}
        @click=${(evt: MouseEvent) => {
          if (column) this.onCellClick(row, column, evt);
        }}
        @dblclick=${() => {
          if (column && editable) {
            this.startEdit(ctx.key, column, ctx.gridRow, index);
          }
        }}
      >
        ${content}
      </div>
    `;
    /* eslint-enable lit-a11y/click-events-have-key-events */
  }

  /** One data row. Every data row is rendered here. */
  private renderRow(row: TableRow, ctx: TableRowContext) {
    const multiselect = this.selectionMode !== 'none';
    return html`
      <div
        class=${classMap({
          row: true,
          selected: ctx.selected,
          unselectable: multiselect && !ctx.selectable,
          expanded: ctx.expanded,
        })}
        role="row"
        aria-rowindex=${ctx.ariaRowIndex}
        aria-selected=${multiselect ? String(ctx.selected) : nothing}
        aria-disabled=${multiselect && !ctx.selectable ? 'true' : nothing}
        data-key=${ctx.key}
        style="--_row-min-width: ${totalWidth(ctx.columns)}rem"
      >
        ${renderRowGroups(ctx.columns, (entry, index) =>
          this.renderBodyCell(entry, index, row, ctx),
        )}
      </div>
    `;
  }

  /** The detail row under an expanded row: one cell across every column. */
  private renderDetailRow(
    item: Extract<TableDisplayItem, { kind: 'detail' }>,
    columns: GridColumn[],
  ) {
    const content = this.detailTemplate?.(item.row);
    return html`
      <div
        class="row detail-row"
        role="row"
        id=${this.detailId(item.key)}
        aria-rowindex=${item.ariaRowIndex}
        data-detail-key=${item.key}
        style="--_row-min-width: ${totalWidth(columns)}rem"
      >
        <div
          class="detail-cell"
          role="gridcell"
          aria-colspan=${Math.max(1, columns.length)}
        >
          <div class="detail-content">${content ?? nothing}</div>
        </div>
      </div>
    `;
  }

  /** A group header: one cell across every column with the toggle, label and row count. */
  private renderGroupHeaderRow(
    item: Extract<TableDisplayItem, { kind: 'group' }>,
    columns: GridColumn[],
  ) {
    const { group, expanded, navRow } = item;
    const name = group.key === '' ? this.i18n.t('emptyGroup') : group.key;
    const count = group.rows.length;
    const label = this.groupTemplate
      ? this.groupTemplate(group.key, group.rows)
      : name;
    // The cell carries the active column, so Up and Down through it keep the column.
    return html`
      <div
        class="row group-header-row"
        role="row"
        aria-rowindex=${item.ariaRowIndex}
        data-group-key=${group.key}
        style="--_row-min-width: ${totalWidth(columns)}rem"
      >
        <div
          class="cell group-header-cell"
          role="gridcell"
          aria-colspan=${Math.max(1, columns.length)}
          data-cell
          data-group
          data-row=${navRow}
          data-col=${this.activeCell.col}
        >
          <div class="group-header-content">
            <button
              type="button"
              class="row-toggle group-toggle"
              data-focus-target
              tabindex=${this.tabIndexForRow(navRow)}
              aria-expanded=${expanded ? 'true' : 'false'}
              aria-label=${expanded
                ? this.i18n.t('collapseGroup')(name)
                : this.i18n.t('expandGroup')(name)}
              @click=${() => this.toggleGroup(group.key)}
            >
              <wc-icon name="chevron_right" aria-hidden="true"></wc-icon>
            </button>
            <span class="group-label">${label}</span>
            <span class="group-count"
              >${this.i18n.t('groupRowCount')(
                new Intl.NumberFormat(this.i18n.locale).format(count),
                count,
              )}</span
            >
          </div>
        </div>
      </div>
    `;
  }

  private renderBodyItem(
    item: TableDisplayItem,
    columns: GridColumn[],
    pageRows: TableRow[],
  ) {
    if (item.kind === 'group') return this.renderGroupHeaderRow(item, columns);
    if (item.kind === 'detail') return this.renderDetailRow(item, columns);
    const selectable = this.selectionMode !== 'none';
    const ctx: TableRowContext = {
      columns,
      pageRows,
      gridRow: item.navRow,
      ariaRowIndex: item.ariaRowIndex,
      key: item.key,
      selected: selectable && this.selectedKeys.has(item.key),
      selectable: selectable && this.isRowSelectableNow(item.row),
      expanded: item.expanded,
    };
    return this.renderRow(item.row, ctx);
  }

  /** The page's body rows; with `virtual`, only those in view between two spacers. */
  private renderBodyRows(columns: GridColumn[], view: TableView) {
    const { items } = view;
    let start = 0;
    let end = items.length;
    let rowHeight = 0;
    if (this.isVirtual) {
      rowHeight = this.virtualRowHeight || FALLBACK_ROW_HEIGHT;
      ({ start, end } = virtualWindow(items.length, {
        rowHeight,
        scrollTop: this.virtualScrollTop,
        viewport: this.virtualViewport || rowHeight * FALLBACK_VIRTUAL_ROWS,
        overscan: VIRTUAL_OVERSCAN,
      }));
    }
    const shown = items.slice(start, end);

    // Keep the tab stop on a rendered row when the active one scrolled out of the window.
    const active = this.activeCell.row;
    if (active > 0 && !shown.some(item => item.navRow === active)) {
      this.tabRowOverride = shown.find(item => item.navRow > 0)?.navRow;
    }

    const spacer = (rows: number) =>
      rows > 0
        ? html`<div
            class="virtual-spacer"
            role="none"
            style="block-size: ${rows * rowHeight}px"
          ></div>`
        : nothing;

    return html`${spacer(start)}${repeat(
      shown,
      item =>
        `${item.kind}:${item.kind === 'group' ? item.group.key : item.key}`,
      item => this.renderBodyItem(item, columns, view.pageRows),
    )}${spacer(items.length - end)}`;
  }

  private renderBody(columns: GridColumn[], view: TableView) {
    return html`<div class="body" role="rowgroup">
      ${this.renderBodyRows(columns, view)}
    </div>`;
  }

  /** The footer row of column aggregates, after the body. */
  private renderAggregateRow(
    columns: GridColumn[],
    view: TableView,
    ariaRowIndex: number,
  ) {
    if (!this.hasAggregates()) return nothing;
    const rows = this.aggregateScope === 'page' ? view.pageRows : view.rows;
    const numberFormat = new Intl.NumberFormat(this.i18n.locale);
    const labels: Record<string, string> = {
      sum: this.i18n.t('aggregateSum'),
      avg: this.i18n.t('aggregateAvg'),
      min: this.i18n.t('aggregateMin'),
      max: this.i18n.t('aggregateMax'),
      count: this.i18n.t('aggregateCount'),
    };
    return html`
      <div class="aggregates" role="rowgroup">
        <div
          class="row aggregate-row"
          role="row"
          aria-rowindex=${ariaRowIndex > 0 ? ariaRowIndex : nothing}
          style="--_row-min-width: ${totalWidth(columns)}rem"
        >
          ${renderRowGroups(columns, entry => {
            const { column } = entry;
            const value = column ? aggregateValue(rows, column) : undefined;
            const label =
              typeof column?.aggregate === 'string'
                ? labels[column.aggregate]
                : '';
            return html`
              <div
                class=${cellClasses(entry)}
                style=${cellStyle(entry)}
                role="gridcell"
              >
                ${value === undefined
                  ? nothing
                  : html`${label
                        ? html`<span class="aggregate-label">${label}</span>`
                        : nothing}<span class="aggregate-value"
                        >${typeof value === 'number'
                          ? numberFormat.format(value)
                          : value}</span
                      >`}
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }

  private renderSkeletonBody(columns: GridColumn[]) {
    const count = this.isPaging ? Math.min(this.pageSize, 10) : SKELETON_ROWS;
    return html`
      <div class="body" role="rowgroup" aria-hidden="true">
        ${Array.from(
          { length: count },
          (_, rowIndex) => html`
            <div
              class="row skeleton-row"
              role="row"
              style="--_row-min-width: ${totalWidth(columns)}rem"
            >
              ${renderRowGroups(
                columns,
                (entry, index) => html`
                  <div
                    class=${cellClasses(entry)}
                    style=${cellStyle(entry)}
                    role="gridcell"
                  >
                    ${entry.kind === 'menu'
                      ? nothing
                      : html`<wc-skeleton
                          class="skeleton-bar"
                          visible
                          style=${entry.column
                            ? `inline-size: ${40 + ((rowIndex * 7 + index * 13) % 45)}%`
                            : nothing}
                        ></wc-skeleton>`}
                  </div>
                `,
              )}
            </div>
          `,
        )}
      </div>
    `;
  }

  /** A full-width row in place of the data: the empty or the error state. */
  private renderStateRow(
    columns: GridColumn[],
    kind: 'empty' | 'error',
    content: TemplateResult,
  ) {
    return html`
      <div class="body" role="rowgroup">
        <div
          class="state-row"
          role="row"
          aria-rowindex=${this.headerRowCount + 1}
        >
          <div
            class=${classMap({
              'empty-table': kind === 'empty',
              'error-table': kind === 'error',
            })}
            role="gridcell"
            aria-colspan=${Math.max(1, columns.length)}
          >
            ${content}
          </div>
        </div>
      </div>
    `;
  }

  /** The table's own empty and error message: a small illustration, a headline and a line of text. */
  private renderStateMessage(
    illustration: string,
    headline: string,
    text: string,
  ) {
    return html`<div class="state-message" part="state-message">
      <wc-illustration
        class="state-illustration"
        name=${illustration}
        size="sm"
      ></wc-illustration>
      <p class="state-headline">${headline}</p>
      <p class="state-text">${text}</p>
    </div>`;
  }

  private renderEmptyState(columns: GridColumn[]) {
    return this.renderStateRow(
      columns,
      'empty',
      html`<slot name="empty"
        >${this.renderStateMessage(
          'empty',
          this.emptyStateHeadline || this.i18n.t('noItems'),
          this.emptyStateDescription || this.i18n.t('noItemsDescription'),
        )}</slot
      >`,
    );
  }

  private renderErrorState(columns: GridColumn[]) {
    return this.renderStateRow(
      columns,
      'error',
      html`<slot name="error"
        >${this.renderStateMessage(
          'error',
          this.i18n.t('tableError'),
          this.errorText || this.i18n.t('tableErrorDescription'),
        )}</slot
      >`,
    );
  }

  private renderBulkBar(pageRows: TableRow[]) {
    if (this.selectionMode !== 'multiple') return nothing;
    const count = this.selectedRowKeys.length;
    if (count === 0) return nothing;

    const total = this.getTotalItems();
    const shownCount =
      this.allPagesSelected && total !== undefined ? total : count;
    const pageKeys = this.selectableKeys(pageRows);
    const pageFullySelected =
      pageKeys.length > 0 && pageKeys.every(key => this.selectedKeys.has(key));
    const canSelectAllPages =
      this.isPaging &&
      !this.allPagesSelected &&
      pageFullySelected &&
      total !== undefined &&
      total > count;

    const numberFormat = new Intl.NumberFormat(this.i18n.locale);

    return html`
      <div
        class=${classMap({
          'bulk-bar': true,
          // Over the column labels, below the column group row when there is one.
          'below-groups': !!this.getHeaderGroups(),
        })}
        role="region"
        aria-label=${this.i18n.t('selection')}
      >
        <span class="bulk-count" aria-live="polite"
          >${this.i18n.t('selectedCount')(
            numberFormat.format(shownCount),
          )}</span
        >
        ${canSelectAllPages
          ? html`<wc-button
              class="bulk-select-all"
              variant="text"
              size="sm"
              @click=${() => this.selectAllPages(pageRows)}
              >${this.i18n.t('selectAllCount')(
                numberFormat.format(total ?? 0),
              )}</wc-button
            >`
          : nothing}
        <span class="bulk-spacer"></span>
        <slot name="bulk-actions"></slot>
        <wc-button
          class="bulk-clear"
          variant="text"
          size="sm"
          @click=${this.clearSelection}
          >${this.i18n.t('clear')}</wc-button
        >
      </div>
    `;
  }

  private renderColumnMenu() {
    if (!this.columnMenu) return nothing;
    const ordered = orderColumns(this.columns ?? [], this.columnState);
    const visibleCount = ordered.filter(
      column => !isColumnHidden(column, this.columnState),
    ).length;
    return html`
      <wc-menu
        class="column-menu"
        placement="bottom-end"
        @menu-item-activate=${this.onColumnMenuActivate}
        @open=${this.onColumnMenuOpenChange}
        @close=${this.onColumnMenuOpenChange}
      >
        ${ordered
          .filter(column => column.hideable !== false)
          .map(column => {
            const hidden = isColumnHidden(column, this.columnState);
            return html`
              <wc-menu-item
                type="checkbox"
                value=${column.name}
                .selected=${!hidden}
                ?disabled=${!hidden && visibleCount <= 1}
                >${column.label || column.name}</wc-menu-item
              >
            `;
          })}
      </wc-menu>
    `;
  }

  /** The footer: the `footer` slot, usually holding a `wc-pagination`. */
  private renderFooter() {
    return html`
      <div class="table-footer" ?hidden=${!this.hasFooterContent}>
        <slot
          name="footer"
          @slotchange=${this.onFooterSlotChange}
          @page=${this.onSlottedPage}
        ></slot>
      </div>
    `;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const columns = this.getGridColumns();
    const view = this.getView();
    const pageRows = this.error ? [] : view.pageRows;
    const hasRows = pageRows.length > 0;
    const hasFooter = this.hasFooterContent;
    const ariaRowCount = this.getAriaRowCount(hasRows);

    this.tabRowOverride = undefined;
    let body;
    if (this.error) body = this.renderErrorState(columns);
    else if (hasRows) {
      body = html`${this.renderBody(columns, view)}${this.renderAggregateRow(
        columns,
        view,
        ariaRowCount,
      )}`;
    } else if (this.loading) body = this.renderSkeletonBody(columns);
    else body = this.renderEmptyState(columns);

    return html`
      <div
        class=${classMap({
          table: true,
          'scrolled-from-start': this.scrolledFromStart,
          'scrolled-from-end': this.scrolledFromEnd,
          'has-selection': this.selectedRowKeys.length > 0,
          'has-footer': hasFooter,
          'has-groups': this.headerRowCount > 1,
          'is-virtual': this.isVirtual,
        })}
      >
        ${this.renderBulkBar(pageRows)}
        <div
          class="table-scroll-container"
          role="grid"
          aria-label=${this.label || nothing}
          aria-busy=${this.loading ? 'true' : nothing}
          aria-multiselectable=${this.selectionMode === 'multiple'
            ? 'true'
            : nothing}
          aria-rowcount=${ariaRowCount}
          aria-colcount=${columns.length}
          @scroll=${this.onScrollContainer}
          @focusin=${this.onGridFocusIn}
          @keydown=${this.onGridKeydown}
        >
          ${this.renderHeader(columns, pageRows)} ${body}
        </div>
        ${this.renderFooter()} ${this.renderColumnMenu()}
        <div class="visually-hidden" aria-live="polite">
          ${this.error
            ? this.errorText || this.i18n.t('tableErrorDescription')
            : ''}
          ${this.announcement}
        </div>
      </div>
    `;
  }
}
