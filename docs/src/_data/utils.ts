import { VERSION, FALLBACK_VERSION } from '../siteconfig';

export function getScriptUrl() {
  return `https://cdn.jsdelivr.net/npm/@redvars/peacock@${VERSION}/dist/loader.js`;
}

export function getThemeCssUrl() {
  return `https://cdn.jsdelivr.net/npm/@redvars/peacock@${VERSION}/dist/assets/styles.css`;
}

export function getFallbackScriptUrl() {
  return `https://cdn.jsdelivr.net/npm/@redvars/peacock@${FALLBACK_VERSION}/dist/loader.js`;
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
