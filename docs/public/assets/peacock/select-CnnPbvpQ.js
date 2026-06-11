import { i, _ as __decorate, a as i$1, b, A } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { e } from './class-map-DG7CA1et.js';
import { o } from './style-map-BQD5Et1D.js';
import { r } from './state-DkTK9EGF.js';
import { e as e$1 } from './query-CHb9Ft_d.js';
import { r as redispatchEvent } from './dispatch-event-utils-CuEqjlPT.js';
import { s as spread } from './spread-B5cgadZl.js';
import { B as BaseInput } from './BaseInput-CU1zZYKc.js';
import { SelectOptionElement } from './option.js';

var css_248z$g = i`* {
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
  --tag-container-shape: inherit;
}

.tag {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: var(--tag-height, var(--_chip-height, 2rem));
  padding-inline: calc(var(--_container-padding) / 2);
  width: 100%;
  --_container-shape: var(--tag-container-shape, var(--shape-corner-medium));
  --_container-corner-shape-variant: squircle;
}
.tag .tag-content {
  position: relative;
  z-index: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--_input-text-color);
  --icon-color: currentColor;
}
.tag .tag-content .slot-content {
  padding-inline: calc(var(--_container-padding) / 2);
}
.tag .dismiss-button {
  position: relative;
  border-radius: 12px;
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  line-height: 0;
  cursor: pointer;
}
.tag .dismiss-button .dismiss-button-icon {
  --icon-size: var(--tag-icon-size, var(--_tag-icon-size));
  --icon-color: var(--_input-text-color);
}
.tag .dismiss-button .ripple {
  --ripple-state-opacity: var(--_container-state-opacity, 0);
  --ripple-pressed-color: var(--_container-state-color);
}
.tag {
  /**
   * Tag background layers
   */
}
.tag .background {
  display: block;
  position: absolute;
  width: 100%;
  height: 100%;
  background: var(--_container-color);
  border-radius: var(--_container-shape);
  corner-shape: var(--_container-corner-shape-variant);
  pointer-events: none;
}
.tag .outline {
  display: block;
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: var(--_container-shape);
  corner-shape: var(--_container-corner-shape-variant);
  border: 1px solid var(--_outline-color);
}
.tag .elevation {
  --elevation-level: 0;
  transition-duration: 280ms;
  border-radius: var(--_container-shape);
  corner-shape: var(--_container-corner-shape-variant);
}
.tag.dismissible .tag-content {
  padding-inline-end: 0.25rem;
}

slot::slotted(*) {
  --icon-size: var(--tag-icon-size, var(--_tag-icon-size));
}

/**
 * IconButton variant definitions
 */
.tag.variant-elevated {
  --_container-color: var(--elevated-tag-container-color);
  --_input-text-color: var(--elevated-tag-label-text-color);
  --_container-elevation-level: 1;
  --_container-state-color: var(--_input-text-color);
}
.tag.variant-elevated .dismiss-button:hover {
  --_container-state-opacity: 0.08;
}

.tag.variant-filled {
  --_container-color: var(--filled-tag-container-color);
  --_input-text-color: var(--filled-tag-label-text-color);
  --_container-state-color: var(--_input-text-color);
}
.tag.variant-filled .dismiss-button:hover {
  --_container-state-opacity: 0.08;
}

.tag.variant-tonal {
  --_container-color: var(--tonal-tag-container-color);
  --_input-text-color: var(--tonal-tag-label-text-color);
  --_container-state-color: var(--_input-text-color);
}
.tag.variant-tonal .dismiss-button:hover {
  --_container-state-opacity: 0.08;
}

.tag.variant-outlined {
  --_outline-color: var(--outlined-tag-outline-color);
  --_input-text-color: var(--outlined-tag-label-text-color);
  --_container-state-color: var(--_input-text-color);
}
.tag.variant-outlined .dismiss-button:hover {
  --_container-state-opacity: 0.08;
}`;

var css_248z$f = i`:host([color=default]) {
  --filled-tag-container-color: var(--color-surface);
  --filled-tag-label-text-color: var(--color-on-surface);
  --tonal-tag-container-color: var(--color-surface-container);
  --tonal-tag-label-text-color: var(--color-on-surface-container);
  --elevated-tag-container-color: var(--color-surface-container-low);
  --elevated-tag-label-text-color: var(--color-on-surface);
  --outlined-tag-outline-color: var(--color-on-surface);
  --outlined-tag-label-text-color: var(--color-on-surface);
}

:host([color=red]) {
  --filled-tag-container-color: var(--color-red);
  --filled-tag-label-text-color: var(--color-on-red);
  --tonal-tag-container-color: var(--color-red-container);
  --tonal-tag-label-text-color: var(--color-on-red-container);
  --elevated-tag-container-color: var(--color-surface-container-low);
  --elevated-tag-label-text-color: var(--color-red);
  --outlined-tag-outline-color: var(--color-red);
  --outlined-tag-label-text-color: var(--color-red);
}

:host([color=green]) {
  --filled-tag-container-color: var(--color-green);
  --filled-tag-label-text-color: var(--color-on-green);
  --tonal-tag-container-color: var(--color-green-container);
  --tonal-tag-label-text-color: var(--color-on-green-container);
  --elevated-tag-container-color: var(--color-surface-container-low);
  --elevated-tag-label-text-color: var(--color-green);
  --outlined-tag-outline-color: var(--color-green);
  --outlined-tag-label-text-color: var(--color-green);
}

:host([color=blue]) {
  --filled-tag-container-color: var(--color-blue);
  --filled-tag-label-text-color: var(--color-on-blue);
  --tonal-tag-container-color: var(--color-blue-container);
  --tonal-tag-label-text-color: var(--color-on-blue-container);
  --elevated-tag-container-color: var(--color-surface-container-low);
  --elevated-tag-label-text-color: var(--color-blue);
  --outlined-tag-outline-color: var(--color-blue);
  --outlined-tag-label-text-color: var(--color-blue);
}

:host([color=yellow]) {
  --filled-tag-container-color: var(--color-yellow);
  --filled-tag-label-text-color: var(--color-on-yellow);
  --tonal-tag-container-color: var(--color-yellow-container);
  --tonal-tag-label-text-color: var(--color-on-yellow-container);
  --elevated-tag-container-color: var(--color-surface-container-low);
  --elevated-tag-label-text-color: var(--color-yellow);
  --outlined-tag-outline-color: var(--color-yellow);
  --outlined-tag-label-text-color: var(--color-yellow);
}

:host([color=purple]) {
  --filled-tag-container-color: var(--color-purple);
  --filled-tag-label-text-color: var(--color-on-purple);
  --tonal-tag-container-color: var(--color-purple-container);
  --tonal-tag-label-text-color: var(--color-on-purple-container);
  --elevated-tag-container-color: var(--color-surface-container-low);
  --elevated-tag-label-text-color: var(--color-purple);
  --outlined-tag-outline-color: var(--color-purple);
  --outlined-tag-label-text-color: var(--color-purple);
}`;

var css_248z$e = i`.tag {
  font-family: var(--font-family-sans) !important;
}

.tag.size-sm,
.tag.size-small {
  --_chip-height: 1.5rem;
  --_tag-icon-size: 1rem;
  --_container-padding: 0.75rem;
  font-family: var(--typography-label-medium-font-family) !important;
  font-size: var(--typography-label-medium-font-size) !important;
  font-weight: var(--typography-label-medium-font-weight) !important;
  line-height: var(--typography-label-medium-line-height) !important;
  letter-spacing: var(--typography-label-medium-letter-spacing) !important;
}

.tag.size-md,
.tag.size-medium {
  --_chip-height: 2rem;
  --_tag-icon-size: 1.125rem;
  --_container-padding: 1rem;
  font-family: var(--typography-label-large-font-family) !important;
  font-size: var(--typography-label-large-font-size) !important;
  font-weight: var(--typography-label-large-font-weight) !important;
  line-height: var(--typography-label-large-line-height) !important;
  letter-spacing: var(--typography-label-large-letter-spacing) !important;
}`;

/**
 * @label Tag
 * @tag wc-tag
 * @rawTag tag
 * @summary Tag component for displaying labels or values with optional dismiss functionality.
 * @tags display
 *
 * @example
 * ```html
 * <wc-tag color="red">Tag</wc-tag>
 * ```
 */
class Tag extends i$1 {
    constructor() {
        super(...arguments);
        /** If true, the tag will have a close icon. */
        this.dismissible = false;
        this.variant = 'tonal';
        /** Tag color. */
        this.color = 'default';
        this.size = 'md';
    }
    _dismissClickHandler(e) {
        e.stopPropagation();
        // Custom Event: tag--dismiss
        this.dispatchEvent(new CustomEvent('tag--dismiss', {
            bubbles: true,
        }));
    }
    __renderDismissButton() {
        if (!this.dismissible)
            return null;
        return b `
      <button
        class="dismiss-button"
        @click=${this._dismissClickHandler}
        aria-label="Dismiss"
      >
        <wc-ripple class="ripple"></wc-ripple>
        <wc-icon class="dismiss-button-icon" name="close"></wc-icon>
      </button>
    `;
    }
    render() {
        const classes = {
            tag: true,
            dismissible: this.dismissible,
            [`color-${this.color}`]: true,
            [`variant-${this.variant}`]: true,
            [`size-${this.size}`]: true,
        };
        return b `
      <div class="${e(classes)}">
        <wc-elevation class="elevation"></wc-elevation>
        <div class="background"></div>
        <div class="outline"></div>

        <div class="tag-content">
          <slot name="icon"></slot>

          <div class="slot-content">
            <slot></slot>
          </div>
          ${this.__renderDismissButton()}
        </div>
      </div>
    `;
    }
}
// Define styles (Lit handles Scoping via Shadow DOM by default)
// You would typically import your tag.scss.js here or use the css tag
Tag.styles = [css_248z$g, css_248z$f, css_248z$e];
__decorate([
    n({ type: Boolean })
], Tag.prototype, "dismissible", void 0);
__decorate([
    n()
], Tag.prototype, "variant", void 0);
__decorate([
    n({ type: String, reflect: true })
], Tag.prototype, "color", void 0);
__decorate([
    n()
], Tag.prototype, "size", void 0);

var css_248z$d = i`* {
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
  display: block;
}

slot {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}`;

/**
 * @label Chip Set
 * @tag wc-chip-set
 * @rawTag chip-set
 * @summary A layout container for wrapping chips.
 * @tags layout
 *
 * @example
 * ```html
 * <wc-chip-set>
 *   <wc-chip>One</wc-chip>
 *   <wc-chip>Two</wc-chip>
 * </wc-chip-set>
 * ```
 */
class ChipSet extends i$1 {
    render() {
        return b `<slot></slot>`;
    }
}
ChipSet.styles = [css_248z$d];

