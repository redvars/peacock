/**
 * Options for @terrazzo/plugin-css.
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
        selectors: [scope ? `${base}[data-theme='dark']` : "[data-theme='dark']"],
      },
    ],
  };
}
