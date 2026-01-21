import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';

export default [
  {
    input: ['src/index.ts', 'src/peacock-loader.ts'], // Your main TypeScript entry file
    output: {
      dir: 'dist',
      format: 'esm', // Output as ES Modules (esm), also supports cjs, umd, etc.
      sourcemap: true,
    },
    plugins: [
      typescript(), // The plugin loads options from tsconfig.json by default
      nodeResolve(),
      copy({
        targets: [
          {
            src: '../design-tokens/dist/**',
            dest: 'dist/assets/styles/',
          },
        ],
      }),
    ],
  },
  {
    input: ['src/icon/icon.ts', 'src/avatar/avatar.ts'], // Your main TypeScript entry file
    output: {
      dir: `dist`,
      format: 'esm', // Output as ES Modules (esm), also supports cjs, umd, etc.
      sourcemap: true,
      entryFileNames: 'component/[name].js',
    },
    plugins: [
      typescript(), // The plugin loads options from tsconfig.json by default
      nodeResolve(),
    ],
  },
];
