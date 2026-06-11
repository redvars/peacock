import { LitElement, PropertyValues } from 'lit';
import { Attachable } from '@/__internal/controllers/attachable-controller.js';
/**
 * @label Ripple
 * @tag wc-ripple
 * @rawTag ripple
 *
 * @summary Provides ripple effect for interactive elements.
 * @overview
 * <p>Ripple creates a visual feedback effect when users interact with buttons or other clickable elements.</p>
 *
 * @example
 * ```html
 * <style>
 * .ripple-surface {
 *   position: relative;
 *   display: inline-flex;
 *   align-items: center;
 *   justify-content: center;
 *   width: 220px;
 *   height: 64px;
 *   border-radius: 12px;
 *   background: var(--color-surface-container-high);
 *   color: var(--color-on-surface);
 *   overflow: hidden;
 *   cursor: pointer;
 *   user-select: none;
 * }
 * </style>
 * <div class="ripple-surface">
 *   <wc-ripple></wc-ripple>
 *   Ripple Effect
 * </div>
 * ```
 * @tags display
 */
export declare class Ripple extends LitElement implements Attachable {
    static styles: import("lit").CSSResult;
    /**
     * Disables the ripple.
     */
    disabled: boolean;
    /** True while the pointer is hovering over the host element. */
    private hovered;
    /** True while a press animation is playing. */
    private pressed;
    private readonly mdRoot;
    /** CSS size string (e.g. `"48px"`) for the growing ripple circle. */
    private rippleSize;
    /** CSS scale factor applied to the ripple at the end of its animation. */
    private rippleScale;
    /** Pixel size of the ripple at its initial (pre-grow) state. */
    private initialSize;
    /** Reference to the currently running grow animation, if any. */
    private growAnimation?;
    /** Current interaction state of the ripple state machine. */
    private state;
    /** Pointer event that initiated the current press, used to calculate start coordinates. */
    private rippleStartEvent?;
    /** Bound reference to `handleEvent` passed to `addEventListener` / `removeEventListener`. */
    private readonly _boundHandleEvent;
    get htmlFor(): string | null;
    set htmlFor(htmlFor: string | null);
    get control(): HTMLElement | null;
    set control(control: HTMLElement | null);
    private readonly attachableController;
    connectedCallback(): void;
    disconnectedCallback(): void;
    attach(control: HTMLElement): void;
    detach(): void;
    private onControlChange;
    protected render(): import("lit-html").TemplateResult<1>;
    protected update(changedProps: PropertyValues<Ripple>): void;
    handlePointerenter(event: PointerEvent): void;
    handlePointerleave(event: PointerEvent): void;
    private handlePointerup;
    private handlePointerdown;
    private handleClick;
    private handlePointercancel;
    private handleContextmenu;
    private determineRippleSize;
    private getTranslationCoordinates;
    private startPressAnimation;
    private endPressAnimation;
    /**
     * Returns `true` if
     *  - the ripple element is enabled
     *  - the pointer is primary for the input type
     *  - the pointer is the pointer that started the interaction, or will start
     * the interaction
     *  - the pointer is a touch, or the pointer state has the primary button
     * held, or the pointer is hovering
     */
    private shouldReactToEvent;
    private isTouch;
    handleEvent(event: Event): Promise<void>;
    private getNormalizedPointerEventCoords;
}
