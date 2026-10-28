# @redvars/peacock-design-tokens

The design tokens of the Peacock design system, in [DTCG](https://www.designtokens.org/) format, and the theme
engine that turns them into CSS custom properties.

The engine runs the same in Node and in the browser. Node uses it to build the default theme
(`dist/tokens.css`, which becomes `components/scss/tokens.css`). The browser bundle (`dist/theme.js`) ships in
`@redvars/peacock` as `@redvars/peacock/theme` and powers the docs theme builder. One engine means the CSS the theme
builder gives you is exactly what a build would produce for the same config.

## Layout

```
theme.config.json          The default theme (see below).
src/tokens/**              Static DTCG JSON: accent palettes, status colors, spacing, containers, motion,
                           elevation, state layers, type scale and component tokens. The same for every theme.
src/engine/                The theme engine. Pure ESM with no node:* imports.
  index.mjs                Public API.
  palettes.mjs             Seed colors → tonal palettes (Material color utilities).
  roles.mjs                The color role → palette tone table, light and dark, plus contrast levels.
  shape.mjs                Corner radius presets.
  typography.mjs           Font options and the Google Fonts URL.
  static-tokens.mjs        Imports src/tokens/** as JSON, so the bundle includes them.
  build-css.mjs            Runs Terrazzo (parser + plugin-css) in memory over static + generated tokens.
  css-options.mjs          plugin-css options: selectors for :root, dark mode and scoped output.
  operations-plugin.mjs    Terrazzo plugin for the `alpha` color extension.
  theme.d.ts               Types for dist/theme.js.
bin/build-theme.mjs        Node: theme.config.json → dist/tokens.css.
bin/deployToComponents.js  Copies the build output into ../components.
test/                      node:test suite. The fixture holds the palettes Peacock shipped before the engine.
```

## Theme config

`theme.config.json` holds the default theme. The theme builder and `applyTheme()` take the same shape.

| Key | Values | Default |
|:--|:--|:--|
| `primary` | Hex seed color. | `#7c5df0` |
| `secondary`, `tertiary`, `neutral` | Optional hex colors. Left out, they are derived from `primary`. | derived |
| `variant` | `classic` (the M3 core palette Peacock has always shipped), `tonalSpot`, `vibrant`, `expressive`, `fidelity`. | `classic` |
| `contrast` | `standard`, `medium`, `high`. Higher levels move each role's tone the way Material's contrast algorithm does. | `standard` |
| `shape` | `sharp`, `subtle`, `default` (the M3 scale), `rounded`. Sets `--shape-corner-*`. | `default` |
| `font.brand` | Display, headline and title text. `Noto Sans`, `Roboto`, `Inter`, `Open Sans`, `Lato`, `Poppins`, `Source Sans 3` or `system-ui`. | `Noto Sans` |
| `font.plain` | Body and label text. Same options. | `Noto Sans` |

Missing or invalid values fall back to the defaults (`normalizeThemeConfig()`).

## Scripts

```bash
npm run build         # build-theme (dist/tokens.css), then build:engine
npm run build:engine  # bundle src/engine/index.mjs → dist/theme.js (esbuild, browser ESM)
npm test              # engine tests (node --test)
npm run deploy        # copy the output into ../components
```

`deploy` copies:

| From | To |
|:--|:--|
| `dist/tokens.css` | `components/scss/tokens.css`, compiled into the components' `styles.css` |
| `dist/theme.js` | `components/assets/theme.js`, published as `dist/assets/theme.js` |
| `src/engine/theme.d.ts` | `components/assets/theme.d.ts` |

After changing a token or the config, run `npm run build && npm test && npm run deploy`, then build `components/`.

## Output

```css
/* Banner: the theme config and the Google Fonts <link> to load */

:root {
  --color-primary-40: #6341d5;               /* palette tones */
  --color-primary: var(--color-primary-40);  /* roles alias a tone */
  --shape-corner-medium: 12px;
  --spacing-200: 1rem;
  /* ...every other token */
  color-scheme: light dark;
}

/* Dark roles, used when the system is dark unless the page opts out */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) {
    --color-primary: var(--color-primary-80);
  }
}

/* Dark roles on demand, on <html> or any element */
[data-theme='dark'] {
  --color-primary: var(--color-primary-80);
}
```

Color roles are `var()` aliases to palette tones, so dark mode only swaps aliases. The `scope` option declares
everything on another selector instead of `:root` (`.x`, `.x:not([data-theme='light'])` and
`.x[data-theme='dark']`), which is how the theme builder previews a theme inside one element.

## Engine API

Import from `src/engine/index.mjs`, or from `@redvars/peacock/theme` in the published package.

```js
import { applyTheme, buildThemeCss, defaultThemeConfig } from '@redvars/peacock/theme';

// Write the theme into <style id="peacock-theme"> and load its fonts.
await applyTheme({ primary: '#0b57d0', shape: 'rounded' });

// Or just get the CSS.
const css = await buildThemeCss({ ...defaultThemeConfig, contrast: 'high' });
```

| Export | Returns |
|:--|:--|
| `createTheme(config, { scope? })` | `Promise<{ config, css, fontsUrl, palettes }>` |
| `buildThemeCss(config, { scope? })` | `Promise<string>`, the full token CSS. |
| `applyTheme(config, { root?, scope?, id? })` | Writes the CSS into a `<style>` in `root` (default `document`) and loads the fonts. Returns the theme. |
| `createThemeTokens(config)` | `{ config, documents, palettes }`: the generated DTCG documents without running Terrazzo. |
| `normalizeThemeConfig(config)` | The config with defaults filled in and invalid values dropped. |
| `scopeThemeCss(css, scope)` | Re-declares `:root` CSS on another selector without rebuilding. |
| `paletteVariables(config)` | `{ '--color-primary-40': '#6341d5', ... }` for every palette tone. Cheap; no Terrazzo run. |
| `googleFontsUrl(config)` | The Google Fonts stylesheet URL, or `null` for system fonts. |
| `defaultThemeConfig` | `theme.config.json`, frozen. |
| `VARIANTS`, `CONTRAST_LEVELS`, `SHAPE_PRESETS`, `FONT_OPTIONS` | The option lists, as `{ value, label, ... }`. |

Types are in `src/engine/theme.d.ts`.

## Changing tokens

- **Static tokens:** edit the JSON under `src/tokens/`. A new file must also be added to
  `src/engine/static-tokens.mjs`.
- **Color roles:** the `ROLES` table in `src/engine/roles.mjs` (`[role, palette, light tone, dark tone]`).
  Any tone a role needs is added to its palette automatically.
- **Shape presets:** `SHAPE_PRESETS` in `src/engine/shape.mjs`.
- **Fonts:** `FONT_OPTIONS` in `src/engine/typography.mjs`.

The docs Foundations pages (`docs/src/pages/foundations/`) read these files at build time, so they update with them.
