import { Placement, Strategy } from '@floating-ui/dom';
import { ReactiveController, ReactiveControllerHost } from 'lit';
export type TriggerType = 'hover' | 'click' | 'context-menu' | 'manual' | 'focus' | 'hover-focus';
export interface FloatingOptions {
    placement?: Placement;
    strategy?: Strategy;
    offset?: number;
    trigger?: TriggerType;
    closeOnClickOutside?: boolean;
    /**
     * When true, writes the space left between the reference and the viewport edge to the
     * floating element as `--floating-available-height` / `--floating-available-width`, so it
     * can cap its size and scroll instead of overflowing the viewport.
     */
    fitViewport?: boolean;
    /** Minimum distance in pixels kept between the floating element and the viewport edge. */
    viewportPadding?: number;
    onOpenChange?: (isOpen: boolean) => void;
}
export declare class FloatingController implements ReactiveController {
    private host;
    private reference;
    private floating;
    private arrowElement;
    private cleanup;
    private options;
    private isHostConnected;
    isOpen: boolean;
    constructor(host: ReactiveControllerHost, options?: FloatingOptions);
    hostConnected(): void;
    hostDisconnected(): void;
    /**
     * Removes every listener and detaches the controller from its host. Call it before replacing
     * the controller with a new one, or the old listeners keep firing.
     */
    dispose(): void;
    setElements(reference: HTMLElement, floating: HTMLElement, arrowElement?: HTMLElement): void;
    setOptions(options: Partial<FloatingOptions>): void;
    private setupEventListeners;
    private removeEventListeners;
    private toggle;
    private handleContextMenu;
    private handleFocusOut;
    private isEventInsideElement;
    private handleOutsideClick;
    open: () => void;
    close: () => void;
    private updatePosition;
}
