import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-Bdwyrvd6.js';
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
  --radio-size: 20px;
  --radio-dot-size: 12px;
  --radio-selected-color: var(--color-primary);
  --radio-unselected-color: var(--color-on-surface-variant);
  --radio-state-layer-size: 40px;
  --radio-disabled-opacity: 0.38;
}

.radio {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  vertical-align: middle;
  gap: 8px;
  font-family: var(--typography-body-medium-font-family) !important;
  font-size: var(--typography-body-medium-font-size) !important;
  font-weight: var(--typography-body-medium-font-weight) !important;
  line-height: var(--typography-body-medium-line-height) !important;
  letter-spacing: var(--typography-body-medium-letter-spacing) !important;
}
.radio .input-native {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
.radio .container {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--radio-state-layer-size);
  height: var(--radio-state-layer-size);
  cursor: inherit;
  outline: none;
  flex-shrink: 0;
}
.radio .state-layer {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  opacity: 0;
  transition: opacity var(--duration-short2) var(--easing-standard);
}
.radio .outer-circle {
  position: absolute;
  width: var(--radio-size);
  height: var(--radio-size);
  border: 2px solid var(--radio-unselected-color);
  border-radius: 50%;
  box-sizing: border-box;
  transition: border-color var(--duration-short2) var(--easing-standard);
}
.radio .inner-circle {
  position: absolute;
  width: var(--radio-dot-size);
  height: var(--radio-dot-size);
  background: var(--radio-selected-color);
  border-radius: 50%;
  opacity: 0;
  transform: scale(0.5);
  transition: transform var(--duration-short2) var(--easing-standard), opacity var(--duration-short2) var(--easing-standard);
}
.radio .label {
  color: var(--color-on-surface);
  cursor: inherit;
}
.radio:hover:not(.disabled):not(.readonly) .state-layer {
  opacity: 0.08;
  background: var(--color-on-surface);
}
.radio:hover:not(.disabled):not(.readonly).state-checked .state-layer {
  background: var(--radio-selected-color);
}
.radio.has-focus:not(.active):not(.disabled):not(.readonly) .state-layer {
  opacity: 0.12;
  background: var(--color-on-surface);
}
.radio.has-focus:not(.active):not(.disabled):not(.readonly) .container {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 50%;
}
.radio.has-focus:not(.active):not(.disabled):not(.readonly).state-checked .state-layer {
  background: var(--radio-selected-color);
}
.radio.active:not(.disabled):not(.readonly) .state-layer {
  opacity: 0.12;
  background: var(--color-on-surface);
}
.radio.active:not(.disabled):not(.readonly).state-checked .state-layer {
  background: var(--radio-selected-color);
}

.radio.state-checked .outer-circle {
  border-color: var(--radio-selected-color);
}
.radio.state-checked .inner-circle {
  opacity: 1;
  transform: scale(1);
}

.radio.readonly {
  cursor: default;
}
.radio.readonly .state-layer {
  display: none;
}
.radio.readonly .outer-circle {
  border-color: var(--color-on-surface-variant);
}
.radio.readonly.state-checked .inner-circle {
  background: var(--color-on-surface-variant);
}

