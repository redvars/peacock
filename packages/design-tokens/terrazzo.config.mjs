import { defineConfig } from '@terrazzo/cli';
import { kebabCase } from 'scule';
import css from '@terrazzo/plugin-css';
import { alphaTransformerPlugin } from './terrazzo.operations.plugin.mjs';

export default defineConfig({
  tokens: [
    './src/tokens/colors/color.base.json',
    './src/tokens/colors/color.background.json',
    './src/tokens/colors/color.icon.json',
    './src/tokens/colors/color.support.json',
    './src/tokens/colors/color.brand.json',
  ],
  plugins: [
    css({
      filename: 'tokens.css',
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
      /* transform(token) {
        console.log(token);
        // Check if our custom alpha extension exists
        const alpha = token.$extensions?.['ui.terrazzo']?.alpha;

        if (token.$type === 'color' && alpha !== undefined) {
          // Return a CSS color-mix for the best modern browser support
          // This mixes the base token with transparent based on the alpha
          const percentage = alpha * 100;
          return `color-mix(in srgb, var(${token.id}), transparent ${100 - percentage}%)`;
        }

        // If no extension, return undefined to use Terrazzo's default behavior
        return undefined;
      },*/
    }),
    alphaTransformerPlugin(),
  ],
  outDir: './dist/',
  lint: {
    /** @see https://terrazzo.app/docs/cli/lint */
  },
});
