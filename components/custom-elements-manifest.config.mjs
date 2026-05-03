import { jsDocTagsPlugin } from '@wc-toolkit/jsdoc-tags';
import { getTsProgram, expandTypesPlugin } from 'cem-plugin-expanded-types';

export default {
  /** Globs to analyze */
  globs: ['src/**/*.ts'],

  outdir: 'dist',

  /** Enable special handling for litelement */
  litelement: true,

  packageJson: true,

  overrideModuleCreation: ({ ts, globs }) => {
    const program = getTsProgram(ts, globs, 'tsconfig.json');
    return program
      .getSourceFiles()
      .filter(sf => globs.find(glob => sf.fileName.includes(glob)));
  },

  plugins: [
    jsDocTagsPlugin({
      tags: {
        rawTag: {},
      },
    }),
    expandTypesPlugin(),
  ],
};
