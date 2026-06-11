import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { e } from './query-CHb9Ft_d.js';
import { o as ordinal, s as select, c as cubicInOut, i as interpolateNumber } from './transform-DSwFSqzD.js';
import { p as pie, a as arc } from './pie-Dz0IDiPt.js';
import './base-Cl6v8-BZ.js';
import './array-D5vjT2Xm.js';

var css_248z = i`* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.screen-reader-only {
  display: none !important;
}

[hidden] {
  display: none !important;
}

:host {
  display: inline-block;
}

.title {
  font-family: var(--typography-title-large-emphasized-font-family) !important;
  font-size: var(--typography-title-large-emphasized-font-size) !important;
  font-weight: var(--typography-title-large-emphasized-font-weight) !important;
  line-height: var(--typography-title-large-emphasized-line-height) !important;
  letter-spacing: var(--typography-title-large-emphasized-letter-spacing) !important;
  fill: var(--color-on-surface);
}

.label {
  font-family: var(--typography-title-medium-font-family) !important;
  font-size: var(--typography-title-medium-font-size) !important;
  font-weight: var(--typography-title-medium-font-weight) !important;
  line-height: var(--typography-title-medium-line-height) !important;
  letter-spacing: var(--typography-title-medium-letter-spacing) !important;
  fill: var(--color-on-surface);
}

.arc {
  cursor: pointer;
  transition: filter 150ms ease;
}
.arc:hover {
  filter: brightness(1.2);
}

.item-polyline {
  fill: none;
  stroke-width: 1;
  stroke: var(--color-on-surface);
}

.item-label {
  fill: var(--color-on-surface);
  font-family: var(--typography-label-medium-font-family) !important;
  font-size: var(--typography-label-medium-font-size) !important;
  font-weight: var(--typography-label-medium-font-weight) !important;
  line-height: var(--typography-label-medium-line-height) !important;
  letter-spacing: var(--typography-label-medium-letter-spacing) !important;
}`;

const chartColors = [];
['purple', 'blue', 'red', 'green', 'yellow', 'orange'].forEach(colorName => {
    chartColors.push({
        color: `var(--color-${colorName})`,
    });
});
function debounce(fn, wait) {
    let timer;
    return ((...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), wait);
    });
}
/**
 * @label Chart Doughnut
 * @tag wc-chart-doughnut
 * @rawTag chart-doughnut
 * @summary A doughnut chart is a circular chart with a blank center. The area in the center can be used to display information.
 * @tags charts
 *
 * @example
 * ```html
 * <wc-chart-doughnut width="400" label="Total"></wc-chart-doughnut>
 * <script>
 *   document.querySelector('wc-chart-doughnut').data = [
 *     { name: 'A', value: 30, label: 'Category A' },
 *     { name: 'B', value: 50, label: 'Category B' },
 *     { name: 'C', value: 20, label: 'Category C' },
 *   ];
 * </script>
 * ```
 */
