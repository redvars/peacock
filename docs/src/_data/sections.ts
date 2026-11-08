// The pages of the component sections that have their own entry in the main navigation. Their
// components keep their pages under /components/; layouts/ComponentSection.astro lists them from
// the gallery group of the same name (componentGroups.ts).

export interface SectionPage {
  label: string;
  href: string;
}

export const DIAGRAM_PAGES: SectionPage[] = [{ label: 'Overview', href: '/diagrams/' }];

export const AI_PAGES: SectionPage[] = [{ label: 'Overview and setup', href: '/ai/' }];
