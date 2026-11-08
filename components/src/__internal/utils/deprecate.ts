const warned = new Set<string>();

/**
 * Logs a deprecation warning once per page for each distinct message.
 *
 * Renamed or removed APIs keep working until the next major version and call this so consumers
 * see what to migrate (ADR-030001). Pass the component tag, the old API and its replacement.
 *
 * @example
 * deprecate('wc-example', '`old-name`', '`new-name`');
 */
export function deprecate(
  tag: string,
  oldApi: string,
  replacement?: string,
  removedIn = '5.0',
): void {
  const message = replacement
    ? `[peacock] ${tag}: ${oldApi} is deprecated and will be removed in ${removedIn}. Use ${replacement} instead.`
    : `[peacock] ${tag}: ${oldApi} is deprecated and will be removed in ${removedIn}.`;
  if (warned.has(message)) return;
  warned.add(message);
  // eslint-disable-next-line no-console
  console.warn(message);
}

/** Clears the record of logged warnings. For tests only. */
export function resetDeprecationWarnings(): void {
  warned.clear();
}
