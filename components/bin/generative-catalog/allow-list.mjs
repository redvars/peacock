// The components and props `wc-generative-view` may render (ADR-030002). Kept by hand: every
// entry is a decision that the component is safe and useful in an assistant's answer. Types,
// enum values and descriptions come from dist/custom-elements.json (bin/generative-catalog.mjs).
//
// Leave out anything that can navigate, load a URL, run code or write data: `href`, `src`,
// `target`, callbacks (`template`, `valueFormatter`), form controls. A clickable node fires the
// view's `action` event instead, and the app decides what it does.
//
//   tag       the element
//   props     the properties a node may set, by field name
//   slots     named slots a child node may fill with `"slot": "<name>"`
//   children  whether the node takes child nodes and text in its default slot
//   wrap      a tag the children are put in, such as a card's padded content
//   action    the event that fires the view's `action` when the node has an `action` id

export const ALLOW_LIST = {
  stack: {
    tag: 'wc-stack',
    props: ['direction', 'gap', 'align', 'justify', 'wrap'],
    children: true,
  },
  grid: {
    tag: 'wc-grid',
    props: ['columns', 'gap'],
    children: true,
  },
  divider: { tag: 'wc-divider', props: ['orientation'] },
  card: {
    tag: 'wc-card',
    props: ['variant'],
    children: true,
    wrap: 'wc-card-content',
  },
  stat: {
    tag: 'wc-stat',
    props: [
      'label',
      'value',
      'previous',
      'delta',
      'deltaFormat',
      'positive',
      'comparison',
      'help',
      'format',
      'variant',
    ],
    slots: ['trend', 'insight'],
  },
  sparkline: {
    tag: 'wc-sparkline',
    props: ['data', 'type', 'highlightLast', 'label', 'format'],
  },
  'chart-bar': {
    tag: 'wc-chart-bar',
    props: [
      'data',
      'config',
      'categoryKey',
      'stacked',
      'showValues',
      'hideGrid',
      'height',
      'label',
      'legend',
    ],
    slots: ['insight'],
    action: 'select',
  },
  'chart-line': {
    tag: 'wc-chart-line',
    props: [
      'data',
      'config',
      'categoryKey',
      'curve',
      'showDots',
      'hideGrid',
      'height',
      'label',
      'legend',
    ],
    slots: ['insight'],
    action: 'select',
  },
  'chart-area': {
    tag: 'wc-chart-area',
    props: [
      'data',
      'config',
      'categoryKey',
      'stacked',
      'curve',
      'showDots',
      'hideGrid',
      'height',
      'label',
      'legend',
    ],
    slots: ['insight'],
    action: 'select',
  },
  'chart-pie': {
    tag: 'wc-chart-pie',
    props: ['data', 'showLabels', 'height', 'label', 'legend'],
    slots: ['insight'],
    action: 'select',
  },
  'chart-doughnut': {
    tag: 'wc-chart-doughnut',
    props: [
      'data',
      'showLabels',
      'innerRadius',
      'centerLabel',
      'height',
      'label',
      'legend',
    ],
    slots: ['insight'],
    action: 'select',
  },
  table: {
    tag: 'wc-table',
    props: [
      'columns',
      'data',
      'keyField',
      'sortable',
      'density',
      'striped',
      'pageSize',
      'label',
      'emptyStateHeadline',
      'emptyStateDescription',
    ],
    action: 'row-click',
  },
  'description-list': {
    tag: 'wc-description-list',
    props: ['layout', 'columns', 'divided'],
    children: true,
  },
  'description-item': {
    tag: 'wc-description-item',
    props: ['label', 'span'],
    children: true,
  },
  list: { tag: 'wc-list', props: ['variant'], children: true },
  'list-item': {
    tag: 'wc-list-item',
    props: [],
    slots: [
      'start',
      'end',
      'overline',
      'headline',
      'supporting-text',
      'trailing-supporting-text',
    ],
    children: true,
    action: 'click',
  },
  timeline: { tag: 'wc-timeline', props: [], children: true },
  'timeline-item': {
    tag: 'wc-timeline-item',
    props: [],
    slots: ['content'],
    children: true,
  },
  badge: {
    tag: 'wc-badge',
    props: ['value', 'max', 'dot', 'label', 'intent'],
  },
  tag: {
    tag: 'wc-tag',
    props: ['variant', 'intent', 'accent', 'size'],
    children: true,
  },
  'status-indicator': {
    tag: 'wc-status-indicator',
    props: ['intent', 'label', 'pulse', 'size'],
  },
  avatar: { tag: 'wc-avatar', props: ['name', 'label', 'size'] },
  'relative-time': {
    tag: 'wc-relative-time',
    props: ['datetime', 'numeric', 'formatStyle'],
  },
  kbd: { tag: 'wc-kbd', props: ['keys'] },
  icon: { tag: 'wc-icon', props: ['name', 'label'] },
  alert: {
    tag: 'wc-alert',
    props: ['intent', 'label', 'description', 'icon'],
    children: true,
  },
  progress: {
    tag: 'wc-linear-progress',
    props: ['value', 'max', 'indeterminate', 'label', 'helperText'],
  },
  markdown: { tag: 'wc-markdown', props: ['value', 'size', 'inline'] },
  citation: { tag: 'wc-citation', props: ['value', 'label'] },
  button: {
    tag: 'wc-button',
    props: ['level', 'size', 'tooltip'],
    children: true,
    action: 'click',
  },
};