.radio.disabled {
  cursor: not-allowed;
  opacity: var(--radio-disabled-opacity);
}
.radio.disabled .state-layer {
  display: none;
}
.radio.disabled .label {
  color: var(--color-on-surface);
}
.radio.disabled .outer-circle {
  border-color: var(--color-on-surface);
}
.radio.disabled.state-checked .inner-circle {
  background: var(--color-on-surface);
}`;

var Radio_1;
let Radio = Radio_1 = class Radio extends i$1 {
    constructor() {
        super(...arguments);
        /**
         * The input field name for grouping radios.
         */
        this.name = '';
        /**
         * The submitted value when this radio is selected.
         */
        this.value = '';
        /**
         * The radio label.
         */
        this.label = '';
        /**
         * Whether the radio is selected.
         */
        this.checked = false;
        /**
         * If true, required icon is shown. Defaults to `false`.
         */
        this.required = false;
        /**
         * If true, the radio is readonly. Defaults to `false`.
         */
        this.readonly = false;
        /**
         * If true, the user cannot interact with the radio. Defaults to `false`.
         */
        this.disabled = false;
        /**
         * Configuration object for aria attributes.
         */
        this.configAria = {};
        /** True while the radio container has keyboard focus. */
        this.hasFocus = false;
        /** True while the user is actively pressing the radio (mouse/keyboard). */
        this.isActive = false;
        /** True when slotted label content or `label` property is present. */
        this.slotHasContent = false;
        /** True for the one radio in the group that should receive tab focus (roving tabindex). */
        this.isGroupFocusTarget = false;
        this.windowMouseUp = () => {
            if (this.isActive) {
                this.isActive = false;
            }
        };
        this.windowKeyUp = (evt) => {
            if (this.isActive && evt.key === ' ') {
                evt.preventDefault();
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
                this.selectRadio(evt);
            }
            else if (evt.key === 'ArrowRight' || evt.key === 'ArrowDown') {
                evt.preventDefault();
                this.navigateGroup(Radio_1.DIRECTION_NEXT);
            }
            else if (evt.key === 'ArrowLeft' || evt.key === 'ArrowUp') {
                evt.preventDefault();
                this.navigateGroup(Radio_1.DIRECTION_PREVIOUS);
            }
        };
        this.clickHandler = (ev) => {
            this.selectRadio(ev);
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
        this.slotHasContent = this.hasChildNodes() || !!this.label;
        this.updateGroupFocusTarget();
    }
    updated(changedProps) {
        if (changedProps.has('label')) {
            this.slotHasContent = this.hasChildNodes() || !!this.label;
        }
        if (changedProps.has('checked') && this.checked) {
            this.uncheckSiblings();
        }
        if (changedProps.has('checked') || changedProps.has('name')) {
            this.updateGroupFocusTarget();
        }
    }
    handleInitialAttributes() {
        if (this.hasAttribute('tabindex')) {
            const attrValue = this.getAttribute('tabindex');
            if (attrValue !== null) {
                this.tabindex = parseInt(attrValue, 10);
            }
            this.removeAttribute('tabindex');
        }
        Array.from(this.attributes).forEach(attr => {
            if (attr.name.startsWith('aria-')) {
                this.configAria[attr.name] = attr.value;
                this.removeAttribute(attr.name);
            }
        });
    }
    selectRadio(ev) {
        if (this.disabled || this.readonly)
            return;
        if (!this.checked) {
            this.checked = true;
            this.uncheckSiblings();
            this.dispatchChange(ev);
        }
        this.containerElement?.focus();
    }
    dispatchChange(ev) {
        this.dispatchEvent(new CustomEvent('change', {
            detail: { value: this.value, checked: this.checked, originalEvent: ev },
            bubbles: true,
            composed: true,
        }));
    }
    uncheckSiblings() {
        if (!this.name || !this.checked)
            return;
        const radios = this.getGroupRadios();
        radios.forEach(radio => {
            if (radio === this)
                return;
            radio.checked = false;
        });
    }
    getGroupRadios() {
        if (!this.name)
            return [this];
        const scopeRoot = this.closest('form') ?? document;
        return Array.from(scopeRoot.querySelectorAll(`wc-radio[name="${this.name}"]`));
    }
    isRadioEnabled(radio) {
        return !radio.disabled && !radio.readonly;
    }
    updateGroupFocusTarget() {
        const group = this.getGroupRadios();
        if (!group.length)
            return;
        const enabledGroup = group.filter(radio => this.isRadioEnabled(radio));
        if (!enabledGroup.length) {
            group.forEach(radio => {
                radio.isGroupFocusTarget = false;
            });
            return;
        }
        const target = enabledGroup.find(radio => radio.checked) || enabledGroup[0];
        group.forEach(radio => {
            radio.isGroupFocusTarget = radio === target;
        });
    }
    navigateGroup(direction) {
        const group = this.getGroupRadios().filter(radio => this.isRadioEnabled(radio));
        if (!group.length)
            return;
        const currentIndex = group.indexOf(this);
        const startIndex = currentIndex >= 0 ? currentIndex : 0;
        const nextIndex = (startIndex + direction + group.length) % group.length;
        const target = group[nextIndex];
        target.selectRadio();
        target.containerElement?.focus();
    }
    /**
     * Sets focus on the radio.
     */
    focus() {
        this.containerElement?.focus();
    }
    /**
     * Removes focus from the radio.
     */
    blur() {
        this.containerElement?.blur();
    }
    render() {
        const cssClasses = {
            radio: true,
            'state-checked': this.checked,
            'has-focus': this.hasFocus,
            active: this.isActive,
            disabled: this.disabled,
            readonly: this.readonly,
            required: this.required,
            'has-content': this.slotHasContent,
        };
        return b `
      <label class=${e$1(cssClasses)}>
        <div
          class="container"
          tabindex=${this.isGroupFocusTarget
            ? this.tabindex !== undefined
                ? this.tabindex
                : 0
            : -1}
          role="radio"
          aria-disabled=${this.disabled}
          aria-required=${this.required}
          aria-checked=${this.checked}
          @click=${this.clickHandler}
          @mousedown=${this.mouseDownHandler}
          @keydown=${this.keyDownHandler}
          @blur=${this.blurHandler}
          @focus=${this.focusHandler}
          ${spread(this.configAria)}
        >
          <div class="state-layer"></div>
          <div class="outer-circle"></div>
          <div class="inner-circle"></div>
        </div>

        <input
          type="radio"
          class="input-native"
          name=${this.name}
          .value=${this.value}
          .checked=${this.checked}
          aria-hidden="true"
          ?required=${this.required}
          ?disabled=${this.disabled}
          tabindex="-1"
        />

        ${this.label
            ? b `<div class="label">${this.label}</div>`
            : b `<div class="label slot-container"><slot></slot></div>`}
      </label>
    `;
    }
};
Radio.DIRECTION_NEXT = 1;
Radio.DIRECTION_PREVIOUS = -1;
Radio.styles = [css_248z];
__decorate([
    n({ type: String })
], Radio.prototype, "name", void 0);
__decorate([
    n({ type: String })
], Radio.prototype, "value", void 0);
__decorate([
    n({ type: String })
], Radio.prototype, "label", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Radio.prototype, "checked", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Radio.prototype, "required", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Radio.prototype, "readonly", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Radio.prototype, "disabled", void 0);
__decorate([
    n({ type: Object })
], Radio.prototype, "configAria", void 0);
__decorate([
    r()
], Radio.prototype, "hasFocus", void 0);
__decorate([
    r()
], Radio.prototype, "isActive", void 0);
__decorate([
    r()
], Radio.prototype, "slotHasContent", void 0);
__decorate([
    r()
], Radio.prototype, "isGroupFocusTarget", void 0);
__decorate([
    e('.container')
], Radio.prototype, "containerElement", void 0);
__decorate([
    e('.input-native')
], Radio.prototype, "nativeElement", void 0);
Radio = Radio_1 = __decorate([
    IndividualComponent
], Radio);

export { Radio };
//# sourceMappingURL=radio.js.map
