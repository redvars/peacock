// Build-time data for the Foundations pages. Theme-dependent values (palettes,
// color roles, shape) come from the theme engine run with the default config,
// so they match components/scss/tokens.css. Everything else is read from the
// static token JSON. Nothing in here ships to the browser.
import {
  createThemeTokens,
  defaultThemeConfig,
  type ThemeConfig,
} from '../../../design-tokens/src/engine/index.mjs';
import { ROLES } from '../../../design-tokens/src/engine/roles.mjs';
import { createShapeTokens, SHAPE_PRESETS } from '../../../design-tokens/src/engine/shape.mjs';
// Same import attributes as the engine's static-tokens.mjs, which Vite requires.
import accents from '../../../design-tokens/src/tokens/primitive/colors/accents.json' with { type: 'json' };
import colorStatus from '../../../design-tokens/src/tokens/semantics/colors/color.status.json' with { type: 'json' };
import motion from '../../../design-tokens/src/tokens/primitive/animation/motion.json' with { type: 'json' };
import elevation from '../../../design-tokens/src/tokens/primitive/elevation/elevation.json' with { type: 'json' };
import state from '../../../design-tokens/src/tokens/primitive/state/state.json' with { type: 'json' };
import spacing from '../../../design-tokens/src/tokens/primitive/spacing/spacing.json' with { type: 'json' };
import container from '../../../design-tokens/src/tokens/primitive/spacing/container.json' with { type: 'json' };

export interface FoundationPage {
  label: string;
  href: string;
  icon: string;
  description: string;
}

export const FOUNDATION_PAGES: FoundationPage[] = [
  {
    label: 'Overview',
    href: '/foundations/',
    icon: 'dashboard',
    description: 'The design tokens behind every Peacock component.',
  },
  {
    label: 'Color',
    href: '/foundations/color/',
    icon: 'palette',
    description: 'Tonal palettes and the color roles that point at them in light and dark.',
  },
  {
    label: 'Shape',
    href: '/foundations/shape/',
    icon: 'rounded_corner',
    description: 'The corner radius scale and the shape presets a theme can pick.',
  },
  {
    label: 'Elevation',
    href: '/foundations/elevation/',
    icon: 'layers',
    description: 'Six shadow levels that separate surfaces from each other.',
  },
  {
    label: 'Motion',
    href: '/foundations/motion/',
    icon: 'animation',
    description: 'Durations and easing curves for transitions.',
  },
  {
    label: 'Spacing',
    href: '/foundations/spacing/',
    icon: 'space_bar',
    description: 'The spacing scale and the container widths that match the breakpoints.',
  },
  {
    label: 'State layers',
    href: '/foundations/state-layers/',
    icon: 'touch_app',
    description: 'Opacities for hover, focus, pressed, dragged and disabled states.',
  },
  {
    label: 'Typography',
    href: '/foundations/typography/',
    icon: 'font_download',
    description: 'The type scale: display, headline, title, body, label and code styles.',
  },
];

/** Token values written as `{color.green.40}` in the DTCG JSON. */
interface DtcgToken {
  $value: unknown;
  $description?: string;
  $extensions?: { mode?: { dark?: string } };
}

const kebab = (name: string) => name.replace(/[A-Z]/g, char => `-${char.toLowerCase()}`);

/**
 * HTML for a token name with a line-break opportunity after each hyphen, so
 * long names wrap at word boundaries on narrow screens. Token names are
 * plain [a-z0-9-], so they need no escaping.
 */
export function breakableName(name: string) {
  return name.replace(/(?<=[a-z0-9])-/g, '-<wbr>');
}

// ── Color ─────────────────────────────────────────────────────────────────

export type Tone = [tone: number, hex: string];

export interface Palette {
  name: string;
  label: string;
  /** CSS variable prefix, e.g. `--color-neutral-variant`. */
  variable: string;
  tones: Tone[];
}

// theme.config.json types its enums as plain strings.
const theme = createThemeTokens(defaultThemeConfig as ThemeConfig);

export const THEME_CONFIG = theme.config;

const THEME_PALETTE_LABELS: Record<string, string> = {
  primary: 'Primary',
  secondary: 'Secondary',
  tertiary: 'Tertiary',
  neutral: 'Neutral',
  neutralVariant: 'Neutral variant',
};

export const THEME_PALETTES: Palette[] = Object.entries(THEME_PALETTE_LABELS).map(([name, label]) => ({
  name,
  label,
  variable: `--color-${kebab(name)}`,
  tones: theme.palettes[name as keyof typeof theme.palettes],
}));

const accentColors = accents.color as unknown as Record<string, Record<string, DtcgToken> | string>;

export const ACCENT_PALETTES: Palette[] = Object.entries(accentColors)
  .filter(([, group]) => typeof group === 'object' && '0' in group)
  .map(([name, group]) => ({
    name,
    label: name.charAt(0).toUpperCase() + name.slice(1),
    variable: `--color-${name}`,
    tones: Object.entries(group as Record<string, DtcgToken>)
      .filter(([tone]) => /^\d+$/.test(tone))
      .map(([tone, token]): Tone => [Number(tone), String(token.$value)])
      .sort((a, b) => a[0] - b[0]),
  }));

