import { LitElement, PropertyValues } from 'lit';
import { NavigationRailItem } from './navigation-rail-item.js';
/**
 * @label Navigation Rail
 * @tag wc-navigation-rail
 * @rawTag navigation-rail
 *
 * @summary A vertical side navigation for medium-sized screens,.
 * @overview
 * <p>Navigation rail provides access to primary destinations in an app using icons—with or without labels—on a vertical rail.</p>
 * <p>Use navigation rail on medium-sized screens (tablets) with 3–7 destinations.</p>
 *
 * @slot header - Content displayed above the rail items.
 * @slot footer - Content pinned to the bottom of the rail.
 *
 * @cssprop --nav-rail-width - Width of the rail container. Defaults to 5rem (80dp).
 * @cssprop --nav-rail-container-color - Background color of the rail. Defaults to surface color.
 * @cssprop --nav-rail-indicator-color - Color of the active indicator. Defaults to secondary-container.
 * @cssprop --nav-rail-indicator-shape - Shape (border-radius) of the active indicator. Defaults to full (pill).
 * @cssprop --nav-rail-indicator-width - Width of the active indicator. Defaults to 3.5rem (56dp).
 * @cssprop --nav-rail-indicator-height - Height of the active indicator. Defaults to 2rem (32dp).
 * @cssprop --nav-rail-inactive-icon-color - Color of inactive icons. Defaults to on-surface-variant.
 * @cssprop --nav-rail-active-icon-color - Color of active icons. Defaults to on-secondary-container.
 * @cssprop --nav-rail-inactive-label-color - Color of inactive labels. Defaults to on-surface-variant.
 * @cssprop --nav-rail-active-label-color - Color of active labels. Defaults to on-surface.
 *
 * @example
 * ```html
 * <wc-navigation-rail>
 *   <wc-navigation-rail-item active>
 *     <wc-icon slot="icon" name="home"></wc-icon>
 *     Home
 *   </wc-navigation-rail-item>
 *   <wc-navigation-rail-item>
 *     <wc-icon slot="icon" name="search"></wc-icon>
 *     Search
 *   </wc-navigation-rail-item>
 * </wc-navigation-rail>
 * ```
 * @tags navigation
 */
export declare class NavigationRail extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    static Item: typeof NavigationRailItem;
    /**
     * Display mode of the navigation rail.
     * - `"expanded"`: shows labels.
     * - `"collapsed"`: hides labels.
     */
    mode: 'expanded' | 'collapsed';
    /**
     * Whether to show a divider between the header and items sections.
     */
    showDivider: boolean;
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected firstUpdated(): void;
    protected updated(changedProperties: PropertyValues<this>): void;
    private _handleItemClick;
    private _getItems;
    private _syncItemMode;
    render(): import("lit-html").TemplateResult<1>;
}
