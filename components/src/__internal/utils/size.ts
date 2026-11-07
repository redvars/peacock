/** The size scale components share. Only button-like components add `xs` and `xl`. */
export type Size = 'sm' | 'md' | 'lg';

/** The full scale: button-like components add `xs` and `xl` to `sm|md|lg`. */
export type ScaleSize = 'xs' | Size | 'xl';

/** Maps a size attribute onto the `sm|md|lg` scale; unknown values fall back to `fallback`. */
export function normalizeSize(
  size: string | null | undefined,
  fallback: Size = 'md',
): Size {
  if (size === 'sm' || size === 'md' || size === 'lg') return size;
  return fallback;
}
