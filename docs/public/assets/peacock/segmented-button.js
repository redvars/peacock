import { i, _ as __decorate, I as IndividualComponent, a as i$1, A, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { r } from './state-DkTK9EGF.js';
import { e } from './class-map-DG7CA1et.js';
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
  display: contents;
  --_segmented-button-height: 2.5rem;
  --_segmented-button-outline-color: var(--color-outline, #79747e);
  --_segmented-button-selected-container-color: var(--color-secondary-container, #e8def8);
  --_segmented-button-selected-label-text-color: var(--color-on-secondary-container, #1d192b);
  --_segmented-button-unselected-label-text-color: var(--color-on-surface, #1c1b1f);
  --_segmented-button-disabled-opacity: 0.38;
  --_segmented-button-state-layer-color: var(--color-on-surface, #1c1b1f);
  --_segmented-button-selected-state-layer-color: var(--color-on-secondary-container, #1d192b);
}

.segment {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: var(--segmented-button-height, var(--_segmented-button-height));
  padding: 0 1.5rem;
  cursor: pointer;
  flex: 1;
  min-width: 0;
  outline: none;
  user-select: none;
  -webkit-user-select: none;
  background: transparent;
  overflow: hidden;
  transition: background-color 200ms ease, color 200ms ease;
}
.segment .content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--typography-label-large-font-family) !important;
  font-size: var(--typography-label-large-font-size) !important;
  font-weight: var(--typography-label-large-font-weight) !important;
  line-height: var(--typography-label-large-line-height) !important;
  letter-spacing: var(--typography-label-large-letter-spacing) !important;
  color: var(--segmented-button-unselected-label-text-color, var(--_segmented-button-unselected-label-text-color));
}
.segment .content .check-icon,
.segment .content .leading-icon {
  --icon-size: 1.125rem;
  --icon-color: currentColor;
  flex-shrink: 0;
}
.segment .content .label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.segment .state-layer {
  position: absolute;
  inset: 0;
  background: var(--_segmented-button-state-layer-color);
  opacity: 0;
  pointer-events: none;
  transition: opacity 200ms ease;
}
.segment {
  /* right-side divider between segments */
}
.segment .segment-outline {
  position: absolute;
  top: 0;
  right: 0;
  width: 1px;
  height: 100%;
  background: var(--segmented-button-outline-color, var(--_segmented-button-outline-color));
  pointer-events: none;
}
.segment:hover:not(.disabled) .state-layer {
  opacity: 0.08;
}
.segment.has-focus:not(.disabled) .state-layer {
  opacity: 0.12;
}
.segment.active:not(.disabled) .state-layer {
  opacity: 0.16;
}
.segment {
  /* Selected state */
}
.segment.selected {
  background-color: var(--segmented-button-selected-container-color, var(--_segmented-button-selected-container-color));
}
.segment.selected .content {
  color: var(--segmented-button-selected-label-text-color, var(--_segmented-button-selected-label-text-color));
}
.segment.selected .state-layer {
  background: var(--_segmented-button-selected-state-layer-color);
}
.segment {
  /* Disabled state */
}
.segment.disabled {
  cursor: not-allowed;
  opacity: var(--segmented-button-disabled-opacity, var(--_segmented-button-disabled-opacity));
  pointer-events: none;
}

:host(:last-child) .segment-outline {
  display: none;
}`;

/**
 * @label Segmented Button
 * @tag wc-segmented-button
 * @rawTag segmented-button
 * @summary An individual segment within a segmented button group.
 * @overview
 * <p>Segmented buttons help people select options, switch views, or sort elements. They are used within a <code>wc-segmented-button-group</code>.</p>
 *
 * @cssprop --segmented-button-height: Height of the segmented button.
 * @cssprop --segmented-button-selected-container-color: Background color when the segment is selected.
 * @cssprop --segmented-button-selected-label-text-color: Text color when the segment is selected.
 * @cssprop --segmented-button-unselected-label-text-color: Text color when the segment is unselected.
 * @cssprop --segmented-button-outline-color: Outline / border color.
 * @cssprop --segmented-button-disabled-opacity: Opacity when the segment is disabled.
 *
 * @fires {CustomEvent} segmented-button--change - Dispatched when the selected state changes.
 *
 * @example
 * ```html
 * <wc-segmented-button-group>
 *   <wc-segmented-button value="day">Day</wc-segmented-button>
 *   <wc-segmented-button value="week" selected>Week</wc-segmented-button>
 *   <wc-segmented-button value="month">Month</wc-segmented-button>
 * </wc-segmented-button-group>
 * ```
 *
 * @tags controls
 */
let SegmentedButton = class SegmentedButton extends i$1 {
    constructor() {
        super(...arguments);
        /**
         * The value associated with this segment.
         */
        this.value = '';
        /**
         * Whether this segment is currently selected.
         */
        this.selected = false;
        /**
         * If true, the user cannot interact with this segment.
         */
        this.disabled = false;
        /** True while the segment has keyboard focus. */
        this.hasFocus = false;
        /** True while the user is actively pressing the segment. */
        this.isActive = false;
        this._windowMouseUp = () => {
            if (this.isActive) {
                this.isActive = false;
            }
        };
        this._mouseDownHandler = () => {
            this.isActive = true;
        };
        this._keyDownHandler = (evt) => {
            if (evt.key === ' ' || evt.key === 'Enter') {
                evt.preventDefault();
                this.isActive = true;
                this._toggle(evt);
            }
        };
        this._clickHandler = (ev) => {
            this._toggle(ev);
        };
        this._blurHandler = (ev) => {
            this.hasFocus = false;
            this.dispatchEvent(new CustomEvent('blur', { detail: ev, bubbles: true, composed: true }));
        };
        this._focusHandler = (ev) => {
            this.hasFocus = true;
            this.dispatchEvent(new CustomEvent('focus', { detail: ev, bubbles: true, composed: true }));
        };
    }
    connectedCallback() {
        super.connectedCallback();
        window.addEventListener('mouseup', this._windowMouseUp);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('mouseup', this._windowMouseUp);
    }
    _toggle(ev) {
        if (this.disabled)
            return;
        this.dispatchEvent(new CustomEvent('segmented-button--change', {
            detail: {
                value: this.value || this.textContent?.trim(),
                selected: !this.selected,
                originalEvent: ev,
            },
            bubbles: true,
            composed: true,
        }));
    }
    /** Sets focus on the segment. */
    focus() {
        this.renderRoot.querySelector('.segment')?.focus();
    }
    /** Removes focus from the segment. */
    blur() {
        this.renderRoot.querySelector('.segment')?.blur();
    }
    render() {
        const cssClasses = {
            segment: true,
            selected: this.selected,
            disabled: this.disabled,
            'has-focus': this.hasFocus,
            active: this.isActive,
            'has-icon': !!this.icon,
        };
        return b `
      <div
        class=${e(cssClasses)}
        role="button"
        tabindex=${this.disabled ? -1 : 0}
        aria-pressed=${this.selected}
        aria-disabled=${this.disabled}
        @click=${this._clickHandler}
        @mousedown=${this._mouseDownHandler}
        @keydown=${this._keyDownHandler}
        @blur=${this._blurHandler}
        @focus=${this._focusHandler}
      >
        <div class="state-layer"></div>
        <div class="content">
          ${this.selected
            ? b `<wc-icon class="check-icon" name="check"></wc-icon>`
            : this.icon
                ? b `<wc-icon class="leading-icon" name=${this.icon}></wc-icon>`
                : A}
          <span class="label"><slot></slot></span>
        </div>
        <div class="segment-outline"></div>
      </div>
    `;
    }
};
SegmentedButton.styles = [css_248z];
__decorate([
    n({ type: String, reflect: true })
], SegmentedButton.prototype, "value", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], SegmentedButton.prototype, "selected", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], SegmentedButton.prototype, "disabled", void 0);
__decorate([
    n({ type: String })
], SegmentedButton.prototype, "icon", void 0);
__decorate([
    r()
], SegmentedButton.prototype, "hasFocus", void 0);
__decorate([
    r()
], SegmentedButton.prototype, "isActive", void 0);
SegmentedButton = __decorate([
    IndividualComponent
], SegmentedButton);

export { SegmentedButton };
//# sourceMappingURL=segmented-button.js.map
