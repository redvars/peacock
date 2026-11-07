import { i, _ as __decorate, I as IndividualComponent, a as i$1, A, b } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { o } from './style-map-CHOg6N_R.js';
import { r as resolveLocale } from './locale-DEsJZCQG.js';
import './directive-ZPhl09Yt.js';

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
  display: block;
  position: relative;
  --number-counter-font-size: 1rem;
}

.number-counter {
  display: flex;
}

.digit {
  position: relative;
  overflow: hidden;
  block-size: calc(var(--number-counter-font-size) * 1.1);
}

.digit-content {
  display: flex;
  flex-direction: column;
  transition: transform var(--duration-long1) var(--easing-standard);
}

.each-digit, .digit-separator {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--number-counter-font-size);
}

.visually-hidden {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

@media (prefers-reduced-motion: reduce) {
  .digit-content {
    transition: none;
  }
}`;

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
/**
 * @label Number Counter
 * @tag wc-number-counter
 * @rawTag number-counter
 * @summary Displays a number with locale grouping, rolling each digit to its new value.
 * @overview
 * <p>The rolling digit columns are hidden from assistive technology; screen readers read the
 * formatted value from a visually hidden copy instead.</p>
 *
 * @cssprop [--number-counter-font-size=1rem] - Font size of the digits.
 *
 * @example
 * ```html
 * <wc-number-counter id="number-counter" value="123456789"></wc-number-counter>
 * <script>
 *   customElements.whenDefined('wc-number-counter').then(() => {
      const $counter = document.querySelector('#number-counter');

      setInterval(() => {
        $counter.value = $counter.value + Math.floor(Math.random() * 1000);
      }, 1000);
    });
 * </script>
 * ```
 * @tags display
 */
let NumberCounter = class NumberCounter extends i$1 {
    constructor() {
        super(...arguments);
        /** The number to display. */
        this.value = 0;
    }
    // ── Private ───────────────────────────────────────────────────────────────
    /** The value formatted for the resolved locale, or `''` when there is no value. */
    get formattedValue() {
        if (this.value === undefined || this.value === null)
            return '';
        return new Intl.NumberFormat(resolveLocale(this.locale, this)).format(this.value);
    }
    // ── Render helpers ────────────────────────────────────────────────────────
    renderDigits(formattedValue) {
        if (!formattedValue)
            return A;
        return b `${formattedValue.split('').map(char => {
            const digit = parseInt(char, 10);
            if (Number.isNaN(digit)) {
                return b `<div class="digit-separator">${char}</div>`;
            }
            return this.renderDigit(digit);
        })}`;
    }
    // eslint-disable-next-line class-methods-use-this
    renderDigit(digit) {
        // Each digit is 10% of the column's height (there are 10 numbers).
        const style = { transform: `translateY(-${digit * 10}%)` };
        return b `<div class="digit">
      <div class="digit-content" style=${o(style)}>
        ${DIGITS.map(n => b `<div class="each-digit">${n}</div>`)}
      </div>
    </div>`;
    }
    // ── Render ────────────────────────────────────────────────────────────────
    render() {
        const { formattedValue } = this;
        return b `<div class="number-counter" aria-hidden="true">
        ${this.renderDigits(formattedValue)}
      </div>
      <span class="visually-hidden">${formattedValue}</span>`;
    }
};
NumberCounter.styles = [css_248z];
__decorate([
    n({ type: Number })
], NumberCounter.prototype, "value", void 0);
__decorate([
    n()
], NumberCounter.prototype, "locale", void 0);
NumberCounter = __decorate([
    IndividualComponent
], NumberCounter);

export { NumberCounter };
//# sourceMappingURL=number-counter.js.map
