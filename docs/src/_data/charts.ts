// Build-time data for the Charts section. The sidebar (WithChartsSidebar), the overview
// (pages/charts/index.astro) and the chart pages read it, so a new chart is one entry here
// plus its page folder.

export type ChartSlug = 'bar' | 'line' | 'area' | 'pie' | 'doughnut';

export interface ChartDefinition {
  slug: ChartSlug;
  /** Component raw tag, the key into custom-elements-jsdocs.json. */
  rawTag: string;
  label: string;
  href: string;
  /** When to reach for this chart. */
  useFor: string;
}

export interface ChartNavItem {
  label: string;
  href: string;
}

export const CHARTS: ChartDefinition[] = [
  {
    slug: 'bar',
    rawTag: 'chart-bar',
    label: 'Bar chart',
    href: '/charts/bar/',
    useFor: 'Comparing values across categories. Stack it to show parts of each total.',
  },
  {
    slug: 'line',
    rawTag: 'chart-line',
    label: 'Line chart',
    href: '/charts/line/',
    useFor: 'Trends over ordered categories such as days or months.',
  },
  {
    slug: 'area',
    rawTag: 'chart-area',
    label: 'Area chart',
    href: '/charts/area/',
    useFor: 'Trends where volume matters. Stack it to show how parts build a total over time.',
  },
  {
    slug: 'pie',
    rawTag: 'chart-pie',
    label: 'Pie chart',
    href: '/charts/pie/',
    useFor: 'Shares of a whole, with up to about five slices.',
  },
  {
    slug: 'doughnut',
    rawTag: 'chart-doughnut',
    label: 'Doughnut chart',
    href: '/charts/doughnut/',
    useFor: 'Shares of a whole with a headline number in the centre.',
  },
];

export const CHARTS_OVERVIEW: ChartNavItem = { label: 'Overview', href: '/charts/' };

export const CHARTS_THEMING: ChartNavItem = { label: 'Theming', href: '/charts/theming/' };

/** Sidebar and pager order. */
export const CHART_NAV: ChartNavItem[] = [
  CHARTS_OVERVIEW,
  ...CHARTS.map(({ label, href }) => ({ label, href })),
  CHARTS_THEMING,
];

/** Raw tags of every chart, so the Components section can leave them out. */
export const CHART_TAGS: string[] = CHARTS.map(chart => chart.rawTag);

// ── Sample data shared by the demos

export const MONTHLY_VISITORS = [
  { month: 'Jan', desktop: 186, mobile: 80 },
  { month: 'Feb', desktop: 305, mobile: 200 },
  { month: 'Mar', desktop: 237, mobile: 120 },
  { month: 'Apr', desktop: 73, mobile: 190 },
  { month: 'May', desktop: 209, mobile: 130 },
  { month: 'Jun', desktop: 214, mobile: 140 },
];

export const VISITORS_CONFIG = {
  desktop: { label: 'Desktop' },
  mobile: { label: 'Mobile' },
};

export const BROWSER_SHARE = [
  { name: 'chrome', label: 'Chrome', value: 275 },
  { name: 'safari', label: 'Safari', value: 200 },
  { name: 'firefox', label: 'Firefox', value: 187 },
  { name: 'edge', label: 'Edge', value: 173 },
  { name: 'other', label: 'Other', value: 90 },
];
