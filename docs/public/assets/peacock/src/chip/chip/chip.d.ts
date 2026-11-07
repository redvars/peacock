import { LitElement, nothing } from 'lit';
declare const Chip_base: import("../../__internal/mixins/mixin.js").MixinReturn<import("../../__internal/mixins/mixin.js").MixinReturn<import("../../__internal/mixins/mixin.js").MixinReturn<import("../../__internal/mixins/mixin.js").MixinReturn<typeof LitElement, import("@/__internal/mixins/element-internals.js").WithElementInternals>>, import("@/__internal/mixins/hyperlink.js").Hyperlink>, import("@/button/base-button/base-button.js").BaseButton>;
/**
 * @label Chip
 * @tag wc-chip
 * @rawTag chip
 * @summary A compact button for an action, a filter or an entered value, with an optional icon and dismiss button.
 *
 * @overview
 * <p>A chip is a button, or a link when <code>href</code> is set. The default slot holds the label
 * and the <code>icon</code> slot a leading icon, which a check replaces while the chip is
 * <code>selected</code>. For a read-only status label use <code>wc-tag</code>; to lay chips out or
 * let the person pick from them use <code>wc-chip-set</code>.</p>
 * <p>With <code>selectable</code> the chip is a toggle (a filter chip) and its button gets
 * <code>aria-pressed</code> from <code>selected</code>. A selecting <code>wc-chip-set</code> sets
 * this and handles the selection; a standalone selectable chip does not toggle itself, so set
 * <code>selected</code> on <code>click</code>. <code>value</code> is what the chip set reports,
 * and defaults to the chip's text.</p>
 * <p><code>dismissible</code> adds a close button, labelled from Peacock's strings, that fires
 * <code>dismiss</code>; the chip does not remove itself. <code>disabled</code> turns the chip off;
 * <code>soft-disabled</code> with <code>disabled-reason</code> keeps it focusable and reads the
 * reason to screen readers. <code>skeleton</code> shows a placeholder while the content is not
 * known yet and ignores clicks. <code>tooltip</code> adds a tooltip and
 * <code>throttle-delay</code> throttles clicks.</p>
 * @tags display
 *
 * @fires {CustomEvent} dismiss - Dispatched when the dismiss button of a `dismissible` chip is clicked.
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
    /**
     * When true, renders the chip as a placeholder (a skeleton) while its content is not known yet,
     * and ignores clicks. It is a look, not a busy state: for a chip whose action is running, use
     * `soft-disabled` with a `disabled-reason`.
     */
    skeleton: boolean;
    /**
     * When true, the chip is in the selected/pressed state. Assistive technology hears it only on a
     * `selectable` chip (or a chip in a selecting `wc-chip-set`), as `aria-pressed`.
     */
    selected: boolean;
    /**
     * Makes the chip a toggle (a filter chip): its button gets `aria-pressed` from `selected`. A
     * `wc-chip-set` with `selectable` or `multiple` sets it on its chips and handles the selection;
     * a standalone selectable chip does not toggle itself, so the page sets `selected` on `click`.
     */
    selectable: boolean;
    /** The value a selecting `wc-chip-set` reports for this chip; defaults to its text. */
    value: string;
    /**
     * Sets the delay for throttle in milliseconds. When null (default), no throttle is applied.
     */
    throttleDelay?: number;
    /** Optional tooltip text displayed on hover. */
    tooltip?: string;
    readonly buttonElement: HTMLElement | null;
    /** Peacock's strings for the dismiss button label. */
    private readonly i18n;
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
