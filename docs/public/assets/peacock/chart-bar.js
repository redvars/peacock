import { _ as __decorate, I as IndividualComponent } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import './transform-CxeQFXXB.js';
import { C as CartesianChart, s as stack, l as linear, m as min, a as max, b as band } from './cartesian-chart-B0zbAlY-.js';
import { c as css_248z } from './chart-base-D-Gp730U.js';
import './state-BCeDVCI9.js';
import './query-CHb9Ft_d.js';
import './base-Cl6v8-BZ.js';
import './class-map-NDIkZErE.js';
import './directive-ZPhl09Yt.js';
import './style-map-CHOg6N_R.js';
import './i18n-controller-Cp43HjJl.js';
import './strings-BJPuhKJk.js';
import './locale-DEsJZCQG.js';

function stackOffsetDiverging(series, order) {
  if (!((n = series.length) > 0)) return;
  for (var i, j = 0, d, dy, yp, yn, n, m = series[order[0]].length; j < m; ++j) {
    for (yp = yn = 0, i = 0; i < n; ++i) {
      if ((dy = (d = series[order[i]][j])[1] - d[0]) > 0) {
        d[0] = yp, d[1] = yp += dy;
      } else if (dy < 0) {
        d[1] = yn, d[0] = yn += dy;
      } else {
        d[0] = 0, d[1] = dy;
      }
    }
  }
}

/**
 * SVG path for a rectangle with its own radius per corner, in the order top-left, top-right,
 * bottom-right, bottom-left. Every path has the same commands, so d3 can tween between any two.
 */
function roundedRectPath(x, y, width, height, radii) {
    const w = Math.max(width, 0);
    const h = Math.max(height, 0);
    const limit = Math.min(w / 2, h / 2);
    const [tl, tr, br, bl] = radii.map(r => Math.max(Math.min(r, limit), 0));
    return [
        `M${x + tl},${y}`,
        `H${x + w - tr}`,
        `A${tr},${tr} 0 0 1 ${x + w},${y + tr}`,
        `V${y + h - br}`,
        `A${br},${br} 0 0 1 ${x + w - br},${y + h}`,
        `H${x + bl}`,
        `A${bl},${bl} 0 0 1 ${x},${y + h - bl}`,
        `V${y + tl}`,
        `A${tl},${tl} 0 0 1 ${x + tl},${y}`,
        'Z',
    ].join('');
}

