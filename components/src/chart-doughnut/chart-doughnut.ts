import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import { ChartPie } from '../chart-pie/chart-pie.js';

export type {
  ChartPieItem,
  ChartSelectDetail,
  ChartValueFormatter,
} from '../chart-pie/chart-pie.js';

/**
 * @label Doughnut Chart
 * @tag wc-chart-doughnut
 * @rawTag chart-doughnut
 * @summary A pie chart with a hole that shows the total, or the hovered slice, in its centre.
 * @tags charts
 *
 * @example
 * ```html
 * <wc-chart-doughnut label="Visitors by browser" center-label="Visitors"></wc-chart-doughnut>
 * <script>
 *   document.querySelector('wc-chart-doughnut').data = [
 *     { name: 'chrome', label: 'Chrome', value: 275 },
 *     { name: 'safari', label: 'Safari', value: 200 },
 *     { name: 'firefox', label: 'Firefox', value: 187 },
 *   ];
 * </script>
 * ```
 *
 * @slot center - Replaces the total and caption in the centre.
 * @slot empty - Shown when there is no data. Defaults to "No data".
 *
 * @fires chart-select - A slice was clicked or chosen with Enter. `detail` holds `index`, `series` (the slice name) and `datum`.
 *
 * @csspart container - The outer wrapper.
 * @csspart plot - The focusable plot area holding the SVG.
 * @csspart center - The centre content.
 * @csspart tooltip - The tooltip.
 * @csspart legend - The legend.
 *
 * @cssprop --color-chart-1 - Color of the first slice; slices cycle through `--color-chart-1` to `--color-chart-8`.
 * @cssprop --chart-dim-opacity - Opacity of slices that are not hovered. Defaults to `0.4`.
 */
@IndividualComponent
export class ChartDoughnut extends ChartPie {
  // ── Properties

  /** Size of the hole as a fraction of the radius. */
  @property({ type: Number, attribute: 'inner-radius' }) innerRadius: number =
    0.62;

  /** Caption under the total in the centre. */
  @property({ type: String, attribute: 'center-label' }) centerLabel: string =
    'Total';

  // ── Render helpers

  protected renderOverlay() {
    const active =
      this.activeIndex >= 0 ? this.data[this.activeIndex] : undefined;
    const value = active ? active.value : this.visibleTotal();
    const caption = active ? (active.label ?? active.name) : this.centerLabel;
    const hole = Math.max(this.radius * this.innerRadius * 2 - 16, 0);
    return html`<div
      class="center"
      part="center"
      style=${styleMap({ '--_center-width': `${hole}px` })}
    >
      <slot name="center">
        <span class="center-value">${this.formatValue(value)}</span>
        <span class="center-label">${caption}</span>
      </slot>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wc-chart-doughnut': ChartDoughnut;
  }
}
