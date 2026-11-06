import { tokenColor } from '../code-highlighter/token-colors.js';

/**
 * The colors the editor theme is built from: Peacock color roles, plus the syntax colors
 * wc-code-highlighter uses, so the two show code alike. Monaco takes hex colors only, so these
 * are resolved on the page and converted.
 */
export const PALETTE_SOURCES = {
  surface: 'var(--color-surface)',
  surfaceContainerHigh: 'var(--color-surface-container-high)',
  surfaceContainerHighest: 'var(--color-surface-container-highest)',
  onSurface: 'var(--color-on-surface)',
  onSurfaceVariant: 'var(--color-on-surface-variant)',
  outline: 'var(--color-outline)',
  outlineVariant: 'var(--color-outline-variant)',
  primary: 'var(--color-primary)',
  secondary: 'var(--color-secondary)',
  tertiary: 'var(--color-tertiary)',
  secondaryContainer: 'var(--color-secondary-container)',
  onSecondaryContainer: 'var(--color-on-secondary-container)',
  error: 'var(--color-error)',
  warning: 'var(--color-warning)',
  info: 'var(--color-blue)',
  foreground: tokenColor('foreground'),
  keyword: tokenColor('token-keyword'),
  string: tokenColor('token-string'),
  func: tokenColor('token-function'),
  constant: tokenColor('token-constant'),
  comment: tokenColor('token-comment'),
  punctuation: tokenColor('token-punctuation'),
  parameter: tokenColor('token-parameter'),
  link: tokenColor('token-link'),
} as const;

export type EditorPalette = Record<keyof typeof PALETTE_SOURCES, string>;

/** Monaco's standalone theme data, as `monaco.editor.defineTheme` takes it. */
export type EditorThemeData = {
  base: 'vs' | 'vs-dark';
  inherit: boolean;
  rules: { token: string; foreground?: string; fontStyle?: string }[];
  colors: Record<string, string>;
};

let context: CanvasRenderingContext2D | null | undefined;

/**
 * Converts any CSS color the browser understands (`rgb()`, `oklch()`, `color()`, …) to
 * `#rrggbb`, or `#rrggbbaa` when it is not opaque, by painting one pixel.
 */
export function cssColorToHex(color: string): string {
  context ??= document
    .createElement('canvas')
    .getContext('2d', { willReadFrequently: true });
  if (!context) return '#000000';
  context.clearRect(0, 0, 1, 1);
  context.fillStyle = '#000000';
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
  const hex = [r, g, b, ...(a < 255 ? [a] : [])]
    .map(value => value.toString(16).padStart(2, '0'))
    .join('');
  return `#${hex}`;
}

/**
 * Resolves the palette where `probe` sits, so it follows the theme around the editor:
 * `data-theme`, the system color scheme, or a custom theme.
 */
export function resolvePalette(probe: HTMLElement): EditorPalette {
  const palette = {} as EditorPalette;
  for (const [key, value] of Object.entries(PALETTE_SOURCES)) {
    // eslint-disable-next-line no-param-reassign
    probe.style.color = value;
    palette[key as keyof EditorPalette] = cssColorToHex(
      getComputedStyle(probe).color,
    );
  }
  // eslint-disable-next-line no-param-reassign
  probe.style.color = '';
  return palette;
}

/** `#rrggbb` with an alpha from 0 to 1. */
function alpha(hex: string, opacity: number): string {
  const value = Math.round(Math.min(1, Math.max(0, opacity)) * 255);
  return `${hex.slice(0, 7)}${value.toString(16).padStart(2, '0')}`;
}