var css_248z$c = i`:host {
  display: block;
  --progress-height: 0.25rem;
  --progress-container-color: var(--color-primary);
  --progress-track-color: var(--color-secondary-container);
  min-width: 2.5rem;
}

.linear-progress {
  display: flex;
  flex-direction: column;
}
.linear-progress .progress-header {
  display: flex;
  align-items: center;
}
.linear-progress .progress-header .progress-label {
  font-family: var(--typography-label-medium-font-family) !important;
  font-size: var(--typography-label-medium-font-size) !important;
  font-weight: var(--typography-label-medium-font-weight) !important;
  line-height: var(--typography-label-medium-line-height) !important;
  letter-spacing: var(--typography-label-medium-letter-spacing) !important;
  color: var(--color-on-surface);
  flex: 1;
}
.linear-progress .progress-body {
  display: flex;
  flex-direction: column;
}
.linear-progress .progress-body .linear-progress-container {
  position: relative;
  display: flex;
  align-items: flex-start;
  width: 100%;
  margin: var(--spacing-100) 0;
}
.linear-progress .progress-body .linear-progress-container .track {
  position: relative;
}
.linear-progress .progress-body .linear-progress-container .track:after {
  content: "";
  position: absolute;
  display: block;
  top: 0;
  left: 0;
  width: calc(100% - 0.25rem);
  height: var(--progress-height);
  background: var(--progress-track-color);
  border-radius: var(--shape-corner-full);
}
.linear-progress .progress-body .linear-progress-container .track-start:after {
  margin-inline-end: 0.25rem;
}
.linear-progress .progress-body .linear-progress-container .active-indicator {
  height: var(--progress-height);
  background: var(--progress-container-color);
  border-radius: var(--shape-corner-full);
}
.linear-progress .progress-body .linear-progress-container .track-end {
  flex: 1;
}
.linear-progress .progress-body .linear-progress-container .track-end:after {
  margin-inline-start: 0.25rem;
}
.linear-progress .progress-body .progress-helper {
  font-family: var(--typography-body-small-font-family) !important;
  font-size: var(--typography-body-small-font-size) !important;
  font-weight: var(--typography-body-small-font-weight) !important;
  line-height: var(--typography-body-small-line-height) !important;
  letter-spacing: var(--typography-body-small-letter-spacing) !important;
  color: var(--color-on-surface-variant);
}
.linear-progress:not(.indeterminate) .track-start {
  transition: width var(--duration-medium2) var(--easing-standard);
}
.linear-progress:not(.indeterminate) .active-indicator {
  transition: width var(--duration-medium2) var(--easing-standard);
}
.linear-progress.indeterminate .linear-progress-container .track-start {
  animation-duration: 3s;
  animation-iteration-count: infinite;
  animation-name: track-start-indeterminate;
  animation-timing-function: var(--easing-linear);
}
.linear-progress.indeterminate .linear-progress-container .active-indicator {
  animation-duration: 3s;
  animation-iteration-count: infinite;
  animation-name: active-indicator-indeterminate;
  animation-timing-function: var(--easing-linear);
}
.linear-progress.inline {
  flex-direction: row;
  gap: var(--spacing-200);
}
.linear-progress.inline .progress-body {
  flex: 1;
}

@keyframes track-start-indeterminate {
  0% {
    width: 0;
  }
  50% {
    width: 33%;
  }
  80%, to {
    width: 100%;
    padding-inline-end: 0;
  }
}
@keyframes active-indicator-indeterminate {
  0% {
    width: 0;
  }
  50% {
    width: 33%;
  }
  80%, to {
    width: 0;
  }
}`;

class BaseProgress extends i$1 {
    constructor() {
        super(...arguments);
        this.indeterminate = false;
        this.inline = false;
    }
    __getPercentageValue() {
        if (!this.value)
            return 0;
        return this.value;
    }
}
__decorate([
    n({ type: Number })
], BaseProgress.prototype, "value", void 0);
__decorate([
    n({ type: Boolean })
], BaseProgress.prototype, "indeterminate", void 0);
__decorate([
    n({ type: String })
], BaseProgress.prototype, "label", void 0);
__decorate([
    n({ type: String, attribute: 'helper-text' })
], BaseProgress.prototype, "helperText", void 0);
__decorate([
    n({ type: Boolean })
], BaseProgress.prototype, "inline", void 0);

/**
 * @label Linear Progress
 * @tag wc-linear-progress
 * @rawTag linear-progress
 * @summary A linear progress indicator is a visual representation of progress toward a specific goal.
 * @tags display
 *
 * @example
 * ```html
 * <wc-linear-progress value="30" style="width:10rem"></wc-linear-progress>
 * ```
 */
class LinearProgress extends BaseProgress {
    render() {
        return b `
      <div
        class="${e({
            'linear-progress': true,
            indeterminate: this.indeterminate,
            inline: this.inline,
        })}"
      >
        ${this.label
            ? b `<div class="progress-header">
              <label class="progress-label">${this.label}</label>
            </div>`
            : ''}

        <div class="progress-body">
          <div
            class="linear-progress-container"
            title=${this.label}
            ?aria-valuenow="${this.__getPercentageValue()}"
            aria-valuemin="0"
            aria-valuemax="100"
            role="progressbar"
          >
            <div class="track track-start"></div>
            <div
              class="active-indicator"
              style="${o({
            width: `${this.__getPercentageValue()}%`,
        })}"
            ></div>
            <div class="track track-end"></div>
          </div>

          ${this.helperText
            ? b `<div class="progress-helper">${this.helperText}</div>`
            : ''}
        </div>
      </div>
    `;
    }
}
// Lit components use static styles for better performance
LinearProgress.styles = [css_248z$c];

var css_248z$b = i`:host {
  display: inline-block;
  --progress-height: 1.5rem;
  --progress-line-thickness: 4px;
  --progress-container-color: var(--color-primary);
  --progress-track-color: var(--color-secondary-container);
}

.circular-progress {
  display: flex;
  flex-direction: column;
}
.circular-progress .circular-progress-container {
  position: relative;
  width: 100%;
  --_container-height: clamp(0rem, var(--progress-height), 15rem);
  height: var(--_container-height);
}
.circular-progress .circular-progress-container .progress-label {
  font-family: var(--typography-label-large-emphasized-font-family) !important;
  font-size: var(--typography-label-large-emphasized-font-size) !important;
  font-weight: var(--typography-label-large-emphasized-font-weight) !important;
  line-height: var(--typography-label-large-emphasized-line-height) !important;
  letter-spacing: var(--typography-label-large-emphasized-letter-spacing) !important;
  color: var(--color-on-surface);
  flex: 1;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.circular-progress .circular-progress-container svg {
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
}
.circular-progress .circular-progress-container circle {
  fill: none;
  stroke-linecap: round;
  transition: stroke-dashoffset var(--duration-medium2) var(--easing-standard);
}
.circular-progress .circular-progress-container .track {
  stroke: var(--progress-track-color);
  stroke-width: calc(var(--progress-line-thickness) / (tan(atan2(var(--_container-height), 1px)) / 16));
}
.circular-progress .circular-progress-container .active-indicator {
  stroke: var(--progress-container-color);
  stroke-width: calc(var(--progress-line-thickness) / (tan(atan2(var(--_container-height), 1px)) / 16));
}
.circular-progress.indeterminate .active-indicator {
  animation: arc-indeterminate 1.5s ease-in-out infinite;
}
.circular-progress .progress-label {
  font-family: var(--typography-label-medium-font-family) !important;
  font-size: var(--typography-label-medium-font-size) !important;
  font-weight: var(--typography-label-medium-font-weight) !important;
  line-height: var(--typography-label-medium-line-height) !important;
  letter-spacing: var(--typography-label-medium-letter-spacing) !important;
  color: var(--color-on-surface);
}
.circular-progress .progress-helper {
  font-family: var(--typography-label-small-font-family) !important;
  font-size: var(--typography-label-small-font-size) !important;
  font-weight: var(--typography-label-small-font-weight) !important;
  line-height: var(--typography-label-small-line-height) !important;
  letter-spacing: var(--typography-label-small-letter-spacing) !important;
  color: var(--color-on-surface-variant);
  text-align: center;
}
.circular-progress.inline {
  flex-direction: row;
  align-items: center;
  gap: var(--spacing-200);
}
.circular-progress.inline .progress-footer {
  flex: 1;
}
.circular-progress.inline .progress-helper {
  text-align: start;
}

@keyframes rotate-container {
  100% {
    transform: rotate(360deg);
  }
}
@keyframes arc-indeterminate {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}`;

/**
 * @label Circular Progress
 * @tag wc-circular-progress
 * @rawTag circular-progress
 * @summary A circular progress indicator is a visual representation of progress toward a specific goal.
 * @tags display
 *
 * @example
 * ```html
 * <wc-circular-progress value="30"></wc-circular-progress>
 * ```
 */
class CircularProgress extends BaseProgress {
    render() {
        const percentage = this.__getPercentageValue();
        // Radius of 18 with stroke 4 fits nicely in a 40x40 viewBox
        const radius = 6;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percentage / 100) * circumference;
        return b `
      <div
        class="${e({
            'circular-progress': true,
            indeterminate: this.indeterminate,
            inline: this.inline,
        })}"
        title=${this.label}
        role="progressbar"
        aria-valuenow="${this.indeterminate ? undefined : percentage}"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div class="circular-progress-container">
          <svg viewBox="0 0 16 16">
            <circle class="track" cx="8" cy="8" r="6"></circle>
            <circle
              class="active-indicator"
              cx="8"
              cy="8"
              r="6"
              style="${o({
            strokeDasharray: `${circumference}`,
            strokeDashoffset: this.indeterminate ? undefined : `${offset}`,
        })}"
            ></circle>
          </svg>
        </div>

        <div class="progress-footer">
          ${this.label
            ? b `<div class="progress-label">${this.label}</div>`
            : ''}
          ${this.helperText
            ? b `<div class="progress-helper">${this.helperText}</div>`
            : ''}
        </div>
      </div>
    `;
    }
}
// Lit components use static styles for better performance
CircularProgress.styles = [css_248z$b];

var css_248z$a = i`* {
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
  display: block;
  width: 100%;
}

.input-element {
  border: none;
  outline: none;
  margin: 0;
  padding: 0;
}

.input-wrapper .input {
  flex: 1;
  width: 100%;
  background: none;
  cursor: inherit;
}
.input-wrapper .password-toggle {
  --button-container-shape: var(--shape-corner-full);
}`;

/**
 * @label Input
 * @tag wc-input
 * @rawTag input
 *
 * @summary The Input component is used to capture user input.
 *
 * @example
 * ```html
 * <wc-input label="Name" required placeholder="Enter your name"></wc-input>
 * ```
 */
class Input extends BaseInput {
    constructor() {
        super(...arguments);
        this.value = "";
        this.name = "";
        this.placeholder = "";
        this.label = "";
        this.inline = false;
        this.size = "md";
        this.type = "text";
        this.autocomplete = "off";
        this.configAria = {};
        this.variant = "default";
        /**
         * Helper text to display below the input.
         */
        this.helperText = "";
        this.error = false;
        this.errorText = "";
        this.warning = false;
        this.warningText = "";
        this.focused = false;
        this.passwordVisible = false;
        /**
         * Returns true when the text field has been interacted with. Native
         * validation errors only display in response to user interactions.
         */
        this.dirty = false;
        this.__handleFocusChange = (event) => {
            this.focused = event.type === "focus";
        };
    }
    async focus() {
        await Promise.all([
            customElements.whenDefined("wc-input"),
            customElements.whenDefined("wc-field"),
        ]);
        await this.updateComplete;
        this.inputElement?.focus();
    }
    connectedCallback() {
        super.connectedCallback();
        this.handleInitialAttributes();
    }
    handleInitialAttributes() {
        Array.from(this.attributes).forEach((attr) => {
            if (attr.name.startsWith("aria-")) {
                this.configAria[attr.name] = attr.value;
                this.removeAttribute(attr.name);
            }
        });
    }
    __handleInput(event) {
        this.dirty = true;
        this.value = event.target.value;
    }
    __redispatchEvent(event) {
        redispatchEvent(this, event);
    }
    render() {
        const displayType = this.type === "password" && this.passwordVisible
            ? "text"
            : this.type;
        return b `
      <wc-field
        ?required="${this.required}"
        ?disabled="${this.disabled}"
        ?readonly="${this.readonly}"
        ?skeleton="${this.skeleton}"
        helper-text="${this.helperText}"
        ?error="${this.error}"
        error-text="${this.errorText}"
        ?warning="${this.warning}"
        variant="${this.variant}"
        ?populated="${!!this.value}"
        warning-text="${this.warningText}"
        label="${this.label}"
        ?focused="${this.focused}"
        .host="${this}"
        class="input-wrapper"
      >
        <slot name="start" slot="field-start"></slot>

        <input
          class="input input-element"
          name="${this.name}"
          type="${displayType}"
          placeholder="${this.placeholder}"
          autocomplete="${this.autocomplete}"
          .value="${this.value}"
          ?readonly="${this.readonly}"
          ?required="${this.required}"
          ?disabled="${this.disabled}"
          @input="${this.__handleInput}"
          @change="${this.__redispatchEvent}"
          @focus="${this.__handleFocusChange}"
          @blur="${this.__handleFocusChange}"
          ${spread(this.configAria)}
        />

        <slot name="end" slot="field-end"></slot>

        ${this.type === "password"
            ? b `
            <wc-icon-button
              class="password-toggle"
              variant="text"
              slot="field-end"
              tooltip="${this.passwordVisible
                ? "Hide password"
                : "Show password"}"
              @click="${() => {
                this.passwordVisible = !this.passwordVisible;
            }}"
            >
              <wc-icon
                name="${this.passwordVisible ? "visibility_off" : "visibility"}"
              ></wc-icon>
            </wc-icon-button>
          `
            : A}
      </wc-field>
    `;
    }
}
Input.styles = [css_248z$a];
__decorate([
    n({ type: String })
], Input.prototype, "value", void 0);
__decorate([
    n({ type: String })
], Input.prototype, "name", void 0);
__decorate([
    n({ type: String })
], Input.prototype, "placeholder", void 0);
__decorate([
    n({ type: String })
], Input.prototype, "label", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Input.prototype, "inline", void 0);
__decorate([
    n({ type: String, reflect: true })
], Input.prototype, "size", void 0);
__decorate([
    n({ type: String })
], Input.prototype, "type", void 0);
__decorate([
    n({ type: String })
], Input.prototype, "autocomplete", void 0);
__decorate([
    n({ type: Object })
], Input.prototype, "configAria", void 0);
__decorate([
    n({ type: String })
], Input.prototype, "variant", void 0);
__decorate([
    n({ type: String, attribute: "helper-text" })
], Input.prototype, "helperText", void 0);
__decorate([
    n({ type: Boolean })
], Input.prototype, "error", void 0);
__decorate([
    n({ type: String, attribute: "error-text" })
], Input.prototype, "errorText", void 0);
__decorate([
    n({ type: Boolean })
], Input.prototype, "warning", void 0);
__decorate([
    n({ type: String, attribute: "warning-text" })
], Input.prototype, "warningText", void 0);
__decorate([
    r()
], Input.prototype, "focused", void 0);
__decorate([
    r()
], Input.prototype, "passwordVisible", void 0);
__decorate([
    r()
], Input.prototype, "dirty", void 0);
__decorate([
    e$1(".input-element")
], Input.prototype, "inputElement", void 0);