let ChartDoughnut = class ChartDoughnut extends i$1 {
    constructor() {
        super(...arguments);
        /** Width (and height) of the chart in pixels. */
        this.width = 0;
        /** Margin around the chart. */
        this.margin = 10;
        /** Whether to show labels outside the chart. */
        this.showLabels = true;
        /** Chart data array. Each item should have name, value, and optional label and color. */
        this.data = [];
        this._initialized = false;
        this._debouncedRenderChart = debounce(() => {
            this._renderChart(true);
        }, 300);
    }
    firstUpdated() {
        this._renderChart(false);
    }
    updated(changedProperties) {
        if (!this._initialized) {
            this._initialized = true;
            return;
        }
        const watchedProps = ['width', 'margin', 'showLabels', 'data'];
        const hasChanged = watchedProps.some(prop => changedProperties.has(prop));
        if (hasChanged) {
            this._debouncedRenderChart();
        }
    }
    _getRadius() {
        return this.width / 2 - this.margin - 100;
    }
    _getTotal() {
        return this.data.reduce((total, d) => total + d.value, 0);
    }
    _getPieData() {
        const pieGenerator = pie()
            .sort(null)
            .value(d => d.value);
        return pieGenerator(this.data);
    }
    _getColorScale() {
        return ordinal()
            .domain(this.data.map(d => d.name))
            .range(chartColors);
    }
    _renderChart(animate) {
        if (!this.svgElement)
            return;
        const DURATION = 500;
        const radius = this._getRadius();
        const pieData = this._getPieData();
        const colorScale = this._getColorScale();
        const total = this._getTotal();
        const svg = select(this.svgElement);
        const doughnutArc = arc()
            .innerRadius(radius * 0.72)
            .outerRadius(radius);
        const labelsArc = arc()
            .innerRadius(radius + 10)
            .outerRadius(radius + 10);
        // Update SVG dimensions and center transform
        svg.attr('width', this.width).attr('height', this.width);
        svg
            .select('.chart-container')
            .attr('transform', `translate(${this.width / 2},${this.width / 2})`);
        // Arc paths — keyed by name so D3 matches elements across updates
        const $paths = svg
            .select('.arc-container')
            .selectAll('.arc')
            .data(pieData, d => d.data.name)
            .join('path')
            .attr('class', 'arc')
            .style('fill', d => d.data.color || colorScale(d.data.name).color);
        if (animate) {
            $paths
                .transition()
                .duration(DURATION)
                .ease(cubicInOut)
                .attrTween('d', function (d) {
                const self = this;
                // Interpolate from the last rendered angles to the new ones.
                // New (entering) arcs start collapsed at their startAngle.
                const prev = self._prevDatum ?? {
                    startAngle: d.startAngle,
                    endAngle: d.startAngle,
                };
                self._prevDatum = d;
                const iStart = interpolateNumber(prev.startAngle, d.startAngle);
                const iEnd = interpolateNumber(prev.endAngle, d.endAngle);
                return (t) => doughnutArc({ ...d, startAngle: iStart(t), endAngle: iEnd(t) }) ??
                    '';
            });
        }
        else {
            // Initial render: draw immediately and seed previous-datum for later tweens
            $paths
                .each(function (d) {
                this._prevDatum = d;
            })
                .attr('d', d => doughnutArc(d) ?? '');
        }
        // Animate the central total counter
        const $title = svg.select('.title');
        if (animate) {
            $title
                .transition()
                .duration(DURATION)
                .ease(cubicInOut)
                .tween('text', function () {
                const sel = select(this);
                const start = parseFloat(sel.text()) || 0;
                const interp = interpolateNumber(start, total);
                return function (t) {
                    sel.text(Math.round(interp(t)));
                };
            });
        }
        else {
            $title.text(total);
        }
        // Label polylines and text
        const $chartContainer = svg.select('.chart-container');
        if (this.showLabels) {
            const pointsFn = (d) => {
                const posA = doughnutArc.centroid(d);
                const posB = labelsArc.centroid(d);
                const posC = posB.slice();
                const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                posC[0] = radius * (midAngle < Math.PI ? 1 : -1);
                return [posA, posB, posC].map(p => p.join(',')).join(' ');
            };
            const transformFn = (d) => {
                const pos = labelsArc.centroid(d);
                const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                pos[0] = radius * (midAngle < Math.PI ? 1 : -1);
                return `translate(${pos})`;
            };
            const anchorFn = (d) => {
                const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                return midAngle < Math.PI ? 'start' : 'end';
            };
            const $polylines = $chartContainer
                .selectAll('.item-polyline')
                .data(pieData, d => d.data.name)
                .join('polyline')
                .attr('class', 'item-polyline');
            const $labels = $chartContainer
                .selectAll('.item-label')
                .data(pieData, d => d.data.name)
                .join('text')
                .attr('class', 'item-label')
                .text(d => d.data.label ?? '');
            if (animate) {
                $polylines
                    .transition()
                    .duration(DURATION)
                    .ease(cubicInOut)
                    .attr('points', pointsFn);
                $labels
                    .transition()
                    .duration(DURATION)
                    .ease(cubicInOut)
                    .attr('transform', transformFn)
                    .style('text-anchor', anchorFn);
            }
            else {
                $polylines.attr('points', pointsFn);
                $labels.attr('transform', transformFn).style('text-anchor', anchorFn);
            }
        }
        else {
            $chartContainer.selectAll('.item-polyline').remove();
            $chartContainer.selectAll('.item-label').remove();
        }
    }
    render() {
        return b `
      <div class="chart">
        <svg>
          <g class="chart-container">
            <g class="arc-container"></g>
            <text class="title" text-anchor="middle"></text>
            <text class="label" text-anchor="middle" y="16">
              ${this.label}
            </text>
          </g>
        </svg>
      </div>
    `;
    }
};
ChartDoughnut.styles = [css_248z];
__decorate([
    e('svg')
], ChartDoughnut.prototype, "svgElement", void 0);
__decorate([
    n({ type: Number, reflect: true })
], ChartDoughnut.prototype, "width", void 0);
__decorate([
    n({ type: Number, reflect: true })
], ChartDoughnut.prototype, "margin", void 0);
__decorate([
    n({ type: Boolean, reflect: true, attribute: 'show-labels' })
], ChartDoughnut.prototype, "showLabels", void 0);
__decorate([
    n({ type: Array })
], ChartDoughnut.prototype, "data", void 0);
__decorate([
    n({ type: String })
], ChartDoughnut.prototype, "label", void 0);
ChartDoughnut = __decorate([
    IndividualComponent
], ChartDoughnut);

export { ChartDoughnut };
//# sourceMappingURL=chart-doughnut.js.map
