/** Keys that JSONPath can write with dot notation. */
const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;

/** The JSONPath of a child: `$.items[2].id`, or bracket notation for other keys (`$['a b']`). */
export function childPath(parent: string, key: string | number): string {
  if (typeof key === 'number') return `${parent}[${key}]`;
  if (IDENTIFIER.test(key)) return `${parent}.${key}`;
  const quoted = key.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  return `${parent}['${quoted}']`;
}

/** The kinds of value a JSON viewer tells apart. */
export type JsonKind =
  | 'object'
  | 'array'
  | 'string'
  | 'number'
  | 'boolean'
  | 'null'
  | 'undefined'
  | 'other';

export function kindOf(value: unknown): JsonKind {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (value instanceof Date) return 'other';
  switch (typeof value) {
    case 'object':
      return 'object';
    case 'string':
      return 'string';
    case 'number':
    case 'bigint':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'undefined':
      return 'undefined';
    default:
      return 'other';
  }
}

/** The text to copy for a value: a string as is, anything else as indented JSON. */
export function copyText(value: unknown): string {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2) ?? String(value);
  } catch {
    // Circular structures and BigInts cannot be stringified.
    return String(value);
  }
}
