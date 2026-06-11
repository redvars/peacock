import { LitElement } from 'lit';
import type { BundledLanguage } from 'shiki';
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
export declare class CodeHighlighter extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    private static readonly COPY_FEEDBACK_DURATION;
    language: BundledLanguage;
    lineNumbers: boolean;
    value: string;
    format?: boolean;
    hideCopy: boolean;
    private compiledCode;
    private _copied;
    private parsedCode;
    private _copyFeedbackTimeout;
    connectedCallback(): Promise<void>;
    disconnectedCallback(): void;
    firstUpdated(): void;
    private decode;
    private __highlightCode;
    protected updated(changed: Map<PropertyKey, unknown>): void;
    private __handleCopyClick;
    render(): import("lit-html").TemplateResult<1>;
}
