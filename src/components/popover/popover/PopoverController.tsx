import { throttle } from '../../../utils/utils';
import {
  arrow,
  autoPlacement,
  computePosition,
  flip,
  offset as floatingUIOffset,
} from '@floating-ui/dom';

export default class PopoverController {
  host: HTMLElement;
  trigger: 'hover' | 'click' | 'manual';
  contentRef: HTMLElement;
  arrowRef?: HTMLElement;
  triggers: HTMLElement[];
  triggerRef: HTMLElement;
  offset: number;
  placements?: string;
  open: boolean;
  contentPadding: number;
  openTimeout: number;
  dismissTimeout: number;

  showCallback: () => void;
  hideCallback: () => void;

  observer: IntersectionObserver;

  constructor(
    host: HTMLElement,
    trigger: 'hover' | 'click' | 'manual' = 'hover',
    open: boolean,
    contentRef: HTMLElement,
    offset: number = 0,
    contentPadding: number = 0,
    show: () => void,
    hide: () => void,
    placements?: string,
    openTimeout: number = 200,
    dismissTimeout: number = 300,
    arrowRef?: HTMLElement,
  ) {
    this.host = host;
    this.open = open;
    this.trigger = trigger;
    this.contentRef = contentRef;
    this.offset = offset;
    this.arrowRef = arrowRef;
    this.placements = placements;
    this.openTimeout = openTimeout;
    this.dismissTimeout = dismissTimeout;
    this.triggers = [];
    this.showCallback = show;
    this.hideCallback = hide;
    this.contentPadding = contentPadding;
    this.observer = new IntersectionObserver(
      () => this.intersectingCallback(),
      {
        threshold: [0, 1],
      },
    );
    this.observer.observe(this.contentRef);
  }

  setOpen(open: boolean) {
    this.open = open;
  }

  setTriggerRef(triggerRef: HTMLElement) {
    this.triggerRef = triggerRef;
  }

  hidePopover = () => {
    if (this.open) {
      this.open = false;
      this.hideCallback();
    }
  };

  showPopover = () => {
    if (!this.open) {
      if (this.trigger === 'hover') {
        setTimeout(() => {
          if (this.triggerRef.matches(':hover')) {
            this.showCallback();
          }
        }, this.openTimeout);
      } else {
        this.showCallback();
      }
    }
  };

  registerTarget(triggerRef: HTMLElement) {
    if (!triggerRef)
      throw new Error('The trigger element for the popover is not found.');

    if (this.triggers.find(trigger => trigger === triggerRef)) return;

    this.observer.observe(triggerRef);

    if (this.trigger === 'hover') {
      triggerRef.addEventListener('focus', () => {
        this.triggerRef = triggerRef;
        this.showPopover();
      });
      triggerRef.addEventListener('blur', () => this.hidePopover());
      triggerRef.addEventListener('mouseenter', () => {
        this.triggerRef = triggerRef;
        this.showPopover();
      });
      triggerRef.addEventListener('mouseleave', this.mouseleaveHandler);
    } else if (this.trigger == 'click') {
      if (triggerRef.nodeName === 'GOAT-BUTTON') {
        triggerRef.addEventListener('pc-button--click', () => {
          this.open ? this.hidePopover() : this.showPopover();
        });
      } else {
        triggerRef.addEventListener('click', () => {
          this.open ? this.hidePopover() : this.showPopover();
        });
      }
    }

    this.triggers.push(triggerRef);
  }

  mouseleaveHandler = (event: any) => {
    const eventPath = event.path ? event.path : event.composedPath();
    const popoverHost = eventPath.filter(node => node === this.host)[0];
    if (popoverHost) {
      const mouseLeaveHandler = (() => {
        const hoverElements = document.querySelectorAll(':hover');
        const index = [].indexOf.call(hoverElements, popoverHost);
        if (index < 0) {
          this.hidePopover();
        }
      }).bind(this);
      setTimeout(mouseLeaveHandler, this.dismissTimeout);
    } else {
      this.hidePopover();
    }
  };

  intersectingCallback() {
    this.open && this.computePositionThrottle('onTriggerIntersection');
  }

