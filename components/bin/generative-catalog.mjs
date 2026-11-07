// Writes src/generative-view/catalog.generated.ts, the components and props `wc-generative-view`
// may render, from bin/generative-catalog/allow-list.mjs and dist/custom-elements.json.
//
//   node bin/generative-catalog.mjs          write the catalog
//   node bin/generative-catalog.mjs --check  fail when the committed catalog is out of date

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';
import { ALLOW_LIST } from './generative-catalog/allow-list.mjs';
import { buildCatalog, collectTypeAliases, emitCatalog } from './generative-catalog/catalog.mjs';

const packageDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const target = path.join(packageDir, 'src/generative-view/catalog.generated.ts');

/** The catalog module, formatted like the rest of the source. */
export async function generate() {
  const manifest = JSON.parse(
    readFileSync(path.join(packageDir, 'dist/custom-elements.json'), 'utf8'),
  );
  const catalog = buildCatalog(ALLOW_LIST, manifest, collectTypeAliases(path.join(packageDir, 'src')));
  const options = (await prettier.resolveConfig(target)) ?? {};
  return prettier.format(emitCatalog(catalog), { ...options, filepath: target, endOfLine: 'lf' });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const code = await generate();
  if (process.argv.includes('--check')) {
    const current = readFileSync(target, 'utf8').replace(/\r\n/g, '\n');
    if (current !== code) {
      console.error('catalog.generated.ts is out of date: run node bin/generative-catalog.mjs');
      process.exit(1);
    }
    console.log('catalog.generated.ts is up to date');
  } else {
    writeFileSync(target, code);
    console.log(`wrote ${path.relative(packageDir, target)}`);
  }
}
