const warned = new Set<string>();

/**
 * Logs a developer warning the first time it is called with `key`, and stays silent after that.
 *
 * Use it for misuse a consumer should fix (a missing accessible name, say) without flooding the
 * console when a page renders many instances. Deprecations go through `deprecate()` instead.
 *
 * @example
 * warnOnce('wc-icon-button:name', '[peacock] wc-icon-button has no accessible name.');
 */
export function warnOnce(key: string, message: string): void {
  if (warned.has(key)) return;
  warned.add(key);
  // eslint-disable-next-line no-console
  console.warn(message);
}

/** Clears the record of logged warnings. For tests only. */
export function resetWarnOnce(): void {
  warned.clear();
}
