import { html, LitElement, nothing, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import type { Radio } from './radio.js';
import styles from './radio-group.scss';

let radioGroupCount = 0;

/**
 * @label Radio Group
 * @tag wc-radio-group
 * @rawTag radio-group
 * @summary Groups radios under one label, one name and one value.
 * @overview
 * <p>Radio group gives its <code>wc-radio</code> children a shared <code>name</code> (its own, or a
 * generated one), so only one can be checked. Its <code>value</code> is the value of the checked radio,
 * and setting it checks the matching radio.</p>
 * <p>The radios stay form-associated, so the group submits once, through the checked radio.</p>
 *
 * @fires {CustomEvent<{value: string}>} change - Dispatched when the user checks a different radio. The group swallows the radios' own `change` events.
 *
 * @cssprop --radio-group-gap - Space between radios. Defaults to `--spacing-100`.
 *
 * @example
 * ```html
 * <wc-radio-group label="Size" name="size" value="md">
 *   <wc-radio value="sm" label="Small"></wc-radio>
 *   <wc-radio value="md" label="Medium"></wc-radio>
 *   <wc-radio value="lg" label="Large"></wc-radio>
 * </wc-radio-group>
 * ```
 * @tags input, form
 */
@IndividualComponent
export class RadioGroup extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** Name given to every radio in the group, and submitted with forms. Generated when empty. */
  @property({ type: String, reflect: true })
  name: string = '';

  /** Value of the checked radio. Setting it checks the radio with that value. */
  @property({ type: String })
  value: string = '';

  /** Group label, shown above the radios and used as the accessible name. */
  @property({ type: String })
  label: string = '';

  /** Lays the radios out in a column (default) or a row. */
  @property({ type: String, reflect: true })
  orientation: 'vertical' | 'horizontal' = 'vertical';

  /** Disables every radio in the group. */
  @property({ type: Boolean, reflect: true })
  disabled: boolean = false;

  /** Marks the group as required. */
  @property({ type: Boolean, reflect: true })
  required: boolean = false;

  // ── Private fields ───────────────────────────────────────────────────────

  private readonly generatedName = `wc-radio-group-${(radioGroupCount += 1)}`;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener('change', this.handleRadioChange, { capture: true });
  }

  override disconnectedCallback() {
    this.removeEventListener('change', this.handleRadioChange, {
      capture: true,
    });
    super.disconnectedCallback();
  }

  protected override updated(changed: PropertyValues<this>) {
    if (
      changed.has('name') ||
      changed.has('value') ||
      changed.has('disabled')
    ) {
      this.syncRadios();
    }
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private getRadios(): Radio[] {
    return Array.from(this.querySelectorAll<Radio>('wc-radio'));
  }

  /** Pushes the group's name, value and disabled state down to its radios. */
  private syncRadios = () => {
    const radios = this.getRadios();
    const name = this.name || this.generatedName;

    for (const radio of radios) {
      if (radio.name !== name) radio.name = name;
      if (this.disabled) radio.disabled = true;
    }

    if (this.value) {
      for (const radio of radios) radio.checked = radio.value === this.value;
    } else {
      // No value set: adopt the radio that was checked in markup.
      this.value = radios.find(radio => radio.checked)?.value ?? '';
    }
  };

  private handleRadioChange = (event: Event) => {
    if (event.target === this) return;
    const radio = (event.target as Element).closest?.(
      'wc-radio',
    ) as Radio | null;
    if (!radio) return;

    // Capture phase: swallow the radio's `change` so listeners on the group and above see one
    // `change`, the group's.
    event.stopPropagation();
    this.value = radio.value;
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    return html`
      <div
        class=${classMap({
          'radio-group': true,
          [`orientation-${this.orientation}`]: true,
          disabled: this.disabled,
        })}
        role="radiogroup"
        aria-label=${this.label || nothing}
        aria-required=${this.required ? 'true' : nothing}
        aria-disabled=${this.disabled ? 'true' : nothing}
      >
        ${this.label
          ? html`<div class="label" aria-hidden="true">
              ${this.label}${this.required
                ? html`<span class="required">*</span>`
                : nothing}
            </div>`
          : nothing}
        <div class="radios">
          <slot @slotchange=${this.syncRadios}></slot>
        </div>
      </div>
    `;
  }
}
