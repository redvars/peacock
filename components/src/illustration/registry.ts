import type { SVGTemplateResult } from 'lit';

/** The names of the illustrations Peacock ships. */
export const illustrationNames = [
  'empty',
  'no-results',
  'empty-inbox',
  'no-notifications',
  'no-messages',
  'no-files',
  'upload',
  'not-found',
  'server-error',
  'error',
  'no-access',
  'offline',
  'maintenance',
  'success',
  'welcome',
  'empty-cart',
  'no-team',
  'coming-soon',
] as const;

/** The name of an illustration Peacock ships. */
export type IllustrationName = (typeof illustrationNames)[number];

/**
 * The art of an illustration: SVG elements, without the outer `<svg>`, drawn in a 240 × 180
 * viewBox. A loader function is called the first time the name is shown.
 */
export type IllustrationArt =
  | SVGTemplateResult
  | (() => Promise<SVGTemplateResult>);

type ArtModule = { default: SVGTemplateResult };

/** One dynamic import per illustration, so the bundler emits one small chunk each. */
const builtIn: Record<IllustrationName, () => Promise<ArtModule>> = {
  empty: () => import('./art/empty.js'),
  'no-results': () => import('./art/no-results.js'),
  'empty-inbox': () => import('./art/empty-inbox.js'),
  'no-notifications': () => import('./art/no-notifications.js'),
  'no-messages': () => import('./art/no-messages.js'),
  'no-files': () => import('./art/no-files.js'),
  upload: () => import('./art/upload.js'),
  'not-found': () => import('./art/not-found.js'),
  'server-error': () => import('./art/server-error.js'),
  error: () => import('./art/error.js'),
  'no-access': () => import('./art/no-access.js'),
  offline: () => import('./art/offline.js'),
  maintenance: () => import('./art/maintenance.js'),
  success: () => import('./art/success.js'),
  welcome: () => import('./art/welcome.js'),
  'empty-cart': () => import('./art/empty-cart.js'),
  'no-team': () => import('./art/no-team.js'),
  'coming-soon': () => import('./art/coming-soon.js'),
};

const registered = new Map<string, IllustrationArt>();
const resolved = new Map<string, SVGTemplateResult>();
const pending = new Map<string, Promise<SVGTemplateResult>>();
const listeners = new Set<(name: string) => void>();

function isBuiltIn(name: string): name is IllustrationName {
  return Object.prototype.hasOwnProperty.call(builtIn, name);
}

/**
 * Adds an illustration under `name`, or replaces a shipped one, for every `wc-illustration` on
 * the page. `art` is drawn in the same 240 × 180 viewBox as the shipped set and can use its
 * color classes (see the docs) or `var()` colors of its own.
 *
 * @example
 * registerIllustration('no-invoices', svg`<circle class="backdrop" cx="120" cy="90" r="72" />`);
 */
export function registerIllustration(name: string, art: IllustrationArt): void {
  registered.set(name, art);
  resolved.delete(name);
  pending.delete(name);
  if (typeof art !== 'function') resolved.set(name, art);
  listeners.forEach(listener => listener(name));
}

/** True when `name` is shipped or registered. */
export function hasIllustration(name: string): boolean {
  return registered.has(name) || isBuiltIn(name);
}

/** The art for `name` when it is already loaded, so it can render without waiting. */
export function getLoadedIllustration(
  name: string,
): SVGTemplateResult | undefined {
  return resolved.get(name);
}

/** Loads the art for `name` once, sharing the request between elements. */
export function loadIllustration(name: string): Promise<SVGTemplateResult> {
  const loaded = resolved.get(name);
  if (loaded) return Promise.resolve(loaded);
  let request = pending.get(name);
  if (!request) {
    const custom = registered.get(name);
    let load: Promise<SVGTemplateResult>;
    if (typeof custom === 'function') load = custom();
    else if (isBuiltIn(name)) load = builtIn[name]().then(m => m.default);
    else load = Promise.reject(new Error(`Unknown illustration "${name}"`));
    request = load.then(
      art => {
        if (pending.get(name) === request) {
          pending.delete(name);
          resolved.set(name, art);
        }
        return art;
      },
      error => {
        if (pending.get(name) === request) pending.delete(name);
        throw error;
      },
    );
    pending.set(name, request);
  }
  return request;
}

/** Calls `listener` with the name whenever an illustration is registered. Returns the unsubscribe. */
export function onIllustrationRegistered(
  listener: (name: string) => void,
): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
