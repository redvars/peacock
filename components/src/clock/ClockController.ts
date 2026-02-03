import { ReactiveController, ReactiveControllerHost } from 'lit';

export class ClockController implements ReactiveController {
  host: ReactiveControllerHost;

  value = new Date();

  timeout: number;

  private _timerID?: any;

  constructor(host: ReactiveControllerHost, timeout = 1000) {
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
