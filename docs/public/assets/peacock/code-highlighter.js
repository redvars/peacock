import { i, _ as __decorate, I as IndividualComponent, a as i$1, b, A } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { r } from './state-DkTK9EGF.js';
import { e } from './query-CHb9Ft_d.js';
import { e as e$1 } from './class-map-DG7CA1et.js';
import { o } from './style-map-BQD5Et1D.js';
import { c as copyToClipboard, T as TOKEN_DEFAULTS } from './token-colors-0TFHWbcq.js';
import './base-Cl6v8-BZ.js';
import './directive-ZPhl09Yt.js';

const locale = {
    copyToClipboard: 'Copy to clipboard',
    copied: 'Copied',
    copiedCode: 'Copied code to clipboard',
    wrapLines: 'Wrap lines',
    unwrapLines: 'Turn off line wrap',
    showMore: 'Show more',
    showLess: 'Show less',
};

/**
 * Parses a line range list such as `"1, 3-5"` into 1-based line numbers.
 * Blank or malformed parts are skipped; a reversed range such as `"5-3"` is read as `3-5`.
 */
function parseLineRanges(value) {
    const lines = new Set();
    if (!value)
        return lines;
    for (const part of value.split(',')) {
        const match = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
        if (match) {
            const start = Number(match[1]);
            const end = match[2] === undefined ? start : Number(match[2]);
            const from = Math.max(1, Math.min(start, end));
            const to = Math.max(start, end);
            for (let line = from; line <= to; line += 1)
                lines.add(line);
        }
    }
    return lines;
}
/**
 * Maps 1-based line numbers to their variant. Where ranges overlap,
 * `removed` wins over `added`, and `added` wins over `highlighted`.
 */
function buildLineVariants(ranges) {
    const variants = new Map();
    const order = ['highlighted', 'added', 'removed'];
    for (const variant of order) {
        for (const line of parseLineRanges(ranges[variant])) {
            variants.set(line, variant);
        }
    }
    return variants;
}
/**
 * Removes leading and trailing blank lines and the indentation common to
 * every non-blank line, so indented markup reads as written.
 */
function dedent(source) {
    const lines = source.replace(/\r\n?/g, '\n').split('\n');
    while (lines.length && lines[0].trim() === '')
        lines.shift();
    while (lines.length && lines[lines.length - 1].trim() === '')
        lines.pop();
    let indent = Infinity;
    for (const line of lines) {
        if (line.trim() !== '') {
            const leading = line.match(/^[ \t]*/)?.[0].length ?? 0;
            indent = Math.min(indent, leading);
        }
    }
    if (!Number.isFinite(indent) || indent === 0)
        return lines.join('\n');
    return lines.map(line => line.slice(indent)).join('\n');
}
/** Decodes the entities `innerHTML` produces for text, ending with `&amp;`. */
function decodeEntities(source) {
    return source
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&');
}
/** Splits code into display lines, ignoring one trailing newline. */
function splitLines(code) {
    const normalized = code.replace(/\r\n?/g, '\n');
    const trimmed = normalized.endsWith('\n')
        ? normalized.slice(0, -1)
        : normalized;
    return trimmed.split('\n');
}

