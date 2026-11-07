import { LitElement, html, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';

import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './form.scss';

/** A form's data as a plain object; a name submitted more than once becomes an array. */
export type FormValueObject = Record<string, File | string | (File | string)[]>;

/** `detail` of `submit`. */
export interface FormSubmitDetail {
  /** The form data as a plain object; repeated names are arrays. */
  value: FormValueObject;
  /** The same data as `FormData`, for sending files with `fetch()`. */
  formData: FormData;
  /** The button that submitted the form, or `null` for `requestSubmit()` and Enter. */
  submitter: HTMLElement | null;
}

/** `detail` of `dirty-change`. */
export interface FormDirtyChangeDetail {
  dirty: boolean;
}

/** One entry of the error summary. */
export interface FormError {
  /** The field's label, or `''` for an error that belongs to no field. */
  label: string;
  message: string;
  /** The field to focus, or `undefined` for an error that belongs to no field. */
  control?: HTMLElement;
}

/** What wc-form reads from a listed form element: native controls and Peacock fields alike. */
interface FormControl extends HTMLElement {
  name?: string;
  type?: string;
  label?: unknown;
  labels?: NodeList | null;
  configAria?: Record<string, string>;
  willValidate?: boolean;
  validity?: ValidityState;
  validationMessage?: string;
  checkValidity?: () => boolean;
  reportValidity?: () => boolean;
  setCustomValidity?: (message: string) => void;
  updateComplete?: Promise<unknown>;
  disabled?: boolean;
  loading?: boolean;
}

/** Turns `FormData` into a plain object; a name that appears more than once becomes an array. */
export function formDataToObject(data: FormData): FormValueObject {
  const result: FormValueObject = {};
  for (const [name, entry] of data.entries()) {
    if (!(name in result)) {
      result[name] = entry;
    } else {
      const existing = result[name];
      result[name] = Array.isArray(existing)
        ? [...existing, entry]
        : [existing, entry];
    }
  }
  return result;
}

/** A comparable string for one form data entry. */
function entryKey(entry: File | string): string {
  if (typeof entry === 'string') return `s:${entry}`;
  return `f:${entry.name}:${entry.size}:${entry.lastModified}:${entry.type}`;
}

/** The form's entries by name, in order, for dirty tracking. */
function snapshot(data: FormData): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const [name, entry] of data.entries()) {
    const list = map.get(name) ?? [];
    list.push(entryKey(entry));
    map.set(name, list);
  }
  return map;
}

function sameSnapshot(a: Map<string, string[]>, b: Map<string, string[]>) {
  if (a.size !== b.size) return false;
  for (const [name, list] of a) {
    const other = b.get(name);
    if (!other || other.length !== list.length) return false;
    if (list.some((entry, index) => entry !== other[index])) return false;
  }
  return true;
}

function isNativeControl(
  el: Element,
): el is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
  return (
    el instanceof HTMLInputElement ||
    el instanceof HTMLSelectElement ||
    el instanceof HTMLTextAreaElement
  );
}

/** Whether `el` is a submit button of the form: native, or a Peacock button with `type="submit"`. */
function isSubmitButton(el: FormControl): boolean {
  if (el instanceof HTMLButtonElement) return el.type === 'submit';
  if (el instanceof HTMLInputElement) {
    return el.type === 'submit' || el.type === 'image';
  }
  return el.localName.includes('-') && el.type === 'submit';
}

let formCount = 0;

