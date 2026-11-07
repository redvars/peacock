import { catalog as defaultCatalog } from './catalog.generated.js';
import type {
  GenerativeCatalog,
  GenerativeCatalogEntry,
  GenerativePropSpec,
} from './types.js';

/** The built-in node for headings and paragraphs, rendered by the view itself. */
export const TEXT_TYPE = 'text';

/** Variants of a `text` node. */
export const TEXT_VARIANTS = [
  'headline',
  'title',
  'body',
  'label',
  'caption',
] as const;

export type TextVariant = (typeof TEXT_VARIANTS)[number];

/** Limits that keep a generated view small enough to render and read. */
export const LIMITS = {
  /** Deepest nesting of nodes. */
  depth: 12,
  /** Most nodes in one view. */
  nodes: 500,
  /** Longest text, prop string or action id, in characters. */
  text: 10_000,
  /** Deepest nesting inside an array or object prop. */
  jsonDepth: 8,
  /** Most values inside one array or object prop. */
  jsonValues: 5_000,
};

/** Icon names: a library's plain names only, so a model cannot spell data into an icon URL. */
const ICON_NAME = /^[a-z][a-z0-9_]{0,39}$/;

/** Props whose value is an icon name, by node type. */
const ICON_PROPS: Record<string, string[]> = {
  icon: ['name'],
  alert: ['icon'],
};

/** A node that passed validation, with only allowed props and children. */
export interface CleanNode {
  type: string;
  /** The catalog entry, or undefined for a `text` node. */
  entry?: GenerativeCatalogEntry;
  props: Record<string, unknown>;
  slot?: string;
  children: (CleanNode | string)[];
  action?: string;
  payload?: unknown;
}

export type CleanChild = CleanNode | string;

