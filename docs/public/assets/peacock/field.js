import { i, a as i$1, _ as __decorate, I as IndividualComponent, b, A } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { r } from './state-DkTK9EGF.js';
import { e } from './class-map-DG7CA1et.js';
import { o as observerSlotChangesWithCallback } from './observe-slot-change-DPxaZrZF.js';
import './directive-ZPhl09Yt.js';

var css_248z = i`* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.screen-reader-only {
  display: none !important;
}

[hidden] {
  display: none !important;
}

:host {
  --field-height: unset;
  --field-padding-block: unset;
}

.field {
  position: relative;
  display: flex;
  flex-direction: column;
  --_container-shape-start-start: var(--field-container-shape-start-start, var(--shape-corner-extra-small));
  --_container-shape-start-end: var(--field-container-shape-start-end, var(--shape-corner-extra-small));
  --_container-shape-end-start: var(--field-container-shape-end-start, var(--shape-corner-extra-small));
  --_container-shape-end-end: var(--field-container-shape-end-end, var(--shape-corner-extra-small));
  --_container-color: var(--field-container-color);
  --_outline-width: var(--field-outline-width, 0.0675rem);
  --_outline-color: var(--field-outline-color, var(--color-outline));
  --_input-text-color: var(--field-label-text-color, var(--color-on-surface));
  --_helper-text-color: var(--field-helper-text-color, var(--color-on-surface-variant));
  --_helper-text-opacity: unset;
  --_label-text-color: var(--field-label-text-color, var(--color-primary));
}
.field .field-header {
  display: flex;
  align-items: center;
  margin-block-end: var(--spacing-100);
  justify-content: space-between;
  gap: var(--spacing-100);
}
.field .field-header .label {
  position: relative;
  font-family: var(--typography-body-small-font-family) !important;
  font-size: var(--typography-body-small-font-size) !important;
  font-weight: var(--typography-body-small-font-weight) !important;
  line-height: var(--typography-body-small-line-height) !important;
  letter-spacing: var(--typography-body-small-letter-spacing) !important;
  color: var(--_label-text-color);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.field .field-header .label .required {
  color: var(--color-error);
  padding-inline-start: var(--spacing-025);
}
.field .field-body {
  position: relative;
  display: flex;
  cursor: text;
}
.field .field-body .outline {
  position: absolute;
  z-index: 2;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  border: var(--_outline-width) solid var(--_outline-color);
  opacity: var(--_outline-opacity, 1);
  border-start-start-radius: var(--_container-shape-start-start);
  border-start-end-radius: var(--_container-shape-start-end);
  border-end-start-radius: var(--_container-shape-end-start);
  border-end-end-radius: var(--_container-shape-end-end);
}
.field .field-body .background {
  position: absolute;
  z-index: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background-color: var(--_container-color);
  opacity: var(--_container-opacity, 1);
  border-start-start-radius: var(--_container-shape-start-start);
  border-start-end-radius: var(--_container-shape-start-end);
  border-end-start-radius: var(--_container-shape-end-start);
  border-end-end-radius: var(--_container-shape-end-end);
}
.field .field-body .field-content {
  display: flex;
  align-items: center;
  flex: 1;
  min-height: var(--field-height, 3.5rem);
  padding-block: var(--field-padding-block);
  z-index: 1;
}
.field .field-body .field-content .input-wrapper {
  flex: 1;
  padding-inline: var(--spacing-200);
  position: relative;
}
.field .field-body .field-content .input-wrapper .outlined-label {
  position: absolute;
  top: 0;
  left: 0;
  align-items: center;
  height: 100%;
  width: 100%;
  padding-inline: var(--spacing-200);
  font-family: var(--typography-body-large-font-family) !important;
  font-size: var(--typography-body-large-font-size) !important;
  font-weight: var(--typography-body-large-font-weight) !important;
  line-height: var(--typography-body-large-line-height) !important;
  letter-spacing: var(--typography-body-large-letter-spacing) !important;
  color: var(--_input-text-color);
  background-color: var(--_container-color);
  opacity: var(--_container-opacity, 1);
}
.field .field-body .field-content .input-wrapper .outlined-slot-container {
  opacity: 0;
}
.field .field-body .field-content slot::slotted(*) {
  font-family: var(--typography-body-large-font-family) !important;
  font-size: var(--typography-body-large-font-size) !important;
  font-weight: var(--typography-body-large-font-weight) !important;
  line-height: var(--typography-body-large-line-height) !important;
  letter-spacing: var(--typography-body-large-letter-spacing) !important;
  color: var(--_input-text-color);
  --icon-size: 1.25rem;
  --icon-color: var(--_input-text-color);
}
.field .field-body .field-content slot::slotted(input::placeholder) {
  color: var(--color-on-surface-variant);
}
.field .field-body .field-content .slot-start-wrapper.has-content {
  margin-inline-start: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.field .field-body .field-content .slot-end-wrapper.has-content {
  margin-inline-end: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.field .field-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-200);
  margin-block-start: var(--spacing-050);
  padding-inline: var(--spacing-200);
}
.field .field-footer .helper, .field .field-footer .text-count {
  position: relative;
  font-family: var(--typography-body-large-font-family) !important;
  font-size: var(--typography-body-large-font-size) !important;
  font-weight: var(--typography-body-large-font-weight) !important;
  line-height: var(--typography-body-large-line-height) !important;
  letter-spacing: var(--typography-body-large-letter-spacing) !important;
  color: var(--_helper-text-color);
  opacity: var(--_helper-text-opacity);
}
.field.focused {
  --_outline-color: var(--color-primary);
  --_outline-width: 0.125rem;
}
.field.has-error {
  --_label-text-color: var(--color-error);
  --_outline-color: var(--color-error);
  --_helper-text-color: var(--color-error);
  --_input-text-color: var(--color-error);
}
.field.has-warning {
  --_label-text-color: var(--color-warning);
  --_outline-color: var(--color-warning);
  --_helper-text-color: var(--color-warning);
  --_input-text-color: var(--color-warning);
}
.field.disabled .label {
  opacity: 0.38;
}
.field.disabled {
  --_input-text-color: var(--color-on-surface-variant);
  --_outline-opacity: 0.38;
  --_helper-text-opacity: 0.38;
  --_container-color: var(--color-on-surface);
  --_container-opacity: 0.1;
  cursor: not-allowed;
}
.field.readonly {
  cursor: initial;
  --_input-text-color: var(--color-on-surface-variant);
  --_outline-opacity: 0.38;
  --_helper-text-opacity: 0.38;
  --_container-color: var(--color-on-surface);
  --_container-opacity: 0.38;
}
.field.show-skeleton .skeleton {
  display: block;
}

.skeleton {
  display: none;
  width: 100%;
  height: 100%;
  z-index: 2;
  position: absolute;
  top: 0;
  left: 0;
  --skeleton-container-shape-start-start: var(--_container-shape-start-start);
  --skeleton-container-shape-start-end: var(--_container-shape-start-end);
  --skeleton-container-shape-end-start: var(--_container-shape-end-start);
  --skeleton-container-shape-end-end: var(--_container-shape-end-end);
}`;

