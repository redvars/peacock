import { LitElement } from 'lit';
/**
 * @label Image
 * @tag wc-image
 * @rawTag image
 * @summary An image that loads as it nears the viewport, with an optional dark-theme source and a click-to-enlarge preview.
 *
 * @overview
 * <p>Until the image is within 200px of the viewport a placeholder is shown in its place; then
 * the <code>&lt;img&gt;</code> is rendered. Set <code>alt</code> as on a native image, or leave it
 * empty for a decorative one.</p>
 * <p><code>dark-src</code> is used instead of <code>src</code> while the theme is dark; when the
 * theme changes the image loads again from the matching source.</p>
 * <p>With <code>preview</code>, clicking the image opens it in a modal dialog labelled from
 * Peacock's strings. Clicking the backdrop closes it.</p>
 * @tags media
 *
 * @example
 * ```html
 * <wc-image src="image.jpg" alt="Description"></wc-image>
 * ```
 */
export declare class Image extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /** Primary image source */
    src: string;
    /** Optional dark-mode image source */
    darkSrc: string;
    /** Text alternative for the image, as on a native `<img>`. Leave empty for a decorative image. */
    alt: string;
    /** Enable click-to-preview lightbox */
    preview: boolean;
    /** True when the OS/app theme is dark, used to select `darkSrc`. */
    private _isDarkMode;
    /** True once the image has entered the viewport and the `<img>` element has been rendered. */
    private _loaded;
    private _dialog?;
    /** IntersectionObserver for lazy-loading the image when it enters the viewport. */
    private _intersectionObserver;
    /** Cleanup function returned by `observeThemeChange`. */
    private _themeCleanup;
    /** Peacock's strings for the preview dialog label. */
    private readonly i18n;
    connectedCallback(): void;
    disconnectedCallback(): void;
    firstUpdated(): void;
    private _setupIntersectionObserver;
    private get _activeSrc();
    private _handleClick;
    private _handleDialogClick;
    render(): import("lit-html").TemplateResult<1>;
}
