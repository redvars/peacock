import componentsDetails from './custom-elements-jsdocs.json';
import { marked } from 'marked';

const otherComps = [{
  rawTag: 'footer',
  label: 'Footer',
  summary: 'The footer component represents the bottom section of a web page.',
  tag: 'footer',
  wip: true
}, {
  rawTag: 'split-button',
  label: 'Split Button',
  summary: 'A split button lets users perform a default action or choose from a set of related actions via a dropdown menu.',
  overview: '<p>A split button combines a primary action and a menu trigger in one compact control. It follows M3 patterns, keeping a default action prominent while exposing related actions on demand.</p>',
  tag: 'wc-split-button',
  customElement: {
    attributes: [
      {
        name: 'size',
        type: { text: "'xs' | 'sm' | 'md' | 'lg' | 'xl'" },
        default: "'sm'",
        description: 'Button size.',
        fieldName: 'size',
      },
      {
        name: 'variant',
        type: { text: "'filled' | 'tonal' | 'outlined'" },
        default: "'filled'",
        description: 'Visual style of the split button.',
        fieldName: 'variant',
      },
      {
        name: 'color',
        type: { text: "'primary' | 'secondary' | 'tertiary' | 'success' | 'danger' | 'warning' | 'surface' | 'on-surface'" },
        default: "'primary'",
        description: 'Primary color of the split button.',
        fieldName: 'color',
      },
      {
        name: 'disabled',
        type: { text: 'boolean' },
        default: 'false',
        description: 'Disables both primary and menu actions.',
        fieldName: 'disabled',
      }
    ],
    events: [
      {
        name: 'click',
        type: { text: 'MouseEvent' }
      },
      {
        name: 'toggle-menu',
        type: { text: 'CustomEvent<{ open: boolean }>' }
      }
    ],
    cssProperties: [
      {
        name: '--split-button-container-shape',
        description: 'Defines the border radius of the split button container shape.'
      },
      {
        name: '--filled-split-button-container-color',
        description: 'Color of the filled split button container.'
      },
      {
        name: '--filled-split-button-label-text-color',
        description: 'Text color of the filled split button label.'
      },
      {
        name: '--outlined-split-button-container-color',
        description: 'Color of the outlined split button container.'
      },
      {
        name: '--outlined-split-button-label-text-color',
        description: 'Text color of the outlined split button label.'
      },
      {
        name: '--tonal-split-button-container-color',
        description: 'Color of the tonal split button container.'
      },
      {
        name: '--tonal-split-button-label-text-color',
        description: 'Text color of the tonal split button label.'
      }
    ]
  }
}];


export function getComponentDetails(name: string): any {
  let comp = componentsDetails.find((component: any) => {
    return component.rawTag == name;
  });
  if (!comp) {
    comp = otherComps.find((component: any) => {
      return component.rawTag == name;
    });
  }
  return comp;
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
