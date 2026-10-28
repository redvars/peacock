// Types for the Peacock theme engine (dist/theme.js, shipped in
// @redvars/peacock as dist/assets/theme.js).

export type ThemeVariant = 'classic' | 'tonalSpot' | 'vibrant' | 'expressive' | 'fidelity';
export type ThemeContrast = 'standard' | 'medium' | 'high';
export type ThemeShape = 'sharp' | 'subtle' | 'default' | 'rounded';

export interface ThemeConfig {
  /** Seed color, hex. */
  primary: string;
  /** Hex; derived from primary when left out. */
  secondary?: string;
  /** Hex; derived from primary when left out. */
  tertiary?: string;
  /** Hex; derived from primary when left out. */
  neutral?: string;
  variant: ThemeVariant;
  contrast: ThemeContrast;
  shape: ThemeShape;
  font: { brand: string; plain: string };
}

export interface ThemeOption<T extends string = string> {
  value: T;
  label: string;
}

/** [tone, hex] pairs per palette, e.g. `palettes.primary`. */
export type ThemePalettes = Record<
  'primary' | 'secondary' | 'tertiary' | 'neutral' | 'neutralVariant',
  [number, string][]
>;

export interface Theme {
  config: ThemeConfig;
  css: string;
  fontsUrl: string | null;
  palettes: ThemePalettes;
}

export interface ThemeCssOptions {
  /** Declare the tokens on this selector instead of `:root`. */
  scope?: string;
}

export const defaultThemeConfig: Readonly<ThemeConfig>;
export const VARIANTS: ThemeOption<ThemeVariant>[];
export const CONTRAST_LEVELS: (ThemeOption<ThemeContrast> & { level: number })[];
export const SHAPE_PRESETS: (ThemeOption<ThemeShape> & { corners: number[] })[];
export const FONT_OPTIONS: (ThemeOption & { google: string | null; fallback: string[] })[];

export function normalizeThemeConfig(config?: Partial<ThemeConfig>): ThemeConfig;
export function createThemeTokens(config: Partial<ThemeConfig>): {
  config: ThemeConfig;
  documents: [string, object][];
  palettes: ThemePalettes;
};
export function createTheme(config: Partial<ThemeConfig>, options?: ThemeCssOptions): Promise<Theme>;
export function buildThemeCss(config: Partial<ThemeConfig>, options?: ThemeCssOptions): Promise<string>;
export function scopeThemeCss(css: string, scope: string): string;
export function paletteVariables(config: Partial<ThemeConfig>): Record<string, string>;
export function googleFontsUrl(config: Partial<ThemeConfig>): string | null;
export function applyTheme(
  config: Partial<ThemeConfig>,
  options?: { root?: Document | ShadowRoot; scope?: string; id?: string },
): Promise<Theme>;
