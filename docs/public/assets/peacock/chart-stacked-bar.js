import { _ as __decorate, I as IndividualComponent, a as i, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { e } from './query-CHb9Ft_d.js';
import { o } from './style-map-BQD5Et1D.js';
import { o as ordinal, s as select } from './transform-DSwFSqzD.js';
import { c as css_248z, b as band, m as max, l as linear, a as axisLeft, d as axisBottom } from './chart-bar-CapLbc2e.js';
import { c as constant, a as array } from './array-D5vjT2Xm.js';
import './base-Cl6v8-BZ.js';
import './directive-ZPhl09Yt.js';

function none$1(series, order) {
  if (!((n = series.length) > 1)) return;
  for (var i = 1, j, s0, s1 = series[order[0]], n, m = s1.length; i < n; ++i) {
    s0 = s1, s1 = series[order[i]];
    for (j = 0; j < m; ++j) {
      s1[j][1] += s1[j][0] = isNaN(s0[j][1]) ? s0[j][0] : s0[j][1];
    }
  }
}

function none(series) {
  var n = series.length, o = new Array(n);
  while (--n >= 0) o[n] = n;
  return o;
}

function stackValue(d, key) {
  return d[key];
}

function stackSeries(key) {
  const series = [];
  series.key = key;
  return series;
}

function stack() {
  var keys = constant([]),
      order = none,
      offset = none$1,
      value = stackValue;

  function stack(data) {
    var sz = Array.from(keys.apply(this, arguments), stackSeries),
        i, n = sz.length, j = -1,
        oz;

    for (const d of data) {
      for (i = 0, ++j; i < n; ++i) {
        (sz[i][j] = [0, +value(d, sz[i].key, j, data)]).data = d;
      }
    }

    for (i = 0, oz = array(order(sz)); i < n; ++i) {
      sz[oz[i]].index = i;
    }

    offset(sz, oz);
    return sz;
  }

  stack.keys = function(_) {
    return arguments.length ? (keys = typeof _ === "function" ? _ : constant(Array.from(_)), stack) : keys;
  };

  stack.value = function(_) {
    return arguments.length ? (value = typeof _ === "function" ? _ : constant(+_), stack) : value;
  };

  stack.order = function(_) {
    return arguments.length ? (order = _ == null ? none : typeof _ === "function" ? _ : constant(Array.from(_)), stack) : order;
  };

  stack.offset = function(_) {
    return arguments.length ? (offset = _ == null ? none$1 : _, stack) : offset;
  };

  return stack;
}

const chartColors = [];
['purple', 'blue', 'red', 'green', 'yellow', 'orange'].forEach(colorName => {
    chartColors.push(`var(--color-${colorName})`);
});
const DEFAULT_WIDTH = 520;
const DEFAULT_HEIGHT = 360;
const BAR_RADIUS = 8;
const DURATION = 450;
function debounce(fn, wait) {
    let timer;
    return ((...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), wait);
    });
}
/**
 * @label Chart Stacked Bar
 * @tag wc-chart-stacked-bar
 * @rawTag chart-stacked-bar
 * @summary A stacked bar chart that groups series by category using tokens.
 * @tags charts
 *
 * @example
 * ```html
 * <wc-chart-stacked-bar width="560" height="360"></wc-chart-stacked-bar>
 * <script>
 *   document.querySelector('wc-chart-stacked-bar').data = [
 *     {
 *       name: 'q1',
 *       label: 'Q1',
 *       segments: [
 *         { name: 'mobile', label: 'Mobile', value: 40 },
 *         { name: 'web', label: 'Web', value: 25 },
 *         { name: 'store', label: 'Store', value: 15 },
 *       ],
 *     },
 *     {
 *       name: 'q2',
 *       label: 'Q2',
 *       segments: [
 *         { name: 'mobile', label: 'Mobile', value: 32 },
 *         { name: 'web', label: 'Web', value: 30 },
 *         { name: 'store', label: 'Store', value: 18 },
 *       ],
 *     },
 *   ];
 * </script>
 * ```
 */
