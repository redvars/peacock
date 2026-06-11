import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { r } from './state-DkTK9EGF.js';
import { o } from './unsafe-html-Ct0N2_UU.js';
import { e } from './class-map-DG7CA1et.js';
import './directive-ZPhl09Yt.js';

function fallbackCopyTextToClipboard(text) {
    const temporaryInput = document.createElement('textarea');
    temporaryInput.value = text;
    // Make the element non-visible but still in the DOM so it can be selected
    temporaryInput.setAttribute('readonly', '');
    temporaryInput.style.position = 'absolute';
    temporaryInput.style.left = '-9999px';
    document.body.appendChild(temporaryInput);
    temporaryInput.select();
    try {
        document.execCommand('copy');
    }
    catch (err) {
        console.error('Fallback: Failed to copy text: ', err);
    }
    finally {
        document.body.removeChild(temporaryInput);
    }
}
async function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        // Use the modern Clipboard API
        try {
            await navigator.clipboard.writeText(text);
        }
        catch (err) {
            console.error('Failed to copy text using Clipboard API: ', err);
            // Fallback if API fails for some reason
            fallbackCopyTextToClipboard(text);
        }
    }
    else {
        // Use the fallback method for older browsers
        fallbackCopyTextToClipboard(text);
    }
}

var css_248z = i`* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.screen-reader-only {
  display: none !important;
}

[hidden] {
  display: none !important;
}

:host {
  display: block;
  height: 100%;
  --code-highlighter-background: var(--color-surface-container);
}

.code-loader {
  height: 10rem;
  background-color: var(--code-highlighter-background);
  color: var(--color-on-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-050);
}

.code-highlighter {
  height: 100%;
  display: flex;
  flex-direction: column;
  color: var(--color-on-surface);
}
.code-highlighter .header {
  padding: var(--spacing-100);
  padding-inline-start: var(--spacing-200);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--code-highlighter-background);
  border-bottom: 1px solid var(--color-outline-variant);
  font-family: var(--typography-body-medium-font-family) !important;
  font-size: var(--typography-body-medium-font-size) !important;
  font-weight: var(--typography-body-medium-font-weight) !important;
  line-height: var(--typography-body-medium-line-height) !important;
  letter-spacing: var(--typography-body-medium-letter-spacing) !important;
}
.code-highlighter .header .copy-button {
  --button-container-shape: 9999px;
}
.code-highlighter .scroll-wrapper {
  flex: 1;
  overflow-y: auto;
  background-color: var(--code-highlighter-background);
}
.code-highlighter .scroll-wrapper .highlighter {
  margin: 0;
  position: relative;
}
.code-highlighter .scroll-wrapper .highlighter .shiki {
  margin: 0;
  padding: var(--spacing-200);
  width: fit-content;
  background: transparent !important;
  font-family: var(--font-family-monospace);
  --shiki-dark-bg: transparent !important;
}
.code-highlighter .scroll-wrapper .highlighter .shiki code {
  font-family: var(--typography-code-medium-font-family) !important;
  font-size: var(--typography-code-medium-font-size) !important;
  font-weight: var(--typography-code-medium-font-weight) !important;
  line-height: var(--typography-code-medium-line-height) !important;
  letter-spacing: var(--typography-code-medium-letter-spacing) !important;
}
.code-highlighter.line-numbers .highlighter .shiki {
  /* Reset counter for line numbers */
  counter-reset: line-counter;
}
.code-highlighter.line-numbers .line {
  position: relative;
  padding-left: 2rem; /* Space for numbers */
}
.code-highlighter.line-numbers .line::before {
  counter-increment: line-counter;
  content: counter(line-counter);
  /* Positioning */
  position: absolute;
  left: -1.5rem; /* Pull back into padding */
  width: 2.5rem; /* Fixed width for alignment */
  text-align: right;
  padding-right: 1rem;
  /* Visuals */
  color: var(--num-color);
  opacity: 0.6;
  font-variant-numeric: tabular-nums; /* Ensures numbers align vertically */
  user-select: none; /* Don't copy line numbers when selecting text */
  pointer-events: none;
}

:host-context([data-theme=dark]) .highlighter .shiki,
:host-context([data-theme=dark]) .highlighter .shiki span {
  color: var(--shiki-dark) !important;
  background-color: var(--shiki-dark-bg) !important;
}

:host([inline]) {
  display: inline;
  height: initial;
}
:host([inline]) .code-highlighter {
  display: inline;
  cursor: pointer;
}
:host([inline]) .code-highlighter .scroll-wrapper {
  display: inline;
}
:host([inline]) .code-highlighter .scroll-wrapper .line-numbers-wrapper {
  padding: 0 var(--spacing-100);
  font-size: inherit;
  display: inline;
  word-wrap: break-word;
}
:host([inline]) .code-highlighter .scroll-wrapper .line-numbers-wrapper .highlighter {
  display: inline;
}
:host([inline]) .code-loader {
  height: initial;
  display: inline;
}`;

