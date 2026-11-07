// Generates the React, Vue and Angular bindings in ../frameworks/<framework>/src/generated from
// dist/custom-elements.json. Run after `npm run analyze`, as `npm run build:frameworks`.
//
//   node bin/framework-gen.mjs [--only react,vue,angular]

import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildModel, createTypeResolver } from './framework-gen/model.mjs';
import { emitDefineLayer } from './framework-gen/shared.mjs';
import { emitReact } from './framework-gen/react.mjs';
import { emitVue } from './framework-gen/vue.mjs';
import { emitAngular } from './framework-gen/angular.mjs';

const packageDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const frameworksDir = path.resolve(packageDir, '../frameworks');
const packageName = JSON.parse(readFileSync(path.join(packageDir, 'package.json'), 'utf8')).name;

const EMITTERS = { react: emitReact, vue: emitVue, angular: emitAngular };

const onlyIndex = process.argv.indexOf('--only');
const selected =
  onlyIndex === -1 ? Object.keys(EMITTERS) : process.argv[onlyIndex + 1].split(',');

const manifest = JSON.parse(
  readFileSync(path.join(packageDir, 'dist/custom-elements.json'), 'utf8'),
);
const model = buildModel(manifest, {
  srcDir: path.join(packageDir, 'src'),
  resolveType: createTypeResolver(packageDir, packageName),
});

const defineLayer = emitDefineLayer(model, packageName);

for (const framework of selected) {
  const emit = EMITTERS[framework];
  if (!emit) throw new Error(`Unknown framework "${framework}"`);
  const outDir = path.join(frameworksDir, framework, 'src/generated');
  rmSync(outDir, { recursive: true, force: true });
  const files = { ...defineLayer, ...emit(model, packageName) };
  for (const [file, content] of Object.entries(files)) {
    const target = path.join(outDir, file);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
  console.log(`${framework}: ${model.elements.length} components -> ${path.relative(packageDir, outDir)}`);
}
