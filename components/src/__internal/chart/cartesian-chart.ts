import { html, svg } from 'lit';
import { property } from 'lit/decorators.js';
import { ScaleBand, ScaleLinear, ScalePoint, select, Selection } from 'd3';
import { ChartBase, chartColor } from './chart-base.js';
import type {
  ChartConfig,
  ChartDatum,
  ChartSelectDetail,
  ChartSeries,
  ChartTooltipModel,
} from './types.js';

export type ChartOrientation = 'vertical' | 'horizontal';

/** Plot margins and inner size, in SVG pixels. */
export type CartesianLayout = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  innerWidth: number;
  innerHeight: number;
};

/** Rough width of a `label-medium` character, used to size axes before text is measured. */
const CHAR_WIDTH = 7;
const AXIS_GAP = 8;
const X_AXIS_HEIGHT = 24;
const MAX_CATEGORY_AXIS_WIDTH = 120;

type CategoryScale = ScaleBand<string> | ScalePoint<string>;

/**
 * Base for charts with a category axis and a value axis (bar, line, area). Data is an array of
 * rows; `categoryKey` names the category field and `config` names the series fields.
 */
export abstract class CartesianChart extends ChartBase {
  // ── Properties

  /** Rows to plot. Each row holds the category field (`category-key`) and a number per series. */
  @property({ type: Array }) data: ChartDatum[] = [];

  /** Series to plot, keyed by data field, with optional label and color. Defaults to every numeric field. */
  @property({ type: Object }) config: ChartConfig = {};

  /** Data field that holds the category label, for example `month`. */
  @property({ type: String, attribute: 'category-key' }) categoryKey: string =
    '';

  /** Hides the gridlines. */
  @property({ type: Boolean, attribute: 'hide-grid' }) hideGrid: boolean =
    false;

  /** Hides the category axis labels. */
  @property({ type: Boolean, attribute: 'hide-category-axis' })
  hideCategoryAxis: boolean = false;

  /** Hides the value axis labels. */
  @property({ type: Boolean, attribute: 'hide-value-axis' })
  hideValueAxis: boolean = false;

  // ── Private fields

  /** Current plot layout, set by `computeLayout()`. */
  protected layout: CartesianLayout = {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    innerWidth: 0,
    innerHeight: 0,
  };

  /** Which axis carries the categories. */
  protected orientation: ChartOrientation = 'vertical';

  /** Category centers along the category axis, in inner plot coordinates. */
  protected centers: number[] = [];

  /** Width of one category slot along the category axis. */
  protected step: number = 0;

  /** Tooltip anchor per category, in plot element coordinates. */
  protected anchors: { x: number; y: number }[] = [];

  /** Whether the cursor is a band (bars) or a line (line, area). */
  protected cursorKind: 'band' | 'line' = 'band';

  // ── Overrides

  protected drawProperties(): string[] {
    return [
      ...super.drawProperties(),
      'data',
      'config',
      'categoryKey',
      'hideGrid',
      'hideCategoryAxis',
      'hideValueAxis',
    ];
  }

  protected hasData(): boolean {
    return this.data.length > 0 && this.seriesKeys().length > 0;
  }

  protected getSeries(): ChartSeries[] {
    return this.seriesKeys().map((key, i) => ({
      key,
      label: this.config[key]?.label ?? key,
      color: this.config[key]?.color ?? chartColor(i),
    }));
  }

  protected getItemCount(): number {
    return this.data.length;
  }

