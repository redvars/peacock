import { ReactiveController, ReactiveControllerHost } from 'lit';
import { type Placement } from '@floating-ui/dom';
export declare class PopoverController implements ReactiveController {
    private host;
    private options;
    private cleanup?;
    constructor(host: ReactiveControllerHost, options?: {
        placement: Placement;
        offset: number;
    });
    updatePosition(reference: HTMLElement | null, floating: HTMLElement, options?: {
        placement?: Placement;
        offset?: number;
    }): Promise<void>;
    hostDisconnected(): void;
}