/** Gap between stacked segments, in pixels. */
const STACK_GAP = 2;
/** Room reserved for value labels at the end of horizontal bars, per character. */
const VALUE_CHAR_WIDTH = 7;
/**
 * @label Bar Chart
 * @tag wc-chart-bar
 * @rawTag chart-bar
 * @summary Compares values across categories with vertical or horizontal bars, grouped or stacked by series.
 *
 * @overview
 * <p>Set <code>data</code> to an array of rows and <code>category-key</code> to the field that holds
 * each row's category label. <code>config</code> names the series fields, with an optional
 * <code>label</code> and <code>color</code> for each; without it every numeric field of the first row
 * becomes a series. Several series sit side by side in each category. Use
 * <code>wc-chart-line</code> for a trend over ordered categories such as time, and
 * <code>wc-chart-pie</code> for the parts of a single whole.</p>
 * <ul>
 * <li><code>orientation</code>: <code>vertical</code> (the default) draws columns;
 * <code>horizontal</code> draws bars from the left, which suits long category labels.</li>
 * <li><code>stacked</code> stacks the series in each category instead of placing them side by
 * side. Negative values stack below zero.</li>
 * <li><code>show-values</code> prints each bar's value at its end, or each stack's total when
 * stacked.</li>
 * <li><code>hide-grid</code>, <code>hide-category-axis</code> and <code>hide-value-axis</code> remove
 * the gridlines and axis labels. Category labels are thinned out when they would overlap.</li>
 * <li><code>height</code> sets the plot height in pixels (300 by default); the width follows the
 * container.</li>
 * </ul>
 * <p>Hovering or focusing a category highlights its bars and shows a tooltip with every visible
 * series' value (<code>hide-tooltip</code> turns it off). The legend shows for more than one series
 * by default (<code>legend</code>: <code>auto</code>, <code>show</code> or <code>hide</code>); each
 * entry is a toggle button that hides or shows its series, and hovering one highlights it.
 * <code>valueFormatter</code> formats values in tooltips, value labels and on the axis; by default
 * they use the locale's number format, compact on the axis.</p>
 * <p>The plot is focusable. The arrow keys move through the categories (Left and Right follow the
 * reading direction), Home and End jump to the first and last, Escape clears the focus, and Enter or
 * Space fires <code>select</code>, whose detail includes <code>series</code> when only one series is
 * visible. Each move is announced through a polite live region, and a visually hidden table holds
 * the data for screen readers. Give the chart a <code>label</code> to name it.</p>
 * <p><code>loading</code> shows a skeleton, and the <code>empty</code> slot shows when there is no
 * data. Bars grow in and animate on data changes unless <code>disable-animation</code> is set or the
 * user prefers reduced motion.</p>
 * @tags charts
 *
 * @example
 * ```html
 * <wc-chart-bar category-key="month" label="Visitors by month"></wc-chart-bar>
 * <script>
 *   const chart = document.querySelector('wc-chart-bar');
 *   chart.config = {
 *     desktop: { label: 'Desktop' },
 *     mobile: { label: 'Mobile' },
 *   };
 *   chart.data = [
 *     { month: 'January', desktop: 186, mobile: 80 },
 *     { month: 'February', desktop: 305, mobile: 200 },
 *     { month: 'March', desktop: 237, mobile: 120 },
 *   ];
 * </script>
 * ```
 *
 * @slot empty - Shown when there is no data. Defaults to "No data".
 * @slot insight - Below the chart, a line that explains it, such as the assistant’s reading of a trend. The data comes from the platform; the insight only puts it into words.
 *
 * @fires {CustomEvent<ChartSelectDetail>} select - A bar group was clicked or chosen with Enter. `detail` holds `index` (the row position), `datum`, and `series` when one series is visible.
 *
 * @csspart container - The outer wrapper.
 * @csspart plot - The focusable plot area holding the SVG.
 * @csspart tooltip - The tooltip.
 * @csspart legend - The legend.
 *
 * @cssprop --color-chart-1 - Color of the first series; series cycle through `--color-chart-1` to `--color-chart-8`.
 * @cssprop --chart-grid-color - Gridline and baseline color. Defaults to `--color-outline-variant`.
 * @cssprop --chart-axis-color - Axis label color. Defaults to `--color-on-surface-variant`.
 * @cssprop --chart-dim-opacity - Opacity of marks that are not hovered. Defaults to `0.4`.
 */
