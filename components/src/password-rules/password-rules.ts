import { html, LitElement, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import IndividualComponent from '@/IndividualComponent.js';

import styles from './password-rules.scss';

/** One requirement a password must meet. */
export interface PasswordRule {
  /** Identifies the rule in `change`'s `failed` list. */
  id: string;
  /** Text shown in the checklist, such as "One number". */
  label: string;
  /** A pattern the password must contain, or a function that returns whether it passes. */
  test: RegExp | ((value: string) => boolean);
}

/** `detail` of `change`. */
export interface PasswordRulesChangeDetail {
  /** Whether every rule passes. */
  valid: boolean;
  /** Ids of the rules that fail, in checklist order. */
  failed: string[];
}

/** The ids of the built-in rules, in the order they are listed. */
export type BuiltInPasswordRuleId =
  | 'minlength'
  | 'uppercase'
  | 'lowercase'
  | 'number'
  | 'symbol';

/** A field the checklist can follow: `wc-password-field`, or anything with the same surface. */
interface ConnectedField extends Element {
  value?: unknown;
  setCustomValidity?(message: string): void;
}

/** How long typing has to pause before rule changes are announced. */
const ANNOUNCE_DELAY = 1000;

/** Whether `value` passes `rule`. Stateless, even for a global pattern. */
export function testPasswordRule(rule: PasswordRule, value: string): boolean {
  if (typeof rule.test === 'function') return !!rule.test(value);
  // A copy starts at `lastIndex` 0, so a global or sticky pattern gives the same answer every time.
  return new RegExp(rule.test).test(value);
}

/**
 * @label Password Rules
 * @tag wc-password-rules
 * @rawTag password-rules
 *
 * @summary A live checklist of password requirements, shown under a new-password field.
 * @overview
 * <p>Password rules lists what a new password needs ("At least 12 characters", "One number") and
 * ticks each requirement off as the person types. Each item shows its state with an icon shape and,
 * for screen readers, the words "met" or "not met"; color is never the only cue. Changes are
 * announced politely once typing pauses, and only for the requirements whose state flipped.</p>
 * <p>Point <code>for</code> at the id of a <code>wc-password-field</code> in the same document or
 * shadow root: the checklist follows the field's <code>input</code> events and, while a typed
 * password fails a rule, sets the field's custom validity, so the form will not submit. An empty
 * field is left to its own <code>required</code>. Without <code>for</code>, set
 * <code>value</code> yourself.</p>
 * <p>The common rules are attributes with translated labels: <code>minlength</code>,
 * <code>require-uppercase</code>, <code>require-lowercase</code>, <code>require-number</code> and
 * <code>require-symbol</code>. Add your own with the <code>rules</code> property:
 * <code>{ id, label, test }</code>, where <code>test</code> is a <code>RegExp</code> or a function.
 * They are listed after the built-in ones.</p>
 *
 * @fires {CustomEvent<{valid: boolean, failed: string[]}>} change - Dispatched when the password goes from failing to passing or back. `failed` holds the ids of the failing rules.
 *
 * @cssprop --password-rules-met-color - Icon color of a met rule.
 * @cssprop --password-rules-unmet-color - Icon color of an unmet rule.
 *
 * @example
 * ```html
 * <wc-password-field id="new-password" label="New password" autocomplete="new-password" required></wc-password-field>
 * <wc-password-rules for="new-password" minlength="12" require-number require-symbol></wc-password-rules>
 * ```
 * @tags input, form
 */
@IndividualComponent
export class PasswordRules extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** Id of the password field to follow, as on `<label for>`. */
  @property({ type: String, attribute: 'for' })
  htmlFor = '';

  /** The password to check. Kept in step with the field named by `for`. */
  @property({ type: String })
  value = '';

  /** Lists "At least N characters". Unset or 0 for no length rule. */
  @property({ type: Number, attribute: 'minlength' })
  minLength?: number;

  /** Lists "One uppercase letter". */
  @property({ type: Boolean, attribute: 'require-uppercase' })
  requireUppercase = false;

  /** Lists "One lowercase letter". */
  @property({ type: Boolean, attribute: 'require-lowercase' })
  requireLowercase = false;

  /** Lists "One number". */
  @property({ type: Boolean, attribute: 'require-number' })
  requireNumber = false;

  /** Lists "One symbol": any character that is not a letter, a digit or white space. */
  @property({ type: Boolean, attribute: 'require-symbol' })
  requireSymbol = false;

  /** Your own rules, listed after the built-in ones. */
  @property({ attribute: false })
  rules: PasswordRule[] = [];

  // ── State ────────────────────────────────────────────────────────────────

  /** Text of the polite live region. */
  @state() private announcement = '';

  // ── Private fields ───────────────────────────────────────────────────────

  /** Peacock's strings for the built-in labels and the announcements. */
  private readonly i18n = new I18nController(this);

  /** Whether each rule passed at the last check, by id. */
  private results = new Map<string, boolean>();

  /** Whether every rule passed at the last check; unset before the first. */
  private lastValid?: boolean;

  /** Rules whose state flipped since the last announcement. */
  private pendingFlips = new Set<string>();

  private announceTimer?: ReturnType<typeof setTimeout>;

  /** The document or shadow root whose `input` events are watched. */
  private watchedRoot?: Document | ShadowRoot;

  /** The field whose custom validity was last set, and the message it was given. */
  private validityTarget?: ConnectedField;

  private validityMessage = '';

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    const root = this.getRootNode();
    if (root instanceof Document || root instanceof ShadowRoot) {
      this.watchedRoot = root;
      root.addEventListener('input', this.handleRootInput);
    }
    this.syncFromField();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.watchedRoot?.removeEventListener('input', this.handleRootInput);
    this.watchedRoot = undefined;
    clearTimeout(this.announceTimer);
    this.setFieldValidity(undefined, '');
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    if (changed.has('htmlFor') && this.hasUpdated) this.syncFromField();
    this.evaluate();
  }

  protected override updated() {
    if (!this.htmlFor) {
      this.setFieldValidity(undefined, '');
      return;
    }
    const failing = !!this.value && !this.valid;
    this.setFieldValidity(
      this.findField(),
      failing ? this.i18n.t('passwordRulesInvalid') : '',
    );
  }

  // ── Public methods ───────────────────────────────────────────────────────

  /** Whether `value` passes every rule. */
  get valid(): boolean {
    return this.activeRules().every(rule => this.passes(rule));
  }

  /** The rules in checklist order: the built-in ones, then `rules`. */
  activeRules(): PasswordRule[] {
    const builtIn: PasswordRule[] = [];
    const minLength = this.minLength ?? 0;
    if (minLength > 0) {
      builtIn.push({
        id: 'minlength',
        label: this.i18n.t('passwordRuleMinLength')(minLength),
        // Count code points, so an emoji is one character.
        test: value => Array.from(value).length >= minLength,
      });
    }
    if (this.requireUppercase) {
      builtIn.push({
        id: 'uppercase',
        label: this.i18n.t('passwordRuleUppercase'),
        test: /\p{Lu}/u,
      });
    }
    if (this.requireLowercase) {
      builtIn.push({
        id: 'lowercase',
        label: this.i18n.t('passwordRuleLowercase'),
        test: /\p{Ll}/u,
      });
    }
    if (this.requireNumber) {
      builtIn.push({
        id: 'number',
        label: this.i18n.t('passwordRuleNumber'),
        test: /\p{Nd}/u,
      });
    }
    if (this.requireSymbol) {
      builtIn.push({
        id: 'symbol',
        label: this.i18n.t('passwordRuleSymbol'),
        test: /[^\p{L}\p{N}\s]/u,
      });
    }
    return [...builtIn, ...(Array.isArray(this.rules) ? this.rules : [])];
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private passes(rule: PasswordRule): boolean {
    return testPasswordRule(rule, this.value ?? '');
  }

  /** Checks every rule, queues announcements for the ones that flipped, fires `change`. */
  private evaluate() {
    const rules = this.activeRules();
    const results = new Map<string, boolean>();
    for (const rule of rules) results.set(rule.id, this.passes(rule));

    const first = this.lastValid === undefined;
    if (!first) {
      for (const [id, met] of results) {
        const before = this.results.get(id);
        if (before !== undefined && before !== met) this.pendingFlips.add(id);
      }
      if (this.pendingFlips.size) this.scheduleAnnouncement();
    }
    this.results = results;

    const valid = [...results.values()].every(Boolean);
    if (!first && valid !== this.lastValid) {
      const failed = rules.filter(rule => !results.get(rule.id)).map(r => r.id);
      this.dispatchEvent(
        new CustomEvent<PasswordRulesChangeDetail>('change', {
          detail: { valid, failed },
          bubbles: true,
          composed: true,
        }),
      );
    }
    this.lastValid = valid;
  }

  private scheduleAnnouncement() {
    clearTimeout(this.announceTimer);
    this.announceTimer = setTimeout(() => this.announce(), ANNOUNCE_DELAY);
  }

  private announce() {
    const rules = this.activeRules();
    let message: string;
    if (rules.length && rules.every(rule => this.results.get(rule.id))) {
      message = this.i18n.t('passwordRulesAllMet');
    } else {
      message = rules
        .filter(rule => this.pendingFlips.has(rule.id))
        .map(rule =>
          this.i18n.t('passwordRuleAnnouncement')(
            rule.label,
            this.results.get(rule.id)
              ? this.i18n.t('passwordRuleMet')
              : this.i18n.t('passwordRuleNotMet'),
          ),
        )
        .join('. ');
    }
    this.pendingFlips.clear();
    if (!message) return;
    // Clear first, so the same message twice in a row is read again.
    this.announcement = '';
    setTimeout(() => {
      this.announcement = message;
    });
  }

  private findField(): ConnectedField | undefined {
    if (!this.htmlFor || !this.watchedRoot) return undefined;
    return this.watchedRoot.getElementById(this.htmlFor) ?? undefined;
  }

  /** Reads the value of the field named by `for`, if it is there yet. */
  private syncFromField() {
    const field = this.findField();
    if (field && field.value !== undefined && field.value !== null) {
      this.value = String(field.value);
    }
  }

  /** Sets `message` as the custom validity of `field`, clearing it on a field left behind. */
  private setFieldValidity(field: ConnectedField | undefined, message: string) {
    if (this.validityTarget && this.validityTarget !== field) {
      if (this.validityMessage) this.validityTarget.setCustomValidity?.('');
      this.validityTarget = undefined;
      this.validityMessage = '';
    }
    if (!field) return;
    if (field === this.validityTarget && message === this.validityMessage) {
      return;
    }
    field.setCustomValidity?.(message);
    this.validityTarget = field;
    this.validityMessage = message;
  }

  private handleRootInput = (event: Event) => {
    const target = event.target as ConnectedField | null;
    if (!this.htmlFor || !target || target.id !== this.htmlFor) return;
    const { detail } = event as CustomEvent<{ value?: unknown }>;
    const value = detail?.value ?? target.value;
    this.value = value === undefined || value === null ? '' : String(value);
  };

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    return html`
      <ul class="rules" aria-label=${this.i18n.t('passwordRulesLabel')}>
        ${this.activeRules().map(rule => {
          const met = this.passes(rule);
          return html`<li class=${classMap({ rule: true, met })}>
            <wc-icon
              class="rule-icon"
              name=${met ? 'check_circle' : 'radio_button_unchecked'}
              aria-hidden="true"
            ></wc-icon>
            <span class="rule-label">${rule.label}</span>
            <span class="screen-reader-only"
              >${met
                ? this.i18n.t('passwordRuleMet')
                : this.i18n.t('passwordRuleNotMet')}</span
            >
          </li>`;
        })}
      </ul>
      <div class="screen-reader-only" role="status" aria-live="polite">
        ${this.announcement}
      </div>
    `;
  }
}
