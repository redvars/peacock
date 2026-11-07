import { LitElement, PropertyValues } from 'lit';
/**
 * @label SVG
 * @tag wc-svg
 * @rawTag svg
 * @summary An SVG image from a URL, drawn inline so it takes the text color, loaded once it scrolls into view.
 * @overview
 * <p>Renders an inline SVG fetched from a URL, with lazy loading via IntersectionObserver and an
 * optional click-to-preview lightbox.</p>
 * <ul>
 * <li><code>src</code> is the URL of the SVG. It is fetched when the element enters the viewport,
 * sanitized, and rendered inline; a placeholder shows until then.</li>
 * <li><code>alt</code> is the text alternative, as on a native <code>&lt;img&gt;</code>: with it
 * the SVG is <code>role="img"</code>; without it, it is decorative.</li>
 * <li><code>preview</code> opens the SVG enlarged in a modal lightbox on click. Focus moves to its
 * close button, Escape closes it, and focus returns to the SVG.</li>
 * <li><code>--svg-color</code>, or the inherited <code>color</code>, tints the SVG;
 * <code>--svg-size</code> sets its size.</li>
 * </ul>
 *
 * @cssprop --svg-color - Controls the fill color of the SVG.
 * @cssprop [--svg-size=1rem] - Controls the size of the SVG. Defaults to "1rem"
 *
 * @example
 * ```html
 * <wc-svg src="/icons/my-icon.svg" alt="My icon"></wc-svg>
 * ```
 */
export declare class Svg extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /** URL of the SVG asset to fetch and render inline. */
    src: string;
    /**
     * Text alternative for the SVG, as `alt` on a native `<img>`. With it the SVG is `role="img"`
     * named by it; leave it empty for a decorative SVG.
     */
    alt: string;
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
    /** Peacock's strings for the preview dialog labels. */
    private readonly i18n;
    disconnectedCallback(): void;
    firstUpdated(): void;
    updated(changedProperties: PropertyValues<this>): void;
    private _setupIntersectionObserver;
    private _fetchSvg;
    private _handleClick;
    private _closePreview;
    render(): import("lit-html").TemplateResult<1>;
}
