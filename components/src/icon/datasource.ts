import { createCacheFetch } from '@/__internal/utils/cache-fetch.js';

/** Where each provider's icons are loaded from by default: `<base><name>.svg`. */
const CDN: Record<string, string> = {
  // Keep the version in step with the @material-symbols/svg-500 dev dependency, which the build
  // copies into dist/icons/ for loader-full.js.
  'material-symbols':
    'https://cdn.jsdelivr.net/npm/@material-symbols/svg-500@0.40.1/outlined/',
  carbon: 'https://cdn.jsdelivr.net/npm/@carbon/icons@11.41.0/svg/32/',
};

const bases: Record<string, string> = { ...CDN };

const cacheFetch = await createCacheFetch('svg-cache');

/**
 * Loads a provider's icons from `base`, a folder holding `<name>.svg`, instead of cdn.jsdelivr.net:
 * for pages that must not leave their own origin, such as an intranet or a page whose content
 * security policy allows only `connect-src 'self'`. A relative `base` resolves against the page.
 * `loader-full.js` does this for Material Symbols with the icons it ships in `icons/`.
 */
export function setIconBase(provider: string, base: string | URL) {
  const href = new URL(base, document.baseURI).href;
  bases[provider] = href.endsWith('/') ? href : `${href}/`;
}

export async function fetchSVG(url: string) {
  if (!url) return '';
  return cacheFetch(url);
}

export async function fetchIcon(
  name: string,
  provider: string = 'material-symbols',
) {
  if (!name) return '';

  if (!bases[provider]) {
    throw new Error(`Provider '${provider}' not found`);
  }

  return fetchSVG(`${bases[provider]}${encodeURIComponent(name)}.svg`);
}
