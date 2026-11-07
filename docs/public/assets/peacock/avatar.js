import { i, _ as __decorate, I as IndividualComponent, a as i$1, b, A } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { r } from './state-BCeDVCI9.js';
import { e } from './class-map-NDIkZErE.js';
import './directive-ZPhl09Yt.js';

var css_248z = i`* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.screen-reader-only {
  position: absolute !important;
  inline-size: 1px !important;
  block-size: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip-path: inset(50%) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

[hidden] {
  display: none !important;
}

@media (forced-colors: active) {
  .selected,
  [aria-selected=true],
  [aria-pressed=true],
  [aria-checked=true],
  [aria-current]:not([aria-current=false]) {
    outline: 2px solid Highlight;
    outline-offset: -2px;
  }
  .disabled,
  [aria-disabled=true] {
    color: GrayText;
  }
}
:host {
  display: inline-block;
  pointer-events: none;
  --avatar-size: 2rem;
  --avatar-container-color: var(--color-primary);
  --avatar-text-color: var(--color-on-primary);
  --avatar-container-shape: var(--global-avatar-container-shape);
}

:host([size=sm]) {
  --avatar-size: 1.5rem;
}

:host([size=lg]) {
  --avatar-size: 3rem;
}

.avatar-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-050);
  line-height: 0;
}

.avatar {
  border-radius: var(--avatar-container-shape);
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--avatar-text-color);
  width: var(--avatar-size);
  height: var(--avatar-size);
  font-family: var(--typography-body-large-emphasized-font-family) !important;
  font-size: var(--typography-body-large-emphasized-font-size) !important;
  font-weight: var(--typography-body-large-emphasized-font-weight) !important;
  line-height: var(--typography-body-large-emphasized-line-height) !important;
  letter-spacing: var(--typography-body-large-emphasized-letter-spacing) !important;
  background-color: var(--avatar-container-color);
  font-size: calc(var(--avatar-size) * 0.5) !important;
}
.avatar .image {
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: inherit;
  object-fit: cover;
}
.avatar .fallback-icon {
  --icon-size: calc(var(--avatar-size) * 0.6);
  --icon-color: var(--avatar-text-color);
}`;

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
let Avatar = class Avatar extends i$1 {
    constructor() {
        super(...arguments);
        /** Full name of the person. Used to derive initials when no `src` is provided. */
        this.name = '';
        /** Size of the avatar: `sm` (1.5rem), `md` (2rem, default) or `lg` (3rem). */
        this.size = 'md';
        /** True after the image at `src` failed to load, until `src` changes. */
        this.__imageFailed = false;
        this.__handleImageError = () => {
            this.__imageFailed = true;
        };
    }
    willUpdate(changed) {
        if (changed.has('src'))
            this.__imageFailed = false;
    }
    /** The initials shown without an image: first letters of the first and last words of `name`. */
    get initials() {
        const words = this.name.trim().split(/\s+/).filter(Boolean);
        if (words.length === 0)
            return '';
        const first = Array.from(words[0])[0] ?? '';
        const last = words.length > 1 ? (Array.from(words[words.length - 1])[0] ?? '') : '';
        return `${first}${last}`.toUpperCase();
    }
    __renderContent(accessibleName) {
        if (this.src && !this.__imageFailed) {
            return b `<img
        class="image"
        src=${this.src}
        alt=${accessibleName}
        @error=${this.__handleImageError}
      />`;
        }
        const { initials } = this;
        if (initials) {
            return b `<div
        class="initials"
        role=${accessibleName ? 'img' : A}
        aria-label=${accessibleName || A}
        aria-hidden=${accessibleName ? A : 'true'}
      >
        ${initials}
      </div>`;
        }
        return b `<wc-icon
      class="fallback-icon"
      name="person"
      role=${accessibleName ? 'img' : A}
      aria-label=${accessibleName || A}
      aria-hidden=${accessibleName ? A : 'true'}
    ></wc-icon>`;
    }
    render() {
        const showImage = !!this.src && !this.__imageFailed;
        const accessibleName = this.label || this.name;
        return b `<div class="avatar-container">
      <div
        class=${e({
            avatar: true,
            initials: !showImage,
            image: showImage,
        })}
      >
        ${this.__renderContent(accessibleName)}
      </div>
    </div>`;
    }
};
Avatar.styles = [css_248z];
__decorate([
    n({ type: String, reflect: true })
], Avatar.prototype, "name", void 0);
__decorate([
    n({ type: String, reflect: true })
], Avatar.prototype, "src", void 0);
__decorate([
    n({ type: String })
], Avatar.prototype, "label", void 0);
__decorate([
    n({ type: String, reflect: true })
], Avatar.prototype, "size", void 0);
__decorate([
    r()
], Avatar.prototype, "__imageFailed", void 0);
Avatar = __decorate([
    IndividualComponent
], Avatar);

export { Avatar };
//# sourceMappingURL=avatar.js.map
