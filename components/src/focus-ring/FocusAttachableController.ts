import { ReactiveController, ReactiveControllerHost } from 'lit';

export class FocusAttachableController implements ReactiveController {
  host: ReactiveControllerHost;

  getControlElement: () => HTMLElement;

  visible = false;

  constructor(
    host: ReactiveControllerHost,
    getControlElement: () => HTMLElement,
  ) {
    (this.host = host).addController(this);
    this.getControlElement = getControlElement;
  }

  hostConnected() {
    // Start a timer when the host is connected
    console.log('connected');
    if (this.getControlElement) {
      const element = this.getControlElement();
      element.addEventListener('focus', () => {
        console.log('focus');
        // @ts-ignore
        this.host.handleEvent();
        this.host.requestUpdate();
      });
    }
  }

  // eslint-disable-next-line class-methods-use-this
  hostDisconnected() {
    console.log('disconnected');
  }
}
