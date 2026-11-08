import { i, a as i$1, _ as __decorate, I as IndividualComponent, A, b } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { r } from './state-BCeDVCI9.js';
import { e } from './query-CHb9Ft_d.js';
import { e as e$1 } from './class-map-NDIkZErE.js';
import { o as observerSlotChangesWithCallback } from './observe-slot-change-DPxaZrZF.js';
import './base-Cl6v8-BZ.js';
import './directive-ZPhl09Yt.js';

var css_248z = i`* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.screen-reader-only {
  position: absolute !important;
  inline-size: 1px !important;
  block-size: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip-path: inset(50%) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

[hidden] {
  display: none !important;
}

@media (forced-colors: active) {
  .selected,
  [aria-selected=true],
  [aria-pressed=true],
  [aria-checked=true],
  [aria-current]:not([aria-current=false]) {
    outline: 2px solid Highlight;
    outline-offset: -2px;
  }
  .disabled,
  [aria-disabled=true] {
    color: GrayText;
  }
}
:host {
  --field-height: unset;
  --field-padding-block: unset;
  --_field-size-height: 2.5rem;
}

:host([size=md]) {
  --_field-size-height: 3.5rem;
}

:host([size=lg]) {
  --_field-size-height: 4rem;
}

.field {
  position: relative;
  display: flex;
  flex-direction: column;
  --_container-shape-start-start: var(--field-container-shape-start-start, var(--shape-corner-extra-small));
  --_container-shape-start-end: var(--field-container-shape-start-end, var(--shape-corner-extra-small));
  --_container-shape-end-start: var(--field-container-shape-end-start, var(--shape-corner-extra-small));
  --_container-shape-end-end: var(--field-container-shape-end-end, var(--shape-corner-extra-small));
  --_container-color: var(--field-container-color, var(--color-surface-container-lowest));
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
  inset-inline-start: 0;
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
  inset-inline-start: 0;
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
  min-width: 0;
  min-height: var(--field-height, calc(var(--_field-size-height) + var(--density, 0) * 0.25rem));
  padding-block: var(--field-padding-block);
  z-index: 1;
}
.field .field-body .field-content .input-wrapper {
  flex: 1;
  min-width: 0;
  padding-inline: var(--spacing-200);
  position: relative;
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
  font-family: var(--typography-body-small-font-family) !important;
  font-size: var(--typography-body-small-font-size) !important;
  font-weight: var(--typography-body-small-font-weight) !important;
  line-height: var(--typography-body-small-line-height) !important;
  letter-spacing: var(--typography-body-small-letter-spacing) !important;
  color: var(--_helper-text-color);
  opacity: var(--_helper-text-opacity);
}
.field.variant-filled {
  --_container-color: var(
    --field-container-color,
    var(--color-surface-container-highest)
  );
  --_outline-color: var(
    --field-active-indicator-color,
    var(--color-on-surface-variant)
  );
  --_outline-width: 0.0625rem;
  --_container-shape-end-start: var(
    --field-container-shape-end-start,
    var(--shape-corner-none)
  );
  --_container-shape-end-end: var(
    --field-container-shape-end-end,
    var(--shape-corner-none)
  );
}
.field.variant-filled .field-body .outline {
  border-width: 0 0 var(--_outline-width);
}
.field.variant-filled:not(.disabled, .readonly, .focused, .has-error, .has-warning) .field-body:hover {
  --_outline-color: var(--color-on-surface);
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
.field.variant-outlined {
  --_container-color: var(--field-container-color, transparent);
  --_outline-width: var(--field-outline-width, 0.0625rem);
  --_label-text-color: var(--field-label-text-color, var(--color-on-surface-variant));
  --_label-motion: var(--duration-short3, 150ms) var(--easing-emphasized, cubic-bezier(0.2, 0, 0, 1));
  --_notch-start: max(
    var(--spacing-150),
    var(--_container-shape-start-start),
    var(--_container-shape-end-start)
  );
  --_notch-padding: var(--spacing-050);
}
.field.variant-outlined.has-label {
  padding-block-start: calc(var(--typography-body-small-line-height) / 2);
}
.field.variant-outlined .field-body .outline {
  display: flex;
  border: none;
  border-radius: 0;
}
.field.variant-outlined .field-body .outline-start,
.field.variant-outlined .field-body .outline-notch,
.field.variant-outlined .field-body .outline-end {
  position: relative;
  border: var(--_outline-width) solid var(--_outline-color);
}
.field.variant-outlined .field-body .outline-start {
  flex: none;
  width: var(--_notch-start);
  border-inline-end: none;
  border-start-start-radius: var(--_container-shape-start-start);
  border-end-start-radius: var(--_container-shape-end-start);
}
.field.variant-outlined .field-body .outline-notch {
  flex: none;
  display: flex;
  max-width: calc(100% - var(--_notch-start) - var(--spacing-200));
  border-block-start: none;
  border-inline: none;
}
.field.variant-outlined .field-body .outline-notch::before {
  content: "";
  position: absolute;
  inset-block-start: 0;
  inset-inline: 0;
  border-block-start: var(--_outline-width) solid var(--_outline-color);
  transition: transform var(--_label-motion);
}
.field.variant-outlined .field-body .outline-notch-label {
  visibility: hidden;
  padding-inline: var(--_notch-padding);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-family: var(--typography-body-small-font-family);
  font-size: var(--typography-body-small-font-size);
  font-weight: var(--typography-body-small-font-weight);
  line-height: var(--typography-body-small-line-height);
  letter-spacing: var(--typography-body-small-letter-spacing);
}
.field.variant-outlined .field-body .outline-end {
  flex: 1;
  border-inline-start: none;
  border-start-end-radius: var(--_container-shape-start-end);
  border-end-end-radius: var(--_container-shape-end-end);
}
.field.variant-outlined .field-body .outlined-label {
  position: absolute;
  z-index: 3;
  inset-block-start: var(--field-label-rest-top, 50%);
  inset-inline-start: calc(var(--_input-start, 0px) + var(--spacing-200));
  max-width: calc(100% - var(--_input-start, 0px) - var(--_input-end, 0px) - 2 * var(--spacing-200));
  transform: translateY(-50%);
  pointer-events: none;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--_label-text-color);
  font-family: var(--typography-body-large-font-family);
  font-size: var(--typography-body-large-font-size);
  font-weight: var(--typography-body-large-font-weight);
  line-height: var(--typography-body-large-line-height);
  letter-spacing: var(--typography-body-large-letter-spacing);
}
.field.variant-outlined .field-body .outlined-label .required {
  color: var(--color-error);
  padding-inline-start: var(--spacing-025);
}
.field.variant-outlined .field-body[data-label-ready] .outlined-label {
  transition: inset-block-start var(--_label-motion), inset-inline-start var(--_label-motion), max-width var(--_label-motion), font-size var(--_label-motion), line-height var(--_label-motion), letter-spacing var(--_label-motion);
}
.field.variant-outlined .field-body .input-wrapper {
  transition: opacity var(--_label-motion);
}
.field.variant-outlined.has-label:not(.label-floating) .field-body .input-wrapper {
  opacity: 0;
}
.field.variant-outlined.has-label.label-floating .field-body .outline-notch::before {
  transform: scaleX(0);
}
.field.variant-outlined.has-label.label-floating .field-body .outlined-label {
  inset-block-start: 0;
  inset-inline-start: calc(var(--_notch-start) + var(--_notch-padding));
  max-width: calc(100% - var(--_notch-start) - 2 * var(--_notch-padding) - var(--spacing-200));
  font-family: var(--typography-body-small-font-family);
  font-size: var(--typography-body-small-font-size);
  font-weight: var(--typography-body-small-font-weight);
  line-height: var(--typography-body-small-line-height);
  letter-spacing: var(--typography-body-small-letter-spacing);
}
.field.variant-outlined:not(.disabled, .readonly, .focused) .field-body:hover {
  --_outline-color: var(--color-on-surface);
  --_label-text-color: var(--color-on-surface);
}
.field.variant-outlined.focused {
  --_outline-width: 0.125rem;
  --_label-text-color: var(--color-primary);
}
.field.variant-outlined.has-error {
  --_label-text-color: var(--color-error);
  --_input-text-color: var(--color-on-surface);
}
.field.variant-outlined.has-error:not(.disabled, .readonly, .focused) .field-body:hover {
  --_outline-color: var(--color-on-error-container);
  --_label-text-color: var(--color-on-error-container);
}
.field.variant-outlined.has-warning {
  --_label-text-color: var(--color-warning);
  --_input-text-color: var(--color-on-surface);
}
.field.variant-outlined.has-warning:not(.disabled, .readonly, .focused, .has-error) .field-body:hover {
  --_outline-color: var(--color-warning);
  --_label-text-color: var(--color-warning);
}
.field.disabled .label,
.field.disabled .outlined-label {
  opacity: 0.38;
}
.field.disabled {
  --_label-text-color: var(--color-on-surface);
  --_input-text-color: color-mix(in srgb, var(--color-on-surface) 38%, transparent);
  --_helper-text-color: var(--color-on-surface);
  --_helper-text-opacity: 0.38;
  --_outline-color: var(--color-on-surface);
  --_outline-opacity: 0.12;
  --_container-color: var(--color-on-surface);
  --_container-opacity: 0.04;
  cursor: not-allowed;
}
.field.disabled.variant-filled {
  --_outline-opacity: 0.38;
}
.field.disabled.variant-outlined {
  --_container-color: transparent;
  --_label-text-color: var(--color-on-surface);
  --_input-text-color: color-mix(in srgb, var(--color-on-surface) 38%, transparent);
}
.field.readonly:not(.disabled) {
  cursor: initial;
  --_container-color: color-mix(in srgb, var(--color-on-surface) 4%, transparent);
}
.field.readonly:not(.disabled):not(.focused) {
  --_outline-opacity: 0.38;
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
  inset-inline-start: 0;
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
 * @summary The box around a form control, with its label, required mark, helper, error or warning text and a character count.
 * @overview
 * <p>The field draws the frame of a form control: the label with a required mark, the bordered
 * box with <code>field-start</code> and <code>field-end</code> slots, and a footer with helper,
 * error or warning text and a character count. Wrap a custom control in it to match the
 * built-in fields.</p>
 * <p>The <code>default</code> variant fills its box with <code>surface-container-lowest</code>, so it
 * stands out on cards and dialogs as well as on the page. <code>outlined</code> has no fill (the
 * outline alone marks it) and <code>filled</code> uses <code>surface-container-highest</code>, as in
 * Material 3. Disabled follows M3: the text at 38%, the outline at 12% and a 4% fill. Read-only
 * keeps the label and value at full contrast in a faint box, so it reads as information.</p>
 * <p>The <code>outlined</code> variant is the M3 outlined text field: its label rests inside the
 * empty field and, on focus or with a value, floats into a notch in the outline's top edge. The
 * outline is drawn in parts (start, notch, end), so the notch needs no background and the field
 * works on any surface. The outline is 1px, 2px while focused.</p>
 *
 * @cssprop --field-container-color - The box's fill. Defaults to `surface-container-lowest` (default variant), `surface-container-highest` (filled) or none (outlined).
 * @cssprop --field-outline-width - The outline's resting width. Defaults to 1px on the outlined variant.
 * @cssprop --field-label-rest-top - Where the outlined label's resting line is centred, from the top of the box. Defaults to the middle; multi-line fields set it to their first line.
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
        /**
         * Height of the field box: `sm` (2.5rem, the default, the same as a default button), `md`
         * (3.5rem) or `lg` (4rem). `data-density` on an ancestor shortens it further.
         */
        this.size = 'sm';
        /** True when the `field-start` slot contains at least one node. */
        this.slotStartHasContent = false;
        /** True when the `field-end` slot contains at least one node. */
        this.slotEndHasContent = false;
    }
    connectedCallback() {
        super.connectedCallback();
        if (this.hasUpdated)
            this.__observeInputBox();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.__resizeObserver?.disconnect();
        this.__resizeObserver = undefined;
    }
    firstUpdated() {
        this.__observeInputBox();
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
    /**
     * Starts watching the field body and the control box. The outlined label rests over the
     * control's text and floats into the outline's notch; the text's start moves with leading
     * content such as an icon, so its inset is measured and handed to the styles.
     */
    __observeInputBox() {
        if (typeof ResizeObserver === 'undefined' || this.__resizeObserver)
            return;
        const body = this.fieldBodyElement;
        const box = this.__inputWrapper;
        if (!body || !box)
            return;
        this.__resizeObserver = new ResizeObserver(() => this.__measureInputBox());
        this.__resizeObserver.observe(body);
        this.__resizeObserver.observe(box);
    }
    /** Hands the control box's inline insets to the styles as `--_input-start` and `--_input-end`. */
    __measureInputBox() {
        const body = this.fieldBodyElement;
        const box = this.__inputWrapper;
        if (!body || !box)
            return;
        const bodyRect = body.getBoundingClientRect();
        const boxRect = box.getBoundingClientRect();
        const rtl = getComputedStyle(body).direction === 'rtl';
        const start = rtl
            ? bodyRect.right - boxRect.right
            : boxRect.left - bodyRect.left;
        const end = rtl
            ? boxRect.left - bodyRect.left
            : bodyRect.right - boxRect.right;
        body.style.setProperty('--_input-start', `${Math.max(0, start)}px`);
        body.style.setProperty('--_input-end', `${Math.max(0, end)}px`);
        // Animate the label only after it has its first position, so it doesn't slide into place.
        if (!body.hasAttribute('data-label-ready')) {
            requestAnimationFrame(() => body.setAttribute('data-label-ready', ''));
        }
    }
    /** The label text and required mark, shared by the outlined label and its notch. */
    __renderLabelText() {
        return b `${this.label}${this.required
            ? b `<span class="required">*</span>`
            : A}`;
    }
    /**
     * The outline. The outlined variant builds it from parts, as Material 3 does: a start segment,
     * a notch as wide as the floating label whose top edge opens while the label floats, and an
     * end segment that takes the remaining width. The label floats into the notch, so the
     * outline needs no background behind the label and works on any surface.
     */
    __renderOutline() {
        if (this.variant !== 'outlined')
            return b `<div class="outline"></div>`;
        return b `<div class="outline" aria-hidden="true">
      <div class="outline-start"></div>
      <div class="outline-notch">
        ${this.label
            ? b `<span class="outline-notch-label"
              >${this.__renderLabelText()}</span
            >`
            : A}
      </div>
      <div class="outline-end"></div>
    </div>`;
    }
    /** The outlined label: resting over the empty control, floating in the notch otherwise. */
    __renderOutlinedLabel() {
        if (this.variant !== 'outlined' || !this.label)
            return A;
        return b `<label class="outlined-label">
      ${this.__renderLabelText()}
      <wc-skeleton class="skeleton"></wc-skeleton>
    </label>`;
    }
    __renderFieldHeader() {
        if (!this.label || this.variant === 'outlined')
            return A;
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
            'has-label': !!this.label,
            'label-floating': this.populated || this.focused,
        };
        return b `
      <div class=${e$1(classes)}>
        ${this.__renderFieldHeader()}

        <div class="field-body" @click=${this.__handleClick}>
          ${this.__renderOutline()}
          <div class="background"></div>
          <wc-skeleton class="skeleton"></wc-skeleton>
          ${this.__renderOutlinedLabel()}

          <div class="field-content">
            <div
              class=${e$1({
            'slot-start-wrapper': true,
            'has-content': this.slotStartHasContent,
        })}
            >
              <slot name="field-start"></slot>
            </div>

            <div class="input-wrapper"><slot></slot></div>

            <div
              class=${e$1({
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
    n({ type: String, reflect: true })
], Field.prototype, "size", void 0);
__decorate([
    n({ type: Object })
], Field.prototype, "host", void 0);
__decorate([
    r()
], Field.prototype, "slotStartHasContent", void 0);
__decorate([
    r()
], Field.prototype, "slotEndHasContent", void 0);
__decorate([
    e('.field-body')
], Field.prototype, "fieldBodyElement", void 0);
__decorate([
    e('.input-wrapper')
], Field.prototype, "__inputWrapper", void 0);
Field = __decorate([
    IndividualComponent
], Field);

export { Field };
//# sourceMappingURL=field.js.map
