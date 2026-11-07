import type { TableRow } from './table-types.js';

/**
 * The key of a row as a string. Keys from attributes are always strings, so a numeric `id` is
 * compared as `"1"`, not `1`.
 */
export function getRowKey(row: TableRow, keyField: string): string {
  return String(row?.[keyField]);
}

/** Converts every key to a string; returns the same array when nothing changes. */
export function normalizeKeys(keys: unknown[] | undefined): string[] {
  const list = Array.isArray(keys) ? keys : [];
  return list.every(key => typeof key === 'string')
    ? (list as string[])
    : list.map(key => String(key));
}

/** `keys` with `key` added or removed. */
export function toggleKey(keys: string[], key: string): string[] {
  return keys.includes(key)
    ? keys.filter(selected => selected !== key)
    : [...keys, key];
}

/**
 * The selection after the select-all checkbox: every key in `pageKeys` when some are missing,
 * otherwise none of them. Keys outside `pageKeys` stay as they are.
 */
export function togglePageKeys(keys: string[], pageKeys: string[]): string[] {
  const allSelected =
    pageKeys.length > 0 && pageKeys.every(key => keys.includes(key));
  return allSelected
    ? keys.filter(key => !pageKeys.includes(key))
    : [...new Set([...keys, ...pageKeys])];
}
