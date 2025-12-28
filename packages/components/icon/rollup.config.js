import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import { litScss } from 'rollup-plugin-scss-lit';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: ['src/index.ts'], // Your main TypeScript entry file
  output: {
    dir: 'dist',
    format: 'esm', // Output as ES Modules (esm), also supports cjs, umd, etc.
    sourcemap: true,
  },
  plugins: [
    litScss(),
    typescript(), // The plugin loads options from tsconfig.json by default
    commonjs(),
    nodeResolve(),
  ],
};
