import { LitElement } from 'lit';
export type BrandLoaderVariant = 'build' | 'trace' | 'fill' | 'pulse' | 'orbit';
/**
 * @label Brand Loader
 * @tag wc-brand-loader
 * @rawTag brand-loader
 * @summary A loading indicator built from the Redvars r mark.
 * @cssprop --brand-loader-size - The edge of the loader.
 * @cssprop --brand-loader-tile-color - The color of the tile.
 * @cssprop --brand-loader-mark-color - The color of the r.
 * @cssprop --brand-loader-duration - The length of one loop.
 * @tags display
 *
 * @example
 * ```html
 * <wc-brand-loader></wc-brand-loader>
 * ```
 */
export declare class BrandLoader extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /** How the mark moves while loading. Ignored once `value` is set. */
    variant: BrandLoaderVariant;
    /** Progress from 0 to 100. When set, the r fills to this level instead of looping. */
    value?: number;
    /** The accessible name of the loader. */
    label: string;
    /** Plays the full animation even when the system asks for reduced motion. */
    fullMotion: boolean;
    private get determinate();
    private get progress();
    private renderMark;
    render(): import("lit-html").TemplateResult<1>;
}
