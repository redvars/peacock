# AGENTS.md

## Role & Expertise
You are an expert Frontend Engineer specializing in **Lit** (3.x), TypeScript, and Lit-based web components, optimizing for performance and web standards.

## Project Context
- **Framework:** LitJS (v3+)
- **Language:** TypeScript (strict mode)
- **Bundler:** Vite
- **Components:** Functional components, LitElement inheritance.
- **Goal:** Create performant, reactive, encapsulated UI components.

## Commands
- **Install:** `npm install`
- **Dev Server:** `npm run dev`
- **Build:** `npm run build`
- **Test:** `npm run test`
- **Lint:** `npm run lint`

## Technical Constraints & Guidelines
1.  **Reactive Properties:** Use `@property()` and `@state()` for reactivity.
2.  **Shadow DOM:** Use `render()` for shadow DOM styling.
3.  **Events:** Use standard CustomEvents for component communication.
4.  **TypeScript:** Strongly type all props, events, and lifecycle methods. Avoid `any`.
5.  **Structure:** Put components in `src/components/`, styles in `src/styles/`.

## Testing Rules
- Use `@web/test-runner`.
- Write tests in `src/test/`.
- Verify reactive updates in tests.

## Never Do
- Do not use `!` (non-null assertion operator) unless necessary.
- Do not bypass Typescript strict mode.
- Do not use absolute imports outside of configured paths.
