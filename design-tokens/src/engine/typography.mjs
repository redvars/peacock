/** Font weights the type scale uses: regular, medium, semi-bold, bold. */
const WEIGHTS = '400;500;600;700';

/**
 * Fonts the theme builder offers. `google` is the Google Fonts family name,
 * or null for fonts that need no download.
 */
export const FONT_OPTIONS = [
  { value: 'Noto Sans', label: 'Noto Sans', google: 'Noto Sans', fallback: ['sans-serif'] },
  { value: 'Roboto', label: 'Roboto', google: 'Roboto', fallback: ['sans-serif'] },
  { value: 'Inter', label: 'Inter', google: 'Inter', fallback: ['sans-serif'] },
  { value: 'Open Sans', label: 'Open Sans', google: 'Open Sans', fallback: ['sans-serif'] },
  { value: 'Lato', label: 'Lato', google: 'Lato', fallback: ['sans-serif'] },
  { value: 'Poppins', label: 'Poppins', google: 'Poppins', fallback: ['sans-serif'] },
  { value: 'Source Sans 3', label: 'Source Sans 3', google: 'Source Sans 3', fallback: ['sans-serif'] },
  {
    value: 'system-ui',
    label: 'System UI',
    google: null,
    fallback: ['-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
  },
];

function fontOption(value) {
  return FONT_OPTIONS.find(font => font.value === value) ?? FONT_OPTIONS[0];
}

function fontStack(value) {
  const font = fontOption(value);
  return [font.value, ...font.fallback];
}

/**
 * @param {import('./index.mjs').ThemeConfig} config
 * @returns {object} DTCG font-family tokens
 */
export function createFontTokens(config) {
  return {
    'font-family-brand': {
      $type: 'fontFamily',
      $value: fontStack(config.font?.brand),
      $description: 'The font family used for brand headings and titles.',
    },
    'font-family-sans': {
      $type: 'fontFamily',
      $value: fontStack(config.font?.plain),
      $description: 'The primary font family used for body text and general content.',
    },
  };
}

/**
 * Google Fonts stylesheet URL for the theme's fonts, or null when none of
 * them needs a download.
 *
 * @param {import('./index.mjs').ThemeConfig} config
 * @returns {string | null}
 */
export function googleFontsUrl(config) {
  const families = [
    ...new Set([fontOption(config.font?.brand), fontOption(config.font?.plain)]),
  ]
    .filter(font => font.google)
    .map(font => `family=${font.google.replaceAll(' ', '+')}:wght@${WEIGHTS}`);

  return families.length
    ? `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`
    : null;
}