  protected itemAtPoint(x: number, y: number): number {
    const { left, top, innerWidth, innerHeight } = this.layout;
    const px = x - left;
    const py = y - top;
    if (px < 0 || py < 0 || px > innerWidth || py > innerHeight) return -1;
    const along = this.orientation === 'vertical' ? px : py;
    let best = -1;
    let bestDistance = Infinity;
    this.centers.forEach((center, i) => {
      const distance = Math.abs(center - along);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = i;
      }
    });
    return best;
  }

  protected getTooltip(index: number): ChartTooltipModel | undefined {
    const datum = this.data[index];
    if (!datum) return undefined;
    const anchor = this.anchors[index] ?? { x: 0, y: 0 };
    return {
      title: this.categoryLabel(index),
      rows: this.visibleSeries().map(series => ({
        key: series.key,
        label: series.label,
        color: series.color,
        value: this.formatValue(this.seriesValue(datum, series.key)),
      })),
      x: anchor.x,
      y: anchor.y,
    };
  }

  protected getSelectDetail(index: number): ChartSelectDetail {
    return { index, datum: this.data[index] };
  }

  protected drawHighlight(): void {
    const root = this.plotArea();
    if (!root) return;
    const cursor = root.select<SVGRectElement>('.cursor');
    const index = this.activeIndex;
    if (index < 0 || this.centers[index] === undefined) {
      cursor.classed('is-visible', false);
      return;
    }
    const { innerWidth, innerHeight } = this.layout;
    const center = this.centers[index];
    const size = this.cursorKind === 'band' ? this.step : 1;
    cursor
      .classed('cursor-line', this.cursorKind === 'line')
      .classed('is-visible', true);
    if (this.orientation === 'vertical') {
      cursor
        .attr('x', center - size / 2)
        .attr('y', 0)
        .attr('width', size)
        .attr('height', innerHeight);
    } else {
      cursor
        .attr('x', 0)
        .attr('y', center - size / 2)
        .attr('width', innerWidth)
        .attr('height', size);
    }
  }

  protected renderSvgContent() {
    return svg`<defs></defs>
      <g class="plot-area">
        <g class="grid"></g>
        <rect class="cursor"></rect>
        <g class="marks"></g>
        <g class="value-labels"></g>
        <g class="category-axis"></g>
        <g class="value-axis"></g>
        <g class="active-layer"></g>
      </g>`;
  }

  protected renderTable() {
    const series = this.getSeries();
    return html`<thead>
        <tr>
          <th scope="col">
            ${this.categoryField() || this.i18n.t('category')}
          </th>
          ${series.map(s => html`<th scope="col">${s.label}</th>`)}
        </tr>
      </thead>
      <tbody>
        ${this.data.map(
          (datum, i) =>
            html`<tr>
              <th scope="row">${this.categoryLabel(i)}</th>
              ${series.map(
                s =>
                  html`<td>
                    ${this.formatValue(this.seriesValue(datum, s.key))}
                  </td>`,
              )}
            </tr>`,
        )}
      </tbody>`;
  }

  // ── Helpers for subclasses

  /** The category field (`categoryKey`). */
  protected categoryField(): string {
    return this.categoryKey;
  }

  /** Series keys from `config`, or every numeric field of the first row except the category field. */
  protected seriesKeys(): string[] {
    const configured = Object.keys(this.config ?? {});
    if (configured.length) return configured;
    const first = this.data[0];
    if (!first) return [];
    const category = this.categoryField();
    return Object.keys(first).filter(
      key => key !== category && typeof first[key] === 'number',
    );
  }

  /** Series not switched off in the legend. */
  protected visibleSeries(): ChartSeries[] {
    return this.getSeries().filter(series => !this.isHidden(series.key));
  }

  /** A row's value for a series, 0 when missing. */
  protected seriesValue(datum: ChartDatum, key: string): number {
    const value = Number(datum[key]);
    return Number.isFinite(value) ? value : 0;
  }

  /** Category label of a row. */
  protected categoryLabel(index: number): string {
    const datum = this.data[index];
    if (!datum) return '';
    const field = this.categoryField();
    return field ? String(datum[field] ?? '') : String(index + 1);
  }

  /** Category domain: row positions, so repeated labels stay distinct. */
  protected categoryDomain(): string[] {
    return this.data.map((_, i) => String(i));
  }

  /** The `.plot-area` group, or undefined before the SVG renders. */
  protected plotArea():
    | Selection<SVGGElement, unknown, null, undefined>
    | undefined {
    if (!this.svgElement) return undefined;
    return select(this.svgElement).select<SVGGElement>(
      '.plot-area',
    ) as unknown as Selection<SVGGElement, unknown, null, undefined>;
  }

  /**
   * Sets `layout` from the value scale's ticks and the category labels. Call before setting the
   * scales' ranges. `valueLabelSpace` reserves room for value labels at the end of the marks.
   */
  protected computeLayout(
    valueScale: ScaleLinear<number, number>,
    valueLabelSpace = 0,
  ) {
    const { width, height } = this.svgSize();
    const tickWidth =
      Math.max(...valueScale.ticks(5).map(t => this.formatTick(t).length), 1) *
        CHAR_WIDTH +
      AXIS_GAP;
    const categoryWidth = Math.min(
      Math.max(...this.data.map((_, i) => this.categoryLabel(i).length), 1) *
        CHAR_WIDTH +
        AXIS_GAP,
      MAX_CATEGORY_AXIS_WIDTH,
    );

    let left: number;
    let bottom: number;
    let top = 8;
    let right = 8;
    if (this.orientation === 'vertical') {
      left = this.hideValueAxis ? 4 : tickWidth;
      bottom = this.hideCategoryAxis ? 4 : X_AXIS_HEIGHT;
      top += valueLabelSpace ? 12 : 0;
      // Room for half of the last category label.
      right += this.hideCategoryAxis ? 0 : 4;
    } else {
      left = this.hideCategoryAxis ? 4 : categoryWidth;
      bottom = this.hideValueAxis ? 4 : X_AXIS_HEIGHT;
      right += valueLabelSpace;
    }

    this.layout = {
      left,
      top,
      right,
      bottom,
      innerWidth: Math.max(width - left - right, 0),
      innerHeight: Math.max(height - top - bottom, 0),
    };
  }

  /**
   * Draws gridlines, the zero baseline and both axes' labels, and records category centers.
   * The scales must already have their ranges set from `layout`.
   */
  protected drawFrame(
    categoryScale: CategoryScale,
    valueScale: ScaleLinear<number, number>,
  ) {
    const root = this.plotArea();
    if (!root) return;
    const { left, top, innerWidth, innerHeight } = this.layout;
    const vertical = this.orientation === 'vertical';
    root.attr('transform', `translate(${left},${top})`);

    const domain = categoryScale.domain();
    const bandwidth = categoryScale.bandwidth();
    this.step = categoryScale.step();
    this.centers = domain.map(key => (categoryScale(key) ?? 0) + bandwidth / 2);

    // Gridlines at each value tick; the zero line is solid.
    const ticks = valueScale.ticks(5);
    const gridTicks = this.hideGrid ? [] : ticks.filter(t => t !== 0);
    root
      .select('.grid')
      .selectAll<SVGLineElement, number>('line.gridline')
      .data(gridTicks, d => String(d))
      .join('line')
      .attr('class', 'gridline')
      .attr('x1', d => (vertical ? 0 : valueScale(d)))
      .attr('x2', d => (vertical ? innerWidth : valueScale(d)))
      .attr('y1', d => (vertical ? valueScale(d) : 0))
      .attr('y2', d => (vertical ? valueScale(d) : innerHeight));

    const zero = valueScale(0);
    root
      .select('.grid')
      .selectAll<SVGLineElement, number>('line.baseline')
      .data([zero])
      .join('line')
      .attr('class', 'baseline')
      .attr('x1', vertical ? 0 : zero)
      .attr('x2', vertical ? innerWidth : zero)
      .attr('y1', vertical ? zero : 0)
      .attr('y2', vertical ? zero : innerHeight);

    // Value axis labels.
    const showValueAxis = !this.hideValueAxis;
    root
      .select('.value-axis')
      .selectAll<SVGTextElement, number>('text')
      .data(showValueAxis ? ticks : [], d => String(d))
      .join('text')
      .attr('class', 'axis-label')
      .attr('text-anchor', vertical ? 'end' : 'middle')
      .attr('dominant-baseline', vertical ? 'middle' : 'hanging')
      .attr('x', d => (vertical ? -AXIS_GAP : valueScale(d)))
      .attr('y', d => (vertical ? valueScale(d) : innerHeight + AXIS_GAP))
      .text(d => this.formatTick(d));

    // Category axis labels, thinned out when they would overlap.
    const showCategoryAxis = !this.hideCategoryAxis;
    const longest = Math.max(
      ...domain.map((_, i) => this.categoryLabel(i).length),
      1,
    );
    const labelSize = vertical ? longest * CHAR_WIDTH + AXIS_GAP : 18;
    const every = Math.max(1, Math.ceil(labelSize / Math.max(this.step, 1)));
    const shown = showCategoryAxis
      ? domain.filter((_, i) => i % every === 0)
      : [];
    root
      .select('.category-axis')
      .selectAll<SVGTextElement, string>('text')
      .data(shown, d => d)
      .join('text')
      .attr('class', 'axis-label')
      .attr('text-anchor', vertical ? 'middle' : 'end')
      .attr('dominant-baseline', vertical ? 'hanging' : 'middle')
      .attr('x', d =>
        vertical ? (categoryScale(d) ?? 0) + bandwidth / 2 : -AXIS_GAP,
      )
      .attr('y', d =>
        vertical
          ? innerHeight + AXIS_GAP
          : (categoryScale(d) ?? 0) + bandwidth / 2,
      )
      .text(d => this.categoryLabel(Number(d)));
  }
}