var CodeHighlighter_1;
// Module-level promises – Rollup splits each import() specifier into a separate chunk.
// Caching here prevents parallel loads when multiple instances initialise at the same time.
let _shiki = null;
let _themes = null;
let _prettier = null;
let _pluginBabel = null;
let _pluginHtml = null;
let _pluginPostcss = null;
let _pluginEstree = null;
const loadShiki = () => (_shiki ??= import('./index-_g_oLekF.js'));
const loadThemes = () => (_themes ??= Promise.all([
    import('./pierre-dark-DFWl0m-C.js'),
    import('./pierre-light-BEkAPImt.js'),
]));
const loadPrettier = () => (_prettier ??= import('./standalone-Ccq0tWwA.js'));
const loadPluginBabel = () => (_pluginBabel ??= import('./babel-DBsfpl3B.js'));
const loadPluginHtml = () => (_pluginHtml ??= import('./html-D22sQuVy.js'));
const loadPluginPostcss = () => (_pluginPostcss ??= import('./postcss-BhbitHaI.js'));
const loadPluginEstree = () => (_pluginEstree ??= import('./estree-C2LDzX4U.js'));
const locale = {
    loading: 'Loading code...',
    copyToClipboard: 'Copy to clipboard',
    copied: 'Copied'};
/**
 * @label Code Highlighter
 * @tag wc-code-highlighter
 * @rawTag code-highlighter
 *
 * @summary A component that provides syntax highlighting for code snippets.
 *
 * @example
 * ```html
 * <wc-code-highlighter language="javascript" style="height: 9rem"><pre><code>
 *   function helloWorld() {
 *     console.log('Hello, world!');
 *   }</code></pre>
 * </wc-code-highlighter>
 * ```
 * @tags display
 */
