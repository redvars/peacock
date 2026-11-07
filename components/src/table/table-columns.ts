import type {
  ColumnPlacement,
  ColumnState,
  GridColumn,
  HeaderGroupCell,
  TableColumn,
} from './table-types.js';

/** Width of a column without `width`, in rem. */
export const DEFAULT_CELL_WIDTH = 16;
/** Width of the selection and column menu columns, in rem. */
export const CONTROL_CELL_WIDTH = 3;
/** Smallest width resizing allows when the column sets no `minWidth`, in rem. */
export const MIN_RESIZE_WIDTH = 3;
/** Width change of one arrow key press on a resize handle, in rem. */
export const RESIZE_STEP = 1;

export function emptyColumnState(): ColumnState {
  return { widths: {}, hidden: {}, order: [] };
}

export function getPlacement(column: TableColumn): ColumnPlacement {
  if (column.fixed === true || column.fixed === 'start') return 'start';
  if (column.fixed === 'end') return 'end';
  return 'scroll';
}

export function getAlign(column: TableColumn): 'start' | 'center' | 'end' {
  return column.align ?? (column.type === 'number' ? 'end' : 'start');
}

function positive(value: unknown): number | undefined {
  const number = Number.parseFloat(String(value ?? ''));
  return Number.isFinite(number) && number > 0 ? number : undefined;
}

/** Keeps a width inside the column's `minWidth` and `maxWidth`. */
export function clampWidth(column: TableColumn, width: number): number {
  const min = positive(column.minWidth) ?? 0;
  const max = positive(column.maxWidth) ?? Number.POSITIVE_INFINITY;
  return Math.min(Math.max(width, min), Math.max(min, max));
}

/** The width a resize may set: inside `minWidth` (at least 3rem) and `maxWidth`. */
export function clampResizeWidth(column: TableColumn, width: number): number {
  const min = Math.max(positive(column.minWidth) ?? 0, MIN_RESIZE_WIDTH);
  const max = positive(column.maxWidth) ?? Number.POSITIVE_INFINITY;
  const clamped = Math.min(Math.max(width, min), Math.max(min, max));
  // Whole sixteenths of a rem keep event values readable.
  return Math.round(clamped * 16) / 16;
}

/** The column's width in rem: a resized width, else its `width`, else 16, kept inside min and max. */
export function getColumnWidth(
  column: TableColumn,
  state: ColumnState,
): number {
  const width =
    positive(state.widths[column.name]) ??
    positive(column.width) ??
    DEFAULT_CELL_WIDTH;
  return clampWidth(column, width);
}

export function isColumnHidden(
  column: TableColumn,
  state: ColumnState,
): boolean {
  return state.hidden[column.name] ?? !!column.hidden;
}

/** Every column in display order, hidden ones included. */
export function orderColumns(
  columns: TableColumn[],
  state: ColumnState,
): TableColumn[] {
  if (!state.order.length) return [...columns];
  const position = new Map(state.order.map((name, index) => [name, index]));
  return columns
    .map((column, index) => ({ column, index }))
    .sort((a, b) => {
      const pa = position.get(a.column.name) ?? state.order.length + a.index;
      const pb = position.get(b.column.name) ?? state.order.length + b.index;
      return pa - pb;
    })
    .map(entry => entry.column);
}

/**
 * The rendered columns in visual order: the selection column, the row expander, start-pinned,
 * scrolling and end-pinned data columns, then the column menu. Hidden columns are left out.
 */
export function buildGridColumns(
  columns: TableColumn[],
  state: ColumnState,
  options: { select: boolean; menu: boolean; expand?: boolean },
): GridColumn[] {
  const start: GridColumn[] = [];
  const scroll: GridColumn[] = [];
  const end: GridColumn[] = [];

  if (options.select) {
    start.push({
      kind: 'select',
      placement: 'start',
      width: CONTROL_CELL_WIDTH,
      grow: 0,
    });
  }
  if (options.expand) {
    start.push({
      kind: 'expand',
      placement: 'start',
      width: CONTROL_CELL_WIDTH,
      grow: 0,
    });
  }
  orderColumns(columns ?? [], state).forEach(column => {
    if (isColumnHidden(column, state)) return;
    const placement = getPlacement(column);
    const resized = state.widths[column.name] !== undefined;
    const entry: GridColumn = {
      kind: 'data',
      column,
      placement,
      width: getColumnWidth(column, state),
      grow: resized ? 0 : Math.max(0, Number(column.flex) || 0),
      minWidth: positive(column.minWidth),
      maxWidth: positive(column.maxWidth),
    };
    if (placement === 'start') start.push(entry);
    else if (placement === 'end') end.push(entry);
    else scroll.push(entry);
  });

  // Without explicit flex, the last scrolling column takes the spare width, as before.
  if (!scroll.some(entry => entry.grow > 0)) {
    const last = scroll[scroll.length - 1];
    if (last?.column && state.widths[last.column.name] === undefined) {
      last.grow = 1;
    }
  }

  if (options.menu) {
    end.push({
      kind: 'menu',
      placement: 'end',
      width: CONTROL_CELL_WIDTH,
      grow: 0,
    });
  }
  return [...start, ...scroll, ...end];
}

