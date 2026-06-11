import { LitElement, nothing } from 'lit';
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
export declare class NumberCounter extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    value: number;
    /**
     * Optional: Allow users to pass a locale, defaulting to 'en-US' for commas.
     */
    locale: string;
    render(): import("lit-html").TemplateResult<1>;
    renderDigits(): typeof nothing | import("lit-html").TemplateResult<1>;
    renderDigit(digit: number): import("lit-html").TemplateResult<1>;
}
