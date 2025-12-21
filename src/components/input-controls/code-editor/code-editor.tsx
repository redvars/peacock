import {
  Component,
  ComponentInterface,
  Element,
  Event,
  EventEmitter,
  h,
  Host,
  Method,
  Prop,
  State,
  Watch,
} from '@stencil/core';
import {
  debounceEvent,
  getComponentIndex,
  isDarkMode,
  isInViewport,
  observeThemeChange,
} from '../../../utils/utils';
import loadMonaco from '../../../3d-party/monaco';

/**
 * @name Code Editor
 * @description A browser based code editor.
 * @category Form Inputs
 * @tags input, form
 * @img /assets/img/code-editor.webp
 * @imgDark /assets/img/code-editor-dark.webp
 */
@Component({
  tag: 'goat-code-editor',
  styleUrl: 'code-editor.scss',
  shadow: true,
})
export class CodeEditor implements ComponentInterface, InputComponentInterface {
  gid: string = getComponentIndex();

  /**
   * The input field name.
   */
  @Prop() name: string = `pc-input-${this.gid}`;

  /**
   * The input field value.
   */
  @Prop({ mutable: true }) value: string;

  /**
   * If true, required icon is show. Defaults to `false`.
   */
  @Prop({ reflect: true }) required: boolean = false;

  /**
   * If true, the user cannot interact with the button. Defaults to `false`.
   */
  @Prop({ reflect: true }) disabled: boolean = false;

  @Prop({ reflect: true }) readonly: boolean = false;

  @Prop() language: 'javascript' | 'json' | 'html' = 'javascript';

  @Prop() libSource: any;

  @Prop() lineNumbers: 'off' | 'on' = 'on';

  @Prop() minimap: boolean = false;

  @State() isDarkMode: boolean = isDarkMode();

  /**
   * Emitted when the value has changed.
   */
  @Event({ eventName: 'goat-code-editor--change' }) goatChange: EventEmitter;

  /**
   * Set the amount of time, in milliseconds, to wait to trigger the `onChange` event after each keystroke.
   */
  @Prop() debounce = 250;

  @State() hasFocus = false;

  @Watch('debounce')
  protected debounceChanged() {
    this.goatChange = debounceEvent(this.goatChange, this.debounce);
  }

  @Watch('libSource')
  protected libSourceChanged() {
    if (window['monaco']) {
      const libModel = window['monaco'].editor.getModel(
        'java://goatui.com/lib.java',
      );
      if (libModel) {
        libModel.dispose();
      }
      window['monaco'].editor.createModel(
        this.libSource,
        this.language,
        'java://goatui.com/lib.java',
      );
    }
  }

  @Watch('disabled')
  disabledWatcher(newValue: boolean) {
    this.editorMonacoInstance.updateOptions({
      readOnly: newValue || this.readonly,
    });
  }

  @Watch('readonly')
  readonlyWatcher(newValue: string) {
    this.editorMonacoInstance.updateOptions({
      readOnly: newValue || this.disabled,
    });
  }

  @Watch('language')
  languageWatcher(newValue: string) {
    window['monaco'].editor.setModelLanguage(
      this.editorMonacoInstance.getModel(),
      newValue,
    );
  }

  themeWatcher() {
    window['monaco'].editor.setTheme(this.getTheme());
  }

  @Watch('value')
  valueWatcher(newValue: string) {
    if (
      this.editorMonacoInstance &&
      this.editorMonacoInstance.getValue() !== this.value
    ) {
      this.editorMonacoInstance.setValue(newValue);
    }
  }

  @Method()
  async getComponentId() {
    return this.gid;
  }

  /**
   * Sets focus on the native `input` in `pc-input`. Use this method instead of the global
   * `input.focus()`.
   */
  @Method()
  async setFocus() {
    if (this.editorMonacoInstance) {
      this.editorMonacoInstance.focus();
    }
  }

  /**
   * Sets blur on the native `input` in `pc-input`. Use this method instead of the global
   * `input.blur()`.
   */
  @Method()
  async setBlur() {
    if (this.editorMonacoInstance) {
      this.editorMonacoInstance.blur();
    }
  }

  @Element() elm!: HTMLElement;
  private editorElement?: HTMLElement;
  @State() editorMonacoInstance: any;

  componentWillLoad() {
    this.debounceChanged();
    observeThemeChange(() => {
      this.isDarkMode = isDarkMode();
      this.themeWatcher();
    });
  }

  componentDidLoad() {
    this.initializeMonaco();
  }

  getTheme() {
    let theme: string;
    if (!this.isDarkMode) {
      theme = 'vs';
    } else {
      theme = 'vs-dark';
    }
    return theme;
  }

  async initializeMonaco() {
    if (!window['monaco']) {
      await loadMonaco();
    }
    //monaco.languages.typescript.javascriptDefaults.addExtraLib(this.extraLibs);
    if (!isInViewport(this.elm)) {
      setTimeout(() => this.initializeMonaco(), 300);
      return;
    }
    this.editorElement.innerHTML = '';

    this.editorMonacoInstance = window['monaco'].editor.create(
      this.editorElement,
      {
        value: this.value,
        lineNumbers: this.lineNumbers,
        language: this.language,
        minimap: {
          enabled: this.minimap,
        },
        theme: this.getTheme(),
        readOnly: this.disabled || this.readonly,
      },
    );

    if (this.libSource) {
      window['monaco'].editor.createModel(
        this.libSource,
        this.language,
        'java://goatui.com/lib.java',
      );
    }

    this.editorMonacoInstance.onDidChangeModelContent(e => {
      if (!e.isFlush) {
        this.value = this.editorMonacoInstance.getValue();
        this.goatChange.emit({ value: this.value });
      }
    });

    this.editorMonacoInstance.onDidFocusEditorText(() => {
      this.hasFocus = true;
    });

    this.editorMonacoInstance.onDidBlurEditorText(() => {
      this.hasFocus = false;
    });
  }

  render() {
    return (
      <Host>
        <div
          class={{
            'component': true,
            'code-editor-component': true,
            [this.getTheme()]: true,
            'disabled': this.disabled,
            'readonly': this.readonly,
            'has-focus': this.hasFocus,
          }}
        >
          {this.disabled || this.readonly ? (
            <pc-tag class="read-only-tag" color="red">
              Read Only
            </pc-tag>
          ) : null}

          <div class="editor" ref={el => (this.editorElement = el)} />
          {!this.editorMonacoInstance && (
            <div class="code-editor-loader">
              <goat-spinner />
              Loading editor...
            </div>
          )}
        </div>
      </Host>
    );
  }
}
