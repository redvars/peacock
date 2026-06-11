import { Placement, Strategy } from '@floating-ui/dom';
import { ReactiveController, ReactiveControllerHost } from 'lit';
export type TriggerType = 'hover' | 'click' | 'context-menu' | 'manual' | 'focus' | 'hover-focus';
export interface FloatingOptions {
    placement?: Placement;
    strategy?: Strategy;
    offset?: number;
    trigger?: TriggerType;
    closeOnClickOutside?: boolean;
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
