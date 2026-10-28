import { html, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import { spread } from '@/__internal/directive/spread.js';
import {
  type FormRestoreState,
  type FormValue,
  getFormState,
  getFormValue,
} from '@/__internal/mixins/form-associated.js';
import IndividualComponent from '@/IndividualComponent.js';

import styles from './switch.scss';
import BaseInput from '../input/BaseInput.js';

/**
 * @label Switch
 * @tag wc-switch
 * @rawTag switch
 *
 * @summary Captures boolean input with an on/off switch interaction.
 * @overview
 * <p>Toggles are used to enable or disable a single option. They provide immediate feedback about whether an option is active or inactive.</p>
 * <p>The switch is form-associated: when <code>checked</code>, it submits <code>on</code> under its <code>name</code>.</p>
 *
 * @cssprop --switch-track-color: Color of the switch track when checked.
 * @cssprop --switch-track-off-color: Color of the switch track when unchecked.
 * @cssprop --switch-width: Width of the switch track.
 * @cssprop --switch-height: Height of the switch track.
 * @cssprop --switch-handle-radius: Size of the switch handle.
 * @cssprop --switch-handle-color: Color of the switch handle.
 *
 * @fires {CustomEvent} change - Dispatched when the switch is toggled. Detail: `{ checked, value, originalEvent }`.
 * @fires {CustomEvent} blur - Dispatched when the switch loses focus.
 * @fires {CustomEvent} focus - Dispatched when the switch receives focus.
 *
 * @example
 * ```html
 * <wc-switch checked label="Wi-Fi"></wc-switch>
 * ```
 * @tags input, form
 */
@IndividualComponent
export class Switch extends BaseInput {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /**
   * Whether the switch is on.
   */
  @property({ type: Boolean, reflect: true })
  checked: boolean = false;

  /**
   * @deprecated Use `checked`. Kept as an alias of `checked`.
   */
  @property({ type: Boolean })
  get value(): boolean {
    return this.checked;
  }

  set value(value: boolean) {
    this.checked = Boolean(value);
  }

  /**
   * The switch label.
   */
  @property({ type: String })
  label: string = '';

  /**
   * If true, the toggle has rounded corners. Defaults to `true`.
   */
  @property({ type: Boolean })
  rounded: boolean = true;

  @property({ type: Boolean, reflect: true, attribute: 'with-icon' })
  withIcon: boolean = false;

  /**
   * Configuration object for aria attributes.
   */
  @property({ type: Object })
  configAria: Record<string, string> = {};

  // ── State ────────────────────────────────────────────────────────────────

  @state()
  private hasFocus = false;

  @state()
  private isActive = false;

  @state()
  private slotHasContent = false;

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('.track')
  private trackElement?: HTMLElement;

  // ── Private fields ───────────────────────────────────────────────────────

  private tabindex?: string;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  connectedCallback() {
    super.connectedCallback();
    this.handleInitialAttributes();
    window.addEventListener('mouseup', this.windowMouseUp);
    window.addEventListener('keyup', this.windowKeyUp);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('mouseup', this.windowMouseUp);
    window.removeEventListener('keyup', this.windowKeyUp);
  }

  firstUpdated() {
    this.slotHasContent = this.hasChildNodes();
  }

  // ── Public methods ───────────────────────────────────────────────────────

  /**
   * Sets focus on the toggle.
   */
  focus() {
    this.trackElement?.focus();
  }

  /**
   * Removes focus from the toggle.
   */
  blur() {
    this.trackElement?.blur();
  }

  // ── Form association ─────────────────────────────────────────────────────

  override [getFormValue](): FormValue | null {
    return this.checked ? 'on' : null;
  }

  override [getFormState](): FormValue | null {
    return String(this.checked);
  }

  override formStateRestoreCallback(state: FormRestoreState | null) {
    this.checked = state === 'true';
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private handleInitialAttributes() {
    if (this.hasAttribute('tabindex')) {
      this.tabindex = this.getAttribute('tabindex') || undefined;
      this.removeAttribute('tabindex');
    }

    Array.from(this.attributes).forEach(attr => {
      if (attr.name.startsWith('aria-')) {
        this.configAria[attr.name] = attr.value;
        this.removeAttribute(attr.name);
      }
    });
  }

  private windowMouseUp = () => {
    if (this.isActive) {
      this.isActive = false;
    }
  };

  private windowKeyUp = (evt: KeyboardEvent) => {
    if (this.isActive && evt.key === ' ') {
      this.isActive = false;
    }
  };

  private mouseDownHandler = () => {
    this.isActive = true;
  };

  private keyDownHandler = (evt: KeyboardEvent) => {
    if (evt.key === ' ') {
      evt.preventDefault();
      this.isActive = true;
      this.clickHandler(evt);
    }
  };

  private clickHandler = (ev: MouseEvent | KeyboardEvent) => {
    if (!this.disabled && !this.readonly) {
      this.checked = !this.checked;
      this.dispatchEvent(
        new CustomEvent('change', {
          detail: {
            checked: this.checked,
            value: this.checked,
            originalEvent: ev,
          },
          bubbles: true,
          composed: true,
        }),
      );
      this.trackElement?.focus();
    }
  };

  private blurHandler = (ev: FocusEvent) => {
    this.hasFocus = false;
    this.dispatchEvent(
      new CustomEvent('blur', {
        detail: ev,
        bubbles: true,
        composed: true,
      }),
    );
  };

  private focusHandler = (ev: FocusEvent) => {
    this.hasFocus = true;
    this.dispatchEvent(
      new CustomEvent('focus', {
        detail: ev,
        bubbles: true,
        composed: true,
      }),
    );
  };

  private handleKeyUp = (evt: KeyboardEvent) => {
    if (evt.key === 'Enter') {
      this.clickHandler(evt);
    }
  };

  // ── Render helpers ───────────────────────────────────────────────────────

  __renderIcon() {
    if (this.withIcon) {
      if (this.checked)
        return html`<wc-icon name="check" class="icon"></wc-icon>`;
      return html`<wc-icon name="close" class="icon"></wc-icon>`;
    }
    return nothing;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const cssClasses = {
      switch: true,
      'state-checked': this.checked,
      'has-focus': this.hasFocus,
      active: this.isActive,
      disabled: this.disabled,
      readonly: this.readonly,
      required: this.required,
      rounded: this.rounded,
      'has-content': this.slotHasContent,
    };

    return html`
      <label class=${classMap(cssClasses)}>
        <div
          class="track"
          tabindex=${this.tabindex || 0}
          @keyup=${this.handleKeyUp}
          @mousedown=${this.mouseDownHandler}
          @keydown=${this.keyDownHandler}
          @blur=${this.blurHandler}
          @focus=${this.focusHandler}
          role="switch"
          aria-disabled=${this.disabled}
          aria-required=${this.required}
          aria-checked=${this.checked}
          ${spread(this.configAria)}
        >
          <div class="handle">${this.__renderIcon()}</div>
        </div>

        <input
          type="checkbox"
          class="input-native"
          name=${this.name}
          .checked=${this.checked}
          aria-hidden="true"
          ?required=${this.required}
          tabindex="-1"
          @click=${this.clickHandler}
        />

        ${this.label
          ? html`<div class="label">${this.label}</div>`
          : html`<div class="slot-container"><slot></slot></div>`}
      </label>
    `;
  }
}
