/**
 * Whether Peacock is showing its dark theme, the same way the tokens decide it: `data-theme="dark"`
 * or `"light"` on the root element wins; without it, the system `prefers-color-scheme` applies.
 */
export function isDarkMode(): boolean {
  const { theme } = document.documentElement.dataset;
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}
