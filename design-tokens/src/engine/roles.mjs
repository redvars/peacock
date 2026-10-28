import {
  argbFromHex,
  DynamicScheme,
  MaterialDynamicColors,
} from '@material/material-color-utilities';

// Values of the library's Variant enum, which its package entry doesn't export.
const Variant = { TONAL_SPOT: 2, VIBRANT: 3, EXPRESSIVE: 4, FIDELITY: 5 };

export const CONTRAST_LEVELS = [
  { value: 'standard', label: 'Standard', level: 0 },
  { value: 'medium', label: 'Medium', level: 0.5 },
  { value: 'high', label: 'High', level: 1 },
];

const DYNAMIC_VARIANTS = {
  classic: Variant.TONAL_SPOT,
  tonalSpot: Variant.TONAL_SPOT,
  vibrant: Variant.VIBRANT,
  expressive: Variant.EXPRESSIVE,
  fidelity: Variant.FIDELITY,
};

function keyRoles(palette) {
  const Name = palette.charAt(0).toUpperCase() + palette.slice(1);
  return [
    [palette, palette, 40, 80],
    [`on${Name}`, palette, 100, 20],
    [`${palette}Container`, palette, 90, 30],
    [`on${Name}Container`, palette, 10, 90],
    [`inverse${Name}`, palette, 80, 40],
    [`${palette}Fixed`, palette, 90, 90],
    [`${palette}FixedDim`, palette, 80, 80],
    [`on${Name}Fixed`, palette, 10, 10],
    [`on${Name}FixedVariant`, palette, 30, 30],
  ];
}

/**
 * Peacock's role → tone map: [role, palette, light tone, dark tone]. Roles
 * are emitted as aliases to these palette tones, so `[data-theme='dark']`
 * only swaps aliases.
 */
export const ROLES = [
  ...keyRoles('primary'),
  ...keyRoles('secondary'),
  ...keyRoles('tertiary'),
  ['surfaceTint', 'primary', 40, 80],
  ['background', 'neutral', 99, 10],
  ['onBackground', 'neutral', 10, 90],
  ['surface', 'neutral', 99, 10],
  ['onSurface', 'neutral', 10, 90],
  ['surfaceVariant', 'neutralVariant', 90, 30],
  ['onSurfaceVariant', 'neutralVariant', 30, 80],
  ['inverseSurface', 'neutral', 20, 90],
  ['inverseOnSurface', 'neutral', 95, 20],
  ['surfaceContainerHighest', 'neutral', 90, 22],
  ['surfaceContainerHigh', 'neutral', 92, 17],
  ['surfaceContainer', 'neutral', 94, 12],
  ['surfaceContainerLow', 'neutral', 96, 10],
  ['surfaceContainerLowest', 'neutral', 100, 4],
  ['surfaceDim', 'neutral', 87, 6],
  ['surfaceBright', 'neutral', 98, 24],
  ['outline', 'neutralVariant', 50, 60],
  ['outlineVariant', 'neutralVariant', 80, 30],
  ['shadow', 'neutral', 0, 0],
  ['scrim', 'neutral', 0, 0],
];

function dynamicScheme(palettes, config, isDark, contrastLevel) {
  return new DynamicScheme({
    sourceColorArgb: argbFromHex(config.primary),
    variant: DYNAMIC_VARIANTS[config.variant] ?? Variant.TONAL_SPOT,
    contrastLevel,
    isDark,
    primaryPalette: palettes.primary,
    secondaryPalette: palettes.secondary,
    tertiaryPalette: palettes.tertiary,
    neutralPalette: palettes.neutral,
    neutralVariantPalette: palettes.neutralVariant,
  });
}

/**
 * Returns a function that maps a Peacock tone to its tone at the configured
 * contrast level. Standard contrast keeps Peacock's tones as they are; medium
 * and high shift each role by as much as Material's contrast algorithm shifts
 * the same role.
 */
function contrastShifter(palettes, config) {
  const level =
    CONTRAST_LEVELS.find(contrast => contrast.value === config.contrast)?.level ?? 0;
  if (level === 0) return (role, isDark, tone) => tone;

  const schemes = {
    light: [dynamicScheme(palettes, config, false, 0), dynamicScheme(palettes, config, false, level)],
    dark: [dynamicScheme(palettes, config, true, 0), dynamicScheme(palettes, config, true, level)],
  };
  return (role, isDark, tone) => {
    const dynamicColor = MaterialDynamicColors[role];
    if (!dynamicColor) return tone;
    const [base, contrast] = schemes[isDark ? 'dark' : 'light'];
    const shifted = tone + dynamicColor.getTone(contrast) - dynamicColor.getTone(base);
    return Math.min(100, Math.max(0, Math.round(shifted)));
  };
}

/**
 * Builds the color-role tokens and lists the palette tones they point at.
 *
 * @param {Record<string, import('@material/material-color-utilities').TonalPalette>} palettes
 * @param {import('./index.mjs').ThemeConfig} config
 * @returns {{ roles: Record<string, object>, usedTones: Record<string, Set<number>> }}
 */
export function createRoleTokens(palettes, config) {
  const shift = contrastShifter(palettes, config);
  const usedTones = Object.fromEntries(Object.keys(palettes).map(name => [name, new Set()]));
  const roles = {};

  for (const [role, palette, light, dark] of ROLES) {
    const lightTone = shift(role, false, light);
    const darkTone = shift(role, true, dark);
    usedTones[palette].add(lightTone).add(darkTone);
    roles[role] = {
      $value: `{color.${palette}.${lightTone}}`,
      $extensions: { mode: { dark: `{color.${palette}.${darkTone}}` } },
    };
  }

  return { roles, usedTones };
}
