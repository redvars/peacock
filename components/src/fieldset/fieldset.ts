import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import IndividualComponent from '@/IndividualComponent.js';
import styles from './fieldset.scss';

let fieldsetCount = 0;

const NATIVE_CONTROLS = new Set(['input', 'select', 'textarea', 'button']);

/**
 * Elements that disable their own children: a nested fieldset, and the groups that pass
 * `disabled` down to their options (a radio group is not form-associated itself, so without this
 * its radios would be disabled but its label would not dim).
 */
const OWNERS = 'wc-fieldset, wc-radio-group, wc-checkbox-group';

/** Whether `element` is a form control a disabled fieldset disables: native, or form-associated. */
function isFormControl(element: Element): boolean {
  if (NATIVE_CONTROLS.has(element.localName)) return true;
  const ctor = element.constructor as { formAssociated?: boolean };
  return ctor.formAssociated === true;
}

/**
 * @label Fieldset
 * @tag wc-fieldset
 * @rawTag fieldset
 * @summary Groups related fields under a headline and disables them together.
 * @overview
 * <p>Fieldset renders a native <code>&lt;fieldset&gt;</code> with a <code>&lt;legend&gt;</code>,
 * so assistive technology announces its fields as a group named by the <code>headline</code>;
 * <code>supporting-text</code> describes the group. The fields stack with the standard gap
 * between fields, which follows the density.</p>
 * <p><code>disabled</code> disables every form control inside, as on a native fieldset: Peacock
 * fields and buttons, other form-associated elements, and native inputs, selects, text areas and
 * buttons, however deeply nested and including ones added later. Disabled controls are left out
 * of form submission. A slotted control is not inside the shadow <code>&lt;fieldset&gt;</code>
 * as far as the browser is concerned, so the fieldset sets <code>disabled</code> on each control
 * itself, and turning it off re-enables only the controls it disabled. A nested
 * <code>wc-fieldset</code> is disabled as a whole and handles its own controls.</p>
 *
 * @slot - The fields.
 *
 * @cssprop --fieldset-gap - Space between the fields. Defaults to `--spacing-200`, less with density.
 *
 * @example
 * ```html
 * <wc-fieldset headline="Shipping address" supporting-text="Where should we send the order?">
 *   <wc-input label="Street" name="street"></wc-input>
 *   <wc-input label="City" name="city"></wc-input>
 *   <wc-select label="Country" name="country"></wc-select>
 * </wc-fieldset>
 * ```
 * @tags form
 */
@IndividualComponent
export class Fieldset extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** Title of the group, rendered as its `<legend>` and used as its accessible name. */
  @property({ type: String })
  headline: string = '';

  /** Text under the headline that describes the group, linked with `aria-describedby`. */
  @property({ type: String, attribute: 'supporting-text' })
  supportingText: string = '';

  /** Disables every form control inside, like a disabled native `<fieldset>`. */
  @property({ type: Boolean, reflect: true })
  disabled: boolean = false;

  // ── Private fields ───────────────────────────────────────────────────────

  private readonly supportingTextId = `wc-fieldset-${(fieldsetCount += 1)}-supporting-text`;

  /** Controls this fieldset disabled, so turning `disabled` off re-enables only those. */
  private readonly disabledByFieldset = new Set<Element>();

  /** Catches controls added (or removed) while the fieldset is disabled. */
  private readonly observer = new MutationObserver(() => this.syncDisabled());

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    this.observer.observe(this, { childList: true, subtree: true });
    if (this.hasUpdated) this.syncDisabled();
  }

  override disconnectedCallback() {
    this.observer.disconnect();
    super.disconnectedCallback();
  }

  protected override updated(changed: PropertyValues<this>) {
    if (changed.has('disabled')) this.syncDisabled();
  }

  // ── Private methods ──────────────────────────────────────────────────────

  /**
   * The controls this fieldset is responsible for: form controls inside it, and nested
   * fieldsets, but not the controls of a nested fieldset, which disables those itself.
   */
  private getControls(): Element[] {
    return Array.from(this.querySelectorAll('*')).filter(
      element =>
        element.parentElement?.closest(OWNERS) === this &&
        (element.matches(OWNERS) || isFormControl(element)),
    );
  }

  /** Disables the controls inside while `disabled`; re-enables the ones it disabled otherwise. */
  private syncDisabled() {
    const controls = this.disabled ? this.getControls() : [];
    for (const element of this.disabledByFieldset) {
      if (!controls.includes(element)) {
        element.removeAttribute('disabled');
        this.disabledByFieldset.delete(element);
      }
    }
    for (const element of controls) {
      if (!element.hasAttribute('disabled')) {
        element.setAttribute('disabled', '');
        this.disabledByFieldset.add(element);
      }
    }
    if (this.disabled) this.syncWhenDefined();
  }

  /** Looks again once custom elements that are not defined yet are, as they may be form controls. */
  private syncWhenDefined() {
    const pending = new Set(
      Array.from(this.querySelectorAll(':not(:defined)'), el => el.localName),
    );
    for (const name of pending) {
      customElements.whenDefined(name).then(() => this.syncDisabled());
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    return html`
      <fieldset
        class=${classMap({ fieldset: true, disabled: this.disabled })}
        ?disabled=${this.disabled}
        aria-describedby=${this.supportingText
          ? this.supportingTextId
          : nothing}
      >
        ${this.headline
          ? html`<legend class="headline">${this.headline}</legend>`
          : nothing}
        ${this.supportingText
          ? html`<div class="supporting-text" id=${this.supportingTextId}>
              ${this.supportingText}
            </div>`
          : nothing}
        <div class="fields"><slot></slot></div>
      </fieldset>
    `;
  }
}
