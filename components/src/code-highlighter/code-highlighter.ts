import { html, LitElement, nothing, PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import type {
  BundledLanguage,
  SpecialLanguage,
  ThemedToken,
  ThemeRegistration,
} from 'shiki';
import IndividualComponent from '@/IndividualComponent.js';
import { copyToClipboard } from '@/__internal/utils/copy-to-clipboard.js';
import { locale } from './local.js';
import { TOKEN_DEFAULTS } from './token-colors.js';
import {
  buildLineVariants,
  decodeEntities,
  dedent,
  LineVariant,
  splitLines,
} from './line-ranges.js';
import styles from './code-highlighter.scss';

export type CodeHighlighterLanguage = BundledLanguage | SpecialLanguage;
export type CodeHighlighterSize = 'sm' | 'md';
export type CodeHighlighterVariant = 'default' | 'error';

/** Runs a loader once and returns the same promise on every later call. */
function once<T>(load: () => Promise<T>): () => Promise<T> {
  let promise: Promise<T> | null = null;
  return () => {
    promise ??= load();
    return promise;
  };
}

// Module-level loaders – Rollup splits each import() specifier into a separate chunk.
// Caching prevents parallel loads when multiple instances initialise at the same time.
const loadShiki = once(() => import('shiki'));

// Syntax colors are CSS variables that fall back to Peacock color roles; see token-colors.ts.
const loadTheme = once<ThemeRegistration>(async () => {
  const { createCssVariablesTheme } = await loadShiki();
  return createCssVariablesTheme({
    name: 'peacock',
    variablePrefix: '--code-highlighter-',
    variableDefaults: TOKEN_DEFAULTS,
    fontStyle: true,
  });
});

const loadPrettier = once(() => import('prettier/standalone'));
const loadPluginBabel = once(() => import('prettier/plugins/babel'));
const loadPluginHtml = once(() => import('prettier/plugins/html'));
const loadPluginPostcss = once(() => import('prettier/plugins/postcss'));
const loadPluginEstree = once(() => import('prettier/plugins/estree'));

/** Formats JavaScript, HTML and CSS with Prettier; other languages pass through. */
async function formatCode(code: string, language: string): Promise<string> {
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
async function tokenize(
  code: string,
  language: string,
): Promise<ThemedToken[][]> {
  const [{ codeToTokens }, theme] = await Promise.all([
    loadShiki(),
    loadTheme(),
  ]);
  const result = await codeToTokens(code, {
    lang: language as CodeHighlighterLanguage,
    theme,
  });
  // Plain text inherits the block color, so variants can recolor it.
  return result.tokens.map(line =>
    line.map(token =>
      token.color === result.fg ? { ...token, color: undefined } : token,
    ),
  );
}

// Shiki font style bit flags.
const FONT_ITALIC = 1;
const FONT_BOLD = 2;
const FONT_UNDERLINE = 4;
const FONT_STRIKETHROUGH = 8;

/** Whether a Shiki font style value has the given flag. `-1` means not set. */
const hasFontFlag = (fontStyle: number, flag: number) =>
  fontStyle > 0 && Math.floor(fontStyle / flag) % 2 === 1;

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
@IndividualComponent
export class CodeHighlighter extends LitElement {
  // ── Static ────────────────────────────────────────────────────────────────

  static styles = [styles];

  private static readonly COPY_FEEDBACK_DURATION = 2000;

  // ── Properties ────────────────────────────────────────────────────────────

  /** Language of the code. Unknown languages render as plain text. */
  @property({ type: String, reflect: true })
  language: CodeHighlighterLanguage = 'javascript';

  /** Code to display. When empty, the code is read from a light-DOM `<pre><code>`. */
  @property({ type: String })
  value: string = '';

  /**
   * Formats JavaScript, HTML and CSS with Prettier before display.
   * Set `format="false"` to show the code as written.
   */
  @property({
    converter: { fromAttribute: (value: string | null) => value !== 'false' },
  })
  format: boolean = true;

  /** Header title, such as a file path. Shows the header. */
  @property({ type: String })
  label: string = '';

  /** Shows line numbers. */
  @property({ attribute: 'line-numbers', type: Boolean, reflect: true })
  lineNumbers: boolean = false;

  /** Number of the first line when line numbers are shown. */
  @property({ attribute: 'start-line', type: Number })
  startLine: number = 1;

  /** Wraps long lines instead of scrolling horizontally. */
  @property({ type: Boolean, reflect: true })
  wrap: boolean = false;

  /** Shows a button that turns line wrapping on and off. */
  @property({ attribute: 'wrap-toggle', type: Boolean })
  wrapToggle: boolean = false;

  /** Lines to highlight, such as `"1, 3-5"`. Counts displayed lines, after formatting. */
  @property({ attribute: 'highlight-lines', type: String })
  highlightLines: string = '';

  /** Lines shown as added in a diff, such as `"4-6"`. */
  @property({ attribute: 'added-lines', type: String })
  addedLines: string = '';

  /** Lines shown as removed in a diff, such as `"3"`. */
  @property({ attribute: 'removed-lines', type: String })
  removedLines: string = '';

  /** Caps the height and adds a show more button when the code is taller. */
  @property({ type: Boolean, reflect: true })
  collapsible: boolean = false;

  /** Whether a collapsible block is expanded. */
  @property({ type: Boolean, reflect: true })
  expanded: boolean = false;

  /** Size of the block. `sm` suits tool output and dense layouts. */
  @property({ type: String, reflect: true })
  size: CodeHighlighterSize = 'md';

  /** Visual variant. `error` tints the block for failure output. */
  @property({ type: String, reflect: true })
  variant: CodeHighlighterVariant = 'default';

  /** Hides the copy button. */
  @property({ attribute: 'hide-copy', type: Boolean })
  hideCopy: boolean = false;

  /** Text the copy button copies instead of the displayed code. */
  @property({ attribute: 'copy-value', type: String })
  copyValue?: string;

  /** Renders the code inline, as a compact chip within text. */
  @property({ type: Boolean, reflect: true })
  inline: boolean = false;

  /**
   * Set by `wc-code-group`. The group draws the frame and shows the label as a
   * tab, so the block drops its border and header.
   */
  @property({ type: Boolean, reflect: true })
  grouped: boolean = false;

  /** The code as displayed, after formatting, without a trailing newline. */
  @state() private _code: string = '';

  /** Tokens per line, or `null` until highlighting finishes. */
  @state() private _tokens: ThemedToken[][] | null = null;

  /** Whether the copy button shows its copied feedback. */
  @state() private _copied = false;

  /** Whether the collapsed code is taller than the collapsed height. */
  @state() private _overflowing = false;

  // ── Queries ───────────────────────────────────────────────────────────────

  @query('.content') private __content?: HTMLElement;

  @query('.code') private __codeElement?: HTMLElement;

  // ── Private fields ────────────────────────────────────────────────────────

  /** Source read from `value` or the light DOM, before formatting. */
  private __source = '';

  /** Line variants keyed by 1-based line number. */
  private __lineVariants = new Map<number, LineVariant>();

  /** Increments per highlight run so stale async results are dropped. */
  private __run = 0;

  /** Timer that resets the copy feedback. */
  private __copyFeedbackTimeout: number | null = null;

  /** Measures whether collapsed code overflows. */
  private __resizeObserver?: ResizeObserver;

  /** Element currently measured by the resize observer. */
  private __observedContent?: HTMLElement;

  /** Re-renders when slotted header content is added or removed. */
  private __childObserver?: MutationObserver;

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

  protected willUpdate(changed: PropertyValues<this>) {
    if (
      !this.hasUpdated ||
      changed.has('value') ||
      changed.has('language') ||
      changed.has('format') ||
      changed.has('inline')
    ) {
      this.__source = this.__readSource();
      this._code = splitLines(this.__source).join('\n');
      this._tokens = null;
      this.__highlight();
    }

    if (
      !this.hasUpdated ||
      changed.has('highlightLines') ||
      changed.has('addedLines') ||
      changed.has('removedLines')
    ) {
      this.__lineVariants = buildLineVariants({
        highlighted: this.highlightLines,
        added: this.addedLines,
        removed: this.removedLines,
      });
    }
  }

  protected updated() {
    // The resize observer measures overflow after layout, including when
    // collapsing or expanding changes the code area's height.
    if (this.__content !== this.__observedContent) {
      this.__observeContent();
    }
  }

  // ── Private methods ───────────────────────────────────────────────────────

  /** Reads the source from `value`, or from the light DOM. */
  private __readSource(): string {
    if (this.value) return this.value;
    const codeTag = this.querySelector('code');
    if (codeTag) return dedent(decodeEntities(codeTag.innerHTML));
    const text = Array.from(this.childNodes)
      .filter(node => node.nodeType === Node.TEXT_NODE)
      .map(node => node.textContent ?? '')
      .join('');
    return dedent(text);
  }

  /** Formats then tokenizes the source; plain lines stay until both finish. */
  private async __highlight() {
    this.__run += 1;
    const run = this.__run;
    const { language } = this;
    let code = this.__source;

    if (this.format && !this.inline) {
      try {
        code = await formatCode(code, language);
      } catch {
        // Invalid code cannot be formatted; show it as written.
      }
      if (run !== this.__run) return;
      this._code = splitLines(code).join('\n');
    }

    try {
      const tokens = await tokenize(this._code, language);
      if (run === this.__run) this._tokens = tokens;
    } catch {
      // Unknown language: keep the plain lines.
    }
  }

  /** Watches the code area so the show more button appears only when needed. */
  private __observeContent() {
    this.__resizeObserver?.disconnect();
    this.__observedContent = this.__content;
    if (!this.__content || typeof ResizeObserver === 'undefined') return;
    this.__resizeObserver ??= new ResizeObserver(() => this.__measure());
    this.__resizeObserver.observe(this.__content);
    if (this.__codeElement) this.__resizeObserver.observe(this.__codeElement);
  }

  /** Checks whether the collapsed code is taller than its cap. */
  private __measure() {
    const content = this.__content;
    if (!content || !this.collapsible) {
      this._overflowing = false;
      return;
    }
    if (this.expanded) return;
    this._overflowing = content.scrollHeight > content.clientHeight + 1;
  }

  /** Whether light-DOM children are assigned to the named slot. */
  private __hasSlotted(name: string): boolean {
    return Array.from(this.children).some(
      child => child.getAttribute('slot') === name,
    );
  }

  private async __handleCopyClick() {
    const value = this.copyValue ?? this._code;
    await copyToClipboard(value);
    this._copied = true;
    this.dispatchEvent(
      new CustomEvent('copied', {
        detail: { value },
        bubbles: true,
        composed: true,
      }),
    );

    if (this.__copyFeedbackTimeout !== null) {
      window.clearTimeout(this.__copyFeedbackTimeout);
    }
    this.__copyFeedbackTimeout = window.setTimeout(() => {
      this._copied = false;
      this.__copyFeedbackTimeout = null;
    }, CodeHighlighter.COPY_FEEDBACK_DURATION);
  }

  private __handleWrapClick() {
    this.wrap = !this.wrap;
  }

  private __handleExpandClick() {
    this.expanded = !this.expanded;
    if (!this.expanded && this.__content) this.__content.scrollTop = 0;
    this.dispatchEvent(
      new CustomEvent('expanded-change', {
        detail: { expanded: this.expanded },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // ── Render helpers ────────────────────────────────────────────────────────

  // eslint-disable-next-line class-methods-use-this
  private __renderToken(token: ThemedToken) {
    const fontStyle = token.fontStyle ?? 0;
    if (!token.color && fontStyle <= 0) return token.content;
    return html`<span
      class=${classMap({
        italic: hasFontFlag(fontStyle, FONT_ITALIC),
        bold: hasFontFlag(fontStyle, FONT_BOLD),
        underline: hasFontFlag(fontStyle, FONT_UNDERLINE),
        strikethrough: hasFontFlag(fontStyle, FONT_STRIKETHROUGH),
      })}
      style=${styleMap({ color: token.color })}
      >${token.content}</span
    >`;
  }

  private __renderLine(line: string, index: number) {
    const tokens = this._tokens?.[index];
    const variant = this.__lineVariants.get(index + 1);
    let content: unknown = line;
    if (line === '') content = '\n';
    else if (tokens) content = tokens.map(token => this.__renderToken(token));
    // No whitespace between tags: this renders inside <pre>.
    return html`<span
      class="line"
      part="line"
      data-variant=${variant ?? nothing}
      ><span class="line-content">${content}</span></span
    >`;
  }

  private __renderActions(floating: boolean) {
    return html`
      <div class=${classMap({ actions: true, floating })} part="actions">
        <slot name="actions"></slot>
        ${this.wrapToggle
          ? html`<wc-icon-button
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
          : nothing}
        ${this.hideCopy
          ? nothing
          : html`<wc-icon-button
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

  private __renderHeader() {
    return html`
      <div class="header" part="header">
        <slot name="icon"></slot>
        <div class="title" part="title">
          <slot name="title">${this.label}</slot>
        </div>
        ${this.__renderActions(false)}
      </div>
    `;
  }

  private __renderFooter() {
    return html`
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
            class=${classMap({ 'expand-icon': true, flipped: this.expanded })}
            name="keyboard_arrow_down"
          ></wc-icon>
          ${this.expanded ? locale.showLess : locale.showMore}
        </wc-button>
      </div>
    `;
  }

  private __renderInline() {
    const lines = splitLines(this._code);
    return html`<code class="inline" part="content"
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
    if (this.inline) return this.__renderInline();

    const lines = splitLines(this._code);
    const hasHeader =
      !this.grouped && (!!this.label || this.__hasSlotted('title'));
    const hasActions =
      !this.hideCopy || this.wrapToggle || this.__hasSlotted('actions');
    const showFooter = this.collapsible && (this._overflowing || this.expanded);
    const collapsed = this.collapsible && !this.expanded;

    return html`
      <div
        class=${classMap({
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
        ${hasHeader ? this.__renderHeader() : nothing}
        ${!hasHeader && hasActions ? this.__renderActions(true) : nothing}
        <pre
          class="content"
          part="content"
          dir="ltr"
          tabindex="0"
        ><code class="code" style=${styleMap({
          counterReset: `line ${this.startLine - 1}`,
        })}>${lines.map((line, index) =>
          this.__renderLine(line, index),
        )}</code></pre>
        ${showFooter ? this.__renderFooter() : nothing}
        <span class="sr-only" aria-live="polite"
          >${this._copied ? locale.copiedCode : ''}</span
        >
      </div>
    `;
  }
}
