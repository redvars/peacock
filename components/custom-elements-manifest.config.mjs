import { lazyLoaderPlugin } from '@wc-toolkit/lazy-loader';

const formatComponentName = str => {
  return (
    str
      // 1. Remove the word "Component" if it exists at the end
      .replace(/Component$/, '')
      // 2. Find uppercase letters and replace with "-lowercase"
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      // 3. Convert the whole string to lowercase
      .toLowerCase()
  );
};

export default {
  /** Globs to analyze */
  globs: ['src/**/*.ts'],

  outdir: 'dist',

  /** Enable special handling for litelement */
  litelement: true,

  /*plugins: [
    lazyLoaderPlugin({
      importPathTemplate: (name, tagName) => {
        console.log(`./src/${formatComponentName(name)}/${tagName}.js`);
        return `./src/${formatComponentName(name)}/${tagName}.js`;
      },
      outdir: 'dist',
      eagerLoad: ['p-icon'],
    }),
  ],*/
};