var css_248z = i`@charset "UTF-8";
* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.screen-reader-only {
  display: none !important;
}

[hidden] {
  display: none !important;
}

.code-block {
  --_pad-block: var(--spacing-200);
  --_pad-inline: var(--spacing-200);
  --_pad-near: var(--spacing-100);
  --_background: var(
    --code-highlighter-background,
    var(--color-surface-container-low)
  );
  --_border-color: var(--code-highlighter-border-color, var(--color-outline-variant));
  --_foreground: var(--code-highlighter-foreground, var(--color-on-surface));
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  overflow: hidden;
  background: var(--_background);
  color: var(--_foreground);
  border: 1px solid var(--_border-color);
  border-radius: var(--code-highlighter-shape, var(--shape-corner-medium));
}

.header {
  display: flex;
  align-items: center;
  gap: var(--spacing-100);
  min-width: 0;
  padding: var(--_pad-block) var(--_pad-inline) 0;
  color: var(--color-on-surface-variant);
}

::slotted([slot=icon]) {
  --icon-size: 1.125rem;
  flex: none;
  color: var(--color-on-surface-variant);
}

.title {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-on-surface);
  font-family: var(--typography-title-small-font-family) !important;
  font-size: var(--typography-title-small-font-size) !important;
  font-weight: var(--typography-title-small-font-weight) !important;
  line-height: var(--typography-title-small-line-height) !important;
  letter-spacing: var(--typography-title-small-letter-spacing) !important;
}

.actions {
  display: flex;
  flex: none;
  align-items: center;
  gap: var(--spacing-025);
  margin-inline-start: auto;
}

.header .actions {
  margin-block: calc(-1 * var(--spacing-100));
  margin-inline-end: calc(-1 * var(--spacing-100));
}

.actions.floating {
  position: absolute;
  z-index: 1;
  inset-block-start: var(--spacing-100);
  inset-inline-end: var(--spacing-100);
  padding: var(--spacing-025);
  background: var(--color-surface);
  border: 1px solid var(--color-outline-variant);
  border-radius: var(--shape-corner-full);
  opacity: 0;
  transition: opacity var(--duration-short4) var(--easing-standard);
}

.code-block:hover .actions.floating,
.code-block:focus-within .actions.floating {
  opacity: 1;
}

@media (pointer: coarse) {
  .actions.floating {
    opacity: 1;
  }
}
@media (prefers-reduced-motion: reduce) {
  .actions.floating {
    transition: none;
  }
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

:host([size=sm]) .code-block {
  --_pad-block: var(--spacing-150);
  --_pad-inline: var(--spacing-150);
  --_pad-near: var(--spacing-075);
  border-radius: var(--code-highlighter-shape, var(--shape-corner-small));
}
:host([size=sm]) .title {
  font-family: var(--typography-label-medium-font-family) !important;
  font-size: var(--typography-label-medium-font-size) !important;
  font-weight: var(--typography-label-medium-font-weight) !important;
  line-height: var(--typography-label-medium-line-height) !important;
  letter-spacing: var(--typography-label-medium-letter-spacing) !important;
}

:host {
  display: block;
  min-width: 0;
}

:host([hidden]) {
  display: none;
}

.code-block:has(.content:focus-visible) {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

.content {
  flex: 1 1 auto;
  min-height: 0;
  max-height: var(--code-highlighter-max-height, none);
  margin: 0;
  padding-block: var(--_pad-block);
  padding-inline: 0;
  overflow: auto;
  outline: none;
  white-space: pre;
  text-align: start;
  scrollbar-width: thin;
  scrollbar-color: var(--color-outline-variant) transparent;
  font-family: var(--typography-code-medium-font-family) !important;
  font-size: var(--typography-code-medium-font-size) !important;
  font-weight: var(--typography-code-medium-font-weight) !important;
  line-height: var(--typography-code-medium-line-height) !important;
  letter-spacing: var(--typography-code-medium-letter-spacing) !important;
}

.has-header .content {
  padding-block-start: var(--_pad-near);
}

.has-footer .content {
  padding-block-end: var(--_pad-near);
}

.code {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-content: start;
  min-width: max-content;
  min-height: 1lh;
  font: inherit;
}

.line {
  position: relative;
  display: block;
  min-height: 1lh;
  padding-inline: var(--_pad-inline);
}

.line-numbers .code {
  grid-template-columns: auto minmax(0, 1fr);
  column-gap: var(--spacing-200);
}
.line-numbers .line {
  display: grid;
  grid-column: 1/-1;
  grid-template-columns: subgrid;
}
.line-numbers .line::before {
  min-width: 1.5rem;
  color: var(--color-on-surface-variant);
  text-align: end;
  font-variant-numeric: tabular-nums;
  counter-increment: line;
  content: counter(line);
  content: counter(line)/"";
  user-select: none;
  pointer-events: none;
}

.wrap .code {
  min-width: 0;
}
.wrap .line-content {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.line[data-variant=highlighted] {
  background: color-mix(in srgb, var(--color-primary) 12%, transparent);
}

.line[data-variant=added] {
  background: color-mix(in srgb, var(--color-success) 12%, transparent);
}

.line[data-variant=removed] {
  background: color-mix(in srgb, var(--color-error) 12%, transparent);
}

.line[data-variant=added]::after,
.line[data-variant=removed]::after {
  position: absolute;
  inset-block-start: 0;
  inset-inline-start: var(--spacing-050);
  user-select: none;
  pointer-events: none;
}

.line[data-variant=added]::after {
  color: var(--color-success);
  content: "+";
}

.line[data-variant=removed]::after {
  color: var(--color-error);
  content: "−";
}

.italic {
  font-style: italic;
}

.bold {
  font-weight: 700;
}

.underline {
  text-decoration: underline;
}

.strikethrough {
  text-decoration: line-through;
}

.collapsed .content {
  max-height: var(--code-highlighter-collapsed-height, 16rem);
  overflow-y: hidden;
}

.overflowing .content {
  mask-image: linear-gradient(to bottom, black calc(100% - var(--spacing-600)), transparent);
}

.footer {
  display: flex;
  justify-content: center;
  padding: 0 var(--_pad-inline) var(--spacing-100);
}

.expand-icon {
  transition: transform var(--duration-short4) var(--easing-standard);
}
.expand-icon.flipped {
  transform: rotate(180deg);
}

@media (prefers-reduced-motion: reduce) {
  .expand-icon {
    transition: none;
  }
}
:host([size=sm]) .content {
  font-family: var(--typography-code-small-font-family) !important;
  font-size: var(--typography-code-small-font-size) !important;
  font-weight: var(--typography-code-small-font-weight) !important;
  line-height: var(--typography-code-small-line-height) !important;
  letter-spacing: var(--typography-code-small-letter-spacing) !important;
}
:host([size=sm]) .line[data-variant=added]::after,
:host([size=sm]) .line[data-variant=removed]::after {
  inset-inline-start: var(--spacing-025);
}

:host([variant=error]) .code-block {
  --_background: var(
    --code-highlighter-background,
    color-mix(
      in srgb,
      var(--color-error-container) 40%,
      var(--color-surface-container-low)
    )
  );
  --_border-color: var(
    --code-highlighter-border-color,
    color-mix(in srgb, var(--color-error) 40%, transparent)
  );
  --_foreground: var(--code-highlighter-foreground, var(--color-error));
}
:host([variant=error]) .title,
:host([variant=error]) ::slotted([slot=icon]) {
  color: var(--color-error);
}

:host([grouped]) .code-block {
  border: 0;
  border-radius: 0;
}
:host([grouped]) .code-block:has(.content:focus-visible) {
  outline-offset: -3px;
}

:host([inline]) {
  display: inline;
}

.inline {
  padding: 0 var(--spacing-050);
  font-family: var(--font-family-monospace);
  font-size: 0.875em;
  color: var(--code-highlighter-foreground, var(--color-on-surface));
  background: var(--color-surface-container-high);
  border-radius: var(--shape-corner-extra-small);
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}`;

