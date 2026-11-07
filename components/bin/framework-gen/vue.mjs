// Vue wrappers: each element becomes a component that sets its props as DOM properties,
// re-emits its custom events with typed payloads and, for fields and toggles, supports v-model.

import { kebabToCamel } from './model.mjs';
import { HEADER, ImportSet, eventTypeWithImports, jsdoc } from './shared.mjs';

export function emitVue(model) {
  const files = {};
  const barrel = [];
  const names = [];

  for (const element of model.elements.filter(e => !e.registrationOnly)) {
    const name = `Wc${element.name}`;
    const imports = new ImportSet();
    imports.add(`import { defineComponent, h } from 'vue';`);
    imports.add(`import type { PropType } from 'vue';`);
    imports.add(`import '../define/${element.tagName}.js';`);
    imports.add(`import type ElementClass from '../define/${element.tagName}.js';`);

    const binding = element.binding;
    const propNames = element.props.map(p => p.name);

    const propLines = element.props.map(
      p =>
        `${jsdoc(p.description, '    ')}    ${p.name}: { type: null as unknown as PropType<El['${p.name}']>, default: undefined },`,
    );
    if (binding) {
      propLines.push(
        `    /** Bound with \`v-model\`: sets \`${binding.prop}\` and updates on \`${binding.event}\`. */`,
        `    modelValue: { type: null as unknown as PropType<El['${binding.prop}']>, default: undefined },`,
      );
    }

    const emitLines = [];
    const listenerLines = [];
    for (const event of element.events) {
      const { type, imports: typeImports } = eventTypeWithImports(event);
      typeImports.forEach(i => imports.add(i.line, i.key));
      emitLines.push(
        `${jsdoc(event.description, '    ')}    '${event.name}': (_event: ${type}) => true,`,
      );
      const handler = `on${kebabToCamel(event.name).replace(/^./, c => c.toUpperCase())}`;
      const update =
        binding && binding.event === event.name
          ? ` emit('update:modelValue', (event.currentTarget as El).${binding.prop});`
          : '';
      listenerLines.push(
        `        ${handler}: (event: ${type}) => {\n          emit('${event.name}', event);${update}\n        },`,
      );
    }
    if (binding) {
      emitLines.push(`    'update:modelValue': (_value: El['${binding.prop}']) => true,`);
      if (!element.events.some(e => e.name === binding.event)) {
        throw new Error(`${element.tagName}: binding event ${binding.event} is not declared`);
      }
    }

    const bindingLine = binding
      ? `      if (props.modelValue !== undefined) domProps['.${binding.prop}'] = props.modelValue;\n`
      : '';

    files[`components/${element.tagName}.ts`] = `${HEADER}
${imports}

type El = InstanceType<typeof ElementClass>;

const PROPS = ${JSON.stringify(propNames)} as const;

${jsdoc(element.description || `Vue wrapper for \`<${element.tagName}>\`.`)}export const ${name} = /* #__PURE__ */ defineComponent({
  name: '${name}',
  props: {
${propLines.join('\n')}
  },
  emits: {
${emitLines.join('\n')}
  },
  setup(props, { slots, emit }) {
    return () => {
      // Set as properties, so objects, arrays and booleans reach the element as they are. Props
      // left undefined keep the element's own defaults.
      const domProps: Record<string, unknown> = {};
      for (const key of PROPS) {
        const value = props[key];
        if (value !== undefined) domProps[\`.\${key}\`] = value;
      }
${bindingLine}      return h(
        '${element.tagName}',
        {
          ...domProps,
${listenerLines.map(l => `  ${l.replace(/\n/g, '\n  ')}`).join('\n')}
        },
        slots.default?.(),
      );
    };
  },
});
`;
    barrel.push(`export { ${name} } from './components/${element.tagName}.js';`);
    names.push({ name, tagName: element.tagName });
  }

  files['index.ts'] = `${HEADER}
import type { App, Plugin } from 'vue';
${names.map(n => `import { ${n.name} } from './components/${n.tagName}.js';`).join('\n')}

${barrel.join('\n')}

/** Every Peacock component, by name. */
export const components = {
${names.map(n => `  ${n.name},`).join('\n')}
};

/** Registers every Peacock component globally: \`app.use(PeacockVue)\`. */
export const PeacockVue: Plugin = {
  install(app: App) {
    for (const [name, component] of Object.entries(components)) app.component(name, component);
  },
};

declare module 'vue' {
  export interface GlobalComponents {
${names.map(n => `    ${n.name}: typeof ${n.name};`).join('\n')}
  }
}
`;
  return files;
}
