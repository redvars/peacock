import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { r as resolveLocale } from './locale-DEsJZCQG.js';

/**
 * Keeps `value` at the current time, updating the host once per `period` milliseconds. Each tick is
 * scheduled for the next whole `period` boundary (by default the next second), so the displayed
 * time changes on the second and does not drift.
 */
class ClockController {
    constructor(host, period = 1000) {
        /** The time of the last tick. */
        this.value = new Date();
        this.host = host;
        this.period = period;
        this.host.addController(this);
    }
    hostConnected() {
        this.value = new Date();
        this.schedule();
    }
    hostDisconnected() {
        clearTimeout(this._timerID);
        this._timerID = undefined;
    }
    /** Milliseconds from `now` to the next whole `period` boundary (never 0). */
    delayUntilNextTick(now = Date.now()) {
        return this.period - (now % this.period);
    }
    /** Updates `value` and asks the host to render. */
    tick() {
        this.value = new Date();
        this.host.requestUpdate();
    }
    schedule() {
        clearTimeout(this._timerID);
        this._timerID = setTimeout(() => {
            this.tick();
            this.schedule();
        }, this.delayUntilNextTick());
    }
}

var css_248z = i`* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.screen-reader-only {
  position: absolute !important;
  inline-size: 1px !important;
  block-size: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip-path: inset(50%) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

[hidden] {
  display: none !important;
}

@media (forced-colors: active) {
  .selected,
  [aria-selected=true],
  [aria-pressed=true],
  [aria-checked=true],
  [aria-current]:not([aria-current=false]) {
    outline: 2px solid Highlight;
    outline-offset: -2px;
  }
  .disabled,
  [aria-disabled=true] {
    color: GrayText;
  }
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
let Clock = class Clock extends i$1 {
    constructor() {
        super(...arguments);
        // ── Private fields ────────────────────────────────────────────────────────
        /** Ticks once a second, aligned to the second boundary. */
        this.clockController = new ClockController(this, 1000);
    }
    // ── Private ───────────────────────────────────────────────────────────────
    formatTime(date) {
        return date.toLocaleTimeString(resolveLocale(this.locale, this), {
            timeZone: this.timezone,
        });
    }
    // ── Render ────────────────────────────────────────────────────────────────
    render() {
        return b `<div class="current-time">
      ${this.formatTime(this.clockController.value)}
    </div>`;
    }
};
Clock.styles = [css_248z];
__decorate([
    n()
], Clock.prototype, "timezone", void 0);
__decorate([
    n()
], Clock.prototype, "locale", void 0);
Clock = __decorate([
    IndividualComponent
], Clock);

export { Clock };
//# sourceMappingURL=clock.js.map
