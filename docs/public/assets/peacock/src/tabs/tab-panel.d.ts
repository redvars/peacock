import { LitElement } from 'lit';
/**
 * @label Tab Panel
 * @tag wc-tab-panel
 * @rawTag tab-panel
 *
 * @summary Content panel for tabs.
 * @overview
 * <p>TabPanel contains the content associated with a tab.</p>
 *
 * @example
 * ```html
 * <wc-tab-panel>Content for this tab</wc-tab-panel>
 * ```
 * @tags navigation
 */
export declare class TabPanel extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    value?: string;
    active: boolean;
    render(): import("lit-html").TemplateResult<1>;
}
