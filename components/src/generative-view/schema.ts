import { catalog as defaultCatalog } from './catalog.generated.js';
import type { GenerativeCatalog, GenerativePropSpec } from './types.js';
import { TEXT_TYPE, TEXT_VARIANTS } from './validate.js';

type JsonSchema = Record<string, unknown>;

function propSchema(spec: GenerativePropSpec): JsonSchema {
  const description = spec.description ? { description: spec.description } : {};
  if (spec.kind === 'enum')
    return { type: 'string', enum: spec.values ?? [], ...description };
  return { type: spec.kind, ...description };
}

/**
 * The JSON Schema (draft 2020-12) of what `wc-generative-view` renders: a node, or a list of nodes
 * and text, built from the components and props it allows. Give it to the model service as the
 * answer's structured-output schema, or describe it in the prompt; the view checks every answer
 * against the same catalog, so an answer that ignores the schema loses only what does not fit.
 */
export function generativeViewSchema(
  catalog: GenerativeCatalog = defaultCatalog,
): JsonSchema {
  const defs: Record<string, JsonSchema> = {
    child: {
      description: 'A node, or plain text (never HTML or Markdown).',
      anyOf: [{ type: 'string' }, { $ref: '#/$defs/node' }],
    },
    [TEXT_TYPE]: {
      type: 'object',
      description:
        'A heading or paragraph. Its children are plain text; `headline` and `title` are headings.',
      properties: {
        type: { const: TEXT_TYPE },
        props: {
          type: 'object',
          properties: {
            variant: { type: 'string', enum: [...TEXT_VARIANTS] },
          },
          additionalProperties: false,
        },
        slot: { type: 'string' },
        children: { type: 'array', items: { type: 'string' } },
      },
      required: ['type'],
      additionalProperties: false,
    },
  };

  for (const [type, entry] of Object.entries(catalog)) {
    const properties: Record<string, JsonSchema> = {
      type: { const: type },
      props: {
        type: 'object',
        properties: Object.fromEntries(
          Object.entries(entry.props).map(([name, spec]) => [
            name,
            propSchema(spec),
          ]),
        ),
        additionalProperties: false,
      },
      slot: {
        type: 'string',
        description: "The parent's named slot this node goes in.",
      },
    };
    if (entry.children || entry.slots.length) {
      const slots = entry.slots.length
        ? ` Children for a named slot set \`slot\` to one of: ${entry.slots.join(', ')}.`
        : '';
      properties.children = {
        type: 'array',
        items: { $ref: '#/$defs/child' },
        description: entry.children
          ? `Content of the ${type}.${slots}`
          : `Only children with a \`slot\`.${slots}`,
      };
    }
    if (entry.action) {
      properties.action = {
        type: 'string',
        description: `An id the app receives when the ${type} is ${entry.action === 'click' ? 'pressed' : 'selected'}. It does nothing by itself.`,
      };
      properties.payload = {
        description: 'Data sent with the action, such as a record id.',
      };
    }
    defs[type] = {
      type: 'object',
      description: entry.description,
      properties,
      required: ['type'],
      additionalProperties: false,
    };
  }

  defs.node = {
    anyOf: [TEXT_TYPE, ...Object.keys(catalog)].map(type => ({
      $ref: `#/$defs/${type}`,
    })),
  };

  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'Peacock generative view',
    description:
      'An answer shown as Peacock components: one node, or a list of nodes and text. Values come from the platform; the view only lays them out.',
    anyOf: [
      { $ref: '#/$defs/node' },
      { type: 'array', items: { $ref: '#/$defs/child' } },
    ],
    $defs: defs,
  };
}
