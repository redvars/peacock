import { _ as __decorate, I as IndividualComponent, A, b } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { o } from './style-map-CHOg6N_R.js';
import { ChartPie } from './chart-pie.js';
import './directive-ZPhl09Yt.js';
import './transform-CxeQFXXB.js';
import './chart-base-DI3J2rE8.js';
import './state-BCeDVCI9.js';
import './query-CHb9Ft_d.js';
import './base-Cl6v8-BZ.js';
import './class-map-NDIkZErE.js';
import './i18n-controller-CH4e9sju.js';
import './strings-o6v6Hrmn.js';
import './locale-DEsJZCQG.js';
import './path-CJ0Arqcy.js';

/**
 * @label Doughnut Chart
 * @tag wc-chart-doughnut
 * @rawTag chart-doughnut
 * @summary A pie chart with a hole that shows the total, or the hovered slice, in its centre.
 *
 * @overview
 * <p>A doughnut chart is a <code>wc-chart-pie</code> with a hole, and takes the same
 * <code>data</code>: an array of slices, each with a unique <code>name</code>, a <code>value</code>,
 * and an optional <code>label</code> and <code>color</code>.</p>
 * <ul>
 * <li>The centre shows the total of the visible slices with a caption, or the value and label of the
 * hovered or focused slice. <code>center-label</code> sets the caption (by default the localized
 * string "Total"), and the <code>center</code> slot replaces the content.</li>
 * <li><code>inner-radius</code> sets the size of the hole as a fraction of the radius, 0.62 by
 * default and at most 0.9. At 0 there is no hole and no centre content.</li>
 * <li><code>show-labels</code> prints each slice's percentage inside it when the slice is big
 * enough.</li>
 * <li><code>height</code> sets the plot height in pixels (300 by default); the width follows the
 * container.</li>
 * </ul>
 * <p>Hovering or focusing a slice pulls it out, dims the others and shows a tooltip with its value
 * and share of the visible total (<code>hide-tooltip</code> turns it off). The legend shows by
 * default (<code>legend</code>: <code>auto</code>, <code>show</code> or <code>hide</code>); each entry
 * is a toggle button that hides or shows its slice. <code>valueFormatter</code> formats the
 * values.</p>
 * <p>The plot is focusable. The arrow keys move through the slices (Left and Right follow the
 * reading direction), Home and End jump to the first and last, Escape clears the focus, and Enter or
 * Space fires <code>select</code>. Each move is announced through a polite live region, and a
 * visually hidden table lists each slice's name, value and share for screen readers. Give the chart
 * a <code>label</code> to name it.</p>
 * <p><code>loading</code> shows a skeleton, and the <code>empty</code> slot shows when no slice has a
 * value above zero. Slices animate unless <code>disable-animation</code> is set or the user prefers
 * reduced motion.</p>
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
 * @slot insight - Below the chart, a line that explains it, such as the assistant’s reading of a trend. The data comes from the platform; the insight only puts it into words.
 *
 * @fires {CustomEvent<ChartSelectDetail>} select - A slice was clicked or chosen with Enter. `detail` holds `index`, `series` (the slice name) and `datum`.
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
        /** Size of the hole as a fraction of the radius, up to 0.9. At 0 there is no hole and no centre content. */
        this.innerRadius = 0.62;
        /** Caption under the total in the centre. Defaults to Peacock's `total` string (`"Total"`). */
        this.centerLabel = '';
    }
    // ── Overrides
    drawProperties() {
        return [...super.drawProperties(), 'innerRadius'];
    }
    /** The hole as a clamped fraction of the radius. */
    innerFraction() {
        return Math.min(Math.max(this.innerRadius || 0, 0), 0.9);
    }
    // ── Render helpers
    renderOverlay() {
        if (this.innerFraction() <= 0)
            return A;
        const active = this.activeIndex >= 0 ? this.data[this.activeIndex] : undefined;
        const value = active ? active.value : this.visibleTotal();
        const caption = active
            ? (active.label ?? active.name)
            : this.centerLabel || this.i18n.t('total');
        const hole = Math.max(this.radius * this.innerFraction() * 2 - 16, 0);
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
