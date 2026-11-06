import { property } from 'lit/decorators.js';
import {
  area,
  curveLinear,
  curveMonotoneX,
  curveStepAfter,
  CurveFactory,
  line,
  max,
  min,
  scaleLinear,
  scalePoint,
  select,
  stack,
  stackOffsetNone,
} from 'd3';
import IndividualComponent from '@/IndividualComponent.js';
import { CartesianChart } from '../__internal/chart/cartesian-chart.js';
import baseStyles from '../__internal/chart/chart-base.scss';
import styles from './chart-line.scss';

export type {
  ChartConfig,
  ChartDatum,
  ChartLegendMode,
  ChartSelectDetail,
  ChartSeriesConfig,
  ChartValueFormatter,
} from '../__internal/chart/types.js';

export type ChartCurve = 'monotone' | 'linear' | 'step';

const CURVES: Record<ChartCurve, CurveFactory> = {
  monotone: curveMonotoneX,
  linear: curveLinear,
  step: curveStepAfter,
};

/** One point of a series: the category index and the value range it covers. */
type LinePoint = { index: number; y0: number; y1: number };

/** One series as drawn: its points, color and gradient id. */
type LineSeriesModel = {
  key: string;
  color: string;
  gradient: string;
  points: LinePoint[];
};

/** One dot. */
type DotModel = {
  id: string;
  key: string;
  color: string;
  index: number;
  value: number;
};

/**
 * @label Line Chart
 * @tag wc-chart-line
 * @rawTag chart-line
 * @summary Shows how values change across ordered categories such as time, with one line per series.
 * @tags charts
 *
 * @example
 * ```html
 * <wc-chart-line category-key="month" label="Visitors by month"></wc-chart-line>
 * <script>
 *   const chart = document.querySelector('wc-chart-line');
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
 *
 * @fires select - A category was clicked or chosen with Enter. `detail` holds `index` (the row position) and `datum`.
 * @fires chart-select - Deprecated: use `select`. Fires after `select` with the same detail.
 *
 * @csspart container - The outer wrapper.
 * @csspart plot - The focusable plot area holding the SVG.
 * @csspart tooltip - The tooltip.
 * @csspart legend - The legend.
 *
 * @cssprop --color-chart-1 - Color of the first series; series cycle through `--color-chart-1` to `--color-chart-8`.
 * @cssprop --chart-line-width - Stroke width of the lines. Defaults to `2px`.
 * @cssprop --chart-grid-color - Gridline and baseline color. Defaults to `--color-outline-variant`.
 * @cssprop --chart-axis-color - Axis label color. Defaults to `--color-on-surface-variant`.
 * @cssprop --chart-dim-opacity - Opacity of series that are not highlighted. Defaults to `0.4`.
 */
@IndividualComponent
export class ChartLine extends CartesianChart {
  // ── Static

  static styles = [baseStyles, styles];

  // ── Properties

  /** How points are joined: `monotone` (smooth), `linear` or `step`. */
  @property({ type: String, reflect: true }) curve: ChartCurve = 'monotone';

  /** Draws a dot at every point. Dots always show for the hovered category. */
  @property({ type: Boolean, attribute: 'show-dots' }) showDots: boolean =
    false;

  // ── Private fields

  /** Whether the area under each line is filled. */
  protected filled = false;

  /** Value scale from the last draw, used to place active dots. */
  private y = scaleLinear();

  /** Category positions from the last draw. */
  private x = scalePoint<string>();

  /** Series from the last draw. */
  private models: LineSeriesModel[] = [];

  // ── Constructor

  constructor() {
    super();
    this.cursorKind = 'line';
  }

  // ── Private methods

  protected drawProperties(): string[] {
    return [...super.drawProperties(), 'curve', 'showDots'];
  }

  /** Whether series stack on each other. Only areas stack. */
  protected isStacked(): boolean {
    return false;
  }

  private buildModels(): LineSeriesModel[] {
    const all = this.getSeries();
    const visible = this.visibleSeries();
    const gradientId = (key: string) =>
      `chart-gradient-${all.findIndex(s => s.key === key)}`;

    if (this.isStacked()) {
      const layers = stack<Record<string, unknown>, string>()
        .keys(visible.map(s => s.key))
        .value((d, key) => this.seriesValue(d, key))
        .offset(stackOffsetNone)(this.data);
      return visible.map((series, i) => ({
        key: series.key,
        color: series.color,
        gradient: gradientId(series.key),
        points: layers[i].map((point, index) => ({
          index,
          y0: point[0],
          y1: point[1],
        })),
      }));
    }

    return visible.map(series => ({
      key: series.key,
      color: series.color,
      gradient: gradientId(series.key),
      points: this.data.map((datum, index) => ({
        index,
        y0: 0,
        y1: this.seriesValue(datum, series.key),
      })),
    }));
  }

