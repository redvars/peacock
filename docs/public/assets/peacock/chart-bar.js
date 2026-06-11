import { _ as __decorate, I as IndividualComponent, a as i, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { e } from './query-CHb9Ft_d.js';
import { o } from './style-map-BQD5Et1D.js';
import { o as ordinal, s as select } from './transform-DSwFSqzD.js';
import { c as css_248z, b as band, m as max, l as linear, a as axisLeft, d as axisBottom } from './chart-bar-CapLbc2e.js';
import './base-Cl6v8-BZ.js';
import './directive-ZPhl09Yt.js';

const chartColors = [];
['purple', 'blue', 'red', 'green', 'yellow', 'orange'].forEach(colorName => {
    chartColors.push(`var(--color-${colorName})`);
});
const DEFAULT_WIDTH = 480;
const DEFAULT_HEIGHT = 320;
const BAR_RADIUS = 10;
const DURATION = 450;
function debounce(fn, wait) {
    let timer;
    return ((...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), wait);
    });
}
/**
 * @label Chart Bar
 * @tag wc-chart-bar
 * @rawTag chart-bar
 * @summary A vertical bar chart that follows color and spacing tokens.
 * @tags charts
 *
 * @example
 * ```html
 * <wc-chart-bar width="520" height="320"></wc-chart-bar>
 * <script>
 *   document.querySelector('wc-chart-bar').data = [
 *     { name: 'apples', label: 'Apples', value: 20 },
 *     { name: 'bananas', label: 'Bananas', value: 35 },
 *     { name: 'cherries', label: 'Cherries', value: 15 },
 *   ];
 * </script>
 * ```
 */
