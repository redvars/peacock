import componentsDetails from './custom-elements-jsdocs.json';
import { marked } from 'marked';

export function getComponentDetails(name: string): any {
  const comp = componentsDetails.find((component: any) => {
    return component.rawTag == name;
  });
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
