import { html, LitElement, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';

import {
  internals,
  mixinElementInternals,
} from '@/__internal/mixins/element-internals.js';
import {
  type FormRestoreState,
  type FormValue,
  getFormValue,
  mixinFormAssociated,
} from '@/__internal/mixins/form-associated.js';
import { peacockString } from '@/__internal/i18n/strings.js';
import {
  SuggestionController,
  type SuggestionAcceptCause,
} from '@/__internal/ai/suggestion-controller.js';
import type { AiSuggestion } from '@/__internal/ai/types.js';

const VALIDITY_KEYS = [
  'valueMissing',
  'typeMismatch',
  'patternMismatch',
  'tooLong',
  'tooShort',
  'rangeUnderflow',
  'rangeOverflow',
  'stepMismatch',
  'badInput',
] as const;

/** The flags `ElementInternals.setValidity()` takes, as the DOM's `ValidityStateFlags`. */
export type ValidityFlags = {
  [Key in (typeof VALIDITY_KEYS)[number] | 'customError']?: boolean;
};

/** What a control reports to `ElementInternals.setValidity()`. */
export interface ControlValidity {
  flags: ValidityFlags;
  message: string;
  /** Element the browser points at when it reports the problem; defaults to the host. */
  anchor?: HTMLElement;
}

/** The validity of a native control, for controls that wrap one. */
export function nativeValidity(
  control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
): ControlValidity {
  const flags: ValidityFlags = {};
  for (const key of VALIDITY_KEYS) {
    if (control.validity[key]) flags[key] = true;
  }
  return { flags, message: control.validationMessage, anchor: control };
}

/** Set while one `invalid` event per form submission moves focus, so only the first one does. */
let focusClaimed = false;

/**
 * Base class for Peacock's form controls.
 *
 * It is form-associated: `value` is submitted with the surrounding `<form>`, `form.reset()`
 * restores the value the control started with, and a disabled `<fieldset>` disables it.
 * `name` and `disabled` come from `mixinFormAssociated`; they are backed by attributes, so
 * subclasses must not redeclare them.
 *
 * It takes part in constraint validation like a native control: `required` and the control's own
 * rules (from `computeValidity()`) block form submission, `checkValidity()`, `reportValidity()`,
 * `setCustomValidity()`, `validity` and `validationMessage` work as on `<input>`, and `:invalid`
 * matches. A control shows its message (`validationText`) once the person has committed a value
 * or the form was submitted.
 *
 * It can hold a value the assistant suggested (ADR-030002): `suggestion` fills the control and
 * marks it until the person accepts or clears it. `sensitive` keeps the control out of AI
 * altogether. Subclasses show the marker with `suggestionBadge()` and `suggestionReason`, and
 * override `readSuggestionValue()`, `writeSuggestionValue()` and `emitSuggestionValue()` when
 * their value is not `value` with `input`/`change` events.
 *
 * @fires {CustomEvent<SuggestionAcceptDetail>} accept - Fired when a suggested value is accepted: the person edited it (`cause: 'edit'`), the form was submitted (`'submit'`) or `acceptSuggestion()` was called (`'action'`).
 * @fires {CustomEvent<SuggestionDismissDetail>} dismiss - Fired when the person clears a suggestion, before `input` and `change` with the restored value.
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

  /**
   * Holds data that must never reach a model, such as a salary or a bank account: the control
   * takes no suggestions and offers no AI features.
   */
  @property({ type: Boolean, reflect: true })
  sensitive = false;

  /**
   * A value the assistant suggests, with why. The control takes the value and shows a Suggested
   * badge and the reason until the person edits it, the form is submitted, or the badge clears it,
   * which puts the previous value back. `null` drops the marker and keeps the value. Ignored while
   * AI is off and on `sensitive` controls.
   */
  @property({ attribute: false })
  get suggestion(): AiSuggestion | null {
    return this.__suggestions.suggestion;
  }

  set suggestion(suggestion: AiSuggestion | null) {
    const old = this.__suggestions.suggestion;
    this.__suggestions.set(suggestion);
    this.requestUpdate('suggestion', old);
  }

  // ── State ────────────────────────────────────────────────────────────────

  /** Whether to show the validation message: after a commit, or after a failed submit. */
  @state() protected showValidity = false;

  // ── Private fields ───────────────────────────────────────────────────────

  /** The value the control had when it was first connected; `form.reset()` returns to it. */
  private __defaultValue: unknown = undefined;

  private __defaultValueCaptured = false;

  private __customValidity = '';

  private readonly __suggestions = new SuggestionController(this, {
    read: () => this.readSuggestionValue(),
    write: value => this.writeSuggestionValue(value),
    emit: () => this.emitSuggestionValue(),
  });

  // ── Lifecycle ────────────────────────────────────────────────────────────

  constructor() {
    super();
    this.addEventListener('invalid', this.__handleInvalid);
    // Every control fires `change` when the person commits a value; from then on, show problems.
    this.addEventListener('change', this.__handleCommit);
  }

  override connectedCallback() {
    super.connectedCallback();
    if (!this.__defaultValueCaptured) {
      this.__defaultValue = this.value;
      this.__defaultValueCaptured = true;
    }
  }

  protected override updated(changed: PropertyValues) {
    super.updated(changed);
    // After render, so a control's inner native input reflects the new value and attributes.
    this.updateValidity();
  }

  // ── Public: constraint validation ────────────────────────────────────────

  get validity(): ValidityState {
    this.updateValidity();
    return this[internals].validity;
  }

  get validationMessage(): string {
    this.updateValidity();
    return this[internals].validationMessage;
  }

  get willValidate(): boolean {
    return this[internals].willValidate;
  }

  checkValidity(): boolean {
    this.updateValidity();
    return this[internals].checkValidity();
  }

  reportValidity(): boolean {
    this.updateValidity();
    return this[internals].reportValidity();
  }

  /** Sets a custom error message, as on `<input>`; an empty string clears it. */
  setCustomValidity(message: string): void {
    this.__customValidity = message;
    this.updateValidity();
    this.requestUpdate();
  }

  // ── Public: suggestions ──────────────────────────────────────────────────

  /** Whether the control holds a suggestion the person hasn't accepted or cleared. */
  get suggested(): boolean {
    return !!this.__suggestions.suggestion;
  }

  /** Accepts the suggestion: the value stays and the marker goes. Fires `accept`. */
  acceptSuggestion(cause: SuggestionAcceptCause = 'action'): void {
    this.__suggestions.accept(cause);
  }

  /** Clears the suggestion and puts the previous value back. Fires `dismiss`, `input` and `change`. */
  dismissSuggestion(): void {
    this.__suggestions.dismiss();
  }

  // ── Protected ────────────────────────────────────────────────────────────

  /**
   * The Suggested badge with its clear button, while a suggestion shows; else nothing. Controls
   * without helper text pass `withReason` so the badge's tooltip carries the reason.
   */
  protected suggestionBadge(
    options: { slot?: string; withReason?: boolean } = {},
  ) {
    return this.__suggestions.badge(options);
  }

  /**
   * A group's label with the Suggested badge beside it while a suggestion shows. The badge stays
   * outside the label element, so it is not part of the group's accessible name. Style
   * `.label-row` as a row.
   */
  protected labelWithSuggestion(label: unknown) {
    if (!this.suggestionVisible) return label;
    return html`<div class="label-row">${label}${this.suggestionBadge()}</div>`;
  }

  /** Why the value was suggested, while the suggestion shows; else `''`. */
  protected get suggestionReason(): string {
    return this.__suggestions.reason;
  }

  /** Whether a suggestion shows as one now (AI on, not sensitive). */
  protected get suggestionVisible(): boolean {
    return this.__suggestions.visible;
  }

  /** The value a suggestion replaces and a dismissed one restores. */
  protected readSuggestionValue(): unknown {
    return this.value;
  }

  /** Puts a suggested or restored value into the control. */
  protected writeSuggestionValue(value: unknown): void {
    this.value = value;
  }

  /** Fires `input` and `change` after the person cleared a suggestion. */
  protected emitSuggestionValue(): void {
    for (const type of ['input', 'change']) {
      this.dispatchEvent(
        new CustomEvent(type, {
          detail: { value: this.value },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  /**
   * The control's own validity. The default checks `required` against an empty `value`;
   * controls that wrap a native input return `nativeValidity(input)`, others add their rules.
   */
  protected computeValidity(): ControlValidity {
    const empty =
      this.value === undefined || this.value === null || this.value === '';
    if (this.required && empty && !this.disabled) {
      return {
        flags: { valueMissing: true },
        message: this.valueMissingText(),
      };
    }
    return { flags: {}, message: '' };
  }

  /** The message for a missing required value. */
  protected valueMissingText(): string {
    return peacockString('valueMissing');
  }

  /** Pushes the current validity to `ElementInternals`. */
  protected updateValidity(): void {
    if (this.__customValidity) {
      this[internals].setValidity(
        { customError: true },
        this.__customValidity,
        this.validityAnchor(),
      );
      return;
    }
    const { flags, message, anchor } = this.computeValidity();
    const invalid = Object.values(flags).some(Boolean);
    if (invalid) {
      this[internals].setValidity(
        flags,
        message || ' ',
        anchor ?? this.validityAnchor(),
      );
    } else {
      this[internals].setValidity({});
    }
  }

  /** The element the browser points at when it reports a problem. */
  protected validityAnchor(): HTMLElement | undefined {
    return undefined;
  }

  /** The message to show under the control, or '' while there is nothing to show. */
  protected get validationText(): string {
    if (!this.showValidity) return '';
    this.updateValidity();
    return this[internals].validity.valid
      ? ''
      : this[internals].validationMessage;
  }

  // ── Form association ─────────────────────────────────────────────────────

  override [getFormValue](): FormValue | null {
    if (this.value === undefined || this.value === null) return null;
    return String(this.value);
  }

  formResetCallback() {
    this.__suggestions.set(null);
    this.value = this.__defaultValue;
    this.showValidity = false;
  }

  formStateRestoreCallback(restored: FormRestoreState | null) {
    this.value =
      restored === null
        ? this.__defaultValue
        : this.parseRestoreState(restored);
  }

  /** Turns saved form state back into a value. Strings by default. */
  protected parseRestoreState(restored: FormRestoreState): unknown {
    return typeof restored === 'string' ? restored : this.__defaultValue;
  }

  // ── Private ──────────────────────────────────────────────────────────────

  private __handleInvalid = (event: Event) => {
    // Show the message under the control instead of the browser bubble, and move focus to the
    // first invalid control of the submission.
    event.preventDefault();
    this.showValidity = true;
    if (!focusClaimed) {
      focusClaimed = true;
      this.focus();
      queueMicrotask(() => {
        focusClaimed = false;
      });
    }
  };

  private __handleCommit = (event: Event) => {
    if (event.target === this) this.showValidity = true;
  };
}
