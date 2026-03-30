import { html, LitElement, PropertyValues } from 'lit';
import { property, query } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import IndividualComponent from 'src/IndividualComponent.js';
import * as d3 from 'd3';
import styles from './chart-bar.scss';

export type ChartStackedSegment = {
  name: string;
  value: number;
  label?: string;
  color?: string;
};

export type ChartStackedBarItem = {
  name: string;
  label?: string;
  segments: ChartStackedSegment[];
};

const chartColors: string[] = [];
['purple', 'blue', 'red', 'green', 'yellow', 'orange'].forEach(colorName => {
  chartColors.push(`var(--color-${colorName})`);
});

const DEFAULT_WIDTH = 520;
const DEFAULT_HEIGHT = 360;
const BAR_RADIUS = 8;
const DURATION = 450;

function debounce<T extends (...args: any[]) => void>(fn: T, wait: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  }) as T;
}

/**
 * @label Chart Stacked Bar
 * @tag wc-chart-stacked-bar
 * @rawTag chart-stacked-bar
 * @summary A stacked bar chart that groups series by category using Material Design 3 tokens.
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
@IndividualComponent
export class ChartStackedBar extends LitElement {
  static styles = [styles];

  @query('svg')
  private svgElement?: SVGElement;

  /** Width of the chart in pixels. */
  @property({ type: Number, reflect: true }) width: number = 0;

  /** Height of the chart in pixels. */
  @property({ type: Number, reflect: true }) height: number = DEFAULT_HEIGHT;

  /** Margin around the chart drawing area. */
  @property({ type: Number }) margin: number = 28;

  /** Chart data array. Each item holds the stacked segments for a category. */
  @property({ type: Array }) data: ChartStackedBarItem[] = [];

  /** Whether to render total value labels above each stack. */
  @property({ type: Boolean, attribute: 'show-values' }) showValues: boolean = true;

  /** Whether to render the legend. */
  @property({ type: Boolean, attribute: 'show-legend' }) showLegend: boolean = true;

  private _initialized = false;

  private _debouncedRenderChart = debounce(() => {
    this._renderChart(true);
  }, 200);

  firstUpdated() {
    this._renderChart(false);
  }

  updated(changedProperties: PropertyValues) {
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

  private _getSegmentKeys() {
    const keys = new Set<string>();
    this.data?.forEach(item => {
      item.segments?.forEach(segment => keys.add(segment.name));
    });
    return Array.from(keys);
  }

  private _getColorScale(keys: string[]) {
    return d3
      .scaleOrdinal<string, string>()
      .domain(keys)
      .range(chartColors);
  }

  private _getColorMap(
    keys: string[],
    scale: d3.ScaleOrdinal<string, string>,
  ) {
    const map = new Map<string, string>();
    keys.forEach(key => {
      const override = this.data
        .map(item => item.segments.find(seg => seg.name === key)?.color)
        .find(color => !!color);
      map.set(key, override || scale(key));
    });
    return map;
  }

  private _getSegmentLabel(key: string) {
    const segment = this.data
      .map(item => item.segments.find(seg => seg.name === key))
      .find(Boolean);
    return segment?.label ?? key;
  }

  private _getTotals() {
    return this.data.map(item =>
      item.segments.reduce((sum, seg) => sum + seg.value, 0),
    );
  }

  private _renderChart(animate: boolean) {
    if (!this.svgElement) return;

    const width = this.width > 0 ? this.width : DEFAULT_WIDTH;
    const height = this.height > 0 ? this.height : DEFAULT_HEIGHT;
    const margin = Math.max(this.margin, 16);
    const data = this.data ?? [];

    const svg = d3.select(this.svgElement);
    svg.attr('width', width).attr('height', height);

    const innerWidth = Math.max(width - margin * 2, 0);
    const innerHeight = Math.max(height - margin * 2, 0);

    const container = svg.select<SVGGElement>('.chart-container');
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
    const xScale = d3
      .scaleBand<string>()
      .domain(data.map(d => d.name))
      .range([0, innerWidth])
      .padding(0.3);
    const maxValue = d3.max(totals) ?? 0;
    const yScale = d3
      .scaleLinear()
      .domain([0, maxValue || 1])
      .nice()
      .range([innerHeight, 0]);

    const stackedSeries = d3
      .stack<ChartStackedBarItem, string>()
      .keys(keys)
      .value(
        (d, key) => d.segments.find(segment => segment.name === key)?.value ?? 0,
      )(data);

    const yGrid = container.select<SVGGElement>('.y-grid');
    yGrid
      .call(
        d3
          .axisLeft(yScale)
          .ticks(5)
          .tickSize(-innerWidth)
          .tickFormat(() => ''),
      )
      .selectAll('.tick text')
      .remove();
    yGrid.select('.domain').remove();
    yGrid.selectAll('.tick line').attr('class', 'gridline');

    const xAxis = container.select<SVGGElement>('.x-axis');
    xAxis
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickSizeOuter(0)
          .tickFormat(name => {
            const entry = data.find(d => d.name === name);
            return entry?.label ?? name;
          }),
      );
    xAxis.select('.domain').attr('stroke', 'var(--color-outline-variant)');
    xAxis.selectAll('.tick line').remove();
    xAxis
      .selectAll('.tick text')
      .attr('class', 'axis-label')
      .attr('dy', '1.1em');

    const barGroups = container
      .select('.bars')
      .selectAll<SVGGElement, d3.Series<ChartStackedBarItem, string>>(
        '.bar-group',
      )
      .data(stackedSeries, series => series.key)
      .join(
        enter =>
          enter
            .append('g')
            .attr('class', 'bar-group')
            .style('fill', series => colorMap.get(series.key) ?? ''),
        update => update,
        exit => exit.remove(),
      )
      .style('fill', series => colorMap.get(series.key) ?? colorScale(series.key));

    const segmentJoin = barGroups
      .selectAll<SVGRectElement, d3.SeriesPoint<ChartStackedBarItem>>('rect')
      .data(series => series, d => d.data.name)
      .join(
        enter =>
          enter
            .append('rect')
            .attr('class', 'stacked-segment')
            .attr('x', d => xScale(d.data.name) ?? 0)
            .attr('width', xScale.bandwidth())
            .attr('y', innerHeight)
            .attr('height', 0)
            .attr('rx', BAR_RADIUS)
            .attr('ry', BAR_RADIUS),
        update => update,
        exit =>
          exit
            .transition()
            .duration(DURATION)
            .attr('y', innerHeight)
            .attr('height', 0)
            .remove(),
      );

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
    } else {
      segmentJoin
        .attr('y', d => yScale(d[1]))
        .attr('height', d => yScale(d[0]) - yScale(d[1]));
    }

    const totalLabels = container
      .select('.value-labels')
      .selectAll<SVGTextElement, ChartStackedBarItem>('text')
      .data(this.showValues ? data : [], d => d.name)
      .join(
        enter =>
          enter
            .append('text')
            .attr('class', 'value-label')
            .attr('text-anchor', 'middle')
            .attr('x', d => (xScale(d.name) ?? 0) + xScale.bandwidth() / 2)
            .attr('y', innerHeight - 6)
            .text(d =>
              d.segments
                .reduce((sum, seg) => sum + seg.value, 0)
                .toLocaleString(),
            ),
        update => update,
        exit => exit.remove(),
      );

    const labelPosition = (item: ChartStackedBarItem) => {
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
        .text(d =>
          d.segments
            .reduce((sum, seg) => sum + seg.value, 0)
            .toLocaleString(),
        );
    } else {
      totalLabels
        .attr('x', d => (xScale(d.name) ?? 0) + xScale.bandwidth() / 2)
        .attr('y', d => labelPosition(d))
        .text(d =>
          d.segments
            .reduce((sum, seg) => sum + seg.value, 0)
            .toLocaleString(),
        );
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

    return html`
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
          ? html`<div class="legend" role="list">
              ${legendItems.map(
                item => html`<span class="legend-item" role="listitem">
                  <span
                    class="swatch"
                    style=${styleMap({ background: item.color })}
                  ></span>
                  <span>${item.name}</span>
                </span>`,
              )}
            </div>`
          : null}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wc-chart-stacked-bar': ChartStackedBar;
  }
}