let CodeHighlighter = CodeHighlighter_1 = class CodeHighlighter extends i$1 {
    constructor() {
        super(...arguments);
        this.language = 'javascript';
        this.lineNumbers = false;
        this.value = '';
        this.format = true;
        this.hideCopy = false;
        this.compiledCode = null;
        this._copied = false;
        this.parsedCode = null;
        this._copyFeedbackTimeout = null;
    }
    async connectedCallback() {
        // eslint-disable-next-line wc/guard-super-call
        super.connectedCallback();
    }
    disconnectedCallback() {
        if (this._copyFeedbackTimeout !== null) {
            window.clearTimeout(this._copyFeedbackTimeout);
            this._copyFeedbackTimeout = null;
        }
        super.disconnectedCallback();
    }
    firstUpdated() {
        this.__highlightCode();
    }
    // eslint-disable-next-line class-methods-use-this
    decode(str) {
        return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    }
    async __highlightCode() {
        let codeString = '';
        if (this.value) {
            codeString = this.value;
        }
        else {
            // Accessing light DOM children
            const codeTag = this.querySelector('code');
            if (codeTag) {
                codeString = codeTag.innerHTML;
            }
            else if (this.childNodes.length > 0) {
                codeString = this.innerText;
            }
        }
        codeString = this.decode(codeString);
        if (this.format !== false) {
            // eslint-disable-next-line default-case
            switch (this.language) {
                case 'javascript': {
                    const [prettier, pluginBabel, pluginEstree] = await Promise.all([
                        loadPrettier(),
                        loadPluginBabel(),
                        loadPluginEstree(),
                    ]);
                    codeString = await prettier.format(codeString, {
                        parser: 'babel',
                        plugins: [pluginBabel, pluginEstree],
                        bracketSameLine: true,
                        htmlWhitespaceSensitivity: 'ignore',
                    });
                    break;
                }
                case 'html': {
                    const [prettier, pluginHtml] = await Promise.all([
                        loadPrettier(),
                        loadPluginHtml(),
                    ]);
                    codeString = await prettier.format(codeString, {
                        parser: 'html',
                        plugins: [pluginHtml],
                        bracketSameLine: true,
                        htmlWhitespaceSensitivity: 'ignore',
                    });
                    break;
                }
                case 'css': {
                    const [prettier, pluginPostcss] = await Promise.all([
                        loadPrettier(),
                        loadPluginPostcss(),
                    ]);
                    codeString = await prettier.format(codeString, {
                        parser: 'css',
                        plugins: [pluginPostcss],
                    });
                    break;
                }
            }
        }
        this.parsedCode = codeString;
        const transformers = [];
        // If line numbers are enabled, we inject a transformer
        // that adds the 'line' class to every line node.
        if (this.lineNumbers) {
            transformers.push({
                name: 'add-line-class',
                line(node) {
                    // Shiki v1 helper to add classes to the AST
                    this.addClassToHast(node, 'line');
                },
            });
        }
        const [{ codeToHtml }, [{ default: pierreDark }, { default: pierreLight }],] = await Promise.all([loadShiki(), loadThemes()]);
        this.compiledCode = await codeToHtml(codeString, {
            lang: this.language,
            themes: {
                // @ts-ignore
                light: pierreLight,
                // @ts-ignore
                dark: pierreDark,
            },
            transformers,
        });
    }
    updated(changed) {
        // Only re-highlight when the source content or rendering options change,
        // not on unrelated state updates like the copy-button feedback toggle.
        if (changed.has('value') ||
            changed.has('language') ||
            changed.has('lineNumbers') ||
            changed.has('format')) {
            this.__highlightCode();
        }
    }
    async __handleCopyClick() {
        if (this.parsedCode == null) {
            return;
        }
        await copyToClipboard(this.parsedCode);
        this._copied = true;
        if (this._copyFeedbackTimeout !== null) {
            window.clearTimeout(this._copyFeedbackTimeout);
        }
        this._copyFeedbackTimeout = window.setTimeout(() => {
            this._copied = false;
            this._copyFeedbackTimeout = null;
        }, CodeHighlighter_1.COPY_FEEDBACK_DURATION);
    }
    render() {
        if (this.compiledCode === null) {
            return b `
        <div class="code-loader">
          <wc-circular-progress indeterminate></wc-circular-progress>
          ${locale.loading}
        </div>
      `;
        }
        return b `
      <div
        class=${e({
            'code-highlighter': true,
            'line-numbers': this.lineNumbers,
        })}
      >
        <div class="header">
          <div class="header-title">
            <slot name="title">${this.language?.toUpperCase()}</slot>
          </div>
          <div class="header-actions">
            <wc-icon-button
              color=${this._copied ? 'success' : 'surface'}
              variant="text"
              size="xs"
              aria-label=${this._copied
            ? locale.copied
            : locale.copyToClipboard}
              tooltip=${this._copied ? locale.copied : locale.copyToClipboard}
              @click=${this.__handleCopyClick}
            >
              <wc-icon
                name=${this._copied ? 'check' : 'content_copy'}
              ></wc-icon>
            </wc-icon-button>
          </div>
        </div>

        <div class="scroll-wrapper">
          <div class="highlighter">${o(this.compiledCode || '')}</div>
        </div>
      </div>
    `;
    }
};
CodeHighlighter.styles = [css_248z];
CodeHighlighter.COPY_FEEDBACK_DURATION = 3000;
__decorate([
    n({ type: String, reflect: true })
], CodeHighlighter.prototype, "language", void 0);
__decorate([
    n({ attribute: 'line-numbers', type: Boolean, reflect: true })
], CodeHighlighter.prototype, "lineNumbers", void 0);
__decorate([
    n({ type: String })
], CodeHighlighter.prototype, "value", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], CodeHighlighter.prototype, "format", void 0);
__decorate([
    n({ type: Boolean })
], CodeHighlighter.prototype, "hideCopy", void 0);
__decorate([
    r()
], CodeHighlighter.prototype, "compiledCode", void 0);
__decorate([
    r()
], CodeHighlighter.prototype, "_copied", void 0);
CodeHighlighter = CodeHighlighter_1 = __decorate([
    IndividualComponent
], CodeHighlighter);

export { CodeHighlighter };
//# sourceMappingURL=code-highlighter.js.map
