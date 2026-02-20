import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import styles from './number-counter.scss';

/**
 * @label Number Counter
 * @tag p-number-counter
 * @rawTag number-counter
 * @summary Displays a number with commas for thousands.
 *
 * @example
 * ```html
 * <p-number-counter value="123456789"></p-number-counter>
 * <script>
 *     const $counter = document.querySelector('p-number-counter');
 *
 *     setInterval(() => {
 *         $counter.value = $counter.value + parseInt(Math.floor(Math.random() * 1000));
 *     }, 1000);
 * </script>
 * ```
 * @tags display
 */
export class NumberCounter extends LitElement {
  static styles = [styles];

  @property({ type: Number }) value = 0;

  /**
   * Optional: Allow users to pass a locale, defaulting to 'en-US' for commas.
   */
  @property() locale = 'en-US';

  render() {
    return html`<div class="number-counter">${this.renderDigits()}</div>`;
  }

  renderDigits() {
    if (this.value === undefined || this.value === null) return nothing;

    // 1. Format the number with commas (e.g., 1234 -> "1,234")
    const formattedValue = new Intl.NumberFormat(this.locale).format(
      this.value,
    );

    // 2. Split the string into individual characters
    const chars = formattedValue.split('');

    return html`${chars.map(char => {
      // 3. Check if the character is a digit or a separator (comma/dot)
      const digit = parseInt(char, 10);

      // eslint-disable-next-line no-restricted-globals
      if (isNaN(digit)) {
        return html`<div class="digit-separator">${char}</div>`;
      }

      return this.renderDigit(digit);
    })}`;
  }

  // eslint-disable-next-line class-methods-use-this
  renderDigit(digit: number) {
    // Each 'each-digit' is 10% of the 'digit-content' height (since there are 10 numbers)
    const offset = digit * 10;
    const style = {
      transform: `translateY(-${offset}%)`,
    };

    return html` <div class="digit">
      <div class="digit-content" style=${styleMap(style)}>
        ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(
          n => html`<div class="each-digit">${n}</div>`,
        )}
      </div>
    </div>`;
  }
}
