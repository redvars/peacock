import { LitElement } from 'lit';
/**
 * @summary Icons are visual symbols used to represent ideas, objects, or actions.
 *
 * @cssprop --icon-color - Controls the color of the icon.
 * @cssprop --icon-size - Controls the size of the icon.
 */
export declare class Avatar extends LitElement {
    static styles: import("lit").CSSResult[];
    name: string;
    src?: string;
    render(): import("lit-html").TemplateResult<1>;
    private __getInitials;
}
