// Turns custom-elements.json into the model the framework emitters share: one entry per element
// with its props, events, two-way binding kind and the other Peacock tags it renders.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

/** Event types that are plain DOM events, for which frameworks need no custom binding. */
const NATIVE_EVENT_TYPES = new Set(['MouseEvent', 'FocusEvent', 'KeyboardEvent', 'PointerEvent']);

/** Global type names a detail type may use without an import. */
const GLOBAL_TYPES = new Set([
  'CustomEvent', 'Event', 'MouseEvent', 'KeyboardEvent', 'FocusEvent', 'PointerEvent', 'Error',
  'File', 'FormData', 'HTMLElement', 'Element', 'Date', 'Record', 'Partial', 'Array', 'Map', 'Set',
  'Promise', 'Blob', 'Node', 'DragEvent',
]);

export function kebabToPascal(name) {
  return name
    .split(/[-_:]/)
    .filter(Boolean)
    .map(part => part[0].toUpperCase() + part.slice(1))
    .join('');
}

export function kebabToCamel(name) {
  const pascal = kebabToPascal(name);
  return pascal[0].toLowerCase() + pascal.slice(1);
}

/** `wc-menu-item` -> `MenuItem`. */
export function tagToName(tagName) {
  return kebabToPascal(tagName.replace(/^wc-/, ''));
}

