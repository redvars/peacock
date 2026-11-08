import type { ReactiveController, ReactiveControllerHost } from 'lit';
import { findDiagramCanvas, type DiagramCanvas } from './host.js';

/**
 * Links a control (`wc-diagram-controls`, `wc-diagram-minimap`) to its canvas: finds it, waits for
 * it to be defined when it is lazy-loaded, subscribes to its updates and calls `onSync` after each.
 */
export class DiagramCanvasLink implements ReactiveController {
  canvas: DiagramCanvas | null = null;

  private readonly host: ReactiveControllerHost & HTMLElement;

  private readonly options: { forId: () => string; onSync: () => void };

  private unsubscribe?: () => void;

  constructor(
    host: ReactiveControllerHost & HTMLElement,
    options: { forId: () => string; onSync: () => void },
  ) {
    this.host = host;
    this.options = options;
    host.addController(this);
  }

  hostConnected() {
    this.attach();
  }

  hostDisconnected() {
    this.detach();
  }

  /** Looks for the canvas again, for example after `for` changed. */
  attach() {
    this.detach();
    const forId = this.options.forId();
    const canvas = findDiagramCanvas(this.host, forId);
    if (canvas) {
      this.canvas = canvas;
      this.unsubscribe = canvas._diagramSubscribe(() => this.options.onSync());
      this.options.onSync();
      return;
    }
    const candidate = forId
      ? (this.host.getRootNode() as Document | ShadowRoot).getElementById?.(
          forId,
        )
      : this.host.parentElement;
    const tag = candidate?.localName;
    const retry = () => {
      if (this.host.isConnected && !this.canvas) this.attach();
    };
    if (tag?.includes('-') && !customElements.get(tag)) {
      customElements.whenDefined(tag).then(retry);
    } else if (forId && !candidate) {
      requestAnimationFrame(retry);
    }
  }

  private detach() {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    this.canvas = null;
  }
}