const palettesByName = new Map([...THEME_PALETTES, ...ACCENT_PALETTES].map(palette => [palette.name, palette]));

/** Black or white text, whichever reads better on a tone (tones are L*). */
export function textOnTone(tone: number) {
  return tone >= 50 ? '#000000' : '#ffffff';
}

export interface RoleValue {
  palette: string;
  tone: number;
  hex: string;
}

export interface Role {
  /** CSS variable, e.g. `--color-on-primary-container`. */
  variable: string;
  light: RoleValue;
  dark: RoleValue;
}

export interface RoleGroup {
  label: string;
  description: string;
  roles: Role[];
}

function roleValue(palette: string, tone: number): RoleValue {
  const hex = palettesByName.get(palette)?.tones.find(([t]) => t === tone)?.[1];
  if (!hex) throw new Error(`No tone ${palette}-${tone} for the color roles table.`);
  return { palette: palettesByName.get(palette)?.variable.replace('--color-', '') ?? palette, tone, hex };
}

/** `{color.green.40}` → ['green', 40] */
function parseReference(reference: string): [string, number] {
  const [, palette, tone] = reference.match(/^\{color\.([a-z-]+)\.(\d+)\}$/) ?? [];
  if (!palette) throw new Error(`Unexpected color reference ${reference}.`);
  return [palette, Number(tone)];
}

function aliasRole(variable: string, token: DtcgToken): Role {
  const dark = token.$extensions?.mode?.dark ?? String(token.$value);
  return {
    variable,
    light: roleValue(...parseReference(String(token.$value))),
    dark: roleValue(...parseReference(dark)),
  };
}

const themeRoles: Role[] = ROLES.map(([role, palette, light, dark]) => ({
  variable: `--color-${kebab(role)}`,
  light: roleValue(palette, light),
  dark: roleValue(palette, dark),
}));

const pickRoles = (test: (variable: string) => boolean) => themeRoles.filter(role => test(role.variable));
const OUTLINE_ROLES = ['--color-outline', '--color-outline-variant', '--color-shadow', '--color-scrim'];

const statusRoles = Object.entries(colorStatus.color as unknown as Record<string, DtcgToken | string>)
  .filter((entry): entry is [string, DtcgToken] => typeof entry[1] === 'object')
  .map(([role, token]) => aliasRole(`--color-${kebab(role)}`, token));

const ACCENT_ROLE_NAMES = ['%', 'on-%', '%-container', 'on-%-container', 'inverse-%'];

const accentRoles = ACCENT_PALETTES.flatMap(({ name }) =>
  ACCENT_ROLE_NAMES.map(pattern => {
    const role = pattern.replace('%', name);
    const token =
      role === name
        ? (accentColors[name] as Record<string, DtcgToken>)['@']
        : (accentColors[role] as unknown as DtcgToken);
    return aliasRole(`--color-${role}`, token);
  }),
);

export const ROLE_GROUPS: RoleGroup[] = [
  {
    label: 'Primary',
    description: 'Key components across the UI: filled buttons, active states, the FAB.',
    roles: pickRoles(v => /-primary(-|$)/.test(v) || v === '--color-surface-tint'),
  },
  {
    label: 'Secondary',
    description: 'Less prominent components such as filter chips and tonal buttons.',
    roles: pickRoles(v => /-secondary(-|$)/.test(v)),
  },
  {
    label: 'Tertiary',
    description: 'Contrasting accents that balance primary and secondary.',
    roles: pickRoles(v => /-tertiary(-|$)/.test(v)),
  },
  {
    label: 'Surface',
    description: 'Backgrounds and the content on them. Container roles step from lowest to highest emphasis.',
    roles: pickRoles(
      v => (v.includes('surface') || v.includes('background')) && v !== '--color-surface-tint',
    ),
  },
  {
    label: 'Outline and other',
    description: 'Borders, dividers, shadows and the scrim behind modals.',
    roles: pickRoles(v => OUTLINE_ROLES.includes(v)),
  },
  {
    label: 'Status',
    description: 'Error, success and warning messages. These come from the fixed accent palettes, not the theme.',
    roles: statusRoles,
  },
  {
    label: 'Accents',
    description: 'Fixed red, blue, green, purple, yellow and orange roles for tags, charts and badges.',
    roles: accentRoles,
  },
];

// ── Shape ─────────────────────────────────────────────────────────────────

export interface ShapeCorner {
  variable: string;
  /** px values, one per preset in SHAPE_COLUMNS order. */
  values: string[];
}

export const SHAPE_COLUMNS: { value: string; label: string }[] = SHAPE_PRESETS.map(
  ({ value, label }: { value: string; label: string }) => ({ value, label }),
);

const presetGroups = SHAPE_COLUMNS.map(({ value }) => {
  const tokens = createShapeTokens({ ...THEME_CONFIG, shape: value as ThemeConfig['shape'] });
  return (tokens as Record<string, Record<string, DtcgToken>>)['shape-corner'];
});

