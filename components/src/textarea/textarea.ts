import { html } from 'lit';
import { property, query, state } from 'lit/decorators.js';

import { redispatchEvent } from '@/__utils/dispatch-event-utils.js';
import { spread } from '@/__directive/spread.js';

import BaseInput from '../input/BaseInput.js';
import styles from './textarea.scss';

/**
 * @label Textarea
 * @tag wc-textarea
 * @rawTag textarea
 * @summary The Textarea component is used to capture user input.
 * @tags input
 *
 * @example
 * ```html
 * <wc-textarea label="Description" placeholder="Enter text"></wc-textarea>
 * ```
 */
export class Textarea extends BaseInput {
  static styles = [styles];

  @property({ type: String })
  value = '';

  @property({ type: String })
  name: string = '';

  @property({ type: String }) placeholder = '';

  @property({ type: String }) label = '';

  @property({ type: Boolean, reflect: true }) inline = false;

  @property({ type: String, reflect: true }) size: 'sm' | 'md' | 'lg' = 'md';

  @property({ type: String }) autocomplete: 'on' | 'off' = 'off';

  @property({ type: Object }) configAria: Record<string, string> = {};

  @property({ type: String })
  variant: 'filled' | 'outlined' | 'default' = 'default';

  /**
   * Helper text to display below the input.
   */
  @property({ type: String, attribute: 'helper-text' })
  helperText: string = '';

  @property({ type: Boolean })
  error: boolean = false;

  @property({ type: String, attribute: 'error-text' })
  errorText: string = '';

  @property({ type: Boolean })
  warning: boolean = false;

  @property({ type: String, attribute: 'warning-text' })
  warningText: string = '';

  @property({ type: String }) rows = '3';

  @state()
  private focused = false;

  @state()
  private passwordVisible = false;

  /**
   * Returns true when the text field has been interacted with. Native
   * validation errors only display in response to user interactions.
   */
  @state() private dirty = false;

  @query('.input-element')
  private inputElement?: HTMLInputElement;

  private tabindex?: string;

  connectedCallback() {
    super.connectedCallback();
    this.handleInitialAttributes();
  }

  private handleInitialAttributes() {
    if (this.hasAttribute('tabindex')) {
      this.tabindex = this.getAttribute('tabindex') || undefined;
      this.removeAttribute('tabindex');
    }

    Array.from(this.attributes).forEach(attr => {
      if (attr.name.startsWith('aria-')) {
        this.configAria[attr.name] = attr.value;
        this.removeAttribute(attr.name);
      }
    });
  }

  private __handleInput(event: InputEvent) {
    this.dirty = true;
    this.value = (event.target as HTMLInputElement).value;
  }

  override focus() {
    this.inputElement?.focus();
  }

  override blur() {
    this.inputElement?.blur();
  }

  private __handleFocusChange() {
    // When calling focus() or reportValidity() during change, it's possible
    // for blur to be called after the new focus event. Rather than set
    // `this.focused` to true/false on focus/blur, we always set it to whether
    // or not the input itself is focused.
    this.focused = this.inputElement?.matches(':focus') ?? false;
  }

  private __redispatchEvent(event: Event) {
    redispatchEvent(this, event);
  }

  render() {
    return html`
      <wc-field
        ?required=${this.required}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        ?skeleton=${this.skeleton}
        helper-text=${this.helperText}
        ?error=${this.error}
        error-text=${this.errorText}
        ?warning=${this.warning}
        variant=${this.variant}
        ?populated=${!!this.value}
        warning-text=${this.warningText}
        label=${this.label}
        ?focused=${this.focused}
        .host=${this}
        class="input-wrapper textarea"
      >
        <slot name="start" slot="field-start"></slot>

        <textarea
          class="input input-element"
          rows=${this.rows}
          name=${this.name}
          placeholder=${this.placeholder}
          autocomplete=${this.autocomplete}
          .value=${this.value}
          ?tabindex=${this.tabindex}
          ?readonly=${this.readonly}
          ?required=${this.required}
          ?disabled=${this.disabled}
          @input=${this.__handleInput}
          @change=${this.__redispatchEvent}
          @focus=${this.__handleFocusChange}
          @blur=${this.__handleFocusChange}
          ${spread(this.configAria)}
        ></textarea>

        <slot name="end" slot="field-end"></slot>
      </wc-field>
    `;
  }
}