var CodeHighlighter_1;
/** Runs a loader once and returns the same promise on every later call. */
function once(load) {
    let promise = null;
    return () => {
        promise ??= load();
        return promise;
    };
}
// Module-level loaders – Rollup splits each import() specifier into a separate chunk.
// Caching prevents parallel loads when multiple instances initialise at the same time.
const loadShiki = once(() => import('./index-_g_oLekF.js'));
// Syntax colors are CSS variables that fall back to Peacock color roles; see token-colors.ts.
const loadTheme = once(async () => {
    const { createCssVariablesTheme } = await loadShiki();
    return createCssVariablesTheme({
        name: 'peacock',
        variablePrefix: '--code-highlighter-',
        variableDefaults: TOKEN_DEFAULTS,
        fontStyle: true,
    });
});
const loadPrettier = once(() => import('./standalone-Ccq0tWwA.js'));
const loadPluginBabel = once(() => import('./babel-DBsfpl3B.js'));
const loadPluginHtml = once(() => import('./html-D22sQuVy.js'));
const loadPluginPostcss = once(() => import('./postcss-BhbitHaI.js'));
const loadPluginEstree = once(() => import('./estree-C2LDzX4U.js'));
/** Formats JavaScript, HTML and CSS with Prettier; other languages pass through. */
async function formatCode(code, language) {
    switch (language) {
        case 'javascript': {
            const [prettier, pluginBabel, pluginEstree] = await Promise.all([
                loadPrettier(),
                loadPluginBabel(),
                loadPluginEstree(),
            ]);
            return prettier.format(code, {
                parser: 'babel',
                plugins: [pluginBabel, pluginEstree],
                bracketSameLine: true,
                htmlWhitespaceSensitivity: 'ignore',
            });
        }
        case 'html': {
            const [prettier, pluginHtml] = await Promise.all([
                loadPrettier(),
                loadPluginHtml(),
            ]);
            return prettier.format(code, {
                parser: 'html',
                plugins: [pluginHtml],
                bracketSameLine: true,
                htmlWhitespaceSensitivity: 'ignore',
            });
        }
        case 'css': {
            const [prettier, pluginPostcss] = await Promise.all([
                loadPrettier(),
                loadPluginPostcss(),
            ]);
            return prettier.format(code, {
                parser: 'css',
                plugins: [pluginPostcss],
            });
        }
        default:
            return code;
    }
}
/** Tokenizes code with the Peacock token theme. Throws for unknown languages. */
async function tokenize(code, language) {
    const [{ codeToTokens }, theme] = await Promise.all([
        loadShiki(),
        loadTheme(),
    ]);
    const result = await codeToTokens(code, {
        lang: language,
        theme,
    });
    // Plain text inherits the block color, so variants can recolor it.
    return result.tokens.map(line => line.map(token => token.color === result.fg ? { ...token, color: undefined } : token));
}
// Shiki font style bit flags.
const FONT_ITALIC = 1;
const FONT_BOLD = 2;
const FONT_UNDERLINE = 4;
const FONT_STRIKETHROUGH = 8;
/** Whether a Shiki font style value has the given flag. `-1` means not set. */
const hasFontFlag = (fontStyle, flag) => fontStyle > 0 && Math.floor(fontStyle / flag) % 2 === 1;
/**
 * @label Code Highlighter
 * @tag wc-code-highlighter
 * @rawTag code-highlighter
 *
 * @summary Displays a block of code with syntax highlighting, line numbers, line highlights, diffs and a copy button.
 *
 * @example
 * ```html
 * <wc-code-highlighter language="javascript" label="hello.js" line-numbers highlight-lines="2"><pre><code>
 *   function helloWorld() {
 *     console.log('Hello, world!');
 *   }</code></pre>
 * </wc-code-highlighter>
 * ```
 *
 * @slot title - Header title content. Overrides `label` and shows the header.
 * @slot icon - Icon shown before the title in the header.
 * @slot actions - Extra action buttons, shown in the header or floating at the top end.
 *
 * @csspart container - The outer block.
 * @csspart header - The header row.
 * @csspart title - The header title.
 * @csspart actions - The action buttons group.
 * @csspart content - The scrollable code area (`pre`).
 * @csspart line - Each code line.
 * @csspart footer - The footer holding the show more button.
 *
 * @cssprop --code-highlighter-background - Block background. Defaults to `--color-surface-container-low`.
 * @cssprop --code-highlighter-border-color - Block border color. Defaults to `--color-outline-variant`.
 * @cssprop --code-highlighter-shape - Block corner radius. Defaults to `--shape-corner-medium`.
 * @cssprop --code-highlighter-max-height - Caps the code area height; it scrolls beyond. Defaults to `none`.
 * @cssprop --code-highlighter-collapsed-height - Height of a collapsed `collapsible` block. Defaults to `16rem`.
 * @cssprop --code-highlighter-foreground - Plain code color. Defaults to `--color-on-surface`.
 * @cssprop --code-highlighter-token-keyword - Keyword color. Defaults to `--color-purple`.
 * @cssprop --code-highlighter-token-string - String color. Defaults to `--color-green`.
 * @cssprop --code-highlighter-token-function - Function color. Defaults to `--color-blue`.
 * @cssprop --code-highlighter-token-constant - Constant and number color. Defaults to `--color-orange`.
 * @cssprop --code-highlighter-token-comment - Comment color. Defaults to `--color-on-surface-variant`.
 * @cssprop --code-highlighter-token-punctuation - Punctuation color. Defaults to `--color-on-surface-variant`.
 *
 * @fires {CustomEvent<{value: string}>} copied - Dispatched after the copy button copies the code.
 * @fires {CustomEvent<{expanded: boolean}>} expanded-change - Dispatched when a collapsible block is expanded or collapsed.
 *
 * @tags display
 */
