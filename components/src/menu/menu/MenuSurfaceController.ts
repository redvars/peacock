import { ReactiveController, ReactiveControllerHost } from 'lit';
import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
  type Placement,
  type Strategy,
} from '@floating-ui/dom';

type PositionOptions = {
  reference: HTMLElement;
  floating: HTMLElement;
  placement: Placement;
  offset: number;
  strategy?: Strategy;
};

async function updateSurfacePosition(options: PositionOptions & { strategy: Strategy }) {
  const { x, y } = await computePosition(options.reference, options.floating, {
    strategy: options.strategy,
    placement: options.placement,
    middleware: [offset(options.offset), flip(), shift({ padding: 8 })],
  });

  Object.assign(options.floating.style, {
    position: options.strategy,
    left: `${x}px`,
    top: `${y}px`,
  });
}

export class MenuSurfaceController implements ReactiveController {
  private cleanup?: () => void;

  constructor(private host: ReactiveControllerHost) {
    this.host.addController(this);
  }

  start(options: PositionOptions) {
    this.stop();

    const strategy = options.strategy ?? 'fixed';

    this.cleanup = autoUpdate(options.reference, options.floating, () => {
      updateSurfacePosition({ ...options, strategy });
    });

    updateSurfacePosition({ ...options, strategy });
  }

  stop() {
    this.cleanup?.();
    this.cleanup = undefined;
  }

  hostDisconnected() {
    this.stop();
  }
}
