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
  /** The block style menu: paragraph text. */
  paragraph: 'Text',
  /** Label of the block style menu button. */
  textStyle: 'Text style',
  heading1: 'Heading 1',
  heading2: 'Heading 2',
  heading3: 'Heading 3',
  bulletedList: 'Bulleted list',
  numberedList: 'Numbered list',
  taskList: 'Checklist',
  quote: 'Quote',
  codeBlock: 'Code block',
  divider: 'Divider',
  table: 'Table',
  addRowBelow: 'Add row below',
  addColumnAfter: 'Add column after',
  deleteRow: 'Delete row',
  deleteColumn: 'Delete column',
  deleteTable: 'Delete table',
  link: 'Link',
  /** Label of the address field in the link editor. */
  linkAddress: 'Link address',
  applyLink: 'Apply',
  removeLink: 'Remove link',
  /** Shown when the typed link address cannot be used. */
  linkInvalid: 'Enter a web address, an email address or a relative path.',
  /** The toolbar button that starts a mention. */
  mentionSomeone: 'Mention someone',
  /** The toolbar toggle between the formatted view and the source. */
  viewSource: 'View source',
  enterTextPlaceholder: 'Enter text…',
  slashCommandsPlaceholder: "Type '/' for commands…",
  /** Announced when the slash menu has no match. */
  noMatchingBlocks: 'No matching blocks',
  // ── Document editor ──────────────────────────────────────────────────────
  /** Default accessible name of a document editor. */
  documentLabel: 'Document',
  documentPlaceholder: 'Start writing…',
  documentHeader: 'Header',
  documentFooter: 'Footer',
  /** Shown in an empty header or footer while it is edited. */
  documentHeaderPlaceholder: 'Header text',
  documentFooterPlaceholder: 'Footer text',
  /** Tooltip of a header or footer that is not being edited. */
  documentEditMarginal: 'Double-click to edit',
  pageBreak: 'Page break',
  insertImage: 'Image',
  textColor: 'Text color',
  defaultColor: 'Default',
  alignLeft: 'Align left',
  alignCenter: 'Center',
  alignRight: 'Align right',
  alignJustify: 'Justify',
  outline: 'Outline',
  /** The outline panel of a document without headings. */
  outlineEmpty: 'Headings you add appear here.',
  print: 'Print',
  pageSize: 'Page size',
  orientation: 'Orientation',
  portrait: 'Portrait',
  landscape: 'Landscape',
  margins: 'Margins',
  marginsNormal: 'Normal margins',
  marginsNarrow: 'Narrow margins',
  marginsWide: 'Wide margins',
  marginsCustom: 'Custom margins',
  insertPageNumber: 'Page number',
  pageCount: 'Page count',
  /** The button that comments on the selected text. */
  addComment: 'Comment',
  /** Accessible name of a document's comments column. */
  documentComments: 'Comments',
  /** Accessible name of the people editing a document together. */
  collaborators: 'People editing',
  /** Name shown for a collaborator without one. */
  anonymousCollaborator: 'Anonymous',
  /** Marks the current person in the list of collaborators, for example "Ana Lima (you)". */
  collaboratorYou: (name: string): string => `${name} (you)`,
  /** The word count in a document's status bar, for example "1,284 words". */
  wordCount: (count: number, formatted: string): string =>
    `${formatted} ${count === 1 ? 'word' : 'words'}`,
  /** The page indicator in a document's status bar, for example "Page 2 of 5". */
  documentPageOf: (page: string, total: string): string =>
    `Page ${page} of ${total}`,
  /** Accessible name of a document's zoom menu. */
  documentZoom: 'Zoom',
  /** The zoom that fits the page to the editor's width. */
  documentZoomFit: 'Fit width',
  /** Validation message when rich text is longer than `maxlength` characters. */
  richTextTooLong: (max: number): string => `Use ${max} characters or fewer`,

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

  // ── Pin input ────────────────────────────────────────────────────────────
  /** Accessible name of a numeric pin input's cell, for example "Digit 2 of 6". */
  pinInputDigit: (position: number, total: number): string =>
    `Digit ${position} of ${total}`,
  /** Accessible name of an alphanumeric pin input's cell, for example "Character 2 of 6". */
  pinInputCharacter: (position: number, total: number): string =>
    `Character ${position} of ${total}`,
  /** Message of a pin input whose code is only partly entered, for example "Enter all 6 characters.". */
  pinInputIncomplete: (total: number): string =>
    `Enter all ${total} characters.`,

  // ── File upload ──────────────────────────────────────────────────────────
  /** Drop zone text before the browse link, with `multiple`. */
  dropFilesHere: 'Drag files here or',
  /** Drop zone text before the browse link, without `multiple`. */
  dropFileHere: 'Drag a file here or',
  /** Browse link in the drop zone, with `multiple`. */
  chooseFiles: 'choose files',
  /** Browse link in the drop zone, without `multiple`. */
  chooseFile: 'choose a file',
  /** Accessible name of the list of chosen files. */
  chosenFiles: 'Chosen files',
  /** Remove button of a listed file, for example "Remove report.pdf". */
  removeFile: (name: string): string => `Remove ${name}`,
  /** Status of a file the app marked as done. */
  fileUploaded: 'Uploaded',
  /** Accessible name of a file's progress bar, for example "Uploading report.pdf". */
  uploadingFile: (name: string): string => `Uploading ${name}`,
  /** A file not added because `accept` does not allow it. */
  fileTypeRejected: (name: string): string =>
    `${name} is not an accepted file type`,
  /** A file not added because it is over `max-size`, for example "a.png is larger than 5 MB". */
  fileSizeRejected: (name: string, maxSize: string): string =>
    `${name} is larger than ${maxSize}`,
  /** A file not added because the list is full. */
  fileCountRejected: (name: string, maxFiles: number): string =>
    `${name} was not added: no more than ${maxFiles} ${maxFiles === 1 ? 'file' : 'files'}`,
  /** Announced after files are added. */
  filesAdded: (count: number): string =>
    count === 1 ? '1 file added' : `${count} files added`,
  /** Announced after a file is removed. */
  fileRemoved: (name: string): string => `${name} removed`,
  /** Validation message of a required file upload with no file. */
  valueMissingFile: 'Please select a file.',

  // ── Stepper ──────────────────────────────────────────────────────────────
  /** Accessible name of a stepper that has no `label`. */
  stepperLabel: 'Progress',
  /** Position of a step, read before its label, for example "Step 2 of 4". */
  stepPosition: (step: string, total: string): string =>
    `Step ${step} of ${total}`,
  stepCompleted: 'Completed',
  stepNotStarted: 'Not started',
  stepError: 'Error',
  stepOptional: 'Optional',

  // ── Tree ─────────────────────────────────────────────────────────────────
  /** Shown under a tree item while its children load. */
  treeLoading: 'Loading…',

  // ── Checkbox group and fieldset ──────────────────────────────────────────
  /** Validation message of a required checkbox group with nothing checked. */
  valueMissingCheckboxGroup: 'Please select at least one of these options.',
  /** Label of the checkbox group's select-all checkbox. */
  checkboxGroupSelectAll: 'Select all',

  // ── Form ─────────────────────────────────────────────────────────────────
  /** Headline of a form's error summary; `count` is formatted, `n` the number for plural rules. */
  formErrorSummary: (count: string, n: number): string =>
    n === 1
      ? `There is ${count} problem with this form`
      : `There are ${count} problems with this form`,
  /** One entry of a form's error summary, a link to the field. */
  formErrorItem: (label: string, message: string): string =>
    `${label}: ${message}`,

  // ── Phone and currency fields ────────────────────────────────────────────
  /** Accessible name of the phone field's country selector. */
  phoneCountry: 'Country',
  phoneInvalid: 'Enter a valid phone number',
  /** Accessible name of the currency field's currency selector. */
  currencyPicker: 'Currency',
  currencyInvalid: 'Enter a valid amount',
  /** An amount with more decimals than its currency has; 0 means whole amounts only. */
  currencyTooManyDecimals: (digits: number): string =>
    digits === 0
      ? 'Enter a whole amount'
      : `Enter an amount with at most ${digits} decimal place${digits === 1 ? '' : 's'}`,
  /** Below `min`, which arrives formatted with its currency, for example "€10.00". */
  currencyTooLow: (min: string): string => `Enter ${min} or more`,
  /** Above `max`, which arrives formatted with its currency. */
  currencyTooHigh: (max: string): string => `Enter ${max} or less`,

  // ── Description list, stat, sparkline ────────────────────────────────────
  /** Read in place of the dash shown for an empty description item or stat value. */
  notSet: 'Not set',
  /** Accessible name of a sparkline without values. */
  sparklineNoData: 'No data',
  /** Summary of a sparkline with one value, for example "Value 12". */
  sparklineValue: (value: string): string => `Value ${value}`,
  /** Summary of a sparkline, for example "Trend from 12 to 18, high 21, low 9". */
  sparklineSummary: (
    first: string,
    last: string,
    high: string,
    low: string,
  ): string => `Trend from ${first} to ${last}, high ${high}, low ${low}`,
  /** What a stat's change is measured against when it has no `comparison`. */
  statComparison: 'from last period',
  /** A stat's rise, for example "up 8% from last period". */
  statUp: (change: string, comparison: string): string =>
    `up ${change} ${comparison}`,
  /** A stat's fall, for example "down 3% from last period". */
  statDown: (change: string, comparison: string): string =>
    `down ${change} ${comparison}`,
  /** A stat without change, for example "unchanged from last period". */
  statUnchanged: (comparison: string): string => `unchanged ${comparison}`,
  /** Accessible name of a stat's info button, whose tooltip explains the metric. */
  statHelp: 'About this metric',

  // ── Transfer list and status indicator ───────────────────────────────────
  /** Default headline of a transfer list's source list. */
  transferListAvailable: 'Available',
  /** Default headline of a transfer list's list of chosen items. */
  transferListSelected: 'Selected',
  /** A transfer list's headline with its item count (formatted), for example "Selected (3)". */
  transferListHeadline: (headline: string, count: string): string =>
    `${headline} (${count})`,
  /** Button that moves the checked items, for example "Move checked items to Selected". */
  transferListMoveChecked: (target: string): string =>
    `Move checked items to ${target}`,
  /** Button that moves every shown item, for example "Move all items to Selected". */
  transferListMoveAll: (target: string): string =>
    `Move all items to ${target}`,
  /** Button that moves the checked selected items one place up. */
  transferListMoveUp: 'Move up',
  /** Button that moves the checked selected items one place down. */
  transferListMoveDown: 'Move down',
  /** Accessible name of a list's search box, for example "Search Available". */
  transferListSearch: (headline: string): string => `Search ${headline}`,
  /** Shown in a list with no items. */
  transferListEmpty: 'No items',
  /** Shown in a list whose items all miss the search. */
  transferListNoMatches: 'No matching items',
  /** Announced after a move; `formatted` is `count` formatted, for example "2 items moved to Selected". */
  transferListMoved: (
    count: number,
    formatted: string,
    target: string,
  ): string =>
    count === 1
      ? `1 item moved to ${target}`
      : `${formatted} items moved to ${target}`,
  /** Announced after reordering one item, for example "Editor, position 2 of 5". */
  transferListPosition: (
    label: string,
    position: string,
    total: string,
  ): string => `${label}, position ${position} of ${total}`,
  /** Accessible name of a dot-only status indicator without `label` or `intent`. */
  statusIndicatorNeutral: 'Status',

  // ── App shell, page header, resizable panels ─────────────────────────────
  /** The app shell's skip link, the first thing a keyboard user reaches. */
  skipToMainContent: 'Skip to main content',
  /** The app shell's menu button that opens the navigation drawer on narrow screens. */
  openNavigation: 'Open navigation',
  /** Accessible name of the page header's back link when it has no `back-label`. */
  back: 'Back',
  /** Accessible name of a divider between two resizable panels without labels. */
  resizePanels: 'Resize panels',
  /** Accessible name of a divider before a labelled panel, for example "Resize Inbox". */
  resizePanel: (panel: string): string => `Resize ${panel}`,

  // ── Stack, grid, avatar group, copy button ───────────────────────────────
  /** Default accessible name of a `wc-avatar-group`. */
  avatarGroupLabel: 'Members',
  /** Accessible name of the avatar group's overflow button; `count` is already formatted. */
  avatarGroupMore: (count: string): string => `${count} more`,
  /** Default accessible name and tooltip of a `wc-copy-button`. */
  copy: 'Copy',
  /** Tooltip and announcement of a `wc-copy-button` whose copy failed. */
  copyFailed: 'Copy failed',

  // ── Command palette, workspace switcher, user menu ───────────────────────
  /** Default accessible name of a command palette. */
  commandPalette: 'Command palette',
  /** Placeholder of a command palette's search field. */
  commandPalettePlaceholder: 'Type a command or search',
  /** Heading of the recent commands, shown while the query is empty. */
  commandPaletteRecent: 'Recent',
  /** Shown when no command matches, for example `No results for "deploy"`. */
  commandPaletteNoResults: (query: string): string =>
    `No results for "${query}"`,
  /** Shown when a command palette has no commands. */
  commandPaletteEmpty: 'No commands',
  /** Announced as results change; `formatted` is `count` formatted, for example "5 results". */
  commandPaletteResults: (count: number, formatted: string): string =>
    count === 1 ? '1 result' : `${formatted} results`,
  /** Accessible name of a workspace switcher's trigger, for example "Acme, switch workspace". */
  workspaceSwitcherTrigger: (name: string): string =>
    name ? `${name}, switch workspace` : 'Switch workspace',
  /** Accessible name of a workspace switcher's menu. */
  workspaceSwitcherMenu: 'Workspaces',
  /** Label of a workspace switcher's search field. */
  workspaceSwitcherSearch: 'Search workspaces',
  /** Shown when no workspace matches the search, for example `No workspaces match "acm"`. */
  workspaceSwitcherNoResults: (query: string): string =>
    `No workspaces match "${query}"`,
  /** A workspace switcher's create action (`creatable`). */
  workspaceSwitcherCreate: 'Create workspace',
  /** Accessible name of a user menu's avatar button, for example "Account menu for Ada Lovelace". */
  userMenuTrigger: (name: string): string =>
    name ? `Account menu for ${name}` : 'Account menu',
  /** Heading of a user menu's theme section. */
  userMenuTheme: 'Theme',
  userMenuThemeLight: 'Light',
  userMenuThemeDark: 'Dark',
  /** The theme that follows the operating system's light or dark setting. */
  userMenuThemeSystem: 'System',

  // ── Banner, notification center, tour ────────────────────────────────────
  /** Accessible name of a banner's close button. */
  dismissBanner: 'Dismiss banner',
  /** Default name of a notification center's bell and panel. */
  notificationCenterLabel: 'Notifications',
  /** The bell's accessible name with the unread count (formatted), for example "Notifications, 3 unread". */
  notificationCenterBell: (
    label: string,
    count: number,
    formatted: string,
  ): string => (count === 0 ? label : `${label}, ${formatted} unread`),
  /** Announced when notifications arrive while the panel is closed, for example "2 new notifications". */
  notificationCenterNew: (count: number, formatted: string): string =>
    count === 1 ? '1 new notification' : `${formatted} new notifications`,
  /** Name of the All / Unread filter buttons. */
  notificationCenterFilter: 'Show',
  notificationCenterAll: 'All',
  /** The Unread filter, and read before an unread notification's title. */
  notificationCenterUnread: 'Unread',
  notificationCenterMarkAllRead: 'Mark all as read',
  notificationCenterMarkRead: 'Mark as read',
  notificationCenterMarkUnread: 'Mark as unread',
  notificationCenterYesterday: 'Yesterday',
  notificationCenterEmpty: 'No notifications',
  notificationCenterEmptyUnread: 'No unread notifications',
  notificationCenterLoadMore: 'Load more',
  /** A tour's Back button. */
  tourBack: 'Back',
  /** A tour's Next button. */
  tourNext: 'Next',
  /** A tour's button on the last step. */
  tourDone: 'Done',
  /** Accessible name of a tour's close button. */
  tourSkip: 'Skip tour',

  // ── Inline edit, comment thread ──────────────────────────────────────────
  /** Accessible name of an inline edit's pencil button, for example "Edit Title". */
  inlineEditEdit: (label: string): string => (label ? `Edit ${label}` : 'Edit'),
  /** An inline edit's save button (with `show-actions`). */
  inlineEditSave: 'Save',
  /** An inline edit's cancel button (with `show-actions`). */
  inlineEditCancel: 'Cancel',
  /** Spoken while an inline edit waits for the app to save. */
  inlineEditSaving: 'Saving',
  /** Default accessible name of a comment thread. */
  commentThreadLabel: 'Comments',
  /** A comment thread without comments. */
  commentThreadEmpty: 'No comments yet',
  /** Label and placeholder of a comment thread's composer. */
  commentComposerLabel: 'Add a comment',
  /** The composer's send button. */
  commentSend: 'Send',
  /** The button that opens a reply composer under a comment. */
  commentReply: 'Reply',
  /** Label and placeholder of a reply composer, for example "Reply to Ada Lovelace". */
  commentReplyTo: (author: string): string => `Reply to ${author}`,
  /** A reply composer's cancel button. */
  commentCancel: 'Cancel',
  /** Comment actions menu items. */
  commentEdit: 'Edit',
  commentDelete: 'Delete',
  commentCopyLink: 'Copy link',
  /** Accessible name of a comment's actions button, for example "More actions for comment by Ada". */
  commentActions: (author: string): string =>
    `More actions for comment by ${author}`,
  /** Marker after the time of an edited comment. */
  commentEdited: 'Edited',
  /** Accessible name of a comment, for example "Comment by Ada Lovelace, 2 hours ago". */
  commentLabel: (author: string, time: string): string =>
    time ? `Comment by ${author}, ${time}` : `Comment by ${author}`,
  /** Accessible name of a reply, for example "Reply by Ada Lovelace, 2 hours ago". */
  commentReplyLabel: (author: string, time: string): string =>
    time ? `Reply by ${author}, ${time}` : `Reply by ${author}`,
  /** Accessible name of a comment's replies, for example "Replies to Ada Lovelace". */
  commentReplies: (author: string): string => `Replies to ${author}`,
  /** Announced politely when a comment is added, for example "New comment by Ada Lovelace". */
  commentAdded: (author: string): string => `New comment by ${author}`,
  /** Author shown for a comment without one. */
  commentUnknownAuthor: 'Unknown author',
  /** The save button of a comment being edited. */
  commentSave: 'Save',
  /** Accessible name of an activity entry, for example "Activity by Ada Lovelace, 2 hours ago". */
  activityLabel: (author: string, time: string): string =>
    time ? `Activity by ${author}, ${time}` : `Activity by ${author}`,

  // ── Password rules, rating, signature pad ────────────────────────────────
  /** Accessible name of a password rules checklist. */
  passwordRulesLabel: 'Password requirements',
  /** Built-in `min-length` rule, for example "At least 12 characters". */
  passwordRuleMinLength: (count: number): string =>
    count === 1 ? 'At least 1 character' : `At least ${count} characters`,
  /** Built-in `require-uppercase` rule. */
  passwordRuleUppercase: 'One uppercase letter',
  /** Built-in `require-lowercase` rule. */
  passwordRuleLowercase: 'One lowercase letter',
  /** Built-in `require-number` rule. */
  passwordRuleNumber: 'One number',
  /** Built-in `require-symbol` rule. */
  passwordRuleSymbol: 'One symbol',
  /** Status of a met password rule, read after its label. */
  passwordRuleMet: 'met',
  /** Status of an unmet password rule, read after its label. */
  passwordRuleNotMet: 'not met',
  /** Announced when a rule flips, for example "One number: met". */
  passwordRuleAnnouncement: (label: string, status: string): string =>
    `${label}: ${status}`,
  /** Announced when the last failing rule is met. */
  passwordRulesAllMet: 'All password requirements met',
  /** Validation message set on the connected password field while rules fail. */
  passwordRulesInvalid: 'Password does not meet the requirements.',
  /** Default accessible name of a rating. */
  ratingLabel: 'Rating',
  /** Value text of a rating, for example "3 out of 5". */
  ratingValueText: (value: string, max: string): string =>
    `${value} out of ${max}`,
  /** Value text of a rating with no value. */
  ratingNoValue: 'No rating',
  /** Accessible name of a read-only rating, for example "Rated 4.3 out of 5". */
  ratingReadonly: (value: string, max: string): string =>
    `Rated ${value} out of ${max}`,
  /** Validation message of a required rating with no value. */
  valueMissingRating: 'Please choose a rating.',
  /** Default accessible name of a signature pad. */
  signaturePadLabel: 'Signature',
  /** Hint shown on an empty signature pad. */
  signaturePadPlaceholder: 'Sign here',
  /** Status of an empty signature pad, read after its label. */
  signaturePadEmpty: 'empty',
  /** Status of a signed signature pad, read after its label. */
  signaturePadSigned: 'signed',
  /** Accessible name of a signature pad's drawing, for example "Signature, empty". */
  signaturePadImage: (label: string, status: string): string =>
    `${label}, ${status}`,
  /** Undo button of a signature pad. */
  signaturePadUndo: 'Undo last stroke',
  /** Clear button of a signature pad. */
  signaturePadClear: 'Clear signature',
  /** Button that switches a signature pad to typing the name. */
  signaturePadTypeInstead: 'Type your name instead',
  /** Button that switches a signature pad back to drawing. */
  signaturePadDrawInstead: 'Draw instead',
  /** Label of the name field of a signature pad in typing mode. */
  signaturePadTypedName: 'Your name',
  /** Validation message of a required signature pad with no signature. */
  valueMissingSignature: 'Please sign.',

  // ── Mention input, kbd, hover card ───────────────────────────────────────
  /** Accessible name of a mention input's suggestion list. */
  mentionSuggestions: 'Suggestions',
  /** Announced as a mention input's suggestions change; `formatted` is `count` formatted. */
  mentionResults: (count: number, formatted: string): string =>
    count === 1 ? '1 suggestion' : `${formatted} suggestions`,
  /** Spoken names of keys in `wc-kbd`, read instead of the symbols. */
  kbdCommand: 'Command',
  kbdControl: 'Control',
  kbdOption: 'Option',
  kbdAlt: 'Alt',
  kbdShift: 'Shift',
  kbdWindows: 'Windows',
  kbdEnter: 'Enter',
  kbdReturn: 'Return',
  kbdEscape: 'Escape',
  kbdTab: 'Tab',
  kbdBackspace: 'Backspace',
  kbdDelete: 'Delete',
  kbdSpace: 'Space',
  kbdArrowUp: 'Up arrow',
  kbdArrowDown: 'Down arrow',
  kbdArrowLeft: 'Left arrow',
  kbdArrowRight: 'Right arrow',
  kbdPageUp: 'Page up',
  kbdPageDown: 'Page down',
  kbdHome: 'Home',
  kbdEnd: 'End',
  kbdCapsLock: 'Caps Lock',
  /** Short labels `wc-kbd` shows off Apple platforms. */
  kbdCtrlShort: 'Ctrl',
  kbdWinShort: 'Win',
  kbdEscShort: 'Esc',
  kbdDelShort: 'Del',
  kbdPageUpShort: 'PgUp',
  kbdPageDownShort: 'PgDn',

  // ── Kanban, virtual list ─────────────────────────────────────────────────
  /** Default accessible name of a kanban board. */
  kanbanLabel: 'Board',
  /** Read with each kanban card, from `aria-describedby`. */
  kanbanInstructions:
    'Press Space or Enter to pick up the card. Use the arrow keys to move it, Space or Enter to drop it, and Escape to cancel.',
  /** Accessible name of a column's card count, for example "3 cards" or "6 of 5 cards". */
  kanbanCount: (count: number, formatted: string, limit?: string): string => {
    if (limit) return `${formatted} of ${limit} cards`;
    return count === 1 ? '1 card' : `${formatted} cards`;
  },
  /** Shown in a column header with more cards than its limit. */
  kanbanOverLimit: 'Over limit',
  /** A column without cards. */
  kanbanEmpty: 'No cards',
  /** A column's add button. */
  kanbanAddCard: 'Add card',
  /** Accessible name of a column's add button, for example "Add card to To do". */
  kanbanAddCardTo: (column: string): string => `Add card to ${column}`,
  /** Announced when a card is picked up, for example "Picked up card Fix login. Column To do, position 2 of 5." */
  kanbanPickedUp: (
    card: string,
    column: string,
    position: string,
    total: string,
  ): string =>
    `Picked up card ${card}. Column ${column}, position ${position} of ${total}.`,
  /** Announced at each keyboard move of a lifted card. */
  kanbanMoved: (
    card: string,
    column: string,
    position: string,
    total: string,
  ): string =>
    `Card ${card}: column ${column}, position ${position} of ${total}.`,
  /** Announced when a card is dropped. */
  kanbanDropped: (
    card: string,
    column: string,
    position: string,
    total: string,
  ): string =>
    `Dropped card ${card}. Column ${column}, position ${position} of ${total}.`,
  /** Announced when a move is canceled, by Escape or by the app. */
  kanbanCanceled: (
    card: string,
    column: string,
    position: string,
    total: string,
  ): string =>
    `Move canceled. Card ${card} is back in column ${column}, position ${position} of ${total}.`,

  // ── JSON viewer, diff viewer ─────────────────────────────────────────────
  /** Default accessible name of a JSON viewer's tree. */
  jsonViewer: 'JSON',
  /** Size of a collapsed object, for example "3 keys"; `formatted` is `count` formatted. */
  jsonViewerKeys: (count: number, formatted: string): string =>
    count === 1 ? '1 key' : `${formatted} keys`,
  /** Size of a collapsed array, for example "12 items"; `formatted` is `count` formatted. */
  jsonViewerItems: (count: number, formatted: string): string =>
    count === 1 ? '1 item' : `${formatted} items`,
  /** Row that renders the next children of a large node, for example "Show 100 more of 12,245". */
  jsonViewerShowMore: (next: string, hidden: string): string =>
    `Show ${next} more of ${hidden}`,
  /** After a truncated string, for example "1,234 more characters". */
  jsonViewerMoreCharacters: (count: number, formatted: string): string =>
    count === 1 ? '1 more character' : `${formatted} more characters`,
  jsonViewerCopyValue: 'Copy value',
  jsonViewerCopyPath: 'Copy path',
  /** Announced after a JSON value or path is copied. */
  jsonViewerCopiedValue: 'Copied value to clipboard',
  jsonViewerCopiedPath: 'Copied path to clipboard',
  /** Shown instead of a value that contains itself. */
  jsonViewerCircular: 'Circular reference',
  /** Shown when the `value` attribute is not valid JSON, with the parser's message. */
  jsonViewerInvalid: (message: string): string => `Invalid JSON: ${message}`,
  /** Default accessible name of a diff viewer's table. */
  diffViewer: 'Changes',
  /** Summary above a diff, for example "3 additions, 2 deletions"; the strings are the counts formatted. */
  diffSummary: (
    additions: number,
    deletions: number,
    formattedAdditions: string,
    formattedDeletions: string,
  ): string =>
    `${additions === 1 ? '1 addition' : `${formattedAdditions} additions`}, ${
      deletions === 1 ? '1 deletion' : `${formattedDeletions} deletions`
    }`,
  /** Summary above a diff of two identical texts. */
  diffNoChanges: 'No changes',
  /** Screen-reader text before an added line, for example "Added line 13"; `line` is formatted. */
  diffAddedLine: (line: string): string => `Added line ${line}`,
  /** Screen-reader text before a removed line, for example "Removed line 12"; `line` is formatted. */
  diffRemovedLine: (line: string): string => `Removed line ${line}`,
  /** Button that shows hidden unchanged lines, for example "Show 24 unchanged lines". */
  diffShowUnchanged: (count: number, formatted: string): string =>
    count === 1 ? 'Show 1 unchanged line' : `Show ${formatted} unchanged lines`,
  /** Shown on the last line of a side that does not end with a line break, when the other does. */
  diffNoNewline: 'No newline at end of file',
  /** Note shown when the texts are too different or too large to compare line by line. */
  diffApproximate:
    'These texts are too different to compare line by line, so the changed part is shown as removed and then added.',
  /** Note shown when only the line endings tell the sides apart, for example "CRLF" and "LF". */
  diffLineEndings: (oldEnding: string, newEnding: string): string =>
    `Line endings differ: ${oldEnding} in the old text, ${newEnding} in the new text.`,
  /** Column headers of a split diff. */
  diffOld: 'Old',
  diffNew: 'New',

  // ── Anchor nav, scroll area, presence indicator, relative time ───────────
  /** Default accessible name of an anchor nav's `nav` landmark. */
  anchorNavLabel: 'On this page',
  /** Presence status of a person, read after their name. */
  presenceOnline: 'Online',
  presenceAway: 'Away',
  presenceBusy: 'Busy',
  presenceOffline: 'Offline',
  /** Accessible name of an avatar with a presence indicator, for example "Ana Lima, online". */
  presenceLabel: (name: string, status: string): string =>
    name ? `${name}, ${status.toLowerCase()}` : status,

  // ── Confirm dialog ───────────────────────────────────────────────────────
  /** Default label of a confirm dialog's confirm button. */
  confirm: 'Confirm',
  /** Default label of a confirm dialog's cancel button. */
  cancel: 'Cancel',
  /** Label of a confirm dialog's type-to-confirm field, for example "Type acme-prod to confirm". */
  typeToConfirm: (text: string): string => `Type ${text} to confirm`,
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
