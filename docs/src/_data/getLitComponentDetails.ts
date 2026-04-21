import componentsDetails from './custom-elements-jsdocs.json';
import { marked } from 'marked';

const otherComps = [{
  rawTag: 'footer',
  label: 'Footer',
  summary: 'The footer component represents the bottom section of a web page.',
  tag: 'footer',
  wip: true,
  customElement: {
    attributes: [],
    events: [],
    cssProperties: [],
  },
}, {
  rawTag: 'text',
  label: 'Text',
  summary: 'The footer component represents the bottom section of a web page.',
  tag: 'footer',
  wip: true,
  customElement: {
    attributes: [],
    events: [],
    cssProperties: [],
  },
}, {
  rawTag: 'item',
  label: 'Item',
  summary: 'A Material 3 item with start, text, and end slots.',
  tag: 'wc-item',
  example: '```html\n<wc-item selected>\n  <wc-icon slot="start" name="home"></wc-icon>\n  <div slot="overline">Overline</div>\n  <div slot="headline">Headline</div>\n  <div slot="supporting-text">Supporting text</div>\n  <div slot="trailing-supporting-text">Trailing</div>\n  <wc-icon slot="end" name="chevron_right"></wc-icon>\n</wc-item>\n```',
  customElement: {
    attributes: [],
    events: [],
    cssProperties: [],
  },
}];

export function getAllComponentDetails() {
  const detailsByTag = new Map<string, any>();

  [...componentsDetails, ...otherComps].forEach(component => {
    if (component?.rawTag) {
      detailsByTag.set(component.rawTag, component);
    }
  });

  return Array.from(detailsByTag.values());
}

export function getAllComponentsForShowcase() {
  const components = getAllComponentDetails();

  return components.filter(function(component) {
      return !component.parentRawTag;
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
