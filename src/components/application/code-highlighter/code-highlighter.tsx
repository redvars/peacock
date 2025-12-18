import {
  Component,
  ComponentInterface,
  Element,
  Fragment,
  h,
  Host,
  Prop,
  State,
  Watch,
} from '@stencil/core';
import { loadPrism, loadPrismLanguage } from '../../../3d-party/prism';
import * as beautify from 'js-beautify/js';
import { getComponentIndex, isInViewport } from '../../../utils/utils';
import { Language } from './constants';

const locale: {
  loading: string;
  copyToClipboard: string;
  copied: string;
  copiedCode: string;
} = {
  loading: 'Loading code...',
  copyToClipboard: 'Copy to clipboard',
  copied: 'Copied',
  copiedCode: 'Copied code',
};

/**
 * @name Code Highlighter
 * @description A browser based code highlighter.
 * @category Data Display
 * @tag display, code
 * @img /assets/img/code-highlighter.webp
 * @imgDark /assets/img/code-highlighter-dark.webp
 */
@Component({
  tag: 'goat-code-highlighter',
  styleUrl: 'code-highlighter.scss',
  shadow: true,
})
export class CodeHighlighter implements ComponentInterface {
  @Element() host!: HTMLElement;

  gid: string = getComponentIndex();

  /**
   * The language of the code snippet.
   */
  @Prop({ reflect: true }) language: Language = 'javascript';

  /**
   * Display line numbers.
   */
  @Prop({ reflect: true }) lineNumbers: boolean = false;

  /**
   * The code snippet to highlight.
   */
  @Prop() value: string = '';

  /**
   * Format the code snippet.
   */
  @Prop({ reflect: true, mutable: true }) format: boolean;

  /**
   * Display the code snippet inline.
   */
  @Prop({ reflect: true }) inline: boolean = false;

  /**
   * Hide the copy button.
   */
  @Prop() hideCopy: boolean = false;

  @State() compiledCode: string = null;
  @State() copyState: 'idle' | 'copied' = 'idle';

  private codeString: string = '';
  private parsedCodeString: string = '';

  @Watch('value')
  valueWatcher() {
    if (this.value) {
      this.codeString = this.value;
    }
    this.#renderPrism();
  }

  @Watch('language')
  languageWatcher() {
    this.#renderPrism();
  }

  @Watch('lineNumbers')
  themeWatcher() {
    this.#renderPrism();
  }

  async componentWillLoad() {
    this.codeString = '';
    if (this.value) {
      this.codeString = this.value;
    } else if (this.host.querySelector('code')) {
      this.codeString = this.host.querySelector('code').innerHTML;
    } else if (this.host.hasChildNodes()) {
      this.codeString = this.host.innerText;
    }

    if (typeof this.format === 'undefined') {
      this.format = !this.inline;
    }

    this.codeString = this.decode(this.codeString);
  }

  async initializePrism() {
    if (!window['Prism']) {
      await loadPrism();
    }

    if (!isInViewport(this.host)) {
      setTimeout(() => this.initializePrism(), 300);
      return;
    }

    // @ts-ignore
    const Prism = window['Prism'];
    const autoloader = Prism.plugins.autoloader;
    if (autoloader) {
      await loadPrismLanguage(this.language);
      this.#renderPrism();
    } else {
      this.#renderPrism();
    }
  }

  componentDidLoad() {
    this.initializePrism();
  }

  decode(str: string) {
    return str.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  }

  #renderPrism() {
    if (
      (this.format && this.language === 'javascript') ||
      this.language === 'html' ||
      this.language === 'css'
    ) {
      switch (this.language) {
        case 'javascript':
          this.parsedCodeString = beautify.js(this.codeString, {
            wrap_line_length: 120,
          });
          break;
        case 'html':
          this.parsedCodeString = beautify.html(this.codeString, {
            wrap_line_length: 120,
          });
          break;
        case 'css':
          this.parsedCodeString = beautify.css(this.codeString, {
            wrap_line_length: 120,
          });
          break;
      }
      this.#populateCode();
    } else {
      this.parsedCodeString = this.codeString;
      this.#populateCode();
    }
  }

  #populateCode() {
    // @ts-ignore
    const Prism = window['Prism'];
    const formatted = Prism.highlight(
      this.parsedCodeString,
      Prism.languages[this.language],
      this.language,
    );
    let lineNumbersWrapper = '';
    if (this.lineNumbers) {
      const linesNum = formatted.split('\n').length;
      const lines = new Array(linesNum + 1).join('<span></span>');
      lineNumbersWrapper = `<span aria-hidden='true' class='line-numbers-rows'>${lines}</span>`;
    }
    this.compiledCode = formatted + lineNumbersWrapper;
  }

  async #handleCopyClick() {
    const textToCopy = this.parsedCodeString;
    // Navigator clipboard api needs a secure context (https)
    // Use the 'out of viewport hidden text area' trick
    const textArea = document.createElement('textarea');
    textArea.value = textToCopy;

    // Move textarea out of the viewport so it's not visible
    textArea.style.position = 'absolute';
    textArea.style.left = '-999999px';

    document.body.prepend(textArea);
    textArea.select();

    try {
      document.execCommand('copy');
    } catch (error) {
      console.error(error);
    } finally {
      textArea.remove();
    }

    this.copyState = 'copied';

    setTimeout(() => {
      this.copyState = 'idle';
    }, 3000);
  }

  #renderHighlighter() {
    if (this.inline) {
      return <div class="highlighter" innerHTML={this.compiledCode} />;
    } else {
      return (
        <pre class="highlighter line-numbers" innerHTML={this.compiledCode} />
      );
    }
  }

  render() {
    return (
      <Host>
        {this.compiledCode !== null && (
          <div
            class="code-highlighter"
            on-click={async () => {
              if (this.inline) await this.#handleCopyClick();
            }}
          >
            <div class="scroll-wrapper">
              <div
                class={{
                  'line-numbers-wrapper': true,
                  'line-numbers': this.lineNumbers,
                }}
              >
                {this.#renderHighlighter()}
              </div>
            </div>
            {!this.hideCopy && this.copyState === 'idle' && !this.inline && (
              <Fragment>
                <goat-tooltip
                  class={'copy-btn'}
                  content={locale.copyToClipboard}
                >
                  <pc-button
                    class="icon-only"
                    size="sm"
                    color={'secondary'}
                    variant={'text'}
                    aria-label="Copy to clipboard"
                    onGoat-button--click={async () => {
                      await this.#handleCopyClick();
                    }}
                  >
                    <pc-icon slot="icon" name="content_copy" />
                  </pc-button>
                </goat-tooltip>
              </Fragment>
            )}
            {!this.hideCopy && this.copyState === 'copied' && !this.inline && (
              <div>
                <pc-button
                  class="copy-btn icon-only test"
                  size="sm"
                  color={'success'}
                  aria-label={locale.copiedCode}
                  title={locale.copiedCode}
                >
                  <pc-icon slot="icon" name="checkmark" />
                  {locale.copied}
                </pc-button>
              </div>
            )}
          </div>
        )}
        {this.compiledCode === null && (
          <div class="code-loader">
            <goat-spinner>{locale.loading}</goat-spinner>
          </div>
        )}
      </Host>
    );
  }
}
