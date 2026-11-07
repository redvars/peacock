import { html, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import { getAlign } from './table-columns.js';
import type {
  ColumnPlacement,
  GridColumn,
  TableColumn,
  TableRow,
} from './table-types.js';

/** Classes of a cell in any row. */
export function cellClasses(
  entry: GridColumn,
  extra: Record<string, boolean> = {},
) {
  const { column } = entry;
  return classMap({
    cell: true,
    'cell-checkbox': entry.kind === 'select',
    'cell-expand': entry.kind === 'expand',
    'cell-menu': entry.kind === 'menu',
    [`align-${column ? getAlign(column) : 'center'}`]: true,
    numeric: column?.type === 'number',
    wrap: !!column?.wrap,
    ...extra,
  });
}

/** Flex sizing of a cell, or of a group header cell over `entries`. */
export function cellStyle(entries: GridColumn | GridColumn[]) {
  const list = Array.isArray(entries) ? entries : [entries];
  const width = list.reduce((total, entry) => total + entry.width, 0);
  const grow = list.reduce((total, entry) => total + entry.grow, 0);
  const single = list.length === 1 ? list[0] : undefined;
  return styleMap({
    flex: `${grow} 0 ${width}rem`,
    width: `${width}rem`,
    'min-width':
      single?.minWidth !== undefined ? `${single.minWidth}rem` : undefined,
    'max-width':
      single?.maxWidth !== undefined ? `${single.maxWidth}rem` : undefined,
  });
}

/** Splits a row's cells into the start-pinned, scrolling and end-pinned groups. */
export function renderRowGroups<T extends { placement: ColumnPlacement }>(
  items: T[],
  renderCell: (item: T, index: number) => TemplateResult,
) {
  const groups: Record<ColumnPlacement, TemplateResult[]> = {
    start: [],
    scroll: [],
    end: [],
  };
  items.forEach((item, index) => {
    groups[item.placement].push(renderCell(item, index));
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

/** A data cell's content: the column template, or the field value as text. */
export function renderCellContent(row: TableRow, column: TableColumn) {
  if (column.template) {
    const content = column.template(row, column);
    return html`<div class="cell-template">
      ${typeof content === 'string' ? unsafeHTML(content) : content}
    </div>`;
  }
  const value = row?.[column.name];
  return html`<div class="cell-text" title=${value ?? ''}>${value}</div>`;
}

/** A column header's label: the header template, or the column label. Strings are text. */
export function renderHeaderLabel(column: TableColumn) {
  const content = column.headerTemplate
    ? column.headerTemplate(column)
    : column.label;
  return html`<span class="header-label">${content}</span>`;
}
