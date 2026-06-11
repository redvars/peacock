import { LitElement, nothing } from 'lit';
import type { Tabs } from './tabs.js';
/**
 * @label Tab
 * @tag wc-tab
 * @rawTag tab
 *
 * @summary A tab component for use within tabs.
 * @overview
 * <p>Tab represents an individual tab in a tabs component.</p>
 *
 * @example
 * ```html
 * <wc-tab>Tab Label</wc-tab>
 * ```
 * @tags navigation
 */
export declare class Tab extends LitElement {
    #private;
    static styles: import("lit").CSSResultGroup[];
    active: boolean;
    disabled: boolean;
    disabledReason: string;
    value?: string;
    configAria?: {
        [key: string]: any;
    };
    /**
     * Sets or retrieves the window or frame at which to target content.
     */
    target: string;
    href?: string;
    /**
     * Sets the delay for throttle in milliseconds. When null (default), no throttle is applied.
     */
    throttleDelay?: number;
    hasFocus: boolean;
    slotHasContent: boolean;
    slotHasIcon: boolean;
    slotHasBadge: boolean;
    private _tabindex;
    readonly tabElement: HTMLElement | null;
    focus(): void;
    blur(): void;
    constructor();
    firstUpdated(): void;
    __dispatchClickWithThrottle: (event: MouseEvent | KeyboardEvent) => void;
    __dispatchClick: (event: MouseEvent | KeyboardEvent) => void;
    __getParentTabsVariant(): Tabs['variant'];
    render(): import("lit-html").TemplateResult<1>;
    renderTabContent(variant: Tabs['variant']): import("lit-html").TemplateResult<1>;
    renderPrimaryTabContent(): import("lit-html").TemplateResult<1>;
    renderSecondaryTabContent(): import("lit-html").TemplateResult<1>;
    renderContainedTabContent(): import("lit-html").TemplateResult<1>;
    renderFilledTabContent(): import("lit-html").TemplateResult<1>;
    renderSegmentedTabContent(): import("lit-html").TemplateResult<1>;
    __getDisabledReasonID(): string | typeof nothing;
    __renderDisabledReason(): typeof nothing | import("lit-html").TemplateResult<1>;
}
