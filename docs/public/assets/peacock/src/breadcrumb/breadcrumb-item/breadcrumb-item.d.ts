import { LitElement } from 'lit';
/**
 * @label Breadcrumb Item
 * @tag wc-breadcrumb-item
 * @rawTag breadcrumb-item
 * @summary A breadcrumb item component that represents a single item in a breadcrumb navigation.
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
    /**
     * Indicates if this is the active (current) breadcrumb item.
     */
    active: boolean;
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