let CodeHighlighter = CodeHighlighter_1 = class CodeHighlighter extends i$1 {
    constructor() {
        // ── Static ────────────────────────────────────────────────────────────────
        super(...arguments);
        // ── Properties ────────────────────────────────────────────────────────────
        /** Language of the code. Unknown languages render as plain text. */
        this.language = 'javascript';
        /** Code to display. When empty, the code is read from a light-DOM `<pre><code>`. */
        this.value = '';
        /**
         * Formats JavaScript, HTML and CSS with Prettier before display.
         * Set `format="false"` to show the code as written.
         */
        this.format = true;
        /** Header title, such as a file path. Shows the header. */
        this.label = '';
        /** Shows line numbers. */
        this.lineNumbers = false;
        /** Number of the first line when line numbers are shown. */
        this.startLine = 1;
        /** Wraps long lines instead of scrolling horizontally. */
        this.wrap = false;
        /** Shows a button that turns line wrapping on and off. */
        this.wrapToggle = false;
        /** Lines to highlight, such as `"1, 3-5"`. Counts displayed lines, after formatting. */
        this.highlightLines = '';
        /** Lines shown as added in a diff, such as `"4-6"`. */
        this.addedLines = '';
        /** Lines shown as removed in a diff, such as `"3"`. */
        this.removedLines = '';
        /** Caps the height and adds a show more button when the code is taller. */
        this.collapsible = false;
        /** Whether a collapsible block is expanded. */
        this.expanded = false;
        /** Size of the block. `sm` suits tool output and dense layouts. */
        this.size = 'md';
        /** Visual variant. `error` tints the block for failure output. */
        this.variant = 'default';
        /** Hides the copy button. */
        this.hideCopy = false;
        /** Renders the code inline, as a compact chip within text. */
        this.inline = false;
        /**
         * Set by `wc-code-group`. The group draws the frame and shows the label as a
         * tab, so the block drops its border and header.
         */
        this.grouped = false;
        /** The code as displayed, after formatting, without a trailing newline. */
        this._code = '';
        /** Tokens per line, or `null` until highlighting finishes. */
        this._tokens = null;
        /** Whether the copy button shows its copied feedback. */
        this._copied = false;
        /** Whether the collapsed code is taller than the collapsed height. */
        this._overflowing = false;
        // ── Private fields ────────────────────────────────────────────────────────
        /** Source read from `value` or the light DOM, before formatting. */
        this.__source = '';
        /** Line variants keyed by 1-based line number. */
        this.__lineVariants = new Map();
        /** Increments per highlight run so stale async results are dropped. */
        this.__run = 0;
        /** Timer that resets the copy feedback. */
        this.__copyFeedbackTimeout = null;
    }
    // ── Lifecycle ─────────────────────────────────────────────────────────────
    connectedCallback() {
        super.connectedCallback();
        this.__childObserver = new MutationObserver(() => this.requestUpdate());
        this.__childObserver.observe(this, {
            childList: true,
            attributes: true,
            attributeFilter: ['slot'],
            subtree: true,
        });
    }
    disconnectedCallback() {
        if (this.__copyFeedbackTimeout !== null) {
            window.clearTimeout(this.__copyFeedbackTimeout);
            this.__copyFeedbackTimeout = null;
        }
        this.__childObserver?.disconnect();
        this.__resizeObserver?.disconnect();
        this.__observedContent = undefined;
        super.disconnectedCallback();
    }
    willUpdate(changed) {
        if (!this.hasUpdated ||
            changed.has('value') ||
            changed.has('language') ||
            changed.has('format') ||
            changed.has('inline')) {
            this.__source = this.__readSource();
            this._code = splitLines(this.__source).join('\n');
            this._tokens = null;
            this.__highlight();
        }
        if (!this.hasUpdated ||
            changed.has('highlightLines') ||
            changed.has('addedLines') ||
            changed.has('removedLines')) {
            this.__lineVariants = buildLineVariants({
                highlighted: this.highlightLines,
                added: this.addedLines,
                removed: this.removedLines,
            });
        }
    }
    updated() {
        // The resize observer measures overflow after layout, including when
        // collapsing or expanding changes the code area's height.
        if (this.__content !== this.__observedContent) {
            this.__observeContent();
        }
    }
    // ── Private methods ───────────────────────────────────────────────────────
    /** Reads the source from `value`, or from the light DOM. */
    __readSource() {
        if (this.value)
            return this.value;
        const codeTag = this.querySelector('code');
        if (codeTag)
            return dedent(decodeEntities(codeTag.innerHTML));
        const text = Array.from(this.childNodes)
            .filter(node => node.nodeType === Node.TEXT_NODE)
            .map(node => node.textContent ?? '')
            .join('');
        return dedent(text);
    }
    /** Formats then tokenizes the source; plain lines stay until both finish. */
    async __highlight() {
        this.__run += 1;
        const run = this.__run;
        const { language } = this;
        let code = this.__source;
        if (this.format && !this.inline) {
            try {
                code = await formatCode(code, language);
            }
            catch {
                // Invalid code cannot be formatted; show it as written.
            }
            if (run !== this.__run)
                return;
            this._code = splitLines(code).join('\n');
        }
        try {
            const tokens = await tokenize(this._code, language);
            if (run === this.__run)
                this._tokens = tokens;
        }
        catch {
            // Unknown language: keep the plain lines.
        }
    }
    /** Watches the code area so the show more button appears only when needed. */
    __observeContent() {
        this.__resizeObserver?.disconnect();
        this.__observedContent = this.__content;
        if (!this.__content || typeof ResizeObserver === 'undefined')
            return;
        this.__resizeObserver ??= new ResizeObserver(() => this.__measure());
        this.__resizeObserver.observe(this.__content);
        if (this.__codeElement)
            this.__resizeObserver.observe(this.__codeElement);
    }
    /** Checks whether the collapsed code is taller than its cap. */
    __measure() {
        const content = this.__content;
        if (!content || !this.collapsible) {
            this._overflowing = false;
            return;
        }
        if (this.expanded)
            return;
        this._overflowing = content.scrollHeight > content.clientHeight + 1;
    }
    /** Whether light-DOM children are assigned to the named slot. */
    __hasSlotted(name) {
        return Array.from(this.children).some(child => child.getAttribute('slot') === name);
    }
    async __handleCopyClick() {
        const value = this.copyValue ?? this._code;
        await copyToClipboard(value);
        this._copied = true;
        this.dispatchEvent(new CustomEvent('copied', {
            detail: { value },
            bubbles: true,
            composed: true,
        }));
        if (this.__copyFeedbackTimeout !== null) {
            window.clearTimeout(this.__copyFeedbackTimeout);
        }
        this.__copyFeedbackTimeout = window.setTimeout(() => {
            this._copied = false;
            this.__copyFeedbackTimeout = null;
        }, CodeHighlighter_1.COPY_FEEDBACK_DURATION);
    }
    __handleWrapClick() {
        this.wrap = !this.wrap;
    }
    __handleExpandClick() {
        this.expanded = !this.expanded;
        if (!this.expanded && this.__content)
            this.__content.scrollTop = 0;
        this.dispatchEvent(new CustomEvent('expanded-change', {
            detail: { expanded: this.expanded },
            bubbles: true,
            composed: true,
        }));
    }
    // ── Render helpers ────────────────────────────────────────────────────────
    // eslint-disable-next-line class-methods-use-this
    __renderToken(token) {
        const fontStyle = token.fontStyle ?? 0;
        if (!token.color && fontStyle <= 0)
            return token.content;
        return b `<span
      class=${e$1({
            italic: hasFontFlag(fontStyle, FONT_ITALIC),
            bold: hasFontFlag(fontStyle, FONT_BOLD),
            underline: hasFontFlag(fontStyle, FONT_UNDERLINE),
            strikethrough: hasFontFlag(fontStyle, FONT_STRIKETHROUGH),
        })}
      style=${o({ color: token.color })}
      >${token.content}</span
    >`;
    }
    __renderLine(line, index) {
        const tokens = this._tokens?.[index];
        const variant = this.__lineVariants.get(index + 1);
        let content = line;
        if (line === '')
            content = '\n';
        else if (tokens)
            content = tokens.map(token => this.__renderToken(token));
        // No whitespace between tags: this renders inside <pre>.
        return b `<span
      class="line"
      part="line"
      data-variant=${variant ?? A}
      ><span class="line-content">${content}</span></span
    >`;
    }
    __renderActions(floating) {
        return b `
      <div class=${e$1({ actions: true, floating })} part="actions">
        <slot name="actions"></slot>
        ${this.wrapToggle
            ? b `<wc-icon-button
              class="wrap-button"
              variant="text"
              size="xs"
              shape="round"
              color="surface"
              toggle
              ?selected=${this.wrap}
              aria-label=${this.wrap ? locale.unwrapLines : locale.wrapLines}
              tooltip=${this.wrap ? locale.unwrapLines : locale.wrapLines}
              @click=${this.__handleWrapClick}
            >
              <wc-icon name="wrap_text"></wc-icon>
            </wc-icon-button>`
            : A}
        ${this.hideCopy
            ? A
            : b `<wc-icon-button
              class="copy-button"
              variant="text"
              size="xs"
              shape="round"
              color=${this._copied ? 'success' : 'surface'}
              aria-label=${this._copied
                ? locale.copied
                : locale.copyToClipboard}
              tooltip=${this._copied ? locale.copied : locale.copyToClipboard}
              @click=${this.__handleCopyClick}
            >
              <wc-icon
                name=${this._copied ? 'check' : 'content_copy'}
              ></wc-icon>
            </wc-icon-button>`}
      </div>
    `;
    }
    __renderHeader() {
        return b `
      <div class="header" part="header">
        <slot name="icon"></slot>
        <div class="title" part="title">
          <slot name="title">${this.label}</slot>
        </div>
        ${this.__renderActions(false)}
      </div>
    `;
    }
    __renderFooter() {
        return b `
      <div class="footer" part="footer">
        <wc-button
          class="expand-button"
          variant="text"
          size="xs"
          trailing-icon
          aria-expanded=${this.expanded ? 'true' : 'false'}
          @click=${this.__handleExpandClick}
        >
          <wc-icon
            slot="icon"
            class=${e$1({ 'expand-icon': true, flipped: this.expanded })}
            name="keyboard_arrow_down"
          ></wc-icon>
          ${this.expanded ? locale.showLess : locale.showMore}
        </wc-button>
      </div>
    `;
    }
    __renderInline() {
        const lines = splitLines(this._code);
        return b `<code class="inline" part="content"
      >${lines.map((line, index) => {
            const tokens = this._tokens?.[index];
            const content = tokens
                ? tokens.map(token => this.__renderToken(token))
                : line;
            return index === 0 ? content : [' ', content];
        })}</code
    >`;
    }
    // ── Render ────────────────────────────────────────────────────────────────
    render() {
        if (this.inline)
            return this.__renderInline();
        const lines = splitLines(this._code);
        const hasHeader = !this.grouped && (!!this.label || this.__hasSlotted('title'));
        const hasActions = !this.hideCopy || this.wrapToggle || this.__hasSlotted('actions');
        const showFooter = this.collapsible && (this._overflowing || this.expanded);
        const collapsed = this.collapsible && !this.expanded;
        return b `
      <div
        class=${e$1({
            'code-block': true,
            'has-header': hasHeader,
            'has-footer': showFooter,
            'line-numbers': this.lineNumbers,
            wrap: this.wrap,
            collapsed,
            overflowing: collapsed && this._overflowing,
        })}
        part="container"
      >
        ${hasHeader ? this.__renderHeader() : A}
        ${!hasHeader && hasActions ? this.__renderActions(true) : A}
        <pre
          class="content"
          part="content"
          dir="ltr"
          tabindex="0"
        ><code class="code" style=${o({
            counterReset: `line ${this.startLine - 1}`,
        })}>${lines.map((line, index) => this.__renderLine(line, index))}</code></pre>
        ${showFooter ? this.__renderFooter() : A}
        <span class="sr-only" aria-live="polite"
          >${this._copied ? locale.copiedCode : ''}</span
        >
      </div>
    `;
    }
};
CodeHighlighter.styles = [css_248z];
CodeHighlighter.COPY_FEEDBACK_DURATION = 2000;
__decorate([
    n({ type: String, reflect: true })
], CodeHighlighter.prototype, "language", void 0);
__decorate([
    n({ type: String })
], CodeHighlighter.prototype, "value", void 0);
__decorate([
    n({
        converter: { fromAttribute: (value) => value !== 'false' },
    })
], CodeHighlighter.prototype, "format", void 0);
__decorate([
    n({ type: String })
], CodeHighlighter.prototype, "label", void 0);
__decorate([
    n({ attribute: 'line-numbers', type: Boolean, reflect: true })
], CodeHighlighter.prototype, "lineNumbers", void 0);
__decorate([
    n({ attribute: 'start-line', type: Number })
], CodeHighlighter.prototype, "startLine", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], CodeHighlighter.prototype, "wrap", void 0);
__decorate([
    n({ attribute: 'wrap-toggle', type: Boolean })
], CodeHighlighter.prototype, "wrapToggle", void 0);
__decorate([
    n({ attribute: 'highlight-lines', type: String })
], CodeHighlighter.prototype, "highlightLines", void 0);
__decorate([
    n({ attribute: 'added-lines', type: String })
], CodeHighlighter.prototype, "addedLines", void 0);
__decorate([
    n({ attribute: 'removed-lines', type: String })
], CodeHighlighter.prototype, "removedLines", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], CodeHighlighter.prototype, "collapsible", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], CodeHighlighter.prototype, "expanded", void 0);
__decorate([
    n({ type: String, reflect: true })
], CodeHighlighter.prototype, "size", void 0);
__decorate([
    n({ type: String, reflect: true })
], CodeHighlighter.prototype, "variant", void 0);
__decorate([
    n({ attribute: 'hide-copy', type: Boolean })
], CodeHighlighter.prototype, "hideCopy", void 0);
__decorate([
    n({ attribute: 'copy-value', type: String })
], CodeHighlighter.prototype, "copyValue", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], CodeHighlighter.prototype, "inline", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], CodeHighlighter.prototype, "grouped", void 0);
__decorate([
    r()
], CodeHighlighter.prototype, "_code", void 0);
__decorate([
    r()
], CodeHighlighter.prototype, "_tokens", void 0);
__decorate([
    r()
], CodeHighlighter.prototype, "_copied", void 0);
__decorate([
    r()
], CodeHighlighter.prototype, "_overflowing", void 0);
__decorate([
    e('.content')
], CodeHighlighter.prototype, "__content", void 0);
__decorate([
    e('.code')
], CodeHighlighter.prototype, "__codeElement", void 0);
CodeHighlighter = CodeHighlighter_1 = __decorate([
    IndividualComponent
], CodeHighlighter);

export { CodeHighlighter };
//# sourceMappingURL=code-highlighter.js.map
