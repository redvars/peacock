import { LitElement, nothing } from 'lit';
declare const Fab_base: import("../../__internal/mixins/mixin.js").MixinReturn<import("../../__internal/mixins/mixin.js").MixinReturn<import("../../__internal/mixins/mixin.js").MixinReturn<import("../../__internal/mixins/mixin.js").MixinReturn<import("../../__internal/mixins/mixin.js").MixinReturn<(abstract new (...args: any[]) => import("@/__internal/mixins/element-internals.js").WithElementInternals) & typeof LitElement & import("@/__internal/mixins/form-associated.js").FormAssociatedConstructor, import("@/__internal/mixins/form-associated.js").FormAssociated>, import("@/__internal/mixins/form-submitter.js").FormSubmitter>>, import("@/__internal/mixins/hyperlink.js").Hyperlink>, import("../base-button/base-button.js").BaseButton>;
/**
 * @label FAB
 * @tag wc-fab
 * @rawTag fab
 *
 * @summary The FAB (Floating Action Button) represents the primary action on a screen.
 * @overview
 * <p>A Floating Action Button (FAB) is a circular button that represents the primary action on a screen. It follows the specification and supports four color roles and two variants.</p>
 *
 * @cssprop --fab-container-color: Background color of the FAB container.
 * @cssprop --fab-label-text-color: Text and icon color of the FAB label.
 * @cssprop --fab-container-shape: Corner radius of the FAB. Defaults to var(--shape-corner-large).
 * @cssprop --fab-container-elevation-level: Elevation level of the FAB. Defaults to 3.
 *
 * @fires {MouseEvent} click - Dispatched when the FAB is clicked.
 *
 * @example
 * ```html
 * <wc-fab><wc-icon name="add"></wc-icon></wc-fab>
 * ```
 * @tags controls
 */
export declare class Fab extends Fab_base {
    /** @nocollapse */ static shadowRootOptions: ShadowRootInit;
    static styles: import("lit").CSSResultGroup[];
    /**
     * Optional label text for the extended FAB variant.
     * When set, the FAB displays both the icon and a text label.
     */
    label?: string;
    /**
     * The color role of the FAB.
     * `"surface"` uses the surface color role.
     * `"primary"` uses the primary color role.
     * `"secondary"` uses the secondary color role.
     * `"tertiary"` uses the tertiary color role.
     */
    color: 'surface' | 'primary' | 'secondary' | 'tertiary';
    /**
     * The style variant of the FAB.
     * `"tonal"` uses container colors.
     * `"filled"` uses solid role colors.
     */
    variant: 'tonal' | 'filled';
    /**
     * The size of the FAB.
     * `"sm"` renders a small FAB (40×40dp).
     * `"md"` renders a standard FAB (56×56dp). This is the default.
     * `"lg"` renders a large FAB (96×96dp).
     */
    size: 'sm' | 'md' | 'lg';
    /**
     * If `true`, the FAB is in a lowered (resting) state with reduced elevation.
     */
    lowered: boolean;
    /**
     * Tooltip text shown on hover.
     */
    tooltip?: string;
    skeleton: boolean;
    toggle: boolean;
    selected: boolean;
    readonly buttonElement: HTMLElement | null;
    constructor();
    __dispatchClick: (event: MouseEvent | KeyboardEvent) => void;
    focus(): void;
    blur(): void;
    renderDisabledReason(softDisabled: boolean): typeof nothing | import("lit-html").TemplateResult<1>;
    renderTooltip(): typeof nothing | import("lit-html").TemplateResult<1>;
    renderFabElement(isExtended: boolean): import("lit-html").TemplateResult<1>;
    renderFabContent(isExtended: boolean): import("lit-html").TemplateResult<1>;
    render(): import("lit-html").TemplateResult<1>;
}
export {};
