import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { e } from './class-map-DG7CA1et.js';
import './directive-ZPhl09Yt.js';

var css_248z = i`* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.screen-reader-only {
  display: none !important;
}

[hidden] {
  display: none !important;
}

:host {
  display: inline-block;
  pointer-events: none;
  --avatar-size: 2rem;
  --avatar-container-color: var(--color-primary);
  --avatar-text-color: var(--color-on-primary);
  --avatar-container-shape: var(--global-avatar-container-shape);
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
}`;

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
let Avatar = class Avatar extends i$1 {
    constructor() {
        super(...arguments);
        /** Full name of the person. Used to derive initials when no `src` is provided. */
        this.name = '';
    }
    render() {
        return b `<div class="avatar-container">
      <div
        class=${e({
            avatar: true,
            initials: !this.src,
            image: !!this.src,
        })}
      >
        ${this.src
            ? b `<img class="image" src=${this.src} alt=${this.name} />`
            : b `<div class="initials">${this.__getInitials()}</div>`}
      </div>
    </div>`;
    }
    __getInitials() {
        const [first = '', last = ''] = this.name.split(' ');
        return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
    }
};
Avatar.styles = [css_248z];
__decorate([
    n({ type: String, reflect: true })
], Avatar.prototype, "name", void 0);
__decorate([
    n({ type: String, reflect: true })
], Avatar.prototype, "src", void 0);
Avatar = __decorate([
    IndividualComponent
], Avatar);

export { Avatar };
//# sourceMappingURL=avatar.js.map
