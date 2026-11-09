import { i, _ as __decorate, I as IndividualComponent, b } from './IndividualComponent-BK7XZjE2.js';
import { r } from './state-BCeDVCI9.js';
import { e } from './class-map-NDIkZErE.js';
import { s as spread } from './spread-B5cgadZl.js';
import { p as peacockString } from './strings-o6v6Hrmn.js';
import { T as ToggleBase } from './toggle-base-Dce9Rol7.js';
import './property-B2TG3KEE.js';
import './directive-ZPhl09Yt.js';
import './query-CHb9Ft_d.js';
import './base-Cl6v8-BZ.js';
import './form-associated-BHbg72PG.js';
import './element-internals-QME0yEz4.js';
import './BaseInput-CTOcQ_Y1.js';
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
}

@media (forced-colors: active) {
  .radio .outer-circle {
    border-color: CanvasText;
  }
  .radio.state-checked .outer-circle {
    border-color: Highlight;
  }
  .radio.state-checked .inner-circle {
    forced-color-adjust: none;
    background: Highlight;
  }
  .radio.disabled .outer-circle {
    border-color: GrayText;
  }
  .radio.disabled .inner-circle {
    background: GrayText;
  }
}
.suggestion-badge {
  margin-inline-start: var(--spacing-100);
}`;

var Radio_1;
/**
 * @label Radio
 * @tag wc-radio
 * @rawTag radio
 * @summary A round button for choosing one option from a set; radios that share a name form a group.
 * @overview
 * <p>Radios that share a <code>name</code> form a group. Wrap them in <code>wc-radio-group</code> to get a
 * group label and a single <code>change</code> event for the whole set.</p>
 * <p>The radio is form-associated: the checked radio submits its <code>value</code> under its <code>name</code>.
 * When any radio of a group is <code>required</code>, the group blocks form submission until one is checked.</p>
 *
 * @cssprop --radio-size: Size of the outer radio circle.
 * @cssprop --radio-dot-size: Size of the inner dot when selected.
 * @cssprop --radio-selected-color: Color of the radio when selected.
 * @cssprop --radio-unselected-color: Color of the radio outline when unselected.
 * @cssprop --radio-state-layer-size: Size of the state layer for touch target.
 * @cssprop --radio-disabled-opacity: Opacity applied when the radio is disabled.
 *
 * @fires {CustomEvent<{checked: boolean, value: string, originalEvent?: Event}>} change - Dispatched when the radio is selected.
 *
 * @example
 * ```html
 * <wc-radio name="fruits" value="apple" label="Apple"></wc-radio>
 * ```
 * @tags input, form
 */
let Radio = Radio_1 = class Radio extends ToggleBase {
    constructor() {
        // ── Static ───────────────────────────────────────────────────────────────
        super(...arguments);
        // ── Properties ───────────────────────────────────────────────────────────
        // `name` (which groups radios), `disabled`, `required`, `readonly`, `label`, `checked`, `value`
        // and `configAria` are inherited.
        // ── State ────────────────────────────────────────────────────────────────
        /** True for the one radio in the group that should receive tab focus (roving tabindex). */
        this.isGroupFocusTarget = false;
        // ── Private methods ──────────────────────────────────────────────────────
        this.keyDownHandler = (event) => {
            if (event.key === ' ') {
                event.preventDefault();
                this.isActive = true;
                this.selectRadio(event);
            }
            else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                event.preventDefault();
                this.navigateGroup(Radio_1.DIRECTION_NEXT);
            }
            else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                event.preventDefault();
                this.navigateGroup(Radio_1.DIRECTION_PREVIOUS);
            }
        };
        this.clickHandler = (event) => {
            this.selectRadio(event);
        };
    }
    // ── Lifecycle ────────────────────────────────────────────────────────────
    firstUpdated() {
        this.updateGroupFocusTarget();
    }
    updated(changed) {
        super.updated(changed);
        if (changed.has('checked') && this.checked) {
            this.uncheckSiblings();
        }
        if (changed.has('checked') || changed.has('name')) {
            this.updateGroupFocusTarget();
        }
        if (changed.has('checked') || changed.has('required')) {
            // Group validity depends on every radio; let the others recompute theirs.
            for (const radio of this.getGroupRadios()) {
                if (radio !== this)
                    radio.requestUpdate();
            }
        }
    }
    // ── Protected methods ────────────────────────────────────────────────────
    /** A radio submits nothing but its `value`; there is no `"on"` default to show. */
    get defaultToggleValue() {
        return '';
    }
    /** Invalid while any radio of the group is required and none is checked. */
    computeValidity() {
        const group = this.getGroupRadios();
        const required = group.some(radio => radio.required);
        const checked = group.some(radio => radio.checked);
        if (required && !checked && !this.disabled) {
            return {
                flags: { valueMissing: true },
                message: peacockString('valueMissingRadio'),
            };
        }
        return { flags: {}, message: '' };
    }
    selectRadio(event) {
        if (this.disabled || this.readonly)
            return;
        if (!this.checked) {
            this.checked = true;
            this.uncheckSiblings();
            this.dispatchChange(event);
        }
        this.containerElement?.focus();
    }
    uncheckSiblings() {
        if (!this.name || !this.checked)
            return;
        for (const radio of this.getGroupRadios()) {
            if (radio !== this)
                radio.checked = false;
        }
    }
    getGroupRadios() {
        if (!this.name)
            return [this];
        // A radio group or form scopes the name; otherwise the radio's own tree (document or the
        // shadow root it was rendered into).
        const scopeRoot = (this.closest('wc-radio-group, form') ??
            this.getRootNode());
        return Array.from(scopeRoot.querySelectorAll(`wc-radio[name="${CSS.escape(this.name)}"]`));
    }
    static isRadioEnabled(radio) {
        return !radio.disabled && !radio.readonly;
    }
    updateGroupFocusTarget() {
        const group = this.getGroupRadios();
        if (!group.length)
            return;
        const enabledGroup = group.filter(radio => Radio_1.isRadioEnabled(radio));
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
        const group = this.getGroupRadios().filter(radio => Radio_1.isRadioEnabled(radio));
        if (!group.length)
            return;
        const currentIndex = group.indexOf(this);
        const startIndex = currentIndex >= 0 ? currentIndex : 0;
        const nextIndex = (startIndex + direction + group.length) % group.length;
        const target = group[nextIndex];
        target.selectRadio();
        target.containerElement?.focus();
    }
    // ── Render ───────────────────────────────────────────────────────────────
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
        const attributes = this.controlAttributes();
        if (!this.isGroupFocusTarget)
            attributes.tabindex = '-1';
        return b `
      <label class=${e(cssClasses)}>
        <div
          class="container"
          role="radio"
          aria-checked=${String(this.checked)}
          @mousedown=${this.handleMouseDown}
          @keydown=${this.keyDownHandler}
          @focus=${this.handleFocusChange}
          @blur=${this.handleFocusChange}
          ${spread(attributes)}
        >
          <div class="state-layer"></div>
          <div class="outer-circle"></div>
          <div class="inner-circle"></div>
        </div>

        <input
          type="radio"
          class="input-native"
          .value=${this.value}
          .checked=${this.checked}
          aria-hidden="true"
          ?disabled=${this.disabled}
          tabindex="-1"
          @click=${this.clickHandler}
        />

        ${this.renderLabel()}
      </label>
    `;
    }
};
Radio.DIRECTION_NEXT = 1;
Radio.DIRECTION_PREVIOUS = -1;
Radio.styles = [css_248z];
__decorate([
    r()
], Radio.prototype, "isGroupFocusTarget", void 0);
Radio = Radio_1 = __decorate([
    IndividualComponent
], Radio);

export { Radio };
//# sourceMappingURL=radio.js.map
