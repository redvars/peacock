/** The size scale components share. Only button-like components add `xs` and `xl`. */
export type Size = 'sm' | 'md' | 'lg';

/** Long size names some components accepted before the `sm|md|lg` scale. Deprecated. */
export type LegacySize = 'small' | 'medium' | 'large';

const LEGACY_SIZES: Record<LegacySize, Size> = {
  small: 'sm',
  medium: 'md',
  large: 'lg',
};

/**
 * Maps a size attribute onto the `sm|md|lg` scale, accepting the deprecated long names.
 * Unknown values fall back to `fallback`.
 */
export function normalizeSize(
  size: string | null | undefined,
  fallback: Size = 'md',
): Size {
  if (size === 'sm' || size === 'md' || size === 'lg') return size;
  return LEGACY_SIZES[size as LegacySize] ?? fallback;
}