var css_248z$9 = i`* {
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
  display: block;
  width: 100%;
}

.url-input {
  flex: 1;
  width: 100%;
  border: none;
  outline: none;
  margin: 0;
  padding: 0;
  background: none;
  cursor: inherit;
  font: inherit;
  color: inherit;
}

.url-display {
  flex: 1;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.url-link {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-primary);
  text-decoration: none;
}
.url-link:hover {
  text-decoration: underline;
}

.url-placeholder {
  color: var(--color-on-surface-variant);
  opacity: 0.6;
}

.edit-button {
  --button-container-shape: var(--shape-corner-full);
}`;

/**
 * @label URL Field
 * @tag wc-url-field
 * @rawTag url-field
 *
 * @summary A field for entering and displaying URLs with validation.
 * @overview
 * <p>URL Field wraps an input with URL validation, showing a clickable link preview when not in edit mode.</p>
 *
 * @example
 * ```html
 * <wc-url-field label="Website" value="https://example.com"></wc-url-field>
 * ```
 * @tags form
 */
class UrlField extends BaseInput {
    constructor() {
        super(...arguments);
        this.value = '';
        this.name = '';
        this.placeholder = '';
        this.label = '';
        this.editing = false;
        this.debounce = 300;
        this.size = 'md';
        this.variant = 'default';
        this.helperText = '';
        this.error = false;
        this.errorText = '';
        this.warning = false;
        this.warningText = '';
        this.focused = false;
        this.isValid = true;
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
    }
    focus() {
        if (!this.editing && !this.disabled && !this.readonly) {
            this.startEditing();
            return;
        }
        this.inputElement?.focus();
    }
    blur() {
        this.inputElement?.blur();
    }
    startEditing() {
        if (this.disabled || this.readonly)
            return;
        this.editing = true;
        setTimeout(() => this.inputElement?.focus(), 80);
    }
    closeEditing() {
        this.isValid = this.validateUrl(this.value);
        this.dispatchEvent(new CustomEvent('input-invalid', {
            detail: !this.isValid,
            bubbles: true,
            composed: true,
        }));
        if (this.isValid) {
            this.editing = false;
        }
    }
    validateUrl(url) {
        if (!url)
            return true;
        try {
            new URL(url);
            return true;
        }
        catch {
            return false;
        }
    }
    handleInput(event) {
        this.value = event.target.value;
        this.isValid = true;
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        this.debounceTimer = setTimeout(() => {
            this.dispatchEvent(new CustomEvent('value-change', {
                detail: this.value,
                bubbles: true,
                composed: true,
            }));
        }, this.debounce);
    }
    handleFocusChange() {
        this.focused = this.inputElement?.matches(':focus') ?? false;
    }
    handleBlur() {
        this.focused = false;
        this.closeEditing();
    }
    handleChange(event) {
        redispatchEvent(this, event);
    }
    renderDisplayValue() {
        if (!this.value) {
            return b `<span class="url-placeholder">${this.placeholder}</span>`;
        }
        return b `
      <a
        class="url-link"
        href=${this.value}
        target="_blank"
        rel="noopener noreferrer"
      >
        ${this.value}
      </a>
    `;
    }
    render() {
        const hasValue = !!this.value;
        const showInvalidState = this.error || !this.isValid;
        const resolvedErrorText = !this.isValid
            ? 'Please enter a valid URL'
            : this.errorText;
        return b `
      <wc-field
        label=${this.label}
        ?required=${this.required}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        ?skeleton=${this.skeleton}
        helper-text=${this.helperText}
        ?error=${showInvalidState}
        error-text=${resolvedErrorText}
        ?warning=${this.warning}
        warning-text=${this.warningText}
        variant=${this.variant}
        ?populated=${hasValue || this.editing}
        ?focused=${this.focused}
        .host=${this}
        class="url-field-wrapper"
      >
        ${this.editing
            ? b `
              <input
                class="url-input"
                name=${this.name}
                type="url"
                placeholder=${this.placeholder}
                .value=${this.value}
                ?readonly=${this.readonly}
                ?required=${this.required}
                ?disabled=${this.disabled}
                @input=${this.handleInput}
                @change=${this.handleChange}
                @focus=${this.handleFocusChange}
                @blur=${this.handleBlur}
              />
            `
            : b `<div class="url-display">${this.renderDisplayValue()}</div>`}
        ${!this.editing && !this.disabled && !this.readonly
            ? b `
              <wc-icon-button
                class="edit-button"
                slot="field-end"
                variant="text"
                @click=${(event) => {
                event.stopPropagation();
                this.startEditing();
            }}
              >
                <wc-icon name="edit"></wc-icon>
              </wc-icon-button>
            `
            : A}
      </wc-field>
    `;
    }
}
UrlField.styles = [css_248z$9];
__decorate([
    n({ type: String })
], UrlField.prototype, "value", void 0);
__decorate([
    n({ type: String })
], UrlField.prototype, "name", void 0);
__decorate([
    n({ type: String })
], UrlField.prototype, "placeholder", void 0);
__decorate([
    n({ type: String })
], UrlField.prototype, "label", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], UrlField.prototype, "editing", void 0);
__decorate([
    n({ type: Number })
], UrlField.prototype, "debounce", void 0);
__decorate([
    n({ type: String, reflect: true })
], UrlField.prototype, "size", void 0);
__decorate([
    n({ type: String })
], UrlField.prototype, "variant", void 0);
__decorate([
    n({ type: String, attribute: 'helper-text' })
], UrlField.prototype, "helperText", void 0);
__decorate([
    n({ type: Boolean })
], UrlField.prototype, "error", void 0);
__decorate([
    n({ type: String, attribute: 'error-text' })
], UrlField.prototype, "errorText", void 0);
__decorate([
    n({ type: Boolean })
], UrlField.prototype, "warning", void 0);
__decorate([
    n({ type: String, attribute: 'warning-text' })
], UrlField.prototype, "warningText", void 0);
__decorate([
    r()
], UrlField.prototype, "focused", void 0);
__decorate([
    r()
], UrlField.prototype, "isValid", void 0);
__decorate([
    e$1('.url-input')
], UrlField.prototype, "inputElement", void 0);

var css_248z$8 = i`* {
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
  display: block;
  width: 100%;
}

.input-element {
  border: none;
  outline: none;
  margin: 0;
  padding: 0;
}

.input-wrapper .input {
  flex: 1;
  width: 100%;
  background: none;
  cursor: inherit;
}
.input-wrapper .password-toggle {
  --button-container-shape: var(--shape-corner-full);
}

.stepper {
  /* Chrome, Safari, Edge, Opera */
}
.stepper input::-webkit-outer-spin-button,
.stepper input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.stepper {
  /* Firefox */
}
.stepper input[type=number] {
  -moz-appearance: textfield;
}`;

var _NumberField_id;
/**
 * @label Number Field
 * @tag wc-number-field
 * @rawTag number-field
 *
 * @summary The Number Field component is used to capture numeric user input.
 *
 * @example
 * ```html
 * <wc-number-field label="Age" placeholder="Enter your age"></wc-number-field>
 * ```
 */
class NumberField extends BaseInput {
    constructor() {
        super(...arguments);
        _NumberField_id.set(this, crypto.randomUUID());
        this.name = '';
        this.placeholder = '';
        this.label = '';
        this.inline = false;
        this.size = 'md';
        this.autocomplete = 'off';
        this.configAria = {};
        /**
         * Helper text to display below the input.
         */
        this.helperText = '';
        this.error = false;
        this.errorText = '';
        this.warning = false;
        this.warningText = '';
        this.stepper = false;
        this.focused = false;
        /**
         * Returns true when the text field has been interacted with. Native
         * validation errors only display in response to user interactions.
         */
        this.dirty = false;
    }
    connectedCallback() {
        super.connectedCallback();
        this.handleInitialAttributes();
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
    __handleInput(event) {
        this.dirty = true;
        this.value = Number(event.target.value);
    }
    focus() {
        this.inputElement?.focus();
    }
    blur() {
        this.inputElement?.blur();
    }
    __handleFocusChange() {
        // When calling focus() or reportValidity() during change, it's possible
        // for blur to be called after the new focus event. Rather than set
        // `this.focused` to true/false on focus/blur, we always set it to whether
        // or not the input itself is focused.
        this.focused = this.inputElement?.matches(':focus') ?? false;
    }
    __redispatchEvent(event) {
        redispatchEvent(this, event);
    }
    stepUp() {
        this.inputElement?.stepUp();
    }
    stepDown() {
        this.inputElement?.stepDown();
    }
    render() {
        const classes = {
            'input-wrapper': true,
            stepper: this.stepper,
        };
        return b `
      <wc-field
        ?required=${this.required}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        ?skeleton=${this.skeleton}
        helper-text=${this.helperText}
        ?error=${this.error}
        error-text=${this.errorText}
        ?warning=${this.warning}
        warning-text=${this.warningText}
        label=${this.label}
        ?focused=${this.focused}
        .host=${this}
        class=${e(classes)}
      >
        ${this.stepper && !this.disabled
            ? b `<wc-icon-button
              class="stepper"
              variant="text"
              slot="field-start"
              @click=${this.stepDown}
            >
              <wc-icon name="remove"></wc-icon>
            </wc-icon-button>`
            : A}

        <slot name="start" slot="field-start"></slot>

        <input
          class="input input-element"
          name=${this.name}
          type="number"
          placeholder=${this.placeholder}
          autocomplete=${this.autocomplete}
          .value=${this.value}
          ?tabindex=${this.tabindex}
          ?readonly=${this.readonly}
          ?required=${this.required}
          ?disabled=${this.disabled}
          min=${this.min}
          max=${this.max}
          step=${this.step}
          @input=${this.__handleInput}
          @change=${this.__redispatchEvent}
          @focus=${this.__handleFocusChange}
          @blur=${this.__handleFocusChange}
          ${spread(this.configAria)}
        />

        <slot name="end" slot="field-end"></slot>

        ${this.stepper && !this.disabled
            ? b `<wc-icon-button
              class="stepper"
              variant="text"
              slot="field-end"
              @click=${this.stepUp}
            >
              <wc-icon name="add"></wc-icon>
            </wc-icon-button>`
            : A}
      </wc-field>
    `;
    }
}
_NumberField_id = new WeakMap();
NumberField.styles = [css_248z$8];
__decorate([
    n({ type: Number })
], NumberField.prototype, "value", void 0);
__decorate([
    n({ type: String })
], NumberField.prototype, "name", void 0);
__decorate([
    n({ type: String })
], NumberField.prototype, "placeholder", void 0);
__decorate([
    n({ type: String })
], NumberField.prototype, "label", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], NumberField.prototype, "inline", void 0);
__decorate([
    n({ type: String, reflect: true })
], NumberField.prototype, "size", void 0);
__decorate([
    n({ type: Number })
], NumberField.prototype, "max", void 0);
__decorate([
    n({ type: Number })
], NumberField.prototype, "min", void 0);
__decorate([
    n({ type: Number })
], NumberField.prototype, "step", void 0);
__decorate([
    n({ type: String })
], NumberField.prototype, "autocomplete", void 0);
__decorate([
    n({ type: Object })
], NumberField.prototype, "configAria", void 0);
__decorate([
    n({ type: String, attribute: 'helper-text' })
], NumberField.prototype, "helperText", void 0);
__decorate([
    n({ type: Boolean })
], NumberField.prototype, "error", void 0);
__decorate([
    n({ type: String, attribute: 'error-text' })
], NumberField.prototype, "errorText", void 0);
__decorate([
    n({ type: Boolean })
], NumberField.prototype, "warning", void 0);
__decorate([
    n({ type: String, attribute: 'warning-text' })
], NumberField.prototype, "warningText", void 0);
__decorate([
    n({ type: Boolean })
], NumberField.prototype, "stepper", void 0);
__decorate([
    r()
], NumberField.prototype, "focused", void 0);
__decorate([
    r()
], NumberField.prototype, "dirty", void 0);
__decorate([
    e$1('.input-element')
], NumberField.prototype, "inputElement", void 0);

