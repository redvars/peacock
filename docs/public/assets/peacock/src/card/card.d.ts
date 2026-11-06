import { LitElement, nothing } from 'lit';
type CardVariant = 'elevated' | 'filled' | 'outlined';
declare const Card_base: typeof LitElement & import("../__internal/mixins/MixinConstructor.js").MixinConstructor<import("@/__internal/mixins/NativeHyperlinkMixin.js").NativeHyperlinkInterface>;
/**
 * @label Card
 * @tag wc-card
 * @rawTag card
 * @summary A surface that groups content and actions about one subject. Set `actionable` to make the whole card a button, or `href` to make it a link.
 * @cssprop --card-container-shape - Corner radius of the card. Defaults to `--shape-corner-large`.
 * @cssprop --card-padding - Padding inside the card, around its children. Defaults to 0; `wc-card-content` adds its own padding.
 * @cssprop --card-gap - Gap between the card's children. Defaults to 0.
 *
 * @example
 * ```html
 * <wc-card variant="outlined">
 *   <wc-card-content>
 *     <h3 class="text-title-large">Title</h3>
 *     <p class="text-body-medium">Supporting text</p>
 *   </wc-card-content>
 * </wc-card>
 * ```
 */
export declare class Card extends Card_base {
    static styles: import("lit").CSSResultGroup[];
    /**
     * Visual style of the card: `elevated` (a raised surface with a shadow), `filled` (a tonal surface)
     * or `outlined` (a bordered surface). Defaults to `elevated`.
     */
    variant: CardVariant;
    /**
     * Dims the card and makes its content inert. An actionable or link card also stops responding
     * to clicks and leaves the tab order, unless `disabled-reason` is set.
     */
    disabled: boolean;
    /**
     * Makes the whole card a single button that fires `click`. Its content becomes inert, so don't
     * put buttons or links inside an actionable card.
     */
    actionable: boolean;
    /**
     * Why an actionable or link card is disabled. The card stays focusable and screen readers read
     * the reason with it.
     */
    disabledReason: string;
    /**
     * Delay in milliseconds for throttling activation of an actionable or link card. When unset
     * (default), no throttle is applied.
     */
    throttleDelay?: number;
    /** Whether the default slot holds meaningful content. */
    private slotHasContent;
    readonly cardElement: HTMLElement | null;
    constructor();
    firstUpdated(): void;
    __handleClick(event: MouseEvent | KeyboardEvent): void;
    __dispatchClickWithThrottle: (event: MouseEvent | KeyboardEvent) => void;
    __dispatchClick: (event: MouseEvent | KeyboardEvent) => void;
    /** True when a disabled interactive card should stay focusable to expose its reason. */
    __isSoftDisabled(): boolean;
    __getDisabledReasonID(): "disabled-reason" | undefined;
    renderDisabledReason(): typeof nothing | import("lit-html").TemplateResult<1>;
    renderCardElement(isLinkElement: boolean): import("lit-html").TemplateResult<1>;
    renderCardContent(inertContent: boolean): import("lit-html").TemplateResult<1>;
    render(): import("lit-html").TemplateResult<1>;
}
export {};
