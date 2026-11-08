import { LitElement, PropertyValues } from 'lit';
import type { BundledLanguage, SpecialLanguage } from 'shiki';
import type { PeacockStrings } from '../__internal/i18n/strings.js';
export type CodeHighlighterLanguage = BundledLanguage | SpecialLanguage;
export type CodeHighlighterSize = 'sm' | 'md';
export type CodeHighlighterVariant = 'default' | 'error';
/**
 * @label Code Highlighter
 * @tag wc-code-highlighter
 * @rawTag code-highlighter
 *
 * @summary A read-only block of code with syntax highlighting, line numbers, line highlights, diffs and a copy button.
 *
 * @overview
 * <p>Give the code as <code>value</code>, or as a <code>&lt;pre&gt;&lt;code&gt;</code> in the light
 * DOM, and its <code>language</code>; unknown languages render as plain text. JavaScript, HTML and
 * CSS are formatted with Prettier first unless <code>format="false"</code>. The code is shown as
 * written for people to read and copy; to let them edit it use <code>wc-code-editor</code>. Several
 * blocks shown as tabs go in a <code>wc-code-group</code>.</p>
 * <ul>
 * <li><code>label</code> or the <code>title</code> slot shows a header, with an optional
 * <code>icon</code> slot and the actions.</li>
 * <li><code>line-numbers</code> and <code>start-line</code> number the lines;
 * <code>highlight-lines</code>, <code>added-lines</code> and <code>removed-lines</code> mark lines
 * by number or range, such as <code>"1, 3-5"</code>, counted after formatting.</li>
 * <li><code>wrap</code> wraps long lines, and <code>wrap-toggle</code> adds a button to turn wrapping
 * on and off.</li>
 * <li><code>collapsible</code> caps the height and adds a show more button, with
 * <code>aria-expanded</code>, when the code is taller; it fires <code>expanded-change</code>.</li>
 * <li>The copy button copies the code, or <code>copy-value</code>, and fires <code>copied</code>
 * or <code>copy-error</code>; <code>hide-copy</code> removes it. More buttons go in the
 * <code>actions</code> slot.</li>
 * <li><code>inline</code> renders the code as a compact chip within text; <code>size="sm"</code>
 * suits dense layouts and <code>variant="error"</code> tints the block for failure output.</li>
 * </ul>
 * <p>The code area is always left to right and is focusable, so keyboard users can scroll it.</p>
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
 * @fires {CustomEvent<{value: string}>} copied - Dispatched by the copy button (`wc-copy-button`) after it copies the code.
 * @fires {CustomEvent<{value: string, error: unknown}>} copy-error - Dispatched by the copy button when the code could not be copied.
 * @fires {CustomEvent<{expanded: boolean}>} expanded-change - Dispatched when a collapsible block is expanded or collapsed.
 *
 * @tags display
 */
export declare class CodeHighlighter extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /** Language of the code. Unknown languages render as plain text. */
    language: CodeHighlighterLanguage;
    /** Code to display. When empty, the code is read from a light-DOM `<pre><code>`. */
    value: string;
    /**
     * Formats JavaScript, HTML and CSS with Prettier before display.
     * Set `format="false"` to show the code as written.
     */
    format: boolean;
    /** Header title, such as a file path. Shows the header. */
    label: string;
    /** Shows line numbers. */
    lineNumbers: boolean;
    /** Number of the first line when line numbers are shown. */
    startLine: number;
    /** Wraps long lines instead of scrolling horizontally. */
    wrap: boolean;
    /** Shows a button that turns line wrapping on and off. */
    wrapToggle: boolean;
    /** Lines to highlight, such as `"1, 3-5"`. Counts displayed lines, after formatting. */
    highlightLines: string;
    /** Lines shown as added in a diff, such as `"4-6"`. */
    addedLines: string;
    /** Lines shown as removed in a diff, such as `"3"`. */
    removedLines: string;
    /** Caps the height and adds a show more button when the code is taller. */
    collapsible: boolean;
    /** Whether a collapsible block is expanded. */
    expanded: boolean;
    /** Size of the block. `sm` suits tool output and dense layouts. */
    size: CodeHighlighterSize;
    /** Visual variant. `error` tints the block for failure output. */
    variant: CodeHighlighterVariant;
    /** Hides the copy button. */
    hideCopy: boolean;
    /** Text the copy button copies instead of the displayed code. */
    copyValue?: string;
    /** Renders the code inline, as a compact chip within text. */
    inline: boolean;
    /**
     * Set by `wc-code-group`. The group draws the frame and shows the label as a
     * tab, so the block drops its border and header.
     */
    grouped: boolean;
    /** Overrides Peacock's strings for this instance only. */
    strings?: Partial<PeacockStrings>;
    /** The code as displayed, after formatting, without a trailing newline. */
    private _code;
    /** Tokens per line, or `null` until highlighting finishes. */
    private _tokens;
    /** Whether the collapsed code is taller than the collapsed height. */
    private _overflowing;
    private __content?;
    private __codeElement?;
    /** Source read from `value` or the light DOM, before formatting. */
    private __source;
    /** Line variants keyed by 1-based line number. */
    private __lineVariants;
    /** Increments per highlight run so stale async results are dropped. */
    private __run;
    /** Peacock's strings for the toolbar and footer. */
    private readonly __i18n;
    /** Measures whether collapsed code overflows. */
    private __resizeObserver?;
    /** Element currently measured by the resize observer. */
    private __observedContent?;
    /** Re-renders when slotted header content is added or removed. */
    private __childObserver?;
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected willUpdate(changed: PropertyValues<this>): void;
    protected updated(): void;
    /** Reads the source from `value`, or from the light DOM. */
    private __readSource;
    /** Formats then tokenizes the source; plain lines stay until both finish. */
    private __highlight;
    /** Watches the code area so the show more button appears only when needed. */
    private __observeContent;
    /** Checks whether the collapsed code is taller than its cap. */
    private __measure;
    /** Whether light-DOM children are assigned to the named slot. */
    private __hasSlotted;
    private __handleWrapClick;
    private __handleExpandClick;
    private __renderToken;
    private __renderLine;
    private __renderActions;
    private __renderHeader;
    private __renderFooter;
    private __renderInline;
    render(): import("lit-html").TemplateResult<1>;
}
