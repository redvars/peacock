import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

import IndividualComponent from '@/IndividualComponent.js';
import { resolveLocale } from '@/__internal/i18n/locale.js';

import styles from './number-counter.scss';

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
@IndividualComponent
export class NumberCounter extends LitElement {
  static styles = [styles];

  /** The number to display. */
  @property({ type: Number }) value = 0;

  /**
   * BCP 47 locale used to format the number. Defaults to the nearest `lang`, then the document's,
   * then the browser language.
   */
  @property() locale?: string;

  // ── Private ───────────────────────────────────────────────────────────────

  /** The value formatted for the resolved locale, or `''` when there is no value. */
  private get formattedValue(): string {
    if (this.value === undefined || this.value === null) return '';
    return new Intl.NumberFormat(resolveLocale(this.locale, this)).format(
      this.value,
    );
  }

  // ── Render helpers ────────────────────────────────────────────────────────

  private renderDigits(formattedValue: string) {
    if (!formattedValue) return nothing;

    return html`${formattedValue.split('').map(char => {
      const digit = parseInt(char, 10);
      if (Number.isNaN(digit)) {
        return html`<div class="digit-separator">${char}</div>`;
      }
      return this.renderDigit(digit);
    })}`;
  }

  // eslint-disable-next-line class-methods-use-this
  private renderDigit(digit: number) {
    // Each digit is 10% of the column's height (there are 10 numbers).
    const style = { transform: `translateY(-${digit * 10}%)` };

    return html`<div class="digit">
      <div class="digit-content" style=${styleMap(style)}>
        ${DIGITS.map(n => html`<div class="each-digit">${n}</div>`)}
      </div>
    </div>`;
  }

  // ── Render ────────────────────────────────────────────────────────────────

  render() {
    const { formattedValue } = this;
    return html`<div class="number-counter" aria-hidden="true">
        ${this.renderDigits(formattedValue)}
      </div>
      <span class="visually-hidden">${formattedValue}</span>`;
  }
}
