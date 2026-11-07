// Build-time data for the Blocks section. The sidebar (WithBlocksSidebar) and
// the overview (pages/blocks/index.astro) both read it, so a new block is one
// entry here plus its page.

export type BlockGroupName =
  | 'Application Shells'
  | 'Authentication'
  | 'Forms & Flows'
  | 'Data Display'
  | 'Collaboration'
  | 'Marketing';

export type BlockPreview =
  | 'dashboard'
  | 'login'
  | 'signup'
  | 'settings'
  | 'data-table'
  | 'ticket'
  | 'app-shell'
  | 'kanban'
  | 'calendar'
  | 'onboarding'
  | 'pricing'
  | 'two-factor'
  | 'record-detail';

export interface BlockDefinition {
  name: BlockPreview;
  label: string;
  href: string;
  group: BlockGroupName;
  summary: string;
  tags: string[];
  icon: string;
  /** Shows a "New" badge on the overview card. */
  isNew?: boolean;
}

export const BLOCK_GROUPS: BlockGroupName[] = [
  'Application Shells',
  'Authentication',
  'Forms & Flows',
  'Data Display',
  'Collaboration',
  'Marketing',
];

export const BLOCKS: BlockDefinition[] = [
  {
    name: 'app-shell',
    label: 'App shell',
    href: '/blocks/app-shell/',
    group: 'Application Shells',
    summary:
      'A full application frame with an app bar, collapsible navigation, a workspace switcher, an account menu, a command palette and a home page.',
    tags: ['layout', 'navigation', 'search'],
    icon: 'web',
    isNew: true,
  },
  {
    name: 'kanban',
    label: 'Kanban board',
    href: '/blocks/kanban/',
    group: 'Collaboration',
    summary:
      'A sprint board with filters and saved views, and task cards with labels, assignees and due dates that move by drag and drop or keyboard.',
    tags: ['board', 'filters', 'drag and drop'],
    icon: 'view_kanban',
    isNew: true,
  },
  {
    name: 'calendar',
    label: 'Calendar',
    href: '/blocks/calendar/',
    group: 'Collaboration',
    summary:
      'A team schedule with a month calendar, day and week views, an agenda of the selected day, calendar filters and a new event dialog.',
    tags: ['calendar', 'scheduling', 'dialog'],
    icon: 'calendar_month',
    isNew: true,
  },
  {
    name: 'dashboard',
    label: 'Dashboard',
    href: '/blocks/dashboard/',
    group: 'Application Shells',
    summary:
      'An admin dashboard in an app shell with a notification center and user menu, KPI stats with sparklines, charts and a table of recent orders.',
    tags: ['app shell', 'KPI stats', 'charts'],
    icon: 'dashboard',
  },
  {
    name: 'settings',
    label: 'Settings',
    href: '/blocks/settings/',
    group: 'Application Shells',
    summary:
      'Account settings with tabs for profile, notifications and security: an avatar upload, grouped forms that track unsaved changes, switch rows, live password rules and a danger zone behind a confirm dialog.',
    tags: ['forms', 'settings', 'confirm dialog'],
    icon: 'settings',
  },
  {
    name: 'login',
    label: 'Login',
    href: '/blocks/login/',
    group: 'Authentication',
    summary:
      'A centered sign-in card with a validated form, remember me and forgot password, and Google or GitHub sign-in under an "or" divider.',
    tags: ['auth', 'form', 'social sign-in'],
    icon: 'login',
  },
  {
    name: 'signup',
    label: 'Sign up',
    href: '/blocks/signup/',
    group: 'Authentication',
    summary:
      'A centered registration card with Google or GitHub sign-up, a validated form with live password rules, and a terms checkbox.',
    tags: ['auth', 'form', 'password rules'],
    icon: 'person_add',
  },
  {
    name: 'data-table',
    label: 'Data table',
    href: '/blocks/data-table/',
    group: 'Data Display',
    summary:
      'A filterable customer list with saved views, a sortable, selectable table with status tags, bulk actions behind a confirm dialog, pagination and empty states.',
    tags: ['table', 'filters', 'bulk actions'],
    icon: 'table',
  },
  {
    name: 'ticket',
    label: 'Ticket',
    href: '/blocks/ticket/',
    group: 'Collaboration',
    summary:
      'A support ticket with a Markdown description, record fields, and a discussion of comments, work notes, replies, mentions and activity.',
    tags: ['form', 'discussion', 'mentions'],
    icon: 'forum',
  },
  {
    name: 'two-factor',
    label: 'Two-factor verification',
    href: '/blocks/two-factor/',
    group: 'Authentication',
    summary: 'A centered verification step with a six-digit code input, its error state, a resend countdown and a recovery code option.',
    tags: ['auth', 'code', 'form'],
    icon: 'password',
    isNew: true,
  },
  {
    name: 'onboarding',
    label: 'Onboarding wizard',
    href: '/blocks/onboarding/',
    group: 'Forms & Flows',
    summary: 'A multi-step workspace setup with a stepper, a form per step, a logo upload, and back and continue actions.',
    tags: ['form', 'stepper', 'wizard'],
    icon: 'rocket_launch',
    isNew: true,
  },
  {
    name: 'record-detail',
    label: 'Record detail',
    href: '/blocks/record-detail/',
    group: 'Data Display',
    summary: 'A customer record with a page header, status and actions, tabs, KPI stats, a description list, an activity timeline and files.',
    tags: ['record', 'tabs', 'timeline'],
    icon: 'contact_page',
    isNew: true,
  },
  {
    name: 'pricing',
    label: 'Pricing',
    href: '/blocks/pricing/',
    group: 'Marketing',
    summary: 'A pricing page with a monthly and yearly toggle, three plan cards with a highlighted plan, and an FAQ accordion.',
    tags: ['marketing', 'cards', 'accordion'],
    icon: 'sell',
    isNew: true,
  },
];

export const BLOCKS_OVERVIEW = { label: 'Overview', href: '/blocks/' } as const;
