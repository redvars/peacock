import {
  directive,
  Directive,
  ElementPart,
  PartInfo,
  PartType,
} from 'lit/directive.js';

class SpreadDirective extends Directive {
  constructor(partInfo: PartInfo) {
    super(partInfo);
    if (partInfo.type !== PartType.ELEMENT) {
      throw new Error('spread() can only be used on elements');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render(_props: { [key: string]: any } | undefined) {
    return '';
  }

  update(part: ElementPart, [props]: [{ [key: string]: any } | undefined]) {
    if (!props) return;
    // eslint-disable-next-line guard-for-in,no-restricted-syntax
    for (const key in props) {
      const value = props[key];
      if (value === undefined || value === null) {
        part.element.removeAttribute(key);
      } else {
        part.element.setAttribute(key, value);
      }
    }
  }
}

export const spread = directive(SpreadDirective);
