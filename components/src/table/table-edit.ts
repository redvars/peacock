import { html } from 'lit';
import type { TemplateResult } from 'lit';

import type { TableColumn, TableEditor } from './table-types.js';

/** The Peacock field an editor renders, as the table talks to it. */
export interface EditorElement extends HTMLElement {
  value?: unknown;
  checked?: boolean;
  updateComplete?: Promise<unknown>;
  checkValidity?(): boolean;
  reportValidity?(): boolean;
  setCustomValidity?(message: string): void;
}

/** The editor of a column: its `editor`, else `"number"` for number columns, else `"text"`. */
export function editorKind(column: TableColumn): TableEditor {
  return column.editor ?? (column.type === 'number' ? 'number' : 'text');
}

/**
 * True for editors whose `change` is a pick (an option, a date, a toggle) that commits the edit.
 * Text and number editors commit on Enter or when focus leaves.
 */
export function commitsOnChange(kind: TableEditor): boolean {
  return kind === 'select' || kind === 'date' || kind === 'checkbox';
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number')
    return Number.isFinite(value) ? value : undefined;
  if (typeof value === 'string' && value.trim() !== '') {
    const number = Number(value);
    return Number.isFinite(number) ? number : undefined;
  }
  return undefined;
}

function toText(value: unknown): string {
  return value === undefined || value === null ? '' : String(value);
}

/** The field that edits a cell holding `value`, named `label` for assistive technology. */
export function renderEditor(
  column: TableColumn,
  value: unknown,
  label: string,
): TemplateResult {
  switch (editorKind(column)) {
    case 'number':
      return html`<wc-number-field
        class="editor"
        size="sm"
        aria-label=${label}
        .value=${toNumber(value)}
        .min=${toNumber(column.min)}
        .max=${toNumber(column.max)}
        .step=${column.step}
        ?required=${!!column.required}
      ></wc-number-field>`;
    case 'select':
      return html`<wc-select
        class="editor"
        size="sm"
        aria-label=${label}
        .options=${column.options ?? []}
        .value=${toText(value)}
        ?required=${!!column.required}
      ></wc-select>`;
    case 'date':
      return html`<wc-date-field
        class="editor"
        size="sm"
        aria-label=${label}
        .value=${toText(value)}
        .min=${typeof column.min === 'string' ? column.min : ''}
        .max=${typeof column.max === 'string' ? column.max : ''}
        ?required=${!!column.required}
      ></wc-date-field>`;
    case 'checkbox':
      return html`<wc-checkbox
        class="editor"
        aria-label=${label}
        .checked=${!!value}
        ?required=${!!column.required}
      ></wc-checkbox>`;
    default:
      return html`<wc-input
        class="editor"
        size="sm"
        aria-label=${label}
        .value=${toText(value)}
        ?required=${!!column.required}
      ></wc-input>`;
  }
}

/** The value in an editor: a boolean for checkboxes, a number (or undefined) for numbers. */
export function readEditorValue(
  editor: EditorElement,
  kind: TableEditor,
): unknown {
  if (kind === 'checkbox') return !!editor.checked;
  if (kind === 'number') return toNumber(editor.value);
  return toText(editor.value);
}
