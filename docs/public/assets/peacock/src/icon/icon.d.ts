import { LitElement } from 'lit';
/**
 * @summary Icons are visual symbols used to represent ideas, objects, or actions.
 *
 * @cssprop --icon-color - Controls the color of the icon.
 * @cssprop [--icon-size=1rem] - Controls the size of the icon. Defaults to "1rem"
 */
export declare class Icon extends LitElement {
    static styles: import("lit").CSSResult[];
    name?: string;
    src?: string;
    provider?: 'material-symbols' | 'carbon';
    private svgContent;
    private loading;
    private error;
    private _fetchId;
    private _debounceTimer;
    firstUpdated(): void;
    updated(changedProperties: any): void;
    render(): import("lit-html").TemplateResult<1>;
    private __scheduleUpdate;
    /**
     * @internal
     */
    private __updateSvg;
}
