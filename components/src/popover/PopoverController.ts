import { ReactiveController, ReactiveControllerHost } from 'lit';
import {
  computePosition,
  autoUpdate,
  offset,
  flip,
  shift,
  type Placement,
} from '@floating-ui/dom';

export class PopoverController implements ReactiveController {
  private cleanup?: () => void;

  constructor(
    private host: ReactiveControllerHost,
    private options: {
      placement: Placement;
      offset: number;
    } = { placement: 'bottom', offset: 6 },
  ) {
    this.host.addController(this);
  }

  // Set up the floating logic
  async updatePosition(reference: HTMLElement | null, floating: HTMLElement) {
    if (!reference) return;

    this.cleanup?.();

    this.cleanup = autoUpdate(reference, floating, async () => {
      const { x, y } = await computePosition(reference, floating, {
        placement: this.options.placement,
        middleware: [
          offset(this.options.offset),
          flip(),
          shift({ padding: 4 }),
        ],
      });

      Object.assign(floating.style, {
        left: `${x}px`,
        top: `${y}px`,
        position: 'absolute',
      });
    });
  }

  hostDisconnected() {
    this.cleanup?.();
  }
}