/**
 * @label Form
 * @tag wc-form
 * @rawTag form
 *
 * @summary Wraps a native form with an error summary, dirty tracking, a busy state and server errors.
 * @overview
 * <p>Put a native <code>&lt;form&gt;</code> inside <code>wc-form</code>:
 * <code>&lt;wc-form&gt;&lt;form&gt;…&lt;/form&gt;&lt;/wc-form&gt;</code>. The form stays in the
 * page (light DOM), so every Peacock field and native control joins it as usual; a form inside
 * <code>wc-form</code>'s own shadow root could not see slotted fields.</p>
 * <p><strong>Validation.</strong> On submit, <code>wc-form</code> checks every field. While any is
 * invalid the form is not submitted: an error summary (a danger <code>wc-alert</code>) at the top
 * lists each field's label and message as links that focus the field, and focus moves to the
 * summary. The summary updates as fields are fixed and goes away when all are. Peacock fields also
 * show their message under the field. With <code>no-summary</code>, focus moves to the first
 * invalid field instead. A <code>novalidate</code> form, or a submit button with
 * <code>formnovalidate</code>, skips validation as natively.</p>
 * <p><strong>Submitting.</strong> A valid submission fires a cancelable <code>submit</code>
 * <code>CustomEvent</code> whose <code>detail.value</code> is the form data as a plain object
 * (repeated names become arrays), read through <code>FormData</code>. Call
 * <code>preventDefault()</code> to save it yourself; otherwise the form submits natively to its
 * <code>action</code>. The native <code>submit</code> event stops at <code>wc-form</code>, so
 * listeners see one event. Set <code>loading</code> while saving: submit buttons become busy
 * (<code>wc-button</code> gets <code>loading</code>, native buttons are disabled), the form gets
 * <code>aria-busy</code>, and further submits are ignored.</p>
 * <p><strong>Unsaved changes.</strong> <code>dirty</code> is true while any field's value differs
 * from its value when the form was set up, and <code>dirty-change</code> fires when it flips. Call
 * <code>markClean()</code> after a successful save to make the current values the new baseline;
 * resetting the form also makes it clean. <code>warn-unsaved</code> asks the browser to confirm
 * leaving the page while the form is dirty.</p>
 * <p><strong>Server errors.</strong> <code>setErrors({ email: 'Already taken' })</code> marks the
 * named fields invalid with those messages (through <code>setCustomValidity()</code>) and lists them
 * in the summary. An error clears when its field changes. A name that matches no field is listed
 * in the summary without a link, for errors about the whole form.</p>
 *
 * @slot - The native `<form>`.
 *
 * @fires {CustomEvent<{value: object, formData: FormData, submitter: HTMLElement | null}>} submit - Dispatched, cancelable, when a valid form is submitted. Cancel it to stop the native submission and save the data yourself.
 * @fires {CustomEvent<{dirty: boolean}>} dirty-change - Dispatched when `dirty` flips.
 *
 * @cssprop --form-summary-gap - Space between the error summary and the form.
 *
 * @example
 * ```html
 * <wc-form>
 *   <form>
 *     <wc-input label="Email" name="email" type="email" required></wc-input>
 *     <wc-button type="submit">Save</wc-button>
 *   </form>
 * </wc-form>
 * ```
 * @tags form
 */
