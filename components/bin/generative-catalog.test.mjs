// node --test components/bin/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCatalog, mapType, splitTopLevel } from './generative-catalog/catalog.mjs';

const aliases = new Map([
  ['Variant', "'filled' | 'outlined'"],
  ['Step', '(typeof STEPS)[number]'],
  ['(typeof STEPS)[number]', "'100' | '200'"],
  ['Formatter', '(value: number) => string'],
]);

test('splits unions only at the top level', () => {
  assert.deepEqual(splitTopLevel("'a' | Record<string, 'b' | 'c'> | (x | y)", '|'), [
    "'a'",
    "Record<string, 'b' | 'c'>",
    '(x | y)',
  ]);
});

test('maps TypeScript types to JSON kinds', () => {
  assert.deepEqual(mapType('string', aliases), { kind: 'string' });
  assert.deepEqual(mapType('number | undefined', aliases), { kind: 'number' });
  assert.deepEqual(mapType("| 'a'\n    | 'b'", aliases), { kind: 'enum', values: ['a', 'b'] });
  assert.deepEqual(mapType('Variant | undefined', aliases), {
    kind: 'enum',
    values: ['filled', 'outlined'],
  });
  assert.deepEqual(mapType('Step', aliases), { kind: 'enum', values: ['100', '200'] });
  assert.deepEqual(mapType("'_blank' | string", aliases), { kind: 'string' });
  assert.deepEqual(mapType('ChartDatum[]', aliases), { kind: 'array' });
  assert.deepEqual(mapType('Intl.NumberFormatOptions | undefined', aliases), { kind: 'object' });
  assert.throws(() => mapType('Formatter', aliases), /Function type/);
  assert.throws(() => mapType('Unknown', aliases), /Unknown type/);
  assert.throws(() => mapType('string | number', aliases), /Mixed union/);
});

test('refuses props the manifest does not have, or that are read-only', () => {
  const manifest = {
    modules: [
      {
        path: 'src/x/x.ts',
        declarations: [
          {
            tagName: 'wc-x',
            summary: 'X',
            members: [
              { kind: 'field', name: 'label', type: { text: 'string' }, description: 'Label.' },
              { kind: 'field', name: 'size', type: { text: 'number' }, readonly: true },
            ],
          },
        ],
      },
    ],
  };
  const lookup = { exported: new Map(), byFile: new Map() };
  assert.deepEqual(buildCatalog({ x: { tag: 'wc-x', props: ['label'] } }, manifest, lookup), {
    x: {
      tag: 'wc-x',
      description: 'X',
      props: { label: { kind: 'string', description: 'Label.' } },
      slots: [],
      children: false,
    },
  });
  assert.throws(
    () => buildCatalog({ x: { tag: 'wc-x', props: ['nope'] } }, manifest, lookup),
    /has no property "nope"/,
  );
  assert.throws(
    () => buildCatalog({ x: { tag: 'wc-x', props: ['size'] } }, manifest, lookup),
    /read-only/,
  );
  assert.throws(() => buildCatalog({ y: { tag: 'wc-y', props: [] } }, manifest, lookup), /not in the manifest/);
});

const packageDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
test(
  'the committed catalog matches the allow-list and the manifest',
  { skip: !existsSync(path.join(packageDir, 'dist/custom-elements.json')) && 'no dist/ yet' },
  async () => {
    const { generate, target } = await import('./generative-catalog.mjs');
    const current = readFileSync(target, 'utf8').replace(/\r\n/g, '\n');
    assert.equal(current, await generate(), 'run node bin/generative-catalog.mjs');
  },
);
