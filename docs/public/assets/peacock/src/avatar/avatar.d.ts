import { LitElement } from 'lit';
/**
 * @label Avatar
 * @tag wc-avatar
 * @rawTag avatar
 * @summary The Avatar component is used to represent user, and displays the profile picture, initials or fallback icon.
 *
 * @cssprop --avatar-border-radius - Controls the border radius of the avatar.
 * @cssprop --avatar-container-color - Controls the color of the avatar container.
 * @cssprop --avatar-size - Controls the size of the avatar.
 * @cssprop --avatar-text-color - Controls the color of the text inside the avatar.
 *
 *
 * @example
 * ```html
 * <wc-avatar name="Shivaji Varma" src="https://peacock.redvars.com/assets/img/avatar.xs.webp" style='--avatar-size: 4rem'></wc-avatar>
 * ```
 *
 * @tags display
 */
export declare class Avatar extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /** Full name of the person. Used to derive initials when no `src` is provided. */
    name: string;
    /** URL of the avatar image. When provided, the image is displayed instead of initials. */
    src?: string;
    render(): import("lit-html").TemplateResult<1>;
    private __getInitials;
}
