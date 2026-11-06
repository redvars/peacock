import { _ as __decorate, I as IndividualComponent, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { o } from './style-map-BQD5Et1D.js';
import { ChartPie } from './chart-pie.js';
import './directive-ZPhl09Yt.js';
import './chart-base-C2qRMF48.js';
import './state-DkTK9EGF.js';
import './query-CHb9Ft_d.js';
import './base-Cl6v8-BZ.js';
import './class-map-DG7CA1et.js';
import './path-CJ0Arqcy.js';

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
let ChartDoughnut = class ChartDoughnut extends ChartPie {
    constructor() {
        // ── Properties
        super(...arguments);
        /** Size of the hole as a fraction of the radius. */
        this.innerRadius = 0.62;
        /** Caption under the total in the centre. */
        this.centerLabel = 'Total';
    }
    // ── Render helpers
    renderOverlay() {
        const active = this.activeIndex >= 0 ? this.data[this.activeIndex] : undefined;
        const value = active ? active.value : this.visibleTotal();
        const caption = active ? (active.label ?? active.name) : this.centerLabel;
        const hole = Math.max(this.radius * this.innerRadius * 2 - 16, 0);
        return b `<div
      class="center"
      part="center"
      style=${o({ '--_center-width': `${hole}px` })}
    >
      <slot name="center">
        <span class="center-value">${this.formatValue(value)}</span>
        <span class="center-label">${caption}</span>
      </slot>
    </div>`;
    }
};
__decorate([
    n({ type: Number, attribute: 'inner-radius' })
], ChartDoughnut.prototype, "innerRadius", void 0);
__decorate([
    n({ type: String, attribute: 'center-label' })
], ChartDoughnut.prototype, "centerLabel", void 0);
ChartDoughnut = __decorate([
    IndividualComponent
], ChartDoughnut);

export { ChartDoughnut };
//# sourceMappingURL=chart-doughnut.js.map
