// Build-time data for the Blocks section. The sidebar (WithBlocksSidebar) and
// the overview (pages/blocks/index.astro) both read it, so a new block is one
// entry here plus its page.

export type BlockGroupName =
  | 'Application Shells'
  | 'Authentication'
  | 'Forms & Flows'
  | 'Data Display'
  | 'Collaboration'
  | 'AI'
  | 'Marketing'
  | 'Website'
  | 'Portals';

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
  | 'record-detail'
  | 'assistant'
  | 'home-ai'
  | 'incident-agent'
  | 'agent-inbox'
  | 'landing'
  | 'portal-home'
  | 'product-page'
  | 'blog-index'
  | 'blog-post'
  | 'docs-page'
  | 'legal-page'
  | 'not-found'
  | 'waitlist'
  | 'knowledge-article'
  | 'search-results'
  | 'service-catalog'
  | 'my-cases'
  | 'org-members'
  | 'downloads'
  | 'oidc-sign-in';

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
  'AI',
  'Marketing',
  'Website',
  'Portals',
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
    name: 'assistant',
    label: 'Assistant panel',
    href: '/blocks/assistant/',
    group: 'AI',
    summary:
      'A page with the assistant beside it: a conversation that looks things up as the person, streams its answer and drafts two records to confirm, and a page that works without it.',
    tags: ['ai', 'chat', 'drafts'],
    icon: 'forum',
    isNew: true,
  },
  {
    name: 'home-ai',
    label: 'Home with AI',
    href: '/blocks/home-ai/',
    group: 'AI',
    summary:
      'A home page with an ask bar over search, a summary of the day above the app tiles, and an insight under a number; asking opens the assistant beside the page.',
    tags: ['ai', 'summary', 'search'],
    icon: 'home',
    isNew: true,
  },
  {
    name: 'incident-agent',
    label: 'Incident agent',
    href: '/blocks/incident-agent/',
    group: 'AI',
    summary:
      'An incident worked in a conversation: the caller, teammates and an agent in one thread, a cited diagnosis, drafts to confirm that run as live steps, quick replies, and the record beside it with suggested fields and a plan.',
    tags: ['ai', 'chat', 'drafts'],
    icon: 'support_agent',
    isNew: true,
  },
  {
    name: 'agent-inbox',
    label: 'Agent inbox',
    href: '/blocks/agent-inbox/',
    group: 'AI',
    summary:
      'A service desk queue grouped by who has to act: what needs a person and why, what the agent is working on, and what it resolved, with a summary of the day and the numbers behind it.',
    tags: ['ai', 'queue', 'summary'],
    icon: 'inbox',
    isNew: true,
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
  {
    name: 'landing',
    label: 'Landing page',
    href: '/blocks/landing/',
    group: 'Marketing',
    summary: 'A product landing page: a site header with a columns menu, a hero, a logo row, a feature grid, an FAQ, a call to action and a site footer.',
    tags: ['marketing', 'site header', 'site footer'],
    icon: 'web',
    isNew: true,
  },
  {
    name: 'portal-home',
    label: 'Portal home',
    href: '/blocks/portal-home/',
    group: 'Portals',
    summary: 'The home of a customer support portal: a site header with a Sign in link for visitors, a search hero, topic cards, popular articles and a slim footer.',
    tags: ['portal', 'search', 'site header'],
    icon: 'support_agent',
    isNew: true,
  },
  {
    name: 'product-page',
    label: 'Product page',
    href: '/blocks/product-page/',
    group: 'Website',
    summary: 'A product page: a hero with a click-to-play video, alternating feature rows with screenshots, a testimonial carousel and a call to action.',
    tags: ['marketing', 'video', 'carousel'],
    icon: 'storefront',
    isNew: true,
  },
  {
    name: 'blog-index',
    label: 'Blog index',
    href: '/blocks/blog-index/',
    group: 'Website',
    summary: 'A blog home: topic chips, a featured post, a grid of post cards with authors and dates, and pagination.',
    tags: ['blog', 'cards', 'pagination'],
    icon: 'newspaper',
    isNew: true,
  },
  {
    name: 'blog-post',
    label: 'Blog post',
    href: '/blocks/blog-post/',
    group: 'Website',
    summary: 'A blog post: breadcrumb, author and reading time, long-form text with code and a quote, an "On this page" list beside it, and related posts.',
    tags: ['blog', 'article', 'anchor nav'],
    icon: 'article',
    isNew: true,
  },
  {
    name: 'docs-page',
    label: 'Docs page',
    href: '/blocks/docs-page/',
    group: 'Website',
    summary: 'A documentation page: grouped side navigation, the page with a callout and code, previous and next links, and an "On this page" list.',
    tags: ['docs', 'navigation drawer', 'anchor nav'],
    icon: 'menu_book',
    isNew: true,
  },
  {
    name: 'legal-page',
    label: 'Legal page',
    href: '/blocks/legal-page/',
    group: 'Website',
    summary: 'A privacy policy: the date it last changed, a summary, numbered sections with a contents list beside them, and who to contact.',
    tags: ['legal', 'article', 'anchor nav'],
    icon: 'gavel',
    isNew: true,
  },
  {
    name: 'not-found',
    label: 'Not found',
    href: '/blocks/not-found/',
    group: 'Website',
    summary: 'A 404 page that helps people on: what happened in plain words, a search, and links to the places most people were looking for.',
    tags: ['error', 'search', 'empty state'],
    icon: 'travel_explore',
    isNew: true,
  },
  {
    name: 'waitlist',
    label: 'Waitlist',
    href: '/blocks/waitlist/',
    group: 'Website',
    summary: 'A waitlist sign-up: what people get beside a short validated form, a consent checkbox, and the confirmation that replaces the form.',
    tags: ['form', 'marketing', 'validation'],
    icon: 'hourglass_top',
    isNew: true,
  },
  {
    name: 'knowledge-article',
    label: 'Knowledge article',
    href: '/blocks/knowledge-article/',
    group: 'Portals',
    summary: 'A help article in a support portal: breadcrumb, steps, a "Was this helpful?" question, related articles and a way to open a case.',
    tags: ['portal', 'article', 'feedback'],
    icon: 'help',
    isNew: true,
  },
  {
    name: 'search-results',
    label: 'Search results',
    href: '/blocks/search-results/',
    group: 'Portals',
    summary: 'Portal search results with the query marked in titles and excerpts, filters by type with counts, pagination and a way out when nothing fits.',
    tags: ['portal', 'search', 'highlight'],
    icon: 'manage_search',
    isNew: true,
  },
  {
    name: 'service-catalog',
    label: 'Service catalog',
    href: '/blocks/service-catalog/',
    group: 'Portals',
    summary: 'An employee service catalog: categories, request cards with delivery times, and a request form in a side sheet.',
    tags: ['portal', 'cards', 'side sheet'],
    icon: 'shopping_bag',
    isNew: true,
  },
  {
    name: 'my-cases',
    label: 'My cases',
    href: '/blocks/my-cases/',
    group: 'Portals',
    summary: "A signed-in customer's support cases: open and resolved tabs, a table with status tags and last updates, and an Open a case action.",
    tags: ['portal', 'table', 'tabs'],
    icon: 'confirmation_number',
    isNew: true,
  },
  {
    name: 'org-members',
    label: 'Organisation members',
    href: '/blocks/org-members/',
    group: 'Portals',
    summary: 'The members of an organisation in an account portal: roles, invitations waiting for an answer, and an invite form in a side sheet.',
    tags: ['portal', 'table', 'invitations'],
    icon: 'group',
    isNew: true,
  },
  {
    name: 'downloads',
    label: 'Downloads',
    href: '/blocks/downloads/',
    group: 'Portals',
    summary: 'Downloads in an account portal: the latest release per platform with checksums, a licence key to copy, and earlier releases.',
    tags: ['portal', 'downloads', 'copy button'],
    icon: 'download',
    isNew: true,
  },
  {
    name: 'oidc-sign-in',
    label: 'Sign in with a provider',
    href: '/blocks/oidc-sign-in/',
    group: 'Portals',
    summary: 'Sign-in for a portal that keeps no passwords: Continue with Google or Microsoft, single sign-on found from a work email, and the terms.',
    tags: ['auth', 'portal', 'single sign-on'],
    icon: 'key',
    isNew: true,
  },
];

export const BLOCKS_OVERVIEW = { label: 'Overview', href: '/blocks/' } as const;
