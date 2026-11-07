/**
 * Build marker, not a runtime decorator: it does nothing when the class is defined.
 *
 * `rollup.config.js` scans `src/` for `@IndividualComponent` and gives every marked class its own
 * entry file in `dist/` (for example `dist/button.js`), which the loader imports lazily the first
 * time the tag appears on the page. Mark every public component class with it; leave it off
 * internal building blocks that should only ship inside another component's bundle.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/ban-types
export default function IndividualComponent(constructor: Function) {}
