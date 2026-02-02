import { html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import styles from './clock.scss';

/**
 * @label Clock
 * @tag p-clock
 * @rawTag clock
 *
 * @summary Displays the current time in a given timezone.
 * @overview
 *  - Clocks are used to display the current time in a specified timezone.
 *  - They can be displayed in various formats, including 12-hour and 24-hour time.
 *
 * @example
 * ```html
 * <p-clock></p-clock>
 * ```
 * @tags display
 */
export class Clock extends LitElement {
  static styles = [styles];

  @property() timezone?: string;

  // `currentTime` is decorated with `@State()`,
  // as we need to trigger a rerender when its
  // value changes to show the latest time
  @state() currentTime: string = '';

  private _timerId: any;

  connectedCallback() {
    super.connectedCallback();
    this.__updateCurrentTime();
    this._timerId = setInterval(() => {
      this.__updateCurrentTime();
    }, 1000);
  }

  disconnectedCallback() {
    if (this._timerId) {
      clearInterval(this._timerId);
    }
    super.disconnectedCallback();
  }

  __updateCurrentTime() {
    this.currentTime = new Date().toLocaleTimeString('en-US', {
      timeZone: this.timezone,
    });
  }

  render() {
    return html`<div class="current-time">${this.currentTime}</div>`;
  }
}
