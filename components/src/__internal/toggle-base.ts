import { html, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';

import { deprecate } from '@/__internal/utils/deprecate.js';
import {
  type FormRestoreState,
  type FormValue,
  getFormState,
  getFormValue,
} from '@/__internal/mixins/form-associated.js';
import BaseInput, { type ControlValidity } from '../input/BaseInput.js';

let toggleCount = 0;

/**
 * Base for Peacock's on/off controls: `wc-checkbox`, `wc-switch` and `wc-radio`.
 *
 * Like a native checkbox, `checked` is the state and `value` the string submitted under `name`
 * while checked (`"on"` by default). `required` blocks form submission until the control is
 * checked. The inner control (an element with class `container` and a `role`) gets the host's
 * `tabindex` and `aria-*`, and is named by the visible label through `aria-labelledby`.
 *
 * Subclasses render the control with `controlAttributes()`, the label with `renderLabel()`, and
 * call `toggleChecked(event)` (or their own selection logic) on activation.
 */
export default abstract class ToggleBase extends BaseInput {
  // ── Properties ───────────────────────────────────────────────────────────

  /** Visible label; slotted content is used when it is empty. */
  @property({ type: String })
  label: string = '';

  /** Whether the control is on. */
  @property({ type: Boolean, reflect: true })
  checked: boolean = false;

  /**
   * The value submitted with a form while checked. Defaults to `"on"` for checkboxes and switches.
   * Setting a boolean is deprecated: it sets `checked`, as the old `value` alias did.
   */
  @property({ type: String })
  get value(): string {
    return this.toggleValue;
  }

  set value(value: string | boolean) {
    if (typeof value === 'boolean') {
      deprecate(this.localName, 'setting `value` to a boolean', '`checked`');
      this.checked = value;
      return;
    }
    const old = this.toggleValue;
    this.toggleValue = value ?? '';
    this.requestUpdate('value', old);
  }

  /** ARIA attributes moved from the host onto the inner control. */
  @property({ type: Object })
  configAria: Record<string, string> = {};

  // ── State ────────────────────────────────────────────────────────────────

  /** True while the inner control has focus. */
  @state() protected hasFocus = false;

  /** True while the control is being pressed with the mouse or Space. */
  @state() protected isActive = false;

  /** True when there is a label to show, from `label` or slotted content. */
  @state() protected slotHasContent = false;

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('.container') protected containerElement?: HTMLElement;

  // ── Private fields ───────────────────────────────────────────────────────

  /** A `tabindex` set on the host, moved to the inner control. */
  protected controlTabIndex?: string;

  /** Id of the visible label, which names the inner control. */
  protected readonly labelId = `wc-toggle-label-${(toggleCount += 1)}`;

  private toggleValue: string = this.defaultToggleValue;

  /** `checked` when first connected; `form.reset()` returns to it. */
  private defaultChecked?: boolean;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    this.defaultChecked ??= this.checked;
    for (const attr of Array.from(this.attributes)) {
      if (attr.name.startsWith('aria-')) {
        this.configAria = { ...this.configAria, [attr.name]: attr.value };
        this.removeAttribute(attr.name);
      }
    }
    if (this.hasAttribute('tabindex')) {
      this.controlTabIndex = this.getAttribute('tabindex') ?? undefined;
      this.removeAttribute('tabindex');
    }
    window.addEventListener('mouseup', this.windowMouseUp);
    window.addEventListener('keyup', this.windowKeyUp);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('mouseup', this.windowMouseUp);
    window.removeEventListener('keyup', this.windowKeyUp);
  }

  protected override willUpdate(changed: PropertyValues) {
    super.willUpdate(changed);
    if (changed.has('label') || !this.hasUpdated) {
      this.slotHasContent = this.hasChildNodes() || !!this.label;
    }
  }

  // ── Public methods ───────────────────────────────────────────────────────

  override focus() {
    this.containerElement?.focus();
  }

  override blur() {
    this.containerElement?.blur();
  }

  // ── Form association ─────────────────────────────────────────────────────

  override [getFormValue](): FormValue | null {
    return this.checked ? this.value || 'on' : null;
  }

  override [getFormState](): FormValue | null {
    return String(this.checked);
  }

  override formResetCallback() {
    super.formResetCallback();
    this.checked = this.defaultChecked ?? false;
  }

  override formStateRestoreCallback(restored: FormRestoreState | null) {
    this.checked = restored === 'true';
  }

  // ── Protected ────────────────────────────────────────────────────────────

  /** The default `value`: `"on"`, like a native checkbox. Radios override it. */
  protected get defaultToggleValue(): string {
    return 'on';
  }

  protected override computeValidity(): ControlValidity {
    if (this.required && !this.checked && !this.disabled) {
      return {
        flags: { valueMissing: true },
        message: this.valueMissingText(),
      };
    }
    return { flags: {}, message: '' };
  }

  protected override validityAnchor() {
    return this.containerElement;
  }

  /** Whether to mark the control invalid: a failed check or a commit left it invalid. */
  protected get showsInvalid(): boolean {
    return !!this.validationText;
  }

  /**
   * Attributes for the inner control: the host's `tabindex` (or `fallbackTabIndex`), the label as
   * its name, required and invalid state, plus `configAria`.
   */
  protected controlAttributes(
    fallbackTabIndex = '0',
  ): Record<string, string | undefined> {
    return {
      tabindex: this.disabled
        ? '-1'
        : (this.controlTabIndex ?? fallbackTabIndex),
      'aria-labelledby': this.slotHasContent ? this.labelId : undefined,
      'aria-disabled': this.disabled ? 'true' : undefined,
      'aria-required': this.required ? 'true' : undefined,
      'aria-invalid': this.showsInvalid ? 'true' : undefined,
      ...this.configAria,
    };
  }

  /** Flips `checked` and fires `change`, unless the control is disabled or read-only. */
  protected toggleChecked(originalEvent?: Event) {
    if (this.disabled || this.readonly) return;
    this.checked = !this.checked;
    this.afterToggle();
    this.dispatchChange(originalEvent);
    this.containerElement?.focus();
  }

  /** Hook for state that clears when the control is toggled, such as `indeterminate`. */
  protected afterToggle() {}

  /**
   * Fires `change`. `detail.checked` is the new state and `detail.value` the submitted value
   * while checked. (`detail.value` was the boolean state before 3.18.)
   */
  protected dispatchChange(originalEvent?: Event) {
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: { checked: this.checked, value: this.value, originalEvent },
        bubbles: true,
        composed: true,
      }),
    );
  }

  protected handleMouseDown = () => {
    this.isActive = true;
  };

  protected handleFocusChange = (event: FocusEvent) => {
    this.hasFocus = event.type === 'focus';
  };

  /** The visible label, from `label` or the default slot, with the id that names the control. */
  protected renderLabel() {
    return this.label
      ? html`<div id=${this.labelId} class="label">${this.label}</div>`
      : html`<div id=${this.labelId} class="label slot-container">
          <slot></slot>
        </div>`;
  }

  // ── Private ──────────────────────────────────────────────────────────────

  private windowMouseUp = () => {
    if (this.isActive) this.isActive = false;
  };

  private windowKeyUp = (event: KeyboardEvent) => {
    if (this.isActive && event.key === ' ') this.isActive = false;
  };
}
