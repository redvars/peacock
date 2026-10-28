const CORNERS = [
  'extra-small',
  'small',
  'medium',
  'large',
  'large-increased',
  'extra-large',
  'full',
];

/**
 * Corner radius presets in px, in the order of CORNERS. `default` is the M3
 * shape scale. Circles drawn with 50% (radio, spinner) stay round in every
 * preset.
 */
export const SHAPE_PRESETS = [
  { value: 'sharp', label: 'Sharp', corners: [0, 0, 0, 0, 0, 0, 0] },
  { value: 'subtle', label: 'Subtle', corners: [2, 4, 6, 8, 10, 14, 9999] },
  { value: 'default', label: 'Default', corners: [4, 8, 12, 16, 20, 28, 9999] },
  { value: 'rounded', label: 'Rounded', corners: [6, 12, 16, 24, 28, 36, 9999] },
];

/**
 * @param {import('./index.mjs').ThemeConfig} config
 * @returns {object} DTCG `shape-corner` group
 */
export function createShapeTokens(config) {
  const preset =
    SHAPE_PRESETS.find(shape => shape.value === config.shape) ??
    SHAPE_PRESETS.find(shape => shape.value === 'default');

  const group = { $type: 'dimension', none: { $value: '0px' } };
  CORNERS.forEach((corner, i) => {
    group[corner] =
      corner === 'full'
        ? { $type: 'string', $value: `${preset.corners[i]}px` }
        : { $value: `${preset.corners[i]}px` };
  });
  return { 'shape-corner': group };
}
