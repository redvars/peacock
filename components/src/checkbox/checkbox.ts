import { html, svg } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import { spread } from '@/__internal/directive/spread.js';
import { peacockString } from '@/__internal/i18n/strings.js';
import ToggleBase from '@/__internal/toggle-base.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './checkbox.scss';

/**
 * @label Checkbox
 * @tag wc-checkbox
 * @rawTag checkbox
 * @summary A box the person checks to turn an option on or off, with a mixed state for a partly checked group.
 * @overview
 * <p>Set <code>indeterminate</code> for the mixed state, such as on a checkbox for a group whose
 * items are only partly checked.</p>
 * <p>The checkbox is form-associated: when <code>checked</code>, it submits its <code>value</code>
 * (<code>on</code> by default) under its <code>name</code>. With <code>required</code> it blocks form
 * submission until it is checked.</p>
 * @cssprop --checkbox-size: Size of the checkbox container.
 * @cssprop --checkbox-selected-color: Color of the checkbox when selected.
 * @cssprop --checkbox-unselected-color: Color of the checkbox border when unselected.
 * @cssprop --checkbox-checkmark-color: Color of the checkmark icon.
 * @cssprop --checkbox-state-layer-size: Size of the state layer for touch target.
 * @fires {CustomEvent<{checked: boolean, value: string, originalEvent?: Event}>} change - Dispatched when the checkbox is toggled.
 * @tags input, form
 *
 * @example
 * ```html
 * <wc-checkbox label="Accept terms" checked></wc-checkbox>
 * ```
 */
@IndividualComponent
export class Checkbox extends ToggleBase {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────
  // `name`, `disabled`, `required`, `readonly`, `label`, `checked`, `value` and `configAria` are
  // inherited.

  /**
   * If true, displays the checkbox in an indeterminate state.
   */
  @property({ type: Boolean, reflect: true })
  indeterminate: boolean = false;

  /**
   * If true, the checkbox has rounded corners. Defaults to `false`.
   */
  @property({ type: Boolean })
  rounded: boolean = false;

  /**
   * The checkbox size.
   * Possible values are: `"sm"`, `"md"`, `"lg"`. Defaults to `"md"`.
   */
  @property({ type: String })
  size: 'sm' | 'md' | 'lg' = 'md';

  // ── Form association ─────────────────────────────────────────────────────

  override formResetCallback() {
    super.formResetCallback();
    this.indeterminate = false;
  }

  // ── Protected methods ────────────────────────────────────────────────────

  protected override valueMissingText(): string {
    return peacockString('valueMissingCheckbox');
  }

  protected override afterToggle() {
    this.indeterminate = false;
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private keyDownHandler = (event: KeyboardEvent) => {
    if (event.key === ' ') {
      event.preventDefault();
      this.isActive = true;
      this.toggleChecked(event);
    }
  };

  private clickHandler = (event: MouseEvent) => {
    this.toggleChecked(event);
  };

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const cssClasses = {
      checkbox: true,
      'state-checked': this.checked,
      'state-indeterminate': !this.checked && this.indeterminate,
      [`size-${this.size}`]: true,
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
          id="container"
          class="container"
          role="checkbox"
          aria-checked=${this.checked
            ? 'true'
            : this.indeterminate
              ? 'mixed'
              : 'false'}
          @mousedown=${this.handleMouseDown}
          @keydown=${this.keyDownHandler}
          @focus=${this.handleFocusChange}
          @blur=${this.handleFocusChange}
          ${spread(this.controlAttributes())}
        >
          <wc-ripple class="ripple"></wc-ripple>
          <wc-focus-ring class="focus-ring" for="container"></wc-focus-ring>
          <div class="outline"></div>
          <div class="background"></div>
          <svg class="icon" viewBox="0 0 12 12">
            ${this.checked
              ? svg`
                  <path
                    class="checkmark"
                    d="M2 6L5 9L10 2"
                  />
                `
              : this.indeterminate
                ? svg`<rect
                    class="indeterminate"
                    x="2"
                    y="5"
                    width="8"
                    height="2"
                  />`
                : ''}
          </svg>
        </div>

        <input
          type="checkbox"
          class="input-native"
          .checked=${this.checked}
          .indeterminate=${this.indeterminate}
          aria-hidden="true"
          tabindex="-1"
          @click=${this.clickHandler}
        />

        ${this.renderLabel()}
      </label>
    `;
  }
}
