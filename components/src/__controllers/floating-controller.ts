import {
  computePosition,
  autoUpdate,
  offset,
  flip,
  shift,
  arrow,
  Placement,
  Strategy,
  Middleware,
} from '@floating-ui/dom';
import { ReactiveController, ReactiveControllerHost } from 'lit';

export type TriggerType =
  | 'hover'
  | 'click'
  | 'context-menu'
  | 'manual'
  | 'focus'
  | 'hover-focus';

export interface FloatingOptions {
  placement?: Placement;
  strategy?: Strategy;
  offset?: number;
  trigger?: TriggerType;
  closeOnClickOutside?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export class FloatingController implements ReactiveController {
  private host: ReactiveControllerHost;
  
  private reference: HTMLElement | null = null;
  
  private floating: HTMLElement | null = null;
  
  private arrowElement: HTMLElement | null = null;

  private cleanup: (() => void) | null = null;

  private options: Required<FloatingOptions>;

  private isHostConnected = false;
  
  public isOpen = false;

  constructor(host: ReactiveControllerHost, options: FloatingOptions = {}) {
    this.options = {
      placement: options.placement || 'bottom',
      strategy: options.strategy || 'absolute',
      offset: options.offset ?? 8,
      trigger: options.trigger || 'hover',
      closeOnClickOutside: options.closeOnClickOutside ?? true,
      onOpenChange: options.onOpenChange ?? (() => undefined),
    };
    this.host = host;
    this.host.addController(this);
  }

  hostConnected() {
    this.isHostConnected = true;
    if (this.options.closeOnClickOutside) {
      document.addEventListener('mousedown', this.handleOutsideClick);
    }
  }

  hostDisconnected() {
    this.isHostConnected = false;
    this.cleanup?.();
    this.removeEventListeners();
    document.removeEventListener('mousedown', this.handleOutsideClick);
  }

  setElements(reference: HTMLElement, floating: HTMLElement, arrowElement?: HTMLElement) {
    this.cleanup?.();
    this.cleanup = null;
    this.removeEventListeners();
    this.reference = reference;
    this.floating = floating;
    this.arrowElement = arrowElement || null;
    this.setupEventListeners();
    if (this.isOpen) {
      this.updatePosition();
    }
  }

  setOptions(options: Partial<FloatingOptions>) {
    const previousTrigger = this.options.trigger;
    const previousCloseOnClickOutside = this.options.closeOnClickOutside;

    this.options = {
      ...this.options,
      ...options,
      onOpenChange: options.onOpenChange ?? this.options.onOpenChange,
    };

    if (this.reference && previousTrigger !== this.options.trigger) {
      this.removeEventListeners();
      this.setupEventListeners();
    }

    if (this.isHostConnected && previousCloseOnClickOutside !== this.options.closeOnClickOutside) {
      document.removeEventListener('mousedown', this.handleOutsideClick);
      if (this.options.closeOnClickOutside) {
        document.addEventListener('mousedown', this.handleOutsideClick);
      }
    }

    if (this.isOpen) {
      this.updatePosition();
    }
  }

  private setupEventListeners() {
    if (!this.reference) return;

    if (this.options.trigger === 'hover' || this.options.trigger === 'hover-focus') {
      this.reference.addEventListener('mouseenter', this.open);
      this.reference.addEventListener('mouseleave', this.close);
    }

    if (this.options.trigger === 'click') {
      this.reference.addEventListener('click', this.toggle);
    }

    if (this.options.trigger === 'context-menu') {
      this.reference.addEventListener('contextmenu', this.handleContextMenu);
    }

    if (this.options.trigger === 'focus' || this.options.trigger === 'hover-focus') {
      this.reference.addEventListener('focusin', this.open);
      this.reference.addEventListener('focusout', this.handleFocusOut);
    }
  }

  private removeEventListeners() {
    if (!this.reference) return;
    this.reference.removeEventListener('mouseenter', this.open);
    this.reference.removeEventListener('mouseleave', this.close);
    this.reference.removeEventListener('click', this.toggle);
    this.reference.removeEventListener('contextmenu', this.handleContextMenu);
    this.reference.removeEventListener('focusin', this.open);
    this.reference.removeEventListener('focusout', this.handleFocusOut);
  }

  private toggle = () => (this.isOpen ? this.close() : this.open());

  private handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    this.open();
  };

  private handleFocusOut = (e: FocusEvent) => {
    if (!this.reference || this.reference.contains(e.relatedTarget as Node)) return;
    this.close();
  };

  private handleOutsideClick = (e: MouseEvent) => {
    if (
      this.isOpen &&
      this.reference &&
      this.floating &&
      !this.reference.contains(e.target as Node) &&
      !this.floating.contains(e.target as Node)
    ) {
      this.close();
    }
  };

  open = () => {
    if (this.isOpen) return;
    this.isOpen = true;
    this.options.onOpenChange(this.isOpen);
    this.host.requestUpdate();
    this.updatePosition();
  };

  close = () => {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.options.onOpenChange(this.isOpen);
    this.cleanup?.();
    this.cleanup = null;
    this.host.requestUpdate();
  };

  private updatePosition() {
    if (!this.reference || !this.floating) return;

    this.cleanup = autoUpdate(this.reference, this.floating, () => {
      if (!this.reference || !this.floating) return;

      const middleware: Middleware[] = [
        offset(this.options.offset),
        flip(),
        shift({ padding: 5 }),
      ];

      if (this.arrowElement) {
        middleware.push(arrow({ element: this.arrowElement }));
      }

      computePosition(this.reference, this.floating, {
        placement: this.options.placement,
        strategy: this.options.strategy,
        middleware,
      }).then(({ x, y, placement, middlewareData }) => {
        if (!this.floating) return;

        Object.assign(this.floating.style, {
          left: `${x}px`,
          top: `${y}px`,
          position: this.options.strategy,
        });

        if (this.arrowElement && middlewareData.arrow) {
          const { x: ax, y: ay } = middlewareData.arrow;
          const staticSide = {
            top: 'bottom',
            right: 'left',
            bottom: 'top',
            left: 'right',
          }[placement.split('-')[0]]!;

          Object.assign(this.arrowElement.style, {
            left: ax != null ? `${ax}px` : '',
            top: ay != null ? `${ay}px` : '',
            right: '',
            bottom: '',
            [staticSide]: '-4px',
          });
        }
      });
    });
  }
}
