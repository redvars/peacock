import componentsDetails from './custom-elements-jsdocs.json';
import { marked } from 'marked';

export function getComponentDetails(name: string): any {
  const comp = componentsDetails.find((component: any) => {
    console.log(
      component.rawTag + ' === ' + name + ' ' + (component.rawTag == name),
    );
    return component.rawTag == name;
  });
  return comp;
}

export function getTextTag(component: any, tag: string) {
  if (component?.jsdoc[tag] && component?.jsdoc[tag][0])
    return component.jsdoc[tag][0].text;
  console.log(
    `No text found for tag ${tag} in component ${component?.rawTag}. Using default text instead.`,
  );
  return 'Web Component';
}

export function getCodeBlock(component: any, tag: string) {
  if (component?.jsdoc[tag] && component?.jsdoc[tag][0]) {
    const markdownString = component.jsdoc[tag][0].text;
    // 1. Convert Markdown into an array of tokens
    const tokens = marked.lexer(markdownString);
    const codeBlocks: any = tokens.filter(
      (token: any) => token.type === 'code',
    );
    return codeBlocks[0].text;
  }
  return 'Web Component';
}
