// Builds dist/tokens.css from theme.config.json with the same engine the
// docs theme builder runs in the browser.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { buildThemeCss } from '../src/engine/index.mjs';

const projectRoot = new URL('../', import.meta.url);
const configFile = new URL('theme.config.json', projectRoot);
const outFile = new URL('dist/tokens.css', projectRoot);

const config = JSON.parse(await readFile(configFile, 'utf8'));
const css = await buildThemeCss(config);

await mkdir(new URL('dist/', projectRoot), { recursive: true });
await writeFile(outFile, css);
console.log(`Theme tokens written to dist/tokens.css (${css.length} bytes).`);
