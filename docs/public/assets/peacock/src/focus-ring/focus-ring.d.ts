import { LitElement, PropertyValues } from 'lit';
import { Attachable } from '@/__internal/controllers/attachable-controller.js';
declare const HANDLED_BY_FOCUS_RING: unique symbol;
interface FocusRingEvent extends Event {
    [HANDLED_BY_FOCUS_RING]: true;
}
/**
 * @label Focus Ring
 *
 * @tag wc-focus-ring
 * @rawTag focus-ring
 *
 * @summary Adds a focus ring to an element.
 *
 *
 * @tags display
 *
 * @fires visibility-changed {Event} Fired whenever `visible` changes.
 */
export declare class FocusRing extends LitElement implements Attachable {
    static styles: import("lit").CSSResultGroup[];
    /** When true, the focus ring is visible. Toggled automatically based on `:focus-visible` state. */
    visible: boolean;
    /** When true, the ring animates inward instead of outward (for use inside containers). */
    inward: boolean;
    get htmlFor(): string | null;
    set htmlFor(htmlFor: string | null);
    get control(): HTMLElement | null;
    set control(control: HTMLElement | null);
    private readonly attachableController;
    attach(control: HTMLElement): void;
    detach(): void;
    connectedCallback(): void;
    /** @private */
    handleEvent(event: FocusRingEvent): void;
    private onControlChange;
    update(changed: PropertyValues<FocusRing>): void;
}
export {};
