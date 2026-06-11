import { LitElement } from 'lit';
import { Tab } from './tab.js';
/**
 * @label Tabs
 * @tag wc-tabs
 * @rawTag tabs
 *
 * @summary Container for tab components.
 * @overview
 * <p>Tabs holds the tab buttons and manages their layout.</p>
 *
 * @example
 * ```html
 * <wc-tabs>
 *   <wc-tab active>Tab 1</wc-tab>
 *   <wc-tab>Tab 2</wc-tab>
 * </wc-tabs>
 * ```
 * @tags navigation
 */
export declare class Tabs extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    static Tab: typeof Tab;
    variant: 'primary' | 'secondary' | 'contained' | 'filled';
    managed: boolean;
    private __mutationObserver?;
    private __lastActiveTab?;
    connectedCallback(): void;
    firstUpdated(): void;
    updated(changedProperties: Map<string, unknown>): void;
    disconnectedCallback(): void;
    private __getTabs;
    private __getActiveTab;
    private static __getTabIndicator;
    private static __getTabBackground;
    private __getAnimationElements;
    private __animateIndicatorTransition;
    private __syncIndicatorsFromActiveState;
    private __handleTabClick;
    render(): import("lit-html").TemplateResult<1>;
}
