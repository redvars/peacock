import { html, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';

import { redispatchEvent } from '@/__utils/dispatch-event-utils.js';
import { spread } from '@/__directive/spread.js';

import BaseInput from './BaseInput.js';
import styles from './input.scss';

/**
 * @label Input
 * @tag wc-input
 * @rawTag input
 *
 * @summary The Input component is used to capture user input.
 *
 * @example
 * ```html
 * <wc-input label="Name" required placeholder="Enter your name"></wc-input>
 * ```
 */
export class Input extends BaseInput {
  static styles = [styles];

  @property({ type: String })
  value = '';

  @property({ type: String })
  name: string = '';

  @property({ type: String }) placeholder = '';

  @property({ type: String }) label = '';

  @property({ type: Boolean, reflect: true }) inline = false;

  @property({ type: String, reflect: true }) size: 'sm' | 'md' | 'lg' = 'md';

  @property({ type: String }) type: 'text' | 'password' | 'email' | 'tel' =
    'text';

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

  connectedCallback() {
    super.connectedCallback();
    this.handleInitialAttributes();
  }

  private handleInitialAttributes() {
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

  private __handleFocusChange = (event: FocusEvent) => {
    this.focused = event.type === 'focus';
  };

  private __redispatchEvent(event: Event) {
    redispatchEvent(this, event);
  }

  render() {
    const displayType =
      this.type === 'password' && this.passwordVisible ? 'text' : this.type;

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
        class="input-wrapper"
      >
        <slot name="start" slot="field-start"></slot>

        <input
          class="input input-element"
          name=${this.name}
          type=${displayType}
          placeholder=${this.placeholder}
          autocomplete=${this.autocomplete}
          .value=${this.value}
          ?readonly=${this.readonly}
          ?required=${this.required}
          ?disabled=${this.disabled}
          @input=${this.__handleInput}
          @change=${this.__redispatchEvent}
          @focus=${this.__handleFocusChange}
          @blur=${this.__handleFocusChange}
          ${spread(this.configAria)}
        />

        ${this.type === 'password'
          ? html`
              <wc-tooltip
                slot="field-end"
                content=${this.passwordVisible
                  ? 'Hide password'
                  : 'Show password'}
              >
                <wc-icon-button
                  class="password-toggle"
                  variant="text"
                  @click=${() => {
                    this.passwordVisible = !this.passwordVisible;
                  }}
                >
                  <wc-icon
                    name=${this.passwordVisible ? 'visibility_off' : 'visibility'}
                  ></wc-icon>
                </wc-icon-button>
              </wc-tooltip>
            `
          : nothing}

        <slot name="end" slot="field-end"></slot>
      </wc-field>
    `;
  }
}