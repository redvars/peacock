import { compareValues } from './table-sort.js';
import { getRowKey } from './table-selection.js';
import type { TableRow, TableSortOrder } from './table-types.js';

/** Rows sharing one `group-by` value. */
export interface TableGroup {
  /** The value as a string; `''` for empty values. Used in `collapsed-groups` and events. */
  key: string;
  /** The raw value of the first row. */
  value: unknown;
  /** Every row of the group, across pages. */
  rows: TableRow[];
}

/** One rendered body row: a group header, a data row, or the detail row of an expanded row. */
export type TableDisplayItem =
  | {
      kind: 'group';
      group: TableGroup;
      expanded: boolean;
      /** Navigation row (1 for the first body row). */
      navRow: number;
      ariaRowIndex: number;
    }
  | {
      kind: 'data';
      row: TableRow;
      key: string;
      expanded: boolean;
      navRow: number;
      ariaRowIndex: number;
    }
  | {
      kind: 'detail';
      row: TableRow;
      key: string;
      /** Detail rows are not part of the keyboard model. */
      navRow: 0;
      ariaRowIndex: number;
    };

export interface DisplayOptions {
  keyField: string;
  /** Groups of the rows, in the rows' order, when `group-by` is set. */
  groups?: TableGroup[];
  /** Keys of collapsed groups. */
  collapsed: Set<string>;
  /** Keys of expanded rows, when rows have details. */
  expanded?: Set<string>;
  /** `aria-rowindex` of the first item in `rows`. */
  firstAriaRowIndex: number;
  /** Index of the first row to show. */
  start: number;
  /** Index after the last row to show. */
  end: number;
}

/** The group key of a value: the value as a string, `''` for `undefined` and `null`. */
export function groupKeyOf(value: unknown): string {
  return value === undefined || value === null ? '' : String(value);
}

/**
 * Splits rows into groups by `field`. Groups are ordered by value (`asc` or `desc`, empty values
 * last), or by first appearance with `"appearance"`. Rows keep their order inside a group.
 */
export function groupRows(
  rows: TableRow[],
  field: string,
  order: TableSortOrder | 'appearance',
): TableGroup[] {
  const groups = new Map<string, TableGroup>();
  rows.forEach(row => {
    const value = row?.[field];
    const key = groupKeyOf(value);
    const group = groups.get(key);
    if (group) group.rows.push(row);
    else groups.set(key, { key, value, rows: [row] });
  });
  const list = [...groups.values()];
  if (order === 'appearance') return list;
  return list.sort((a, b) => {
    const empty = (group: TableGroup) => group.key === '';
    if (empty(a) !== empty(b)) return empty(a) ? 1 : -1;
    const result = compareValues(a.value, b.value);
    return order === 'desc' ? -result : result;
  });
}

/**
 * The rows rendered for `rows[start, end)`: a header before each group that has rows in the
 * range (collapsed groups show the header only) and a detail row after each expanded row.
 * `aria-rowindex` counts every item over all of `rows`, so it stays right across pages; `count`
 * is that total, for `aria-rowcount`.
 */
export function buildDisplayItems(
  rows: TableRow[],
  options: DisplayOptions,
): { items: TableDisplayItem[]; count: number } {
  const { keyField, groups, collapsed, expanded, start, end } = options;
  const items: TableDisplayItem[] = [];
  let ariaRowIndex = options.firstAriaRowIndex;
  let navRow = 0;

  const addRows = (list: TableRow[], first: number) => {
    list.forEach((row, offset) => {
      const index = first + offset;
      const shown = index >= start && index < end;
      const key = getRowKey(row, keyField);
      const isExpanded = !!expanded?.has(key);
      if (shown) {
        navRow += 1;
        items.push({
          kind: 'data',
          row,
          key,
          expanded: isExpanded,
          navRow,
          ariaRowIndex,
        });
      }
      ariaRowIndex += 1;
      if (isExpanded) {
        if (shown) {
          items.push({ kind: 'detail', row, key, navRow: 0, ariaRowIndex });
        }
        ariaRowIndex += 1;
      }
    });
  };

  if (!groups) {
    addRows(rows, 0);
  } else {
    let first = 0;
    groups.forEach(group => {
      const last = first + group.rows.length;
      const isExpanded = !collapsed.has(group.key);
      if (first < end && last > start) {
        navRow += 1;
        items.push({
          kind: 'group',
          group,
          expanded: isExpanded,
          navRow,
          ariaRowIndex,
        });
      }
      ariaRowIndex += 1;
      if (isExpanded) addRows(group.rows, first);
      first = last;
    });
  }

  return { items, count: ariaRowIndex - options.firstAriaRowIndex };
}

/** Rows rendered by a virtual body; shared with `wc-virtual-list`. */
export { virtualWindow } from '@/__internal/utils/virtual-window.js';
