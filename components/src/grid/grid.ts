import { html, LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './grid.scss';
import IndividualComponent from '@/IndividualComponent.js';
import type { SpacingStep } from '../stack/spacing.js';

export type GridAlign = 'start' | 'center' | 'end' | 'stretch';

/**
 * @label Grid
 * @tag wc-grid
 * @rawTag grid
 * @summary Lays out its children in a CSS grid of equal columns, or as many columns as fit.
 * @overview
 * <p>The grid is a CSS grid container: the element itself has <code>display: grid</code>, so its
 * children are the grid items, with no wrapper between them.</p>
 * <p>The columns come from two attributes that combine rather than exclude each other:</p>
 * <ul>
 *   <li><code>columns="3"</code> alone: three equal columns at every width.</li>
 *   <li><code>min-column-width="12rem"</code> alone: as many columns as fit, each at least that
 *   wide (<code>auto-fill</code>); one column when the grid is narrower than that.</li>
 *   <li>Both: as many as fit at that minimum width, but never more than <code>columns</code>.</li>
 * </ul>
 * <p>Without either, the grid has one column (the CSS default) and only spaces its rows.</p>
 * <p><code>gap</code>, <code>row-gap</code> and <code>column-gap</code> take a step of the spacing
 * token scale, as on <code>wc-stack</code> (<code>gap="200"</code> is
 * <code>var(--spacing-200)</code>); <code>row-gap</code> and <code>column-gap</code> override
 * <code>gap</code> on their axis. <code>align</code> sets <code>align-items</code> and
 * <code>justify</code> sets <code>justify-items</code>.</p>
 * <p>An item spans columns or rows with plain CSS on the item: <code>style="grid-column: span
 * 2"</code>, or <code>grid-column: 1 / -1</code> for a full-width row.</p>
 *
 * @slot - The grid items.
 *
 * @example
 * ```html
 * <wc-grid columns="4" min-column-width="12rem" gap="200">
 *   <wc-card>One</wc-card>
 *   <wc-card style="grid-column: span 2">Two, twice as wide</wc-card>
 *   <wc-card>Three</wc-card>
 * </wc-grid>
 * ```
 *
 * @tags layout
 */
@IndividualComponent
export class Grid extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static override styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /**
   * Number of equal columns; with `min-column-width`, the most columns the grid shows.
   */
  @property({ type: Number, reflect: true }) columns?: number;

  /**
   * Minimum width of a column, as a CSS length (for example `12rem`). The grid shows as many
   * columns as fit, capped by `columns` when that is set.
   */
  @property({ type: String, reflect: true, attribute: 'min-column-width' })
  minColumnWidth?: string;

  /** Space between rows and columns, as a step of the spacing token scale. */
  @property({ type: String, reflect: true }) gap?: SpacingStep;

  /** Space between rows, as a step of the spacing token scale. Overrides `gap`. */
  @property({ type: String, reflect: true, attribute: 'row-gap' })
  rowGap?: SpacingStep;

  /** Space between columns, as a step of the spacing token scale. Overrides `gap`. */
  @property({ type: String, reflect: true, attribute: 'column-gap' })
  columnGap?: SpacingStep;

  /** Block-axis alignment of the items in their cells (`align-items`). */
  @property({ type: String, reflect: true }) align?: GridAlign;

  /** Inline-axis alignment of the items in their cells (`justify-items`). */
  @property({ type: String, reflect: true }) justify?: GridAlign;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  protected override willUpdate(changed: PropertyValues<this>) {
    if (changed.has('columns')) {
      const columns = Math.floor(Number(this.columns));
      if (Number.isFinite(columns) && columns >= 1) {
        this.style.setProperty('--_columns', String(columns));
      } else {
        this.style.removeProperty('--_columns');
      }
    }
    if (changed.has('minColumnWidth')) {
      if (this.minColumnWidth) {
        this.style.setProperty('--_min-column-width', this.minColumnWidth);
      } else {
        this.style.removeProperty('--_min-column-width');
      }
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  override render() {
    return html`<slot></slot>`;
  }
}
