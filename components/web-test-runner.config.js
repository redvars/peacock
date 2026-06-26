// import { playwrightLauncher } from '@web/test-runner-playwright';

import fs from 'node:fs';
import path from 'node:path';

const filteredLogs = ['Running in dev mode', 'Lit is in dev mode'];

/** Plugin to handle .scss imports in tests by returning empty Lit CSS */
const scssStubPlugin = {
  name: 'scss-stub',
  serve(context) {
    if (context.path.endsWith('.scss')) {
      return {
        body: "import { css } from 'lit'; export default css``;",
        headers: { 'Content-Type': 'application/javascript' },
        type: 'js',
      };
    }
    return undefined;
  },
};

/** Plugin to handle @/ imports in tests by rewriting them to relative paths */
const aliasResolvePlugin = {
  name: 'alias-resolve',
  resolveImport({ source, context }) {
    if (source.startsWith('@/')) {
      const importerDir = path.dirname(context.path);
      const targetPath = '/' + path.join('dist', 'src', source.slice(2)).replace(/\\/g, '/');
      let relativePath = path.relative(importerDir, targetPath).replace(/\\/g, '/');
      if (!relativePath.startsWith('.')) {
        relativePath = './' + relativePath;
      }
      return relativePath;
    }
    return undefined;
  },
};

export default /** @type {import("@web/test-runner").TestRunnerConfig} */ ({
  /** Test files to run */
  files: 'dist/test/**/*.test.js',

  /** Resolve bare module imports */
  nodeResolve: {
    exportConditions: ['browser', 'development'],
  },

  plugins: [scssStubPlugin, aliasResolvePlugin],

  /** Filter out lit dev mode logs */
  filterBrowserLogs(log) {
    for (const arg of log.args) {
      if (typeof arg === 'string' && filteredLogs.some(l => arg.includes(l))) {
        return false;
      }
    }
    return true;
  },

  /** Compile JS for older browsers. Requires @web/dev-server-esbuild plugin */
  // esbuildTarget: 'auto',

  /** Amount of browsers to run concurrently */
  // concurrentBrowsers: 2,

  /** Amount of test files per browser to test concurrently */
  // concurrency: 1,

  /** Browsers to run tests on */
  // browsers: [
  //   playwrightLauncher({ product: 'chromium' }),
  //   playwrightLauncher({ product: 'firefox' }),
  //   playwrightLauncher({ product: 'webkit' }),
  // ],

  // See documentation for all available options
});
