// Dark tokens also apply when the OS asks for dark, unless the page opts out
// with data-theme='light'. That makes "follow the system" work without JS.
const SYSTEM_DARK_QUERY = '@media (prefers-color-scheme: dark)';

/**
 * Selector the dark tokens are declared on inside SYSTEM_DARK_QUERY.
 *
 * @param {string} [scope]
 */
export function systemDarkSelector(scope = ':root') {
  return `${scope}:not([data-theme='light'])`;
}

/**
 * Options for @terrazzo/plugin-css. Run with finishCss() over the output.
 *
 * @param {{ scope?: string }} [options] Selector to declare the tokens on
 *   instead of `:root`, e.g. a preview container.
 */
export function cssOptions({ scope } = {}) {
  const base = scope ?? ':root';
  return {
    filename: 'tokens.css',
    legacyHex: true,
    baseScheme: 'light dark',
    ...(scope ? { baseSelector: base } : {}),
    modeSelectors: [
      {
        mode: 'dark',
        selectors: [
          SYSTEM_DARK_QUERY,
          scope ? `${base}[data-theme='dark']` : "[data-theme='dark']",
        ],
      },
    ],
  };
}

/**
 * plugin-css always nests a bare `:root {` inside a media-query mode
 * selector. Narrows it to systemDarkSelector(scope).
 *
 * @param {string} css plugin-css output
 * @param {{ scope?: string }} [options]
 * @returns {string}
 */
export function finishCss(css, { scope } = {}) {
  return css.replace(
    `${SYSTEM_DARK_QUERY} {\n  :root {`,
    `${SYSTEM_DARK_QUERY} {\n  ${systemDarkSelector(scope)} {`,
  );
}
