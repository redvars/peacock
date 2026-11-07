import { ReactiveController, ReactiveControllerHost } from 'lit';

/**
 * Keeps `value` at the current time, updating the host once per `period` milliseconds. Each tick is
 * scheduled for the next whole `period` boundary (by default the next second), so the displayed
 * time changes on the second and does not drift.
 */
export class ClockController implements ReactiveController {
  host: ReactiveControllerHost;

  /** The time of the last tick. */
  value = new Date();

  /** Milliseconds between ticks. */
  period: number;

  private _timerID?: ReturnType<typeof setTimeout>;

  constructor(host: ReactiveControllerHost, period = 1000) {
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
  delayUntilNextTick(now: number = Date.now()): number {
    return this.period - (now % this.period);
  }

  /** Updates `value` and asks the host to render. */
  tick() {
    this.value = new Date();
    this.host.requestUpdate();
  }

  private schedule() {
    clearTimeout(this._timerID);
    this._timerID = setTimeout(() => {
      this.tick();
      this.schedule();
    }, this.delayUntilNextTick());
  }
}
