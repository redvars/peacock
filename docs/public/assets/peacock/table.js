import { i, A, b, _ as __decorate, I as IndividualComponent, a as i$1 } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { r } from './state-BCeDVCI9.js';
import { e as e$1 } from './query-CHb9Ft_d.js';
import { e } from './class-map-NDIkZErE.js';
import { c } from './repeat-D_ERDRYT.js';
import { I as I18nController } from './i18n-controller-DLJcJ5gO.js';
import { o } from './style-map-CHOg6N_R.js';
import { o as o$1 } from './unsafe-html-Cy_JqoPT.js';
import { w as writeClipboardText } from './clipboard-C7hBdUXP.js';
import { v as virtualWindow } from './virtual-window-5OYyIqZh.js';
import './base-Cl6v8-BZ.js';
import './directive-ZPhl09Yt.js';
import './directive-helpers-Bx3mu42O.js';
import './strings-MXyrGrNs.js';
import './locale-DEsJZCQG.js';

var css_248z = i`* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.screen-reader-only {
  position: absolute !important;
  inline-size: 1px !important;
  block-size: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip-path: inset(50%) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

[hidden] {
  display: none !important;
}

@media (forced-colors: active) {
  .selected,
  [aria-selected=true],
  [aria-pressed=true],
  [aria-checked=true],
  [aria-current]:not([aria-current=false]) {
    outline: 2px solid Highlight;
    outline-offset: -2px;
  }
  .disabled,
  [aria-disabled=true] {
    color: GrayText;
  }
}
:host {
  display: block;
  height: 100%;
  min-width: 0;
  --table-row-height: calc(3rem + var(--density, 0) * 0.25rem);
  --table-border-color: var(--color-outline-variant);
  --table-cell-padding-inline: var(--spacing-200, 1rem);
  --table-header-background: var(--color-surface, #fff);
  --table-background: var(--color-surface, #fff);
  --_table-checkbox-width: 3rem;
  --_table-edge-shadow: color-mix(
    in srgb,
    var(--color-shadow) 12%,
    transparent
  );
  --_table-edge-shadow-soft: color-mix(
    in srgb,
    var(--color-shadow) 4%,
    transparent
  );
}

:host([density=compact]) {
  --table-row-height: 2.25rem;
  --table-cell-padding-inline: var(--spacing-150, 0.75rem);
}

:host([density=comfortable]) {
  --table-row-height: 3.5rem;
}

.table {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--table-background);
  color: var(--color-on-surface);
  font-family: var(--typography-body-medium-font-family);
  font-size: var(--typography-body-medium-font-size);
  font-weight: var(--typography-body-medium-font-weight);
  line-height: var(--typography-body-medium-line-height);
  letter-spacing: var(--typography-body-medium-letter-spacing);
}

.table-scroll-container {
  contain: inline-size;
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  outline: none;
}

.row {
  --_cell-background: var(--table-background);
  display: flex;
  width: max-content;
  min-width: max(100%, var(--_row-min-width, 0rem));
}

.columns {
  display: flex;
}

.scroll-group {
  flex: 1 0 auto;
  isolation: isolate;
}

.pinned-group {
  position: sticky;
  z-index: 1;
  flex: none;
}

.pinned-group-start {
  inset-inline-start: 0;
}

.pinned-group-end {
  inset-inline-end: 0;
}

.cell {
  position: relative;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  min-width: 0;
  min-height: var(--table-row-height);
  padding-inline: var(--table-cell-padding-inline);
  background: var(--_cell-background);
  border-bottom: 1px solid var(--table-border-color);
}
.cell:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}
.cell.align-start {
  justify-content: flex-start;
  text-align: start;
}
.cell.align-center {
  justify-content: center;
  text-align: center;
}
.cell.align-end {
  justify-content: flex-end;
  text-align: end;
}
.cell.numeric {
  font-variant-numeric: tabular-nums;
}
.cell.cell-checkbox {
  width: var(--_table-checkbox-width);
  padding-inline: 0;
}
.cell.cell-menu, .cell.cell-expand {
  padding-inline: 0;
  justify-content: center;
}
.cell.editing {
  padding-inline: var(--spacing-050, 0.25rem);
}

.row-toggle {
  background: transparent;
  border: none;
  appearance: none;
  margin: 0;
  outline: none;
  padding: 0;
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  inline-size: 1.75rem;
  block-size: 1.75rem;
  border-radius: var(--shape-corner-full);
  color: var(--color-on-surface-variant);
  cursor: pointer;
}
.row-toggle wc-icon {
  --icon-size: 1.25rem;
  font-size: 1.25rem;
  transition: transform var(--duration-short4, 200ms) ease;
}
.row-toggle[aria-expanded=true] wc-icon {
  transform: rotate(90deg);
}
.row-toggle:dir(rtl) wc-icon {
  transform: scaleX(-1);
}
.row-toggle:dir(rtl)[aria-expanded=true] wc-icon {
  transform: rotate(90deg);
}
.row-toggle:hover {
  background: color-mix(in srgb, var(--color-on-surface) 8%, transparent);
}
.row-toggle:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

.body .detail-row {
  --_cell-background: var(
    --color-surface-container-lowest,
    var(--table-background)
  );
}

.detail-cell {
  flex: 1 0 auto;
  min-inline-size: 0;
  background: var(--_cell-background);
  border-bottom: 1px solid var(--table-border-color);
}

.detail-content {
  position: sticky;
  inset-inline-start: 0;
  padding: var(--spacing-200, 1rem) var(--table-cell-padding-inline);
}

.body .row.group-header-row {
  --_cell-background: var(--color-surface-container-low);
}
.body .row.group-header-row:hover {
  --_cell-background: var(--color-surface-container);
}

.group-header-cell {
  flex: 1 0 auto;
  padding-inline: var(--spacing-050, 0.25rem);
  font-family: var(--typography-label-large-font-family);
  font-size: var(--typography-label-large-font-size);
  font-weight: var(--typography-label-large-font-weight);
  line-height: var(--typography-label-large-line-height);
  letter-spacing: var(--typography-label-large-letter-spacing);
}
.body .group-header-cell.cell {
  cursor: default;
}

.group-header-content {
  position: sticky;
  inset-inline-start: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-100, 0.5rem);
  min-inline-size: 0;
}

.group-label {
  min-inline-size: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.group-count {
  flex: none;
  color: var(--color-on-surface-variant);
  font-variant-numeric: tabular-nums;
  font-family: var(--typography-body-small-font-family);
  font-size: var(--typography-body-small-font-size);
  font-weight: var(--typography-body-small-font-weight);
  line-height: var(--typography-body-small-line-height);
  letter-spacing: var(--typography-body-small-letter-spacing);
}

.aggregates {
  position: sticky;
  bottom: 0;
  z-index: 2;
}
.aggregates .row {
  --_cell-background: var(--color-surface-container-low);
}
.aggregates .cell {
  gap: var(--spacing-050, 0.25rem);
  font-variant-numeric: tabular-nums;
  border-top: 1px solid var(--table-border-color);
}

.aggregate-label {
  color: var(--color-on-surface-variant);
  font-family: var(--typography-label-small-font-family);
  font-size: var(--typography-label-small-font-size);
  font-weight: var(--typography-label-small-font-weight);
  line-height: var(--typography-label-small-line-height);
  letter-spacing: var(--typography-label-small-letter-spacing);
}

.cell-editor {
  display: flex;
  align-items: center;
  inline-size: 100%;
  min-inline-size: 0;
}
.cell-editor .editor {
  inline-size: 100%;
  min-inline-size: 0;
}
.cell-editor wc-checkbox.editor {
  inline-size: auto;
}

.is-virtual .body .row {
  block-size: var(--table-row-height);
}
.is-virtual .body .cell {
  box-sizing: border-box;
  min-block-size: 0;
  block-size: 100%;
}
.is-virtual .body .cell-text {
  padding-block: 0;
  white-space: nowrap;
}

.virtual-spacer {
  pointer-events: none;
}

.cell-text {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.wrap .cell-text {
  padding-block: var(--spacing-100, 0.5rem);
  white-space: normal;
  overflow-wrap: anywhere;
}

.cell-template {
  display: flex;
  align-items: center;
  min-width: 0;
  max-width: 100%;
}

.header {
  position: sticky;
  top: 0;
  z-index: 3;
}
.header .row {
  --_cell-background: var(--table-header-background);
}
.header .cell {
  color: var(--color-on-surface-variant);
  font-family: var(--typography-label-large-font-family);
  font-size: var(--typography-label-large-font-size);
  font-weight: var(--typography-label-large-font-weight);
  line-height: var(--typography-label-large-line-height);
  letter-spacing: var(--typography-label-large-letter-spacing);
}
.header .cell.sortable {
  padding-inline: 0;
}
.header .cell.sorted {
  color: var(--color-on-surface);
}
.header .cell.reorderable {
  cursor: grab;
}
.header .cell.dragging {
  opacity: 0.6;
  cursor: grabbing;
}
.header .cell.drop-target::before {
  content: "";
  position: absolute;
  inset-block: 0;
  inset-inline-start: 0;
  inline-size: 2px;
  background: var(--color-primary);
  pointer-events: none;
}
.header .group-cell {
  justify-content: flex-start;
}
.header .group-cell.has-group {
  color: var(--color-on-surface);
  box-shadow: inset 0 -2px 0 var(--color-outline-variant);
}
.header .group-cell.has-group, .header .group-cell.has-group + .group-cell {
  border-inline-start: 1px solid var(--table-border-color);
}
.header .group-cell:first-child {
  border-inline-start: 0;
}
.header .header-label {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.sort-button {
  background: transparent;
  border: none;
  appearance: none;
  margin: 0;
  outline: none;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: inherit;
  gap: var(--spacing-050, 0.25rem);
  align-self: stretch;
  width: 100%;
  min-width: 0;
  padding-inline: var(--table-cell-padding-inline);
  color: inherit;
  font: inherit;
  letter-spacing: inherit;
  text-align: inherit;
  cursor: pointer;
}
.align-end .sort-button {
  flex-direction: row-reverse;
  justify-content: flex-start;
}
.sort-button:hover {
  background: color-mix(in srgb, var(--color-on-surface) 6%, transparent);
}
.sort-button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

.sort-icon {
  flex: none;
  --icon-size: 1.125rem;
  font-size: 1.125rem;
  opacity: 0;
  transition: opacity var(--duration-short2, 100ms) ease;
}
.sort-button:hover .sort-icon, .sort-button:focus-visible .sort-icon {
  opacity: 0.6;
}
.sorted .sort-icon {
  opacity: 1;
}

.sort-priority {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-inline-size: 1rem;
  block-size: 1rem;
  padding-inline: var(--spacing-025, 0.125rem);
  border-radius: var(--shape-corner-full);
  background: var(--color-secondary-container);
  color: var(--color-on-secondary-container);
  font-family: var(--typography-label-small-font-family);
  font-size: var(--typography-label-small-font-size);
  font-weight: var(--typography-label-small-font-weight);
  line-height: var(--typography-label-small-line-height);
  letter-spacing: var(--typography-label-small-letter-spacing);
}

.resize-handle {
  position: absolute;
  inset-block: 0;
  inset-inline-end: 0;
  z-index: 1;
  inline-size: 0.5rem;
  cursor: col-resize;
  touch-action: none;
  outline: none;
}
.resize-handle::after {
  content: "";
  position: absolute;
  inset-block: 25%;
  inset-inline-end: 0;
  inline-size: 2px;
  background: var(--table-border-color);
  transition: background var(--duration-short2, 100ms) ease;
}
.resize-handle:hover::after, .resize-handle:focus-visible::after {
  inset-block: 0;
  background: var(--color-primary);
}
.resize-handle:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

.loading-bar {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  --progress-height: 2px;
}

.body .cell {
  cursor: pointer;
}
.body .cell.cell-checkbox, .body .cell.cell-menu {
  cursor: default;
}
.body .row:hover {
  --_cell-background: var(--color-surface-container-low);
}
.body .row.selected {
  --_cell-background: color-mix(
    in srgb,
    var(--color-secondary-container) 55%,
    var(--table-background)
  );
}
.body .row.selected > .columns:first-child > .cell:first-child {
  box-shadow: inset 2px 0 0 var(--color-primary);
}
.body .row.selected:hover {
  --_cell-background: var(--color-secondary-container);
}
.body .skeleton-row .cell {
  cursor: default;
}

.has-footer .body .row:last-child .cell {
  border-bottom-color: transparent;
}

:host([striped]) .body .row:nth-child(even):not(.selected) {
  --_cell-background: color-mix(
    in srgb,
    var(--color-surface-container) 45%,
    var(--table-background)
  );
}
:host([striped]) .body .row:nth-child(even):not(.selected):hover {
  --_cell-background: var(--color-surface-container-low);
}

.skeleton-bar {
  block-size: 0.75rem;
  max-inline-size: 100%;
  --skeleton-container-shape: var(--shape-corner-extra-small);
}
.cell-checkbox .skeleton-bar {
  inline-size: 1.125rem;
  block-size: 1.125rem;
}

.checkbox {
  display: flex;
}

.pinned-group-start::before,
.pinned-group-end::after {
  content: "";
  position: absolute;
  inset-block: 0;
  z-index: 1;
  inline-size: 1px;
  background: var(--table-border-color);
  pointer-events: none;
}

.pinned-group-start::before {
  inset-inline-end: 0;
}

.pinned-group-end::after {
  inset-inline-start: 0;
}

.pinned-group-start::after,
.pinned-group-end::before {
  content: "";
  position: absolute;
  inset-block: 0;
  inline-size: 1rem;
  background: linear-gradient(to right, var(--_table-edge-shadow) 0, var(--_table-edge-shadow-soft) 40%, transparent);
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--duration-short4, 200ms) ease;
}

.pinned-group-start::after {
  inset-inline-end: -1rem;
}

.pinned-group-end::before {
  inset-inline-start: -1rem;
  transform: scaleX(-1);
}

.pinned-group-start:dir(rtl)::after {
  transform: scaleX(-1);
}

.pinned-group-end:dir(rtl)::before {
  transform: none;
}

.scrolled-from-start .pinned-group-start::after,
.scrolled-from-end .pinned-group-end::before {
  opacity: 1;
}

.pinned-group-start > .cell:last-child .resize-handle:not(:hover, :focus-visible)::after,
.scroll-group:has(+ .pinned-group-end) > .cell:last-child .resize-handle:not(:hover, :focus-visible)::after {
  background: transparent;
}

.bulk-bar {
  position: absolute;
  top: 0;
  inset-inline: var(--_table-checkbox-width) 0;
}
.bulk-bar.below-groups {
  top: var(--table-row-height);
}
.bulk-bar {
  z-index: 4;
  display: flex;
  align-items: center;
  gap: var(--spacing-100, 0.5rem);
  height: var(--table-row-height);
  padding-inline: var(--spacing-100, 0.5rem) var(--spacing-100, 0.5rem);
  background: var(--color-secondary-container);
  color: var(--color-on-secondary-container);
  border-bottom: 1px solid var(--table-border-color);
  overflow-x: auto;
  scrollbar-width: none;
  white-space: nowrap;
  font-family: var(--typography-label-large-font-family);
  font-size: var(--typography-label-large-font-size);
  font-weight: var(--typography-label-large-font-weight);
  line-height: var(--typography-label-large-line-height);
  letter-spacing: var(--typography-label-large-letter-spacing);
}
.bulk-bar > *,
.bulk-bar ::slotted(*) {
  flex: none;
}

.bulk-count {
  padding-inline-start: var(--spacing-050, 0.25rem);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.bulk-spacer {
  flex: 1;
}

::slotted([slot=bulk-actions]) {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-050, 0.25rem);
}

.state-row {
  position: sticky;
  inset-inline-start: 0;
}

.empty-table,
.error-table {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 16rem;
  padding: var(--spacing-400, 2rem) var(--spacing-200, 1rem);
}
.empty-table .state-message,
.error-table .state-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-100, 0.5rem);
  max-inline-size: 24rem;
  text-align: center;
}
.empty-table .state-illustration,
.error-table .state-illustration {
  margin-block-end: var(--spacing-100, 0.5rem);
}
.empty-table .state-headline,
.error-table .state-headline {
  font-family: var(--typography-title-medium-font-family);
  font-size: var(--typography-title-medium-font-size);
  font-weight: var(--typography-title-medium-font-weight);
  line-height: var(--typography-title-medium-line-height);
  letter-spacing: var(--typography-title-medium-letter-spacing);
  margin: 0;
  color: var(--color-on-surface);
}
.empty-table .state-text,
.error-table .state-text {
  font-family: var(--typography-body-medium-font-family);
  font-size: var(--typography-body-medium-font-size);
  font-weight: var(--typography-body-medium-font-weight);
  line-height: var(--typography-body-medium-line-height);
  letter-spacing: var(--typography-body-medium-letter-spacing);
  margin: 0;
  color: var(--color-on-surface-variant);
}

.table-footer {
  flex: none;
  border-top: 1px solid var(--table-border-color);
}
.table-footer[hidden] {
  display: none;
}

.visually-hidden {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}`;

