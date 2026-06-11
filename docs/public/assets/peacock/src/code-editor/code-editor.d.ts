import BaseInput from '../input/BaseInput.js';
/**
 * @label Code Editor
 * @tag wc-code-editor
 * @rawTag code-editor
 *
 * @summary A Monaco-based code editing component with syntax highlighting and theming.
 * @overview
 *  - CodeEditor wraps Monaco Editor as a web component.
 *  - Supports JS/JSON/HTML languages, read-only mode, line numbers, minimap, and dark/light theme.
 *  - Emits `change` when content is edited and updates value from property changes.
 *
 * @example
 * ```html
 * <wc-code-editor
 *   language="javascript"
 *   style="width: 100%; --code-editor-height: 10rem;"
 *   value="function hello() { console.log('Hello'); }"
 *   lineNumbers="on"
 *   minimap="false">
 * </wc-code-editor>
 * ```
 * @tags input, editor
 */
export default class CodeEditor extends BaseInput {
    static styles: import("lit").CSSResultGroup[];
    name: string;
    value: string;
    language: 'javascript' | 'json' | 'html';
    libSource: any;
    lineNumbers: 'off' | 'on';
    minimap: boolean;
    private _isDarkMode;
    private hasFocus;
    private editorMonacoInstance?;
    private editorElement;
    monaco: any;
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected firstUpdated(): void;
    protected updated(changedProperties: any): void;
    private libSourceChanged;
    private getTheme;
    initializeMonaco(): Promise<void>;
    setFocus(): Promise<void>;
    setBlur(): Promise<void>;
    render(): import("lit-html").TemplateResult<1>;
}
