import { i, _ as __decorate, I as IndividualComponent, w, b } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { e } from './class-map-NDIkZErE.js';
import { s as spread } from './spread-B5cgadZl.js';
import { p as peacockString } from './strings-DnYjGbbc.js';
import { T as ToggleBase } from './toggle-base-BiKzcZEZ.js';
import './directive-ZPhl09Yt.js';
import './state-BCeDVCI9.js';
import './query-CHb9Ft_d.js';
import './base-Cl6v8-BZ.js';
import './form-associated-BHbg72PG.js';
import './element-internals-QME0yEz4.js';
import './BaseInput-BvS0tw15.js';
import './suggestion-controller-BKMbUhgq.js';
import './ai-controller-DR_Tg0sN.js';
import './locale-DEsJZCQG.js';

var css_248z = i`* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.screen-reader-only {
  position: absolute !important;
  inline-size: 1px !important;
  block-size: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip-path: inset(50%) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

[hidden] {
  display: none !important;
}

@media (forced-colors: active) {
  .selected,
  [aria-selected=true],
  [aria-pressed=true],
  [aria-checked=true],
  [aria-current]:not([aria-current=false]) {
    outline: 2px solid Highlight;
    outline-offset: -2px;
  }
  .disabled,
  [aria-disabled=true] {
    color: GrayText;
  }
}
:host {
  display: inline-block;
  --checkbox-size: 18px;
  --checkbox-icon-size: 12px;
  --checkbox-selected-color: var(--color-primary);
  --checkbox-unselected-color: var(--color-on-surface-variant);
  --checkbox-checkmark-color: var(--color-on-primary);
  --checkbox-state-layer-size: 40px;
  --checkbox-disabled-opacity: 0.38;
  --checkbox-border-radius: calc(var(--shape-corner-extra-small) / 2);
}

.checkbox {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  vertical-align: middle;
  font-family: var(--typography-body-medium-font-family) !important;
  font-size: var(--typography-body-medium-font-size) !important;
  font-weight: var(--typography-body-medium-font-weight) !important;
  line-height: var(--typography-body-medium-line-height) !important;
  letter-spacing: var(--typography-body-medium-letter-spacing) !important;
}
.checkbox.has-content {
  gap: 8px;
}
.checkbox .input-native {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
.checkbox .container {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--checkbox-state-layer-size);
  height: var(--checkbox-state-layer-size);
  cursor: inherit;
  outline: none;
  flex-shrink: 0;
}
.checkbox .ripple {
  border-radius: 50%;
  --ripple-pressed-color: var(--color-on-surface);
}
.checkbox .outline {
  position: absolute;
  width: var(--checkbox-size);
  height: var(--checkbox-size);
  border: 2px solid var(--checkbox-unselected-color);
  border-radius: var(--checkbox-border-radius);
  box-sizing: border-box;
  transition: border-color var(--duration-short2) var(--easing-standard);
}
.checkbox .background {
  position: absolute;
  width: var(--checkbox-size);
  height: var(--checkbox-size);
  background: var(--checkbox-selected-color);
  border-radius: var(--checkbox-border-radius);
  opacity: 0;
  transform: scale(0);
  transition: transform var(--duration-short2) var(--easing-standard), opacity var(--duration-short2) var(--easing-standard);
}
.checkbox .icon {
  position: absolute;
  width: var(--checkbox-icon-size);
  height: var(--checkbox-icon-size);
  fill: none;
  stroke: var(--checkbox-checkmark-color);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0;
  transition: opacity var(--duration-short1) var(--easing-standard);
}
.checkbox .icon .checkmark {
  stroke-dasharray: 14;
  stroke-dashoffset: 14;
  transition: stroke-dashoffset var(--duration-short4) var(--easing-emphasized);
}
.checkbox .icon .indeterminate {
  transform-origin: center;
  opacity: 0;
  transition: opacity var(--duration-short1) var(--easing-standard);
}
.checkbox .label {
  color: var(--color-on-surface);
  cursor: inherit;
}
.checkbox:hover:not(.disabled):not(.readonly).state-checked .ripple, .checkbox:hover:not(.disabled):not(.readonly).state-indeterminate .ripple {
  --ripple-pressed-color: var(--checkbox-selected-color);
}
.checkbox .focus-ring {
  --focus-ring-container-shape-start-start: 50%;
  --focus-ring-container-shape-start-end: 50%;
  --focus-ring-container-shape-end-start: 50%;
  --focus-ring-container-shape-end-end: 50%;
}
.checkbox.has-focus:not(.active):not(.disabled):not(.readonly).state-checked .ripple, .checkbox.has-focus:not(.active):not(.disabled):not(.readonly).state-indeterminate .ripple {
  --ripple-pressed-color: var(--checkbox-selected-color);
}
.checkbox.active:not(.disabled):not(.readonly).state-checked .ripple, .checkbox.active:not(.disabled):not(.readonly).state-indeterminate .ripple {
  --ripple-pressed-color: var(--checkbox-selected-color);
}
.checkbox.rounded {
  --checkbox-border-radius: var(--shape-corner-full);
}

.checkbox.state-checked .outline {
  border-color: transparent;
}
.checkbox.state-checked .background {
  opacity: 1;
  transform: scale(1);
}
.checkbox.state-checked .icon {
  opacity: 1;
}
.checkbox.state-checked .icon .checkmark {
  stroke-dashoffset: 0;
}

.checkbox.state-indeterminate .outline {
  border-color: transparent;
}
.checkbox.state-indeterminate .background {
  opacity: 1;
  transform: scale(1);
}
.checkbox.state-indeterminate .icon {
  opacity: 1;
  fill: var(--checkbox-checkmark-color);
}
.checkbox.state-indeterminate .icon .indeterminate {
  opacity: 1;
}

.checkbox.size-sm {
  --checkbox-size: 16px;
  --checkbox-icon-size: 10px;
  --checkbox-state-layer-size: 36px;
  font-size: var(--typography-body-small-font-size);
  line-height: var(--typography-body-small-line-height);
}
.checkbox.size-sm .icon {
  stroke-width: 1.5;
}

.checkbox.size-md {
  --checkbox-size: 18px;
  --checkbox-icon-size: 12px;
  --checkbox-state-layer-size: 40px;
}
.checkbox.size-md .icon {
  stroke-width: 2;
}

.checkbox.size-lg {
  --checkbox-size: 24px;
  --checkbox-icon-size: 16px;
  --checkbox-state-layer-size: 48px;
  font-size: var(--typography-body-large-font-size);
  line-height: var(--typography-body-large-line-height);
}
.checkbox.size-lg .icon {
  stroke-width: 2.5;
}

.checkbox.readonly {
  cursor: default;
}
.checkbox.readonly .label {
  color: var(--color-on-surface);
}
.checkbox.readonly .outline {
  border-color: var(--color-on-surface-variant);
}
.checkbox.readonly.state-checked .background, .checkbox.readonly.state-indeterminate .background {
  background: var(--color-on-surface-variant);
}
.checkbox.readonly .state-layer {
  display: none;
}

.checkbox.disabled {
  cursor: not-allowed;
  opacity: var(--checkbox-disabled-opacity);
}
.checkbox.disabled .label {
  color: var(--color-on-surface);
}
.checkbox.disabled .outline {
  border-color: var(--color-on-surface);
}
.checkbox.disabled.state-checked .background, .checkbox.disabled.state-indeterminate .background {
  background: var(--color-on-surface);
}
.checkbox.disabled .state-layer {
  display: none;
}

@media (forced-colors: active) {
  .outline {
    border-color: CanvasText;
  }
  .checkbox.state-checked .background,
  .checkbox.state-indeterminate .background {
    forced-color-adjust: none;
    background: Highlight;
  }
  .checkbox.state-checked .icon,
  .checkbox.state-indeterminate .icon {
    forced-color-adjust: none;
    fill: HighlightText;
    stroke: HighlightText;
  }
  .checkbox.disabled .outline {
    border-color: GrayText;
  }
  .checkbox.disabled.state-checked .background,
  .checkbox.disabled.state-indeterminate .background {
    background: GrayText;
  }
}
.suggestion-badge {
  margin-inline-start: var(--spacing-100);
}`;

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
let Checkbox = class Checkbox extends ToggleBase {
    constructor() {
        // ── Static ───────────────────────────────────────────────────────────────
        super(...arguments);
        // ── Properties ───────────────────────────────────────────────────────────
        // `name`, `disabled`, `required`, `readonly`, `label`, `checked`, `value` and `configAria` are
        // inherited.
        /**
         * If true, displays the checkbox in an indeterminate state.
         */
        this.indeterminate = false;
        /**
         * If true, the checkbox has rounded corners. Defaults to `false`.
         */
        this.rounded = false;
        /**
         * The checkbox size.
         * Possible values are: `"sm"`, `"md"`, `"lg"`. Defaults to `"md"`.
         */
        this.size = 'md';
        // ── Private methods ──────────────────────────────────────────────────────
        this.keyDownHandler = (event) => {
            if (event.key === ' ') {
                event.preventDefault();
                this.isActive = true;
                this.toggleChecked(event);
            }
        };
        this.clickHandler = (event) => {
            this.toggleChecked(event);
        };
    }
    // ── Form association ─────────────────────────────────────────────────────
    formResetCallback() {
        super.formResetCallback();
        this.indeterminate = false;
    }
    // ── Protected methods ────────────────────────────────────────────────────
    valueMissingText() {
        return peacockString('valueMissingCheckbox');
    }
    afterToggle() {
        this.indeterminate = false;
    }
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
        return b `
      <label class=${e(cssClasses)}>
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
            ? w `
                  <path
                    class="checkmark"
                    d="M2 6L5 9L10 2"
                  />
                `
            : this.indeterminate
                ? w `<rect
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
};
Checkbox.styles = [css_248z];
__decorate([
    n({ type: Boolean, reflect: true })
], Checkbox.prototype, "indeterminate", void 0);
__decorate([
    n({ type: Boolean })
], Checkbox.prototype, "rounded", void 0);
__decorate([
    n({ type: String })
], Checkbox.prototype, "size", void 0);
Checkbox = __decorate([
    IndividualComponent
], Checkbox);

export { Checkbox };
//# sourceMappingURL=checkbox.js.map
