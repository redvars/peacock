import { customElementJetBrainsPlugin } from 'custom-element-jet-brains-integration';

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
  ],
};
