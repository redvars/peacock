import { property } from 'lit/decorators.js';
import {
  max,
  min,
  scaleBand,
  scaleLinear,
  stack,
  stackOffsetDiverging,
} from 'd3';
import IndividualComponent from '@/IndividualComponent.js';
import {
  CartesianChart,
  ChartOrientation,
} from '../__internal/chart/cartesian-chart.js';
import { roundedRectPath } from '../__internal/chart/paths.js';
import baseStyles from '../__internal/chart/chart-base.scss';

export type {
  ChartConfig,
  ChartDatum,
  ChartLegendMode,
  ChartSelectDetail,
  ChartSeriesConfig,
  ChartValueFormatter,
} from '../__internal/chart/types.js';

/** Gap between stacked segments, in pixels. */
const STACK_GAP = 2;

/** Room reserved for value labels at the end of horizontal bars, per character. */
const VALUE_CHAR_WIDTH = 7;

/** One drawn bar or stacked segment. */
type BarModel = {
  id: string;
  index: number;
  key: string;
  color: string;
  /** Start along the category axis. */
  position: number;
  /** Size along the category axis. */
  thickness: number;
  /** Value the bar starts at. */
  from: number;
  /** Value the bar ends at. */
  to: number;
  /** Whether the end away from zero is rounded. */
  rounded: boolean;
  /** Pixels trimmed from the zero-side end, to separate stacked segments. */
  gap: number;
};

/** A value label at the end of a bar or stack. */
type ValueLabelModel = {
  id: string;
  index: number;
  value: number;
  /** Center along the category axis. */
  center: number;
};

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
@IndividualComponent
export class ChartBar extends CartesianChart {
  // ── Static

  static styles = [baseStyles];

  // ── Properties

  /** Stacks the series in each category instead of placing them side by side. */
  @property({ type: Boolean, reflect: true }) stacked: boolean = false;

  /** `vertical` draws columns; `horizontal` draws bars from the left. */
  @property({ type: String, reflect: true }) orientation: ChartOrientation =
    'vertical';

  /** Prints each bar's value (each stack's total when stacked) at its end. */
  @property({ type: Boolean, attribute: 'show-values' }) showValues: boolean =
    false;

  // ── Private fields

  /** Bars from the last draw, for highlighting. */
  private bars: BarModel[] = [];

  // ── Private methods

  protected drawProperties(): string[] {
    return [...super.drawProperties(), 'stacked', 'orientation', 'showValues'];
  }

  /** Corner radius of the rounded end, from `--shape-corner-extra-small`. */
  private cornerRadius(): number {
    const value = parseFloat(
      getComputedStyle(this).getPropertyValue('--shape-corner-extra-small'),
    );
    return Number.isFinite(value) ? value : 4;
  }