export const SHAPE_CORNERS: ShapeCorner[] = Object.keys(presetGroups[0])
  .filter(name => !name.startsWith('$'))
  .map(name => ({
    variable: `--shape-corner-${name}`,
    values: presetGroups.map(group => String(group[name].$value)),
  }));

export const DEFAULT_SHAPE = THEME_CONFIG.shape;

// ── Elevation ─────────────────────────────────────────────────────────────

interface ShadowLayer {
  color: string;
  offsetX: string;
  offsetY: string;
  blur: string;
  spread: string;
}

export interface ElevationLevel {
  level: number;
  variable: string;
  layers: string[];
  use: string;
}

const ELEVATION_USES = [
  'Flat surfaces: filled and outlined cards, the navigation rail.',
  'Elevated cards and buttons, modal bottom sheets.',
  'Menus, rich tooltips and a scrolled app bar.',
  'FABs, dialogs and pickers.',
  'Hovered level 3 elements.',
  'Dragged elements.',
];

export const ELEVATION_LEVELS: ElevationLevel[] = Object.entries(
  elevation.elevation as unknown as Record<string, { $value: ShadowLayer[] } | string>,
)
  .filter((entry): entry is [string, { $value: ShadowLayer[] }] => typeof entry[1] === 'object')
  .map(([name, token]) => {
    const level = Number(name.replace('level', ''));
    return {
      level,
      variable: `--elevation-${name}`,
      layers: token.$value.map(
        ({ color, offsetX, offsetY, blur, spread }) => `${offsetX} ${offsetY} ${blur} ${spread} ${color}`,
      ),
      use: ELEVATION_USES[level] ?? '',
    };
  });

// ── Motion ────────────────────────────────────────────────────────────────

export interface Duration {
  variable: string;
  value: string;
  ms: number;
  description: string;
}

export interface Easing {
  variable: string;
  value: string;
  /** SVG path of the curve in a 100 × 100 box, y pointing up. */
  path: string;
  description: string;
}

const EASING_USES: Record<string, string> = {
  standard: 'Most transitions: elements that start and end on screen.',
  'standard-accelerate': 'Elements leaving the screen for good.',
  'standard-decelerate': 'Elements entering the screen.',
  emphasized: 'Expressive transitions, paired with the long durations.',
  'emphasized-accelerate': 'Expressive exits.',
  'emphasized-decelerate': 'Expressive entrances, such as a dialog opening.',
  linear: 'Color and opacity fades, progress indicators.',
};

const tokenEntries = <T>(group: object) =>
  Object.entries(group).filter((entry): entry is [string, T] => !entry[0].startsWith('$'));

export const DURATIONS: Duration[] = tokenEntries<DtcgToken>(motion.duration).map(([name, token]) => ({
  variable: `--duration-${name}`,
  value: String(token.$value),
  ms: parseFloat(String(token.$value)),
  description: token.$description ?? '',
}));

export const LONGEST_DURATION = Math.max(...DURATIONS.map(duration => duration.ms));

export const EASINGS: Easing[] = tokenEntries<DtcgToken>(motion.easing).map(([name, token]) => {
  const [x1, y1, x2, y2] = token.$value as number[];
  const round = (n: number) => Math.round(n * 100) / 100;
  const point = (x: number, y: number) => `${round(x * 100)} ${round(100 - y * 100)}`;
  return {
    variable: `--easing-${name}`,
    value: `cubic-bezier(${[x1, y1, x2, y2].join(', ')})`,
    path: `M ${point(0, 0)} C ${point(x1, y1)}, ${point(x2, y2)}, ${point(1, 1)}`,
    description: EASING_USES[name] ?? token.$description ?? '',
  };
});

// ── Spacing ───────────────────────────────────────────────────────────────

export interface SizeToken {
  variable: string;
  value: string;
  px: number;
  description: string;
}

const toPx = (value: string) => (value.endsWith('rem') ? parseFloat(value) * 16 : parseFloat(value));

export const SPACING: SizeToken[] = tokenEntries<DtcgToken>(spacing.spacing)
  .filter(([name]) => name !== 'base')
  .map(([name, token]) => ({
    variable: `--spacing-${name}`,
    value: String(token.$value),
    px: toPx(String(token.$value)),
    description: (token.$description ?? '').replace(/^\d+px - /, ''),
  }))
  // JS orders integer-like keys ("100") before the others ("025"), so sort by size.
  .sort((a, b) => a.px - b.px);

export const CONTAINERS: SizeToken[] = tokenEntries<DtcgToken>(container.container).map(([name, token]) => ({
  variable: `--container-${name}`,
  value: String(token.$value),
  px: toPx(String(token.$value)),
  description: token.$description ?? '',
}));

// ── State layers ──────────────────────────────────────────────────────────

export interface StateToken {
  name: string;
  variable: string;
  value: number;
  description: string;
}

export const STATES: StateToken[] = tokenEntries<DtcgToken>(state.state).map(([name, token]) => ({
  name,
  variable: `--state-${name}`,
  value: Number(token.$value),
  description: token.$description ?? '',
}));
