import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import IndividualComponent from '@/IndividualComponent.js';
import { ClockController } from './ClockController.js';

import styles from './clock.scss';

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
@IndividualComponent
export class Clock extends LitElement {
  static styles = [styles];

  clockController = new ClockController(this, 100);

  @property() timezone?: string;

  __formatDate(date: Date) {
    return date.toLocaleTimeString('en-US', {
      timeZone: this.timezone,
    });
  }

  render() {
    const currentDate = this.__formatDate(this.clockController.value);
    return html`<div class="current-time">${currentDate}</div>`;
  }
}
