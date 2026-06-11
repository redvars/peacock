import { LitElement } from 'lit';
/**
 * @label SVG
 * @tag wc-svg
 * @rawTag svg
 * @summary An SVG component with lazy loading and optional preview support.
 * @overview Renders an inline SVG fetched from a URL, with lazy loading via IntersectionObserver and an optional click-to-preview lightbox.
 *
 * @cssprop --svg-color - Controls the fill color of the SVG.
 * @cssprop [--svg-size=1rem] - Controls the size of the SVG. Defaults to "1rem"
 *
 * @example
 * ```html
 * <wc-svg src="/icons/my-icon.svg" image-title="My icon"></wc-svg>
 * ```
 */
export declare class Svg extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /** URL of the SVG asset to fetch and render inline. */
    src: string;
    /** Accessible title / alt text for the SVG. */
    imageTitle: string;
    /** Enable click-to-preview lightbox. */
    preview: boolean;
    /** True once the element has entered the viewport and the SVG fetch has been initiated. */
    private _loaded;
    /** True when the lightbox preview overlay is visible. */
    private _previewOpen;
    /** Sanitized inline SVG markup ready for rendering. */
    private _svgContent;
    /** Monotonically incrementing token used to discard stale fetch results. */
    private _fetchId;
    /** IntersectionObserver that triggers the SVG fetch when the element enters the viewport. */
    private _intersectionObserver;
    disconnectedCallback(): void;
    firstUpdated(): void;
    updated(changedProperties: Map<string, unknown>): void;
    private _setupIntersectionObserver;
    private _fetchSvg;
    private _handleClick;
    private _closePreview;
    render(): import("lit-html").TemplateResult<1>;
}
