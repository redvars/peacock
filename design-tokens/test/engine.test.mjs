import { test } from 'node:test';
import assert from 'node:assert/strict';
import classicFixture from './fixtures/classic-7c5df0.palettes.json' with { type: 'json' };
import {
  buildThemeCss,
  createThemeTokens,
  defaultThemeConfig,
  googleFontsUrl,
  normalizeThemeConfig,
  paletteVariables,
  scopeThemeCss,
} from '../src/engine/index.mjs';

function declaration(css, name, block = 'root') {
  const start = block === 'dark' ? css.indexOf("[data-theme='dark']") : 0;
  const match = css.slice(start).match(new RegExp(`^\\s*${name}: ([^;]+);`, 'm'));
  return match?.[1];
}

test('classic variant reproduces the palettes Peacock shipped for #7c5df0', () => {
  const { palettes } = createThemeTokens({ primary: '#7c5df0', variant: 'classic' });
  for (const [name, fixture] of Object.entries(classicFixture.color)) {
    if (name.startsWith('$')) continue;
    const generated = Object.fromEntries(palettes[name]);
    for (const [tone, { $value }] of Object.entries(fixture)) {
      if (tone === '@') continue;
      assert.equal(generated[tone], $value, `${name}-${tone}`);
    }
  }
});

test('default theme maps roles to the Peacock tones in light and dark', async () => {
  const css = await buildThemeCss(defaultThemeConfig);
  assert.equal(declaration(css, '--color-primary'), 'var(--color-primary-40)');
  assert.equal(declaration(css, '--color-primary', 'dark'), 'var(--color-primary-80)');
  assert.equal(declaration(css, '--color-surface'), 'var(--color-neutral-99)');
  assert.equal(declaration(css, '--color-surface', 'dark'), 'var(--color-neutral-10)');
  assert.equal(declaration(css, '--color-primary-40'), '#6341d5');
});

test('high contrast moves role tones away from the standard ones', async () => {
  const css = await buildThemeCss({ ...defaultThemeConfig, contrast: 'high' });
  const primary = declaration(css, '--color-primary');
  assert.match(primary, /^var\(--color-primary-\d+\)$/);
  assert.notEqual(primary, 'var(--color-primary-40)');
  // The extra tone a role points at is emitted too.
  const tone = primary.match(/primary-(\d+)/)[1];
  assert.match(declaration(css, `--color-primary-${tone}`), /^#[0-9a-f]{6}$/);
});

test('secondary override replaces the derived palette', () => {
  const derived = createThemeTokens({ primary: '#0b57d0' });
  const custom = createThemeTokens({ primary: '#0b57d0', secondary: '#e8710a' });
  assert.notDeepEqual(custom.palettes.secondary, derived.palettes.secondary);
  assert.deepEqual(custom.palettes.primary, derived.palettes.primary);
});

test('shape presets set the corner radii', async () => {
  const sharp = await buildThemeCss({ ...defaultThemeConfig, shape: 'sharp' });
  assert.equal(declaration(sharp, '--shape-corner-medium'), '0');
  assert.equal(declaration(sharp, '--shape-corner-full'), '0px');
  const rounded = await buildThemeCss({ ...defaultThemeConfig, shape: 'rounded' });
  assert.equal(declaration(rounded, '--shape-corner-large'), '24px');
  assert.equal(declaration(rounded, '--shape-corner-full'), '9999px');
});

test('fonts set the font families and the Google Fonts URL', async () => {
  const config = { ...defaultThemeConfig, font: { brand: 'Poppins', plain: 'system-ui' } };
  const css = await buildThemeCss(config);
  assert.match(declaration(css, '--font-family-brand'), /^"Poppins", sans-serif/);
  assert.match(declaration(css, '--font-family-sans'), /^system-ui, -apple-system/);
  assert.equal(
    googleFontsUrl(config),
    'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
  );
  assert.equal(googleFontsUrl({ font: { brand: 'system-ui', plain: 'system-ui' } }), null);
});

test('normalizeThemeConfig fills defaults and drops invalid values', () => {
  const config = normalizeThemeConfig({
    primary: 'F00',
    secondary: 'not a color',
    variant: 'nope',
    font: { brand: 'Comic Sans' },
  });
  assert.equal(config.primary, '#ff0000');
  assert.equal(config.secondary, undefined);
  assert.equal(config.variant, defaultThemeConfig.variant);
  assert.equal(config.font.brand, defaultThemeConfig.font.brand);
});

test('scope declares the tokens on another selector', async () => {
  const scoped = await buildThemeCss(defaultThemeConfig, { scope: '.preview' });
  assert.match(scoped, /^\.preview \{/m);
  assert.match(scoped, /^\.preview\[data-theme='dark'\] \{/m);
  assert.doesNotMatch(scoped, /^:root \{/m);
  const css = await buildThemeCss(defaultThemeConfig);
  assert.equal(scopeThemeCss(css, '.preview'), scoped);
});

test('paletteVariables lists every palette tone as a CSS variable', () => {
  const variables = paletteVariables(defaultThemeConfig);
  assert.equal(variables['--color-primary-40'], '#6341d5');
  assert.ok(variables['--color-neutral-variant-50']);
});
