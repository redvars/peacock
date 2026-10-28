import { build, defineConfig, Logger, parse } from '@terrazzo/parser';
import cssPlugin from '@terrazzo/plugin-css';
import { customTransformerPlugin } from './operations-plugin.mjs';
import { cssOptions } from './css-options.mjs';
import { STATIC_TOKENS } from './static-tokens.mjs';

// Terrazzo wants file URLs for its error messages; nothing is read from disk.
const ROOT = new URL('file:///peacock/');

/**
 * Runs Terrazzo in memory over the static tokens plus the generated ones and
 * returns the CSS. Works in Node and in the browser.
 *
 * @param {[string, object][]} generated [name, DTCG document] pairs
 * @param {{ scope?: string }} [options]
 * @returns {Promise<string>}
 */
export async function buildCss(generated, options = {}) {
  const logger = new Logger({ level: 'error' });
  const config = defineConfig(
    { plugins: [cssPlugin(cssOptions(options)), customTransformerPlugin()] },
    { logger, cwd: ROOT },
  );

  const inputs = [...STATIC_TOKENS, ...generated].map(([name, document]) => ({
    filename: new URL(`tokens/${name}`, ROOT),
    src: JSON.stringify(document),
  }));

  const { tokens, sources } = await parse(inputs, { config, logger, skipLint: true });
  const { outputFiles } = await build(tokens, { sources, config, logger });
  return outputFiles.find(file => file.filename === 'tokens.css').contents;
}
