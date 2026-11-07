import componentsDetails from './custom-elements-jsdocs.json';
import { marked } from 'marked';

export function getAllComponentDetails() {
  const detailsByTag = new Map<string, any>();

  componentsDetails.forEach(component => {
    if (component?.rawTag) {
      detailsByTag.set(component.rawTag, component);
    }
  });

  return Array.from(detailsByTag.values());
}

export function getAllComponentsForShowcase() {
  const components = getAllComponentDetails();

  return components.filter(function (component) {
    // Charts have their own section (pages/charts).
    if (component.tags === 'charts') return false;
    return ![
      'tab-panel',
      'tab-group',
      'code-group',
      'tab',
      'popover-content',
      'segmented-button',
      'option',
      'navigation-rail-item',
      'menu-item',
      'sub-menu',
      'list-item',
      'listbox-option',
      'item',
      'navigation-drawer-group',
      'flow-designer-node',
      'cb-group',
      'cb-rule',
      'cb-divider',
      'card-content',
      'calendar-column-view',
      'calendar-month-view',
      'breadcrumb-item',
      'accordion-item',
      'timeline-item',
      // Children documented on their parent's page.
      'radio',
      'discussion-comment',
      'discussion-activity',
      'description-item',
      'navigation-bar-item',
      'navigation-drawer-item',
      'panel',
      'step',
      'tree-item',
    ].includes(component.rawTag);
  });
}

export function getComponentDetails(name: string): any {
  return getAllComponentDetails().find((component: any) => {
    return component.rawTag == name;
  });
}

export function getTextTag(component: any, tag: string) {
  const value = component?.[tag];
  if (value) return value;
  console.log(
    `No text found for tag ${tag} in component ${component?.rawTag}. Using default text instead.`,
  );
  return null;
}

export function getMarkdown(component: any, tag: string) {
  const markdownString = component?.[tag];
  if (markdownString) {
    // For fenced examples, return the code block content so set:html can render live preview.
    // For prose markdown (overview/summary), render to HTML.
    const tokens = marked.lexer(markdownString);
    const codeBlocks: any = tokens.filter(
      (token: any) => token.type === 'code',
    );
    if (codeBlocks[0]?.text) return codeBlocks[0].text;
    return marked.parse(markdownString) as string;
  }
  return 'Web Component';
}
