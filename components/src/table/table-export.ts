import type { TableColumn, TableRow } from './table-types.js';

/** The text a value becomes in a CSV cell, before quoting. */
export function csvText(value: unknown): string {
  if (value === undefined || value === null) return '';
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? '' : value.toISOString();
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

/** One CSV field, quoted as RFC 4180 asks when it holds a quote, comma or line break. */
export function csvField(value: unknown): string {
  const text = csvText(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** The value a column exports for a row: `exportValue`, else the raw field. */
export function exportCellValue(row: TableRow, column: TableColumn): unknown {
  return column.exportValue ? column.exportValue(row) : row?.[column.name];
}

/** CSV text: a header row of column labels, then one line per row, lines ending in CRLF. */
export function toCsv(columns: TableColumn[], rows: TableRow[]): string {
  const lines = [
    columns.map(column => csvField(column.label || column.name)).join(','),
    ...rows.map(row =>
      columns.map(column => csvField(exportCellValue(row, column))).join(','),
    ),
  ];
  return `${lines.join('\r\n')}\r\n`;
}