/** Whether a `#rrggbb` color is dark, by relative luminance. */
export function isDark(hex: string): boolean {
  const [r, g, b] = [1, 3, 5].map(index => {
    const channel = parseInt(hex.slice(index, index + 2), 16) / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.18;
}

/** Monaco rules take colors without the `#`. */
const bare = (hex: string) => hex.slice(1, 7);

/**
 * Builds the editor theme from a palette. The editor background is transparent, so the frame
 * around it shows through; widgets such as suggestions and hovers sit on surface containers.
 */
export function buildEditorTheme(p: EditorPalette): EditorThemeData {
  return {
    base: isDark(p.surface) ? 'vs-dark' : 'vs',
    // Not inherited: Monaco's own rules are more specific than these (`string.value.json`,
    // `keyword.flow`, …) and would keep its stock colors.
    inherit: false,
    rules: [
      { token: '', foreground: bare(p.foreground) },
      { token: 'comment', foreground: bare(p.comment), fontStyle: 'italic' },
      { token: 'keyword', foreground: bare(p.keyword) },
      { token: 'string', foreground: bare(p.string) },
      { token: 'string.escape', foreground: bare(p.constant) },
      { token: 'string.key.json', foreground: bare(p.keyword) },
      { token: 'string.link', foreground: bare(p.link) },
      { token: 'number', foreground: bare(p.constant) },
      { token: 'constant', foreground: bare(p.constant) },
      { token: 'regexp', foreground: bare(p.string) },
      { token: 'type', foreground: bare(p.func) },
      { token: 'identifier', foreground: bare(p.foreground) },
      { token: 'variable', foreground: bare(p.parameter) },
      { token: 'predefined', foreground: bare(p.func) },
      { token: 'annotation', foreground: bare(p.func) },
      { token: 'delimiter', foreground: bare(p.punctuation) },
      { token: 'operator', foreground: bare(p.punctuation) },
      { token: 'tag', foreground: bare(p.string) },
      { token: 'metatag', foreground: bare(p.keyword) },
      { token: 'attribute.name', foreground: bare(p.func) },
      { token: 'attribute.value', foreground: bare(p.string) },
      { token: 'tag.css', foreground: bare(p.func) },
      { token: 'attribute.name.css', foreground: bare(p.constant) },
      { token: 'attribute.value.css', foreground: bare(p.foreground) },
      { token: 'attribute.value.number.css', foreground: bare(p.constant) },
      { token: 'attribute.value.unit.css', foreground: bare(p.constant) },
      { token: 'attribute.value.hex.css', foreground: bare(p.constant) },
      { token: 'strong', fontStyle: 'bold' },
      { token: 'emphasis', fontStyle: 'italic' },
      { token: 'keyword.json', foreground: bare(p.constant) },
      { token: 'invalid', foreground: bare(p.error) },
    ],
    colors: {
      foreground: p.onSurface,
      focusBorder: p.primary,
      'editor.background': '#00000000',
      'editor.foreground': p.foreground,
      'editorGutter.background': '#00000000',
      'editorLineNumber.foreground': p.onSurfaceVariant,
      'editorLineNumber.activeForeground': p.onSurface,
      'editor.lineHighlightBackground': alpha(p.onSurface, 0.05),
      'editor.lineHighlightBorder': '#00000000',
      'editorCursor.foreground': p.primary,
      'editor.selectionBackground': alpha(p.primary, 0.24),
      'editor.inactiveSelectionBackground': alpha(p.primary, 0.12),
      'editor.selectionHighlightBackground': alpha(p.primary, 0.12),
      'editor.wordHighlightBackground': alpha(p.primary, 0.1),
      'editor.wordHighlightStrongBackground': alpha(p.primary, 0.16),
      'editor.findMatchBackground': alpha(p.warning, 0.4),
      'editor.findMatchHighlightBackground': alpha(p.warning, 0.2),
      'editorBracketMatch.background': alpha(p.primary, 0.12),
      'editorBracketMatch.border': alpha(p.primary, 0.5),
      'editorIndentGuide.background1': alpha(p.outlineVariant, 0.6),
      'editorIndentGuide.activeBackground1': p.outline,
      'editorWhitespace.foreground': p.outlineVariant,
      'editorError.foreground': p.error,
      'editorWarning.foreground': p.warning,
      'editorInfo.foreground': p.info,
      'editorOverviewRuler.border': '#00000000',
      'editorOverviewRuler.errorForeground': p.error,
      'editorOverviewRuler.warningForeground': p.warning,
      'editorWidget.background': p.surfaceContainerHigh,
      'editorWidget.foreground': p.onSurface,
      'editorWidget.border': p.outlineVariant,
      'editorSuggestWidget.background': p.surfaceContainerHigh,
      'editorSuggestWidget.border': p.outlineVariant,
      'editorSuggestWidget.foreground': p.onSurface,
      'editorSuggestWidget.highlightForeground': p.primary,
      'editorSuggestWidget.selectedBackground': p.secondaryContainer,
      'editorSuggestWidget.selectedForeground': p.onSecondaryContainer,
      'editorHoverWidget.background': p.surfaceContainerHigh,
      'editorHoverWidget.foreground': p.onSurface,
      'editorHoverWidget.border': p.outlineVariant,
      'input.background': p.surfaceContainerHighest,
      'input.foreground': p.onSurface,
      'input.border': p.outlineVariant,
      'inputOption.activeBorder': p.primary,
      'list.hoverBackground': alpha(p.onSurface, 0.08),
      'list.activeSelectionBackground': p.secondaryContainer,
      'list.activeSelectionForeground': p.onSecondaryContainer,
      'list.highlightForeground': p.primary,
      'scrollbar.shadow': '#00000000',
      'scrollbarSlider.background': alpha(p.onSurface, 0.16),
      'scrollbarSlider.hoverBackground': alpha(p.onSurface, 0.28),
      'scrollbarSlider.activeBackground': alpha(p.onSurface, 0.38),
      'minimap.background': '#00000000',
      'widget.shadow': alpha('#000000', 0.2),
      // Bracket pairs cycle through the theme's accent roles.
      'editorBracketHighlight.foreground1': p.primary,
      'editorBracketHighlight.foreground2': p.tertiary,
      'editorBracketHighlight.foreground3': p.secondary,
      'editorBracketHighlight.foreground4': p.primary,
      'editorBracketHighlight.foreground5': p.tertiary,
      'editorBracketHighlight.foreground6': p.secondary,
      'editorBracketHighlight.unexpectedBracket.foreground': p.error,
    },
  };
}
