import type { TemplateResult } from 'lit';

/** A record shown in one row. */
export type TableRow = Record<string, any>;

/** The fields an editable column can edit with. */
export type TableEditor = 'text' | 'number' | 'select' | 'date' | 'checkbox';

/** One choice of a `"select"` editor. */
export interface TableEditorOption {
  label: string;
  value: string;
}

/** A built-in footer aggregate, or a function of the rows. */
export type TableAggregate =
  | 'sum'
  | 'avg'
  | 'min'
  | 'max'
  | 'count'
  | ((rows: TableRow[]) => string | number);

export interface TableColumn {
  /** Field of the row shown in this column. Also the column's id in events and state. */
  name: string;
  /** Header text. */
  label: string;
  /** Width in rem. Defaults to 16. With `flex`, this is the width the column grows from. */
  width?: number;
  /** Smallest width in rem, for `flex` growth and for resizing. */
  minWidth?: number;
  /** Largest width in rem, for `flex` growth and for resizing. */
  maxWidth?: number;
  /**
   * Grow factor: the share of the spare row width this column takes, like CSS `flex-grow`.
   * When no visible scrolling column sets it, the last scrolling column grows.
   */
  flex?: number;
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
  /** Hides the column. The column menu (`column-menu`) can show it again. */
  hidden?: boolean;
  /** Set to `false` to leave the column out of the column menu, so it cannot be hidden. */
  hideable?: boolean;
  /** Turns resizing on (`true`) or off (`false`) for this column, overriding the table's `resizable`. */
  resizable?: boolean;
  /** Turns reordering on (`true`) or off (`false`) for this column, overriding the table's `reorderable`. */
  reorderable?: boolean;
  /**
   * Header of a column group. Neighbouring columns with the same `group` (and the same pinning)
   * share one header cell in a row above the column headers.
   */
  group?: string;
  /**
   * Custom header content, shown inside the sort button when the column sorts. A string is shown
   * as text. Keep it non-interactive: the header cell is already a control.
   */
  headerTemplate?: (column: TableColumn) => string | TemplateResult;
  /**
   * Custom cell content. Return a Lit `TemplateResult` (preferred), or a string of trusted
   * HTML. A string is inserted as HTML without escaping, so never build it from user input.
   */
  template?: (row: TableRow, column: TableColumn) => string | TemplateResult;
  /**
   * Lets the user edit the column's cells in place: Enter, F2 or a double-click opens the editor,
   * Enter or leaving the field commits, Escape cancels. The table fires `cell-edit`.
   */
  editable?: boolean;
  /** The field that edits the cell. Defaults to `"number"` for number columns, else `"text"`. */
  editor?: TableEditor;
  /** The choices of a `"select"` editor. */
  options?: TableEditorOption[];
  /** The editor refuses an empty value. */
  required?: boolean;
  /** Smallest value of a `"number"` editor, or earliest ISO date of a `"date"` editor. */
  min?: number | string;
  /** Largest value of a `"number"` editor, or latest ISO date of a `"date"` editor. */
  max?: number | string;
  /** Step of a `"number"` editor. */
  step?: number;
  /**
   * Extra validation of an edited value: return a message to keep the editor open and show it,
   * or nothing to accept the value.
   */
  validate?: (value: unknown, row: TableRow) => string | null | undefined;
  /** The value `exportCsv()` writes for the cell. Defaults to the raw field value. */
  exportValue?: (row: TableRow) => unknown;
  /**
   * A footer value for the column: `"sum"`, `"avg"`, `"min"`, `"max"`, `"count"`, or a function
   * of the rows that returns the text or number to show.
   */
  aggregate?: TableAggregate;
}

/** Options of `exportCsv()` and `downloadCsv()`. */
export interface TableExportOptions {
  /** Every row (sorted), not only the rows on the current page. */
  allRows?: boolean;
  /** Column names to export, in this order. Defaults to the visible columns in display order. */
  columns?: string[];
  /** File name for `downloadCsv()`. Defaults to `"table.csv"`. */
  filename?: string;
}

/** How rows are selected. */
export type TableSelection = 'none' | 'single' | 'multiple';

export type TableSortOrder = 'asc' | 'desc';

/** One sort level. The first entry of a list is the primary sort. */
export interface TableSort {
  name: string;
  order: TableSortOrder;
}

export type ColumnPlacement = 'start' | 'scroll' | 'end';

/**
 * What a rendered column holds: the selection control, the row expander, a data column, or the
 * column menu.
 */
export type GridColumnKind = 'select' | 'expand' | 'data' | 'menu';

/** A rendered column with its resolved layout. */
export interface GridColumn {
  kind: GridColumnKind;
  /** The data column; set when `kind` is `"data"`. */
  column?: TableColumn;
  placement: ColumnPlacement;
  /** Width in rem the cell starts from (its flex basis). */
  width: number;
  /** Flex grow factor. */
  grow: number;
  /** Smallest width in rem. */
  minWidth?: number;
  /** Largest width in rem. */
  maxWidth?: number;
}

/** One cell of the column group header row. */
export interface HeaderGroupCell {
  /** Group header text; empty for a column outside any group. */
  label: string;
  /** Number of grid columns the cell spans. */
  span: number;
  /** The grid columns under the cell, in order. */
  columns: GridColumn[];
  placement: ColumnPlacement;
}

/** Column changes made in the table (resize, reorder, show/hide), keyed by column name. */
export interface ColumnState {
  /** Widths in rem set by resizing. */
  widths: Record<string, number>;
  /** Visibility set from the column menu; `true` is hidden. */
  hidden: Record<string, boolean>;
  /** Column names in display order; empty keeps the order of `columns`. */
  order: string[];
}

// ── Event details ───────────────────────────────────────────────────────────

export interface TableSortDetail {
  /** Primary sort column, or `''` when unsorted. */
  sortBy: string;
  /** Primary sort order. */
  sortOrder: TableSortOrder;
  /** Every sort level, primary first. */
  sorts: TableSort[];
}

export interface TableSelectionChangeDetail {
  /** Selected row keys, as strings. */
  value: string[];
  /** True when every selectable row on the page is selected. */
  isSelectAll: boolean;
  /** True when "Select all" picked every item across pages. */
  allPages: boolean;
}

export interface TableColumnResizeDetail {
  name: string;
  /** New width in rem. */
  width: number;
}

export interface TableColumnReorderDetail {
  /** Every column name in the new display order. */
  order: string[];
}

export interface TableColumnVisibilityDetail {
  name: string;
  hidden: boolean;
}

export interface TablePageDetail {
  page: number;
  pageSize: number;
}

export interface TableRowExpandDetail {
  /** Key of the row, as a string. */
  key: string;
  expanded: boolean;
}

export interface TableCellEditDetail {
  /** Key of the edited row, as a string. */
  key: string;
  /** Name of the edited column. */
  column: string;
  /** The new value. */
  value: unknown;
  /** The value before the edit. */
  oldValue: unknown;
  /** The row as it was before the edit. */
  record: TableRow;
}

export interface TableGroupToggleDetail {
  /** Key of the group: its `group-by` value as a string (`''` for empty values). */
  group: string;
  expanded: boolean;
}
