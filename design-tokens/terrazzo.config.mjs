import { defineConfig } from '@terrazzo/cli';
import terrazzoCssPlugin from '@terrazzo/plugin-css';
import { customTransformerPlugin } from './terrazzo.operations.plugin.mjs';
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  tokens: [
    ...getFileNames('./src/tokens/primitive/colors'),
    ...getFileNames('./src/tokens/primitive/typography'),
    ...getFileNames('./src/tokens/primitive/spacing'),
    ...getFileNames('./src/tokens/primitive/animation'),
    ...getFileNames('./src/tokens/primitive/shape'),
    ...getFileNames('./src/tokens/semantics/colors'),
    ...getFileNames('./src/tokens/semantics/typography'),
    ...getFileNames('./src/tokens/semantics/components'),
  ],
  plugins: [
    terrazzoCssPlugin({
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

function getFileNames(folderRawPath) {
  // Recreate __dirname for constructing the directory path
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  // Define the relative path to the folder you want to read
  const folderPath = join(__dirname, folderRawPath);
  try {
    // Read the directory synchronously (use async fs.readdir for non-blocking I/O)
    const files = readdirSync(folderPath);
    return files.map(file => {
      return `${folderRawPath}/${file}`;
    });
  } catch (err) {
    console.error('Error reading directory:', err);
  }
}
