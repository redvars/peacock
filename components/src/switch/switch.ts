import { html, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import { spread } from '@/__internal/directive/spread.js';
import { peacockString } from '@/__internal/i18n/strings.js';
import ToggleBase from '@/__internal/toggle-base.js';
import IndividualComponent from '@/IndividualComponent.js';

import styles from './switch.scss';

/**
 * @label Switch
 * @tag wc-switch
 * @rawTag switch
 *
 * @summary An on and off switch for a single setting, such as turning notifications on.
 * @overview
 * <p>The switch is form-associated: when <code>checked</code>, it submits its <code>value</code>
 * (<code>on</code> by default) under its <code>name</code>. With <code>required</code> it blocks form
 * submission until it is on.</p>
 *
 * @cssprop --switch-track-color: Color of the switch track when checked.
 * @cssprop --switch-track-off-color: Color of the switch track when unchecked.
 * @cssprop --switch-width: Width of the switch track.
 * @cssprop --switch-height: Height of the switch track.
 * @cssprop --switch-handle-radius: Size of the switch handle.
 * @cssprop --switch-handle-color: Color of the switch handle.
 *
 * @fires {CustomEvent<{checked: boolean, value: string, originalEvent?: Event}>} change - Dispatched when the switch is toggled.
 *
 * @example
 * ```html
 * <wc-switch checked label="Wi-Fi"></wc-switch>
 * ```
 * @tags input, form
 */
@IndividualComponent
export class Switch extends ToggleBase {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────
  // `name`, `disabled`, `required`, `readonly`, `label`, `checked`, `value` and `configAria` are
  // inherited.

  /**
   * If true, the toggle has rounded corners. Defaults to `true`.
   */
  @property({ type: Boolean })
  rounded: boolean = true;

  @property({ type: Boolean, reflect: true, attribute: 'with-icon' })
  withIcon: boolean = false;

  // ── Protected methods ────────────────────────────────────────────────────

  protected override valueMissingText(): string {
    return peacockString('valueMissingCheckbox');
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

  // ── Render helpers ───────────────────────────────────────────────────────

  private renderIcon() {
    if (!this.withIcon) return nothing;
    return this.checked
      ? html`<wc-icon name="check" class="icon"></wc-icon>`
      : html`<wc-icon name="close" class="icon"></wc-icon>`;
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
          class="track container"
          role="switch"
          aria-checked=${String(this.checked)}
          @mousedown=${this.handleMouseDown}
          @keydown=${this.keyDownHandler}
          @focus=${this.handleFocusChange}
          @blur=${this.handleFocusChange}
          ${spread(this.controlAttributes())}
        >
          <div class="handle">${this.renderIcon()}</div>
        </div>

        <input
          type="checkbox"
          class="input-native"
          .checked=${this.checked}
          aria-hidden="true"
          tabindex="-1"
          @click=${this.clickHandler}
        />

        ${this.renderLabel()}
      </label>
    `;
  }
}
