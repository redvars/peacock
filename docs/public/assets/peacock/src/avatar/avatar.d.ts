import { LitElement, type PropertyValues } from 'lit';
/**
 * @label Avatar
 * @tag wc-avatar
 * @rawTag avatar
 * @summary A person's picture, or their initials or a person icon when there is no picture.
 * @overview
 * <p>The avatar shows the image at <code>src</code>. Without one, or when the image fails to
 * load, it shows the initials of <code>name</code> (the first letters of its first and last
 * words), and without a name a person icon.</p>
 * <p>The avatar is named by <code>label</code>, or else <code>name</code>: the image gets it as
 * <code>alt</code>, the initials and the icon as <code>role="img"</code> with
 * <code>aria-label</code>. An avatar with neither is decorative and hidden from assistive
 * technology.</p>
 * <p><code>size</code> (<code>sm</code>, <code>md</code>, <code>lg</code>) sets
 * <code>--avatar-size</code>; setting the custom property directly still wins.</p>
 *
 * @cssprop --avatar-border-radius - Controls the border radius of the avatar.
 * @cssprop --avatar-container-color - Controls the color of the avatar container.
 * @cssprop --avatar-size - Controls the size of the avatar.
 * @cssprop --avatar-text-color - Controls the color of the text inside the avatar.
 *
 *
 * @example
 * ```html
 * <wc-avatar name="Ada Lovelace" src="https://peacock.redvars.com/assets/img/avatar.xs.webp" size="lg"></wc-avatar>
 * <wc-avatar name="Grace Brewster Hopper"></wc-avatar>
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
    /** The accessible name, when it should differ from `name` (for example "Ada Lovelace, online"). */
    label?: string;
    /** Size of the avatar: `sm` (1.5rem), `md` (2rem, default) or `lg` (3rem). */
    size: 'sm' | 'md' | 'lg';
    /** True after the image at `src` failed to load, until `src` changes. */
    private __imageFailed;
    protected willUpdate(changed: PropertyValues<this>): void;
    /** The initials shown without an image: first letters of the first and last words of `name`. */
    get initials(): string;
    private __handleImageError;
    private __renderContent;
    render(): import("lit-html").TemplateResult<1>;
}