let ChartStackedBar = class ChartStackedBar extends i {
    constructor() {
        super(...arguments);
        /** Width of the chart in pixels. */
        this.width = 0;
        /** Height of the chart in pixels. */
        this.height = DEFAULT_HEIGHT;
        /** Margin around the chart drawing area. */
        this.margin = 28;
        /** Chart data array. Each item holds the stacked segments for a category. */
        this.data = [];
        /** Whether to render total value labels above each stack. */
        this.showValues = true;
        /** Whether to render the legend. */
        this.showLegend = true;
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
        const watchedProps = [
            'width',
            'height',
            'margin',
            'data',
            'showValues',
            'showLegend',
        ];
        const hasChanged = watchedProps.some(prop => changedProperties.has(prop));
        if (hasChanged) {
            this._debouncedRenderChart();
        }
    }
    _getSegmentKeys() {
        const keys = new Set();
        this.data?.forEach(item => {
            item.segments?.forEach(segment => keys.add(segment.name));
        });
        return Array.from(keys);
    }
    _getColorScale(keys) {
        return ordinal()
            .domain(keys)
            .range(chartColors);
    }
    _getColorMap(keys, scale) {
        const map = new Map();
        keys.forEach(key => {
            const override = this.data
                .map(item => item.segments.find(seg => seg.name === key)?.color)
                .find(color => !!color);
            map.set(key, override || scale(key));
        });
        return map;
    }
    _getSegmentLabel(key) {
        const segment = this.data
            .map(item => item.segments.find(seg => seg.name === key))
            .find(Boolean);
        return segment?.label ?? key;
    }
    _getTotals() {
        return this.data.map(item => item.segments.reduce((sum, seg) => sum + seg.value, 0));
    }
    _renderChart(animate) {
        if (!this.svgElement)
            return;
        const width = this.width > 0 ? this.width : DEFAULT_WIDTH;
        const height = this.height > 0 ? this.height : DEFAULT_HEIGHT;
        const margin = Math.max(this.margin, 16);
        const data = this.data ?? [];
        const svg = select(this.svgElement);
        svg.attr('width', width).attr('height', height);
        const innerWidth = Math.max(width - margin * 2, 0);
        const innerHeight = Math.max(height - margin * 2, 0);
        const container = svg.select('.chart-container');
        container.attr('transform', `translate(${margin},${margin})`);
        if (!data.length || innerWidth === 0 || innerHeight === 0) {
            container.select('.bars').selectAll('*').remove();
            container.select('.x-axis').selectAll('*').remove();
            container.select('.y-grid').selectAll('*').remove();
            container.select('.value-labels').selectAll('*').remove();
            return;
        }
        const keys = this._getSegmentKeys();
        const colorScale = this._getColorScale(keys);
        const colorMap = this._getColorMap(keys, colorScale);
        const totals = this._getTotals();
        const xScale = band()
            .domain(data.map(d => d.name))
            .range([0, innerWidth])
            .padding(0.3);
        const maxValue = max(totals) ?? 0;
        const yScale = linear()
            .domain([0, maxValue || 1])
            .nice()
            .range([innerHeight, 0]);
        const stackedSeries = stack()
            .keys(keys)
            .value((d, key) => d.segments.find(segment => segment.name === key)?.value ?? 0)(data);
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
        const barGroups = container
            .select('.bars')
            .selectAll('.bar-group')
            .data(stackedSeries, series => series.key)
            .join(enter => enter
            .append('g')
            .attr('class', 'bar-group')
            .style('fill', series => colorMap.get(series.key) ?? ''), update => update, exit => exit.remove())
            .style('fill', series => colorMap.get(series.key) ?? colorScale(series.key));
        const segmentJoin = barGroups
            .selectAll('rect')
            .data(series => series, d => d.data.name)
            .join(enter => enter
            .append('rect')
            .attr('class', 'stacked-segment')
            .attr('x', d => xScale(d.data.name) ?? 0)
            .attr('width', xScale.bandwidth())
            .attr('y', innerHeight)
            .attr('height', 0)
            .attr('rx', BAR_RADIUS)
            .attr('ry', BAR_RADIUS), update => update, exit => exit
            .transition()
            .duration(DURATION)
            .attr('y', innerHeight)
            .attr('height', 0)
            .remove());
        segmentJoin
            .attr('x', d => xScale(d.data.name) ?? 0)
            .attr('width', xScale.bandwidth())
            .attr('rx', BAR_RADIUS)
            .attr('ry', BAR_RADIUS);
        if (animate) {
            segmentJoin
                .transition()
                .duration(DURATION)
                .attr('y', d => yScale(d[1]))
                .attr('height', d => yScale(d[0]) - yScale(d[1]));
        }
        else {
            segmentJoin
                .attr('y', d => yScale(d[1]))
                .attr('height', d => yScale(d[0]) - yScale(d[1]));
        }
        const totalLabels = container
            .select('.value-labels')
            .selectAll('text')
            .data(this.showValues ? data : [], d => d.name)
            .join(enter => enter
            .append('text')
            .attr('class', 'value-label')
            .attr('text-anchor', 'middle')
            .attr('x', d => (xScale(d.name) ?? 0) + xScale.bandwidth() / 2)
            .attr('y', innerHeight - 6)
            .text(d => d.segments
            .reduce((sum, seg) => sum + seg.value, 0)
            .toLocaleString()), update => update, exit => exit.remove());
        const labelPosition = (item) => {
            const total = item.segments.reduce((sum, seg) => sum + seg.value, 0);
            const offset = yScale(total) - 8;
            return Math.min(offset, innerHeight - 8);
        };
        if (animate) {
            totalLabels
                .transition()
                .duration(DURATION)
                .attr('x', d => (xScale(d.name) ?? 0) + xScale.bandwidth() / 2)
                .attr('y', d => labelPosition(d))
                .text(d => d.segments
                .reduce((sum, seg) => sum + seg.value, 0)
                .toLocaleString());
        }
        else {
            totalLabels
                .attr('x', d => (xScale(d.name) ?? 0) + xScale.bandwidth() / 2)
                .attr('y', d => labelPosition(d))
                .text(d => d.segments
                .reduce((sum, seg) => sum + seg.value, 0)
                .toLocaleString());
        }
    }
    render() {
        const keys = this._getSegmentKeys();
        const colorScale = this._getColorScale(keys);
        const colorMap = this._getColorMap(keys, colorScale);
        const legendItems = keys.map(key => ({
            name: this._getSegmentLabel(key),
            color: colorMap.get(key) ?? colorScale(key),
        }));
        return b `
      <div class="chart-frame">
        <svg role="img" aria-label="Stacked bar chart">
          <g class="chart-container">
            <g class="y-grid"></g>
            <g class="bars"></g>
            <g class="x-axis"></g>
            <g class="value-labels"></g>
          </g>
        </svg>
        ${this.showLegend && legendItems.length
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
ChartStackedBar.styles = [css_248z];
__decorate([
    e('svg')
], ChartStackedBar.prototype, "svgElement", void 0);
__decorate([
    n({ type: Number, reflect: true })
], ChartStackedBar.prototype, "width", void 0);
__decorate([
    n({ type: Number, reflect: true })
], ChartStackedBar.prototype, "height", void 0);
__decorate([
    n({ type: Number })
], ChartStackedBar.prototype, "margin", void 0);
__decorate([
    n({ type: Array })
], ChartStackedBar.prototype, "data", void 0);
__decorate([
    n({ type: Boolean, attribute: 'show-values' })
], ChartStackedBar.prototype, "showValues", void 0);
__decorate([
    n({ type: Boolean, attribute: 'show-legend' })
], ChartStackedBar.prototype, "showLegend", void 0);
ChartStackedBar = __decorate([
    IndividualComponent
], ChartStackedBar);

export { ChartStackedBar };
//# sourceMappingURL=chart-stacked-bar.js.map
