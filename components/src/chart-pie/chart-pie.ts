import { html, LitElement, PropertyValues } from 'lit';
import { property, query } from 'lit/decorators.js';
import PeacockComponent from 'src/PeacockComponent.js';
import * as d3 from 'd3';
import styles from './chart-pie.scss';

export type ChartPieColor = {
  color: string;
};

export type ChartPieItem = {
  name: string;
  value: number;
  label?: string;
  color?: string;
};

const chartColors: ChartPieColor[] = [];
['purple', 'blue', 'green', 'yellow', 'orange', 'red'].forEach(colorName => {
  chartColors.push({
    color: `var(--color-${colorName}-60)`,
  });
});

/** SVGPathElement augmented with the last rendered arc datum for smooth tween interpolation. */
interface ArcPathElement extends SVGPathElement {
  _prevDatum?: d3.PieArcDatum<ChartPieItem>;
}

function debounce<T extends (...args: any[]) => void>(fn: T, wait: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  }) as T;
}

/**
 * @label Chart Pie
 * @tag wc-chart-pie
 * @rawTag chart-pie
 * @summary A pie chart is a circular statistical graphic that visually represents numerical proportions.
 * @tags charts
 *
 * @example
 * ```html
 * <wc-chart-pie width="400"></wc-chart-pie>
 * <script>
 *   document.querySelector('wc-chart-pie').data = [
 *     { name: 'A', value: 30, label: 'Category A' },
 *     { name: 'B', value: 50, label: 'Category B' },
 *     { name: 'C', value: 20, label: 'Category C' },
 *   ];
 * </script>
 * ```
 */
@PeacockComponent
export class ChartPie extends LitElement {
  static styles = [styles];

  @query('svg')
  private svgElement?: SVGElement;

  /** Width (and height) of the chart in pixels. */
  @property({ type: Number, reflect: true }) width: number = 0;

  /** Margin around the chart. */
  @property({ type: Number, reflect: true }) margin: number = 10;

  /** Whether to show labels outside the chart. */
  @property({ type: Boolean, reflect: true, attribute: 'show-labels' })
  showLabels: boolean = true;

  /** Chart data array. Each item should have name, value, and optional label and color. */
  @property({ type: Array }) data: ChartPieItem[] = [];

  private _initialized = false;

  private _debouncedRenderChart = debounce(() => {
    this._renderChart(true);
  }, 300);

  firstUpdated() {
    this._renderChart(false);
  }

  updated(changedProperties: PropertyValues) {
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

  private _getRadius(): number {
    // Reserve 100px on each side for labels and padding
    return this.width / 2 - this.margin - 100;
  }

  private _getPieData() {
    const pie = d3
      .pie<ChartPieItem>()
      .sort(null)
      .value(d => d.value);
    return pie(this.data);
  }

  private _getColorScale() {
    return d3
      .scaleOrdinal<string, ChartPieColor>()
      .domain(this.data.map(d => d.name))
      .range(chartColors);
  }

  private _renderChart(animate: boolean) {
    if (!this.svgElement) return;

    const DURATION = 500;
    const radius = this._getRadius();
    const pieData = this._getPieData();
    const colorScale = this._getColorScale();

    const svg = d3.select(this.svgElement);

    const pieArc = d3
      .arc<d3.PieArcDatum<ChartPieItem>>()
      .innerRadius(0)
      .outerRadius(radius);

    const labelsArc = d3
      .arc<d3.PieArcDatum<ChartPieItem>>()
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
      .selectAll<SVGPathElement, d3.PieArcDatum<ChartPieItem>>('.arc')
      .data(pieData, d => d.data.name)
      .join('path')
      .attr('class', 'arc')
      .style('fill', d => d.data.color || colorScale(d.data.name).color);

    if (animate) {
      $paths
        .transition()
        .duration(DURATION)
        .ease(d3.easeCubicInOut)
        .attrTween('d', function (this: SVGPathElement, d) {
          const self = this as ArcPathElement;
          // Interpolate from the last rendered angles to the new ones.
          // New (entering) arcs start collapsed at their startAngle.
          const prev: { startAngle: number; endAngle: number } =
            self._prevDatum ?? {
              startAngle: d.startAngle,
              endAngle: d.startAngle,
            };
          self._prevDatum = d;
          const iStart = d3.interpolateNumber(prev.startAngle, d.startAngle);
          const iEnd = d3.interpolateNumber(prev.endAngle, d.endAngle);
          return (t: number) =>
            pieArc({ ...d, startAngle: iStart(t), endAngle: iEnd(t) }) ?? '';
        });
    } else {
      // Initial render: draw immediately and seed previous-datum for later tweens
      $paths
        .each(function (this: SVGPathElement, d) {
          (this as ArcPathElement)._prevDatum = d;
        })
        .attr('d', d => pieArc(d) ?? '');
    }

    // Label polylines and text
    const $chartContainer = svg.select('.chart-container');

    if (this.showLabels) {
      const pointsFn = (d: d3.PieArcDatum<ChartPieItem>) => {
        const posA = pieArc.centroid(d);
        const posB = labelsArc.centroid(d);
        const posC = posB.slice() as [number, number];
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        posC[0] = radius * (midAngle < Math.PI ? 1 : -1);
        return [posA, posB, posC].map(p => p.join(',')).join(' ');
      };

      const transformFn = (d: d3.PieArcDatum<ChartPieItem>) => {
        const pos = labelsArc.centroid(d);
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        pos[0] = radius * (midAngle < Math.PI ? 1 : -1);
        return `translate(${pos})`;
      };

      const anchorFn = (d: d3.PieArcDatum<ChartPieItem>) => {
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        return midAngle < Math.PI ? 'start' : 'end';
      };

      const $polylines = $chartContainer
        .selectAll<SVGPolylineElement, d3.PieArcDatum<ChartPieItem>>(
          '.item-polyline',
        )
        .data(pieData, d => d.data.name)
        .join('polyline')
        .attr('class', 'item-polyline');

      const $labels = $chartContainer
        .selectAll<SVGTextElement, d3.PieArcDatum<ChartPieItem>>('.item-label')
        .data(pieData, d => d.data.name)
        .join('text')
        .attr('class', 'item-label')
        .text(d => d.data.label ?? '');

      if (animate) {
        $polylines
          .transition()
          .duration(DURATION)
          .ease(d3.easeCubicInOut)
          .attr('points', pointsFn);
        $labels
          .transition()
          .duration(DURATION)
          .ease(d3.easeCubicInOut)
          .attr('transform', transformFn)
          .style('text-anchor', anchorFn);
      } else {
        $polylines.attr('points', pointsFn);
        $labels.attr('transform', transformFn).style('text-anchor', anchorFn);
      }
    } else {
      $chartContainer.selectAll('.item-polyline').remove();
      $chartContainer.selectAll('.item-label').remove();
    }
  }

  render() {
    return html`
      <div class="chart">
        <svg>
          <g class="chart-container">
            <g class="arc-container"></g>
          </g>
        </svg>
      </div>
    `;
  }
}