var css_248z$7 = i`* {
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
  display: block;
  width: 100%;
}

.input-element {
  border: none;
  outline: none;
  margin: 0;
  padding: 0;
}

.input-wrapper .input {
  flex: 1;
  width: 100%;
  background: none;
  cursor: inherit;
}
.input-wrapper .input::-webkit-inner-spin-button,
.input-wrapper .input::-webkit-calendar-picker-indicator {
  display: none;
  -webkit-appearance: none;
}`;

/**
 * @label Date Picker
 * @tag wc-date-picker
 * @rawTag date-picker
 * @summary The Date Picker component is used to capture date user input.
 * @tags input
 *
 * @example
 * ```html
 * <wc-date-picker label="Date" placeholder="Select a date"></wc-date-picker>
 * ```
 */
class DatePicker extends BaseInput {
    constructor() {
        super(...arguments);
        this.value = '';
        this.name = '';
        this.placeholder = '';
        this.label = '';
        this.inline = false;
        this.size = 'md';
        this.autocomplete = 'off';
        this.configAria = {};
        this.variant = 'default';
        /**
         * Helper text to display below the input.
         */
        this.helperText = '';
        this.error = false;
        this.errorText = '';
        this.warning = false;
        this.warningText = '';
        this.focused = false;
        this.passwordVisible = false;
        /**
         * Returns true when the text field has been interacted with. Native
         * validation errors only display in response to user interactions.
         */
        this.dirty = false;
    }
    connectedCallback() {
        super.connectedCallback();
        this.handleInitialAttributes();
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
    __handleInput(event) {
        this.dirty = true;
        this.value = event.target.value;
    }
    focus() {
        this.inputElement?.focus();
    }
    blur() {
        this.inputElement?.blur();
    }
    __handleFocusChange() {
        // When calling focus() or reportValidity() during change, it's possible
        // for blur to be called after the new focus event. Rather than set
        // `this.focused` to true/false on focus/blur, we always set it to whether
        // or not the input itself is focused.
        this.focused = this.inputElement?.matches(':focus') ?? false;
    }
    __redispatchEvent(event) {
        redispatchEvent(this, event);
    }
    render() {
        return b `
      <wc-field
        ?required=${this.required}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        ?skeleton=${this.skeleton}
        helper-text=${this.helperText}
        ?error=${this.error}
        error-text=${this.errorText}
        ?warning=${this.warning}
        variant=${this.variant}
        ?populated=${!!this.value}
        warning-text=${this.warningText}
        label=${this.label}
        ?focused=${this.focused}
        .host=${this}
        class="input-wrapper"
      >
        <slot name="start" slot="field-start"></slot>

        <input
          class="input input-element"
          name=${this.name}
          type="date"
          placeholder=${this.placeholder}
          autocomplete=${this.autocomplete}
          .value=${this.value}
          ?tabindex=${this.tabindex}
          ?readonly=${this.readonly}
          ?required=${this.required}
          ?disabled=${this.disabled}
          @input=${this.__handleInput}
          @change=${this.__redispatchEvent}
          @focus=${this.__handleFocusChange}
          @blur=${this.__handleFocusChange}
          ${spread(this.configAria)}
        />

        <slot name="end" slot="field-end"></slot>

        <wc-icon-button
          slot="field-end"
          color="secondary"
          variant="text"
          ?disabled=${this.disabled}
          @click=${() => {
            setTimeout(() => {
                // @ts-ignore
                this.inputElement.showPicker();
            });
        }}
        >
          <wc-icon name="calendar_today"></wc-icon>
        </wc-icon-button>
      </wc-field>
    `;
    }
}
DatePicker.styles = [css_248z$7];
__decorate([
    n({ type: String })
], DatePicker.prototype, "value", void 0);
__decorate([
    n({ type: String })
], DatePicker.prototype, "name", void 0);
__decorate([
    n({ type: String })
], DatePicker.prototype, "placeholder", void 0);
__decorate([
    n({ type: String })
], DatePicker.prototype, "label", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], DatePicker.prototype, "inline", void 0);
__decorate([
    n({ type: String, reflect: true })
], DatePicker.prototype, "size", void 0);
__decorate([
    n({ type: String })
], DatePicker.prototype, "autocomplete", void 0);
__decorate([
    n({ type: Object })
], DatePicker.prototype, "configAria", void 0);
__decorate([
    n({ type: String })
], DatePicker.prototype, "variant", void 0);
__decorate([
    n({ type: String, attribute: 'helper-text' })
], DatePicker.prototype, "helperText", void 0);
__decorate([
    n({ type: Boolean })
], DatePicker.prototype, "error", void 0);
__decorate([
    n({ type: String, attribute: 'error-text' })
], DatePicker.prototype, "errorText", void 0);
__decorate([
    n({ type: Boolean })
], DatePicker.prototype, "warning", void 0);
__decorate([
    n({ type: String, attribute: 'warning-text' })
], DatePicker.prototype, "warningText", void 0);
__decorate([
    r()
], DatePicker.prototype, "focused", void 0);
__decorate([
    r()
], DatePicker.prototype, "passwordVisible", void 0);
__decorate([
    r()
], DatePicker.prototype, "dirty", void 0);
__decorate([
    e$1('.input-element')
], DatePicker.prototype, "inputElement", void 0);

var css_248z$6 = i`* {
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
  display: block;
  width: 100%;
}

.input-element {
  border: none;
  outline: none;
  margin: 0;
  padding: 0;
}

.input-wrapper .input {
  flex: 1;
  width: 100%;
  background: none;
  cursor: inherit;
}
.input-wrapper .input::-webkit-inner-spin-button,
.input-wrapper .input::-webkit-calendar-picker-indicator {
  display: none;
  -webkit-appearance: none;
}`;

/**
 * @label Time Picker
 * @tag wc-time-picker
 * @rawTag time-picker
 * @summary The Time Picker component is used to capture time user input.
 * @tags input
 *
 * @example
 * ```html
 * <wc-time-picker label="Time" placeholder="Select a time"></wc-time-picker>
 * ```
 */
class TimePicker extends BaseInput {
    constructor() {
        super(...arguments);
        this.value = '';
        this.name = '';
        this.placeholder = '';
        this.label = '';
        this.inline = false;
        this.size = 'md';
        this.autocomplete = 'off';
        this.configAria = {};
        this.variant = 'default';
        /**
         * Helper text to display below the input.
         */
        this.helperText = '';
        this.error = false;
        this.errorText = '';
        this.warning = false;
        this.warningText = '';
        this.focused = false;
        this.passwordVisible = false;
        /**
         * Returns true when the text field has been interacted with. Native
         * validation errors only display in response to user interactions.
         */
        this.dirty = false;
    }
    connectedCallback() {
        super.connectedCallback();
        this.handleInitialAttributes();
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
    __handleInput(event) {
        this.dirty = true;
        this.value = event.target.value;
    }
    focus() {
        this.inputElement?.focus();
    }
    blur() {
        this.inputElement?.blur();
    }
    __handleFocusChange() {
        // When calling focus() or reportValidity() during change, it's possible
        // for blur to be called after the new focus event. Rather than set
        // `this.focused` to true/false on focus/blur, we always set it to whether
        // or not the input itself is focused.
        this.focused = this.inputElement?.matches(':focus') ?? false;
    }
    __redispatchEvent(event) {
        redispatchEvent(this, event);
    }
    render() {
        return b `
      <wc-field
        ?required=${this.required}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        ?skeleton=${this.skeleton}
        helper-text=${this.helperText}
        ?error=${this.error}
        error-text=${this.errorText}
        ?warning=${this.warning}
        variant=${this.variant}
        ?populated=${!!this.value}
        warning-text=${this.warningText}
        label=${this.label}
        ?focused=${this.focused}
        .host=${this}
        class="input-wrapper"
      >
        <slot name="start" slot="field-start"></slot>

        <input
          class="input input-element"
          name=${this.name}
          type="time"
          placeholder=${this.placeholder}
          autocomplete=${this.autocomplete}
          .value=${this.value}
          ?tabindex=${this.tabindex}
          ?readonly=${this.readonly}
          ?required=${this.required}
          ?disabled=${this.disabled}
          @input=${this.__handleInput}
          @change=${this.__redispatchEvent}
          @focus=${this.__handleFocusChange}
          @blur=${this.__handleFocusChange}
          ${spread(this.configAria)}
        />

        <slot name="end" slot="field-end"></slot>

        <wc-icon-button
          slot="field-end"
          color="secondary"
          variant="text"
          ?disabled=${this.disabled}
          @click=${() => {
            setTimeout(() => {
                // @ts-ignore
                this.inputElement.showPicker();
            });
        }}
        >
          <wc-icon name="calendar_today"></wc-icon>
        </wc-icon-button>
      </wc-field>
    `;
    }
}
TimePicker.styles = [css_248z$6];
__decorate([
    n({ type: String })
], TimePicker.prototype, "value", void 0);
__decorate([
    n({ type: String })
], TimePicker.prototype, "name", void 0);
__decorate([
    n({ type: String })
], TimePicker.prototype, "placeholder", void 0);
__decorate([
    n({ type: String })
], TimePicker.prototype, "label", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], TimePicker.prototype, "inline", void 0);
__decorate([
    n({ type: String, reflect: true })
], TimePicker.prototype, "size", void 0);
__decorate([
    n({ type: String })
], TimePicker.prototype, "autocomplete", void 0);
__decorate([
    n({ type: Object })
], TimePicker.prototype, "configAria", void 0);
__decorate([
    n({ type: String })
], TimePicker.prototype, "variant", void 0);
__decorate([
    n({ type: String, attribute: 'helper-text' })
], TimePicker.prototype, "helperText", void 0);
__decorate([
    n({ type: Boolean })
], TimePicker.prototype, "error", void 0);
__decorate([
    n({ type: String, attribute: 'error-text' })
], TimePicker.prototype, "errorText", void 0);
__decorate([
    n({ type: Boolean })
], TimePicker.prototype, "warning", void 0);
__decorate([
    n({ type: String, attribute: 'warning-text' })
], TimePicker.prototype, "warningText", void 0);
__decorate([
    r()
], TimePicker.prototype, "focused", void 0);
__decorate([
    r()
], TimePicker.prototype, "passwordVisible", void 0);
__decorate([
    r()
], TimePicker.prototype, "dirty", void 0);
__decorate([
    e$1('.input-element')
], TimePicker.prototype, "inputElement", void 0);

