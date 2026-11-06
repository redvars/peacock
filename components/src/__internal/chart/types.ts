/** One series in a bar, line or area chart, keyed by the data field that holds its values. */
export type ChartSeriesConfig = {
  /** Display name in the legend and tooltip. Defaults to the key. */
  label?: string;
  /** Any CSS color. Defaults to the next `--color-chart-n` token. */
  color?: string;
};

/** Maps a data field to how its series is shown, for example `{ desktop: { label: 'Desktop' } }`. */
export type ChartConfig = Record<string, ChartSeriesConfig>;

/** One row of cartesian chart data: the category field (`index`) plus a number per series. */
export type ChartDatum = Record<string, unknown>;

/** Formats a value for tooltips, value labels and axis ticks. */
export type ChartValueFormatter = (value: number) => string;

/** A series resolved from config: key, label and color. */
export type ChartSeries = {
  key: string;
  label: string;
  color: string;
};

/** A row in the tooltip. */
export type ChartTooltipRow = {
  key: string;
  label: string;
  color: string;
  value: string;
};

/** What the tooltip shows and where. Coordinates are relative to the plot element. */
export type ChartTooltipModel = {
  title: string;
  rows: ChartTooltipRow[];
  x: number;
  y: number;
};

/** Detail of the `chart-select` event. */
export type ChartSelectDetail = {
  /** Index of the selected category or slice in `data`. */
  index: number;
  /** Series key, when a single series was selected. */
  series?: string;
  /** The selected data row. */
  datum: unknown;
};
