// Build-time data for the Blocks section. The sidebar (WithBlocksSidebar) and
// the overview (pages/blocks/index.astro) both read it, so a new block is one
// entry here plus its page.

export type BlockGroupName = 'Application Shells' | 'Authentication' | 'Data Display';

export type BlockPreview = 'dashboard' | 'login' | 'signup' | 'settings' | 'data-table';

export interface BlockDefinition {
  name: BlockPreview;
  label: string;
  href: string;
  group: BlockGroupName;
  summary: string;
  tags: string[];
  icon: string;
}

export const BLOCK_GROUPS: BlockGroupName[] = ['Application Shells', 'Authentication', 'Data Display'];

export const BLOCKS: BlockDefinition[] = [
  {
    name: 'dashboard',
    label: 'Dashboard',
    href: '/blocks/dashboard/',
    group: 'Application Shells',
    summary: 'An admin dashboard with sidebar navigation, KPI cards, an area chart, a doughnut chart and recent orders.',
    tags: ['layout', 'charts', 'navigation'],
    icon: 'dashboard',
  },
  {
    name: 'settings',
    label: 'Settings',
    href: '/blocks/settings/',
    group: 'Application Shells',
    summary: 'An account settings page with tabs for profile, notifications and security, and save and cancel actions.',
    tags: ['form', 'tabs'],
    icon: 'settings',
  },
  {
    name: 'login',
    label: 'Login',
    href: '/blocks/login/',
    group: 'Authentication',
    summary: 'A centered sign-in form with email and password fields, remember me, and a primary sign-in action.',
    tags: ['auth', 'form'],
    icon: 'login',
  },
  {
    name: 'signup',
    label: 'Sign up',
    href: '/blocks/signup/',
    group: 'Authentication',
    summary: 'A centered registration form with name, email and password fields, a terms checkbox and a link to sign in.',
    tags: ['auth', 'form'],
    icon: 'person_add',
  },
  {
    name: 'data-table',
    label: 'Data table',
    href: '/blocks/data-table/',
    group: 'Data Display',
    summary: 'A searchable table of records with status tags, row selection, pagination, and an empty state.',
    tags: ['table', 'search', 'pagination'],
    icon: 'table',
  },
];

export const BLOCKS_OVERVIEW = { label: 'Overview', href: '/blocks/' } as const;
