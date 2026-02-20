import { html, LitElement, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './field.scss';
import { observerSlotChangesWithCallback } from '../../utils.js';

export class Field extends LitElement {
  static styles = [styles];

  @property({ type: String })
  label: string = '';

  @property({ type: String })
  help: string = '';

  @property({ type: Boolean })
  required: boolean = false;

  @property({ type: Boolean, reflect: true })
  disabled: boolean = false;

  @property({ type: Boolean, reflect: true })
  readonly: boolean = false;

  @property({ type: Boolean })
  skeleton: boolean = false;

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

  @property({ type: String, attribute: 'text-count' })
  textCount: string = '';

  @property({ type: Boolean })
  focused: boolean = false;

  @property({ type: Boolean })
  populated: boolean = false;

  @property({ type: String })
  variant: 'filled' | 'outlined' | 'default' = 'default';

  @property({ type: Object })
  host?: HTMLElement;

  @state()
  slotStartHasContent: boolean = false;

  @state()
  slotEndHasContent: boolean = false;

  firstUpdated() {
    observerSlotChangesWithCallback(
      this.renderRoot.querySelector('.slot-start-wrapper slot'),
      hasContent => {
        this.slotStartHasContent = hasContent;
        this.requestUpdate();
      },
    );
    observerSlotChangesWithCallback(
      this.renderRoot.querySelector('.slot-end-wrapper slot'),
      hasContent => {
        this.slotEndHasContent = hasContent;
        this.requestUpdate();
      },
    );
  }

  __handleClick() {
    // @ts-ignore
    this.host?.focus?.();
  }

  __renderInputSlot() {
    if (this.variant === 'outlined') {
      if (this.populated || this.focused) return html`<slot></slot>`;
      return html`
        <label class="outlined-label">${this.label}</label>
        <div class="outlined-slot-container">
          <slot></slot>
        </div>
      `;
    }
    return html`<slot></slot>`;
  }

  __renderFieldHeader() {
    if (!this.label) return nothing;
    if (this.variant === 'outlined' && !this.populated && !this.focused) {
      return nothing;
    }
    return html`<div class="field-header">
      <label class="label">
        ${this.label}${this.required
          ? html`<span class="required">*</span>`
          : nothing}
        <p-skeleton class="skeleton"></p-skeleton>
      </label>
    </div>`;
  }

  render() {
    const classes = {
      field: true,
      required: this.required,
      disabled: this.disabled,
      'show-skeleton': this.skeleton,
      'has-error': this.error,
      'has-warning': this.warning,
      focused: this.focused,
      readonly: this.readonly,
      [`variant-${this.variant}`]: true,
      populated: this.populated,
    };

    return html`
      <div class=${classMap(classes)}>
        ${this.__renderFieldHeader()}

        <div class="field-body" @click=${this.__handleClick}>
          <div class="outline"></div>
          <div class="background"></div>
          <p-skeleton class="skeleton"></p-skeleton>

          <div class="field-content">
            <div
              class=${classMap({
                'slot-start-wrapper': true,
                'has-content': this.slotStartHasContent,
              })}
            >
              <slot name="field-start"></slot>
            </div>

            <div class="input-wrapper">${this.__renderInputSlot()}</div>

            <div
              class=${classMap({
                'slot-end-wrapper': true,
                'has-content': this.slotEndHasContent,
              })}
            >
              <slot name="field-end"></slot>
            </div>
          </div>
        </div>

        ${this.__renderFieldFooter()}
      </div>
    `;
  }

  __renderFieldFooter() {
    if (
      !this.textCount &&
      !this.helperText &&
      !this.errorText &&
      !this.warningText
    )
      return nothing;
    return html`<div class="field-footer">
      ${this.__renderHelperText()} ${this.__renderWordCount()}
    </div>`;
  }

  __renderHelperText() {
    if (this.error) return html`<div class="helper">${this.errorText}</div>`;
    if (this.warning)
      return html`<div class="helper">${this.warningText}</div>`;
    if (this.helperText || this.helperText === '')
      return html`<div class="helper">${this.helperText}</div>`;
    return nothing;
  }

  __renderWordCount() {
    if (!this.textCount) return nothing;
    return html`<div class="text-count">${this.textCount}</div>`;
  }
}
