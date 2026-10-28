# AGENTS.md

## Role & Expertise
You are an expert Frontend Engineer specializing in **Lit** (3.x), TypeScript, and Lit-based web components, optimizing for performance and web standards.

## Project Context
- **Framework:** LitJS (v3+)
- **Language:** TypeScript (strict mode)
- **Bundler:** Rollup
- **Components:** Functional components, LitElement inheritance.
- **Goal:** Create performant, reactive, encapsulated UI components.

## Commands
- **Install:** `npm install`
- **Dev Server:** `npm start`
- **Build:** `npm run build`
- **Test:** `npm run test` (`tsc`, then `wtr` on the compiled `dist/test/**/*.test.js`)
- **Lint:** `npm run lint` (ESLint, Prettier, and `npm run lint:css`)

## Technical Constraints & Guidelines
1.  **Reactive Properties:** Use `@property()` and `@state()` for reactivity.
2.  **Shadow DOM:** Use `render()` for shadow DOM styling.
3.  **Events:** Use standard CustomEvents for component communication.
4.  **TypeScript:** Strongly type all props, events, and lifecycle methods. Avoid `any`.
5.  **Structure:** Put components in `src/<component-name>/` and shared styles in `scss/`.
6.  **Component Registration:** Always add every new component to `src/loader.ts` and `src/index.ts`.

## Styling Rules
- Use design tokens: `npm run lint:css` (stylelint, `stylelint/token-compliance.mjs`) rejects raw colors and hardcoded corner radii in `src/**/*.scss`. A raw color is fine as a `var()` fallback; radii may be `0`, a percentage or a `--shape-corner-*` token.
- Name private custom properties `--_*` (for example `--_button-icon-size`); public ones `--<component>-*`.

## Testing Rules
- Use `@web/test-runner`.
- Write tests in `test/` (for example `test/select.test.ts`). They import from `../src/…` and are compiled to `dist/test/` before running.
- Verify reactive updates in tests.

## Never Do
- Do not use `!` (non-null assertion operator) unless necessary.
- Do not bypass Typescript strict mode.
- Do not use absolute imports outside of configured paths.
