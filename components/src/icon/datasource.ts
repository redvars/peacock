import { createCacheFetch } from '../utils.js';

const PROVIDERS: Record<string, (name: string) => string> = {
  'material-symbols': (name: string) =>
    `https://cdn.jsdelivr.net/npm/@material-symbols/svg-500@0.40.1/outlined/${name}.svg`,
  carbon: (name: string) =>
    `https://cdn.jsdelivr.net/npm/@carbon/icons@11.41.0/svg/32/${name}.svg`,
};

const cacheFetch = await createCacheFetch('svg-cache');

export async function fetchSVG(url: string) {
  if (!url) return '';
  return cacheFetch(url);
}

export async function fetchIcon(
  name: string,
  provider: string = 'material-symbols',
) {
  if (!name) return '';

  if (!PROVIDERS[provider]) {
    throw new Error(`Provider '${provider}' not found`);
  }

  return fetchSVG(PROVIDERS[provider](name));
}
