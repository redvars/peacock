import { ReactiveController, ReactiveControllerHost } from 'lit';
/**
 * Keeps `value` at the current time, updating the host once per `period` milliseconds. Each tick is
 * scheduled for the next whole `period` boundary (by default the next second), so the displayed
 * time changes on the second and does not drift.
 */
export declare class ClockController implements ReactiveController {
    host: ReactiveControllerHost;
    /** The time of the last tick. */
    value: Date;
    /** Milliseconds between ticks. */
    period: number;
    private _timerID?;
    constructor(host: ReactiveControllerHost, period?: number);
    hostConnected(): void;
    hostDisconnected(): void;
    /** Milliseconds from `now` to the next whole `period` boundary (never 0). */
    delayUntilNextTick(now?: number): number;
    /** Updates `value` and asks the host to render. */
    tick(): void;
    private schedule;
}
