import { LitElement } from 'lit';
import { ClockController } from './ClockController.js';
/**
 * @label Clock
 * @tag wc-clock
 * @rawTag clock
 * @summary The current time in a given timezone, formatted for the locale and updated every second.
 * @overview
 * <ul>
 * <li>Clocks are used to display the current time in a specified timezone.</li>
 * <li>The time is formatted for <code>locale</code> (by default the nearest <code>lang</code>), so
 * 12- or 24-hour time follows the locale.</li>
 * <li>The time updates once a second, on the second.</li>
 * </ul>
 * @tags display
 *
 * @example
 * ```html
 * <wc-clock></wc-clock>
 * ```
 */
export declare class Clock extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /** IANA timezone to show the time in, for example `Europe/Berlin`. Defaults to the local timezone. */
    timezone?: string;
    /**
     * BCP 47 locale used to format the time. Defaults to the nearest `lang`, then the document's,
     * then the browser language.
     */
    locale?: string;
    /** Ticks once a second, aligned to the second boundary. */
    readonly clockController: ClockController;
    private formatTime;
    render(): import("lit-html").TemplateResult<1>;
}