var css_248z$5 = i`* {
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
  display: block;
  width: 100%;
}

.input-element {
  border: none;
  outline: none;
  margin: 0;
  padding: 0;
}

.input-wrapper .input {
  flex: 1;
  width: 100%;
  background: none;
  cursor: inherit;
}

.textarea {
  height: 100%;
  position: relative;
  align-items: flex-start;
  --field-height: auto;
  --field-padding-block: var(--spacing-100);
}
.textarea .input {
  height: 100%;
  resize: vertical;
}`;

/**
 * @label Textarea
 * @tag wc-textarea
 * @rawTag textarea
 * @summary The Textarea component is used to capture user input.
 * @tags input
 *
 * @example
 * ```html
 * <wc-textarea label="Description" placeholder="Enter text"></wc-textarea>
 * ```
 */
class Textarea extends BaseInput {
    constructor() {
        super(...arguments);
        this.value = '';
        this.name = '';
        this.placeholder = '';
        this.label = '';
        this.inline = false;
        this.size = 'md';
        this.autocomplete = 'off';
        this.configAria = {};
        this.variant = 'default';
        /**
         * Helper text to display below the input.
         */
        this.helperText = '';
        this.error = false;
        this.errorText = '';
        this.warning = false;
        this.warningText = '';
        this.rows = '3';
        this.focused = false;
        this.passwordVisible = false;
        /**
         * Returns true when the text field has been interacted with. Native
         * validation errors only display in response to user interactions.
         */
        this.dirty = false;
    }
    connectedCallback() {
        super.connectedCallback();
        this.handleInitialAttributes();
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
    __handleInput(event) {
        this.dirty = true;
        this.value = event.target.value;
    }
    focus() {
        this.inputElement?.focus();
    }
    blur() {
        this.inputElement?.blur();
    }
    __handleFocusChange() {
        // When calling focus() or reportValidity() during change, it's possible
        // for blur to be called after the new focus event. Rather than set
        // `this.focused` to true/false on focus/blur, we always set it to whether
        // or not the input itself is focused.
        this.focused = this.inputElement?.matches(':focus') ?? false;
    }
    __redispatchEvent(event) {
        redispatchEvent(this, event);
    }
    render() {
        return b `
      <wc-field
        ?required=${this.required}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        ?skeleton=${this.skeleton}
        helper-text=${this.helperText}
        ?error=${this.error}
        error-text=${this.errorText}
        ?warning=${this.warning}
        variant=${this.variant}
        ?populated=${!!this.value}
        warning-text=${this.warningText}
        label=${this.label}
        ?focused=${this.focused}
        .host=${this}
        class="input-wrapper textarea"
      >
        <slot name="start" slot="field-start"></slot>

        <textarea
          class="input input-element"
          rows=${this.rows}
          name=${this.name}
          placeholder=${this.placeholder}
          autocomplete=${this.autocomplete}
          .value=${this.value}
          ?tabindex=${this.tabindex}
          ?readonly=${this.readonly}
          ?required=${this.required}
          ?disabled=${this.disabled}
          @input=${this.__handleInput}
          @change=${this.__redispatchEvent}
          @focus=${this.__handleFocusChange}
          @blur=${this.__handleFocusChange}
          ${spread(this.configAria)}
        ></textarea>

        <slot name="end" slot="field-end"></slot>
      </wc-field>
    `;
    }
}
Textarea.styles = [css_248z$5];
__decorate([
    n({ type: String })
], Textarea.prototype, "value", void 0);
__decorate([
    n({ type: String })
], Textarea.prototype, "name", void 0);
__decorate([
    n({ type: String })
], Textarea.prototype, "placeholder", void 0);
__decorate([
    n({ type: String })
], Textarea.prototype, "label", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Textarea.prototype, "inline", void 0);
__decorate([
    n({ type: String, reflect: true })
], Textarea.prototype, "size", void 0);
__decorate([
    n({ type: String })
], Textarea.prototype, "autocomplete", void 0);
__decorate([
    n({ type: Object })
], Textarea.prototype, "configAria", void 0);
__decorate([
    n({ type: String })
], Textarea.prototype, "variant", void 0);
__decorate([
    n({ type: String, attribute: 'helper-text' })
], Textarea.prototype, "helperText", void 0);
__decorate([
    n({ type: Boolean })
], Textarea.prototype, "error", void 0);
__decorate([
    n({ type: String, attribute: 'error-text' })
], Textarea.prototype, "errorText", void 0);
__decorate([
    n({ type: Boolean })
], Textarea.prototype, "warning", void 0);
__decorate([
    n({ type: String, attribute: 'warning-text' })
], Textarea.prototype, "warningText", void 0);
__decorate([
    n({ type: String })
], Textarea.prototype, "rows", void 0);
__decorate([
    r()
], Textarea.prototype, "focused", void 0);
__decorate([
    r()
], Textarea.prototype, "passwordVisible", void 0);
__decorate([
    r()
], Textarea.prototype, "dirty", void 0);
__decorate([
    e$1('.input-element')
], Textarea.prototype, "inputElement", void 0);

var css_248z$4 = i`* {
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
  --switch-track-color: var(--color-primary);
  --switch-track-off-color: var(--color-surface-container-highest);
}

.switch {
  position: relative;
  display: flex;
  align-items: center;
}
.switch .input-native {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
.switch .label {
  font-family: var(--typography-label-medium-font-family) !important;
  font-size: var(--typography-label-medium-font-size) !important;
  font-weight: var(--typography-label-medium-font-weight) !important;
  line-height: var(--typography-label-medium-line-height) !important;
  letter-spacing: var(--typography-label-medium-letter-spacing) !important;
}
.switch.has-content {
  gap: var(--spacing-150);
}
.switch .track {
  position: relative;
  background: var(--switch-track-off-color);
  border: 2px solid var(--color-outline);
  border-radius: var(--shape-corner-full);
  cursor: pointer;
  display: flex;
  transition: background-color var(--duration-short2) var(--easing-standard);
  align-items: center;
  width: var(--_container-width);
  height: var(--_container-height);
  padding: 0 4px;
}
.switch .track .handle {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--shape-corner-full);
  transition: all var(--duration-short2) var(--easing-standard);
  background: white;
  height: var(--switch-handle-radius);
  width: var(--switch-handle-radius);
  background: var(--switch-handle-color);
}
.switch .track .handle .icon {
  --icon-size: .75rem;
  --icon-color: var(--switch-track-off-color);
}
.switch.has-focus:not(.active) .track {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
  border-color: var(--color-white);
}
.switch.has-focus:not(.active):not(.state-checked) .handle {
  border-color: var(--icon-01);
}

.switch.state-checked .track {
  background: var(--switch-track-color);
  border-color: transparent;
}
.switch.state-checked .handle {
  margin-inline-start: calc(100% - var(--switch-handle-radius));
}
.switch.state-checked .handle .icon {
  --icon-size: 1rem;
  --icon-color: var(--switch-track-color);
}
.switch.state-checked.active .track {
  border-color: var(--switch-track-color);
}
.switch.state-checked.has-focus:not(.active) .track {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
  border-color: var(--color-white);
}

.switch {
  --_container-width: 3.25rem;
  --_container-height: 2rem;
  --switch-handle-radius: 16px;
  --switch-handle-color: var(--color-outline);
}
.switch.state-checked {
  --switch-handle-radius: 22px;
  --switch-handle-color: var(--color-surface-container-lowest);
}

.switch.readonly {
  cursor: default;
}
.switch.readonly .track {
  border-color: var(--color-outline);
  background: var(--switch-track-off-color);
  opacity: 0.38;
}
.switch.readonly .track .handle {
  background: var(--color-outline) !important;
}

.switch.disabled {
  cursor: not-allowed;
}
.switch.disabled .track {
  border-color: var(--color-on-surface);
  background: var(--switch-track-off-color);
  opacity: 0.38;
}
.switch.disabled .track .handle {
  background: var(--color-on-surface) !important;
}`;

/**
 * @label Switch
 * @tag wc-switch
 * @rawTag switch
 *
 * @summary Captures boolean input with an on/off switch interaction.
 * @overview
 * <p>Toggles are used to enable or disable a single option. They provide immediate feedback about whether an option is active or inactive.</p>
 *
 * @cssprop --switch-track-color: Color of the switch track when checked.
 * @cssprop --switch-track-off-color: Color of the switch track when unchecked.
 * @cssprop --switch-width: Width of the switch track.
 * @cssprop --switch-height: Height of the switch track.
 * @cssprop --switch-handle-radius: Size of the switch handle.
 * @cssprop --switch-handle-color: Color of the switch handle.
 *
 * @fires {CustomEvent} change - Dispatched when the switch value changes.
 * @fires {CustomEvent} blur - Dispatched when the switch loses focus.
 * @fires {CustomEvent} focus - Dispatched when the switch receives focus.
 *
 * @example
 * ```html
 * <wc-switch value="true"></wc-switch>
 * ```
 * @tags input, form
 */
class Switch extends BaseInput {
    constructor() {
        super(...arguments);
        this.value = false;
        /**
         * The input field name.
         */
        this.name = '';
        /**
         * The switch label.
         */
        this.label = '';
        /**
         * If true, the toggle has rounded corners. Defaults to `true`.
         */
        this.rounded = true;
        /**
         * If true, required icon is shown. Defaults to `false`.
         */
        this.required = false;
        /**
         * If true, the toggle is readonly. Defaults to `false`.
         */
        this.readonly = false;
        /**
         * If true, the user cannot interact with the toggle. Defaults to `false`.
         */
        this.disabled = false;
        this.withIcon = false;
        /**
         * Configuration object for aria attributes.
         */
        this.configAria = {};
        this.hasFocus = false;
        this.isActive = false;
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
                this.dispatchEvent(new CustomEvent('change', {
                    detail: { value: this.value, originalEvent: ev },
                    bubbles: true,
                    composed: true,
                }));
                this.trackElement?.focus();
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
    __renderIcon() {
        if (this.withIcon) {
            if (this.value)
                return b `<wc-icon name="check" class="icon"></wc-icon>`;
            return b `<wc-icon name="close" class="icon"></wc-icon>`;
        }
        return A;
    }
    render() {
        const cssClasses = {
            switch: true,
            'state-checked': this.value,
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
          class="track"
          tabindex=${this.tabindex || 0}
          @keyup=${this.handleKeyUp}
          @mousedown=${this.mouseDownHandler}
          @keydown=${this.keyDownHandler}
          @blur=${this.blurHandler}
          @focus=${this.focusHandler}
          role="checkbox"
          aria-disabled=${this.disabled}
          aria-required=${this.required}
          aria-checked=${this.value}
          ${spread(this.configAria)}
        >
          <div class="handle">${this.__renderIcon()}</div>
        </div>

        <input
          type="checkbox"
          class="input-native"
          name=${this.name}
          .checked=${this.value}
          aria-hidden="true"
          ?required=${this.required}
          tabindex="-1"
          @click=${this.clickHandler}
        />

        ${this.label
            ? b `<div class="label">${this.label}</div>`
            : b `<div class="slot-container"><slot></slot></div>`}
      </label>
    `;
    }
}
Switch.styles = [css_248z$4];
__decorate([
    n({ type: Boolean })
], Switch.prototype, "value", void 0);
__decorate([
    n({ type: String })
], Switch.prototype, "name", void 0);
__decorate([
    n({ type: String })
], Switch.prototype, "label", void 0);
__decorate([
    n({ type: Boolean })
], Switch.prototype, "rounded", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Switch.prototype, "required", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Switch.prototype, "readonly", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Switch.prototype, "disabled", void 0);
__decorate([
    n({ type: Boolean, reflect: true, attribute: 'with-icon' })
], Switch.prototype, "withIcon", void 0);
__decorate([
    n({ type: Object })
], Switch.prototype, "configAria", void 0);
__decorate([
    r()
], Switch.prototype, "hasFocus", void 0);
__decorate([
    r()
], Switch.prototype, "isActive", void 0);
__decorate([
    r()
], Switch.prototype, "slotHasContent", void 0);
__decorate([
    e$1('.track')
], Switch.prototype, "trackElement", void 0);
__decorate([
    e$1('.input-native')
], Switch.prototype, "nativeElement", void 0);

var css_248z$3 = i`* {
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
  display: block;
  --sidebar-menu-item-height: 3rem;
  --sidebar-menu-item-icon-size: 1.25rem;
  --sidebar-menu-item-border-radius: var(--global-shape-corner-full, 9999px);
  --sidebar-menu-item-label-color: var(--color-on-surface);
  --sidebar-menu-item-icon-color: var(--color-on-surface-variant);
  --sidebar-menu-item-selected-background: var(--color-secondary-container);
  --sidebar-menu-item-selected-label-color: var(--color-on-secondary-container);
  --sidebar-menu-item-focus-ring-color: var(--color-primary);
  --sidebar-menu-item-transition-duration: 200ms;
  --sidebar-menu-item-transition-easing: cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-menu-item {
  position: relative;
  display: flex;
  align-items: center;
  min-height: var(--sidebar-menu-item-height);
  border-radius: var(--sidebar-menu-item-border-radius);
  color: var(--_label-color);
  cursor: pointer;
  user-select: none;
  text-decoration: none;
  outline: none;
  --_container-color: transparent;
  --_container-opacity: 1;
  --_label-color: var(--sidebar-menu-item-label-color);
  font-family: var(--typography-label-large-font-family) !important;
  font-size: var(--typography-label-large-font-size) !important;
  font-weight: var(--typography-label-large-font-weight) !important;
  line-height: var(--typography-label-large-line-height) !important;
  letter-spacing: var(--typography-label-large-letter-spacing) !important;
}
.sidebar-menu-item.selected {
  --_container-color: var(--sidebar-menu-item-selected-background);
  --_label-color: var(--sidebar-menu-item-selected-label-color);
  font-weight: var(--font-weight-bold) !important;
}
.sidebar-menu-item.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
.sidebar-menu-item.disabled .ripple {
  display: none;
}

.sidebar-menu-item-content {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex: 1;
  min-height: var(--sidebar-menu-item-height);
  padding-inline: var(--sidebar-menu-item-content-padding, 0.75rem);
  color: inherit;
  z-index: 1;
  overflow: hidden;
}

.background {
  position: absolute;
  inset: 0;
  background-color: var(--_container-color);
  opacity: var(--_container-opacity);
  border-radius: inherit;
  pointer-events: none;
}

.focus-ring {
  z-index: 2;
  --focus-ring-color: var(--sidebar-menu-item-focus-ring-color);
  --focus-ring-container-shape-start-start: var(
    --sidebar-menu-item-border-radius
  );
  --focus-ring-container-shape-start-end: var(
    --sidebar-menu-item-border-radius
  );
  --focus-ring-container-shape-end-start: var(
    --sidebar-menu-item-border-radius
  );
  --focus-ring-container-shape-end-end: var(--sidebar-menu-item-border-radius);
}

.ripple {
  --ripple-pressed-color: var(--color-on-surface);
  border-radius: inherit;
}

.sidebar-menu-item.selected .ripple {
  --ripple-pressed-color: var(--sidebar-menu-item-selected-color);
}

.sidebar-menu-item-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}`;

/**
 * @label Sidebar Menu Item
 * @tag wc-sidebar-menu-item
 * @rawTag sidebar-menu-item
 * @summary A sidebar menu item represents a selectable leaf item in the sidebar navigation tree.
 *
 * @example
 * ```html
 * <wc-sidebar-menu>
 *   <wc-sidebar-sub-menu label="Parent" expanded>
 *     <wc-sidebar-menu-item label="Child"></wc-sidebar-menu-item>
 *   </wc-sidebar-sub-menu>
 * </wc-sidebar-menu>
 * ```
 * @tags navigation
 */
class SidebarMenuItem extends i$1 {
    constructor() {
        super(...arguments);
        /**
         * The value used to identify this item when selected.
         */
        this.value = '';
        /**
         * The display label for this item.
         */
        this.label = '';
        /**
         * Optional icon name to display before the label.
         */
        this.icon = '';
        /**
         * Optional hyperlink to navigate to on click.
         */
        this.href = '';
        /**
         * Sets or retrieves the window or frame at which to target content.
         */
        this.target = '_self';
        /**
         * If true, the user cannot interact with the item.
         */
        this.disabled = false;
        /**
         * Whether the item is currently selected.
         */
        this.selected = false;
        /**
         * The nesting depth level (set automatically by the parent sidebar-menu).
         */
        this.level = 0;
        this._onClick = () => {
            if (this.disabled)
                return;
            this.dispatchEvent(new CustomEvent('sidebar-menu-item:click', {
                bubbles: true,
                composed: true,
                detail: { value: this.value, label: this.label },
            }));
        };
    }
    focus() {
        this._nativeElement?.focus();
    }
    blur() {
        this._nativeElement?.blur();
    }
    render() {
        const classes = e({
            'sidebar-menu-item': true,
            disabled: this.disabled,
            selected: this.selected,
        });
        const content = b `
      <wc-focus-ring class="focus-ring" for="item"></wc-focus-ring>
      <div class="background"></div>
      <wc-ripple class="ripple"></wc-ripple>
      <div class="sidebar-menu-item-content">
        ${this.icon ? b `<wc-icon name="${this.icon}"></wc-icon>` : ''}
        <span class="sidebar-menu-item-label">${this.label}</span>
      </div>
    `;
        if (this.href) {
            return b `
        <a
          id="item"
          href="${this.href}"
          target="${this.target}"
          class="${classes}"
          ?aria-disabled=${this.disabled}
          tabindex="${this.disabled ? -1 : 0}"
          @click="${this._onClick}"
        >
          ${content}
        </a>
      `;
        }
        return b `
      <div
        id="item"
        class="${classes}"
        role="treeitem"
        aria-label="${this.label}"
        aria-selected="${String(this.selected)}"
        ?aria-disabled=${this.disabled}
        ?disabled=${this.disabled}
        tabindex="${this.disabled ? -1 : 0}"
        @click="${this._onClick}"
        @keydown="${(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this._onClick();
            }
        }}"
      >
        ${content}
      </div>
    `;
    }
}
SidebarMenuItem.styles = [css_248z$3];
__decorate([
    n({ type: String, reflect: true })
], SidebarMenuItem.prototype, "value", void 0);
__decorate([
    n({ type: String, reflect: true })
], SidebarMenuItem.prototype, "label", void 0);
__decorate([
    n({ type: String, reflect: true })
], SidebarMenuItem.prototype, "icon", void 0);
__decorate([
    n({ type: String, reflect: true })
], SidebarMenuItem.prototype, "href", void 0);
__decorate([
    n({ type: String, reflect: true })
], SidebarMenuItem.prototype, "target", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], SidebarMenuItem.prototype, "disabled", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], SidebarMenuItem.prototype, "selected", void 0);
__decorate([
    n({ type: Number, reflect: true })
], SidebarMenuItem.prototype, "level", void 0);
__decorate([
    e$1('.sidebar-menu-item-content')
], SidebarMenuItem.prototype, "_nativeElement", void 0);

var css_248z$2 = i`* {
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
  display: block;
  --sidebar-menu-item-height: 3rem;
  --sidebar-menu-item-border-radius: var(--global-shape-corner-full, 9999px);
  --sidebar-menu-item-label-color: var(--color-on-surface);
  --sidebar-menu-item-icon-color: var(--color-on-surface-variant);
  --sidebar-menu-item-selected-background: var(--color-secondary-container);
  --sidebar-menu-item-selected-color: var(--color-on-secondary-container);
  --sidebar-menu-item-focus-ring-color: var(--color-primary);
}

.sidebar-sub-menu {
  display: block;
}

.sidebar-sub-menu-inner {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: var(--sidebar-menu-item-height);
  cursor: pointer;
  border-radius: var(--sidebar-menu-item-border-radius);
  outline: none;
  padding-inline-end: 0.75rem;
  color: var(--_label-color);
  --_container-color: transparent;
  --_container-opacity: 1;
  --_label-color: var(--sidebar-menu-item-label-color);
  font-family: var(--typography-label-large-font-family) !important;
  font-size: var(--typography-label-large-font-size) !important;
  font-weight: var(--typography-label-large-font-weight) !important;
  line-height: var(--typography-label-large-line-height) !important;
  letter-spacing: var(--typography-label-large-letter-spacing) !important;
}
.sidebar-sub-menu-inner.selected {
  --_container-color: var(--sidebar-menu-item-selected-background);
  --_label-color: var(--sidebar-menu-item-selected-color);
}
.sidebar-sub-menu-inner.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
.sidebar-sub-menu-inner.disabled .ripple {
  display: none;
}

.sidebar-sub-menu-content {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex: 1;
  min-height: var(--sidebar-menu-item-height);
  color: inherit;
  user-select: none;
  text-decoration: none;
  outline: none;
  padding-inline: 0.75rem;
  z-index: 1;
}

.background {
  position: absolute;
  inset: 0;
  background-color: var(--_container-color);
  opacity: var(--_container-opacity);
  border-radius: inherit;
  pointer-events: none;
}

.focus-ring {
  z-index: 2;
  --focus-ring-color: var(--sidebar-menu-item-focus-ring-color);
  --focus-ring-container-shape-start-start: var(--sidebar-menu-item-border-radius);
  --focus-ring-container-shape-start-end: var(--sidebar-menu-item-border-radius);
  --focus-ring-container-shape-end-start: var(--sidebar-menu-item-border-radius);
  --focus-ring-container-shape-end-end: var(--sidebar-menu-item-border-radius);
}

.ripple {
  --ripple-pressed-color: var(--color-on-surface);
  border-radius: inherit;
}

.sidebar-sub-menu-inner.selected .ripple {
  --ripple-pressed-color: var(--sidebar-menu-item-selected-color);
}

.sidebar-sub-menu-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.expand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--sidebar-menu-item-icon-color);
  flex-shrink: 0;
  width: var(--sidebar-menu-item-height);
  height: var(--sidebar-menu-item-height);
  transition: transform var(--duration-medium1) var(--easing-standard);
}

