/** @type {import('stylelint').Config} */
export default {
  customSyntax: 'postcss-scss',
  plugins: ['./stylelint/token-compliance.mjs'],
  // Vendored Monaco styles, not ours to rewrite.
  ignoreFiles: ['src/code-editor/code-editor.scss'],
  rules: {
    'peacock/no-raw-color': true,
    'peacock/no-raw-radius': true,

    // Right-to-left support: lay out with logical properties (`margin-inline-start`,
    // `inset-inline-end`, `border-inline-start`), which mirror with `dir="rtl"`. Disable per line,
    // with a reason, for coordinates that must not mirror (floating-ui, centering, canvases).
    'property-disallowed-list': [
      [
        /^(margin|padding)-(left|right)$/,
        /^border-(left|right)(-.+)?$/,
        /^border-(top|bottom)-(left|right)-radius$/,
        'left',
        'right',
      ],
      {
        message: property =>
          `"${property}" does not mirror in right-to-left layouts. Use the logical property (inline-start / inline-end).`,
      },
    ],
    'declaration-property-value-disallowed-list': [
      {
        float: ['left', 'right'],
        clear: ['left', 'right'],
        'text-align': ['left', 'right'],
      },
      {
        message: property =>
          `"${property}: left/right" does not mirror in right-to-left layouts. Use inline-start / start or inline-end / end.`,
      },
    ],
  },
};
