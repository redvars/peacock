import { i, _ as __decorate, I as IndividualComponent, a as i$1, b, A } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { o } from './style-map-BQD5Et1D.js';
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
  display: block;
  --number-counter-font-size: 1rem;
}

.number-counter {
  display: flex;
}

.digit {
  position: relative;
  overflow: hidden;
  height: calc(var(--number-counter-font-size) * 1.1);
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
}`;

/**
 * @label Number Counter
 * @tag wc-number-counter
 * @rawTag number-counter
 * @summary Displays a number with commas for thousands.
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
        this.value = 0;
        /**
         * Optional: Allow users to pass a locale, defaulting to 'en-US' for commas.
         */
        this.locale = 'en-US';
    }
    render() {
        return b `<div class="number-counter">${this.renderDigits()}</div>`;
    }
    renderDigits() {
        if (this.value === undefined || this.value === null)
            return A;
        // 1. Format the number with commas (e.g., 1234 -> "1,234")
        const formattedValue = new Intl.NumberFormat(this.locale).format(this.value);
        // 2. Split the string into individual characters
        const chars = formattedValue.split('');
        return b `${chars.map(char => {
            // 3. Check if the character is a digit or a separator (comma/dot)
            const digit = parseInt(char, 10);
            // eslint-disable-next-line no-restricted-globals
            if (isNaN(digit)) {
                return b `<div class="digit-separator">${char}</div>`;
            }
            return this.renderDigit(digit);
        })}`;
    }
    // eslint-disable-next-line class-methods-use-this
    renderDigit(digit) {
        // Each 'each-digit' is 10% of the 'digit-content' height (since there are 10 numbers)
        const offset = digit * 10;
        const style = {
            transform: `translateY(-${offset}%)`,
        };
        return b ` <div class="digit">
      <div class="digit-content" style=${o(style)}>
        ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => b `<div class="each-digit">${n}</div>`)}
      </div>
    </div>`;
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
