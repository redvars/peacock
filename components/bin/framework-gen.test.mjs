// node --test components/bin/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildModel, kebabToCamel, tagToName } from './framework-gen/model.mjs';
import { emitDefineLayer } from './framework-gen/shared.mjs';
import { emitReact, reactEventProp } from './framework-gen/react.mjs';
import { emitVue } from './framework-gen/vue.mjs';
import { emitAngular } from './framework-gen/angular.mjs';

const field = (name, extra = {}) => ({ kind: 'field', name, ...extra });

const manifest = {
  modules: [
    {
      path: 'E:/repo/components/src/badge/badge.ts',
      exports: [{ kind: 'js', name: 'Badge', declaration: { name: 'Badge' } }],
      declarations: [
        {
          name: 'Badge',
          tagName: 'wc-badge',
          customElement: true,
          members: [
            field('count'),
            field('_internal'),
            field('__private'),
            field('secret', { privacy: 'private' }),
            field('styles', { static: true }),
            field('form', { readonly: true }),
            { kind: 'method', name: 'focus' },
          ],
        },
      ],
    },
    {
      path: 'src/input/input.ts',
      exports: [{ kind: 'js', name: 'Input', declaration: { name: 'Input' } }],
      declarations: [
        {
          name: 'Input',
          tagName: 'wc-input',
          customElement: true,
          members: [field('value'), field('label')],
          events: [
            { name: 'input', type: { text: 'CustomEvent<{value: string}>' } },
            { name: 'change', type: { text: 'CustomEvent<{value: string}>' } },
          ],
        },
      ],
    },
    {
      path: 'src/switch/switch.ts',
      exports: [{ kind: 'js', name: 'Switch', declaration: { name: 'Switch' } }],
      declarations: [
        {
          name: 'Switch',
          tagName: 'wc-switch',
          customElement: true,
          members: [field('checked'), field('value')],
          events: [{ name: 'change', type: { text: 'CustomEvent' } }],
        },
      ],
    },
    {
      path: 'src/menu/menu.ts',
      exports: [{ kind: 'js', name: 'default', declaration: { name: 'Menu' } }],
      declarations: [
        {
          name: 'Menu',
          tagName: 'wc-menu',
          customElement: true,
          members: [field('open'), field('value')],
          events: [
            { name: 'menu-item-activate', type: { text: 'CustomEvent<{item: MenuItem}>' } },
            { name: 'open', type: { text: 'CustomEvent<{reason: \'api\'}>' } },
            { name: 'close', type: { text: 'CustomEvent<{cause: Unknowable}>' } },
            { name: 'click', type: { text: 'MouseEvent' } },
            // A toggle-style detail without a value: not a value binding.
            { name: 'change', type: { text: 'CustomEvent<{ selected: boolean }>' } },
          ],
        },
      ],
    },
  ],
};

const model = buildModel(manifest, {
  resolveType: name => (name === 'MenuItem' ? '@redvars/peacock' : undefined),
});
const byTag = tag => model.elements.find(e => e.tagName === tag);

test('names', () => {
  assert.equal(tagToName('wc-menu-item'), 'MenuItem');
  assert.equal(kebabToCamel('menu-item-activate'), 'menuItemActivate');
  assert.equal(reactEventProp('menu-item-activate'), 'onMenuItemActivate');
});

test('model keeps public, writable fields only', () => {
  assert.deepEqual(
    byTag('wc-badge').props.map(p => p.name),
    ['count'],
  );
  assert.equal(byTag('wc-badge').entry, 'badge.js');
  assert.equal(byTag('wc-badge').typesPath, 'dist/src/badge/badge.js');
});

test('binding kind', () => {
  assert.deepEqual(byTag('wc-input').binding, { kind: 'value', prop: 'value', event: 'input' });
  assert.deepEqual(byTag('wc-switch').binding, { kind: 'checked', prop: 'checked', event: 'change' });
  assert.equal(byTag('wc-badge').binding, undefined);
  assert.equal(byTag('wc-menu').binding, undefined);
});

test('event detail types: imported when resolvable, unknown otherwise', () => {
  const events = Object.fromEntries(byTag('wc-menu').events.map(e => [e.name, e]));
  assert.equal(events['menu-item-activate'].type, 'CustomEvent<{item: MenuItem}>');
  assert.deepEqual(events['menu-item-activate'].imports, [
    { name: 'MenuItem', from: '@redvars/peacock' },
  ]);
  assert.equal(events.open.type, "CustomEvent<{reason: 'api'}>");
  assert.equal(events.close.type, 'CustomEvent<unknown>');
  assert.equal(events.click.native, true);
});

test('define layer handles default exports', () => {
  const files = emitDefineLayer(model, '@redvars/peacock');
  assert.match(files['define/wc-menu.ts'], /import ElementClass from '@redvars\/peacock\/menu\.js';/);
  assert.match(files['define/wc-menu.ts'], /import type ElementType from '@redvars\/peacock\/dist\/src\/menu\/menu\.js';/);
  assert.match(files['entries.d.ts'], /declare module '@redvars\/peacock\/menu\.js' \{\n {2}export \{ default \}/);
  assert.match(files['define/wc-input.ts'], /defineElement\('wc-input', ElementClass\);/);
});

test('react maps custom events and leaves native ones to React', () => {
  const menu = emitReact(model)['components/wc-menu.ts'];
  assert.match(menu, /^'use client';/);
  assert.match(menu, /onMenuItemActivate: 'menu-item-activate' as EventName<CustomEvent<\{item: T_MenuItem\}>>/);
  assert.match(menu, /import type \{ MenuItem as T_MenuItem \} from '@redvars\/peacock';/);
  assert.doesNotMatch(menu, /onClick:/);
});

test('vue v-model on the binding event', () => {
  const sw = emitVue(model)['components/wc-switch.ts'];
  assert.match(sw, /modelValue: \{/);
  assert.match(sw, /emit\('update:modelValue', \(event.currentTarget as El\)\.checked\)/);
  assert.doesNotMatch(emitVue(model)['components/wc-badge.ts'], /modelValue/);
});

test('angular outputs keep DOM event names and avoid input clashes', () => {
  const files = emitAngular(model);
  const menu = files['components/wc-menu.ts'];
  assert.match(menu, /@Output\('menu-item-activate'\) readonly menuItemActivate/);
  // `open` is an input, so the event of the same name gets its own member, aliased to `open`.
  assert.match(menu, /@Output\('open'\) readonly openEvent/);
  assert.match(files['value-accessors.ts'], /selector: 'wc-input\[ngModel\],wc-input\[formControlName\],wc-input\[formControl\]'/);
  assert.match(files['value-accessors.ts'], /selector: 'wc-switch\[ngModel\]/);
});
