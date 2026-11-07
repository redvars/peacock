import type { TableColumn, TableRow } from './table-types.js';

/** The column's values that are numbers, or strings that read as numbers. */
function numericValues(rows: TableRow[], name: string): number[] {
  const values: number[] = [];
  rows.forEach(row => {
    const value = row?.[name];
    if (typeof value === 'number') {
      if (Number.isFinite(value)) values.push(value);
    } else if (typeof value === 'string' && value.trim() !== '') {
      const number = Number(value);
      if (Number.isFinite(number)) values.push(number);
    }
  });
  return values;
}

/**
 * A column's footer value over `rows`, or `undefined` when there is none (no aggregate, or no
 * numbers to sum). `count` counts the rows.
 */
export function aggregateValue(
  rows: TableRow[],
  column: TableColumn,
): string | number | undefined {
  const { aggregate } = column;
  if (!aggregate) return undefined;
  if (typeof aggregate === 'function') return aggregate(rows);
  if (aggregate === 'count') return rows.length;
  const values = numericValues(rows, column.name);
  if (!values.length) return undefined;
  switch (aggregate) {
    case 'sum':
      return values.reduce((total, value) => total + value, 0);
    case 'avg':
      return values.reduce((total, value) => total + value, 0) / values.length;
    // reduce, not Math.min(...values): spreading a large data set overflows the stack.
    case 'min':
      return values.reduce((low, value) => Math.min(low, value));
    case 'max':
      return values.reduce((high, value) => Math.max(high, value));
    default:
      return undefined;
  }
}
