# AGENTS.md

## Role & Expertise
You are an expert Frontend Engineer specializing in **Astro**, TypeScript, SCSS, and static site generation for component library documentation.

## Project Context
- **Framework:** Astro (v6+)
- **Language:** TypeScript (strict mode)
- **Styling:** SCSS (sass-embedded)
- **Search:** astro-pagefind builds the index; `src/components/navigation/SiteSearch.astro` searches it through the Pagefind JS API in a `wc-command-palette` (Ctrl/Cmd+K)
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
- `componentGroups.ts` — The component groups shared by the gallery, the Components sidebar, the home page and the previous/next order of component pages. Add every new component to a group here; one left out shows under "Others".
- `componentSource.ts` — Maps each tag to its source folder (from `public/assets/peacock/custom-elements.json`) for the "Source" and "Edit this page" links.
- `foundations.ts` — Build-time data for the Foundations pages: palettes, color roles and shape from the theme engine (`../design-tokens/src/engine`), plus the static token JSON (`../design-tokens/src/tokens`).
- `../siteconfig.ts` — Site metadata: title, version, author, GitHub links.

### Components (`src/components/`)
Reusable Astro components for the documentation UI. Key files:
- `LitComponentApiPanel.astro` — Renders attribute/event/CSS-var API tables from JSDoc data.
- `Article.astro` — The page frame of component and chart pages: header (`eyebrow` and `meta` slots), sections, `footer` slot.
- `ComponentMeta.astro` — The row under a component's title: tag with copy button, "How to use" snippets (HTML, React, Vue, Angular), Source and Edit links.
- `DocPager.astro` — Previous/next cards that end Blocks, Foundations, Frameworks, blog, component and chart pages. Use it instead of writing pager markup.
- `OnThisPageNavigation.astro` — "On This Page" table of contents.
- `SideNavigation.astro` — Left sidebar component navigation.

### Layouts (`src/layouts/`)
- `Base.astro` — Root HTML shell (head, fonts, analytics).
- `Default.astro` — Main layout with sidebar.
- `LitComponent.astro` — Layout for individual component documentation pages.
- `Foundations.astro` — Layout for the Foundations pages: sidebar, header and previous/next links.
- `WithBlocksSidebar.astro` — Block pages: wraps the page's `.block-demo` in a Preview/Code viewer (the markup is captured before the components upgrade), lists the components it uses, and ends with previous/next. A new block is an entry in `src/_data/blocks.ts`, a page in `pages/blocks/<name>/`, its `styles/blocks/<name>.scss`, and a wireframe in `components/BlockPreview.astro`.
- `Frameworks.astro` — The same for the Frameworks pages (`src/_data/frameworks.ts` lists them).

### Pages (`src/pages/`)
- `index.astro` — Homepage. Its counts (components, charts, blocks) and group chips are computed at build time.
- `components.astro` — Component gallery with search.
- `components/[component-name]/index.astro` — Per-component docs page: header (Components › group eyebrow, summary, meta row), the `_sections/` in `order`, the API reference, then previous/next in gallery order.
- `components/[component-name]/_sections/` — Reusable section partials (Usage, Variants, Colors, Events, etc.).
- `foundations/` — Token docs (Color, Shape, Elevation, Motion, Spacing, State layers, Typography). Static, no client JS.
- `theme-builder.astro` — Theme builder; loads the theme engine (`theme.js`) in the browser.
- `blog/` — Blog listing and posts.

## Technical Constraints & Guidelines
1. **Component metadata is auto-generated.** Never manually edit `custom-elements-jsdocs.json`; it is produced by the build in the sibling `components/` package.
2. **CDN URLs** for Peacock assets are constructed in `utils.ts`. Update `VERSION` in `src/siteconfig.ts` to bump CDN references, only once that version is on npm (CDN links to an unpublished version break).
3. **New component pages** follow the pattern in `src/pages/components/[existing-component]/`. Create an `index.astro` and a `_sections/` directory.
4. **SCSS** is organized by scope: `src/styles/layout/` for layout styles, `src/styles/pages/` for page-specific styles.
5. **Static assets** (images, JS) go in `public/`. Peacock component JS files are copied into `public/assets/peacock/` by `npm run publish:docs` in `../components`.
6. **TypeScript:** Strongly type all data helpers and Astro component props. Avoid `any`.

## Never Do
- Do not edit `dist/` — it is build output.
- Do not manually edit `custom-elements-jsdocs.json`.
- Do not add client-side JS dependencies; keep the site as static as possible.
- Do not bypass TypeScript strict mode.