/** Path of a module inside the package, from the manifest's (possibly absolute) module path. */
function srcRelative(modulePath) {
  const normalized = modulePath.replace(/\\/g, '/').replace(/^\//, '');
  const index = normalized.lastIndexOf('src/');
  return index === -1 ? normalized : normalized.slice(index);
}

function isPublicField(member) {
  return (
    member.kind === 'field' &&
    !member.static &&
    !member.readonly &&
    !member.privacy &&
    !/^[_#[]/.test(member.name)
  );
}

/**
 * The detail type of an event if every named type it uses can be imported, otherwise `unknown`.
 * `resolveType(name)` returns the module specifier that exports a type name, or undefined.
 */
function eventType(text, resolveType) {
  const raw = (text || 'CustomEvent').trim();
  if (NATIVE_EVENT_TYPES.has(raw) || raw === 'Event') return { type: raw, imports: [] };
  const match = /^CustomEvent(?:<([\s\S]*)>)?$/.exec(raw);
  if (!match) return { type: 'CustomEvent<unknown>', imports: [] };
  const detail = match[1]?.trim();
  if (!detail) return { type: 'CustomEvent<unknown>', imports: [] };

  // Drop string literals before looking for type names.
  const names = detail.replace(/'[^']*'|"[^"]*"/g, '').match(/\b[A-Z][A-Za-z0-9_]*\b/g) ?? [];
  const imports = [];
  for (const name of new Set(names)) {
    if (GLOBAL_TYPES.has(name)) continue;
    const from = resolveType(name);
    if (!from) return { type: 'CustomEvent<unknown>', imports: [] };
    imports.push({ name, from });
  }
  return { type: `CustomEvent<${detail}>`, imports };
}

/**
 * Binding kind for v-model, ngModel and friends: `checked` for toggles, `value` for fields. The
 * binding event is `input` when the element reports values as they are typed, otherwise `change`.
 */
function bindingOf(fields, events) {
  const field = name => fields.find(f => f.name === name);
  const event = name => events.find(e => e.name === name);
  const carriesValue = e => e && (e.type === 'CustomEvent<unknown>' || /\bvalue\??:/.test(e.type));

  if (field('checked') && event('change')) return { kind: 'checked', prop: 'checked', event: 'change' };
  if (field('value')) {
    if (carriesValue(event('input'))) return { kind: 'value', prop: 'value', event: 'input' };
    if (carriesValue(event('change'))) return { kind: 'value', prop: 'value', event: 'change' };
  }
  return undefined;
}

/** Local modules a source file imports, resolved to `.ts` files under `srcDir`. */
function localImports(file, srcDir) {
  const code = readFileSync(file, 'utf8');
  const result = [];
  for (const [, spec] of code.matchAll(/(?:from|import)\s*['"]([^'"]+)['"]/g)) {
    let target;
    if (spec.startsWith('@/')) target = path.join(srcDir, spec.slice(2));
    else if (spec.startsWith('.')) target = path.join(path.dirname(file), spec);
    else continue;
    target = target.replace(/\.js$/, '.ts');
    if (!target.endsWith('.ts')) target += '.ts';
    if (existsSync(target)) result.push(target);
  }
  return result;
}

/** Every `<wc-*>` tag the file and the local modules it imports render, transitively. */
function renderedTags(file, srcDir, cache) {
  const seen = new Set();
  const tags = new Set();
  const stack = [file];
  while (stack.length) {
    const current = stack.pop();
    if (seen.has(current)) continue;
    seen.add(current);
    if (!cache.has(current)) {
      // Comments are scanned too: stripping them with a regex can swallow code (a `/*` inside a
      // string), and a tag named in a comment only costs one extra registration.
      const code = readFileSync(current, 'utf8');
      cache.set(current, {
        tags: [...code.matchAll(/<(wc-[a-z0-9-]+)/g)].map(m => m[1]),
        imports: localImports(current, srcDir),
      });
    }
    const entry = cache.get(current);
    entry.tags.forEach(tag => tags.add(tag));
    stack.push(...entry.imports);
  }
  return tags;
}

/**
 * Builds the model.
 * @param {object} manifest   custom-elements.json
 * @param {object} options
 * @param {string} [options.srcDir]  `components/src`, to find the tags each element renders
 * @param {(name: string, element: object) => string | undefined} [options.resolveType]
 *   module that exports a type name used in an event detail
 */
export function buildModel(manifest, { srcDir, resolveType = () => undefined } = {}) {
  const elements = [];
  for (const mod of manifest.modules ?? []) {
    for (const declaration of mod.declarations ?? []) {
      if (!declaration.tagName || !declaration.customElement) continue;
      const modulePath = srcRelative(mod.path);
      const exportNames = (mod.exports ?? [])
        .filter(e => e.kind === 'js' && e.declaration?.name === declaration.name)
        .map(e => e.name);
      const element = {
        tagName: declaration.tagName,
        className: declaration.name,
        // How the entry and the declarations export the class: by name, or as the default.
        exportName:
          exportNames.includes(declaration.name) || !exportNames.includes('default')
            ? declaration.name
            : 'default',
        name: tagToName(declaration.tagName),
        modulePath,
        // Rollup gives every component its own entry named after its source file.
        entry: `${path.posix.basename(modulePath, '.ts')}.js`,
        // Declarations of the class, published under dist/src/.
        typesPath: modulePath.replace(/^src\//, 'dist/src/').replace(/\.ts$/, '.js'),
        description: declaration.summary || declaration.description || '',
        props: [],
        events: [],
        slots: (declaration.slots ?? []).map(s => s.name).filter(Boolean),
        dependencies: [],
      };

      const seenProps = new Set();
      for (const member of declaration.members ?? []) {
        if (!isPublicField(member) || seenProps.has(member.name)) continue;
        seenProps.add(member.name);
        element.props.push({
          name: member.name,
          attribute: member.attribute,
          description: member.description || '',
        });
      }

      const seenEvents = new Set();
      for (const event of declaration.events ?? []) {
        if (!event.name || seenEvents.has(event.name)) continue;
        seenEvents.add(event.name);
        const { type, imports } = eventType(event.type?.text, name =>
          resolveType(name, element),
        );
        element.events.push({
          name: event.name,
          type,
          imports,
          native: NATIVE_EVENT_TYPES.has(type),
          description: event.description || '',
        });
      }

      element.binding = bindingOf(element.props, element.events);
      elements.push(element);
    }
  }

  if (srcDir) elements.push(...unlistedElements(srcDir, new Set(elements.map(e => e.tagName))));

  elements.sort((a, b) => a.tagName.localeCompare(b.tagName));

  if (srcDir) {
    const known = new Set(elements.map(e => e.tagName));
    const cache = new Map();
    for (const element of elements) {
      const file = path.join(srcDir, element.modulePath.replace(/^src\//, ''));
      if (!existsSync(file)) continue;
      element.dependencies = [...renderedTags(file, srcDir, cache)]
        .filter(tag => tag !== element.tagName && known.has(tag))
        .sort();
    }
  }

  return { elements };
}

/**
 * Components the manifest misses (the analyzer does not see every class declaration) but that
 * other components render, found by their `@tag` JSDoc. They get a registration module only, with
 * no framework wrapper: `registrationOnly: true`.
 */
function unlistedElements(srcDir, known) {
  const result = [];
  const walk = dir => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
        const code = readFileSync(file, 'utf8');
        const match = /@tag\s+(wc-[a-z0-9-]+)[\s\S]*?export\s+(default\s+)?class\s+(\w+)/.exec(code);
        if (!match || known.has(match[1]) || !/@IndividualComponent/.test(code)) continue;
        const modulePath = `src/${path.relative(srcDir, file).replace(/\\/g, '/')}`;
        result.push({
          tagName: match[1],
          className: match[3],
          exportName: match[2] ? 'default' : match[3],
          name: tagToName(match[1]),
          modulePath,
          entry: `${path.posix.basename(modulePath, '.ts')}.js`,
          typesPath: modulePath.replace(/^src\//, 'dist/src/').replace(/\.ts$/, '.js'),
          description: '',
          props: [],
          events: [],
          slots: [],
          dependencies: [],
          registrationOnly: true,
        });
      }
    }
  };
  walk(srcDir);
  return result;
}

/**
 * A `resolveType` that looks a type name up in the package's published declarations: first the
 * root `index.d.ts`, then the element's own module.
 */
export function createTypeResolver(packageDir, packageName) {
  const read = file => (existsSync(file) ? readFileSync(file, 'utf8') : '');
  const exportsName = (code, name) =>
    new RegExp(
      `export\\s+(?:declare\\s+)?(?:type|interface|class|enum|const)\\s+${name}\\b|export\\s+(?:type\\s+)?\\{[^}]*\\b${name}\\b[^}]*\\}`,
    ).test(code);
  const root = read(path.join(packageDir, 'dist/src/index.d.ts'));
  return (name, element) => {
    if (exportsName(root, name)) return packageName;
    const own = read(path.join(packageDir, element.typesPath.replace(/\.js$/, '.d.ts')));
    if (exportsName(own, name)) return `${packageName}/${element.typesPath}`;
    return undefined;
  };
}
