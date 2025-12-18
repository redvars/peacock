import { defineConfig } from '@terrazzo/cli';
import css from '@terrazzo/plugin-css';
import { customTransformerPlugin } from './terrazzo.operations.plugin.mjs';
import getFileNames from './get-file-names.mjs';

export default defineConfig({
  tokens: [
    ...getFileNames('./src/tokens/primitive/colors'),
    ...getFileNames('./src/tokens/primitive/typography'),
    ...getFileNames('./src/tokens/primitive/spacing'),
    ...getFileNames('./src/tokens/semantics/colors'),
    ...getFileNames('./src/tokens/semantics/typography'),
  ],
  plugins: [
    css({
      filename: 'tokens.css',
      legacyHex: true,
      baseScheme: 'light dark', // Default is 'light', this enables both.

      // OPTION B: Define how 'dark' mode tokens are applied via CSS selectors.
      // This is the core of dark mode implementation.
      modeSelectors: [
        {
          mode: 'dark', // The token mode defined in your semantic JSON files ($modes: { "dark": ... })
          // The CSS selector(s) that will apply the dark mode values.
          selectors: [
            "[data-theme='dark']", // Selector for a manual toggle
          ],
        },
        // You could add other modes here, like high-contrast:
        // {
        //   mode: "high-contrast",
        //   selectors: ["@media (forced-colors: active)"],
        // },
      ],
    }),
    customTransformerPlugin(),
  ],
  outDir: './dist/',
  lint: {
    /** @see https://terrazzo.app/docs/cli/lint */
  },
});
