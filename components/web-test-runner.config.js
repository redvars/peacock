// import { playwrightLauncher } from '@web/test-runner-playwright';

import path from 'node:path';
import * as sass from 'sass';
import { chromeLauncher } from '@web/test-runner-chrome';

const filteredLogs = ['Running in dev mode', 'Lit is in dev mode'];

// Tests import component modules directly rather than src/index.js: the index pulls in
// html-editor, whose CommonJS dependency (js-beautify) the test server cannot load.

/**
 * Compiles .scss imports into Lit CSS, so tests see the real component styles. The compiled tests
 * import `dist/src/**\/*.scss`, which tsc does not copy, so the source under `src/` is compiled.
 */
const scssPlugin = {
  name: 'scss',
  serve(context) {
    if (!context.path.endsWith('.scss')) return undefined;
    const source = path.resolve(context.path.replace(/^\/(dist\/)?/, ''));
    let cssText = '';
    try {
      cssText = sass.compile(source, {
        style: 'compressed',
        silenceDeprecations: ['import'],
      }).css;
    } catch (error) {
      console.warn(`Could not compile ${source}: ${error.message}`);
    }
    return {
      body: `import { unsafeCSS } from 'lit'; export default unsafeCSS(${JSON.stringify(cssText)});`,
      headers: { 'Content-Type': 'application/javascript' },
      type: 'js',
    };
  },
};

/** Plugin to handle @/ imports in tests by rewriting them to relative paths */
const aliasResolvePlugin = {
  name: 'alias-resolve',
  resolveImport({ source, context }) {
    if (source.startsWith('@/')) {
      const importerDir = path.dirname(context.path);
      const targetPath =
        '/' + path.join('dist', 'src', source.slice(2)).replace(/\\/g, '/');
      let relativePath = path
        .relative(importerDir, targetPath)
        .replace(/\\/g, '/');
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

  plugins: [scssPlugin, aliasResolvePlugin],

  /** Stylesheets are served as JS modules but have no source to map coverage onto. */
  coverageConfig: {
    exclude: ['**/*.scss', '**/node_modules/**'],
  },

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

  /**
   * Amount of test files per browser to test concurrently. The default (half the CPU cores) ran
   * 8 files at once on a 16-core machine; with coverage, timer-based tests then hit mocha's 2s
   * timeout. 4 is both stable and faster.
   */
  concurrency: 4,

  /**
   * Test files run in parallel pages, so all but one are background pages, which Chrome pauses at
   * random: no animation frames and no focus events. open-wc's `fixture()` waits for a frame, so
   * a paused page timed out every test in its file. Focus emulation makes each page behave as the
   * focused, visible one.
   */
  browsers: [
    chromeLauncher({
      async createPage({ context }) {
        const page = await context.newPage();
        const session = await page.createCDPSession();
        await session.send('Emulation.setFocusEmulationEnabled', {
          enabled: true,
        });
        return page;
      },
    }),
  ],

  /** Browsers to run tests on */
  // browsers: [
  //   playwrightLauncher({ product: 'chromium' }),
  //   playwrightLauncher({ product: 'firefox' }),
  //   playwrightLauncher({ product: 'webkit' }),
  // ],

  // See documentation for all available options
});
