import type { TableRow, TableSort, TableSortOrder } from './table-types.js';

const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
});

/** Compares numbers by value and everything else as text with natural number order. Empty values sort last. */
export function compareValues(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a === undefined || a === null || a === '') return 1;
  if (b === undefined || b === null || b === '') return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return collator.compare(String(a), String(b));
}

/** A sorted copy of `rows`, by each sort level in turn. */
export function sortRows(rows: TableRow[], sorts: TableSort[]): TableRow[] {
  if (!sorts.length) return [...rows];
  return [...rows].sort((a, b) => {
    for (const { name, order } of sorts) {
      const result = compareValues(a?.[name], b?.[name]);
      if (result !== 0) return order === 'desc' ? -result : result;
    }
    return 0;
  });
}

/** The order after the next click: ascending, then descending, then unsorted. */
function nextOrder(order: TableSortOrder | undefined): TableSortOrder | null {
  if (order === undefined) return 'asc';
  if (order === 'asc') return 'desc';
  return null;
}

/**
 * The sort levels after a header activation. A plain click sorts by this column only, cycling
 * ascending, descending and off. With `additive` (Shift), the column cycles in place and other
 * levels stay; a new column is added as the lowest level.
 */
export function nextSorts(
  sorts: TableSort[],
  name: string,
  additive: boolean,
): TableSort[] {
  const current = sorts.find(sort => sort.name === name);
  const order = nextOrder(current?.order);

  if (!additive) {
    // A plain click on one of several levels starts over with this column.
    const plainOrder = sorts.length > 1 ? 'asc' : order;
    return plainOrder ? [{ name, order: plainOrder }] : [];
  }

  if (!current) return [...sorts, { name, order: 'asc' }];
  if (!order) return sorts.filter(sort => sort.name !== name);
  return sorts.map(sort => (sort.name === name ? { name, order } : sort));
}

/** Drops empty and repeated levels from a sorts list set by the consumer. */
export function normalizeSorts(sorts: TableSort[] | undefined): TableSort[] {
  const seen = new Set<string>();
  const result: TableSort[] = [];
  (sorts ?? []).forEach(sort => {
    if (!sort?.name || seen.has(sort.name)) return;
    seen.add(sort.name);
    result.push({
      name: sort.name,
      order: sort.order === 'desc' ? 'desc' : 'asc',
    });
  });
  return result;
}
