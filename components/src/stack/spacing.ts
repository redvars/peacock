/**
 * Step names of the spacing token scale (`--spacing-<step>` in `scss/tokens.css`), which the
 * `gap` attributes of `wc-stack` and `wc-grid` take: `gap="200"` is `var(--spacing-200)`.
 */
export const SPACING_STEPS = [
  '000',
  '025',
  '050',
  '075',
  '100',
  '150',
  '200',
  '250',
  '300',
  '400',
  '500',
  '600',
  '800',
  '1000',
  '1200',
  '2000',
] as const;

/** A step of the spacing token scale, for example `"100"` (0.5rem) or `"200"` (1rem). */
export type SpacingStep = (typeof SPACING_STEPS)[number];