  protected draw(animate: boolean): void {
    const root = this.plotArea();
    if (!root || !this.svgElement) return;
    const models = this.buildModels();
    this.models = models;

    const values = models.flatMap(m => m.points.flatMap(p => [p.y0, p.y1]));
    const y = scaleLinear()
      .domain([
        Math.min(min(values) ?? 0, 0),
        Math.max(max(values) ?? 0, 0) || 1,
      ])
      .nice(5);
    this.computeLayout(y);
    const { left, top, innerWidth, innerHeight } = this.layout;

    const x = scalePoint<string>()
      .domain(this.categoryDomain())
      .range([0, innerWidth])
      .padding(this.data.length > 1 ? 0 : 0.5);
    y.range([innerHeight, 0]);
    this.x = x;
    this.y = y;
    this.drawFrame(x, y);

    const curve = CURVES[this.curve] ?? curveMonotoneX;
    const px = (p: LinePoint) => x(String(p.index)) ?? 0;
    const lineFor = (flat: boolean) =>
      line<LinePoint>()
        .x(px)
        .y(p => y(flat ? 0 : p.y1))
        .curve(curve);
    const areaFor = (flat: boolean) =>
      area<LinePoint>()
        .x(px)
        .y0(p => y(flat ? 0 : p.y0))
        .y1(p => y(flat ? 0 : p.y1))
        .curve(curve);

    // Vertical gradients for the area fills.
    {
      const gradients = select(this.svgElement)
        .select('defs')
        .selectAll<SVGLinearGradientElement, LineSeriesModel>('linearGradient')
        .data(this.filled ? models : [], d => d.key)
        .join(enter => {
          const g = enter
            .append('linearGradient')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', 0)
            .attr('y2', 1);
          g.append('stop').attr('class', 'stop-start').attr('offset', '0%');
          g.append('stop').attr('class', 'stop-end').attr('offset', '100%');
          return g;
        })
        .attr('id', d => d.gradient);
      gradients.select('.stop-start').style('stop-color', d => d.color);
      gradients.select('.stop-end').style('stop-color', d => d.color);
    }

    const groups = root
      .select('.marks')
      .selectAll<SVGGElement, LineSeriesModel>('g.series')
      .data(models, d => d.key)
      .join(enter => {
        const g = enter.append('g').attr('class', 'series mark');
        g.append('path')
          .attr('class', 'area')
          .attr('d', d => areaFor(true)(d.points));
        g.append('path')
          .attr('class', 'line')
          .attr('d', d => lineFor(true)(d.points));
        return g;
      })
      .attr('data-key', d => d.key);

    const areas = groups
      .select<SVGPathElement>('path.area')
      .style('display', this.filled ? 'inline' : 'none')
      .style('fill', d => `url(#${d.gradient})`);
    const lines = groups
      .select<SVGPathElement>('path.line')
      .style('stroke', d => d.color);
    this.motion(areas, animate).attr('d', d => areaFor(false)(d.points));
    this.motion(lines, animate).attr('d', d => lineFor(false)(d.points));

    const dots: DotModel[] = this.showDots
      ? models.flatMap(m =>
          m.points.map(p => ({
            id: `${m.key}:${p.index}`,
            key: m.key,
            color: m.color,
            index: p.index,
            value: p.y1,
          })),
        )
      : [];
    const dotSelection = root
      .select('.marks')
      .selectAll<SVGCircleElement, DotModel>('circle.dot')
      .data(dots, d => d.id)
      .join(enter =>
        enter
          .append('circle')
          .attr('class', 'dot mark')
          .attr('r', 3)
          .attr('cx', d => x(String(d.index)) ?? 0)
          .attr('cy', y(0)),
      )
      .attr('data-key', d => d.key)
      .style('fill', d => d.color);
    this.motion(dotSelection, animate)
      .attr('cx', d => x(String(d.index)) ?? 0)
      .attr('cy', d => y(d.value));

    this.anchors = this.data.map((_, index) => {
      const highest = max(models, m => m.points[index]?.y1) ?? 0;
      return {
        x: left + (x(String(index)) ?? 0),
        y: top + Math.max(y(highest), 24),
      };
    });
  }

  protected drawHighlight(): void {
    super.drawHighlight();
    const root = this.plotArea();
    if (!root) return;
    const { activeIndex, activeSeries } = this;

    root
      .select('.marks')
      .selectAll<SVGElement, { key: string }>('.mark')
      .classed(
        'is-dimmed',
        d => activeSeries !== undefined && d.key !== activeSeries,
      );

    const active =
      activeIndex >= 0
        ? this.models.map(m => ({
            key: m.key,
            color: m.color,
            value: m.points[activeIndex]?.y1 ?? 0,
          }))
        : [];
    root
      .select('.active-layer')
      .selectAll<
        SVGCircleElement,
        { key: string; color: string; value: number }
      >('circle')
      .data(active, d => d.key)
      .join('circle')
      .attr('class', 'active-dot')
      .attr('r', 4)
      .attr('cx', this.x(String(activeIndex)) ?? 0)
      .attr('cy', d => this.y(d.value))
      .style('fill', d => d.color);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wc-chart-line': ChartLine;
  }
}
