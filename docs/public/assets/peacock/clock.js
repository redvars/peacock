import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';

class ClockController {
    constructor(host, timeout = 1000) {
        this.value = new Date();
        this.host = host;
        this.host.addController(this);
        this.timeout = timeout;
    }
    hostConnected() {
        // Start a timer when the host is connected
        this._timerID = setInterval(() => {
            this.value = new Date();
            // Update the host with new value
            this.host.requestUpdate();
        }, this.timeout);
    }
    hostDisconnected() {
        // Clear the timer when the host is disconnected
        clearInterval(this._timerID);
        this._timerID = undefined;
    }
}

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
  display: inline-block;
}

.current-time {
  font-family: var(--typography-body-medium-font-family) !important;
  font-size: var(--typography-body-medium-font-size) !important;
  font-weight: var(--typography-body-medium-font-weight) !important;
  line-height: var(--typography-body-medium-line-height) !important;
  letter-spacing: var(--typography-body-medium-letter-spacing) !important;
}`;

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
let Clock = class Clock extends i$1 {
    constructor() {
        super(...arguments);
        this.clockController = new ClockController(this, 100);
    }
    __formatDate(date) {
        return date.toLocaleTimeString('en-US', {
            timeZone: this.timezone,
        });
    }
    render() {
        const currentDate = this.__formatDate(this.clockController.value);
        return b `<div class="current-time">${currentDate}</div>`;
    }
};
Clock.styles = [css_248z];
__decorate([
    n()
], Clock.prototype, "timezone", void 0);
Clock = __decorate([
    IndividualComponent
], Clock);

export { Clock };
//# sourceMappingURL=clock.js.map
