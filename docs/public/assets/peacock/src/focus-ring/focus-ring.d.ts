import { LitElement, PropertyValues } from 'lit';
import { Attachable } from '../__internal/controllers/attachable-controller.js';
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
 * @summary A ring drawn around a control while it has keyboard focus, so people can see where focus is.
 *
 * @overview
 * <p>Attach it to a control with <code>for</code> (the control's id), by setting
 * <code>control</code>, or by calling <code>attach()</code>; otherwise it follows its parent. It
 * shows when the control gains focus and matches <code>:focus-visible</code>, and hides on blur
 * or a pointer press, so mouse and touch users do not see it. When several focus rings sit inside
 * one component, only the first to handle a focus event reacts.</p>
 * <p><code>inward</code> draws the ring inside the control's edge, for controls inside a
 * container. <code>visible</code> reflects whether the ring shows and fires
 * <code>visibility-changed</code> when it changes. The ring is hidden from assistive
 * technology.</p>
 *
 * @tags display
 *
 * @fires {Event} visibility-changed - Dispatched whenever `visible` changes.
 */
export declare class FocusRing extends LitElement implements Attachable {
    static styles: import("lit").CSSResultGroup[];
    /** When true, the focus ring is visible. Toggled automatically based on `:focus-visible` state. */
    visible: boolean;
    /** When true, the ring animates inward instead of outward (for use inside containers). */
    inward: boolean;
    /** The id of the control the ring attaches to, as the `for` attribute. */
    get htmlFor(): string | null;
    set htmlFor(htmlFor: string | null);
    /** The control the ring attaches to; without `for` or this, it follows its parent. */
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
