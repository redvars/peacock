import { LitElement } from 'lit';
export type IconProvider = 'material-symbols' | 'material-icons';
/**
 * @label Icon
 * @tag wc-icon
 * @rawTag icon
 * @summary Icons are visual symbols used to represent ideas, objects, or actions.
 * @overview Icons are visual symbols used to represent ideas, objects, or actions. They communicate messages at a glance, afford interactivity, and draw attention to important information.
 *
 * @cssprop --icon-color - Controls the color of the icon.
 * @cssprop [--icon-size=1rem] - Controls the size of the icon. Defaults to "1rem"
 *
 * @example
 * ```html
 * <wc-icon name="home" style="--icon-size: 2rem;"></wc-icon>
 * ```
 *
 */
export declare class Icon extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /**
     * The identifier for the icon.
     * This name corresponds to a specific SVG asset in the icon set.
     */
    name?: string;
    /** URL of an external SVG file to fetch and render inline. */
    src?: string;
    /** Icon library provider. Defaults to `"material-symbols"`. */
    provider: IconProvider;
    /** Rendered SVG markup, updated after each successful fetch. */
    private svgContent;
    /** True while an SVG fetch is in-flight. */
    private loading;
    /** Holds the last fetch error, if any. */
    private error;
    /** Monotonically incrementing token used to discard stale fetch results. */
    private _fetchId;
    /** Timer handle for debouncing rapid property changes. */
    private _debounceTimer;
    firstUpdated(): void;
    updated(changedProperties: any): void;
    private __scheduleUpdate;
    /** @internal */
    private __updateSvg;
    render(): import("lit-html").TemplateResult<1>;
}
