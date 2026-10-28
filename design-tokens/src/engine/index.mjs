import { hexFromArgb } from '@material/material-color-utilities';
import themeConfig from '../../theme.config.json' with { type: 'json' };
import { buildCss } from './build-css.mjs';
import {
  createPalettes,
  DEFAULT_TONES,
  isHexColor,
  NEUTRAL_TONES,
  PALETTE_NAMES,
  paletteTones,
  VARIANTS,
} from './palettes.mjs';
import { CONTRAST_LEVELS, createRoleTokens } from './roles.mjs';
import { createShapeTokens, SHAPE_PRESETS } from './shape.mjs';
import { createFontTokens, FONT_OPTIONS, googleFontsUrl } from './typography.mjs';

export { CONTRAST_LEVELS, FONT_OPTIONS, SHAPE_PRESETS, VARIANTS, googleFontsUrl };

/**
 * @typedef {object} ThemeConfig
 * @property {string} primary Seed color, hex.
 * @property {string} [secondary] Hex; derived from primary when left out.
 * @property {string} [tertiary] Hex; derived from primary when left out.
 * @property {string} [neutral] Hex; derived from primary when left out.
 * @property {'classic'|'tonalSpot'|'vibrant'|'expressive'|'fidelity'} variant
 * @property {'standard'|'medium'|'high'} contrast
 * @property {'sharp'|'subtle'|'default'|'rounded'} shape
 * @property {{ brand: string, plain: string }} font
 */

/** The theme Peacock ships with (`theme.config.json`). */
export const defaultThemeConfig = Object.freeze(structuredClone(themeConfig));

function normalizeHex(value) {
  if (!isHexColor(value)) return undefined;
  let hex = value.replace('#', '').toLowerCase();
  if (hex.length === 3) hex = [...hex].map(c => c + c).join('');
  return `#${hex}`;
}

function oneOf(options, value, fallback) {
  return options.some(option => option.value === value) ? value : fallback;
}

/**
 * Fills in defaults and drops invalid values, so partial or hand-edited
 * configs (URL hash, localStorage) always produce a theme.
 *
 * @param {Partial<ThemeConfig>} [config]
 * @returns {ThemeConfig}
 */
export function normalizeThemeConfig(config = {}) {
  const defaults = defaultThemeConfig;
  const normalized = {
    primary: normalizeHex(config.primary) ?? defaults.primary,
    variant: oneOf(VARIANTS, config.variant, defaults.variant),
    contrast: oneOf(CONTRAST_LEVELS, config.contrast, defaults.contrast),
    shape: oneOf(SHAPE_PRESETS, config.shape, defaults.shape),
    font: {
      brand: oneOf(FONT_OPTIONS, config.font?.brand, defaults.font.brand),
      plain: oneOf(FONT_OPTIONS, config.font?.plain, defaults.font.plain),
    },
  };
  for (const key of ['secondary', 'tertiary', 'neutral']) {
    const hex = normalizeHex(config[key]);
    if (hex) normalized[key] = hex;
  }
  return normalized;
}

/**
 * Generates the theme-dependent DTCG documents: palettes, color roles, font
 * families and corner shapes. Everything else comes from the static tokens.
 *
 * @param {Partial<ThemeConfig>} config
 * @returns {{ config: ThemeConfig, documents: [string, object][], palettes: Record<string, [number, string][]> }}
 */
export function createThemeTokens(config) {
  const theme = normalizeThemeConfig(config);
  const palettes = createPalettes(theme);
  const { roles, usedTones } = createRoleTokens(palettes, theme);

  const color = { $type: 'color' };
  const swatches = {};
  for (const name of PALETTE_NAMES) {
    const baseTones = name.startsWith('neutral') ? NEUTRAL_TONES : DEFAULT_TONES;
    swatches[name] = paletteTones(palettes[name], baseTones, usedTones[name]);
    color[name] = Object.fromEntries(
      swatches[name].map(([tone, hex]) => [tone, { $value: hex }]),
    );
  }
  color.neutral['@'] = { $value: hexFromArgb(palettes.neutral.tone(50)) };
  color.neutralVariant['@'] = { $value: hexFromArgb(palettes.neutralVariant.tone(50)) };
  for (const [role, token] of Object.entries(roles)) {
    if (color[role]) color[role]['@'] = token;
    else color[role] = token;
  }

  return {
    config: theme,
    palettes: swatches,
    documents: [
      ['generated/color.theme.json', { color }],
      ['generated/font-family.json', createFontTokens(theme)],
      ['generated/shape.json', createShapeTokens(theme)],
    ],
  };
}

