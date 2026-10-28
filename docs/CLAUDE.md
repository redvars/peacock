# AGENTS.md

## Role & Expertise
You are an expert Frontend Engineer specializing in **Astro**, TypeScript, SCSS, and static site generation for component library documentation.

## Project Context
- **Framework:** Astro (v6+)
- **Language:** TypeScript (strict mode)
- **Styling:** SCSS (sass-embedded)
- **Search:** astro-pagefind
- **Goal:** Maintain and extend the documentation site for the Peacock web component library.

## Commands
- **Install:** `npm install`. The Foundations pages import the theme engine from `../design-tokens`, so run `npm install` there too.
- **Dev Server:** `npm run start` (port 4000)
- **Build:** `npm run build`
- **Preview:** `npm run preview`
- **Copy component files:** build `../components` (`npm run build`), then run `npm run publish:docs` there. It copies `dist/` into `public/assets/peacock/` and `custom-elements-jsdocs.json` into `src/_data/`.

## Architecture

### Data Layer (`src/_data/`)
- `custom-elements-jsdocs.json` — Auto-generated JSDoc metadata for all 100+ Peacock components (attributes, events, CSS custom properties). Do not edit manually.
- `getLitComponentDetails.ts` — Parses the JSDoc JSON to extract component metadata for pages.
- `utils.ts` — CDN URL helpers (jsdelivr), section ID normalization, theme CSS URL generation.
- `foundations.ts` — Build-time data for the Foundations pages: palettes, color roles and shape from the theme engine (`../design-tokens/src/engine`), plus the static token JSON (`../design-tokens/src/tokens`).
- `../siteconfig.ts` — Site metadata: title, version, author, GitHub links.

### Components (`src/components/`)
Reusable Astro components for the documentation UI. Key files:
- `LitComponentApiPanel.astro` — Renders attribute/event/CSS-var API tables from JSDoc data.
- `OverviewPanel.astro` — Overview section on component pages.
- `OnThisPageNavigation.astro` — "On This Page" table of contents.
- `SideNavigation.astro` — Left sidebar component navigation.

### Layouts (`src/layouts/`)
- `Base.astro` — Root HTML shell (head, fonts, analytics).
- `Default.astro` — Main layout with sidebar.
- `LitComponent.astro` — Layout for individual component documentation pages.
- `Foundations.astro` — Layout for the Foundations pages: sidebar, header and previous/next links.

### Pages (`src/pages/`)
- `index.astro` — Homepage.
- `components.astro` — Component gallery with search.
- `components/[component-name]/index.astro` — Per-component docs page (Overview + API tabs).
- `components/[component-name]/_sections/` — Reusable section partials (Usage, Variants, Colors, Events, etc.).
- `foundations/` — Token docs (Color, Shape, Elevation, Motion, Spacing, State layers). Static, no client JS. Typography lives at `components/text`.
- `theme-builder.astro` — Theme builder; loads the theme engine (`theme.js`) in the browser.
- `blog/` — Blog listing and posts.

## Technical Constraints & Guidelines
1. **Component metadata is auto-generated.** Never manually edit `custom-elements-jsdocs.json`; it is produced by the build in the sibling `components/` package.
2. **CDN URLs** for Peacock assets are constructed in `utils.ts`. Update `VERSION` in `src/siteconfig.ts` to bump CDN references.
3. **New component pages** follow the pattern in `src/pages/components/[existing-component]/`. Create an `index.astro` and a `_sections/` directory.
4. **SCSS** is organized by scope: `src/styles/layout/` for layout styles, `src/styles/pages/` for page-specific styles.
5. **Static assets** (images, JS) go in `public/`. Peacock component JS files are copied into `public/assets/peacock/` by `npm run publish:docs` in `../components`.
6. **TypeScript:** Strongly type all data helpers and Astro component props. Avoid `any`.

## Never Do
- Do not edit `dist/` — it is build output.
- Do not manually edit `custom-elements-jsdocs.json`.
- Do not add client-side JS dependencies; keep the site as static as possible.
- Do not bypass TypeScript strict mode.
