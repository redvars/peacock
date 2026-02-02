import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import css from 'rollup-plugin-import-css';
import copy from 'rollup-plugin-copy';
import { readFile } from 'node:fs/promises';
import { glob } from 'glob';
import postcssLit from 'rollup-plugin-postcss-lit';
import postcss from 'rollup-plugin-postcss';
import commonjs from '@rollup/plugin-commonjs';

export default async function () {
  const files = await findLitComponents();
  return [
    {
      input: ['src/index.ts', 'src/peacock-loader.ts', ...files], // Your main TypeScript entry file
      output: {
        dir: 'dist',
        format: 'esm', // Output as ES Modules (esm), also supports cjs, umd, etc.
        sourcemap: true,
      },
      plugins: [
        typescript(), // The plugin loads options from tsconfig.json by default
        nodeResolve(),
        commonjs(),
        postcss(),
        postcssLit({
          include: 'src/**/*.scss',
        }),

        copy({
          targets: [
            {
              src: '../readme.md',
              dest: './',
            },
            {
              src: './node_modules/@redvars/peacock-design-tokens/dist/tokens.css',
              dest: './dist/assets/styles/',
            },
          ],
        }),
      ],
    },
  ];
}

async function findLitComponents(searchDir = 'src') {
  console.log(`🚀 Scanning for Lit components in "${searchDir}"...\n`);
  /**
   * We look for:
   * 1. Lit imports
   * 2. Class extensions
   * 3. Custom element decorators
   */
  const LIT_SIGNATURES = [/extends\s+LitElement/];

  try {
    // glob() returns a Promise that resolves to an array of file paths
    // We ignore node_modules and typical build folders
    const files = await glob(`${searchDir}/**/*.{js,ts,mjs}`, {
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
    });

    const results = [];

    for (const file of files) {
      const content = await readFile(file, 'utf8');

      // Check if any Lit-specific pattern exists in the file
      const isLit = LIT_SIGNATURES.some(pattern => pattern.test(content));

      if (isLit) {
        results.push(file);
        console.log(`✅ Found: ${file}`);
      }
    }

    console.log(
      `\n✨ Search complete. Total Lit components: ${results.length}`,
    );
    return results;
  } catch (error) {
    console.error('❌ Error during scan:', error);
  }
}