:host([expanded]) .expand-icon {
  transform: rotate(180deg);
}

.sidebar-sub-menu-children {
  display: block;
  overflow: hidden;
  margin-left: var(--spacing-200);
  max-height: 9999px;
  opacity: 1;
  transition: max-height var(--duration-medium1) var(--easing-standard), opacity var(--duration-medium1) var(--easing-standard);
}

.sidebar-sub-menu-children.hidden {
  max-height: 0;
  opacity: 0;
}`;

/**
 * @label Sidebar Sub Menu
 * @tag wc-sidebar-sub-menu
 * @rawTag sidebar-sub-menu
 * @summary A sidebar sub menu groups sidebar menu items and handles expand/collapse behavior.
 *
 * @example
 * ```html
 * <wc-sidebar-sub-menu label="Parent" expanded>
 *   <wc-sidebar-menu-item label="Child"></wc-sidebar-menu-item>
 * </wc-sidebar-sub-menu>
 * ```
 * @tags navigation
 */
class SidebarSubMenu extends i$1 {
    constructor() {
        super(...arguments);
        this.value = '';
        this.label = '';
        this.icon = '';
        this.disabled = false;
        this.selected = false;
        this.expanded = false;
        this.level = 0;
        this._updateChildLevels = () => {
            this._getChildNodes().forEach(child => {
                if ('level' in child) {
                    // eslint-disable-next-line no-param-reassign
                    child.level = this.level + 1;
                }
            });
        };
        this._onClick = () => {
            if (this.disabled)
                return;
            if (this._getChildNodes().length > 0) {
                this.expanded = !this.expanded;
            }
            this.dispatchEvent(new CustomEvent('sidebar-menu-item:click', {
                bubbles: true,
                composed: true,
                detail: { value: this.value, label: this.label },
            }));
        };
    }
    focus() {
        this._nativeElement?.focus();
    }
    blur() {
        this._nativeElement?.blur();
    }
    connectedCallback() {
        super.connectedCallback();
        this._updateChildLevels();
    }
    updated(changedProps) {
        super.updated(changedProps);
        if (changedProps.has('expanded')) {
            this.setAttribute('aria-expanded', String(this.expanded));
            if (this.expanded) {
                this.setAttribute('data-expanded', '');
            }
            else {
                this.removeAttribute('data-expanded');
            }
        }
    }
    _getChildNodes() {
        return Array.from(this.children).filter(el => {
            const tag = el.tagName.toLowerCase();
            return tag === 'wc-sidebar-menu-item' || tag === 'wc-sidebar-sub-menu';
        });
    }
    render() {
        const hasChildren = this._getChildNodes().length > 0;
        const wrapperClasses = e({
            'sidebar-sub-menu': true,
        });
        const innerClasses = e({
            'sidebar-sub-menu-inner': true,
            disabled: this.disabled,
            selected: this.selected,
        });
        const inlineStyles = o({
            paddingLeft: `calc(var(--sidebar-menu-item-height, 2.5rem) * ${this.level})`,
        });
        return b `
      <div class="${wrapperClasses}" style="${inlineStyles}">
        <div
          id="item"
          class="${innerClasses}"
          role="treeitem"
          aria-label="${this.label}"
          aria-selected="${String(this.selected)}"
          aria-disabled="${this.disabled}"
          aria-expanded="${this.expanded}"
          @click="${this._onClick}"
          @keydown="${(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this._onClick();
            }
        }}"
          tabindex="${this.disabled ? -1 : 0}"
        >
          <wc-focus-ring class="focus-ring" for="item"></wc-focus-ring>
          <div class="background"></div>
          <wc-ripple class="ripple"></wc-ripple>
          <div class="sidebar-sub-menu-content">
            ${this.icon ? b `<wc-icon name="${this.icon}"></wc-icon>` : ''}
            <span class="sidebar-sub-menu-label">${this.label}</span>
          </div>
          ${hasChildren
            ? b `
                <wc-icon class="expand-icon" name="arrow_drop_down" aria-hidden="true"></wc-icon>
              `
            : ''}
        </div>
        <div class="sidebar-sub-menu-children ${(!hasChildren || !this.expanded) ? 'hidden' : ''}">
          <slot @slotchange="${this._updateChildLevels}"></slot>
        </div>
      </div>
    `;
    }
}
SidebarSubMenu.styles = [css_248z$2];
__decorate([
    n({ type: String, reflect: true })
], SidebarSubMenu.prototype, "value", void 0);
__decorate([
    n({ type: String, reflect: true })
], SidebarSubMenu.prototype, "label", void 0);
__decorate([
    n({ type: String, reflect: true })
], SidebarSubMenu.prototype, "icon", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], SidebarSubMenu.prototype, "disabled", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], SidebarSubMenu.prototype, "selected", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], SidebarSubMenu.prototype, "expanded", void 0);
__decorate([
    n({ type: Number, reflect: true })
], SidebarSubMenu.prototype, "level", void 0);
__decorate([
    e$1('.sidebar-sub-menu-inner')
], SidebarSubMenu.prototype, "_nativeElement", void 0);

var css_248z$1 = i`* {
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
  display: block;
}

