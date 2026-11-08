import { VERSION, FALLBACK_VERSION, NPM_PACKAGE } from '../siteconfig';

/**
 * A file of the published package on the jsDelivr CDN, such as `dist/button.js`. Every CDN link
 * on the site goes through here, so they all use VERSION (a version that is on npm).
 */
export function getCdnUrl(path: string, version: string = VERSION) {
  return `https://cdn.jsdelivr.net/npm/${NPM_PACKAGE}@${version}/${path.replace(/^\//, '')}`;
}

export function getScriptUrl() {
  return getCdnUrl('dist/loader.js');
}

export function getThemeCssUrl() {
  return getCdnUrl('dist/assets/styles.css');
}

export function getFallbackScriptUrl() {
  return getCdnUrl('dist/loader.js', FALLBACK_VERSION);
}

/** The theme engine (theme.js) used by the theme builder page. */
export function getThemeEngineUrl(isProd: boolean) {
  return isProd ? getCdnUrl('dist/assets/theme.js') : '/assets/peacock/assets/theme.js';
}

export function convertToSectionId(title: any) {
  if (!title) return '';

  return title
    .toLowerCase()
    .normalize('NFD') // Splits accented characters (e.g., 'é' to 'e' + '´')
    .replace(/[̀-ͯ]/g, '') // Removes the accent marks
    .replace(/[^a-z0-9\s-]/g, '') // Removes anything that isn't a letter, number, or space
    .trim() // Removes spaces from start/end
    .replace(/\s+/g, '-') // Replaces one or more spaces with a single hyphen
    .replace(/-+/g, '-'); // Collapses multiple hyphens into one
}
