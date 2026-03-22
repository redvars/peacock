import { html, nothing } from 'lit';
import { property, state, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import {init} from 'modern-monaco';
import PeacockComponent from 'src/PeacockComponent.js';
import BaseInput from '../input/BaseInput.js';
import { observeThemeChange } from '../utils/observe-theme-change.js';
import { redispatchEvent } from '../utils/dispatch-event-utils.js';
import {
  isDarkMode,
} from '../utils.js';

import styles from './code-editor.scss';

/**
 * @label Code Editor
 * @tag wc-code-editor
 * @rawTag code-editor
 * @summary A code editor component using Monaco Editor.
 * @tags input
 *
 * @example
 * ```html
 * <wc-code-editor language="javascript"></wc-code-editor>
 * ```
 */

// At module level, outside the class
// @ts-ignore
// At module level, outside the class
(self as any).MonacoEnvironment = {
  getWorkerUrl(moduleId: string, label: string) {
    const workersDir = new URL('monaco/workers/', import.meta.url);
    switch (label) {
      case 'json':       return `${workersDir}json.worker.js`;
      case 'css':        return `${workersDir}css.worker.js`;
      case 'html':       return `${workersDir}html.worker.js`;
      case 'typescript':
      case 'javascript': return `${workersDir}ts.worker.js`;
      default:           return `${workersDir}editor.worker.js`;
    }
  }
};

/**
 * @label Code Editor
 * @tag code-editor
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
 * <code-editor
 *   language="javascript"
 *   value="function hello() { console.log('Hello'); }"
 *   lineNumbers="on"
 *   minimap="false">
 * </code-editor>
 * ```
 * @tags input, editor
 */
@PeacockComponent
export default class CodeEditor extends BaseInput {

  static styles = [styles];

  @property({ type: String }) 
  name = "";

  @property({ type: String }) 
  value = '';

  @property({ type: String }) 
  language: 'javascript' | 'json' | 'html' = 'javascript';

  @property({ type: Object }) 
  libSource: any;

  @property({ type: String }) 
  lineNumbers: 'off' | 'on' = 'on';

  @property({ type: Boolean }) 
  minimap = false;

  @state() private _isDarkMode: boolean = isDarkMode();

  @state() private hasFocus = false;
  
  // Type the instance correctly using the npm package types
  @state() private editorMonacoInstance?: any;

  @query('.editor') private editorElement!: HTMLElement;

  monaco: any;

  connectedCallback() {
    super.connectedCallback();
    observeThemeChange(() => {
      this._isDarkMode = isDarkMode();
      this.monaco.editor.setTheme(this.getTheme());
    });
  }

  // Cleanup to prevent memory leaks
  disconnectedCallback() {
    super.disconnectedCallback();
    this.editorMonacoInstance?.dispose();
  }

  protected firstUpdated() {
    this.initializeMonaco();
  }

  protected updated(changedProperties: any) {
    if (changedProperties.has('libSource')) this.libSourceChanged();

    if (changedProperties.has('disabled') || changedProperties.has('readonly')) {
      this.editorMonacoInstance?.updateOptions({
        readOnly: this.disabled || this.readonly,
      });
    }

    if (changedProperties.has('value')) {
      if (this.editorMonacoInstance && this.editorMonacoInstance.getValue() !== this.value) {
        this.editorMonacoInstance.setValue(this.value || '');
      }
    }
  } 



  private libSourceChanged() {
    const libUri = 'java://peacock.redvars.com/lib.java';
    const libModel = this.monaco.editor.getModel(this.monaco.Uri.parse(libUri));
    
    if (libModel) libModel.dispose();
    
    if (this.libSource) {
      this.monaco.editor.createModel(
        this.libSource,
        this.language,
        this.monaco.Uri.parse(libUri)
      );
    }
  }


  private getTheme() {
    return this._isDarkMode ? 'github-dark' : 'github-light';
  }

  async initializeMonaco() {
    this.monaco = await init({
  themes: [
    "github-light",
    "github-dark",
  ],
});


    this.editorMonacoInstance = this.monaco.editor.create(this.editorElement, {
      value: this.value,
      lineNumbers: this.lineNumbers,
      language: this.language,
      minimap: { enabled: this.minimap },
      theme: this.getTheme(),
      readOnly: this.disabled || this.readonly
    });


    
    if (this.libSource) {
      this.libSourceChanged();
    }

    this.editorMonacoInstance.onDidChangeModelContent((e: any) => {
      if (!e.isFlush) {
        const newValue = this.editorMonacoInstance!.getValue();
        this.value = newValue;
        redispatchEvent(this, new Event('change', { bubbles: true, composed: true }));
      }
    });

    this.editorMonacoInstance.onDidFocusEditorText(() => {
      this.hasFocus = true;
    });

    this.editorMonacoInstance.onDidBlurEditorText(() => {
      this.hasFocus = false
    });
  }


  async setFocus() { this.editorMonacoInstance?.focus(); }

  async setBlur() { this.editorMonacoInstance?.trigger('keyboard', 'type', ''); /* Focus hack or use blur if available */ }

  render() {
    return html`
    <base-field
        ?required=${this.required}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        ?skeleton=${this.skeleton}
        ?focused=${this.hasFocus}
        .host=${this}
        class="${classMap({
        'code-editor-component': true,
        'disabled': this.disabled,
      })}"
      >
        ${(this.disabled || this.readonly) 
          ? html`<base-tag class="read-only-tag" color="red">Read Only</base-tag>` 
          : nothing
        }
        <div class="editor"></div>
        ${!this.editorMonacoInstance ? html`
          <div class="code-editor-loader">
            <base-spinner></base-spinner> Loading...
          </div>
        ` : nothing}
      </base-field>
    `;
  }
}