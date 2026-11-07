import { LitElement } from 'lit';
import { Tab } from './tab.js';
/** Detail of the `change` event. */
export interface TabsChangeDetail {
    index: number;
    value?: string;
}
/**
 * @label Tabs
 * @tag wc-tabs
 * @rawTag tabs
 *
 * @summary The row of tabs, which the person moves between by clicking or with the arrow keys.
 * @overview
 * <p>Tabs holds the tab buttons and manages their layout. It follows the WAI-ARIA tabs pattern:
 * the host has <code>role="tablist"</code> (give it an <code>aria-label</code>), only the selected
 * tab is a tab stop, and the Left and Right arrow keys (mirrored in right-to-left layouts), Home
 * and End move between tabs. Moving to a tab selects it, so its panel shows at once. Disabled
 * tabs are skipped.</p>
 * <p>With <code>managed</code>, the tabs do not change the selection themselves: they fire
 * <code>change</code> and the consumer sets <code>selected</code> on the chosen tab.</p>
 * <p>When every tab is a link (<code>href</code>), the tabs are navigation rather than a tablist:
 * the host gets no tablist role, so wrap it in a <code>&lt;nav&gt;</code>.</p>
 *
 * @fires {CustomEvent<{index: number, value: string | undefined}>} change - Dispatched when the user selects a tab, by click or with the arrow keys.
 *
 * @example
 * ```html
 * <wc-tabs aria-label="Sections">
 *   <wc-tab selected>Tab 1</wc-tab>
 *   <wc-tab>Tab 2</wc-tab>
 * </wc-tabs>
 * ```
 * @tags navigation
 */
export declare class Tabs extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    static Tab: typeof Tab;
    variant: 'primary' | 'secondary' | 'contained' | 'filled';
    /** The consumer controls the selection: the tabs fire `change` but do not select a tab. */
    managed: boolean;
    /** One tab stop, on the selected tab; the arrow keys move it and select the tab they reach. */
    private readonly roving;
    private __mutationObserver?;
    private __lastActiveTab?;
    /** Set while a click is handled, so a click on a link tab still selects it. */
    private __clicking;
    connectedCallback(): void;
    firstUpdated(): void;
    updated(changedProperties: Map<string, unknown>): void;
    disconnectedCallback(): void;
    private __getTabs;
    private __getActiveTab;
    /** A tablist, unless every tab is a link: then the tabs are navigation. */
    private __syncRole;
    private static __getTabIndicator;
    private static __getTabBackground;
    private __getAnimationElements;
    private __animateIndicatorTransition;
    private __syncIndicatorsFromActiveState;
    /** Selects `tab` (unless managed) and tells the consumer, after a click or an arrow key. */
    private __selectFromUser;
    private __handleTabClick;
    private __handleSlotChange;
    render(): import("lit-html").TemplateResult<1>;
}
