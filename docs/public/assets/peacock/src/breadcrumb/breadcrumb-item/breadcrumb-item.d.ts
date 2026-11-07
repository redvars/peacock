import { LitElement } from 'lit';
/**
 * @label Breadcrumb Item
 * @tag wc-breadcrumb-item
 * @rawTag breadcrumb-item
 * @summary One link in a breadcrumb trail, or the current page as plain text.
 * @overview
 * <p>The item is the list item of the breadcrumb's list (<code>role="listitem"</code> on the
 * element itself, since the list sits in the breadcrumb's shadow root). Mark the page the user is on
 * with <code>current</code>: it renders as text with <code>aria-current="page"</code>.</p>
 * @tags navigation
 *
 * @example
 * ```html
 * <wc-breadcrumb-item href="#">Home</wc-breadcrumb-item>
 * ```
 */
export declare class BreadcrumbItem extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /**
     * Hyperlink to navigate to on click.
     */
    href?: string;
    /**
     * Sets or retrieves the window or frame at which to target content.
     */
    target?: string;
    /** Whether this item is the current page. Sets `aria-current="page"`. */
    current: boolean;
    /**
     * Custom separator character. If not provided, default "/" is used.
     */
    separator?: string;
    /** 1-based position among sibling breadcrumb items, used for schema.org `ListItem` metadata. */
    private position;
    connectedCallback(): void;
    private calculatePosition;
    render(): import("lit-html").TemplateResult<1>;
}
