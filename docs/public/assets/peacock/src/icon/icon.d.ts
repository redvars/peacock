import { LitElement, PropertyValues } from 'lit';
export type IconProvider = 'material-symbols' | 'material-icons';
/**
 * @label Icon
 * @tag wc-icon
 * @rawTag icon
 * @summary An icon by name from an icon library, Material Symbols by default, or an SVG file loaded from a URL.
 * @overview
 * <p>Set <code>name</code> for an icon from the <code>provider</code> library (Material Symbols by
 * default), or <code>src</code> for an SVG file, which is fetched and rendered inline.</p>
 * <p>Icons are decorative by default (<code>aria-hidden="true"</code> on the host). Give an icon that carries
 * meaning on its own a <code>label</code>; it then becomes <code>role="img"</code> with that accessible name. Inside a
 * labelled control (an icon button, for example) leave the icon unlabelled and name the control.</p>
 *
 * @cssprop --icon-color - Controls the color of the icon.
 * @cssprop [--icon-size=1rem] - Controls the size of the icon. Defaults to "1rem"
 *
 * @fires {CustomEvent<{name?: string, src?: string, error: Error}>} icon-error - Dispatched when the icon's SVG fails to load.
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
    /**
     * Accessible name for an icon that carries meaning on its own. With a label the icon is
     * `role="img"` named by it; without one it is decorative and hidden from assistive technology.
     */
    label: string;
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
    /** True while the host's `role` and `aria-label` are the ones set from `label`. */
    private _labelled;
    willUpdate(changedProperties: PropertyValues<this>): void;
    firstUpdated(): void;
    updated(changedProperties: any): void;
    /**
     * Names the host from `label`, or hides it as decorative. An `aria-label` or `aria-labelledby`
     * the consumer put on the host is left alone, so the icon is not hidden over it.
     */
    private __syncAccessibility;
    private __scheduleUpdate;
    /** @internal */
    private __updateSvg;
    render(): import("lit-html").TemplateResult<1>;
}
