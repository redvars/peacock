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
    if (this.getControlElement) {
      const element = this.getControlElement();
      element.addEventListener('focus', () => {
        // @ts-ignore
        this.host.handleEvent();
        this.host.requestUpdate();
      });
    }
  }
}