  computePosition = (context: string) => {
    if (!this.triggerRef || !this.contentRef) {
      console.warn('Popover: triggerRef or contentRef is not found');
      return;
    }

    if (!this.open) return;
    console.log('Popover: computePositionThrottle', context, this.triggerRef);

    const middleware = [];

    /**
     * Maintain the order of the middleware.
     * The `offset` middleware must be the first middleware
     * The `arrow` middleware must be the last middleware
     */

    /**
     * Offset the popover by the arrow's hypotenuse length
     */
    let floatingOffset = this.offset;
    if (this.arrowRef) {
      const arrowLen = this.arrowRef.offsetWidth;
      // Get half the arrow box's hypotenuse length
      floatingOffset += Math.sqrt(2 * arrowLen ** 2) / 2;
    }

    middleware.push(
      floatingUIOffset({
        mainAxis: floatingOffset + this.contentPadding,
        crossAxis: -this.contentPadding,
        alignmentAxis: -this.contentPadding,
      }),
    );

    /**
     * Handle content overflow size
     */
    /* middleware.push(size({
      apply({ availableHeight }) {
        if (availableHeight < 10 * 16) return;
        menuElm.style.setProperty(
          '--goat-menu-max-height',
          `${availableHeight}px`,
        );
      },
      padding: 5,
    }))*/

    /**
     * Add the flip and autoPlacement middleware and possible placements
     */
    const placements = this.placements ? this.placements.split(',') : [];
    const placement: any = placements[0];

    if (placements.length === 0) {
      middleware.push(autoPlacement());
    } else {
      const fallbackPlacements: any = placements.splice(1);
      middleware.push(flip({ fallbackPlacements }));
    }

    if (this.arrowRef) middleware.push(arrow({ element: this.arrowRef }));

    computePosition(this.triggerRef, this.contentRef, {
      placement,
      middleware,
    }).then(({ x, y, strategy, middlewareData, placement }) => {
      const [side, leaning] = placement.split('-');

      const style: any = {};
      style.left = `${x}px`;
      style.top = `${y}px`;
      style.position = strategy === 'fixed' ? 'fixed' : 'absolute';

      let topShadowSize = 0;
      let leftShadowSize = 0;

      if (side == 'top' || side == 'bottom') {
        if (side == 'top') {
          topShadowSize = -2;
        } else if (side == 'bottom') {
          topShadowSize = 2;
        }
        if (leaning == 'start') {
          leftShadowSize = 2;
        } else if (leaning == 'end') {
          leftShadowSize = -2;
        }
      } else if (side == 'left' || side == 'right') {
        if (side == 'left') {
          leftShadowSize = -2;
        } else if (side == 'right') {
          leftShadowSize = 2;
        }
        if (leaning == 'start') {
          topShadowSize = -2;
        } else if (leaning == 'end') {
          topShadowSize = 2;
        }
      }

      this.contentRef.style.setProperty(
        '--popover-content-shadow',
        `drop-shadow(${leftShadowSize}px ${topShadowSize}px 2px rgba(0, 0, 0, 0.2))`,
      );

      Object.assign(this.contentRef.style, style);

      if (middlewareData.arrow) {
        const { x, y } = middlewareData.arrow;

        const staticSide = {
          top: 'bottom',
          right: 'left',
          bottom: 'top',
          left: 'right',
        }[side];

        Object.assign(this.arrowRef.style, {
          left: x != null ? `${x}px` : '',
          top: y != null ? `${y}px` : '',
          // Ensure the static side gets unset when
          // flipping to other placements' axes.
          right: '',
          bottom: '',
          [staticSide]: `${-this.arrowRef.offsetWidth / 2}px`,
        });
      }
      //if (callBack) callBack();
    });
  };

  computePositionThrottle = throttle(this.computePosition, 80, {
    leading: true,
    trailing: true,
  });

  windowClickHandler = (evt: any) => {
    if ((this.trigger === 'click' || this.trigger == 'hover') && this.open) {
      const path = evt.path || evt.composedPath();
      for (const elm of path) {
        if (elm == this.host || this.triggers.find(t => t == elm)) return;
      }
      this.hidePopover();
    }
  };

  destroy() {
    this.observer.disconnect();
    this.observer = null;
  }
}