.sidebar-menu {
  display: block;
  padding: var(--spacing-100, 0.5rem) 0;
}`;

/**
 * @label Sidebar Menu
 * @tag wc-sidebar-menu
 * @rawTag sidebar-menu
 * @summary A sidebar menu is a hierarchical structure that provides nested levels of navigation. It supports keyboard navigation, single/multi select, and expandable items.
 *
 * @example
 * ```html
 * <wc-sidebar-menu>
 *   <wc-sidebar-sub-menu label="Parent" expanded>
 *     <wc-sidebar-menu-item label="Child 1"></wc-sidebar-menu-item>
 *     <wc-sidebar-menu-item label="Child 2"></wc-sidebar-menu-item>
 *   </wc-sidebar-sub-menu>
 * </wc-sidebar-menu>
 * ```
 * @tags navigation
 */
class SidebarMenu extends i$1 {
    constructor() {
        super(...arguments);
        /**
         * The value of the currently selected item.
         */
        this.selectedItem = '';
        this._onItemClick = (event) => {
            const item = event.target;
            if (item.disabled)
                return;
            const value = event.detail?.value ?? item.value ?? item.label;
            this.selectedItem = value;
            // Update selected state on all items
            this._updateSelectedState(value);
            this.dispatchEvent(new CustomEvent('sidebar-menu:change', {
                bubbles: true,
                composed: true,
                detail: { value, item },
            }));
        };
        this._onKeyDown = (event) => {
            const allVisible = this._getAllVisibleItems();
            const currentElement = event.composedPath().find(target => target instanceof SidebarMenuItem || target instanceof SidebarSubMenu);
            if (!currentElement) {
                return;
            }
            if (!allVisible.includes(currentElement)) {
                return;
            }
            const currentIndex = allVisible.indexOf(currentElement);
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                const nextIndex = (currentIndex + 1) % allVisible.length;
                allVisible[nextIndex].focus();
            }
            else if (event.key === 'ArrowUp') {
                event.preventDefault();
                const prevIndex = currentIndex === 0 ? allVisible.length - 1 : currentIndex - 1;
                allVisible[prevIndex].focus();
            }
            else if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                currentElement.click();
            }
            else if (event.key === 'ArrowRight') {
                event.preventDefault();
                if (currentElement instanceof SidebarSubMenu && !currentElement.expanded) {
                    currentElement.expanded = true;
                }
                else if (currentElement instanceof SidebarSubMenu) {
                    const children = this._getChildNodes(currentElement);
                    if (children.length > 0) {
                        children[0].focus();
                    }
                }
            }
            else if (event.key === 'ArrowLeft') {
                event.preventDefault();
                if (currentElement instanceof SidebarSubMenu && currentElement.expanded) {
                    currentElement.expanded = false;
                }
            }
        };
    }
    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('sidebar-menu-item:click', this._onItemClick);
        this.addEventListener('keydown', this._onKeyDown);
        this.setAttribute('role', 'tree');
    }
    updated(changedProps) {
        super.updated(changedProps);
        if (changedProps.has('selectedItem')) {
            this._syncSelectedStateFromProperty();
        }
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListener('sidebar-menu-item:click', this._onItemClick);
        this.removeEventListener('keydown', this._onKeyDown);
    }
    _isSidebarNode(element) {
        const tag = element.tagName.toLowerCase();
        return tag === 'wc-sidebar-menu-item' || tag === 'wc-sidebar-sub-menu';
    }
    _getTopLevelItems() {
        return Array.from(this.children).filter(el => this._isSidebarNode(el));
    }
    _getChildNodes(item) {
        return Array.from(item.children).filter(child => this._isSidebarNode(child));
    }
    _getAllVisibleItems() {
        const result = [];
        const collect = (items) => {
            items.forEach(item => {
                result.push(item);
                if (item instanceof SidebarSubMenu && item.expanded) {
                    collect(this._getChildNodes(item));
                }
            });
        };
        collect(this._getTopLevelItems());
        return result;
    }
    _updateSelectedState(selectedValue) {
        const allItems = this._collectAllItems(this._getTopLevelItems());
        allItems.forEach(item => {
            const itemValue = item.value || item.label;
            // eslint-disable-next-line no-param-reassign
            item.selected = itemValue === selectedValue;
        });
    }
    _collectAllItems(items) {
        const result = [];
        items.forEach(item => {
            result.push(item);
            if (item instanceof SidebarSubMenu) {
                result.push(...this._collectAllItems(this._getChildNodes(item)));
            }
        });
        return result;
    }
    _syncSelectedStateFromProperty() {
        const allItems = this._collectAllItems(this._getTopLevelItems());
        allItems.forEach(item => {
            const itemValue = item.value || item.label;
            item.selected = itemValue === this.selectedItem;
        });
    }
    render() {
        return b ` <div class="sidebar-menu"><slot></slot></div> `;
    }
}
SidebarMenu.styles = [css_248z$1];
__decorate([
    n({ type: String, attribute: 'selected-item', reflect: true })
], SidebarMenu.prototype, "selectedItem", void 0);

var css_248z = i`@charset "UTF-8";
* {
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
  display: block;
  width: 100%;
}

/* Make the field wrapper behave as a select (pointer cursor) */
.select-field {
  cursor: pointer;
}

.select-trigger {
  flex: 1;
  display: flex;
  align-items: center;
  min-height: 1.5rem;
  outline: none;
  cursor: pointer;
  user-select: none;
  overflow: hidden;
  min-width: 0;
}
.select-trigger:focus-visible {
  outline: none;
}

.display-value {
  font-family: var(--typography-body-large-font-family) !important;
  font-size: var(--typography-body-large-font-size) !important;
  font-weight: var(--typography-body-large-font-weight) !important;
  line-height: var(--typography-body-large-line-height) !important;
  letter-spacing: var(--typography-body-large-letter-spacing) !important;
  color: var(--color-on-surface);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.placeholder {
  font-family: var(--typography-body-large-font-family) !important;
  font-size: var(--typography-body-large-font-size) !important;
  font-weight: var(--typography-body-large-font-weight) !important;
  line-height: var(--typography-body-large-line-height) !important;
  letter-spacing: var(--typography-body-large-letter-spacing) !important;
  color: var(--color-on-surface-variant);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Typeahead search input */
.search-input {
  flex: 1;
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  margin: 0;
  padding: 0;
  font-family: var(--typography-body-large-font-family) !important;
  font-size: var(--typography-body-large-font-size) !important;
  font-weight: var(--typography-body-large-font-weight) !important;
  line-height: var(--typography-body-large-line-height) !important;
  letter-spacing: var(--typography-body-large-letter-spacing) !important;
  color: var(--color-on-surface);
  cursor: pointer;
}
.search-input::placeholder {
  color: var(--color-on-surface-variant);
}
.search-input:focus {
  cursor: text;
}

/* Field end slot wrapper */
.field-end-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-050);
}

.select-empty-state {
  display: block;
  inline-size: min(22rem, 100%);
}

/* Dropdown chevron icon */
.dropdown-icon {
  --icon-size: 1.5rem;
  --icon-color: var(--color-on-surface-variant);
  transition: transform 200ms ease;
  flex-shrink: 0;
}
.dropdown-icon.dropdown-icon--open {
  transform: rotate(180deg);
}

/* Clear button */
.clear-btn {
  --button-container-shape: var(--shape-corner-full);
}

/* Multi-select chips area — single scrollable row, no vertical growth */
.chips-container {
  display: flex;
  align-items: center;
  flex: 1;
  padding-block: 0.5rem;
}

/* Disabled state */
:host([disabled]) .select-trigger,
:host([disabled]) .select-field {
  cursor: not-allowed;
}

