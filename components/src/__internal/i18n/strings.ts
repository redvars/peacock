/**
 * Every user-facing string Peacock renders on its own: labels for icon buttons, screen-reader text,
 * empty states, toolbar names. Apps translate them once with `setPeacockStrings()`; components that
 * render many strings also take a per-instance `strings` property. A string with values is a function.
 *
 * Numbers and dates are formatted with `Intl` in the resolved locale, never here.
 */
export const defaultStrings = {
  // ── Shared ─────────────────────────────────────────────────────────────────
  dismiss: 'Dismiss',
  close: 'Close',
  clear: 'Clear',
  loading: 'Loading',
  today: 'Today',
  disabled: 'Disabled',
  readOnly: 'Read only',
  dragToReorder: 'Drag to reorder',
  readOnlyTag: 'Read Only',

  // ── Intents (alert, notification) ────────────────────────────────────────
  intentNote: 'Note',
  intentInfo: 'Info',
  intentSuccess: 'Success',
  intentWarning: 'Warning',
  intentError: 'Error',
  intentInformation: 'Information',

  // ── Fields ────────────────────────────────────────────────────────────────
  showPassword: 'Show password',
  hidePassword: 'Hide password',
  invalidUrl: 'Please enter a valid URL',
  editUrl: 'Edit URL',
  slider: 'Slider',
  increase: 'Increase',
  decrease: 'Decrease',

  // ── Validation (for controls without a native input to ask) ──────────────
  // Worded like the browser's own messages, which fields with a native input show.
  valueMissing: 'Please fill out this field.',
  valueMissingSelect: 'Please select an item in the list.',
  valueMissingCheckbox: 'Please check this box if you want to proceed.',
  valueMissingRadio: 'Please select one of these options.',

  // ── Search and select ────────────────────────────────────────────────────
  search: 'Search',
  clearSearch: 'Clear search',
  searchOptions: 'Search options',
  selectOption: 'Select option',
  options: 'Options',
  noResults: 'No results',
  noOptions: 'No options',
  /** Label of an option whose value is empty and that has no label of its own. */
  none: 'None',
  /** Row of a select with `allow-custom` that keeps the typed text, for example `Create "Kiwi"`. */
  createOption: (text: string): string => `Create "${text}"`,

  // ── Color ────────────────────────────────────────────────────────────────
  chooseColor: 'Choose color',
  hexColor: 'Hex color',
  hexColorValue: 'Hex color value',
  hexLabel: 'HEX',
  saturationAndBrightness: 'Saturation and brightness',
  hue: 'Hue',
  opacity: 'Opacity',
  opacityPercentage: 'Opacity percentage',
  hexColorError: 'Enter a hex color, such as #7c5df0',
  /** The same error for a color field with `alpha`, which also takes an opacity. */
  hexColorAlphaError: 'Enter a hex color, such as #7c5df0 or #7c5df080',
  /** Spoken value of the saturation and brightness area, for example "Saturation 40%, Brightness 80%". */
  saturationBrightnessValue: (saturation: string, brightness: string): string =>
    `Saturation ${saturation}%, Brightness ${brightness}%`,

  // ── Date and time ────────────────────────────────────────────────────────
  chooseDate: 'Choose date',
  chooseDateAndTime: 'Choose date and time',
  chooseTime: 'Choose time',
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  previousYear: 'Previous year',
  nextYear: 'Next year',
  previousYears: 'Previous years',
  nextYears: 'Next years',
  hours: 'Hours',
  minutes: 'Minutes',
  seconds: 'Seconds',
  dayPeriod: 'AM/PM',
  /** Error for text that does not parse; `format` is the format hint, for example "MM/DD/YYYY". */
  enterFormat: (format: string): string => `Enter ${format}`,
  /** Errors for a value outside `min` or `max`; the argument is the formatted limit. */
  pickDateOnOrAfter: (date: string): string =>
    `Pick a date on or after ${date}`,
  pickDateOnOrBefore: (date: string): string =>
    `Pick a date on or before ${date}`,
  /** Error for a date `isDateDisabled` rules out; the argument is the formatted date. */
  dateUnavailable: (date: string): string => `${date} isn't available`,
  pickTimeAtOrAfter: (time: string): string =>
    `Pick a time at or after ${time}`,
  pickTimeAtOrBefore: (time: string): string =>
    `Pick a time at or before ${time}`,
  pickDateTimeOnOrAfter: (dateTime: string): string =>
    `Pick a time on or after ${dateTime}`,
  pickDateTimeOnOrBefore: (dateTime: string): string =>
    `Pick a time on or before ${dateTime}`,

  // ── Calendar ─────────────────────────────────────────────────────────────
  day: 'Day',
  week: 'Week',
  month: 'Month',
  previousPeriod: 'Previous',
  nextPeriod: 'Next',
  invalidView: 'Invalid view',

  // ── Overlays and feedback ────────────────────────────────────────────────
  closeDialog: 'Close dialog',
  closeNotification: 'Close notification',
  dismissNotification: 'Dismiss notification',
  dismissAlert: 'Dismiss alert',
  bottomSheet: 'Bottom sheet',
  sideSheet: 'Side sheet',
  closeSheet: 'Close sheet',
  imagePreview: 'Image preview',
  closePreview: 'Close preview',
  openMenu: 'Open menu',
  openSplitButtonMenu: 'Open split button menu',
  /** Title of the svg preview dialog, for example "Preview: Logo". */
  previewTitle: (title: string): string => `Preview: ${title}`,
  svgPreview: 'SVG preview',

  // ── Navigation ───────────────────────────────────────────────────────────
  navigation: 'Navigation',
  mainNavigation: 'Main navigation',
  breadcrumb: 'Breadcrumb',
  pagination: 'Pagination',
  page: 'Page',
  rowsPerPage: 'Rows per page',
  firstPage: 'First page',
  previousPage: 'Previous page',
  nextPage: 'Next page',
  lastPage: 'Last page',
  /** Range of rows shown, for example "1–10 of 42". `total` is undefined when it is unknown. */
  pageRange: (start: string, end: string, total?: string): string =>
    total === undefined ? `${start}–${end}` : `${start}–${end} of ${total}`,
  /** Range text when there are no rows; `zero` is 0 in the locale's digits. */
  emptyPageRange: (zero: string): string => `${zero} of ${zero}`,
  /** Screen-reader announcement of the range, for example "Showing 1–10 of 42". */
  showingRange: (range: string): string => `Showing ${range}`,
  /** Label of one page button, for example "Page 3". */
  pageNumber: (page: string): string => `Page ${page}`,
  /** Label of the page number field, for example "Page number, 24 pages". */
  pageNumberField: (pages: string): string => `Page number, ${pages} pages`,
  /** Text after the page number field, for example "of 24". */
  ofPages: (pages: string): string => `of ${pages}`,

  // ── Table ────────────────────────────────────────────────────────────────
  noItems: 'No items',
  noItemsDescription: 'There are no items to display',
  selectAllRowsOnPage: 'Select all rows on this page',
  selectRow: 'Select row',
  selection: 'Selection',
  selectedCount: (count: string): string => `${count} selected`,
  selectAllCount: (count: string): string => `Select all ${count}`,
  tableError: 'Something went wrong',
  tableErrorDescription: 'The data could not be loaded.',
  showHideColumns: 'Show or hide columns',
  /** Label of a column's resize handle, for example "Resize Name". */
  resizeColumn: (column: string): string => `Resize ${column}`,
  /** Text of a secondary sort level on its header, for example "Sort priority 2, ascending". */
  sortPriority: (priority: string, ascending: boolean): string =>
    `Sort priority ${priority}, ${ascending ? 'ascending' : 'descending'}`,
  /** Announced after a column moved, for example "Name moved to position 2 of 5". */
  columnMoved: (column: string, position: string, total: string): string =>
    `${column} moved to position ${position} of ${total}`,
  /** Header of the row expander column. */
  rowDetails: 'Row details',
  expandRow: 'Show row details',
  collapseRow: 'Hide row details',
  /** Toggle of a group header, for example "Expand group Brown". */
  expandGroup: (group: string): string => `Expand group ${group}`,
  collapseGroup: (group: string): string => `Collapse group ${group}`,
  /** Row count of a group header; `count` is formatted, `n` the number for plural rules. */
  groupRowCount: (count: string, n: number): string =>
    n === 1 ? `${count} row` : `${count} rows`,
  /** Group header of rows whose `group-by` value is empty. */
  emptyGroup: '(Empty)',
  /** Labels of the footer aggregates. */
  aggregateSum: 'Sum',
  aggregateAvg: 'Average',
  aggregateMin: 'Min',
  aggregateMax: 'Max',
  aggregateCount: 'Count',

  // ── Charts ───────────────────────────────────────────────────────────────
  chart: 'Chart',
  /** What screen readers call the plot (`aria-roledescription`), lower case. */
  chartRole: 'chart',
  chartData: 'Chart data',
  chartInstructions: (name: string): string =>
    `${name}. Use the arrow keys to explore the data.`,
  noData: 'No data',
  category: 'Category',
  name: 'Name',
  value: 'Value',
  share: 'Share',
  total: 'Total',

  // ── Code ─────────────────────────────────────────────────────────────────
  codeEditor: 'Code editor',
  copyToClipboard: 'Copy to clipboard',
  copied: 'Copied',
  copiedCode: 'Copied code to clipboard',
  wrapLines: 'Wrap lines',
  unwrapLines: 'Turn off line wrap',
  showMore: 'Show more',
  showLess: 'Show less',
  breakpoint: 'Breakpoint',
  pausedHere: 'Paused here',

  // ── Rich text editors ────────────────────────────────────────────────────
  formattingToolbar: 'Formatting toolbar',
  inlineFormatting: 'Inline formatting',
  insertBlock: 'Insert block',
  insertBlockBelow: 'Insert block below',
  undo: 'Undo',
  redo: 'Redo',
  bold: 'Bold',
  italic: 'Italic',
  underline: 'Underline',
  strikethrough: 'Strikethrough',
  inlineCode: 'Inline code',
  unorderedList: 'Unordered list',
  orderedList: 'Ordered list',
  heading1: 'Heading 1',
  heading2: 'Heading 2',
  heading3: 'Heading 3',
  bulletedList: 'Bulleted list',
  numberedList: 'Numbered list',
  quote: 'Quote',
  codeBlock: 'Code block',
  divider: 'Divider',
  visualMode: 'Visual',
  htmlMode: 'HTML',
  editorMode: 'Editor',
  markdownMode: 'Markdown',
  enterTextPlaceholder: 'Enter text…',
  slashCommandsPlaceholder: "Type '/' for commands…",

  // ── Condition builder ────────────────────────────────────────────────────
  addCondition: 'Add condition',
  addRule: 'Add rule',
  addInnerGroup: 'Add inner group',
  removeCondition: 'Remove condition',
  reorderCondition: 'Reorder condition',
  operatorAnd: 'And',
  operatorOr: 'Or',
  /** Label of the and/or toggle, for example "Match conditions with And". */
  matchConditionsWith: (operator: string): string =>
    `Match conditions with ${operator}`,
  /** Description of a rule's handle: the keys that move the rule. */
  reorderConditionHint:
    'Arrow Up and Arrow Down move the condition. Arrow Right moves it into the group beside it, Arrow Left out of its group.',
  /** Announced after a rule moved with the keyboard, for example "Moved to position 2 of 3". */
  conditionMoved: (position: number, total: number): string =>
    `Moved to position ${position} of ${total}`,
  /** Announced after a rule moved into a group with the keyboard. */
  conditionMovedIntoGroup: (position: number, total: number): string =>
    `Moved into group, position ${position} of ${total}`,
  /** Announced after a rule moved out of its group with the keyboard. */
  conditionMovedOutOfGroup: (position: number, total: number): string =>
    `Moved out of group, position ${position} of ${total}`,

  // ── Date range field ─────────────────────────────────────────────────────
  chooseDateRange: 'Choose date range',
  /** Accessible name of the list of preset ranges beside the calendar. */
  dateRangePresets: 'Preset ranges',

  // ── Character counter ────────────────────────────────────────────────────
  /** Text of a field's character counter, for example "12/100". */
  characterCount: (count: number, max: number): string => `${count}/${max}`,

  // ── Filter bar ───────────────────────────────────────────────────────────
  /** Accessible name of a filter bar without a `label`. */
  filters: 'Filters',
  addFilter: 'Add filter',
  clearFilters: 'Clear all',
  saveView: 'Save view',
  /** The views menu entry that shows every item, with no filter. */
  allItems: 'All',
  /** Accessible name of the saved views menu button. */
  views: 'Views',
  yes: 'Yes',
  no: 'No',
  /** Text of an active filter chip, for example "Status: Open". */
  filterValue: (label: string, value: string): string => `${label}: ${value}`,
  /** Count of values a filter chip does not show, for example "+2". */
  moreValues: (count: number): string => `+${count}`,
  /** Announced after a filter is removed, for example "Status filter removed". */
  filterRemoved: (label: string): string => `${label} filter removed`,
  /** Announced after "Clear all". */
  filtersCleared: 'All filters cleared',
};

/** The string table. Overrides must keep each entry's type, so a function stays a function. */
export type PeacockStrings = {
  [K in keyof typeof defaultStrings]: (typeof defaultStrings)[K];
};

export type PeacockStringKey = keyof PeacockStrings;

let current: PeacockStrings = { ...defaultStrings };

const listeners = new Set<() => void>();

/**
 * Replaces Peacock's strings, for example with a translation. Entries left out keep their English
 * default. Every connected component re-renders with the new strings.
 *
 * @example
 * setPeacockStrings({ dismiss: 'Fermer', selectedCount: n => `${n} sélectionnés` });
 */
export function setPeacockStrings(strings: Partial<PeacockStrings>): void {
  current = { ...defaultStrings, ...strings };
  listeners.forEach(listener => listener());
}

/** The current value of one string. */
export function peacockString<K extends PeacockStringKey>(
  key: K,
): PeacockStrings[K] {
  return current[key];
}

/** Calls the listener whenever the strings change; returns a function that stops listening. */
export function onPeacockStringsChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
