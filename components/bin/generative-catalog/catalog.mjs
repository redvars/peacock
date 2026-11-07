// Builds the catalog of `wc-generative-view` from the allow-list and custom-elements.json: for
// each allowed prop, the JSON kind its type maps to, its enum values and its description.

import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

/** Splits `text` on `separator` where it is not nested in brackets or quotes. */
export function splitTopLevel(text, separator) {
  const parts = [];
  let depth = 0;
  let quote = '';
  let current = '';
  for (const char of text) {
    if (quote) {
      if (char === quote) quote = '';
    } else if (char === "'" || char === '"' || char === '`') quote = char;
    else if ('([{<'.includes(char)) depth += 1;
    else if (')]}>'.includes(char)) depth -= 1;
    else if (char === separator && depth === 0) {
      parts.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  parts.push(current);
  return parts.map(part => part.trim()).filter(Boolean);
}

/**
 * The type aliases under `srcDir`: `exported` holds `export type Name = …;` by name, and `byFile`
 * every alias of a file (exported or not) by its path relative to `srcDir`, so an element's own
 * aliases win over a same-named one elsewhere.
 */
export function collectTypeAliases(srcDir) {
  const exported = new Map();
  const byFile = new Map();
  const walk = dir => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
        const code = readFileSync(file, 'utf8');
        const own = new Map();
        for (const match of code.matchAll(/(export\s+)?type\s+(\w+)\s*=\s*/g)) {
          let depth = 0;
          let end = match.index + match[0].length;
          for (; end < code.length; end += 1) {
            const char = code[end];
            if ('([{<'.includes(char)) depth += 1;
            else if (')]}'.includes(char) || (char === '>' && code[end - 1] !== '=')) depth -= 1;
            else if (char === ';' && depth <= 0) break;
          }
          const text = code.slice(match.index + match[0].length, end).trim();
          own.set(match[2], text);
          if (match[1]) exported.set(match[2], text);
        }
        // `export const STEPS = ['a', 'b'] as const;`, for `(typeof STEPS)[number]`.
        for (const match of code.matchAll(
          /export\s+const\s+(\w+)\s*=\s*\[([^\]]*)\]\s*as\s+const/g,
        )) {
          const values = splitTopLevel(match[2].replace(/\/\/.*$/gm, ''), ',');
          exported.set(`(typeof ${match[1]})[number]`, values.join(' | '));
        }
        byFile.set(path.relative(srcDir, file).replace(/\\/g, '/'), own);
      }
    }
  };
  walk(srcDir);
  return { exported, byFile };
}

/** `src/card/card.ts` from a manifest module path, which may be absolute. */
function srcRelative(modulePath) {
  const normalized = modulePath.replace(/\\/g, '/');
  const index = normalized.lastIndexOf('src/');
  return index === -1 ? normalized : normalized.slice(index + 4);
}

const OBJECT_TYPES = new Set(['Intl.NumberFormatOptions']);

/**
 * The JSON kind of a TypeScript type: `string`, `number`, `boolean`, `enum` (with `values`),
 * `array` or `object`. Throws for a type a model cannot send as JSON, such as a function.
 */
export function mapType(text, aliases, seen = new Set()) {
  const parts = splitTopLevel(text.replace(/\/\*[\s\S]*?\*\//g, ''), '|').filter(
    part => part !== 'undefined' && part !== 'null',
  );
  if (!parts.length) throw new Error(`No type in "${text}"`);
  if (parts.length > 1) {
    const kinds = parts.map(part => mapType(part, aliases, seen));
    if (kinds.every(kind => kind.kind === 'enum'))
      return { kind: 'enum', values: [...new Set(kinds.flatMap(kind => kind.values))] };
    // A union with `string`, such as `'_blank' | string`, is any string.
    if (kinds.every(kind => kind.kind === 'enum' || kind.kind === 'string'))
      return { kind: 'string' };
    if (kinds.every(kind => kind.kind === kinds[0].kind)) return kinds[0];
    throw new Error(`Mixed union "${text}"`);
  }
  const type = parts[0];
  if (type === 'string' || type === 'number' || type === 'boolean') return { kind: type };
  const literal = /^'([^']*)'$|^"([^"]*)"$/.exec(type);
  if (literal) return { kind: 'enum', values: [literal[1] ?? literal[2]] };
  if (/\[\]$/.test(type) || /^(?:Readonly)?Array</.test(type)) return { kind: 'array' };
  if (OBJECT_TYPES.has(type) || /^Record</.test(type) || /^\{[\s\S]*\}$/.test(type))
    return { kind: 'object' };
  if (/=>/.test(type)) throw new Error(`Function type "${text}"`);
  if (aliases.has(type)) {
    if (seen.has(type)) throw new Error(`Recursive type "${type}"`);
    return mapType(aliases.get(type), aliases, new Set([...seen, type]));
  }
  if (/^\(([\s\S]*)\)$/.test(type)) return mapType(type.slice(1, -1), aliases, seen);
  throw new Error(`Unknown type "${type}"`);
}

/** Declarations of custom elements in the manifest, by tag, with their module's path. */
function declarationsByTag(manifest) {
  const result = new Map();
  for (const mod of manifest.modules ?? [])
    for (const declaration of mod.declarations ?? [])
      if (declaration.tagName)
        result.set(declaration.tagName, { declaration, file: srcRelative(mod.path) });
  return result;
}

/** The catalog: one entry per allowed type, in allow-list order. */
export function buildCatalog(allowList, manifest, { exported, byFile }) {
  const declarations = declarationsByTag(manifest);
  const catalog = {};
  for (const [type, entry] of Object.entries(allowList)) {
    const found = declarations.get(entry.tag);
    if (!found) throw new Error(`${type}: ${entry.tag} is not in the manifest`);
    const { declaration, file } = found;
    const aliases = new Map([...exported, ...(byFile.get(file) ?? [])]);
    const props = {};
    for (const name of entry.props) {
      const member = (declaration.members ?? []).find(
        m => m.kind === 'field' && m.name === name && !m.static && !m.privacy,
      );
      if (!member) throw new Error(`${type}: ${entry.tag} has no property "${name}"`);
      if (member.readonly) throw new Error(`${type}: "${name}" is read-only`);
      let kind;
      try {
        kind = mapType(member.type?.text ?? 'string', aliases);
      } catch (error) {
        throw new Error(`${type}.${name}: ${error.message}`);
      }
      props[name] = { ...kind, description: (member.description ?? '').trim() };
    }
    catalog[type] = {
      tag: entry.tag,
      description: (declaration.summary ?? '').trim(),
      props,
      slots: entry.slots ?? [],
      children: Boolean(entry.children),
      ...(entry.wrap ? { wrap: entry.wrap } : {}),
      ...(entry.action ? { action: entry.action } : {}),
    };
  }
  return catalog;
}

/** The generated TypeScript module. */
export function emitCatalog(catalog) {
  const tags = [
    ...new Set(Object.values(catalog).flatMap(e => [e.tag, ...(e.wrap ? [e.wrap] : [])])),
  ];
  return `// Generated by bin/generative-catalog.mjs from bin/generative-catalog/allow-list.mjs and
// dist/custom-elements.json. Do not edit: change the allow-list and run
// \`node bin/generative-catalog.mjs\` after \`npm run build\`.
//
// Renders: ${tags.map(tag => `<${tag}>`).join(' ')}

import type { GenerativeCatalog } from './types.js';

export const catalog: GenerativeCatalog = ${JSON.stringify(catalog, null, 2)};
`;
}
