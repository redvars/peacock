import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './listbox-option.scss';

/**
 * @label Listbox Option
 * @tag wc-listbox-option
 * @rawTag listbox-option
 *
 * @summary An option of a wc-listbox.
 * @overview
 * <p>The option has <code>role="option"</code> and <code>aria-selected</code>. Its
 * <code>value</code> is what the listbox reports; without one, the option's text is used.
 * <code>wc-listbox</code> sets <code>selected</code> from its value.</p>
 *
 * @slot - The option's label.
 * @slot start - Leading content, such as an icon.
 * @slot supporting-text - Text below the label.
 * @slot end - Trailing content.
 *
 * @cssprop --listbox-option-selected-container-color - Background of a selected option.
 * @cssprop --listbox-option-selected-label-text-color - Label color of a selected option.
 *
 * @example
 * ```html
 * <wc-listbox label="Fruit">
 *   <wc-listbox-option value="apple">Apple</wc-listbox-option>
 *   <wc-listbox-option value="banana" disabled>Banana</wc-listbox-option>
 * </wc-listbox>
 * ```
 * @tags form
 */
@IndividualComponent
export class ListboxOption extends LitElement {
  // ── Static

  static styles = [styles];

  // ── Properties

  /** The value the listbox reports for this option; defaults to the option's text. */
  @property({ type: String }) value = '';

  /** Whether the option is chosen. Set by `wc-listbox` from its value. */
  @property({ type: Boolean, reflect: true }) selected = false;

  /** Whether the option cannot be chosen or focused. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Whether the option belongs to a multi-select listbox, which shows a checkbox. Set by `wc-listbox`. */
  @property({ type: Boolean, reflect: true }) multiple = false;

  // ── State

  /** Whether the `supporting-text` slot has content. */
  @state() private hasSupportingText = false;

  // ── Lifecycle

  override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'option');
    if (!this.hasAttribute('tabindex')) this.tabIndex = -1;
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    super.willUpdate(changed);
    if (changed.has('selected')) {
      this.setAttribute('aria-selected', String(this.selected));
    }
    if (changed.has('disabled')) {
      if (this.disabled) this.setAttribute('aria-disabled', 'true');
      else this.removeAttribute('aria-disabled');
    }
  }

  // ── Public

  /** The value this option stands for: `value`, or its text when `value` is empty. */
  get optionValue(): string {
    return this.value || (this.textContent ?? '').trim();
  }

  // ── Private

  private __handleSupportingTextChange = (event: Event) => {
    const slot = event.target as HTMLSlotElement;
    this.hasSupportingText = slot.assignedNodes({ flatten: true }).length > 0;
  };

  // ── Render

  render() {
    const checkbox = this.multiple
      ? html`<wc-icon
          class="indicator"
          name=${this.selected ? 'check_box' : 'check_box_outline_blank'}
          aria-hidden="true"
        ></wc-icon>`
      : nothing;
    const check =
      !this.multiple && this.selected
        ? html`<wc-icon
            class="indicator"
            name="check"
            aria-hidden="true"
          ></wc-icon>`
        : nothing;

    return html`
      <wc-focus-ring class="focus-ring" inward></wc-focus-ring>
      <wc-ripple class="ripple"></wc-ripple>
      <div class="background"></div>
      <div class="option">
        ${checkbox}
        <slot name="start"></slot>
        <div class="text">
          <span class="label"><slot></slot></span>
          <span class="supporting-text" ?hidden=${!this.hasSupportingText}
            ><slot
              name="supporting-text"
              @slotchange=${this.__handleSupportingTextChange}
            ></slot
          ></span>
        </div>
        <slot name="end"></slot>
        ${check}
      </div>
    `;
  }
}