/* Readonly state */
:host([readonly]) .select-trigger,
:host([readonly]) .select-field {
  cursor: default;
}`;

/**
 * @label Select
 * @tag wc-select
 * @rawTag select
 *
 * @summary A dropdown select component supporting single and multi-select with optional typeahead search.
 * @overview
 * Select builds on wc-field and wc-menu to provide a fully-featured dropdown picker.
 *
 * - Single and multi-select modes
 * - Client-side typeahead with `search="contains"`
 * - Server-side typeahead with `search="managed"`
 * - Multi-select chips display
 *
 * @example
 * ```html
 * <wc-select label="Fruit" placeholder="Pick a fruit...">
 *   <wc-option value="apple">Apple</wc-option>
 *   <wc-option value="banana">Banana</wc-option>
 * </wc-select>
 * ```
 * @tags form
 */
class Select extends BaseInput {
    constructor() {
        super(...arguments);
        this._menuId = `wc-select-menu-${Math.random().toString(36).slice(2, 9)}`;
        /**
         * Array of options to display in the dropdown.
         * Setting this property creates matching `<wc-option>` children automatically.
         */
        this.options = [];
        /**
         * The selected value. For multi-select, a comma-separated list of values.
         */
        this.value = '';
        /**
         * Enable multi-select mode.
         */
        this.multiple = false;
        /**
         * Enable typeahead search.
         * - `'contains'`: filters options client-side.
         * - `'managed'`: emits a `select-search` event for server-controlled filtering.
         */
        this.search = '';
        /**
         * Placeholder text shown when no value is selected.
         */
        this.placeholder = '';
        /**
         * Label displayed above the field.
         */
        this.label = '';
        /**
         * Visual variant of the field.
         */
        this.variant = 'default';
        /**
         * Helper text displayed below the field.
         */
        this.helperText = '';
        this.error = false;
        this.errorText = '';
        this.warning = false;
        this.warningText = '';
        this._open = false;
        this._focused = false;
        this._searchQuery = '';
        /** True when all options are filtered out by the current search query. */
        this._noOptionsVisible = false;
    }
    get _menu() {
        return this.renderRoot?.querySelector('wc-menu') ?? null;
    }
    focus() {
        this._triggerEl?.focus();
    }
    blur() {
        this._triggerEl?.blur();
    }
    // ── Lifecycle ─────────────────────────────────────────────────────────────
    updated(changedProperties) {
        if (changedProperties.has('options')) {
            this._syncProgrammaticOptions();
        }
        this._syncOptionStates();
    }
    // ── Programmatic options ───────────────────────────────────────────────────
    /**
     * Reconciles the `options` property with auto-generated `<wc-option>` light-DOM
     * children (marked `data-generated`).  Declarative children placed by the
     * consumer are left untouched.
     */
    _syncProgrammaticOptions() {
        this.querySelectorAll('wc-option[data-generated]').forEach(el => el.remove());
        for (const opt of this.options) {
            const el = new SelectOptionElement();
            el.value = opt.value;
            if (opt.icon)
                el.icon = opt.icon;
            el.textContent = opt.label || (opt.value === '' ? 'None' : '');
            el.dataset.generated = '';
            this.appendChild(el);
        }
    }
    // ── Option state sync ──────────────────────────────────────────────────────
    /**
     * Pushes `selected`, `keepOpen`, and `filtered` state onto every `<wc-option>`
     * child element so each one can render itself correctly.
     */
    _syncOptionStates() {
        const optEls = Array.from(this.querySelectorAll('wc-option'));
        let visibleCount = 0;
        for (const opt of optEls) {
            opt.selected = this._isSelected(opt.value);
            opt.keepOpen = this.multiple;
            if (this.search && this.search !== 'managed' && this._searchQuery) {
                const q = this._searchQuery.toLowerCase();
                const label = opt.textContent?.trim() ?? '';
                opt.filtered = !label.toLowerCase().includes(q);
                if (!opt.filtered)
                    visibleCount += 1;
            }
            else {
                opt.filtered = false;
                visibleCount += 1;
            }
        }
        this._noOptionsVisible = visibleCount === 0;
    }
    // ── Helpers ────────────────────────────────────────────────────────────────
    get _selectedValues() {
        if (!this.value)
            return [];
        return this.value
            .split(',')
            .map(v => v.trim())
            .filter(Boolean);
    }
    _isSelected(value) {
        if (!this.multiple) {
            return this.value === value;
        }
        return this._selectedValues.includes(value);
    }
    /** Returns the display label for a given option value. */
    _getLabelForValue(val) {
        for (const opt of this.querySelectorAll('wc-option')) {
            if (opt.value === val) {
                const label = opt.textContent?.trim();
                if (label)
                    return label;
                return val === '' ? 'None' : val;
            }
        }
        // Fallback to options array (before wc-option children are created)
        const programmaticLabel = this.options.find(o => o.value === val)?.label;
        if (programmaticLabel)
            return programmaticLabel;
        return val === '' ? 'None' : val;
    }
    get _displayLabel() {
        if (!this.value)
            return '';
        const firstValue = this._selectedValues[0];
        if (!firstValue)
            return '';
        return this._getLabelForValue(firstValue);
    }
    get _isPopulated() {
        return !!this.value;
    }
    // ── Menu open/close ────────────────────────────────────────────────────────
    _openMenu() {
        if (this.disabled || this.readonly)
            return;
        this._open = true;
        this._focused = true;
        this._triggerEl?.focus();
        const menu = this._menu;
        if (menu && this._triggerEl) {
            menu.anchorElement = this._triggerEl;
            const triggerWidth = this._triggerEl.getBoundingClientRect().width;
            if (triggerWidth < 240) {
                menu.style.setProperty('--menu-width', '240px');
            }
            else {
                menu.style.setProperty('--menu-width', `${Math.ceil(triggerWidth)}px`);
            }
            menu.show();
        }
        if (this.search) {
            this._searchQuery = '';
            // Use rAF so that the search input receives focus *after* wc-menu has
            // finished showing and potentially focused a menu item.
            this.updateComplete.then(() => {
                requestAnimationFrame(() => {
                    this._searchInputEl?.focus();
                });
            });
        }
    }
    _closeMenu() {
        if (!this._open)
            return;
        this._open = false;
        this._focused = false;
        this._searchQuery = '';
        this._menu?.close();
    }
    // ── Event handlers ─────────────────────────────────────────────────────────
    _handleTriggerClick(event) {
        event.stopPropagation();
        // Ignore clicks that originated inside the search input — those should not
        // toggle the menu (the input needs to stay open so the user can type).
        if (event.target instanceof HTMLInputElement) {
            return;
        }
        if (this._open) {
            this._closeMenu();
        }
        else {
            this._openMenu();
        }
    }
    _handleFieldClick(event) {
        const eventPath = event.composedPath();
        if (eventPath.includes(this._triggerEl) ||
            eventPath.some(target => target instanceof HTMLInputElement ||
                (target instanceof HTMLElement &&
                    (target.closest('.clear-btn') != null ||
                        target.matches('wc-icon-button'))))) {
            return;
        }
        if (this._open) {
            this._closeMenu();
        }
        else {
            this._openMenu();
        }
    }
    _handleTriggerKeyDown(event) {
        // When the typeahead search input is active, let the input handle its own
        // keys (Space, Enter, etc.). Only intercept Escape to close the menu.
        if (event.target instanceof HTMLInputElement) {
            if (event.key === 'Escape') {
                event.preventDefault();
                this._closeMenu();
            }
            return;
        }
        switch (event.key) {
            case 'Enter':
            case ' ':
            case 'ArrowDown':
                event.preventDefault();
                if (!this._open)
                    this._openMenu();
                break;
            case 'Escape':
                if (this._open) {
                    event.preventDefault();
                    this._closeMenu();
                }
                break;
        }
    }
    _handleMenuClosed() {
        this._open = false;
        this._focused = false;
        this._searchQuery = '';
    }
    _handleMenuItemActivate(event) {
        const item = event.detail?.item;
        if (!item)
            return;
        const val = item.value;
        if (val === undefined)
            return;
        if (this.multiple) {
            if (val === '')
                return;
            const values = this._selectedValues;
            const idx = values.indexOf(val);
            if (idx >= 0) {
                values.splice(idx, 1);
            }
            else {
                values.push(val);
            }
            this.value = values.join(',');
        }
        else {
            this.value = val;
            this._closeMenu();
        }
        this._dispatchChange();
    }
    _dispatchChange() {
        this.dispatchEvent(new CustomEvent('change', {
            detail: { value: this.value },
            bubbles: true,
            composed: true,
        }));
    }
    _handleSearchInput(event) {
        this._searchQuery = event.target.value;
        if (this.search === 'managed') {
            this.dispatchEvent(new CustomEvent('select-search', {
                detail: { value: this._searchQuery },
                bubbles: true,
                composed: true,
            }));
        }
    }
    _handleChipDismiss(event, chipValue) {
        event.stopPropagation();
        const values = this._selectedValues.filter(v => v !== chipValue);
        this.value = values.join(',');
        this._dispatchChange();
    }
    _renderEmptyState() {
        const hasSearchQuery = this._searchQuery.trim().length > 0;
        return b `
      <wc-empty-state
        class="select-empty-state content-center"
        illustration="no-document"
        headline=${hasSearchQuery ? 'No results found' : 'No options available'}
        description=${hasSearchQuery
            ? 'Try a different search term.'
            : 'There is nothing to select right now.'}
      ></wc-empty-state>
    `;
    }
    // ── Render helpers ─────────────────────────────────────────────────────────
    _renderTriggerContent() {
        // Typeahead: when open, show a text input for filtering
        if (this.search && this._open) {
            return b `<input
        class="search-input"
        .value=${this._searchQuery}
        placeholder=${this._displayLabel || this.placeholder}
        @input=${this._handleSearchInput}
      />`;
        }
        // Multi-select: show chips for selected items
        if (this.multiple && this._selectedValues.length > 0) {
            return b `<div class="chips-container">
      <wc-chip-set>
        ${this._selectedValues.map(val => b `
            <wc-chip
              dismissible
              value=${val}
              @tag--dismiss=${(e) => this._handleChipDismiss(e, val)}
            >${this._getLabelForValue(val)}</wc-chip
            >
          `)}
      </wc-chip-set>
      </div>`;
        }
        // Single select: show selected label or placeholder
        const label = this._displayLabel;
        if (!label) {
            return b `<span class="placeholder">${this.placeholder}</span>`;
        }
        return b `<span class="display-value">${label}</span>`;
    }
    _renderFieldEnd() {
        return b `
      <wc-icon
        class=${e({
            'dropdown-icon': true,
            'dropdown-icon--open': this._open,
        })}
        name="arrow_drop_down"
      ></wc-icon>
    `;
    }
    render() {
        return b `
      <wc-field
        label=${this.label}
        ?required=${this.required}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        ?skeleton=${this.skeleton}
        helper-text=${this.helperText}
        ?error=${this.error}
        error-text=${this.errorText}
        ?warning=${this.warning}
        warning-text=${this.warningText}
        variant=${this.variant}
        ?populated=${this._isPopulated || this._open}
        ?focused=${this._focused}
        .host=${this}
        class="select-field"
        @click=${this._handleFieldClick}
      >
        <div
          class="select-trigger"
          tabindex=${this.disabled ? -1 : 0}
          role="combobox"
          aria-label=${this.label || this.placeholder || 'Select option'}
          aria-controls=${this._menuId}
          aria-expanded=${String(this._open)}
          aria-haspopup="listbox"
          @click=${this._handleTriggerClick}
          @keydown=${this._handleTriggerKeyDown}
        >
          ${this._renderTriggerContent()}
        </div>

        <div slot="field-end" class="field-end-wrapper">
          ${this._renderFieldEnd()}
        </div>
      </wc-field>

      <wc-menu
        id=${this._menuId}
        placement="bottom-start"
        aria-label=${this.label || 'Options'}
        @closed=${this._handleMenuClosed}
        @menu-item-activate=${(e) => this._handleMenuItemActivate(e)}
      >
        <slot></slot>
        ${this._noOptionsVisible ? this._renderEmptyState() : A}
      </wc-menu>
    `;
    }
}
Select.styles = [css_248z];
__decorate([
    n({ type: Array })
], Select.prototype, "options", void 0);
__decorate([
    n({ type: String, reflect: true })
], Select.prototype, "value", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], Select.prototype, "multiple", void 0);
__decorate([
    n({ type: String })
], Select.prototype, "search", void 0);
__decorate([
    n({ type: String })
], Select.prototype, "placeholder", void 0);
__decorate([
    n({ type: String })
], Select.prototype, "label", void 0);
__decorate([
    n({ type: String })
], Select.prototype, "variant", void 0);
__decorate([
    n({ type: String, attribute: 'helper-text' })
], Select.prototype, "helperText", void 0);
__decorate([
    n({ type: Boolean })
], Select.prototype, "error", void 0);
__decorate([
    n({ type: String, attribute: 'error-text' })
], Select.prototype, "errorText", void 0);
__decorate([
    n({ type: Boolean })
], Select.prototype, "warning", void 0);
__decorate([
    n({ type: String, attribute: 'warning-text' })
], Select.prototype, "warningText", void 0);
__decorate([
    r()
], Select.prototype, "_open", void 0);
__decorate([
    r()
], Select.prototype, "_focused", void 0);
__decorate([
    r()
], Select.prototype, "_searchQuery", void 0);
__decorate([
    r()
], Select.prototype, "_noOptionsVisible", void 0);
__decorate([
    e$1('.select-trigger')
], Select.prototype, "_triggerEl", void 0);
__decorate([
    e$1('.search-input')
], Select.prototype, "_searchInputEl", void 0);

export { ChipSet as C, DatePicker as D, Input as I, LinearProgress as L, NumberField as N, Select as S, Tag as T, UrlField as U, CircularProgress as a, SidebarMenu as b, SidebarMenuItem as c, SidebarSubMenu as d, Switch as e, Textarea as f, TimePicker as g };
//# sourceMappingURL=select-CnnPbvpQ.js.map
