// Rewrites the `@/…` path alias in the emitted declarations (dist/src/**/*.d.ts) to relative
// paths. TypeScript keeps aliases as written, and consumers cannot resolve them, so every type
// built on an aliased import (the mixins behind most components) would otherwise become `any`.

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glob } from 'glob';

const packageDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const typesRoot = path.join(packageDir, 'dist/src');

const files = await glob('**/*.d.ts', { cwd: typesRoot, absolute: true });
let changed = 0;
for (const file of files) {
  const code = readFileSync(file, 'utf8');
  const fixed = code.replace(/(['"])@\/([^'"]+)\1/g, (_, quote, target) => {
    let relative = path
      .relative(path.dirname(file), path.join(typesRoot, target))
      .replace(/\\/g, '/');
    if (!relative.startsWith('.')) relative = `./${relative}`;
    return `${quote}${relative}${quote}`;
  });
  if (fixed !== code) {
    writeFileSync(file, fixed);
    changed += 1;
  }
}
console.log(`fix-dts-aliases: rewrote @/ imports in ${changed} of ${files.length} declaration files`);