@IndividualComponent
export class Form extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** Turns the error summary off; an invalid submit then focuses the first invalid field. */
  @property({ type: Boolean, reflect: true, attribute: 'no-summary' })
  noSummary = false;

  /** Asks the browser to confirm leaving the page while the form is `dirty`. */
  @property({ type: Boolean, reflect: true, attribute: 'warn-unsaved' })
  warnUnsaved = false;

  /** The app is saving: submit buttons are busy and further submits are ignored. */
  @property({ type: Boolean, reflect: true })
  loading = false;

  // ── State ────────────────────────────────────────────────────────────────

  /** The errors the summary lists; empty while it is hidden. */
  @state() private errors: FormError[] = [];

  /** Whether any field's value differs from the baseline. */
  @state() private isDirty = false;

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('.summary') private summaryElement?: HTMLElement;

  // ── Private fields ───────────────────────────────────────────────────────

  private readonly i18n = new I18nController(this);

  /** Id of the summary's headline, which names the summary. */
  private readonly headlineId = `wc-form-summary-${(formCount += 1)}`;

  /** The form's values when it was set up or last marked clean. */
  private baseline = new Map<string, string[]>();

  /** The form the baseline belongs to. */
  private baselineForm: HTMLFormElement | null = null;

  /** Whether the person has changed a value since the baseline was taken. */
  private interacted = false;

  /** Whether the summary is in use: from a failed submit or `setErrors()` until all are fixed. */
  private summaryActive = false;

  /** Server errors by field name. */
  private serverErrors = new Map<string, string>();

  /** Forms whose own `novalidate` was set before wc-form took over validation. */
  private readonly nativeNoValidate = new WeakMap<HTMLFormElement, boolean>();

  /** Submit buttons made busy by `loading`, with what was changed on each. */
  private busyButtons = new Map<FormControl, 'loading' | 'disabled'>();

  // ── Constructor ──────────────────────────────────────────────────────────

  constructor() {
    super();
    // Capture: decide before anyone sees the native event whether the form may submit at all.
    this.addEventListener('submit', this.handleSubmitCapture, true);
    this.addEventListener('submit', this.handleSubmitBubble);
    this.addEventListener('input', this.handleValueEvent);
    this.addEventListener('change', this.handleValueEvent);
    this.addEventListener('reset', this.handleReset);
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    window.addEventListener('beforeunload', this.handleBeforeUnload);
    this.setUpForm();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
  }

  protected override updated(changed: PropertyValues) {
    if (changed.has('isDirty')) {
      this.toggleAttribute('dirty', this.isDirty);
    }
    if (changed.has('loading')) this.applyLoading();
  }

  // ── Public methods ───────────────────────────────────────────────────────

  /** The native `<form>` inside, or `null`. */
  get form(): HTMLFormElement | null {
    return this.querySelector<HTMLFormElement>(':scope > form');
  }

  /** True while any field's value differs from the baseline. Reflected as the `dirty` attribute. */
  get dirty(): boolean {
    return this.isDirty;
  }

  /** The form data as a plain object; repeated names are arrays. */
  get value(): FormValueObject {
    const { form } = this;
    return form ? formDataToObject(new FormData(form)) : {};
  }

  /** Makes the current values the new baseline, for example after a successful save. */
  markClean(): void {
    this.takeBaseline();
    this.setDirty(false);
  }

  /**
   * Shows errors from the server on the named fields and in the summary, replacing earlier ones.
   * Each clears when its field changes; `setErrors({})` clears them all.
   */
  async setErrors(errors: Record<string, string>): Promise<void> {
    this.clearServerErrors();
    const { form } = this;
    if (!form) return;
    let first: FormControl | undefined;
    for (const [name, message] of Object.entries(errors)) {
      if (message) {
        this.serverErrors.set(name, message);
        for (const control of this.controlsNamed(name)) {
          control.setCustomValidity?.(message);
          // Fires `invalid`, so Peacock fields show the message under the field.
          control.checkValidity?.();
          first ??= control;
        }
      }
    }
    if (!this.serverErrors.size) {
      await this.refreshSummary();
      return;
    }
    if (this.noSummary) {
      if (first) this.focusControl(first);
      return;
    }
    this.summaryActive = true;
    await this.refreshSummary();
    this.focusSummary();
  }

  /** Checks every field and shows the summary for the invalid ones; returns whether all are valid. */
  async validate(): Promise<boolean> {
    const invalid = this.checkControls();
    if (!invalid.length && !this.formLevelErrors().length) return true;
    await this.showInvalid(invalid);
    return false;
  }

  // ── Private methods ──────────────────────────────────────────────────────

  /** Takes over validation of the form and records its starting values. */
  private setUpForm() {
    const { form } = this;
    if (!form || form === this.baselineForm) return;
    if (!this.nativeNoValidate.has(form)) {
      this.nativeNoValidate.set(form, form.noValidate);
    }
    // wc-form validates on submit itself, so the browser must not block the submit first.
    form.noValidate = true;
    this.baselineForm = form;
    this.takeBaseline();
    this.setDirty(false);
    this.awaitUpgrades(form);
  }

  /** Retakes the baseline once fields that are not defined yet upgrade and render. */
  private awaitUpgrades(form: HTMLFormElement) {
    const pending = new Set(
      Array.from(form.querySelectorAll(':not(:defined)'), el => el.localName),
    );
    for (const tag of pending) {
      customElements.whenDefined(tag).then(async () => {
        await this.settle();
        if (form !== this.baselineForm) return;
        if (!this.interacted) {
          this.takeBaseline();
          this.setDirty(false);
          return;
        }
        // Values changed meanwhile: add only the names the upgraded fields brought.
        for (const [name, list] of snapshot(new FormData(form))) {
          if (!this.baseline.has(name)) this.baseline.set(name, list);
        }
        this.updateDirty();
      });
    }
  }

  private takeBaseline() {
    const { form } = this;
    this.baseline = form ? snapshot(new FormData(form)) : new Map();
    this.interacted = false;
  }

  private setDirty(dirty: boolean) {
    if (dirty === this.isDirty) return;
    this.isDirty = dirty;
    this.dispatchEvent(
      new CustomEvent<FormDirtyChangeDetail>('dirty-change', {
        detail: { dirty },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private updateDirty() {
    const { form } = this;
    if (!form) return;
    this.setDirty(!sameSnapshot(snapshot(new FormData(form)), this.baseline));
  }

  /** The form's listed elements. */
  private controls(): FormControl[] {
    const { form } = this;
    return form ? (Array.from(form.elements) as FormControl[]) : [];
  }

  private controlsNamed(name: string): FormControl[] {
    return this.controls().filter(
      control => (control.name ?? control.getAttribute('name')) === name,
    );
  }

  /** Waits for every Peacock field to render, so its validity and form value are current. */
  private async settle() {
    await Promise.all(this.controls().map(control => control.updateComplete));
  }

  /** Checks every control (firing `invalid` on the invalid ones); returns the invalid ones. */
  private checkControls(): FormControl[] {
    return this.controls().filter(
      control =>
        control.willValidate !== false &&
        typeof control.checkValidity === 'function' &&
        !control.checkValidity(),
    );
  }

  /** Invalid controls without firing `invalid`. */
  private invalidControls(): FormControl[] {
    return this.controls().filter(
      control =>
        control.willValidate !== false && control.validity?.valid === false,
    );
  }

  /** Server errors whose name matches no field. */
  private formLevelErrors(): FormError[] {
    const errors: FormError[] = [];
    for (const [name, message] of this.serverErrors) {
      if (!this.controlsNamed(name).length) errors.push({ label: '', message });
    }
    return errors;
  }

  /** The summary entries for invalid controls; one per radio group. */
  private errorsFor(controls: FormControl[]): FormError[] {
    const seen = new Set<string>();
    const errors: FormError[] = [];
    for (const control of controls) {
      const message = control.validationMessage?.trim() ?? '';
      const name = control.name ?? '';
      const radio = !!name && control.type === 'radio';
      if (!radio || !seen.has(name)) {
        if (radio) seen.add(name);
        errors.push({ label: this.labelOf(control), message, control });
      }
    }
    return [...errors, ...this.formLevelErrors()];
  }

  /** A control's label: Peacock's `label`, its `<label>`s, its ARIA name, else its name. */
  private labelOf(control: FormControl): string {
    if (typeof control.label === 'string' && control.label.trim()) {
      return control.label.trim();
    }
    if (isNativeControl(control) && control.type === 'radio') {
      const legend = control
        .closest('fieldset')
        ?.querySelector('legend')
        ?.textContent?.trim();
      if (legend) return legend;
    }
    const labelText = Array.from(control.labels ?? [])
      .map(label => label.textContent?.trim() ?? '')
      .find(Boolean);
    if (labelText) return labelText;
    const ariaLabel =
      control.getAttribute('aria-label') ?? control.configAria?.['aria-label'];
    if (ariaLabel) return ariaLabel;
    const labelledBy = control.getAttribute('aria-labelledby');
    if (labelledBy) {
      const text = labelledBy
        .split(/\s+/)
        .map(id => document.getElementById(id)?.textContent?.trim() ?? '')
        .filter(Boolean)
        .join(' ');
      if (text) return text;
    }
    const placeholder = control.getAttribute('placeholder');
    if (placeholder) return placeholder;
    return control.name ?? '';
  }

  /** After a failed check: show the summary and focus it, or focus the first invalid field. */
  private async showInvalid(invalid: FormControl[]) {
    if (this.noSummary) {
      const first = invalid[0];
      if (first) this.focusControl(first);
      return;
    }
    this.summaryActive = true;
    this.errors = this.errorsFor(invalid);
    await this.updateComplete;
    this.focusSummary();
  }

  /** Recomputes the summary from the controls' current validity. */
  private async refreshSummary() {
    if (!this.summaryActive) return;
    await this.settle();
    const errors = this.errorsFor(this.invalidControls());
    this.errors = errors;
    if (!errors.length) this.summaryActive = false;
    await this.updateComplete;
  }

  private focusSummary() {
    this.summaryElement?.focus();
  }

  private focusControl(control: FormControl) {
    // A native control shows the browser's message; a Peacock field already shows its own.
    if (isNativeControl(control)) control.reportValidity();
    control.focus();
  }

  private clearServerErrors() {
    for (const name of this.serverErrors.keys()) {
      for (const control of this.controlsNamed(name)) {
        control.setCustomValidity?.('');
      }
    }
    this.serverErrors.clear();
  }

  /** Clears the server error of a field the person changed. */
  private clearServerErrorFor(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) return;
    const name = (target as FormControl).name ?? target.getAttribute('name');
    if (!name || !this.serverErrors.has(name)) return;
    this.serverErrors.delete(name);
    for (const control of this.controlsNamed(name)) {
      control.setCustomValidity?.('');
    }
  }

  /** Makes submit buttons busy while `loading`, and restores them after. */
  private applyLoading() {
    const { form } = this;
    if (this.loading) {
      form?.setAttribute('aria-busy', 'true');
      const buttons = this.controls().filter(
        control => isSubmitButton(control) && !this.busyButtons.has(control),
      );
      for (const control of buttons) {
        const custom =
          !isNativeControl(control) &&
          !(control instanceof HTMLButtonElement) &&
          'loading' in control;
        if (custom && !control.loading) {
          // A Peacock button shows a spinner and ignores clicks, and keeps focus.
          control.loading = true;
          this.busyButtons.set(control, 'loading');
        } else if (!custom && !control.disabled) {
          control.disabled = true;
          this.busyButtons.set(control, 'disabled');
        }
      }
    } else {
      form?.removeAttribute('aria-busy');
      for (const [control, changed] of this.busyButtons) {
        if (changed === 'loading') control.loading = false;
        else control.disabled = false;
      }
      this.busyButtons.clear();
    }
  }

  private handleSubmitCapture = (event: Event) => {
    const { form } = this;
    if (!(event instanceof SubmitEvent) || event.target !== form || !form) {
      return;
    }
    if (this.loading) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    const submitter = event.submitter as
      | HTMLButtonElement
      | HTMLInputElement
      | null;
    const skip =
      this.nativeNoValidate.get(form) === true ||
      submitter?.formNoValidate === true;
    if (skip) return;
    // Errors about the whole form are answered by this submit; field errors stay until changed.
    for (const [name] of this.serverErrors) {
      if (!this.controlsNamed(name).length) this.serverErrors.delete(name);
    }
    const invalid = this.checkControls();
    if (invalid.length) {
      // Nobody hears about a submit that did not happen.
      event.preventDefault();
      event.stopImmediatePropagation();
      this.showInvalid(invalid);
      return;
    }
    if (this.summaryActive) {
      this.summaryActive = false;
      this.errors = [];
    }
  };

  private handleSubmitBubble = (event: Event) => {
    const { form } = this;
    if (!(event instanceof SubmitEvent) || event.target !== form || !form) {
      return;
    }
    // One `submit` leaves wc-form: the CustomEvent below, with the data.
    event.stopImmediatePropagation();
    const submitter = (event.submitter as HTMLElement | null) ?? null;
    let formData: FormData;
    try {
      formData = new FormData(form, submitter);
    } catch {
      // `submitter` is not a native submit button, such as `wc-button`.
      formData = new FormData(form);
    }
    const custom = new CustomEvent<FormSubmitDetail>('submit', {
      detail: { value: formDataToObject(formData), formData, submitter },
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    if (!this.dispatchEvent(custom)) event.preventDefault();
  };

  private handleValueEvent = async (event: Event) => {
    if (event.target === this) return;
    this.interacted = true;
    this.clearServerErrorFor(event.target);
    const target = event.target as FormControl | null;
    await target?.updateComplete;
    this.updateDirty();
    await this.refreshSummary();
  };

  private handleReset = (event: Event) => {
    if (event.target !== this.form) return;
    this.clearServerErrors();
    // The fields reset after the `reset` event; take the new baseline once they have.
    setTimeout(async () => {
      if (event.defaultPrevented) return;
      await this.settle();
      this.summaryActive = false;
      this.errors = [];
      this.markClean();
    });
  };

  private handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (!this.warnUnsaved || !this.isDirty) return;
    event.preventDefault();
    // Older browsers show the prompt only when `returnValue` is set.
    // eslint-disable-next-line no-param-reassign
    event.returnValue = '';
  };

  private handleSlotChange() {
    this.setUpForm();
  }

  private handleErrorClick(event: Event, control?: HTMLElement) {
    event.preventDefault();
    control?.focus();
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private renderError(error: FormError) {
    const text = error.label
      ? this.i18n.t('formErrorItem')(error.label, error.message)
      : error.message;
    if (!error.control) return html`<li class="error">${text}</li>`;
    return html`<li class="error">
      <a
        class="error-link"
        href="#"
        @click=${(event: Event) => this.handleErrorClick(event, error.control)}
        >${text}</a
      >
    </li>`;
  }

  private renderSummary() {
    if (this.noSummary || !this.errors.length) return nothing;
    const count = this.errors.length;
    const formatted = new Intl.NumberFormat(this.i18n.locale).format(count);
    return html`<wc-alert
      class="summary"
      part="summary"
      intent="danger"
      role="group"
      tabindex="-1"
      aria-labelledby=${this.headlineId}
    >
      <span slot="label" id=${this.headlineId} class="headline"
        >${this.i18n.t('formErrorSummary')(formatted, count)}</span
      >
      <ul class="errors">
        ${this.errors.map(error => this.renderError(error))}
      </ul>
    </wc-alert>`;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    return html`${this.renderSummary()}<slot
        @slotchange=${this.handleSlotChange}
      ></slot>`;
  }
}
