import site from './site.json';

export function getScriptUrl() {
  return `https://cdn.jsdelivr.net/npm/@redvars/peacock@${site.version}/dist/peacock-loader.js`;
}

export function getThemeCssUrl() {
  return `https://cdn.jsdelivr.net/npm/@redvars/peacock@${site.version}/dist/peacock-loader.js`;
}

export function getFallbackScriptUrl() {
  return `https://cdn.jsdelivr.net/npm/@redvars/peacock@${site.fallbackVersion}/dist/peacock-loader.js`;
}

