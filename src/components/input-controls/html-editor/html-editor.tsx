import {
  Component,
  ComponentInterface,
  Event,
  EventEmitter,
  h,
  Host,
  Method,
  Prop,
  State,
  Watch
} from '@stencil/core';
import { debounceEvent, getComponentIndex } from '../../../utils/utils';
import { Editor, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Mention from '@tiptap/extension-mention';
import * as beautify from 'js-beautify/js';
import { computePosition, offset } from '@floating-ui/dom';

/**
 * @name HTML Editor
 * @description HTML Editor component is a WYSIWYG editor that allows users to edit HTML content.
 * @category Form Inputs
 * @tags input, form
 * @img /assets/img/html-editor.webp
 * @imgDark /assets/img/html-editor-dark.webp
 */
@Component({
  tag: 'goat-html-editor',
  styleUrl: 'html-editor.scss',
  shadow: true,
})
export class HtmlEditor implements ComponentInterface, InputComponentInterface {
  gid: string = getComponentIndex();

  /**
   * The input field name.
   */
  @Prop() name: string = `goat-input-${this.gid}`;

  /**
   * The input field value.
   */
  @Prop({ mutable: true }) value: string;

  @Prop({ reflect: true }) layer?: 'background' | '01' | '02';

   /**
    * The input field placeholder.
    */
  @Prop() placeholder: string;

  /**
   * If true, required icon is show. Defaults to `false`.
   */
  @Prop({ reflect: true }) required: boolean = false;

  @Prop({ reflect: true }) suggestionCharacter = '@';

  @Prop({ reflect: true }) showSuggestionCharacter: boolean = true;

  /**
   * If true, the user cannot interact with the button. Defaults to `false`.
   */
  @Prop({ reflect: true }) disabled: boolean = false;

  @Prop({ reflect: true }) readonly: boolean = false;

  @Prop() theme: 'vs-light' | 'vs-dark' = 'vs-light';

  @Prop() lineNumbers: 'off' | 'on' = 'on';

  @Prop() showToolbar: boolean = true;

  @Prop({mutable: true}) mentions: { label: string; value: string }[] = [];

  @Prop() mentionsSearch: 'contains' | 'managed' = 'contains';

  /**
   * Emitted when the value has changed..
   */
  @Event({ eventName: 'goat-html-editor--change' }) goatChange: EventEmitter;

   /**
    * Emitted when a keyboard input occurred.
    */
  @Event({ eventName: 'goat-html-editor--search' }) goatSearch: EventEmitter;

  /**
   * Set the amount of time, in milliseconds, to wait to trigger the `onChange` event after each keystroke.
   */
  @Prop() debounce = 250;

  @State() hasFocus = false;

  @State()
  filteredMentionValues: string[] = [];

  @State()
  showDropdown: boolean = false;

  @Watch('debounce')
  protected debounceChanged() {
    this.goatChange = debounceEvent(this.goatChange, this.debounce);
  }

  @Watch('disabled')
  disabledWatcher(newValue: boolean) {
    this.editorInstance.setEditable(!newValue && !this.readonly);
  }

  @Watch('readonly')
  readonlyWatcher(newValue: string) {
    this.editorInstance.setEditable(!newValue && !this.disabled);
  }

  @Watch('theme')
  themeWatcher(newValue: string) {
    window['monaco'].editor.setTheme(newValue);
  }

  @Watch('value')
  valueWatcher(newValue: string) {
    if (
      beautify.html(this.editorInstance.getHTML(), {
        wrap_line_length: 120,
      }) !== this.value
    ) {
      this.editorInstance.commands.setContent(newValue);
    }
  }

  @Method()
  async getComponentId() {
    return this.gid;
  }

  /**
   * Sets focus on the native `input` in `goat-input`. Use this method instead of the global
   * `input.focus()`.
   */
  @Method()
  async setFocus() {
    if (this.editorInstance) {
      this.editorInstance.chain().focus().run();
    }
  }

  /**
   * Sets blur on the native `input` in `goat-input`. Use this method instead of the global
   * `input.blur()`.
   */
  @Method()
  async setBlur() {
    if (this.editorInstance) {
      this.editorInstance.blur();
    }
  }

  private editorElement?: HTMLElement;

  @State()
  editorInstance: any;

  async componentWillLoad() {
    this.debounceChanged();
  }

  componentDidLoad() {
    setTimeout(() => this.initializeEditor(), 1000);
  }

  copiedContent: any = '';

  private initializeEditor() {
    const that = this;

    this.editorElement.innerHTML = '';

    // This sample still does not showcase all CKEditor 5 features (!)
    // Visit https://ckeditor.com/docs/ckeditor5/latest/features/index.html to browse all the features.
    this.editorInstance = new Editor({
      element: this.editorElement,
      extensions: [
        StarterKit,
        Underline,
        TextStyle,
        FontFamily,
        Placeholder.configure({
          // Use a placeholder:
          placeholder: that.placeholder,
          // Use different placeholders depending on the node type:
          // placeholder: ({ node }) => {
          //   if (node.type.name === 'heading') {
          //     return 'What’s the title?'
          //   }
  
          //   return 'Can you add some further context?'
          // },
        }),
        Mention.configure({
          HTMLAttributes: {
            class: 'mention',
          },
          renderHTML({ options, node }) {
            const item = that.getMentionItem(node.attrs.id);
            return [
              'a',
              mergeAttributes(
                {contenteditable: false},
                options.HTMLAttributes,
              ),
              `${that.showSuggestionCharacter ? options.suggestion.char : ''}${item ? item.label : node.attrs.id}`,
            ];
          },
          suggestion: {
            allowSpaces: true,
            char: that.suggestionCharacter,
            items: async function (props) {
              if (that.mentionsSearch == 'managed') {
                return new Promise((resolve) => {
                  that.goatSearch.emit({
                    query: props.query,
                    callback: function(mentions) {
                      that.mentions = mentions;
                      resolve(that.mentions.map(item => item.value));
                    }
                  })
                });
              }

              return that.mentions
                .filter(item =>
                  item.label.toLowerCase().startsWith(props.query.toLowerCase()),
                )
                .map(item => item.value)
                .slice(0, 5);
            },
            render: function () {
              return {
                onStart: props => {
                  that.mentionProps = props;
                  that.queryRange = props.range;
                  that.showDropdown = true;
                  that.filteredMentionValues = props.items;
                  computePosition(props.decorationNode, that.dropdownContent, {
                    placement: 'bottom-start',
                    // Try removing the middleware. The dropdown will
                    // overflow the boundary's edge and get clipped!
                    middleware: [offset(10)],
                  }).then(({ x, y }) => {
                    Object.assign(that.dropdownContent.style, {
                      top: `${y}px`,
                      left: `${x}px`,
                    });
                  });
                },
                onKeyDown(props) {
                  if (props.event.key === 'ArrowDown') {
                    that.dropdownContent.setFocus();
                  } else if (props.event.key === 'Escape') {
                    that.showDropdown = false;
                    that.filteredMentionValues = [];
                    return true;
                  }
                },

                onUpdate: props => {
                  that.filteredMentionValues = props.items;
                  that.queryRange = props.range;
                  computePosition(props.decorationNode, that.dropdownContent, {
                    placement: 'bottom-start',
                    // Try removing the middleware. The dropdown will
                    // overflow the boundary's edge and get clipped!
                    middleware: [offset(10)],
                  }).then(({ x, y }) => {
                    Object.assign(that.dropdownContent.style, {
                      top: `${y}px`,
                      left: `${x}px`,
                    });
                  });
                },
                onExit: () => {
                  that.showDropdown = false;
                  that.filteredMentionValues = [];
                },
              };
            },
          },
        }),
      ],
      content: this.value,
    });

    this.editorInstance.on('update', () => {
      this.value = beautify.html(this.editorInstance.getHTML(), {
        wrap_line_length: 120,
      });

      this.goatChange.emit({ value: this.value });
    });

    this.editorElement.addEventListener('click', e => {
      // Focus the editor when the user clicks anywhere on the editor
      if (this.editorElement == e.target)
        this.editorInstance.commands.focus('end');
    });
  }

  renderToolbar() {
    const actionGroups = [
      {
        actions: [
          {
            icon: 'undo',
            action: () => {
              this.editorInstance.commands.undo();
            },
          },
          {
            icon: 'redo',
            action: () => {
              this.editorInstance.commands.redo();
            },
          },
        ],
      },
      {
        actions: [
          {
            icon: 'text--bold',
            action: () => {
              this.editorInstance.chain().focus().toggleBold().run();
            },
          },
          {
            icon: 'text--italic',
            action: () => {
              this.editorInstance.chain().focus().toggleItalic().run();
            },
          },
          {
            icon: 'text--underline',
            action: () => {
              this.editorInstance.chain().focus().toggleUnderline().run();
            },
          },
        ],
      },
      {
        actions: [
          {
            icon: 'list--bulleted',
            action: () => {
              this.editorInstance.chain().focus().toggleBulletList().run();
            },
          },
          {
            icon: 'list--numbered',
            action: () => {
              this.editorInstance.chain().focus().toggleOrderedList().run();
            },
          },
        ],
      },
    ];
    return (
      <div class="toolbar">
        {actionGroups.map(actionGroup => {
          return (
            <div class={'action-group'}>
              {actionGroup.actions.map(action => {
                return (
                  <goat-button
                    class={'action'}
                    icon={action.icon}
                    color="white"
                    onGoat-button--click={action.action}
                  ></goat-button>
                );
              })}
            </div>
          );
        })}

        {/*<div class={'action-group'}>
              <goat-button
                icon="cut"
                variant="light"
                color="secondary"
                onGoat:click={() => {
                  const from = this.editorInstance.state.selection.from;
                  const to = this.editorInstance.state.selection.to;
                  this.copiedContent =
                    this.editorInstance.state.doc.textBetween(from, to);
                  document.execCommand('cut');
                }}
              ></goat-button>

              <goat-button
                icon="copy"
                variant="light"
                color="secondary"
                onGoat:click={() => {
                  const from = this.editorInstance.state.selection.from;
                  const to = this.editorInstance.state.selection.to;
                  this.copiedContent =
                    this.editorInstance.state.doc.textBetween(from, to);
                  document.execCommand('copy');
                }}
              ></goat-button>

              <goat-button
                icon="paste"
                variant="light"
                color="secondary"
                onGoat:click={() => {
                  this.editorInstance.chain().focus().run();
                  this.editorInstance.commands.insertContent(
                    this.copiedContent,
                  );
                }}
              ></goat-button>
            </div>*/}

        {/* <goat-button
                icon="text--align--left"
                variant="outline"
                color="secondary"
                size={'sm'}
                onGoat:click={() => {
                  // this.editorInstance.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
                }}
              ></goat-button>

              <goat-button
                icon="text--align--center"
                variant="outline"
                color="secondary"
                size={'sm'}
                onGoat:click={() => {
                  // this.editorInstance.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
                }}
              ></goat-button>

              <goat-button
                icon="text--align--right"
                variant="outline"
                color="secondary"
                size={'sm'}
                onGoat:click={() => {
                  //.editorInstance.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
                }}
              ></goat-button> */}
      </div>
    );
  }

  @State()
  showHtml: boolean = false;

  render() {
    return (
      <Host>
        <div
          class={{
            'component': true,
            'code-editor-component': true,
            [this.theme]: true,
            'disabled': this.disabled,
            'readonly': this.readonly,
            'has-focus': this.hasFocus,
          }}
        >
          <div class={{ 'wysiwyg-container': true, 'hidden': this.showHtml }}>
            {!this.readonly && !this.disabled && this.showToolbar && this.renderToolbar()}
            <div class="editor" ref={el => (this.editorElement = el)}></div>
          </div>

          {!this.showHtml && !this.editorInstance && (
            <div class="editor-loader">
              <goat-spinner />
              Loading editor...
            </div>
          )}

          <goat-code-editor
            class={{ 'html-code-editor': true, 'hidden': !this.showHtml }}
            value={this.value}
            readonly={this.readonly}
            disabled={this.disabled}
            language="html"
            onGoat-code-editor--change={evt => {
              this.value = evt.detail.value;
            }}
          ></goat-code-editor>

          {this.showToolbar && <div class={'html-editor-footer'}>
              <div class={'footer-left'}>
                <goat-toggle
                  goat-toggle--change={evt => {
                    this.showHtml = evt.target.value;
                  }}
                >
                  HTML
                </goat-toggle>
              </div>

              <div class={'footer-right'}>
                {this.editorInstance && this.editorInstance.getHTML()?.length}
              </div>
            </div>
          }
        </div>

        <goat-menu
          class={{"mention-menu":true, "show": this.showDropdown}}
          ref={elm => (this.dropdownContent = elm)}
          onGoat-menu-item--click={evt => {
            this.editorInstance.commands.deleteRange(this.queryRange);
            this.mentionProps.command({ id: evt.detail.value });
          }}
        >
          {this.filteredMentionValues.map(value => {
            const item = this.getMentionItem(value);

            return (
              <goat-menu-item value={item.value}>{item.label}</goat-menu-item>
            );
          })}
        </goat-menu>
      </Host>
    );
  }

  getMentionItem(value: string) {
    return this.mentions.find(item => item.value == value);
  }

  mentionProps: any;
  queryRange:any;
  dropdownContent: HTMLGoatMenuElement;
}