let ChartBar = class ChartBar extends CartesianChart {
    constructor() {
        // ── Static
        super(...arguments);
        // ── Properties
        /** Stacks the series in each category instead of placing them side by side. */
        this.stacked = false;
        /** `vertical` draws columns; `horizontal` draws bars from the left. */
        this.orientation = 'vertical';
        /** Prints each bar's value (each stack's total when stacked) at its end. */
        this.showValues = false;
        // ── Private fields
        /** Bars from the last draw, for highlighting. */
        this.bars = [];
    }
    // ── Private methods
    drawProperties() {
        return [...super.drawProperties(), 'stacked', 'orientation', 'showValues'];
    }
    /** Corner radius of the rounded end, from `--shape-corner-extra-small`. */
    cornerRadius() {
        const value = parseFloat(getComputedStyle(this).getPropertyValue('--shape-corner-extra-small'));
        return Number.isFinite(value) ? value : 4;
    }
    /** Bars and value labels in data space; positions are filled once scales exist. */
    buildModels() {
        const series = this.visibleSeries();
        const keys = series.map(s => s.key);
        const colors = new Map(series.map(s => [s.key, s.color]));
        const bars = [];
        const labels = [];
        if (this.stacked) {
            const layers = stack()
                .keys(keys)
                .value((d, key) => this.seriesValue(d, key))
                .offset(stackOffsetDiverging)(this.data);
            this.data.forEach((datum, index) => {
                // Segments run from the zero side (`from`) outwards (`to`).
                const segments = layers
                    .map(layer => {
                    const [a, b] = layer[index];
                    const positive = this.seriesValue(datum, layer.key) >= 0;
                    return {
                        key: layer.key,
                        from: positive ? Math.min(a, b) : Math.max(a, b),
                        to: positive ? Math.max(a, b) : Math.min(a, b),
                    };
                })
                    .filter(segment => segment.from !== segment.to);
                // The outermost segment on each side of zero gets the rounded end.
                const top = segments
                    .filter(s => s.to > 0)
                    .sort((a, b) => b.to - a.to)[0]?.key;
                const bottom = segments
                    .filter(s => s.to < 0)
                    .sort((a, b) => a.to - b.to)[0]?.key;
                segments.forEach(segment => {
                    bars.push({
                        id: `${index}:${segment.key}`,
                        index,
                        key: segment.key,
                        color: colors.get(segment.key) ?? '',
                        from: segment.from,
                        to: segment.to,
                        rounded: segment.key === (segment.to > 0 ? top : bottom),
                        gap: segment.from !== 0 ? STACK_GAP : 0,
                    });
                });
                labels.push({
                    id: String(index),
                    index,
                    value: keys.reduce((sum, key) => sum + this.seriesValue(datum, key), 0),
                });
            });
        }
        else {
            this.data.forEach((datum, index) => {
                keys.forEach(key => {
                    const value = this.seriesValue(datum, key);
                    bars.push({
                        id: `${index}:${key}`,
                        index,
                        key,
                        color: colors.get(key) ?? '',
                        from: 0,
                        to: value,
                        rounded: true,
                        gap: 0,
                    });
                    labels.push({ id: `${index}:${key}`, index, value });
                });
            });
        }
        return { keys, bars, labels };
    }
    draw(animate) {
        const root = this.plotArea();
        if (!root)
            return;
        const vertical = this.orientation !== 'horizontal';
        const { keys, bars, labels } = this.buildModels();
        const ends = bars.flatMap(bar => [bar.from, bar.to]);
        const valueScale = linear()
            .domain([Math.min(min(ends) ?? 0, 0), Math.max(max(ends) ?? 0, 0) || 1])
            .nice(5);
        const longestValue = Math.max(...labels.map(l => this.formatValue(l.value).length), 1);
        // Vertical charts only need a flag for headroom; horizontal ones need the label width.
        let valueLabelSpace = 0;
        if (this.showValues) {
            valueLabelSpace = vertical ? 1 : longestValue * VALUE_CHAR_WIDTH + 8;
        }
        this.computeLayout(valueScale, valueLabelSpace);
        const { left, top, innerWidth, innerHeight } = this.layout;
        const categoryScale = band()
            .domain(this.categoryDomain())
            .range([0, vertical ? innerWidth : innerHeight])
            .paddingInner(keys.length > 1 && !this.stacked ? 0.2 : 0.3)
            .paddingOuter(0.15);
        valueScale.range(vertical ? [innerHeight, 0] : [0, innerWidth]);
        this.drawFrame(categoryScale, valueScale);
        const groupScale = band()
            .domain(this.stacked ? ['all'] : keys)
            .range([0, categoryScale.bandwidth()])
            .padding(this.stacked || keys.length < 2 ? 0 : 0.1);
        const placed = bars.map(bar => ({
            ...bar,
            position: (categoryScale(String(bar.index)) ?? 0) +
                (groupScale(this.stacked ? 'all' : bar.key) ?? 0),
            thickness: groupScale.bandwidth(),
        }));
        this.bars = placed;
        const radius = this.cornerRadius();
        const path = (bar, grown) => {
            const zero = valueScale(0);
            const start = valueScale(grown ? bar.from : 0);
            const end = valueScale(grown ? bar.to : 0);
            const r = bar.rounded ? Math.min(radius, bar.thickness / 2) : 0;
            // Positive bars end up/right; negative ones down/left.
            const positive = bar.to >= bar.from;
            const length = Math.max(Math.abs(end - start) - (grown ? bar.gap : 0), 0);
            if (vertical) {
                const y = positive ? end : start + (grown ? bar.gap : 0);
                const base = grown ? y : zero;
                return roundedRectPath(bar.position, base, bar.thickness, length, positive ? [r, r, 0, 0] : [0, 0, r, r]);
            }
            const x = positive ? start + (grown ? bar.gap : 0) : end;
            return roundedRectPath(grown ? x : zero, bar.position, length, bar.thickness, positive ? [0, r, r, 0] : [r, 0, 0, r]);
        };
        const marks = root
            .select('.marks')
            .selectAll('path.bar')
            .data(placed, d => d.id)
            .join(enter => enter
            .append('path')
            .attr('class', 'mark bar')
            .attr('d', d => path(d, false)))
            .attr('data-index', d => d.index)
            .attr('data-key', d => d.key)
            .style('fill', d => d.color);
        this.motion(marks, animate).attr('d', d => path(d, true));
        // Value labels sit just past the end of each bar or stack.
        const center = (label) => {
            if (this.stacked) {
                return ((categoryScale(String(label.index)) ?? 0) +
                    categoryScale.bandwidth() / 2);
            }
            const key = label.id.split(':').slice(1).join(':');
            return ((categoryScale(String(label.index)) ?? 0) +
                (groupScale(key) ?? 0) +
                groupScale.bandwidth() / 2);
        };
        const labelModels = this.showValues
            ? labels.map(label => ({ ...label, center: center(label) }))
            : [];
        const valueLabels = root
            .select('.value-labels')
            .selectAll('text')
            .data(labelModels, d => d.id)
            .join(enter => enter
            .append('text')
            .attr('class', 'value-label')
            .attr('x', d => (vertical ? d.center : valueScale(0)))
            .attr('y', d => (vertical ? valueScale(0) : d.center)))
            .attr('text-anchor', d => {
            if (vertical)
                return 'middle';
            return d.value < 0 ? 'end' : 'start';
        })
            .attr('dominant-baseline', vertical ? 'auto' : 'middle')
            .text(d => this.formatValue(d.value));
        this.motion(valueLabels, animate)
            .attr('x', d => vertical ? d.center : valueScale(d.value) + (d.value < 0 ? -6 : 6))
            .attr('y', d => vertical ? valueScale(d.value) + (d.value < 0 ? 14 : -6) : d.center);
        // Tooltip anchors at the far end of each category.
        this.anchors = this.data.map((_, index) => {
            const own = placed.filter(bar => bar.index === index);
            const far = max(own, bar => bar.to) ?? 0;
            const c = (categoryScale(String(index)) ?? 0) + categoryScale.bandwidth() / 2;
            return vertical
                ? { x: left + c, y: top + Math.max(valueScale(far), 24) }
                : { x: left + Math.min(valueScale(far), innerWidth - 24), y: top + c };
        });
    }
    drawHighlight() {
        super.drawHighlight();
        const root = this.plotArea();
        if (!root)
            return;
        const { activeIndex, activeSeries } = this;
        root
            .select('.marks')
            .selectAll('path.bar')
            .classed('is-dimmed', d => (activeIndex >= 0 && d.index !== activeIndex) ||
            (activeSeries !== undefined && d.key !== activeSeries));
    }
    getSelectDetail(index) {
        const detail = super.getSelectDetail(index);
        // A single visible series identifies the bar exactly.
        const visible = this.bars.filter(bar => bar.index === index);
        return visible.length === 1
            ? { ...detail, series: visible[0].key }
            : detail;
    }
};
ChartBar.styles = [css_248z];
__decorate([
    n({ type: Boolean, reflect: true })
], ChartBar.prototype, "stacked", void 0);
__decorate([
    n({ type: String, reflect: true })
], ChartBar.prototype, "orientation", void 0);
__decorate([
    n({ type: Boolean, attribute: 'show-values' })
], ChartBar.prototype, "showValues", void 0);
ChartBar = __decorate([
    IndividualComponent
], ChartBar);

export { ChartBar };
//# sourceMappingURL=chart-bar.js.map
