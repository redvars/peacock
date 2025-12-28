import { createCacheFetch } from './utils.js';

const PROVIDERS: Record<string, (name: string) => string> = {
  'material-symbols': (name: string) =>
    `https://cdn.jsdelivr.net/npm/@material-symbols/svg-500@0.40.1/outlined/${name}.svg`,
  'carbon': (name: string) =>
    `'https://cdn.jsdelivr.net/npm/@carbon/icons@11.41.0/svg/${name}.svg`,
};

export async function fetchIcon(
  name: string,
  provider: string = 'material-symbols',
) {
  if (!name) return '';

  if (!PROVIDERS[provider]) {
    throw new Error(`Provider '${provider}' not found`);
  }

  return await fetchSVG(PROVIDERS[provider](name));
}

export async function fetchSVG(url: string) {
  if (!url) return '';

  const cacheFetch = await createCacheFetch('svg-cache');

  return await cacheFetch(url);
}
