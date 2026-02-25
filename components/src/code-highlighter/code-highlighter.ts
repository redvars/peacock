import { html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { classMap } from 'lit/directives/class-map.js';

// Internal imports (assuming these paths remain the same)
import * as beautify from 'js-beautify';
import * as Prism from 'prismjs';
import { BundledLanguage, codeToHtml, ShikiTransformer } from 'shiki';

import { copyToClipboard } from '../utils/copy-to-clipboard.js';
import styles from './code-highlighter.scss';

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
 * <code-highlighter language="javascript" style="height: 6rem"><pre><code>
 *   function helloWorld() {
 *     console.log('Hello, world!');
 *   }</code></pre>
 * </code-highlighter>
 * ```
 * @tags display
 */
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
    this.populateCode();
  }

  // eslint-disable-next-line class-methods-use-this
  private decode(str: string) {
    return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  }

  private async populateCode() {
    if (!Prism.languages[this.language]) return;

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

    const config = { wrap_line_length: 120 };
    // eslint-disable-next-line default-case
    switch (this.language) {
      case 'javascript':
        codeString = beautify.js(codeString, config);
        break;
      case 'html':
        codeString = beautify.html(codeString, config);
        break;
      case 'css':
        codeString = beautify.css(codeString, config);
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

  /**
   * Replaces Stencil's @Watch
   */
  protected updated() {
    this.populateCode();
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
            <icon-button
              color="dark"
              variant="text"
              size="xs"
              aria-label=${locale.copyToClipboard}
              name="content_copy"
              tooltip=${locale.copyToClipboard}
              @click=${this.__handleCopyClick}
            >
            </icon-button>
          </div>
        </div>

        <div class="scroll-wrapper">
          <div class="highlighter">${unsafeHTML(this.compiledCode || '')}</div>
        </div>
      </div>
    `;
  }
}
