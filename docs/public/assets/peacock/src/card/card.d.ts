import { LitElement, nothing } from 'lit';
type CardVariant = 'elevated' | 'filled' | 'outlined';
declare const Card_base: typeof LitElement & import("../__internal/mixins/MixinConstructor.js").MixinConstructor<import("@/__internal/mixins/NativeHyperlinkMixin.js").NativeHyperlinkInterface>;
/**
 * @label Card
 * @tag wc-card
 * @rawTag card
 * @summary A card surface for grouping related content.
 * @cssprop --card-padding - Inner padding for the card container. Defaults to 1rem.
 * @cssprop --card-shape - Corner radius for the card container. Defaults to a large radius.
 * @cssprop --card-gap - Gap between slotted children.
 *
 * @example
 * ```html
 * <wc-card variant="outlined" style="padding-block: 1rem;">
 *   <wc-card-content>
 *     <h3 class="text-headline">Title</h3>
 *     <p class="text-body">Supportive text</p>
 *   </wc-card-content>
 * </wc-card>
 * ```
 */
export declare class Card extends Card_base {
    #private;
    static styles: import("lit").CSSResultGroup[];
    variant: CardVariant;
    disabled: boolean;
    actionable: boolean;
    /**
     * If button is disabled, the reason why it is disabled.
     */
    disabledReason: string;
    /**
     * Sets the delay for throttle in milliseconds. When null (default), no throttle is applied.
     */
    throttleDelay?: number;
    /**
     * States
     */
    private slotHasContent;
    readonly cardElement: HTMLElement | null;
    constructor();
    firstUpdated(): void;
    __dispatchClickWithThrottle: (event: MouseEvent | KeyboardEvent) => void;
    __dispatchClick: (event: MouseEvent | KeyboardEvent) => void;
    __getDisabledReasonID(): string | typeof nothing;
    __renderDisabledReason(): typeof nothing | import("lit-html").TemplateResult<1>;
    render(): import("lit-html").TemplateResult<1>;
    renderCardElement(isLinkElement: boolean, disableSlotTabbing: boolean): import("lit-html").TemplateResult<1>;
    renderCardContent(disableSlotTabbing: boolean): import("lit-html").TemplateResult<1>;
}
export {};