/** Width of a column without `width`, in rem. */
const DEFAULT_CELL_WIDTH = 16;
/** Width of the selection and column menu columns, in rem. */
const CONTROL_CELL_WIDTH = 3;
/** Smallest width resizing allows when the column sets no `minWidth`, in rem. */
const MIN_RESIZE_WIDTH = 3;
/** Width change of one arrow key press on a resize handle, in rem. */
const RESIZE_STEP = 1;
function emptyColumnState() {
    return { widths: {}, hidden: {}, order: [] };
}
function getPlacement(column) {
    if (column.fixed === true || column.fixed === 'start')
        return 'start';
    if (column.fixed === 'end')
        return 'end';
    return 'scroll';
}
function getAlign(column) {
    return column.align ?? (column.type === 'number' ? 'end' : 'start');
}
function positive(value) {
    const number = Number.parseFloat(String(value ?? ''));
    return Number.isFinite(number) && number > 0 ? number : undefined;
}
/** Keeps a width inside the column's `minWidth` and `maxWidth`. */
function clampWidth(column, width) {
    const min = positive(column.minWidth) ?? 0;
    const max = positive(column.maxWidth) ?? Number.POSITIVE_INFINITY;
    return Math.min(Math.max(width, min), Math.max(min, max));
}
/** The width a resize may set: inside `minWidth` (at least 3rem) and `maxWidth`. */
function clampResizeWidth(column, width) {
    const min = Math.max(positive(column.minWidth) ?? 0, MIN_RESIZE_WIDTH);
    const max = positive(column.maxWidth) ?? Number.POSITIVE_INFINITY;
    const clamped = Math.min(Math.max(width, min), Math.max(min, max));
    // Whole sixteenths of a rem keep event values readable.
    return Math.round(clamped * 16) / 16;
}
/** The column's width in rem: a resized width, else its `width`, else 16, kept inside min and max. */
function getColumnWidth(column, state) {
    const width = positive(state.widths[column.name]) ??
        positive(column.width) ??
        DEFAULT_CELL_WIDTH;
    return clampWidth(column, width);
}
function isColumnHidden(column, state) {
    return state.hidden[column.name] ?? !!column.hidden;
}
/** Every column in display order, hidden ones included. */
function orderColumns(columns, state) {
    if (!state.order.length)
        return [...columns];
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
function buildGridColumns(columns, state, options) {
    const start = [];
    const scroll = [];
    const end = [];
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
        if (isColumnHidden(column, state))
            return;
        const placement = getPlacement(column);
        const resized = state.widths[column.name] !== undefined;
        const entry = {
            kind: 'data',
            column,
            placement,
            width: getColumnWidth(column, state),
            grow: resized ? 0 : Math.max(0, Number(column.flex) || 0),
            minWidth: positive(column.minWidth),
            maxWidth: positive(column.maxWidth),
        };
        if (placement === 'start')
            start.push(entry);
        else if (placement === 'end')
            end.push(entry);
        else
            scroll.push(entry);
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
function totalWidth(columns) {
    return columns.reduce((total, entry) => total + entry.width, 0);
}
/**
 * The column group header row, or `undefined` when no visible column has a `group`. Neighbouring
 * columns with the same group and placement share a cell; other columns get an empty cell.
 */
function buildHeaderGroups(columns) {
    if (!columns.some(entry => entry.column?.group))
        return undefined;
    const cells = [];
    columns.forEach(entry => {
        const label = entry.column?.group ?? '';
        const previous = cells[cells.length - 1];
        if (label &&
            previous &&
            previous.label === label &&
            previous.placement === entry.placement) {
            previous.span += 1;
            previous.columns.push(entry);
        }
        else {
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
function moveColumnTo(columns, state, name, targetName) {
    const ordered = orderColumns(columns, state);
    const from = ordered.findIndex(entry => entry.name === name);
    const to = ordered.findIndex(entry => entry.name === targetName);
    if (from < 0 || to < 0 || from === to)
        return undefined;
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
function moveColumnBy(columns, state, name, delta) {
    const ordered = orderColumns(columns, state);
    const column = ordered.find(entry => entry.name === name);
    if (!column)
        return undefined;
    const placement = getPlacement(column);
    const siblings = ordered.filter(entry => getPlacement(entry) === placement && !isColumnHidden(entry, state));
    const target = siblings[siblings.indexOf(column) + delta];
    if (!target)
        return undefined;
    return moveColumnTo(columns, state, name, target.name);
}
/**
 * Carries the column state over to a new `columns` array: overrides for columns that are gone are
 * dropped, and so are overrides of a `width` or `hidden` the new configuration changed.
 */
function reconcileColumnState(state, previous, next) {
    const before = new Map((previous ?? []).map(column => [column.name, column]));
    const after = new Map((next ?? []).map(column => [column.name, column]));
    const widths = {};
    const hidden = {};
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

/**
 * The cell an arrow, Home or End key moves to, or `undefined` for any other key. In right-to-left
 * layouts the left and right arrows swap, so they follow what is on screen.
 */
function nextGridPosition(key, { row, col }, { lastRow, lastCol }, { ctrlKey = false, rtl = false } = {}) {
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
    const backward = rtl ? 'ArrowRight' : 'ArrowLeft';
    switch (key) {
        case forward:
            return { row, col: Math.min(col + 1, lastCol) };
        case backward:
            return { row, col: Math.max(col - 1, 0) };
        case 'ArrowDown':
            return { row: Math.min(row + 1, lastRow), col };
        case 'ArrowUp':
            return { row: Math.max(row - 1, 0), col };
        case 'Home':
            return { row: ctrlKey ? 0 : row, col: 0 };
        case 'End':
            return { row: ctrlKey ? lastRow : row, col: lastCol };
        default:
            return undefined;
    }
}
/** Keeps a position inside the grid after rows or columns went away. */
function clampGridPosition(position, { lastRow, lastCol }) {
    return {
        row: Math.min(position.row, Math.max(0, lastRow)),
        col: Math.min(position.col, Math.max(0, lastCol)),
    };
}
/** `1` for a key that moves towards the end of the row, `-1` towards the start, else `0`. */
function horizontalDirection(key, rtl) {
    if (key === 'ArrowRight')
        return rtl ? -1 : 1;
    if (key === 'ArrowLeft')
        return rtl ? 1 : -1;
    return 0;
}

/** Classes of a cell in any row. */
function cellClasses(entry, extra = {}) {
    const { column } = entry;
    return e({
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
function cellStyle(entries) {
    const list = Array.isArray(entries) ? entries : [entries];
    const width = list.reduce((total, entry) => total + entry.width, 0);
    const grow = list.reduce((total, entry) => total + entry.grow, 0);
    const single = list.length === 1 ? list[0] : undefined;
    return o({
        flex: `${grow} 0 ${width}rem`,
        width: `${width}rem`,
        'min-width': single?.minWidth !== undefined ? `${single.minWidth}rem` : undefined,
        'max-width': single?.maxWidth !== undefined ? `${single.maxWidth}rem` : undefined,
    });
}
/** Splits a row's cells into the start-pinned, scrolling and end-pinned groups. */
function renderRowGroups(items, renderCell) {
    const groups = {
        start: [],
        scroll: [],
        end: [],
    };
    items.forEach((item, index) => {
        groups[item.placement].push(renderCell(item, index));
    });
    return b `
    ${groups.start.length
        ? b `<div class="columns pinned-group pinned-group-start" role="none">
          ${groups.start}
        </div>`
        : A}
    <div class="columns scroll-group" role="none">${groups.scroll}</div>
    ${groups.end.length
        ? b `<div class="columns pinned-group pinned-group-end" role="none">
          ${groups.end}
        </div>`
        : A}
  `;
}
/** A data cell's content: the column template, or the field value as text. */
function renderCellContent(row, column) {
    if (column.template) {
        const content = column.template(row, column);
        return b `<div class="cell-template">
      ${typeof content === 'string' ? o$1(content) : content}
    </div>`;
    }
    const value = row?.[column.name];
    return b `<div class="cell-text" title=${value ?? ''}>${value}</div>`;
}
/** A column header's label: the header template, or the column label. Strings are text. */
function renderHeaderLabel(column) {
    const content = column.headerTemplate
        ? column.headerTemplate(column)
        : column.label;
    return b `<span class="header-label">${content}</span>`;
}

/**
 * The key of a row as a string. Keys from attributes are always strings, so a numeric `id` is
 * compared as `"1"`, not `1`.
 */
function getRowKey(row, keyField) {
    return String(row?.[keyField]);
}
/** Converts every key to a string; returns the same array when nothing changes. */
function normalizeKeys(keys) {
    const list = Array.isArray(keys) ? keys : [];
    return list.every(key => typeof key === 'string')
        ? list
        : list.map(key => String(key));
}
/** `keys` with `key` added or removed. */
function toggleKey(keys, key) {
    return keys.includes(key)
        ? keys.filter(selected => selected !== key)
        : [...keys, key];
}
/**
 * The selection after the select-all checkbox: every key in `pageKeys` when some are missing,
 * otherwise none of them. Keys outside `pageKeys` stay as they are.
 */
function togglePageKeys(keys, pageKeys) {
    const allSelected = pageKeys.length > 0 && pageKeys.every(key => keys.includes(key));
    return allSelected
        ? keys.filter(key => !pageKeys.includes(key))
        : [...new Set([...keys, ...pageKeys])];
}

const collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: 'base',
});
/** Compares numbers by value and everything else as text with natural number order. Empty values sort last. */
function compareValues(a, b) {
    if (a === b)
        return 0;
    if (a === undefined || a === null || a === '')
        return 1;
    if (b === undefined || b === null || b === '')
        return -1;
    if (typeof a === 'number' && typeof b === 'number')
        return a - b;
    return collator.compare(String(a), String(b));
}
/** A sorted copy of `rows`, by each sort level in turn. */
function sortRows(rows, sorts) {
    if (!sorts.length)
        return [...rows];
    return [...rows].sort((a, b) => {
        for (const { name, order } of sorts) {
            const result = compareValues(a?.[name], b?.[name]);
            if (result !== 0)
                return order === 'desc' ? -result : result;
        }
        return 0;
    });
}
/** The order after the next click: ascending, then descending, then unsorted. */
function nextOrder(order) {
    if (order === undefined)
        return 'asc';
    if (order === 'asc')
        return 'desc';
    return null;
}
/**
 * The sort levels after a header activation. A plain click sorts by this column only, cycling
 * ascending, descending and off. With `additive` (Shift), the column cycles in place and other
 * levels stay; a new column is added as the lowest level.
 */
function nextSorts(sorts, name, additive) {
    const current = sorts.find(sort => sort.name === name);
    const order = nextOrder(current?.order);
    if (!additive) {
        // A plain click on one of several levels starts over with this column.
        const plainOrder = sorts.length > 1 ? 'asc' : order;
        return plainOrder ? [{ name, order: plainOrder }] : [];
    }
    if (!current)
        return [...sorts, { name, order: 'asc' }];
    if (!order)
        return sorts.filter(sort => sort.name !== name);
    return sorts.map(sort => (sort.name === name ? { name, order } : sort));
}
/** Drops empty and repeated levels from a sorts list set by the consumer. */
function normalizeSorts(sorts) {
    const seen = new Set();
    const result = [];
    (sorts ?? []).forEach(sort => {
        if (!sort?.name || seen.has(sort.name))
            return;
        seen.add(sort.name);
        result.push({
            name: sort.name,
            order: sort.order === 'desc' ? 'desc' : 'asc',
        });
    });
    return result;
}

/** The column's values that are numbers, or strings that read as numbers. */
function numericValues(rows, name) {
    const values = [];
    rows.forEach(row => {
        const value = row?.[name];
        if (typeof value === 'number') {
            if (Number.isFinite(value))
                values.push(value);
        }
        else if (typeof value === 'string' && value.trim() !== '') {
            const number = Number(value);
            if (Number.isFinite(number))
                values.push(number);
        }
    });
    return values;
}
/**
 * A column's footer value over `rows`, or `undefined` when there is none (no aggregate, or no
 * numbers to sum). `count` counts the rows.
 */
function aggregateValue(rows, column) {
    const { aggregate } = column;
    if (!aggregate)
        return undefined;
    if (typeof aggregate === 'function')
        return aggregate(rows);
    if (aggregate === 'count')
        return rows.length;
    const values = numericValues(rows, column.name);
    if (!values.length)
        return undefined;
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

/** The editor of a column: its `editor`, else `"number"` for number columns, else `"text"`. */
function editorKind(column) {
    return column.editor ?? (column.type === 'number' ? 'number' : 'text');
}
/**
 * True for editors whose `change` is a pick (an option, a date, a toggle) that commits the edit.
 * Text and number editors commit on Enter or when focus leaves.
 */
function commitsOnChange(kind) {
    return kind === 'select' || kind === 'date' || kind === 'checkbox';
}
function toNumber(value) {
    if (typeof value === 'number')
        return Number.isFinite(value) ? value : undefined;
    if (typeof value === 'string' && value.trim() !== '') {
        const number = Number(value);
        return Number.isFinite(number) ? number : undefined;
    }
    return undefined;
}
function toText(value) {
    return value === undefined || value === null ? '' : String(value);
}
/** The field that edits a cell holding `value`, named `label` for assistive technology. */
function renderEditor(column, value, label) {
    switch (editorKind(column)) {
        case 'number':
            return b `<wc-number-field
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
            return b `<wc-select
        class="editor"
        size="sm"
        aria-label=${label}
        .options=${column.options ?? []}
        .value=${toText(value)}
        ?required=${!!column.required}
      ></wc-select>`;
        case 'date':
            return b `<wc-date-field
        class="editor"
        size="sm"
        aria-label=${label}
        .value=${toText(value)}
        .min=${typeof column.min === 'string' ? column.min : ''}
        .max=${typeof column.max === 'string' ? column.max : ''}
        ?required=${!!column.required}
      ></wc-date-field>`;
        case 'checkbox':
            return b `<wc-checkbox
        class="editor"
        aria-label=${label}
        .checked=${!!value}
        ?required=${!!column.required}
      ></wc-checkbox>`;
        default:
            return b `<wc-input
        class="editor"
        size="sm"
        aria-label=${label}
        .value=${toText(value)}
        ?required=${!!column.required}
      ></wc-input>`;
    }
}
/** The value in an editor: a boolean for checkboxes, a number (or undefined) for numbers. */
function readEditorValue(editor, kind) {
    if (kind === 'checkbox')
        return !!editor.checked;
    if (kind === 'number')
        return toNumber(editor.value);
    return toText(editor.value);
}

/** The text a value becomes in a CSV cell, before quoting. */
function csvText(value) {
    if (value === undefined || value === null)
        return '';
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? '' : value.toISOString();
    }
    if (typeof value === 'object') {
        try {
            return JSON.stringify(value);
        }
        catch {
            return String(value);
        }
    }
    return String(value);
}
/** One CSV field, quoted as RFC 4180 asks when it holds a quote, comma or line break. */
function csvField(value) {
    const text = csvText(value);
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
/** The value a column exports for a row: `exportValue`, else the raw field. */
function exportCellValue(row, column) {
    return column.exportValue ? column.exportValue(row) : row?.[column.name];
}
/** CSV text: a header row of column labels, then one line per row, lines ending in CRLF. */
function toCsv(columns, rows) {
    const lines = [
        columns.map(column => csvField(column.label || column.name)).join(','),
        ...rows.map(row => columns.map(column => csvField(exportCellValue(row, column))).join(',')),
    ];
    return `${lines.join('\r\n')}\r\n`;
}

/** The group key of a value: the value as a string, `''` for `undefined` and `null`. */
function groupKeyOf(value) {
    return value === undefined || value === null ? '' : String(value);
}
/**
 * Splits rows into groups by `field`. Groups are ordered by value (`asc` or `desc`, empty values
 * last), or by first appearance with `"appearance"`. Rows keep their order inside a group.
 */
function groupRows(rows, field, order) {
    const groups = new Map();
    rows.forEach(row => {
        const value = row?.[field];
        const key = groupKeyOf(value);
        const group = groups.get(key);
        if (group)
            group.rows.push(row);
        else
            groups.set(key, { key, value, rows: [row] });
    });
    const list = [...groups.values()];
    if (order === 'appearance')
        return list;
    return list.sort((a, b) => {
        const empty = (group) => group.key === '';
        if (empty(a) !== empty(b))
            return empty(a) ? 1 : -1;
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
function buildDisplayItems(rows, options) {
    const { keyField, groups, collapsed, expanded, start, end } = options;
    const items = [];
    let ariaRowIndex = options.firstAriaRowIndex;
    let navRow = 0;
    const addRows = (list, first) => {
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
    }
    else {
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
            if (isExpanded)
                addRows(group.rows, first);
            first = last;
        });
    }
    return { items, count: ariaRowIndex - options.firstAriaRowIndex };
}

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
const VIEW_STABLE_STATES = new Set([
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
function remSize() {
    return (Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16);
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
let Table = class Table extends i$1 {
    constructor() {
        // ── Static ───────────────────────────────────────────────────────────────
        super(...arguments);
        // ── Properties ───────────────────────────────────────────────────────────
        /**
         * Grid columns configuration. Each column can have: name, label, width, minWidth, maxWidth
         * and flex (rem and grow factor), fixed, align, type, sortable, wrap, hidden, hideable,
         * resizable, reorderable, group, headerTemplate, template; editable, editor, options,
         * required, min, max, step and validate for inline editing; exportValue; aggregate.
         */
        this.columns = [];
        /**
         * Grid data to display on table.
         */
        this.data = [];
        /**
         * How rows are selected: `none` (default), `single` (one row, with radio buttons) or
         * `multiple` (checkboxes, a select-all checkbox and the selection bar).
         */
        this.selection = 'none';
        /**
         * Keys of the selected rows. Keys are compared as strings, so a numeric `id` of `1` matches
         * `"1"`.
         */
        this.selectedRowKeys = [];
        /**
         * The field name used as the unique key for each row. Defaults to `"id"`.
         */
        this.keyField = 'id';
        /**
         * If true, sorting and pagination are managed externally (controlled mode): the table shows
         * `data` as given and only reports `sort` and page changes.
         */
        this.managed = false;
        /**
         * If true, columns are sortable. Defaults to `true`.
         */
        this.sortable = true;
        /**
         * The field name currently used for sorting (the primary sort).
         */
        this.sortBy = '';
        /**
         * The current sort order. Possible values are `"asc"` and `"desc"`. Defaults to `"asc"`.
         */
        this.sortOrder = 'asc';
        /**
         * Every sort level, primary first, as `{ name, order }`. Shift+click on a header adds a level.
         * Kept in step with `sort-by` and `sort-order`, which describe the first level.
         */
        this.sorts = [];
        /**
         * Lets the user resize columns by dragging the header edges or with the arrow keys on the
         * focused handle. A column's own `resizable` overrides it.
         */
        this.resizable = false;
        /**
         * Lets the user move columns by dragging a header or with Alt+Left/Right. Pinned columns move
         * only among the columns pinned to the same edge. A column's own `reorderable` overrides it.
         */
        this.reorderable = false;
        /**
         * Adds a column menu button at the end of the header that shows or hides columns.
         */
        this.columnMenu = false;
        /**
         * The current page number (1-based). Defaults to `1`. Follows a slotted `wc-pagination`.
         */
        this.page = 1;
        /**
         * The number of rows per page. Defaults to `10`. Follows a slotted `wc-pagination`.
         */
        this.pageSize = 10;
        /**
         * Row height: `compact`, `default` or `comfortable`. Defaults to `default`.
         */
        this.density = 'default';
        /**
         * Shades every other row.
         */
        this.striped = false;
        /**
         * Shows a loading state: skeleton rows while there is no data, otherwise a progress bar
         * under the header so the current rows stay readable.
         */
        this.loading = false;
        /**
         * Shows an error in place of the rows, for example when loading failed. Announced politely.
         */
        this.error = false;
        /**
         * Text of the error state. Defaults to Peacock's `tableErrorDescription` string.
         */
        this.errorText = '';
        /**
         * Accessible name of the table.
         */
        this.label = '';
        /**
         * Headline text shown when the table has no data. Defaults to Peacock's `noItems` string
         * (`"No items"`).
         */
        this.emptyStateHeadline = '';
        /**
         * Description text shown when the table has no data. Defaults to Peacock's
         * `noItemsDescription` string (`"There are no items to display"`).
         */
        this.emptyStateDescription = '';
        /** Keys of the rows whose details are shown. Keys are compared as strings. */
        this.expandedRowKeys = [];
        /**
         * Groups the rows by this field under collapsible header rows. Groups are ordered by value
         * (descending when the table is sorted descending by this field); sorting applies within
         * groups. In managed mode, groups keep the order the rows come in.
         */
        this.groupBy = '';
        /** Keys of the collapsed groups: their `group-by` values as strings (`""` for empty values). */
        this.collapsedGroups = [];
        /**
         * Renders only the rows in view (plus a few on each side), for large `data` without
         * pagination. Every row must have the same height, `--table-row-height`; cells do not wrap.
         * Give the table a height. Has no effect with `detailTemplate`.
         */
        this.virtual = false;
        /** Rows the footer aggregates cover: `all` rows (default) or the current `page`. */
        this.aggregateScope = 'all';
        // ── States ───────────────────────────────────────────────────────────────
        /** True when every item across all pages is selected, not only the current page. */
        this.allPagesSelected = false;
        /** True when content is scrolled under the start-pinned columns. */
        this.scrolledFromStart = false;
        /** True when more content waits past the end-pinned columns. */
        this.scrolledFromEnd = false;
        /** The cell that holds the grid's single tab stop. Row 0 is the column header row. */
        this.activeCell = { row: 0, col: 0 };
        /** Column widths, visibility and order changed in the table. */
        this.columnState = emptyColumnState();
        /** The `wc-pagination` in the footer slot, if any. */
        this.slottedPagination = null;
        /** True when the footer slot has content. */
        this.hasFooterContent = false;
        /** The column being dragged to a new place. */
        this.dragColumn = '';
        /** The column a dragged column would be dropped on. */
        this.dropTarget = '';
        /** True while the column menu is open. */
        this.columnMenuOpen = false;
        /** Text for screen readers, for example after a column moved. */
        this.announcement = '';
        /** Scroll offset of the virtual body, in pixels. */
        this.virtualScrollTop = 0;
        // ── Private fields ───────────────────────────────────────────────────────
        /** Set when a keyboard move must focus the active cell after the next render. */
        this.pendingFocus = false;
        /** Peacock's strings and the locale counts are formatted in. */
        this.i18n = new I18nController(this);
        /** The selected keys, for quick lookups while rendering. */
        this.selectedKeys = new Set();
        /** Swallows the click that ends a drag, so it does not also sort. */
        this.suppressClick = false;
        /** Prefix of the ids in the shadow root (detail rows). */
        this.idPrefix = `wc-table-${(tableCount += 1)}`;
        /** Set when the open editor must take focus after the next render. */
        this.pendingEditorFocus = false;
        /** Set while an edit updates `data`, which must not reset the selection. */
        this.applyingEdit = false;
        /** Measured height of a virtual row, in pixels. */
        this.virtualRowHeight = 0;
        /** Measured height a virtual body shows rows in, in pixels. */
        this.virtualViewport = 0;
        // Pagination
        /** A slotted pagination's page event: followed, and left to bubble to the consumer. */
        this.onSlottedPage = (event) => {
            const { detail } = event;
            if (!detail || typeof detail.page !== 'number')
                return;
            this.page = detail.page;
            this.pageSize = detail.pageSize;
        };
        this.onFooterSlotChange = (event) => {
            const slot = event.target;
            const elements = slot.assignedElements({ flatten: true });
            this.hasFooterContent = elements.length > 0;
            let pagination = null;
            for (const element of elements) {
                const found = element.localName === 'wc-pagination'
                    ? element
                    : element.querySelector('wc-pagination');
                if (found) {
                    pagination = found;
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
        this.onScrollContainer = () => {
            this.updateScrollEdges();
            if (this.isVirtual && this.scrollContainer) {
                this.virtualScrollTop = this.scrollContainer.scrollTop;
            }
        };
        this.onGridFocusIn = (event) => {
            const cell = event.target.closest('[data-cell]');
            if (!cell)
                return;
            const row = Number(cell.dataset.row);
            const col = Number(cell.dataset.col);
            if (row !== this.activeCell.row || col !== this.activeCell.col) {
                this.activeCell = { row, col };
            }
        };
        this.onGridKeydown = (event) => {
            const target = event.target;
            const cell = target.closest('[data-cell]');
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
            const next = nextGridPosition(event.key, { row, col }, {
                lastRow: this.getView().navItems.length,
                lastCol: columns.length - 1,
            }, { ctrlKey: event.ctrlKey, rtl });
            if (!next) {
                this.onCellKeydown(event, row, col, entry, cell);
                return;
            }
            event.preventDefault();
            // A group header is one cell: moving along it keeps the column for the rows around it.
            if (cell.hasAttribute('data-group') && next.row === row)
                return;
            if (this.isVirtual)
                this.scrollRowIntoView(next.row);
            this.activeCell = next;
            // The cell may already be active (an edge was reached): then there is nothing to focus.
            this.pendingFocus = next.row !== row || next.col !== col;
        };
        this.onWindowPointerMove = (event) => {
            const resize = this.resizeSession;
            if (resize) {
                const column = this.columns.find(entry => entry.name === resize.name);
                if (!column)
                    return;
                const delta = ((event.clientX - resize.startX) * (resize.rtl ? -1 : 1)) / remSize();
                resize.width = clampResizeWidth(column, resize.startWidth + delta);
                this.setColumnWidth(resize.name, resize.width);
                return;
            }
            const drag = this.dragSession;
            if (!drag)
                return;
            if (!drag.active &&
                Math.abs(event.clientX - drag.startX) > DRAG_THRESHOLD) {
                drag.active = true;
                this.dragColumn = drag.name;
            }
            if (drag.active) {
                const target = this.findDropTarget(event.clientX, drag.name);
                this.dropTarget = target === drag.name ? '' : target;
            }
        };
        this.onWindowPointerUp = (event) => {
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
            }
            else if (drag?.active) {
                swallowClick = true;
                const target = this.dropTarget || this.findDropTarget(event.clientX, drag.name);
                const column = this.columns.find(entry => entry.name === drag.name);
                const order = target && column
                    ? moveColumnTo(this.columns, this.columnState, drag.name, target)
                    : undefined;
                if (order && column)
                    this.applyColumnOrder(order, column);
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
        this.onColumnMenuButtonClick = (event) => {
            const menu = this.columnMenuElement;
            if (!menu)
                return;
            menu.anchorElement = event.currentTarget;
            menu.toggle();
        };
        this.onColumnMenuActivate = (event) => {
            event.stopPropagation();
            const { item } = event.detail;
            const column = (this.columns ?? []).find(entry => entry.name === item?.value);
            if (!column)
                return;
            const hidden = !item.selected;
            if (isColumnHidden(column, this.columnState) === hidden)
                return;
            this.columnState = {
                ...this.columnState,
                hidden: { ...this.columnState.hidden, [column.name]: hidden },
            };
            this.dispatch('column-visibility', { name: column.name, hidden });
        };
        this.onColumnMenuOpenChange = (event) => {
            // The table's own menu is an implementation detail: keep its events inside.
            event.stopPropagation();
            if (event.type === 'open')
                this.columnMenuOpen = true;
            if (event.type === 'close')
                this.columnMenuOpen = false;
        };
    }
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
    willUpdate(changed) {
        if (changed.has('selectedRowKeys')) {
            const keys = normalizeKeys(this.selectedRowKeys);
            if (keys !== this.selectedRowKeys)
                this.selectedRowKeys = keys;
            this.selectedKeys = new Set(keys);
        }
        if (changed.has('expandedRowKeys')) {
            const keys = normalizeKeys(this.expandedRowKeys);
            if (keys !== this.expandedRowKeys)
                this.expandedRowKeys = keys;
        }
        if (changed.has('collapsedGroups')) {
            const keys = normalizeKeys(this.collapsedGroups);
            if (keys !== this.collapsedGroups)
                this.collapsedGroups = keys;
        }
        // Rows may have changed in place (for example `data.push()` and requestUpdate()): only
        // internal states that never change them keep the memoised view.
        if (changed.size === 0 ||
            [...changed.keys()].some(name => !VIEW_STABLE_STATES.has(name))) {
            this.viewCache = undefined;
        }
        if (changed.has('columns') && this.hasUpdated) {
            this.columnState = reconcileColumnState(this.columnState, changed.get('columns'), this.columns ?? []);
        }
        this.syncSorts(changed);
        if (!Number.isFinite(this.page) || this.page < 1) {
            this.page = 1;
        }
        // Filtering the data can leave the current page past the end.
        // An empty data set (for example before the first load) keeps the requested page.
        if (this.isPaging &&
            !this.managed &&
            (changed.has('data') || changed.has('pageSize')) &&
            this.data?.length) {
            const lastPage = Math.max(1, Math.ceil((this.data?.length ?? 0) / this.pageSize));
            if (this.page > lastPage)
                this.page = lastPage;
        }
        if (changed.has('data') && !this.managed && !this.applyingEdit) {
            this.allPagesSelected = false;
        }
        this.applyingEdit = false;
        // An edit ends when its row or column goes away.
        const editing = this.editingCell;
        if (editing &&
            (!this.findRecord(editing.key) ||
                !(this.columns ?? []).some(column => column.name === editing.column))) {
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
    updated(changed) {
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
    exportCsv(options = {}) {
        const view = this.getView();
        const rows = options.allRows ? view.rows : view.pageRows;
        const all = this.columns ?? [];
        const columns = options.columns
            ? options.columns.flatMap(name => {
                const column = all.find(entry => entry.name === name);
                return column ? [column] : [];
            })
            : this.getGridColumns().flatMap(entry => entry.column ? [entry.column] : []);
        return toCsv(columns, rows);
    }
    /** Downloads `exportCsv(options)` as a file named `options.filename` (default `table.csv`). */
    downloadCsv(options = {}) {
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
    get selectionMode() {
        return this.selection === 'single' || this.selection === 'multiple'
            ? this.selection
            : 'none';
    }
    /** True when rows are split into pages. */
    get isPaging() {
        return !!this.slottedPagination;
    }
    /** Rows above the data rows: the column header row, plus the column group row. */
    get headerRowCount() {
        return this.getHeaderGroups() ? 2 : 1;
    }
    /** True when the body renders only the rows in view. */
    get isVirtual() {
        return this.virtual && !this.detailTemplate;
    }
    /** Keeps `sorts` and `sort-by`/`sort-order` describing the same primary sort. */
    syncSorts(changed) {
        if (changed.has('sorts') &&
            (this.hasUpdated || (this.sorts?.length ?? 0) > 0)) {
            const sorts = normalizeSorts(this.sorts);
            if (sorts.length !== this.sorts?.length)
                this.sorts = sorts;
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
    getGridColumns() {
        return buildGridColumns(this.columns ?? [], this.columnState, {
            select: this.selectionMode !== 'none',
            menu: this.columnMenu,
            expand: !!this.detailTemplate,
        });
    }
    getHeaderGroups(columns = this.getGridColumns()) {
        return buildHeaderGroups(columns);
    }
    isColumnSortable(column) {
        return this.sortable && column.sortable !== false;
    }
    isColumnResizable(column) {
        return column.resizable ?? this.resizable;
    }
    isColumnReorderable(column) {
        return column.reorderable ?? this.reorderable;
    }
    isRowSelectableNow(row) {
        return this.isRowSelectable ? this.isRowSelectable(row) !== false : true;
    }
    isRtl() {
        return getComputedStyle(this).direction === 'rtl';
    }
    /** Total item count across pages, or `undefined` when it is unknown. */
    getTotalItems() {
        if (!this.managed)
            return this.data?.length ?? 0;
        return this.slottedPagination?.totalItems ?? undefined;
    }
    /** The rows, memoised while the inputs they come from stay the same. */
    getView() {
        const deps = [
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
    computeView() {
        let rows = [...(this.data ?? [])];
        if (!this.managed && this.sortable && this.sorts?.length) {
            rows = sortRows(rows, this.sorts);
        }
        let groups;
        if (this.groupBy) {
            const level = this.sortable
                ? this.sorts?.find(sort => sort.name === this.groupBy)
                : undefined;
            groups = groupRows(rows, this.groupBy, this.managed ? 'appearance' : (level?.order ?? 'asc'));
            rows = groups.flatMap(group => group.rows);
        }
        const paged = !this.managed && this.isPaging;
        const start = paged ? (this.page - 1) * this.pageSize : 0;
        const end = paged ? this.page * this.pageSize : rows.length;
        const expanded = new Set(this.detailTemplate ? normalizeKeys(this.expandedRowKeys) : []);
        const collapsed = new Set(this.groupBy ? normalizeKeys(this.collapsedGroups) : []);
        // In managed mode `data` is one page: count on from the rows of earlier pages.
        const offset = this.managed && this.isPaging ? (this.page - 1) * this.pageSize : 0;
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
    getPageRows() {
        return this.getView().pageRows;
    }
    /** The group header or data row at navigation row `row` (1 for the first body row). */
    getNavItem(row) {
        return row > 0 ? this.getView().navItems[row - 1] : undefined;
    }
    /** True when a visible column has a footer aggregate. */
    hasAggregates() {
        return this.getGridColumns().some(entry => !!entry.column?.aggregate);
    }
    /** `aria-rowcount`: header rows plus every body and footer row, or -1 when it is unknown. */
    getAriaRowCount(hasRows) {
        const headerRows = this.headerRowCount;
        if (!hasRows)
            return headerRows + (this.loading && !this.error ? 0 : 1);
        const footerRows = this.hasAggregates() ? 1 : 0;
        if (!this.managed || !this.isPaging) {
            return headerRows + this.getView().itemCount + footerRows;
        }
        const total = this.getTotalItems();
        return total === undefined ? -1 : headerRows + total + footerRows;
    }
    findRecord(key) {
        return (this.data ?? []).find(row => getRowKey(row, this.keyField) === key);
    }
    detailId(key) {
        return `${this.idPrefix}-detail-${encodeURIComponent(key)}`;
    }
    dispatch(name, detail) {
        this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
    }
    // Sorting
    onSortActivate(column, additive) {
        if (this.suppressClick)
            return;
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
    selectableKeys(rows) {
        return rows
            .filter(row => this.isRowSelectableNow(row))
            .map(row => getRowKey(row, this.keyField));
    }
    onSelectAllClick(pageRows) {
        const next = togglePageKeys(this.selectedRowKeys, this.selectableKeys(pageRows));
        this.allPagesSelected = false;
        this.onSelectChange(next, pageRows);
    }
    onRowSelect(row, pageRows) {
        if (!row || !this.isRowSelectableNow(row))
            return;
        const key = getRowKey(row, this.keyField);
        let next;
        if (this.selectionMode === 'single') {
            if (this.selectedKeys.has(key) && this.selectedRowKeys.length === 1) {
                return;
            }
            next = [key];
        }
        else {
            next = toggleKey(this.selectedRowKeys, key);
        }
        this.allPagesSelected = false;
        this.onSelectChange(next, pageRows);
    }
    selectAllPages(pageRows) {
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
    clearSelection() {
        this.allPagesSelected = false;
        this.onSelectChange([], this.getPageRows());
    }
    onSelectChange(selectedRowKeys, pageRows) {
        this.selectedRowKeys = selectedRowKeys;
        this.selectedKeys = new Set(selectedRowKeys);
        const pageKeys = this.selectableKeys(pageRows);
        const isSelectAll = pageKeys.length > 0 && pageKeys.every(key => this.selectedKeys.has(key));
        this.dispatch('selection-change', {
            value: this.selectedRowKeys,
            isSelectAll,
            allPages: this.allPagesSelected,
        });
    }
    // Row details and groups
    toggleRow(key) {
        const expanded = !this.getView().expanded.has(key);
        const keys = normalizeKeys(this.expandedRowKeys);
        this.expandedRowKeys = expanded
            ? [...keys, key]
            : keys.filter(entry => entry !== key);
        this.dispatch('row-expand', { key, expanded });
    }
    toggleGroup(group) {
        const expanded = this.getView().collapsed.has(group);
        const keys = normalizeKeys(this.collapsedGroups);
        this.collapsedGroups = expanded
            ? keys.filter(entry => entry !== group)
            : [...keys, group];
        this.dispatch('group-toggle', { group, expanded });
    }
    // Inline editing
    isCellEditable(column) {
        return !!column?.editable;
    }
    isEditing(key, column) {
        const editing = this.editingCell;
        return (!!editing &&
            !!column &&
            editing.key === key &&
            editing.column === column.name);
    }
    startEdit(key, column, row, col) {
        if (!this.isCellEditable(column))
            return;
        this.editingCell = { key, column: column.name };
        this.activeCell = { row, col };
        this.pendingEditorFocus = true;
    }
    getEditor() {
        return this.renderRoot.querySelector('.cell-editor .editor');
    }
    async focusEditor() {
        const editor = this.getEditor();
        if (!editor)
            return;
        await editor.updateComplete;
        editor.focus();
    }
    /** Ends the edit; with `restoreFocus`, focus goes back to the cell. */
    endEdit(restoreFocus) {
        this.editingCell = undefined;
        if (restoreFocus)
            this.pendingFocus = true;
    }
    cancelEdit(restoreFocus) {
        if (!this.editingCell)
            return;
        this.endEdit(restoreFocus);
    }
    /**
     * Commits the open editor. An invalid value keeps the editor open with its message. A new
     * value fires `cell-edit`; unless that is cancelled or the table is managed, the row in
     * `data` is replaced by a copy with the new value.
     */
    commitEdit(restoreFocus) {
        const editing = this.editingCell;
        if (!editing)
            return;
        const editor = this.getEditor();
        const record = this.findRecord(editing.key);
        const column = (this.columns ?? []).find(entry => entry.name === editing.column);
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
        if (Object.is(value, oldValue))
            return;
        const detail = {
            key: editing.key,
            column: column.name,
            value,
            oldValue,
            record,
        };
        const applied = this.dispatchEvent(new CustomEvent('cell-edit', {
            detail,
            bubbles: true,
            composed: true,
            cancelable: true,
        }));
        if (!applied || this.managed)
            return;
        this.applyingEdit = true;
        this.data = (this.data ?? []).map(row => row === record ? { ...row, [column.name]: value } : row);
    }
    onEditorKeydown(event) {
        // A field that used the key itself (an open select list or date picker) has the say.
        if (event.defaultPrevented)
            return;
        if (event.key === 'Enter') {
            event.preventDefault();
            this.commitEdit(true);
        }
        else if (event.key === 'Escape') {
            event.preventDefault();
            this.cancelEdit(true);
        }
    }
    onEditorChange(event, column) {
        // The editor's events are the table's business, not the consumer's.
        event.stopPropagation();
        if (event.type !== 'change' || !commitsOnChange(editorKind(column)))
            return;
        const editor = this.getEditor();
        const active = this.renderRoot.activeElement;
        this.commitEdit(!!editor && active === editor);
    }
    onEditorFocusOut() {
        const editing = this.editingCell;
        // Wait for focus to land: a field moves it inside itself, for example into its popup.
        setTimeout(() => {
            if (this.editingCell !== editing)
                return;
            const editor = this.getEditor();
            const active = this.renderRoot.activeElement;
            if (editor && active && editor.contains(active))
                return;
            this.commitEdit(false);
        });
    }
    // Cells
    onCellClick(row, col, evt) {
        const selection = window.getSelection();
        if (selection?.type === 'Range')
            return;
        this.dispatchCellEvents(row, col, evt);
    }
    dispatchCellEvents(row, col, evt) {
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
    /** Measures the row height and the space for rows of a virtual body. */
    measureVirtual() {
        const container = this.scrollContainer;
        if (!this.isVirtual || !container)
            return;
        const header = this.renderRoot.querySelector('.header');
        const footer = this.renderRoot.querySelector('.aggregates');
        const row = this.renderRoot.querySelector('.body .row[data-key], .body .group-header-row');
        const rowHeight = row?.getBoundingClientRect().height ?? 0;
        const viewport = Math.max(0, container.clientHeight -
            (header?.offsetHeight ?? 0) -
            (footer?.offsetHeight ?? 0));
        let changed = false;
        if (rowHeight > 0 && Math.abs(rowHeight - this.virtualRowHeight) > 0.5) {
            this.virtualRowHeight = rowHeight;
            changed = true;
        }
        if (viewport !== this.virtualViewport) {
            this.virtualViewport = viewport;
            changed = true;
        }
        if (changed)
            this.requestUpdate();
    }
    /** Scrolls a virtual body so navigation row `row` is in view. */
    scrollRowIntoView(row) {
        const container = this.scrollContainer;
        if (!container || row < 1)
            return;
        const index = this.getView().items.findIndex(item => item.navRow === row);
        if (index < 0)
            return;
        const rowHeight = this.virtualRowHeight || FALLBACK_ROW_HEIGHT;
        const viewport = this.virtualViewport || container.clientHeight;
        const top = index * rowHeight;
        let { scrollTop } = container;
        if (top < scrollTop)
            scrollTop = top;
        else if (top + rowHeight > scrollTop + viewport) {
            scrollTop = top + rowHeight - viewport;
        }
        if (scrollTop !== container.scrollTop)
            container.scrollTop = scrollTop;
        this.virtualScrollTop = container.scrollTop;
    }
    updateScrollEdges() {
        const el = this.scrollContainer;
        if (!el)
            return;
        // scrollLeft is negative in right-to-left layouts; the magnitude is what matters.
        const scrolled = Math.abs(el.scrollLeft);
        this.scrolledFromStart = scrolled > 0;
        this.scrolledFromEnd = scrolled + el.clientWidth < el.scrollWidth - 1;
    }
    getCell(row, col) {
        return (this.renderRoot.querySelector(`[data-cell][data-row="${row}"][data-col="${col}"]`) ?? null);
    }
    /** The element that takes focus for a cell: its sort or menu button, or the cell itself. */
    getFocusTarget(row, col) {
        const cell = this.getCell(row, col);
        return cell?.querySelector('[data-focus-target]') ?? cell;
    }
    /** The navigation row holding the tab stop. */
    get tabRow() {
        return this.tabRowOverride ?? this.activeCell.row;
    }
    tabIndexFor(row, col) {
        return this.tabRow === row && this.activeCell.col === col ? '0' : '-1';
    }
    /** The tab index of a one-cell row (a group header), whichever column is active. */
    tabIndexForRow(row) {
        return this.tabRow === row ? '0' : '-1';
    }
    /** Sort and reorder keys on a data column header. Returns true when the key was handled. */
    onHeaderKeydown(event, entry, rtl) {
        const { column } = entry;
        if (!column)
            return false;
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
    onCellKeydown(event, row, col, entry, cell) {
        const item = this.getNavItem(row);
        if (!item)
            return;
        const isToggleKey = event.key === 'Enter' || event.key === ' ';
        if (item.kind === 'group') {
            if (isToggleKey) {
                event.preventDefault();
                this.toggleGroup(item.group.key);
            }
            return;
        }
        if (item.kind !== 'data')
            return;
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
                }
                else if (column && event.key === 'Enter') {
                    this.dispatchCellEvents(item.row, column, event);
                }
                break;
            case 'c':
            case 'C':
                if (event.ctrlKey || event.metaKey) {
                    writeClipboardText(cell.innerText).catch(() => { });
                }
                break;
        }
    }
    // Column reorder
    applyColumnOrder(order, moved) {
        this.columnState = { ...this.columnState, order };
        this.dispatch('column-reorder', { order: [...order] });
        const columns = this.getGridColumns();
        const index = columns.findIndex(entry => entry.column === moved);
        if (index >= 0) {
            const visible = columns.filter(entry => entry.kind === 'data');
            this.announcement = this.i18n.t('columnMoved')(moved.label || moved.name, String(visible.indexOf(columns[index]) + 1), String(visible.length));
        }
        return index;
    }
    moveColumn(column, direction) {
        const order = moveColumnBy(this.columns ?? [], this.columnState, column.name, direction);
        if (!order)
            return;
        const index = this.applyColumnOrder(order, column);
        if (index >= 0) {
            this.activeCell = { row: 0, col: index };
            this.pendingFocus = true;
        }
    }
    onHeaderPointerDown(event, entry) {
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
    findDropTarget(clientX, name) {
        const source = this.renderRoot.querySelector(`.header-row [data-name="${CSS.escape(name)}"]`);
        const placement = source?.dataset.placement;
        const headers = this.renderRoot.querySelectorAll('.header-row [data-name]');
        for (const header of headers) {
            const rect = header.getBoundingClientRect();
            if (header.dataset.placement === placement &&
                clientX >= rect.left &&
                clientX <= rect.right) {
                return header.dataset.name ?? '';
            }
        }
        return '';
    }
    // Column resize
    setColumnWidth(name, width) {
        if (this.columnState.widths[name] === width)
            return;
        this.columnState = {
            ...this.columnState,
            widths: { ...this.columnState.widths, [name]: width },
        };
    }
    /** The rendered width of a column in rem. */
    measureColumn(name, fallback) {
        const header = this.renderRoot.querySelector(`.header-row [data-name="${CSS.escape(name)}"]`);
        const width = header?.getBoundingClientRect().width ?? 0;
        return width > 0 ? width / remSize() : fallback;
    }
    onResizePointerDown(event, entry) {
        const { column } = entry;
        if (event.button !== 0 || !column)
            return;
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
    onResizeKeydown(event, entry) {
        const { column } = entry;
        if (!column)
            return;
        const direction = horizontalDirection(event.key, this.isRtl());
        if (direction === 0)
            return;
        event.preventDefault();
        event.stopPropagation();
        const current = this.measureColumn(column.name, entry.width);
        const width = clampResizeWidth(column, current + direction * RESIZE_STEP);
        this.setColumnWidth(column.name, width);
        this.dispatch('column-resize', { name: column.name, width });
    }
    // Pointer sessions (resize and drag)
    startPointerSession() {
        window.addEventListener('pointermove', this.onWindowPointerMove);
        window.addEventListener('pointerup', this.onWindowPointerUp);
        window.addEventListener('pointercancel', this.onWindowPointerUp);
    }
    endPointerSession() {
        window.removeEventListener('pointermove', this.onWindowPointerMove);
        window.removeEventListener('pointerup', this.onWindowPointerUp);
        window.removeEventListener('pointercancel', this.onWindowPointerUp);
        this.resizeSession = undefined;
        this.dragSession = undefined;
        this.dragColumn = '';
        this.dropTarget = '';
    }
    // ── Render helpers ───────────────────────────────────────────────────────
    renderGroupRow(columns) {
        const groups = this.getHeaderGroups(columns);
        if (!groups)
            return A;
        return b `
      <div
        class="row group-row"
        role="row"
        aria-rowindex="1"
        style="--_row-min-width: ${totalWidth(columns)}rem"
      >
        ${renderRowGroups(groups, group => b `
            <div
              class=${e({
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
          `)}
      </div>
    `;
    }
    renderSelectAllHeader(entry, index, pageRows) {
        if (this.selectionMode === 'single') {
            return b `
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
        const selectedOnPage = pageKeys.filter(key => this.selectedKeys.has(key)).length;
        const allOnPage = pageKeys.length > 0 && selectedOnPage === pageKeys.length;
        return b `
      <div
        class=${cellClasses(entry)}
        style=${cellStyle(entry)}
        role="columnheader"
        data-cell
        data-row="0"
        data-col=${index}
        tabindex=${this.tabIndexFor(0, index)}
        aria-label=${this.i18n.t('selectAllRowsOnPage')}
        @keydown=${(event) => {
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
          @change=${(event) => {
            event.stopPropagation();
            this.onSelectAllClick(pageRows);
        }}
        ></wc-checkbox>
      </div>
    `;
    }
    renderColumnMenuHeader(entry, index) {
        return b `
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
    renderSortButton(column, index) {
        const sorts = this.sorts ?? [];
        const position = sorts.findIndex(sort => sort.name === column.name);
        const sort = sorts[position];
        const showPriority = sort && sorts.length > 1;
        let icon = 'swap_vert';
        if (sort)
            icon = sort.order === 'desc' ? 'arrow_downward' : 'arrow_upward';
        return b `
      <button
        type="button"
        class="sort-button"
        data-focus-target
        tabindex=${this.tabIndexFor(0, index)}
        @click=${(event) => this.onSortActivate(column, event.shiftKey)}
      >
        ${renderHeaderLabel(column)}
        <wc-icon
          class="sort-icon"
          aria-hidden="true"
          name=${icon}
        ></wc-icon>
        ${showPriority
            ? b `<span class="sort-priority" aria-hidden="true"
                >${position + 1}</span
              ><span class="visually-hidden"
                >${this.i18n.t('sortPriority')(String(position + 1), sort.order === 'asc')}</span
              >`
            : A}
      </button>
    `;
    }
    renderResizeHandle(entry, index) {
        const column = entry.column;
        const width = Math.round(entry.width * 10) / 10;
        const min = Math.max(entry.minWidth ?? 0, MIN_RESIZE_WIDTH);
        return b `
      <div
        class="resize-handle"
        role="separator"
        aria-orientation="vertical"
        aria-label=${this.i18n.t('resizeColumn')(column.label || column.name)}
        aria-valuenow=${width}
        aria-valuemin=${min}
        aria-valuemax=${entry.maxWidth ?? A}
        tabindex=${this.tabIndexFor(0, index)}
        @pointerdown=${(event) => this.onResizePointerDown(event, entry)}
        @keydown=${(event) => this.onResizeKeydown(event, entry)}
      ></div>
    `;
    }
    /** One column header. */
    renderHeaderCell(entry, index, pageRows) {
        if (entry.kind === 'select') {
            return this.renderSelectAllHeader(entry, index, pageRows);
        }
        if (entry.kind === 'menu')
            return this.renderColumnMenuHeader(entry, index);
        if (entry.kind === 'expand') {
            return b `
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
        const column = entry.column;
        const sortable = this.isColumnSortable(column);
        const primary = this.sorts?.[0];
        const sorted = (this.sorts ?? []).some(sort => sort.name === column.name);
        let ariaSort;
        if (sortable) {
            // ARIA allows one sorted header: the primary sort. Other levels say so in text.
            if (primary?.name !== column.name)
                ariaSort = 'none';
            else
                ariaSort = primary.order === 'asc' ? 'ascending' : 'descending';
        }
        const resizable = this.isColumnResizable(column);
        const reorderable = this.isColumnReorderable(column);
        return b `
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
        aria-sort=${ariaSort ?? A}
        data-cell
        data-row="0"
        data-col=${index}
        data-name=${column.name}
        data-placement=${entry.placement}
        tabindex=${sortable ? A : this.tabIndexFor(0, index)}
        @pointerdown=${(event) => this.onHeaderPointerDown(event, entry)}
      >
        ${sortable
            ? this.renderSortButton(column, index)
            : renderHeaderLabel(column)}
        ${resizable ? this.renderResizeHandle(entry, index) : A}
      </div>
    `;
    }
    renderHeader(columns, pageRows) {
        return b `
      <div class="header" role="rowgroup">
        ${this.renderGroupRow(columns)}
        <div
          class="row header-row"
          role="row"
          aria-rowindex=${this.headerRowCount}
          style="--_row-min-width: ${totalWidth(columns)}rem"
        >
          ${renderRowGroups(columns, (entry, index) => this.renderHeaderCell(entry, index, pageRows))}
        </div>
        ${this.loading && pageRows.length && !this.error
            ? b `<wc-linear-progress
              class="loading-bar"
              indeterminate
              aria-label=${this.i18n.t('loading')}
            ></wc-linear-progress>`
            : A}
      </div>
    `;
    }
    /** The selection control cell of a row. */
    renderSelectCell(entry, index, row, ctx) {
        const label = this.i18n.t('selectRow');
        const onChange = (event) => {
            event.stopPropagation();
            this.onRowSelect(row, ctx.pageRows);
        };
        return b `
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
            ? b `<wc-radio
              class="checkbox"
              tabindex="-1"
              aria-label=${label}
              .checked=${ctx.selected}
              ?disabled=${!ctx.selectable}
              @change=${onChange}
            ></wc-radio>`
            : b `<wc-checkbox
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
    renderExpandCell(entry, index, ctx) {
        // A native button: aria-controls must point at the detail row in this shadow root.
        return b `
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
          aria-controls=${ctx.expanded ? this.detailId(ctx.key) : A}
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
    renderCellEditor(row, column) {
        const onEvent = (event) => this.onEditorChange(event, column);
        return b `<div
      class="cell-editor"
      @keydown=${this.onEditorKeydown}
      @focusout=${this.onEditorFocusOut}
      @input=${onEvent}
      @change=${onEvent}
      @click=${(event) => event.stopPropagation()}
      @dblclick=${(event) => event.stopPropagation()}
    >
      ${renderEditor(column, row?.[column.name], column.label || column.name)}
    </div>`;
    }
    /** One cell of a data row. */
    renderBodyCell(entry, index, row, ctx) {
        if (entry.kind === 'select')
            return this.renderSelectCell(entry, index, row, ctx);
        if (entry.kind === 'expand')
            return this.renderExpandCell(entry, index, ctx);
        const { column } = entry;
        const editable = this.isCellEditable(column);
        const editing = editable && this.isEditing(ctx.key, column);
        let content = A;
        if (column) {
            content = editing
                ? this.renderCellEditor(row, column)
                : renderCellContent(row, column);
        }
        // Enter on a cell is handled by the grid's keydown listener.
        /* eslint-disable lit-a11y/click-events-have-key-events */
        return b `
      <div
        class=${cellClasses(entry, { editable, editing })}
        style=${cellStyle(entry)}
        role="gridcell"
        data-cell
        data-row=${ctx.gridRow}
        data-col=${index}
        tabindex=${this.tabIndexFor(ctx.gridRow, index)}
        @click=${(evt) => {
            if (column)
                this.onCellClick(row, column, evt);
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
    renderRow(row, ctx) {
        const multiselect = this.selectionMode !== 'none';
        return b `
      <div
        class=${e({
            row: true,
            selected: ctx.selected,
            unselectable: multiselect && !ctx.selectable,
            expanded: ctx.expanded,
        })}
        role="row"
        aria-rowindex=${ctx.ariaRowIndex}
        aria-selected=${multiselect ? String(ctx.selected) : A}
        aria-disabled=${multiselect && !ctx.selectable ? 'true' : A}
        data-key=${ctx.key}
        style="--_row-min-width: ${totalWidth(ctx.columns)}rem"
      >
        ${renderRowGroups(ctx.columns, (entry, index) => this.renderBodyCell(entry, index, row, ctx))}
      </div>
    `;
    }
    /** The detail row under an expanded row: one cell across every column. */
    renderDetailRow(item, columns) {
        const content = this.detailTemplate?.(item.row);
        return b `
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
          <div class="detail-content">${content ?? A}</div>
        </div>
      </div>
    `;
    }
    /** A group header: one cell across every column with the toggle, label and row count. */
    renderGroupHeaderRow(item, columns) {
        const { group, expanded, navRow } = item;
        const name = group.key === '' ? this.i18n.t('emptyGroup') : group.key;
        const count = group.rows.length;
        const label = this.groupTemplate
            ? this.groupTemplate(group.key, group.rows)
            : name;
        // The cell carries the active column, so Up and Down through it keep the column.
        return b `
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
              >${this.i18n.t('groupRowCount')(new Intl.NumberFormat(this.i18n.locale).format(count), count)}</span
            >
          </div>
        </div>
      </div>
    `;
    }
    renderBodyItem(item, columns, pageRows) {
        if (item.kind === 'group')
            return this.renderGroupHeaderRow(item, columns);
        if (item.kind === 'detail')
            return this.renderDetailRow(item, columns);
        const selectable = this.selectionMode !== 'none';
        const ctx = {
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
    renderBodyRows(columns, view) {
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
        const spacer = (rows) => rows > 0
            ? b `<div
            class="virtual-spacer"
            role="none"
            style="block-size: ${rows * rowHeight}px"
          ></div>`
            : A;
        return b `${spacer(start)}${c(shown, item => `${item.kind}:${item.kind === 'group' ? item.group.key : item.key}`, item => this.renderBodyItem(item, columns, view.pageRows))}${spacer(items.length - end)}`;
    }
    renderBody(columns, view) {
        return b `<div class="body" role="rowgroup">
      ${this.renderBodyRows(columns, view)}
    </div>`;
    }
    /** The footer row of column aggregates, after the body. */
    renderAggregateRow(columns, view, ariaRowIndex) {
        if (!this.hasAggregates())
            return A;
        const rows = this.aggregateScope === 'page' ? view.pageRows : view.rows;
        const numberFormat = new Intl.NumberFormat(this.i18n.locale);
        const labels = {
            sum: this.i18n.t('aggregateSum'),
            avg: this.i18n.t('aggregateAvg'),
            min: this.i18n.t('aggregateMin'),
            max: this.i18n.t('aggregateMax'),
            count: this.i18n.t('aggregateCount'),
        };
        return b `
      <div class="aggregates" role="rowgroup">
        <div
          class="row aggregate-row"
          role="row"
          aria-rowindex=${ariaRowIndex > 0 ? ariaRowIndex : A}
          style="--_row-min-width: ${totalWidth(columns)}rem"
        >
          ${renderRowGroups(columns, entry => {
            const { column } = entry;
            const value = column ? aggregateValue(rows, column) : undefined;
            const label = typeof column?.aggregate === 'string'
                ? labels[column.aggregate]
                : '';
            return b `
              <div
                class=${cellClasses(entry)}
                style=${cellStyle(entry)}
                role="gridcell"
              >
                ${value === undefined
                ? A
                : b `${label
                    ? b `<span class="aggregate-label">${label}</span>`
                    : A}<span class="aggregate-value"
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
    renderSkeletonBody(columns) {
        const count = this.isPaging ? Math.min(this.pageSize, 10) : SKELETON_ROWS;
        return b `
      <div class="body" role="rowgroup" aria-hidden="true">
        ${Array.from({ length: count }, (_, rowIndex) => b `
            <div
              class="row skeleton-row"
              role="row"
              style="--_row-min-width: ${totalWidth(columns)}rem"
            >
              ${renderRowGroups(columns, (entry, index) => b `
                  <div
                    class=${cellClasses(entry)}
                    style=${cellStyle(entry)}
                    role="gridcell"
                  >
                    ${entry.kind === 'menu'
            ? A
            : b `<wc-skeleton
                          class="skeleton-bar"
                          visible
                          style=${entry.column
                ? `inline-size: ${40 + ((rowIndex * 7 + index * 13) % 45)}%`
                : A}
                        ></wc-skeleton>`}
                  </div>
                `)}
            </div>
          `)}
      </div>
    `;
    }
    /** A full-width row in place of the data: the empty or the error state. */
    renderStateRow(columns, kind, content) {
        return b `
      <div class="body" role="rowgroup">
        <div
          class="state-row"
          role="row"
          aria-rowindex=${this.headerRowCount + 1}
        >
          <div
            class=${e({
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
    renderStateMessage(illustration, headline, text) {
        return b `<div class="state-message" part="state-message">
      <wc-illustration
        class="state-illustration"
        name=${illustration}
        size="sm"
      ></wc-illustration>
      <p class="state-headline">${headline}</p>
      <p class="state-text">${text}</p>
    </div>`;
    }
    renderEmptyState(columns) {
        return this.renderStateRow(columns, 'empty', b `<slot name="empty"
        >${this.renderStateMessage('empty', this.emptyStateHeadline || this.i18n.t('noItems'), this.emptyStateDescription || this.i18n.t('noItemsDescription'))}</slot
      >`);
    }
    renderErrorState(columns) {
        return this.renderStateRow(columns, 'error', b `<slot name="error"
        >${this.renderStateMessage('error', this.i18n.t('tableError'), this.errorText || this.i18n.t('tableErrorDescription'))}</slot
      >`);
    }
    renderBulkBar(pageRows) {
        if (this.selectionMode !== 'multiple')
            return A;
        const count = this.selectedRowKeys.length;
        if (count === 0)
            return A;
        const total = this.getTotalItems();
        const shownCount = this.allPagesSelected && total !== undefined ? total : count;
        const pageKeys = this.selectableKeys(pageRows);
        const pageFullySelected = pageKeys.length > 0 && pageKeys.every(key => this.selectedKeys.has(key));
        const canSelectAllPages = this.isPaging &&
            !this.allPagesSelected &&
            pageFullySelected &&
            total !== undefined &&
            total > count;
        const numberFormat = new Intl.NumberFormat(this.i18n.locale);
        return b `
      <div
        class=${e({
            'bulk-bar': true,
            // Over the column labels, below the column group row when there is one.
            'below-groups': !!this.getHeaderGroups(),
        })}
        role="region"
        aria-label=${this.i18n.t('selection')}
      >
        <span class="bulk-count" aria-live="polite"
          >${this.i18n.t('selectedCount')(numberFormat.format(shownCount))}</span
        >
        ${canSelectAllPages
            ? b `<wc-button
              class="bulk-select-all"
              variant="text"
              size="sm"
              @click=${() => this.selectAllPages(pageRows)}
              >${this.i18n.t('selectAllCount')(numberFormat.format(total ?? 0))}</wc-button
            >`
            : A}
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
    renderColumnMenu() {
        if (!this.columnMenu)
            return A;
        const ordered = orderColumns(this.columns ?? [], this.columnState);
        const visibleCount = ordered.filter(column => !isColumnHidden(column, this.columnState)).length;
        return b `
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
            return b `
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
    renderFooter() {
        return b `
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
        if (this.error)
            body = this.renderErrorState(columns);
        else if (hasRows) {
            body = b `${this.renderBody(columns, view)}${this.renderAggregateRow(columns, view, ariaRowCount)}`;
        }
        else if (this.loading)
            body = this.renderSkeletonBody(columns);
        else
            body = this.renderEmptyState(columns);
        return b `
      <div
        class=${e({
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
          aria-label=${this.label || A}
          aria-busy=${this.loading ? 'true' : A}
          aria-multiselectable=${this.selectionMode === 'multiple'
            ? 'true'
            : A}
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
};
Table.styles = [css_248z];
__decorate([
    n({ type: Array })
], Table.prototype, "columns", void 0);
__decorate([
    n({ type: Array })
], Table.prototype, "data", void 0);
__decorate([
    n({ type: String })
], Table.prototype, "selection", void 0);
__decorate([
    n({ type: Array, attribute: 'selected-row-keys' })
], Table.prototype, "selectedRowKeys", void 0);
__decorate([
    n({ attribute: false })
], Table.prototype, "isRowSelectable", void 0);
__decorate([
    n({ type: String, attribute: 'key-field' })
], Table.prototype, "keyField", void 0);
__decorate([
    n({ type: Boolean })
], Table.prototype, "managed", void 0);
__decorate([
    n({ type: Boolean })
], Table.prototype, "sortable", void 0);
__decorate([
    n({ type: String, attribute: 'sort-by' })
], Table.prototype, "sortBy", void 0);
__decorate([
    n({ type: String, attribute: 'sort-order' })
], Table.prototype, "sortOrder", void 0);
__decorate([
    n({ type: Array })
], Table.prototype, "sorts", void 0);
__decorate([
    n({ type: Boolean })
], Table.prototype, "resizable", void 0);
__decorate([
    n({ type: Boolean })
], Table.prototype, "reorderable", void 0);
__decorate([
    n({ type: Boolean, attribute: 'column-menu' })
], Table.prototype, "columnMenu", void 0);
__decorate([
    n({ type: Number })
], Table.prototype, "page", void 0);
__decorate([
    n({ type: Number, attribute: 'page-size' })
], Table.prototype, "pageSize", void 0);
__decorate([
    n({ type: String, reflect: true })
], Table.prototype, "density", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Table.prototype, "striped", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Table.prototype, "loading", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Table.prototype, "error", void 0);
__decorate([
    n({ type: String, attribute: 'error-text' })
], Table.prototype, "errorText", void 0);
__decorate([
    n({ type: String })
], Table.prototype, "label", void 0);
__decorate([
    n({ type: String, attribute: 'empty-state-headline' })
], Table.prototype, "emptyStateHeadline", void 0);
__decorate([
    n({ type: String, attribute: 'empty-state-description' })
], Table.prototype, "emptyStateDescription", void 0);
__decorate([
    n({ attribute: false })
], Table.prototype, "detailTemplate", void 0);
__decorate([
    n({ type: Array, attribute: 'expanded-row-keys' })
], Table.prototype, "expandedRowKeys", void 0);
__decorate([
    n({ type: String, attribute: 'group-by' })
], Table.prototype, "groupBy", void 0);
__decorate([
    n({ type: Array, attribute: 'collapsed-groups' })
], Table.prototype, "collapsedGroups", void 0);
__decorate([
    n({ attribute: false })
], Table.prototype, "groupTemplate", void 0);
__decorate([
    n({ type: Boolean })
], Table.prototype, "virtual", void 0);
__decorate([
    n({ type: String, attribute: 'aggregate-scope' })
], Table.prototype, "aggregateScope", void 0);
__decorate([
    n({ attribute: false })
], Table.prototype, "strings", void 0);
__decorate([
    r()
], Table.prototype, "allPagesSelected", void 0);
__decorate([
    r()
], Table.prototype, "scrolledFromStart", void 0);
__decorate([
    r()
], Table.prototype, "scrolledFromEnd", void 0);
__decorate([
    r()
], Table.prototype, "activeCell", void 0);
__decorate([
    r()
], Table.prototype, "columnState", void 0);
__decorate([
    r()
], Table.prototype, "slottedPagination", void 0);
__decorate([
    r()
], Table.prototype, "hasFooterContent", void 0);
__decorate([
    r()
], Table.prototype, "dragColumn", void 0);
__decorate([
    r()
], Table.prototype, "dropTarget", void 0);
__decorate([
    r()
], Table.prototype, "columnMenuOpen", void 0);
__decorate([
    r()
], Table.prototype, "announcement", void 0);
__decorate([
    r()
], Table.prototype, "editingCell", void 0);
__decorate([
    r()
], Table.prototype, "virtualScrollTop", void 0);
__decorate([
    e$1('.table-scroll-container')
], Table.prototype, "scrollContainer", void 0);
__decorate([
    e$1('.column-menu')
], Table.prototype, "columnMenuElement", void 0);
Table = __decorate([
    IndividualComponent
], Table);

export { Table };
//# sourceMappingURL=table.js.map