export interface CleanResult {
  nodes: CleanChild[];
  /** What was dropped and why, for the developer. */
  issues: string[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Colors a model may give, such as a chart series' `color`: a hex value, a named color or a
 * Peacock token. Anything else (`url(…)`, `image-set(…)`) could load an address, so it is dropped.
 */
const SAFE_COLOR = /^(#[0-9a-f]{3,8}|[a-z]{3,20}|var\(--[a-z0-9-]{1,60}\))$/i;

/**
 * A copy of `value` holding only JSON values (strings, finite numbers, booleans, null, arrays and
 * plain objects), within the size limits; `undefined` when it holds anything else or is too big.
 */
export function cleanJson(value: unknown): unknown {
  let count = 0;
  const walk = (current: unknown, depth: number): unknown => {
    count += 1;
    if (count > LIMITS.jsonValues || depth > LIMITS.jsonDepth)
      throw new RangeError('too big');
    if (current === null || typeof current === 'boolean') return current;
    if (typeof current === 'number') {
      if (!Number.isFinite(current)) throw new TypeError('not finite');
      return current;
    }
    if (typeof current === 'string') {
      if (current.length > LIMITS.text) throw new RangeError('too long');
      return current;
    }
    if (Array.isArray(current))
      return current.map(item => walk(item, depth + 1));
    if (isRecord(current)) {
      const prototype = Object.getPrototypeOf(current);
      if (prototype !== Object.prototype && prototype !== null)
        throw new TypeError('not a plain object');
      const result: Record<string, unknown> = {};
      for (const [key, item] of Object.entries(current)) {
        const unsafeColor =
          key === 'color' &&
          !(typeof item === 'string' && SAFE_COLOR.test(item));
        if (!FORBIDDEN_KEYS.has(key) && !unsafeColor)
          result[key] = walk(item, depth + 1);
      }
      return result;
    }
    throw new TypeError(`not JSON: ${typeof current}`);
  };
  try {
    return walk(value, 0);
  } catch {
    return undefined;
  }
}

/** The prop's value if it fits `spec`, otherwise `undefined`. */
function cleanProp(spec: GenerativePropSpec, value: unknown): unknown {
  switch (spec.kind) {
    case 'string':
      return typeof value === 'string' && value.length <= LIMITS.text
        ? value
        : undefined;
    case 'number':
      return typeof value === 'number' && Number.isFinite(value)
        ? value
        : undefined;
    case 'boolean':
      return typeof value === 'boolean' ? value : undefined;
    case 'enum':
      return typeof value === 'string' && spec.values?.includes(value)
        ? value
        : undefined;
    case 'array':
      return Array.isArray(value) ? cleanJson(value) : undefined;
    case 'object':
      return isRecord(value) ? cleanJson(value) : undefined;
    default:
      return undefined;
  }
}

/** The text inside a value that is not a known node, for showing it as text. */
function textOf(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(textOf).filter(Boolean).join(' ');
  if (isRecord(value) && Array.isArray(value.children))
    return textOf(value.children);
  return '';
}

/**
 * Checks a generated value against the catalog and returns a clean tree: unknown types become
 * their text, unknown or ill-typed props, slots and actions are dropped, and the tree is cut at
 * the limits. Nothing in the result can navigate, load a URL or run code.
 */
export function cleanValue(
  value: unknown,
  catalog: GenerativeCatalog = defaultCatalog,
): CleanResult {
  const issues: string[] = [];
  let count = 0;

  const cleanChildren = (
    children: unknown,
    parent: GenerativeCatalogEntry | undefined,
    path: string,
    depth: number,
  ): CleanChild[] => {
    if (children === undefined) return [];
    const list = Array.isArray(children) ? children : [children];
    const result: CleanChild[] = [];
    list.forEach((child, index) => {
      const at = `${path}[${index}]`;
      if (typeof child === 'string' || typeof child === 'number') {
        const text = String(child).slice(0, LIMITS.text);
        if (parent && !parent.children) {
          issues.push(`${at}: ${path} takes no text`);
          return;
        }
        result.push(text);
        return;
      }
      // cleanNode and cleanChildren call each other.
      // eslint-disable-next-line no-use-before-define
      const node = cleanNode(child, at, depth + 1);
      if (!node) return;
      if (Array.isArray(node)) {
        result.push(...node);
        return;
      }
      if (node.slot && !parent?.slots.includes(node.slot)) {
        issues.push(`${at}: unknown slot "${node.slot}"`);
        delete node.slot;
      }
      if (!node.slot && parent && !parent.children) {
        issues.push(`${at}: ${path} takes no children`);
        return;
      }
      result.push(node);
    });
    return result;
  };

  function cleanNode(
    raw: unknown,
    path: string,
    depth: number,
  ): CleanNode | CleanChild[] | undefined {
    if (depth > LIMITS.depth) {
      issues.push(`${path}: nested deeper than ${LIMITS.depth}`);
      return undefined;
    }
    count += 1;
    if (count > LIMITS.nodes) {
      if (count === LIMITS.nodes + 1)
        issues.push(`${path}: more than ${LIMITS.nodes} nodes`);
      return undefined;
    }
    if (!isRecord(raw) || typeof raw.type !== 'string') {
      issues.push(`${path}: not a node`);
      const text = textOf(raw);
      return text ? [text] : undefined;
    }
    const { type } = raw;
    const slot = typeof raw.slot === 'string' ? raw.slot : undefined;
    const rawProps = isRecord(raw.props) ? raw.props : {};

    if (type === TEXT_TYPE) {
      const variant = TEXT_VARIANTS.includes(rawProps.variant as TextVariant)
        ? (rawProps.variant as TextVariant)
        : 'body';
      const text = textOf(raw.children ?? rawProps.value).slice(0, LIMITS.text);
      return { type, props: { variant }, slot, children: text ? [text] : [] };
    }

    const entry = Object.prototype.hasOwnProperty.call(catalog, type)
      ? catalog[type]
      : undefined;
    if (!entry) {
      issues.push(`${path}: unknown type "${type}", shown as its content`);
      const children = cleanChildren(raw.children, undefined, path, depth);
      return children.length ? children : undefined;
    }

    const props: Record<string, unknown> = {};
    for (const [name, rawValue] of Object.entries(rawProps)) {
      const spec = Object.prototype.hasOwnProperty.call(entry.props, name)
        ? entry.props[name]
        : undefined;
      const clean = spec ? cleanProp(spec, rawValue) : undefined;
      if (!spec) issues.push(`${path}: ${type} has no prop "${name}"`);
      else if (
        clean === undefined ||
        (ICON_PROPS[type]?.includes(name) && !ICON_NAME.test(String(clean)))
      )
        issues.push(`${path}: invalid ${type}.${name}`);
      else props[name] = clean;
    }

    const node: CleanNode = {
      type,
      entry,
      props,
      slot,
      children: cleanChildren(raw.children, entry, path, depth),
    };
    if (raw.action !== undefined) {
      if (
        entry.action &&
        typeof raw.action === 'string' &&
        raw.action &&
        raw.action.length <= 200
      ) {
        node.action = raw.action;
        if (raw.payload !== undefined) node.payload = cleanJson(raw.payload);
      } else issues.push(`${path}: ${type} takes no action`);
    }
    return node;
  }

  const nodes = cleanChildren(value, undefined, '$', -1);
  return { nodes, issues };
}