/** Sum of the columns' starting widths in rem: the row's minimum width. */
export function totalWidth(columns: GridColumn[]): number {
  return columns.reduce((total, entry) => total + entry.width, 0);
}

/**
 * The column group header row, or `undefined` when no visible column has a `group`. Neighbouring
 * columns with the same group and placement share a cell; other columns get an empty cell.
 */
export function buildHeaderGroups(
  columns: GridColumn[],
): HeaderGroupCell[] | undefined {
  if (!columns.some(entry => entry.column?.group)) return undefined;
  const cells: HeaderGroupCell[] = [];
  columns.forEach(entry => {
    const label = entry.column?.group ?? '';
    const previous = cells[cells.length - 1];
    if (
      label &&
      previous &&
      previous.label === label &&
      previous.placement === entry.placement
    ) {
      previous.span += 1;
      previous.columns.push(entry);
    } else {
      cells.push({
        label,
        span: 1,
        columns: [entry],
        placement: entry.placement,
      });
    }
  });
  return cells;
}

/**
 * The column order after dropping `name` on `targetName`: before it when moving towards the start,
 * after it when moving towards the end. `undefined` when the two are pinned differently.
 */
export function moveColumnTo(
  columns: TableColumn[],
  state: ColumnState,
  name: string,
  targetName: string,
): string[] | undefined {
  const ordered = orderColumns(columns, state);
  const from = ordered.findIndex(entry => entry.name === name);
  const to = ordered.findIndex(entry => entry.name === targetName);
  if (from < 0 || to < 0 || from === to) return undefined;
  if (getPlacement(ordered[from]) !== getPlacement(ordered[to])) {
    return undefined;
  }
  const names = ordered.map(entry => entry.name);
  const [moved] = names.splice(from, 1);
  names.splice(to, 0, moved);
  return names;
}

/**
 * The column order after moving `name` by `delta` places among the visible columns of its
 * pinned group, or `undefined` when it cannot move that way.
 */
export function moveColumnBy(
  columns: TableColumn[],
  state: ColumnState,
  name: string,
  delta: number,
): string[] | undefined {
  const ordered = orderColumns(columns, state);
  const column = ordered.find(entry => entry.name === name);
  if (!column) return undefined;
  const placement = getPlacement(column);
  const siblings = ordered.filter(
    entry => getPlacement(entry) === placement && !isColumnHidden(entry, state),
  );
  const target = siblings[siblings.indexOf(column) + delta];
  if (!target) return undefined;
  return moveColumnTo(columns, state, name, target.name);
}

/**
 * Carries the column state over to a new `columns` array: overrides for columns that are gone are
 * dropped, and so are overrides of a `width` or `hidden` the new configuration changed.
 */
export function reconcileColumnState(
  state: ColumnState,
  previous: TableColumn[] | undefined,
  next: TableColumn[],
): ColumnState {
  const before = new Map((previous ?? []).map(column => [column.name, column]));
  const after = new Map((next ?? []).map(column => [column.name, column]));
  const widths: Record<string, number> = {};
  const hidden: Record<string, boolean> = {};

  Object.entries(state.widths).forEach(([name, width]) => {
    const column = after.get(name);
    if (column && before.get(name)?.width === column.width) {
      widths[name] = width;
    }
  });
  Object.entries(state.hidden).forEach(([name, value]) => {
    const column = after.get(name);
    if (column && !!before.get(name)?.hidden === !!column.hidden) {
      hidden[name] = value;
    }
  });
  const order = state.order.filter(name => after.has(name));
  return { widths, hidden, order };
}
