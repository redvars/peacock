import { LitElement } from 'lit';
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
export declare class NumberCounter extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /** The number to display. */
    value: number;
    /**
     * BCP 47 locale used to format the number. Defaults to the nearest `lang`, then the document's,
     * then the browser language.
     */
    locale?: string;
    /** The value formatted for the resolved locale, or `''` when there is no value. */
    private get formattedValue();
    private renderDigits;
    private renderDigit;
    render(): import("lit-html").TemplateResult<1>;
}
