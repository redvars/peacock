import { html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { classMap } from 'lit/directives/class-map.js';

import prettier from 'prettier/standalone';

import prettierPluginBabel from 'prettier/plugins/babel';
import prettierPluginHtml from 'prettier/plugins/html';
import prettierPluginPostcss from 'prettier/plugins/postcss';
import * as prettierPluginEstree from 'prettier/plugins/estree';

import { BundledLanguage, codeToHtml, ShikiTransformer } from 'shiki';

import PeacockComponent from 'src/PeacockComponent.js';
import { copyToClipboard } from '../utils/copy-to-clipboard.js';
import styles from './code-highlighter.scss';

/**
 * @label Code Highlighter
 * @tag wc-code-highlighter
 * @rawTag code-highlighter
 * @summary A component that provides syntax highlighting for code snippets.
 * @tags display
 *
 * @example
 * ```html
 * <wc-code-highlighter language="javascript">
 *   <pre><code>console.log('Hello');</code></pre>
 * </wc-code-highlighter>
 * ```
 */

const locale = {
  loading: 'Loading code...',
  copyToClipboard: 'Copy to clipboard',
  copied: 'Copied',
  copiedCode: 'Copied code',
};

/**
 * @label Code Highlighter
 * @tag code-highlighter
 * @rawTag code-highlighter
 *
 * @summary Highlights code snippets with syntax highlighting and line numbers.
 * @overview
 *  - CodeHighlighter is a component that provides syntax highlighting for code snippets.
 *  - It supports various programming languages and can display line numbers for better readability.
 *
 * @example
 * ```html
 * <code-highlighter language="javascript" style="height: 9rem"><pre><code>
 *   function helloWorld() {
 *     console.log('Hello, world!');
 *   }</code></pre>
 * </code-highlighter>
 * ```
 * @tags display
 */
@PeacockComponent
export class CodeHighlighter extends LitElement {
  static styles = [styles];

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

  private parsedCode: string | null = null;

  async connectedCallback() {
    // eslint-disable-next-line wc/guard-super-call
    super.connectedCallback();
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

    // eslint-disable-next-line default-case
    switch (this.language) {
      case 'javascript':
        codeString = await prettier.format(codeString, {
          parser: 'babel',
          plugins: [prettierPluginBabel, prettierPluginEstree],
        });
        break;
      case 'html':
        codeString = await prettier.format(codeString, {
          parser: 'html',
          plugins: [prettierPluginHtml],
        });
        break;
      case 'css':
        codeString = await prettier.format(codeString, {
          parser: 'css',
          plugins: [prettierPluginPostcss],
        });
        break;
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

    this.compiledCode = await codeToHtml(codeString, {
      lang: this.language,
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      transformers,
    });
  }

  protected updated() {
    this.__highlightCode();
  }

  private async __handleCopyClick() {
    await copyToClipboard(`${this.parsedCode}`);
  }

  render() {
    if (this.compiledCode === null) {
      return html`
        <div class="code-loader">
          <p-circular-progress indeterminate></p-circular-progress>
          ${locale.loading}
        </div>
      `;
    }
    // @click=${() => this.inline && this.handleCopyClick()}

    return html`
      <div
        class=${classMap({
          'code-highlighter': true,
          'line-numbers': this.lineNumbers,
        })}
      >
        <div class="header">
          <div class="header-title">${this.language}</div>
          <div class="header-actions">
            <wc-icon-button
              color="dark"
              variant="text"
              size="xs"
              aria-label=${locale.copyToClipboard}
              name="content_copy"
              tooltip=${locale.copyToClipboard}
              @click=${this.__handleCopyClick}
            >
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
