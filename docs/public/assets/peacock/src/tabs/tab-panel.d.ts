import { LitElement } from 'lit';
/**
 * @label Tab Panel
 * @tag wc-tab-panel
 * @rawTag tab-panel
 *
 * @summary The content of one tab, shown while that tab is selected.
 * @overview
 * <p>The panel has <code>role="tabpanel"</code>;
 * inside a <code>wc-tab-group</code> it is labelled by its tab (<code>aria-labelledby</code>) and
 * shown while that tab is selected. It is focusable, so keyboard users reach the content right
 * after the tab list.</p>
 *
 * @example
 * ```html
 * <wc-tab-panel>Content for this tab</wc-tab-panel>
 * ```
 * @tags navigation
 */
export declare class TabPanel extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /** Links the panel to the `wc-tab` with the same `value`. */
    value?: string;
    /** Whether the panel is shown; set by `wc-tab-group` from the selected tab. */
    active: boolean;
    connectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
}