function banner(config) {
  const seeds = ['primary', 'secondary', 'tertiary', 'neutral']
    .filter(key => config[key])
    .map(key => `${key} ${config[key]}`)
    .join(', ');
  const fontsUrl = googleFontsUrl(config);
  const lines = [
    `Peacock theme: ${seeds}`,
    `variant ${config.variant}, contrast ${config.contrast}, shape ${config.shape}`,
    `fonts: brand "${config.font.brand}", plain "${config.font.plain}"`,
  ];
  if (fontsUrl) lines.push(`Load the fonts with: <link rel="stylesheet" href="${fontsUrl}">`);
  return `/*\n${lines.map(line => ` * ${line}`).join('\n')}\n */\n`;
}

/**
 * CSS custom properties for every palette tone, e.g. `--color-primary-40`.
 * Cheap to compute (no Terrazzo run), so the theme builder can set them on a
 * container that already holds the scoped theme CSS while a color is being
 * dragged: role aliases on that container then resolve to the new tones.
 *
 * @param {Partial<ThemeConfig>} config
 * @returns {Record<string, string>}
 */
export function paletteVariables(config) {
  const { palettes } = createThemeTokens(config);
  const variables = {};
  for (const [name, tones] of Object.entries(palettes)) {
    const prefix = `--color-${name.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)}`;
    for (const [tone, hex] of tones) variables[`${prefix}-${tone}`] = hex;
  }
  return variables;
}

/**
 * Re-declares theme CSS built for `:root` on another selector, without
 * running Terrazzo again.
 *
 * @param {string} css Output of buildThemeCss() or createTheme().
 * @param {string} scope
 * @returns {string}
 */
export function scopeThemeCss(css, scope) {
  return css
    .replace(/^:root \{/m, `${scope} {`)
    .replace(/^\[data-theme='dark'\] \{/m, `${scope}[data-theme='dark'] {`);
}

/**
 * Builds the full token CSS for a theme config.
 *
 * @param {Partial<ThemeConfig>} config
 * @param {{ scope?: string }} [options] `scope` declares the tokens on that
 *   selector instead of `:root`, e.g. for a preview container.
 * @returns {Promise<string>}
 */
export async function buildThemeCss(config, options = {}) {
  return (await createTheme(config, options)).css;
}

/**
 * @param {Partial<ThemeConfig>} config
 * @param {{ scope?: string }} [options]
 * @returns {Promise<{ config: ThemeConfig, css: string, fontsUrl: string | null, palettes: Record<string, [number, string][]> }>}
 */
export async function createTheme(config, options = {}) {
  const { config: theme, documents, palettes } = createThemeTokens(config);
  const css = banner(theme) + (await buildCss(documents, options));
  return { config: theme, css, fontsUrl: googleFontsUrl(theme), palettes };
}

/**
 * Applies a theme at runtime: writes the token CSS into one `<style>` element
 * (created on first use, then updated) and loads the theme's Google Fonts.
 *
 * @param {Partial<ThemeConfig>} config
 * @param {{ root?: Document | ShadowRoot, scope?: string, id?: string }} [options]
 */
export async function applyTheme(config, { root = document, scope, id = 'peacock-theme' } = {}) {
  const theme = await createTheme(config, { scope });
  const container = root instanceof Document ? root.head : root;

  let style = container.querySelector(`style#${id}`);
  if (!style) {
    style = document.createElement('style');
    style.id = id;
    container.append(style);
  }
  style.textContent = theme.css;

  let fonts = container.querySelector(`link#${id}-fonts`);
  if (theme.fontsUrl) {
    if (!fonts) {
      fonts = document.createElement('link');
      fonts.id = `${id}-fonts`;
      fonts.rel = 'stylesheet';
      container.append(fonts);
    }
    fonts.href = theme.fontsUrl;
  } else {
    fonts?.remove();
  }
  return theme;
}
