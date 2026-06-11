import { LitElement } from 'lit';
import { ClockController } from './ClockController.js';
/**
 * @label Clock
 * @tag wc-clock
 * @rawTag clock
 * @summary Displays the current time in a given timezone.
 * @overview
 *  - Clocks are used to display the current time in a specified timezone.
 *  - They can be displayed in various formats, including 12-hour and 24-hour time.
 * @tags display
 *
 * @example
 * ```html
 * <wc-clock></wc-clock>
 * ```
 */
export declare class Clock extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    clockController: ClockController;
    timezone?: string;
    __formatDate(date: Date): string;
    render(): import("lit-html").TemplateResult<1>;
}
