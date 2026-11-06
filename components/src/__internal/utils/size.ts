import { deprecate } from './deprecate.js';

/** The size scale components share. Only button-like components add `xs` and `xl`. */
export type Size = 'sm' | 'md' | 'lg';

/** Long size names some components accepted before the `sm|md|lg` scale. Deprecated. */
export type LegacySize = 'small' | 'medium' | 'large';

const LEGACY_SIZES: Record<LegacySize, Size> = {
  small: 'sm',
  medium: 'md',
  large: 'lg',
};

/** The full scale: button-like components add `xs` and `xl` to `sm|md|lg`. */
export type ScaleSize = 'xs' | Size | 'xl';

const LEGACY_SCALE_SIZES: Record<string, ScaleSize> = {
  ...LEGACY_SIZES,
  'extra-small': 'xs',
  'extra-large': 'xl',
};

/**
 * The scale size that replaces a deprecated long size name (`small`, `extra-large`, ...), logging
 * a deprecation warning; `undefined` when `size` is not a long name. Components call it from
 * `willUpdate` and assign the result, so their styles only need the short names.
 */
export function migrateLegacySize(
  tag: string,
  size: string | null | undefined,
): ScaleSize | undefined {
  const replacement = size ? LEGACY_SCALE_SIZES[size] : undefined;
  if (replacement) deprecate(tag, `size="${size}"`, `size="${replacement}"`);
  return replacement;
}

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
