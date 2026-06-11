import { i, _ as __decorate, I as IndividualComponent, a as i$1, w, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { r } from './state-DkTK9EGF.js';
import { e } from './query-CHb9Ft_d.js';
import { e as e$1 } from './class-map-DG7CA1et.js';
import { s as spread } from './spread-B5cgadZl.js';
import './base-Cl6v8-BZ.js';
import './directive-ZPhl09Yt.js';

var css_248z = i`* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.screen-reader-only {
  display: none !important;
}

[hidden] {
  display: none !important;
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
  --checkbox-border-radius: 2px;
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
  --checkbox-border-radius: 18px;
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
  font-size: var(--font-size-body-small);
  line-height: var(--line-height-body-small);
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
  font-size: var(--font-size-body-large);
  line-height: var(--line-height-body-large);
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
}`;

/**
 * @label Checkbox
 * @tag wc-checkbox
 * @rawTag checkbox
 * @summary Captures boolean input with an optional indeterminate mode.
 * @overview
 * <p>Checkboxes allow users to select one or more items from a set. Checkboxes can turn an option on or off.</p>
 * <p>checkboxes feature a smooth animation and clear visual states for checked, unchecked, and indeterminate.</p>
 * @cssprop --checkbox-size: Size of the checkbox container.
 * @cssprop --checkbox-selected-color: Color of the checkbox when selected.
 * @cssprop --checkbox-unselected-color: Color of the checkbox border when unselected.
 * @cssprop --checkbox-checkmark-color: Color of the checkmark icon.
 * @cssprop --checkbox-state-layer-size: Size of the state layer for touch target.
 * @fires {CustomEvent} change - Dispatched when the checkbox value changes.
 * @fires {CustomEvent} blur - Dispatched when the checkbox loses focus.
 * @fires {CustomEvent} focus - Dispatched when the checkbox receives focus.
 * @tags input, form
 *
 * @example
 * ```html
 * <wc-checkbox label="Accept terms"></wc-checkbox>
 * ```
 */
let Checkbox = class Checkbox extends i$1 {
    constructor() {
        super(...arguments);
        /**
         * The input field name.
         */
        this.name = '';
        /**
         * The checkbox label.
         */
        this.label = '';
        /**
         * The input field value (checked state).
         */
        this.value = false;
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
        /**
         * If true, required icon is shown. Defaults to `false`.
         */
        this.required = false;
        /**
         * If true, the checkbox is readonly. Defaults to `false`.
         */
        this.readonly = false;
        /**
         * If true, the user cannot interact with the checkbox. Defaults to `false`.
         */
        this.disabled = false;
        /**
         * Configuration object for aria attributes.
         */
        this.configAria = {};
        /** True while the checkbox container has keyboard focus. */
        this.hasFocus = false;
        /** True while the user is actively pressing the checkbox (mouse/keyboard). */
        this.isActive = false;
        /** True when slotted label content is present. */
        this.slotHasContent = false;
        this.windowMouseUp = () => {
            if (this.isActive) {
                this.isActive = false;
            }
        };
        this.windowKeyUp = (evt) => {
            if (this.isActive && evt.key === ' ') {
                this.isActive = false;
            }
        };
        this.mouseDownHandler = () => {
            this.isActive = true;
        };
        this.keyDownHandler = (evt) => {
            if (evt.key === ' ') {
                evt.preventDefault();
                this.isActive = true;
                this.clickHandler(evt);
            }
        };
        this.clickHandler = (ev) => {
            if (!this.disabled && !this.readonly) {
                this.value = !this.value;
                this.indeterminate = false;
                this.dispatchEvent(new CustomEvent('change', {
                    detail: { value: this.value, originalEvent: ev },
                    bubbles: true,
                    composed: true,
                }));
                this.containerElement?.focus();
            }
        };
        this.blurHandler = (ev) => {
            this.hasFocus = false;
            this.dispatchEvent(new CustomEvent('blur', {
                detail: ev,
                bubbles: true,
                composed: true,
            }));
        };
        this.focusHandler = (ev) => {
            this.hasFocus = true;
            this.dispatchEvent(new CustomEvent('focus', {
                detail: ev,
                bubbles: true,
                composed: true,
            }));
        };
        this.handleKeyUp = (evt) => {
            if (evt.key === 'Enter') {
                this.clickHandler(evt);
            }
        };
    }
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
    handleInitialAttributes() {
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
    /**
     * Sets focus on the checkbox.
     */
    focus() {
        this.containerElement?.focus();
    }
    /**
     * Removes focus from the checkbox.
     */
    blur() {
        this.containerElement?.blur();
    }
    render() {
        const cssClasses = {
            checkbox: true,
            'state-checked': this.value,
            'state-indeterminate': !this.value && this.indeterminate,
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
      <label class=${e$1(cssClasses)}>
        <div
          id="container"
          class="container"
          tabindex=${this.tabindex || 0}
          @keyup=${this.handleKeyUp}
          @mousedown=${this.mouseDownHandler}
          @keydown=${this.keyDownHandler}
          @blur=${this.blurHandler}
          @focus=${this.focusHandler}
          role="checkbox"
          aria-disabled=${this.disabled}
          aria-required=${this.required}
          aria-checked=${this.value
            ? 'true'
            : this.indeterminate
                ? 'mixed'
                : 'false'}
          ${spread(this.configAria)}
        >
          <wc-ripple class="ripple"></wc-ripple>
          <wc-focus-ring class="focus-ring" for="container"></wc-focus-ring>
          <div class="outline"></div>
          <div class="background"></div>
          <svg class="icon" viewBox="0 0 12 12">
            ${this.value
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
          name=${this.name}
          .checked=${this.value}
          .indeterminate=${this.indeterminate}
          aria-hidden="true"
          ?required=${this.required}
          tabindex="-1"
          @click=${this.clickHandler}
        />

        ${this.label
            ? b `<div class="label">${this.label}</div>`
            : b `<div class="label slot-container"><slot></slot></div>`}
      </label>
    `;
    }
};
Checkbox.styles = [css_248z];
__decorate([
    n({ type: String })
], Checkbox.prototype, "name", void 0);
__decorate([
    n({ type: String })
], Checkbox.prototype, "label", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Checkbox.prototype, "value", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Checkbox.prototype, "indeterminate", void 0);
__decorate([
    n({ type: Boolean })
], Checkbox.prototype, "rounded", void 0);
__decorate([
    n({ type: String })
], Checkbox.prototype, "size", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Checkbox.prototype, "required", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Checkbox.prototype, "readonly", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Checkbox.prototype, "disabled", void 0);
__decorate([
    n({ type: Object })
], Checkbox.prototype, "configAria", void 0);
__decorate([
    r()
], Checkbox.prototype, "hasFocus", void 0);
__decorate([
    r()
], Checkbox.prototype, "isActive", void 0);
__decorate([
    r()
], Checkbox.prototype, "slotHasContent", void 0);
__decorate([
    e('.container')
], Checkbox.prototype, "containerElement", void 0);
__decorate([
    e('.input-native')
], Checkbox.prototype, "nativeElement", void 0);
Checkbox = __decorate([
    IndividualComponent
], Checkbox);

export { Checkbox };
//# sourceMappingURL=checkbox.js.map
