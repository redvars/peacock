import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import { mixinElementInternals } from '@/__internal/mixins/element-internals.js';
import {
  type FormRestoreState,
  type FormValue,
  getFormValue,
  mixinFormAssociated,
} from '@/__internal/mixins/form-associated.js';

/**
 * Base class for Peacock's text-like form controls.
 *
 * It is form-associated: `value` is submitted with the surrounding `<form>`, `form.reset()`
 * restores the value the control started with, and a disabled `<fieldset>` disables it.
 * `name` and `disabled` come from `mixinFormAssociated`; they are backed by attributes, so
 * subclasses must not redeclare them.
 */
export default abstract class BaseInput extends mixinFormAssociated(
  mixinElementInternals(LitElement),
) {
  // ── Properties ───────────────────────────────────────────────────────────

  /** Each control declares its own `value` (a property, or an accessor such as Switch's). */
  abstract value?: any;

  @property({ type: Boolean, reflect: true })
  readonly: boolean = false;

  @property({ type: Boolean, reflect: true })
  required: boolean = false;

  @property({ type: Boolean, reflect: true })
  skeleton = false;

  // ── Private fields ───────────────────────────────────────────────────────

  /** The value the control had when it was first connected; `form.reset()` returns to it. */
  private __defaultValue: unknown = undefined;

  private __defaultValueCaptured = false;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    if (!this.__defaultValueCaptured) {
      this.__defaultValue = this.value;
      this.__defaultValueCaptured = true;
    }
  }

  // ── Form association ─────────────────────────────────────────────────────

  override [getFormValue](): FormValue | null {
    if (this.value === undefined || this.value === null) return null;
    return String(this.value);
  }

  formResetCallback() {
    this.value = this.__defaultValue;
  }

  formStateRestoreCallback(state: FormRestoreState | null) {
    this.value = typeof state === 'string' ? state : this.__defaultValue;
  }
}
