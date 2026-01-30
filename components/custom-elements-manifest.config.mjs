import { jsDocTagsPlugin } from '@wc-toolkit/jsdoc-tags';

export default {
  /** Globs to analyze */
  globs: ['src/**/*.ts'],

  outdir: 'dist',

  /** Enable special handling for litelement */
  litelement: true,

  packageJson: true,

  plugins: [
    jsDocTagsPlugin({
      tags: {
        rawTag: {},
      },
    }),
  ],
};
