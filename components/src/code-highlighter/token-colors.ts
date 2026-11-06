/**
 * Syntax colors shared by wc-code-highlighter and wc-code-editor. Each is a CSS variable,
 * `--code-highlighter-<name>`, that falls back to a Peacock color role, so light, dark and
 * custom themes all follow the tokens, and one override restyles both components.
 */
export const TOKEN_DEFAULTS: Record<string, string> = {
  foreground: 'var(--color-on-surface)',
  background: 'transparent',
  'token-constant': 'var(--color-orange)',
  'token-string': 'var(--color-green)',
  'token-comment': 'var(--color-on-surface-variant)',
  'token-keyword': 'var(--color-purple)',
  'token-parameter': 'var(--color-on-surface)',
  'token-function': 'var(--color-blue)',
  'token-string-expression': 'var(--color-green)',
  'token-punctuation': 'var(--color-on-surface-variant)',
  'token-link': 'var(--color-primary)',
  'token-inserted': 'var(--color-green)',
  'token-deleted': 'var(--color-red)',
  'token-changed': 'var(--color-orange)',
  'ansi-black': 'var(--color-on-surface)',
  'ansi-red': 'var(--color-red)',
  'ansi-green': 'var(--color-green)',
  'ansi-yellow': 'var(--color-yellow)',
  'ansi-blue': 'var(--color-blue)',
  'ansi-magenta': 'var(--color-purple)',
  'ansi-cyan': 'var(--color-tertiary)',
  'ansi-white': 'var(--color-on-surface-variant)',
  'ansi-bright-black': 'var(--color-on-surface-variant)',
  'ansi-bright-red': 'var(--color-red)',
  'ansi-bright-green': 'var(--color-green)',
  'ansi-bright-yellow': 'var(--color-yellow)',
  'ansi-bright-blue': 'var(--color-blue)',
  'ansi-bright-magenta': 'var(--color-purple)',
  'ansi-bright-cyan': 'var(--color-tertiary)',
  'ansi-bright-white': 'var(--color-on-surface)',
};

/** The CSS value for a syntax color: its public variable, falling back to the color role. */
export function tokenColor(name: string): string {
  return `var(--code-highlighter-${name}, ${TOKEN_DEFAULTS[name]})`;
}
