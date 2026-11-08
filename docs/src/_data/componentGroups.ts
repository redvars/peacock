// Build-time data for the Components section: the groups the gallery (pages/components.astro),
// the sidebar (WithComponentsSidebar) and the home page show, and the previous/next order of
// the component pages. A component missing from every group still shows, under "Others", so a
// new component is never hidden; add it to a group when you add it.
import { getAllComponentsForShowcase } from './getLitComponentDetails.ts';
import { convertToSectionId } from './utils.ts';

/** The fields of a custom-elements-jsdocs.json entry the docs pages read. */
export interface ComponentEntry {
  rawTag: string;
  tag?: string;
  label?: string;
  summary?: string;
  [key: string]: unknown;
}

export interface ComponentGroup {
  name: string;
  /** Anchor of the group on the Components page, without the `#`. */
  id: string;
  entries: ComponentEntry[];
}

export interface ComponentLink {
  label: string;
  href: string;
  description?: string;
}

const GROUPS: { name: string; components: string[] }[] = [
  {
    name: 'Primitive',
    components: ['ripple', 'elevation', 'icon', 'svg', 'image', 'focus-ring', 'divider', 'kbd'],
  },
  {
    name: 'Layout & App shell',
    components: [
      'app-shell',
      'app-bar',
      'page-header',
      'container',
      'stack',
      'grid',
      'card',
      'accordion',
      'resizable-panels',
      'scroll-area',
    ],
  },
  {
    name: 'Buttons',
    components: [
      'button',
      'icon-button',
      'link-button',
      'fab',
      'button-group',
      'dropdown-button',
      'split-button',
      'segmented-button-group',
      'copy-button',
    ],
  },
  {
    name: 'Navigation',
    components: [
      'navigation-drawer',
      'navigation-rail',
      'navigation-bar',
      'link',
      'breadcrumb',
      'pagination',
      'tabs',
      'stepper',
      'anchor-nav',
      'toolbar',
      'menu',
      'command-palette',
      'workspace-switcher',
      'user-menu',
    ],
  },
  {
    name: 'Text inputs',
    components: [
      'input',
      'password-field',
      'password-rules',
      'number-field',
      'currency-field',
      'phone-field',
      'url-field',
      'textarea',
      'mention-input',
      'pin-input',
      'search',
      'inline-edit',
    ],
  },
  {
    name: 'Selection',
    components: [
      'select',
      'listbox',
      'checkbox',
      'checkbox-group',
      'radio',
      'radio-group',
      'switch',
      'slider',
      'rating',
      'chip-set',
      'transfer-list',
      'tree',
    ],
  },
  {
    name: 'Date & Time',
    components: [
      'date-field',
      'date-range-field',
      'date-picker',
      'time-field',
      'time-picker',
      'datetime-field',
      'calendar',
      'clock',
      'relative-time',
    ],
  },
  {
    name: 'Forms',
    components: [
      'form',
      'field',
      'fieldset',
      'file-upload',
      'signature-pad',
      'color-field',
      'color-picker',
      'condition-builder',
      'filter-bar',
    ],
  },
  {
    name: 'Data display',
    components: [
      'table',
      'list',
      'virtual-list',
      'description-list',
      'stat',
      'sparkline',
      'kanban',
      'timeline',
      'json-viewer',
      'diff-viewer',
      'code-highlighter',
      'number-counter',
    ],
  },
  {
    name: 'People & status',
    components: [
      'avatar',
      'avatar-group',
      'presence-indicator',
      'badge',
      'tag',
      'chip',
      'status-indicator',
      'discussion',
    ],
  },
  {
    name: 'Feedback',
    components: [
      'alert',
      'banner',
      'snackbar',
      'notification-manager',
      'notification-center',
      'illustration',
      'skeleton',
    ],
  },
  {
    name: 'Overlays',
    components: [
      'modal',
      'confirm-dialog',
      'side-sheet',
      'bottom-sheet',
      'popover',
      'tooltip',
      'hover-card',
      'tour',
    ],
  },
  {
    name: 'Loading & Progress',
    components: ['circular-progress', 'linear-progress', 'redvars-loader'],
  },
  {
    name: 'Editors',
    components: ['code-editor', 'html-editor', 'markdown-editor', 'markdown', 'comment-composer', 'document-editor'],
  },
  {
    name: 'Diagrams',
    components: ['workflow', 'workflow-timeline', 'tree-chart', 'dependency-map', 'erd', 'diagram', 'diagram-controls', 'diagram-minimap'],
  },
  {
    // ADR-030002: building blocks for AI-native pages that also work without AI.
    name: 'AI',
    components: [
      'assistant-panel',
      'ai-summary',
      'generative-view',
      'chat-thread',
      'chat-message',
      'prompt-input',
      'assistant-steps',
      'draft-card',
      'ai-badge',
      'typing-indicator',
      'citation',
    ],
  },
];

export function componentGroupId(name: string): string {
  return `group-${convertToSectionId(name)}`;
}

let cachedGroups: ComponentGroup[] | undefined;

/** The groups that have at least one component, in gallery order, ending with "Others". */
export function getGroupedComponents(): ComponentGroup[] {
  if (cachedGroups) return cachedGroups;
  const entries = getAllComponentsForShowcase() as ComponentEntry[];
  const byTag = new Map(entries.map(entry => [entry.rawTag, entry]));
  const grouped = new Set(GROUPS.flatMap(group => group.components));

  const groups = GROUPS.map(group => ({
    name: group.name,
    id: componentGroupId(group.name),
    entries: group.components
      .map(tag => byTag.get(tag))
      .filter((entry): entry is ComponentEntry => entry !== undefined),
  }));
  const others = entries.filter(entry => !grouped.has(entry.rawTag));
  if (others.length) groups.push({ name: 'Others', id: componentGroupId('Others'), entries: others });

  cachedGroups = groups.filter(group => group.entries.length > 0);
  return cachedGroups;
}

/** The group a component is listed under, if any. */
export function getComponentGroup(rawTag: string): ComponentGroup | undefined {
  return getGroupedComponents().find(group => group.entries.some(entry => entry.rawTag === rawTag));
}

function toLink(entry: ComponentEntry): ComponentLink {
  return {
    label: entry.label ?? entry.rawTag,
    href: `/components/${entry.rawTag}/`,
    description: entry.summary,
  };
}

/** The components before and after this one in gallery order, for the page pager. */
export function getComponentNeighbours(rawTag: string): { previous?: ComponentLink; next?: ComponentLink } {
  const ordered = getGroupedComponents().flatMap(group => group.entries);
  const index = ordered.findIndex(entry => entry.rawTag === rawTag);
  if (index === -1) return {};
  return {
    previous: index > 0 ? toLink(ordered[index - 1]) : undefined,
    next: index < ordered.length - 1 ? toLink(ordered[index + 1]) : undefined,
  };
}
