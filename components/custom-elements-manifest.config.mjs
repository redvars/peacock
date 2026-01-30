import { customElementJetBrainsPlugin } from 'custom-element-jet-brains-integration';
// custom-elements-manifest.config.js
import { jsDocTagsPlugin } from '@wc-toolkit/jsdoc-tags';

export default {
  /** Globs to analyze */
  globs: ['src/**/*.ts'],

  outdir: 'dist',

  /** Enable special handling for litelement */
  litelement: true,

  packageJson: true,

  plugins: [
    customElementJetBrainsPlugin({
      // Optional configuration options
      outdir: 'dist', // Output directory for web-types.json
      fileName: 'web-types.json', // Output file name
      packageJson: true, // Automatically update the "web-types" property in package.json
    }),
    jsDocTagsPlugin({
      tags: {
        label: {
          description: 'Component label',
          type: 'string',
          tagMapping: 'label',
        },
        rawTag: {},
        status: {},
      },
    }),
  ],
};