  /** Bars and value labels in data space; positions are filled once scales exist. */
  private buildModels() {
    const series = this.visibleSeries();
    const keys = series.map(s => s.key);
    const colors = new Map(series.map(s => [s.key, s.color]));
    const bars: Omit<BarModel, 'position' | 'thickness'>[] = [];
    const labels: Omit<ValueLabelModel, 'center'>[] = [];

    if (this.stacked) {
      const layers = stack<Record<string, unknown>, string>()
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
          value: keys.reduce(
            (sum, key) => sum + this.seriesValue(datum, key),
            0,
          ),
        });
      });
    } else {
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

  protected draw(animate: boolean): void {
    const root = this.plotArea();
    if (!root) return;
    const vertical = this.orientation !== 'horizontal';
    const { keys, bars, labels } = this.buildModels();

    const ends = bars.flatMap(bar => [bar.from, bar.to]);
    const valueScale = scaleLinear()
      .domain([Math.min(min(ends) ?? 0, 0), Math.max(max(ends) ?? 0, 0) || 1])
      .nice(5);

    const longestValue = Math.max(
      ...labels.map(l => this.formatValue(l.value).length),
      1,
    );
    // Vertical charts only need a flag for headroom; horizontal ones need the label width.
    let valueLabelSpace = 0;
    if (this.showValues) {
      valueLabelSpace = vertical ? 1 : longestValue * VALUE_CHAR_WIDTH + 8;
    }
    this.computeLayout(valueScale, valueLabelSpace);
    const { left, top, innerWidth, innerHeight } = this.layout;

    const categoryScale = scaleBand<string>()
      .domain(this.categoryDomain())
      .range([0, vertical ? innerWidth : innerHeight])
      .paddingInner(keys.length > 1 && !this.stacked ? 0.2 : 0.3)
      .paddingOuter(0.15);
    valueScale.range(vertical ? [innerHeight, 0] : [0, innerWidth]);
    this.drawFrame(categoryScale, valueScale);

    const groupScale = scaleBand<string>()
      .domain(this.stacked ? ['all'] : keys)
      .range([0, categoryScale.bandwidth()])
      .padding(this.stacked || keys.length < 2 ? 0 : 0.1);

    const placed: BarModel[] = bars.map(bar => ({
      ...bar,
      position:
        (categoryScale(String(bar.index)) ?? 0) +
        (groupScale(this.stacked ? 'all' : bar.key) ?? 0),
      thickness: groupScale.bandwidth(),
    }));
    this.bars = placed;

    const radius = this.cornerRadius();
    const path = (bar: BarModel, grown: boolean) => {
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
        return roundedRectPath(
          bar.position,
          base,
          bar.thickness,
          length,
          positive ? [r, r, 0, 0] : [0, 0, r, r],
        );
      }
      const x = positive ? start + (grown ? bar.gap : 0) : end;
      return roundedRectPath(
        grown ? x : zero,
        bar.position,
        length,
        bar.thickness,
        positive ? [0, r, r, 0] : [r, 0, 0, r],
      );
    };

    const marks = root
      .select('.marks')
      .selectAll<SVGPathElement, BarModel>('path.bar')
      .data(placed, d => d.id)
      .join(enter =>
        enter
          .append('path')
          .attr('class', 'mark bar')
          .attr('d', d => path(d, false)),
      )
      .attr('data-index', d => d.index)
      .attr('data-key', d => d.key)
      .style('fill', d => d.color);
    this.motion(marks, animate).attr('d', d => path(d, true));

    // Value labels sit just past the end of each bar or stack.
    const center = (label: Omit<ValueLabelModel, 'center'>) => {
      if (this.stacked) {
        return (
          (categoryScale(String(label.index)) ?? 0) +
          categoryScale.bandwidth() / 2
        );
      }
      const key = label.id.split(':').slice(1).join(':');
      return (
        (categoryScale(String(label.index)) ?? 0) +
        (groupScale(key) ?? 0) +
        groupScale.bandwidth() / 2
      );
    };
    const labelModels: ValueLabelModel[] = this.showValues
      ? labels.map(label => ({ ...label, center: center(label) }))
      : [];
    const valueLabels = root
      .select('.value-labels')
      .selectAll<SVGTextElement, ValueLabelModel>('text')
      .data(labelModels, d => d.id)
      .join(enter =>
        enter
          .append('text')
          .attr('class', 'value-label')
          .attr('x', d => (vertical ? d.center : valueScale(0)))
          .attr('y', d => (vertical ? valueScale(0) : d.center)),
      )
      .attr('text-anchor', d => {
        if (vertical) return 'middle';
        return d.value < 0 ? 'end' : 'start';
      })
      .attr('dominant-baseline', vertical ? 'auto' : 'middle')
      .text(d => this.formatValue(d.value));
    this.motion(valueLabels, animate)
      .attr('x', d =>
        vertical ? d.center : valueScale(d.value) + (d.value < 0 ? -6 : 6),
      )
      .attr('y', d =>
        vertical ? valueScale(d.value) + (d.value < 0 ? 14 : -6) : d.center,
      );

    // Tooltip anchors at the far end of each category.
    this.anchors = this.data.map((_, index) => {
      const own = placed.filter(bar => bar.index === index);
      const far = max(own, bar => bar.to) ?? 0;
      const c =
        (categoryScale(String(index)) ?? 0) + categoryScale.bandwidth() / 2;
      return vertical
        ? { x: left + c, y: top + Math.max(valueScale(far), 24) }
        : { x: left + Math.min(valueScale(far), innerWidth - 24), y: top + c };
    });
  }

  protected drawHighlight(): void {
    super.drawHighlight();
    const root = this.plotArea();
    if (!root) return;
    const { activeIndex, activeSeries } = this;
    root
      .select('.marks')
      .selectAll<SVGPathElement, BarModel>('path.bar')
      .classed(
        'is-dimmed',
        d =>
          (activeIndex >= 0 && d.index !== activeIndex) ||
          (activeSeries !== undefined && d.key !== activeSeries),
      );
  }

  protected getSelectDetail(index: number) {
    const detail = super.getSelectDetail(index);
    // A single visible series identifies the bar exactly.
    const visible = this.bars.filter(bar => bar.index === index);
    return visible.length === 1
      ? { ...detail, series: visible[0].key }
      : detail;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wc-chart-bar': ChartBar;
  }
}
