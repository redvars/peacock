import { html, LitElement, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import { observerSlotChangesWithCallback } from '@/__internal/utils/observe-slot-change.js';

import styles from './field.scss';
import IndividualComponent from '@/IndividualComponent.js';

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
@IndividualComponent
export class Field extends LitElement {
  static shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static styles = [styles];

  /** Label text shown above the field input. */
  @property({ type: String })
  label: string = '';

  /** When true, marks the field as required and shows a required indicator. */
  @property({ type: Boolean })
  required: boolean = false;

  /** When true, the field and its slotted input are disabled. */
  @property({ type: Boolean, reflect: true })
  disabled: boolean = false;

  /** When true, the field and its slotted input are read-only. */
  @property({ type: Boolean, reflect: true })
  readonly: boolean = false;

  /** When true, renders the field in a loading skeleton state. */
  @property({ type: Boolean })
  skeleton: boolean = false;

  /** Helper/hint text shown in the field footer. */
  @property({ type: String, attribute: 'helper-text' })
  helperText: string = '';

  /** When true, the field is in an error state and `errorText` is shown. */
  @property({ type: Boolean })
  error: boolean = false;

  /** Error message displayed when `error` is true. */
  @property({ type: String, attribute: 'error-text' })
  errorText: string = '';

  /** When true, the field is in a warning state and `warningText` is shown. */
  @property({ type: Boolean })
  warning: boolean = false;

  /** Warning message displayed when `warning` is true. */
  @property({ type: String, attribute: 'warning-text' })
  warningText: string = '';

  /** Character / word count string displayed at the trailing end of the footer. */
  @property({ type: String, attribute: 'text-count' })
  textCount: string = '';

  /** When true, applies focused styling (controlled externally by the slotted input). */
  @property({ type: Boolean })
  focused: boolean = false;

  /** When true, applies populated styling (controlled externally by the slotted input). */
  @property({ type: Boolean })
  populated: boolean = false;

  /** Visual variant of the field container. */
  @property({ type: String })
  variant: 'filled' | 'outlined' | 'default' = 'default';

  /**
   * Height of the field box: `sm` (2.5rem, the default, the same as a default button), `md`
   * (3.5rem) or `lg` (4rem). `data-density` on an ancestor shortens it further.
   */
  @property({ type: String, reflect: true })
  size: 'sm' | 'md' | 'lg' = 'sm';

  /** Reference to the host input element; used to forward click-on-label focus. */
  @property({ type: Object })
  host?: HTMLElement;

  /** True when the `field-start` slot contains at least one node. */
  @state()
  slotStartHasContent: boolean = false;

  /** True when the `field-end` slot contains at least one node. */
  @state()
  slotEndHasContent: boolean = false;

  /** The bordered field container; used to anchor popups such as a select menu. */
  @query('.field-body')
  readonly fieldBodyElement!: HTMLElement | null;

  /** The box the control sits in, between the leading and trailing content. */
  @query('.input-wrapper')
  private readonly __inputWrapper!: HTMLElement | null;

  /** Watches the field and its control box, so the outlined label rests where the text starts. */
  private __resizeObserver?: ResizeObserver;

  connectedCallback() {
    super.connectedCallback();
    if (this.hasUpdated) this.__observeInputBox();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.__resizeObserver?.disconnect();
    this.__resizeObserver = undefined;
  }

  firstUpdated() {
    this.__observeInputBox();
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

  /**
   * Starts watching the field body and the control box. The outlined label rests over the
   * control's text and floats into the outline's notch; the text's start moves with leading
   * content such as an icon, so its inset is measured and handed to the styles.
   */
  private __observeInputBox() {
    if (typeof ResizeObserver === 'undefined' || this.__resizeObserver) return;
    const body = this.fieldBodyElement;
    const box = this.__inputWrapper;
    if (!body || !box) return;
    this.__resizeObserver = new ResizeObserver(() => this.__measureInputBox());
    this.__resizeObserver.observe(body);
    this.__resizeObserver.observe(box);
  }

  /** Hands the control box's inline insets to the styles as `--_input-start` and `--_input-end`. */
  private __measureInputBox() {
    const body = this.fieldBodyElement;
    const box = this.__inputWrapper;
    if (!body || !box) return;
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
    return html`${this.label}${this.required
      ? html`<span class="required">*</span>`
      : nothing}`;
  }

  /**
   * The outline. The outlined variant builds it from parts, as Material 3 does: a start segment,
   * a notch as wide as the floating label whose top edge opens while the label floats, and an
   * end segment that takes the remaining width. The label floats into the notch, so the
   * outline needs no background behind the label and works on any surface.
   */
  __renderOutline() {
    if (this.variant !== 'outlined') return html`<div class="outline"></div>`;
    return html`<div class="outline" aria-hidden="true">
      <div class="outline-start"></div>
      <div class="outline-notch">
        ${this.label
          ? html`<span class="outline-notch-label"
              >${this.__renderLabelText()}</span
            >`
          : nothing}
      </div>
      <div class="outline-end"></div>
    </div>`;
  }

  /** The outlined label: resting over the empty control, floating in the notch otherwise. */
  __renderOutlinedLabel() {
    if (this.variant !== 'outlined' || !this.label) return nothing;
    return html`<label class="outlined-label">
      ${this.__renderLabelText()}
      <wc-skeleton class="skeleton"></wc-skeleton>
    </label>`;
  }

  __renderFieldHeader() {
    if (!this.label || this.variant === 'outlined') return nothing;
    return html`<div class="field-header">
      <label class="label">
        ${this.label}${this.required
          ? html`<span class="required">*</span>`
          : nothing}
        <wc-skeleton class="skeleton"></wc-skeleton>
      </label>
    </div>`;
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

    return html`
      <div class=${classMap(classes)}>
        ${this.__renderFieldHeader()}

        <div class="field-body" @click=${this.__handleClick}>
          ${this.__renderOutline()}
          <div class="background"></div>
          <wc-skeleton class="skeleton"></wc-skeleton>
          ${this.__renderOutlinedLabel()}

          <div class="field-content">
            <div
              class=${classMap({
                'slot-start-wrapper': true,
                'has-content': this.slotStartHasContent,
              })}
            >
              <slot name="field-start"></slot>
            </div>

            <div class="input-wrapper"><slot></slot></div>

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
}
