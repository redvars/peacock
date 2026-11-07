import { LitElement, nothing, type PropertyValues } from 'lit';
import type { Tabs } from './tabs.js';
/**
 * @label Tab
 * @tag wc-tab
 * @rawTag tab
 *
 * @summary One tab in a row of tabs, with an optional icon and badge; with a link address it navigates instead.
 * @overview
 * <p>A tab in a <code>wc-tabs</code> list renders a control with
 * <code>role="tab"</code> and <code>aria-selected</code>; inside a <code>wc-tab-group</code> the
 * control also points at its panel.</p>
 * <p>A tab with <code>href</code> is a link, not a tab: it renders a plain <code>&lt;a&gt;</code>
 * with <code>aria-current="page"</code> when selected. Tabs that navigate between pages are
 * navigation, so put link tabs in a <code>&lt;nav&gt;</code>.</p>
 *
 * @slot - The tab label.
 * @slot icon - An icon shown with the label.
 * @slot badge - A badge shown with the label.
 *
 * @example
 * ```html
 * <wc-tab selected>Tab Label</wc-tab>
 * ```
 * @tags navigation
 */
export declare class Tab extends LitElement {
    #private;
    /** @nocollapse */ static shadowRootOptions: ShadowRootInit;
    static styles: import("lit").CSSResultGroup[];
    /** Whether this is the chosen tab. Reflects to `aria-selected` (or `aria-current` on a link tab). */
    selected: boolean;
    disabled: boolean;
    /** Why the tab is disabled; read to screen reader users. */
    disabledReason: string;
    /** Links the tab to the `wc-tab-panel` with the same `value`, and is sent in `change`. */
    value?: string;
    /** ARIA attributes spread onto the inner control. */
    configAria?: {
        [key: string]: any;
    };
    /**
     * Sets or retrieves the window or frame at which to target content.
     */
    target: string;
    href?: string;
    /**
     * Sets the delay for throttle in milliseconds. When unset (default), no throttle is applied.
     */
    throttleDelay?: number;
    /** The panel this tab controls; set by `wc-tab-group`. */
    panel?: HTMLElement | null;
    slotHasContent: boolean;
    slotHasIcon: boolean;
    slotHasBadge: boolean;
    readonly tabElement: HTMLElement | null;
    constructor();
    firstUpdated(): void;
    updated(changed: PropertyValues): void;
    focus(options?: Parameters<HTMLElement['focus']>[0]): void;
    blur(): void;
    __dispatchClickWithThrottle: (event: MouseEvent | KeyboardEvent) => void;
    __dispatchClick: (event: MouseEvent | KeyboardEvent) => void;
    __getParentTabsVariant(): Tabs['variant'];
    __getDisabledReasonID(): string | typeof nothing;
    renderTabContent(variant: Tabs['variant']): import("lit-html").TemplateResult<1>;
    renderPrimaryTabContent(): import("lit-html").TemplateResult<1>;
    renderSecondaryTabContent(): import("lit-html").TemplateResult<1>;
    renderContainedTabContent(): import("lit-html").TemplateResult<1>;
    renderFilledTabContent(): import("lit-html").TemplateResult<1>;
    renderSegmentedTabContent(): import("lit-html").TemplateResult<1>;
    __renderDisabledReason(): typeof nothing | import("lit-html").TemplateResult<1>;
    render(): import("lit-html").TemplateResult<1>;
}
