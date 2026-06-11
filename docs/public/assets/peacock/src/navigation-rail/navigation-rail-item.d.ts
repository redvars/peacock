import { LitElement, nothing } from 'lit';
/**
 * @label Navigation Rail Item
 * @tag wc-navigation-rail-item
 * @rawTag navigation-rail-item
 *
 * @summary An individual item within a navigation rail.
 * @overview
 * <p>Navigation rail items display a destination with an icon and optional label.</p>
 *
 * @example
 * ```html
 * <wc-navigation-rail-item>
 *   <wc-icon slot="icon">home</wc-icon>
 *   Home
 * </wc-navigation-rail-item>
 * ```
 * @tags navigation
 */
export declare class NavigationRailItem extends LitElement {
    #private;
    static styles: import("lit").CSSResultGroup[];
    /** Whether this item is currently active/selected. */
    active: boolean;
    /** Whether this item is disabled. */
    disabled: boolean;
    /** Whether the parent rail is in collapsed mode (labels hidden). */
    collapsed: boolean;
    /** If provided, the item renders as a link. */
    href?: string;
    /** Link target. */
    target: string;
    /** Value used for identification when managing active state externally. */
    value?: string;
    /** Reason the item is disabled (shown to screen readers). */
    disabledReason: string;
    /** Sets the delay for throttle in milliseconds. When null (default), no throttle is applied. */
    throttleDelay: number | null;
    /** True when the default slot contains label content. */
    private _hasLabel;
    /** True when the `active-icon` slot contains content. */
    private _hasActiveIcon;
    readonly itemElement: HTMLElement | null;
    constructor();
    focus(): void;
    blur(): void;
    firstUpdated(): void;
    __dispatchClickWithThrottle: (event: MouseEvent | KeyboardEvent) => void;
    __dispatchClick: (event: MouseEvent | KeyboardEvent) => void;
    __getDisabledReasonID(): string | typeof nothing;
    __renderDisabledReason(): typeof nothing | import("lit-html").TemplateResult<1>;
    __renderItemContent(): import("lit-html").TemplateResult<1>;
    render(): import("lit-html").TemplateResult<1>;
}
