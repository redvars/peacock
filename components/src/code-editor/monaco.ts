// Monaco as wc-code-editor uses it, bundled with Peacock so nothing is fetched from a CDN: the
// editor runs under a content security policy that allows scripts and connections from its own
// origin only. Loaded on demand by the component, so pages that never show an editor never load it.
//
// The editor's features (find, folding, suggestions, hovers and the rest), highlighting for the
// languages the component offers, and the language services for TypeScript, JavaScript and JSON,
// which run in workers built beside this file (`monaco/*.worker.js`).

import 'monaco-editor/esm/vs/editor/edcore.main.js';
import 'monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution.js';
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution.js';
import 'monaco-editor/esm/vs/basic-languages/html/html.contribution.js';
import 'monaco-editor/esm/vs/basic-languages/css/css.contribution.js';
import 'monaco-editor/esm/vs/basic-languages/scss/scss.contribution.js';
import 'monaco-editor/esm/vs/basic-languages/markdown/markdown.contribution.js';
import * as contribution from 'monaco-editor/esm/vs/language/typescript/monaco.contribution.js';
import 'monaco-editor/esm/vs/language/json/monaco.contribution.js';
import type { typescript as TypeScriptApi } from 'monaco-editor';

export * from 'monaco-editor/esm/vs/editor/editor.api.js';

/** The TypeScript and JavaScript language service; its own module declares no types, the package's main entry does. */
export const typescript = contribution as unknown as typeof TypeScriptApi;
