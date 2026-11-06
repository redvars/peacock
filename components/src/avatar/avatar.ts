import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './avatar.scss';
import IndividualComponent from '@/IndividualComponent.js';

/**
 * @label Avatar
 * @tag wc-avatar
 * @rawTag avatar
 * @summary The Avatar component is used to represent user, and displays the profile picture, initials or fallback icon.
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
@IndividualComponent
export class Avatar extends LitElement {
  static styles = [styles];

  /** Full name of the person. Used to derive initials when no `src` is provided. */
  @property({ type: String, reflect: true }) name: string = '';

  /** URL of the avatar image. When provided, the image is displayed instead of initials. */
  @property({ type: String, reflect: true }) src?: string;

  /** The accessible name, when it should differ from `name` (for example "Ada Lovelace, online"). */
  @property({ type: String }) label?: string;

  /** Size of the avatar: `sm` (1.5rem), `md` (2rem, default) or `lg` (3rem). */
  @property({ type: String, reflect: true }) size: 'sm' | 'md' | 'lg' = 'md';

  /** True after the image at `src` failed to load, until `src` changes. */
  @state() private __imageFailed = false;

  protected override willUpdate(changed: PropertyValues<this>) {
    if (changed.has('src')) this.__imageFailed = false;
  }

  /** The initials shown without an image: first letters of the first and last words of `name`. */
  get initials(): string {
    const words = this.name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return '';
    const first = Array.from(words[0])[0] ?? '';
    const last =
      words.length > 1 ? (Array.from(words[words.length - 1])[0] ?? '') : '';
    return `${first}${last}`.toUpperCase();
  }

  private __handleImageError = () => {
    this.__imageFailed = true;
  };

  private __renderContent(accessibleName: string) {
    if (this.src && !this.__imageFailed) {
      return html`<img
        class="image"
        src=${this.src}
        alt=${accessibleName}
        @error=${this.__handleImageError}
      />`;
    }
    const { initials } = this;
    if (initials) {
      return html`<div
        class="initials"
        role=${accessibleName ? 'img' : nothing}
        aria-label=${accessibleName || nothing}
        aria-hidden=${accessibleName ? nothing : 'true'}
      >
        ${initials}
      </div>`;
    }
    return html`<wc-icon
      class="fallback-icon"
      name="person"
      role=${accessibleName ? 'img' : nothing}
      aria-label=${accessibleName || nothing}
      aria-hidden=${accessibleName ? nothing : 'true'}
    ></wc-icon>`;
  }

  render() {
    const showImage = !!this.src && !this.__imageFailed;
    const accessibleName = this.label || this.name;
    return html`<div class="avatar-container">
      <div
        class=${classMap({
          avatar: true,
          initials: !showImage,
          image: showImage,
        })}
      >
        ${this.__renderContent(accessibleName)}
      </div>
    </div>`;
  }
}
