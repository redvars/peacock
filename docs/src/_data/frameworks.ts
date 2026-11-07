// The Frameworks pages: using Peacock from React, Vue and Angular.

export interface FrameworkPage {
  label: string;
  href: string;
  icon: string;
  description: string;
}

export const FRAMEWORK_PAGES: FrameworkPage[] = [
  {
    label: 'Overview',
    href: '/frameworks/',
    icon: 'dashboard',
    description: 'Peacock in React, Vue and Angular: typed components generated from the custom elements.',
  },
  {
    label: 'React',
    href: '/frameworks/react/',
    icon: 'code',
    description: '@redvars/peacock-react: React components with typed props and onX event props.',
  },
  {
    label: 'Vue',
    href: '/frameworks/vue/',
    icon: 'code',
    description: '@redvars/peacock-vue: Vue components with typed props, events and v-model.',
  },
  {
    label: 'Angular',
    href: '/frameworks/angular/',
    icon: 'code',
    description: '@redvars/peacock-angular: standalone components, typed outputs, ngModel and reactive forms.',
  },
];
