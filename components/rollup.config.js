import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import css from 'rollup-plugin-import-css';
import copy from 'rollup-plugin-copy';
import { rmSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { glob } from 'glob';
import postcssLit from 'rollup-plugin-postcss-lit';
import postcss from 'rollup-plugin-postcss';
import commonjs from '@rollup/plugin-commonjs';

function isD3CircularDependencyWarning(warning) {
  if (warning.code !== 'CIRCULAR_DEPENDENCY') {
    return false;
  }

  const dependencyIds = Array.isArray(warning.ids) ? warning.ids : [];

  return (
    dependencyIds.length > 0 &&
    dependencyIds.every(id => id.includes('/node_modules/d3-'))
  );
}

/**
 * Monaco's language modes keep a fallback `new Worker(new URL('ts.worker.js', import.meta.url))`.
 * wc-code-editor never uses it (it sets `MonacoEnvironment.getWorker`), but an app's bundler
 * follows the URL and fails, since the workers are built into `monaco/`. Point it there.
 */
function monacoWorkerUrls() {
  return {
    name: 'monaco-worker-urls',
    renderChunk(code) {
      const fixed = code.replace(
        /new URL\((['"])((?:editor|ts|json)\.worker\.js)\1, import\.meta\.url\)/g,
        (_, quote, file) => `new URL(${quote}./monaco/${file}${quote}, import.meta.url)`,
      );
      return fixed === code ? null : { code: fixed, map: null };
    },
  };
}

export default async function () {
  rmSync('dist', { recursive: true, force: true });

  const files = await findLitComponents();
  return [
    {
      // shipped-icons is an entry of its own so loader-full.js runs it before loader.js; inlined, it
      // would run after.
      input: ['src/index.ts', 'src/loader.ts', 'src/loader-full.ts', 'src/shipped-icons.ts', ...files], // Your main TypeScript entry file
      output: {
        dir: 'dist',
        format: 'esm', // Output as ES Modules (esm), also supports cjs, umd, etc.
        sourcemap: true,
      },
      onwarn(warning, warn) {
        if (isD3CircularDependencyWarning(warning)) {
          return;
        }

        warn(warning);
      },
      plugins: [
        typescript(), // The plugin loads options from tsconfig.json by default
        nodeResolve(),
        commonjs(),
        postcss({
          inject: false,
          use: {
            sass: {
              // This tells Dart Sass to ignore the legacy API warning
              silenceDeprecations: ['legacy-js-api'],
            },
          },
        }),
        postcssLit({
          include: 'src/**/*.scss',
          silenceDeprecations: ['legacy-js-api'],
        }),
        monacoWorkerUrls(),

        copy({
          targets: [
            {
              src: '../readme.md',
              dest: './',
            },
            {
              src: './assets/*',
              dest: './dist/assets/',
            },
            // Material Symbols for loader-full.js, which loads icons from here instead of the CDN.
            {
              src: [
                './node_modules/@material-symbols/svg-500/outlined/*',
                './node_modules/@material-symbols/svg-500/LICENSE',
              ],
              dest: './dist/icons/material-symbols/',
            },
          ],
        }),
      ],
    },
    {
      // Monaco's language workers for wc-code-editor, served beside it from this origin: modules a
      // page's content security policy allows, unlike workers from a CDN or a blob.
      input: {
        'editor.worker': 'node_modules/monaco-editor/esm/vs/editor/editor.worker.js',
        'ts.worker': 'node_modules/monaco-editor/esm/vs/language/typescript/ts.worker.js',
        'json.worker': 'node_modules/monaco-editor/esm/vs/language/json/json.worker.js',
      },
      output: {
        dir: 'dist/monaco',
        format: 'esm',
        chunkFileNames: 'chunks/[name]-[hash].js',
      },
      plugins: [nodeResolve(), commonjs(), postcss({ inject: false })],
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
  const LIT_SIGNATURES = [/@IndividualComponent/];

  try {
    // glob() returns a Promise that resolves to an array of file paths
    // We ignore node_modules and typical build folders
    const files = await glob(`${searchDir}/**/*.{js,ts,mjs}`, {
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
    });

    const results = [];

    for (const file of files) {
      const content = await readFile(file, 'utf8');

      const codeWithoutComments = content?.replace(
        /\/\*[\s\S]*?\*\/|\/\/.*/g,
        '',
      );

      // Check if any Lit-specific pattern exists in the file
      const isLit = LIT_SIGNATURES.some(pattern =>
        pattern.test(codeWithoutComments),
      );

      if (isLit) {
        results.push(file);
        console.log(`✅ Found: ${file}`);
      }
    }

    console.log(
      `\n✨ Individual Components Search complete. Total components: ${results.length}`,
    );
    return results;
  } catch (error) {
    console.error('❌ Error during scan:', error);
  }
}
