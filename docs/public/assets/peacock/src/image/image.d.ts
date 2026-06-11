import { LitElement } from 'lit';
/**
 * @label Image
 * @tag wc-image
 * @rawTag image
 * @summary An image component with lazy loading and theme support.
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
    /** Alt text / title for the image */
    imageTitle: string;
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
    connectedCallback(): void;
    disconnectedCallback(): void;
    firstUpdated(): void;
    private _setupIntersectionObserver;
    private get _activeSrc();
    private _handleClick;
    private _handleDialogClick;
    render(): import("lit-html").TemplateResult<1>;
}
