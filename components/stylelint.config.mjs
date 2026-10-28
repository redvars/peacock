/** @type {import('stylelint').Config} */
export default {
  customSyntax: 'postcss-scss',
  plugins: ['./stylelint/token-compliance.mjs'],
  rules: {
    'peacock/no-raw-color': true,
    'peacock/no-raw-radius': true,
  },
};
