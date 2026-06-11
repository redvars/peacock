import { LitElement, nothing } from 'lit';
declare const Chip_base: import("../../__internal/mixins/mixin.js").MixinReturn<import("../../__internal/mixins/mixin.js").MixinReturn<import("../../__internal/mixins/mixin.js").MixinReturn<import("../../__internal/mixins/mixin.js").MixinReturn<typeof LitElement, import("@/__internal/mixins/element-internals.js").WithElementInternals>>, import("@/__internal/mixins/hyperlink.js").Hyperlink>, import("@/button/base-button/base-button.js").BaseButton>;
/**
 * @label Chip
 * @tag wc-chip
 * @rawTag chip
 * @summary Chip component for displaying compact information with optional actions.
 * @tags display
 *
 * @example
 * ```html
 * <wc-chip>Chip content</wc-chip>
 * ```
 */
export declare class Chip extends Chip_base {
    /** @nocollapse */ static shadowRootOptions: ShadowRootInit;
    static styles: import("lit").CSSResultGroup[];
    /** If true, the tag will have a close icon. */
    dismissible: boolean;
    /**
     * Additional ARIA attributes to pass to the inner button/anchor element.
     */
    configAria?: {
        [key: string]: any;
    };
    /** True when the `icon` slot contains at least one node. */
    private _hasIconSlotContent;
    /** When true, renders the chip in a loading skeleton state. */
    skeleton: boolean;
    /** When true, the chip is in the selected/pressed state. */
    selected: boolean;
    /**
     * Sets the delay for throttle in milliseconds. When null (default), no throttle is applied.
     */
    throttleDelay?: number;
    /** Optional tooltip text displayed on hover. */
    tooltip?: string;
    readonly buttonElement: HTMLElement | null;
    constructor();
    __dispatchClickWithThrottle: (event: MouseEvent | KeyboardEvent) => void;
    __dispatchClick: (event: MouseEvent | KeyboardEvent) => void;
    __renderDisabledReason(softDisabled: boolean): typeof nothing | import("lit-html").TemplateResult<1>;
    __renderTooltip(): typeof nothing | import("lit-html").TemplateResult<1>;
    focus(): void;
    blur(): void;
    firstUpdated(): void;
    private _dismissClickHandler;
    private _renderCloseButton;
    render(): import("lit-html").TemplateResult<1>;
    renderChipElement(): import("lit-html").TemplateResult<1>;
    renderChipContent(): import("lit-html").TemplateResult<1>;
}
export {};