/**
 * @label Field
 * @tag wc-field
 * @rawTag field
 *
 * @summary Wrapper for form fields with label and help text.
 * @overview
 * <p>Field provides consistent styling and behavior for form inputs.</p>
 *
 * @example
 * ```html
 * <wc-field label="Name" required>
 *   some text
 * </wc-field>
 * ```
 * @tags form
 */
let Field = class Field extends i$1 {
    constructor() {
        super(...arguments);
        /** Label text shown above the field input. */
        this.label = '';
        /** Help text (deprecated — prefer `helperText`). */
        this.help = '';
        /** When true, marks the field as required and shows a required indicator. */
        this.required = false;
        /** When true, the field and its slotted input are disabled. */
        this.disabled = false;
        /** When true, the field and its slotted input are read-only. */
        this.readonly = false;
        /** When true, renders the field in a loading skeleton state. */
        this.skeleton = false;
        /** Helper/hint text shown in the field footer. */
        this.helperText = '';
        /** When true, the field is in an error state and `errorText` is shown. */
        this.error = false;
        /** Error message displayed when `error` is true. */
        this.errorText = '';
        /** When true, the field is in a warning state and `warningText` is shown. */
        this.warning = false;
        /** Warning message displayed when `warning` is true. */
        this.warningText = '';
        /** Character / word count string displayed at the trailing end of the footer. */
        this.textCount = '';
        /** When true, applies focused styling (controlled externally by the slotted input). */
        this.focused = false;
        /** When true, applies populated styling (controlled externally by the slotted input). */
        this.populated = false;
        /** Visual variant of the field container. */
        this.variant = 'default';
        /** True when the `field-start` slot contains at least one node. */
        this.slotStartHasContent = false;
        /** True when the `field-end` slot contains at least one node. */
        this.slotEndHasContent = false;
    }
    firstUpdated() {
        observerSlotChangesWithCallback(this.renderRoot.querySelector('.slot-start-wrapper slot'), hasContent => {
            this.slotStartHasContent = hasContent;
            this.requestUpdate();
        });
        observerSlotChangesWithCallback(this.renderRoot.querySelector('.slot-end-wrapper slot'), hasContent => {
            this.slotEndHasContent = hasContent;
            this.requestUpdate();
        });
    }
    __handleClick() {
        // @ts-ignore
        this.host?.focus?.();
    }
    __renderInputSlot() {
        if (this.variant === 'outlined') {
            if (this.populated || this.focused)
                return b `<slot></slot>`;
            return b `
        <label class="outlined-label">${this.label}</label>
        <div class="outlined-slot-container">
          <slot></slot>
        </div>
      `;
        }
        return b `<slot></slot>`;
    }
    __renderFieldHeader() {
        if (!this.label)
            return A;
        if (this.variant === 'outlined' && !this.populated && !this.focused) {
            return A;
        }
        return b `<div class="field-header">
      <label class="label">
        ${this.label}${this.required
            ? b `<span class="required">*</span>`
            : A}
        <wc-skeleton class="skeleton"></wc-skeleton>
      </label>
    </div>`;
    }
    __renderFieldFooter() {
        if (!this.textCount &&
            !this.helperText &&
            !this.errorText &&
            !this.warningText)
            return A;
        return b `<div class="field-footer">
      ${this.__renderHelperText()} ${this.__renderWordCount()}
    </div>`;
    }
    __renderHelperText() {
        if (this.error)
            return b `<div class="helper">${this.errorText}</div>`;
        if (this.warning)
            return b `<div class="helper">${this.warningText}</div>`;
        if (this.helperText || this.helperText === '')
            return b `<div class="helper">${this.helperText}</div>`;
        return A;
    }
    __renderWordCount() {
        if (!this.textCount)
            return A;
        return b `<div class="text-count">${this.textCount}</div>`;
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
        return b `
      <div class=${e(classes)}>
        ${this.__renderFieldHeader()}

        <div class="field-body" @click=${this.__handleClick}>
          <div class="outline"></div>
          <div class="background"></div>
          <wc-skeleton class="skeleton"></wc-skeleton>

          <div class="field-content">
            <div
              class=${e({
            'slot-start-wrapper': true,
            'has-content': this.slotStartHasContent,
        })}
            >
              <slot name="field-start"></slot>
            </div>

            <div class="input-wrapper">${this.__renderInputSlot()}</div>

            <div
              class=${e({
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
};
Field.shadowRootOptions = {
    ...i$1.shadowRootOptions,
    delegatesFocus: true,
};
Field.styles = [css_248z];
__decorate([
    n({ type: String })
], Field.prototype, "label", void 0);
__decorate([
    n({ type: String })
], Field.prototype, "help", void 0);
__decorate([
    n({ type: Boolean })
], Field.prototype, "required", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Field.prototype, "disabled", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Field.prototype, "readonly", void 0);
__decorate([
    n({ type: Boolean })
], Field.prototype, "skeleton", void 0);
__decorate([
    n({ type: String, attribute: 'helper-text' })
], Field.prototype, "helperText", void 0);
__decorate([
    n({ type: Boolean })
], Field.prototype, "error", void 0);
__decorate([
    n({ type: String, attribute: 'error-text' })
], Field.prototype, "errorText", void 0);
__decorate([
    n({ type: Boolean })
], Field.prototype, "warning", void 0);
__decorate([
    n({ type: String, attribute: 'warning-text' })
], Field.prototype, "warningText", void 0);
__decorate([
    n({ type: String, attribute: 'text-count' })
], Field.prototype, "textCount", void 0);
__decorate([
    n({ type: Boolean })
], Field.prototype, "focused", void 0);
__decorate([
    n({ type: Boolean })
], Field.prototype, "populated", void 0);
__decorate([
    n({ type: String })
], Field.prototype, "variant", void 0);
__decorate([
    n({ type: Object })
], Field.prototype, "host", void 0);
__decorate([
    r()
], Field.prototype, "slotStartHasContent", void 0);
__decorate([
    r()
], Field.prototype, "slotEndHasContent", void 0);
Field = __decorate([
    IndividualComponent
], Field);

export { Field };
//# sourceMappingURL=field.js.map
