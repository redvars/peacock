import { LitElement } from 'lit';
import { BreadcrumbItem } from '../breadcrumb-item/breadcrumb-item.js';
/**
 * @label Breadcrumb
 * @tag wc-breadcrumb
 * @rawTag breadcrumb
 * @summary A trail of links that shows where the current page sits in the site and leads back up it.
 * @overview
 * <ul>
 * <li>Breadcrumbs provide a trail for users to follow back to the starting or entry point.</li>
 * <li>They help users understand their current location within the site hierarchy.</li>
 * <li>Follows WCAG 2.1 guidelines for accessible navigation landmarks: the breadcrumb is a
 * <code>&lt;nav&gt;</code> landmark named by <code>label</code> (by default Peacock's
 * <code>breadcrumb</code> string) holding an ordered list, and each
 * <code>wc-breadcrumb-item</code> is one of its list items.</li>
 * <li>Mark the page the user is on with <code>current</code> on its item: it renders as text with
 * <code>aria-current="page"</code>.</li>
 * </ul>
 * @tags navigation
 *
 * @example
 * ```html
 * <wc-breadcrumb label="Breadcrumb">
 *   <wc-breadcrumb-item href="#">Home</wc-breadcrumb-item>
 *   <wc-breadcrumb-item href="#">Category</wc-breadcrumb-item>
 *   <wc-breadcrumb-item current>Current Page</wc-breadcrumb-item>
 * </wc-breadcrumb>
 * ```
 */
export declare class Breadcrumb extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    static Item: typeof BreadcrumbItem;
    /**
     * Accessible label for the breadcrumb navigation landmark. Defaults to Peacock's `breadcrumb` string.
     */
    label: string;
    /** Peacock's strings for the default landmark label. */
    private readonly i18n;
    render(): import("lit-html").TemplateResult<1>;
}
