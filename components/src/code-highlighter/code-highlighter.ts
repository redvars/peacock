import { html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { classMap } from 'lit/directives/class-map.js';
import type { BundledLanguage, ShikiTransformer } from 'shiki';
import IndividualComponent from '@/IndividualComponent.js';
import { copyToClipboard } from '@/__internal/utils/copy-to-clipboard.js';
import styles from './code-highlighter.scss';

// Module-level promises – Rollup splits each import() specifier into a separate chunk.
// Caching here prevents parallel loads when multiple instances initialise at the same time.
let _shiki: Promise<typeof import('shiki')> | null = null;
let _themes: Promise<
  [
    typeof import('@pierre/theme/pierre-dark'),
    typeof import('@pierre/theme/pierre-light'),
  ]
> | null = null;
let _prettier: Promise<typeof import('prettier/standalone')> | null = null;
let _pluginBabel: Promise<typeof import('prettier/plugins/babel')> | null =
  null;
let _pluginHtml: Promise<typeof import('prettier/plugins/html')> | null = null;
let _pluginPostcss: Promise<typeof import('prettier/plugins/postcss')> | null =
  null;
let _pluginEstree: Promise<typeof import('prettier/plugins/estree')> | null =
  null;

const loadShiki = () => (_shiki ??= import('shiki'));
const loadThemes = () =>
  (_themes ??= Promise.all([
    import('@pierre/theme/pierre-dark'),
    import('@pierre/theme/pierre-light'),
  ]));
const loadPrettier = () => (_prettier ??= import('prettier/standalone'));
const loadPluginBabel = () =>
  (_pluginBabel ??= import('prettier/plugins/babel'));
const loadPluginHtml = () => (_pluginHtml ??= import('prettier/plugins/html'));
const loadPluginPostcss = () =>
  (_pluginPostcss ??= import('prettier/plugins/postcss'));
const loadPluginEstree = () =>
  (_pluginEstree ??= import('prettier/plugins/estree'));

const locale = {
  loading: 'Loading code...',
  copyToClipboard: 'Copy to clipboard',
  copied: 'Copied',
  copiedCode: 'Copied code',
};

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
@IndividualComponent
export class CodeHighlighter extends LitElement {
  static styles = [styles];

  private static readonly COPY_FEEDBACK_DURATION = 3000;

  @property({ type: String, reflect: true })
  language: BundledLanguage = 'javascript';

  @property({ attribute: 'line-numbers', type: Boolean, reflect: true })
  lineNumbers: boolean = false;

  @property({ type: String })
  value: string = '';

  @property({ type: Boolean, reflect: true })
  format?: boolean = true;

  @property({ type: Boolean })
  hideCopy: boolean = false;

  @state() private compiledCode: string | null = null;

  @state() private _copied = false;

  private parsedCode: string | null = null;

  private _copyFeedbackTimeout: number | null = null;

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
  private decode(str: string) {
    return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  }

  private async __highlightCode() {
    let codeString = '';
    if (this.value) {
      codeString = this.value;
    } else {
      // Accessing light DOM children
      const codeTag = this.querySelector('code');
      if (codeTag) {
        codeString = codeTag.innerHTML;
      } else if (this.childNodes.length > 0) {
        codeString = (this as HTMLElement).innerText;
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

    const transformers: ShikiTransformer[] = [];

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

    const [
      { codeToHtml },
      [{ default: pierreDark }, { default: pierreLight }],
    ] = await Promise.all([loadShiki(), loadThemes()]);

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

  protected updated(changed: Map<PropertyKey, unknown>) {
    // Only re-highlight when the source content or rendering options change,
    // not on unrelated state updates like the copy-button feedback toggle.
    if (
      changed.has('value') ||
      changed.has('language') ||
      changed.has('lineNumbers') ||
      changed.has('format')
    ) {
      this.__highlightCode();
    }
  }

  private async __handleCopyClick() {
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
    }, CodeHighlighter.COPY_FEEDBACK_DURATION);
  }

  render() {
    if (this.compiledCode === null) {
      return html`
        <div class="code-loader">
          <wc-circular-progress indeterminate></wc-circular-progress>
          ${locale.loading}
        </div>
      `;
    }

    return html`
      <div
        class=${classMap({
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
          <div class="highlighter">${unsafeHTML(this.compiledCode || '')}</div>
        </div>
      </div>
    `;
  }
}
