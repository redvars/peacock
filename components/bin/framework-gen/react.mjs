// React wrappers built with @lit/react: properties are set as properties, and every custom event
// gets an `onX` prop typed with its detail.

import { kebabToPascal } from './model.mjs';
import { HEADER, ImportSet, eventTypeWithImports, jsdoc } from './shared.mjs';

/** Events React already delivers through its own `onX` props for every element. */
const REACT_HANDLED = new Set(['click', 'focus', 'blur', 'keydown', 'keyup', 'pointerdown', 'pointerup']);

export function reactEventProp(eventName) {
  return `on${kebabToPascal(eventName)}`;
}

export function emitReact(model) {
  const files = {};
  const barrel = [];

  for (const element of model.elements.filter(e => !e.registrationOnly)) {
    const imports = new ImportSet();
    imports.add(`import * as React from 'react';`);
    imports.add(`import { createComponent } from '@lit/react';`);
    const events = element.events.filter(e => !(e.native && REACT_HANDLED.has(e.name)));
    if (events.length) imports.add(`import type { EventName } from '@lit/react';`);
    imports.add(`import ElementClass from '../define/${element.tagName}.js';`);

    const eventLines = events.map(event => {
      const { type, imports: typeImports } = eventTypeWithImports(event);
      typeImports.forEach(i => imports.add(i.line, i.key));
      return `${jsdoc(event.description, '    ')}    ${reactEventProp(event.name)}: '${event.name}' as EventName<${type}>,`;
    });

    const name = element.name;
    files[`components/${element.tagName}.ts`] = `'use client';
${HEADER}
${imports}

${jsdoc(element.description || `React wrapper for \`<${element.tagName}>\`.`)}export const ${name} = createComponent({
  tagName: '${element.tagName}',
  elementClass: ElementClass,
  react: React,
  events: {
${eventLines.join('\n')}
  },
  displayName: '${name}',
});

export type ${name}Element = InstanceType<typeof ElementClass>;
export type ${name}Props = React.ComponentProps<typeof ${name}>;
`;
    barrel.push(`export * from './components/${element.tagName}.js';`);
  }

  files['index.ts'] = `'use client';\n${HEADER}\n${barrel.join('\n')}\n`;
  return files;
}
