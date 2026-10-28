import {
  argbFromHex,
  CorePalette,
  Hct,
  hexFromArgb,
  SchemeExpressive,
  SchemeFidelity,
  SchemeTonalSpot,
  SchemeVibrant,
  themeFromSourceColor,
  TonalPalette,
} from '@material/material-color-utilities';

/** Tones every key palette (primary, secondary, tertiary) always emits. */
export const DEFAULT_TONES = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 98, 100];

/** Tones the neutral palettes always emit; surfaces need the finer steps. */
export const NEUTRAL_TONES = [
  0, 4, 6, 10, 12, 17, 20, 22, 30, 40, 50, 60, 70, 80, 87, 90, 92, 94, 95, 96,
  98, 99, 100,
];

export const PALETTE_NAMES = [
  'primary',
  'secondary',
  'tertiary',
  'neutral',
  'neutralVariant',
];

/**
 * Scheme variants. `classic` is the M3 core palette Peacock has always
 * shipped; the others are Material dynamic-color schemes.
 */
export const VARIANTS = [
  { value: 'classic', label: 'Classic' },
  { value: 'tonalSpot', label: 'Tonal spot' },
  { value: 'vibrant', label: 'Vibrant' },
  { value: 'expressive', label: 'Expressive' },
  { value: 'fidelity', label: 'Fidelity' },
];

const SCHEMES = {
  tonalSpot: SchemeTonalSpot,
  vibrant: SchemeVibrant,
  expressive: SchemeExpressive,
  fidelity: SchemeFidelity,
};

export function isHexColor(value) {
  return typeof value === 'string' && /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i.test(value);
}

function seedPalette(hex) {
  return TonalPalette.fromInt(argbFromHex(hex));
}

function neutralPalettes(hex) {
  const hct = Hct.fromInt(argbFromHex(hex));
  return {
    neutral: TonalPalette.fromHueAndChroma(hct.hue, hct.chroma),
    neutralVariant: TonalPalette.fromHueAndChroma(hct.hue, hct.chroma + 4),
  };
}

function classicPalettes(primaryHex) {
  // Same two steps the original ColorUtils.generateTheme() used, so the
  // default theme keeps its exact hex values.
  const theme = themeFromSourceColor(argbFromHex(primaryHex));
  const core = CorePalette.of(theme.palettes.primary.keyColor.argb);
  return {
    primary: core.a1,
    secondary: core.a2,
    tertiary: core.a3,
    neutral: core.n1,
    neutralVariant: core.n2,
  };
}

function schemePalettes(variant, primaryHex) {
  const Scheme = SCHEMES[variant];
  const scheme = new Scheme(Hct.fromInt(argbFromHex(primaryHex)), false, 0);
  return {
    primary: scheme.primaryPalette,
    secondary: scheme.secondaryPalette,
    tertiary: scheme.tertiaryPalette,
    neutral: scheme.neutralPalette,
    neutralVariant: scheme.neutralVariantPalette,
  };
}

/**
 * Builds the five key tonal palettes for a theme config. Secondary, tertiary
 * and neutral are derived from primary unless the config overrides them.
 *
 * @param {import('./index.mjs').ThemeConfig} config
 * @returns {Record<string, TonalPalette>}
 */
export function createPalettes(config) {
  const palettes =
    config.variant in SCHEMES
      ? schemePalettes(config.variant, config.primary)
      : classicPalettes(config.primary);

  if (isHexColor(config.secondary)) palettes.secondary = seedPalette(config.secondary);
  if (isHexColor(config.tertiary)) palettes.tertiary = seedPalette(config.tertiary);
  if (isHexColor(config.neutral)) Object.assign(palettes, neutralPalettes(config.neutral));

  return palettes;
}

/**
 * Hex value of every tone a palette emits: its base tones plus any extra tone
 * a role needs (contrast levels and some roles land between the base steps).
 *
 * @param {TonalPalette} palette
 * @param {number[]} baseTones
 * @param {Iterable<number>} extraTones
 * @returns {[number, string][]}
 */
export function paletteTones(palette, baseTones, extraTones = []) {
  const tones = [...new Set([...baseTones, ...extraTones])].sort((a, b) => a - b);
  return tones.map(tone => [tone, hexFromArgb(palette.tone(tone))]);
}