let ChartBar = class ChartBar extends i {
    constructor() {
        super(...arguments);
        /** Width of the chart in pixels. */
        this.width = 0;
        /** Height of the chart in pixels. */
        this.height = DEFAULT_HEIGHT;
        /** Margin around the chart drawing area. */
        this.margin = 24;
        /** Chart data array. Each item should have name, value, and optional label and color. */
        this.data = [];
        /** Whether to render value labels above bars. */
        this.showValues = true;
        this._initialized = false;
        this._debouncedRenderChart = debounce(() => {
            this._renderChart(true);
        }, 200);
    }
    firstUpdated() {
        this._renderChart(false);
    }
    updated(changedProperties) {
        if (!this._initialized) {
            this._initialized = true;
            return;
        }
        const watchedProps = ['width', 'height', 'margin', 'data', 'showValues'];
        const hasChanged = watchedProps.some(prop => changedProperties.has(prop));
        if (hasChanged) {
            this._debouncedRenderChart();
        }
    }
    _getPaletteScale() {
        return ordinal()
            .domain(this.data.map(d => d.name))
            .range(chartColors);
    }
    _resolveColor(name, override, scale) {
        return override || scale(name);
    }
    _renderChart(animate) {
        if (!this.svgElement)
            return;
        const width = this.width > 0 ? this.width : DEFAULT_WIDTH;
        const height = this.height > 0 ? this.height : DEFAULT_HEIGHT;
        const margin = Math.max(this.margin, 12);
        const data = this.data ?? [];
        const svg = select(this.svgElement);
        svg.attr('width', width).attr('height', height);
        const innerWidth = Math.max(width - margin * 2, 0);
        const innerHeight = Math.max(height - margin * 2, 0);
        const colorScale = this._getPaletteScale();
        const container = svg.select('.chart-container');
        container.attr('transform', `translate(${margin},${margin})`);
        if (!data.length || innerWidth === 0 || innerHeight === 0) {
            container.select('.bars').selectAll('*').remove();
            container.select('.x-axis').selectAll('*').remove();
            container.select('.y-grid').selectAll('*').remove();
            container.select('.value-labels').selectAll('*').remove();
            return;
        }
        const xScale = band()
            .domain(data.map(d => d.name))
            .range([0, innerWidth])
            .padding(0.28);
        const maxValue = max(data, d => d.value) ?? 0;
        const yScale = linear()
            .domain([0, maxValue || 1])
            .nice()
            .range([innerHeight, 0]);
        const yGrid = container.select('.y-grid');
        yGrid
            .call(axisLeft(yScale)
            .ticks(5)
            .tickSize(-innerWidth)
            .tickFormat(() => ''))
            .selectAll('.tick text')
            .remove();
        yGrid.select('.domain').remove();
        yGrid.selectAll('.tick line').attr('class', 'gridline');
        const xAxis = container.select('.x-axis');
        xAxis
            .attr('transform', `translate(0,${innerHeight})`)
            .call(axisBottom(xScale)
            .tickSizeOuter(0)
            .tickFormat(name => {
            const entry = data.find(d => d.name === name);
            return entry?.label ?? name;
        }));
        xAxis.select('.domain').attr('stroke', 'var(--color-outline-variant)');
        xAxis.selectAll('.tick line').remove();
        xAxis
            .selectAll('.tick text')
            .attr('class', 'axis-label')
            .attr('dy', '1.1em');
        const bars = container
            .select('.bars')
            .selectAll('rect')
            .data(data, d => d.name)
            .join(enter => enter
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => xScale(d.name) ?? 0)
            .attr('width', xScale.bandwidth())
            .attr('y', innerHeight)
            .attr('height', 0)
            .attr('rx', BAR_RADIUS)
            .attr('ry', BAR_RADIUS)
            .style('fill', d => this._resolveColor(d.name, d.color, colorScale)), update => update, exit => exit
            .transition()
            .duration(DURATION)
            .attr('height', 0)
            .attr('y', innerHeight)
            .remove());
        bars
            .attr('x', d => xScale(d.name) ?? 0)
            .attr('width', xScale.bandwidth())
            .attr('rx', BAR_RADIUS)
            .attr('ry', BAR_RADIUS)
            .style('fill', d => this._resolveColor(d.name, d.color, colorScale));
        if (animate) {
            bars
                .transition()
                .duration(DURATION)
                .attr('y', d => yScale(d.value))
                .attr('height', d => innerHeight - yScale(d.value));
        }
        else {
            bars
                .attr('y', d => yScale(d.value))
                .attr('height', d => innerHeight - yScale(d.value));
        }
        const valueLabels = container
            .select('.value-labels')
            .selectAll('text')
            .data(this.showValues ? data : [], d => d.name)
            .join(enter => enter
            .append('text')
            .attr('class', 'value-label')
            .attr('text-anchor', 'middle')
            .attr('x', d => (xScale(d.name) ?? 0) + xScale.bandwidth() / 2)
            .attr('y', innerHeight - 6)
            .text(d => d.value.toLocaleString()), update => update, exit => exit.remove());
        const resolveLabelY = (value) => {
            const offset = yScale(value) - 8;
            return Math.min(offset, innerHeight - 8);
        };
        if (animate) {
            valueLabels
                .transition()
                .duration(DURATION)
                .attr('x', d => (xScale(d.name) ?? 0) + xScale.bandwidth() / 2)
                .attr('y', d => resolveLabelY(d.value))
                .text(d => d.value.toLocaleString());
        }
        else {
            valueLabels
                .attr('x', d => (xScale(d.name) ?? 0) + xScale.bandwidth() / 2)
                .attr('y', d => resolveLabelY(d.value))
                .text(d => d.value.toLocaleString());
        }
    }
    render() {
        const paletteScale = this._getPaletteScale();
        const legendItems = this.data.map(item => ({
            name: item.label ?? item.name,
            color: this._resolveColor(item.name, item.color, paletteScale),
        }));
        return b `
      <div class="chart-frame">
        <svg role="img" aria-label="Bar chart">
          <g class="chart-container">
            <g class="y-grid"></g>
            <g class="bars"></g>
            <g class="x-axis"></g>
            <g class="value-labels"></g>
          </g>
        </svg>
        ${legendItems.length
            ? b `<div class="legend" role="list">
              ${legendItems.map(item => b `<span class="legend-item" role="listitem">
                  <span
                    class="swatch"
                    style=${o({ background: item.color })}
                  ></span>
                  <span>${item.name}</span>
                </span>`)}
            </div>`
            : null}
      </div>
    `;
    }
};
ChartBar.styles = [css_248z];
__decorate([
    e('svg')
], ChartBar.prototype, "svgElement", void 0);
__decorate([
    n({ type: Number, reflect: true })
], ChartBar.prototype, "width", void 0);
__decorate([
    n({ type: Number, reflect: true })
], ChartBar.prototype, "height", void 0);
__decorate([
    n({ type: Number })
], ChartBar.prototype, "margin", void 0);
__decorate([
    n({ type: Array })
], ChartBar.prototype, "data", void 0);
__decorate([
    n({ type: Boolean, attribute: 'show-values' })
], ChartBar.prototype, "showValues", void 0);
ChartBar = __decorate([
    IndividualComponent
], ChartBar);

export { ChartBar };
//# sourceMappingURL=chart-bar.js.map
