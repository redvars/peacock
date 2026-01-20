import { e as e$1, i, t, E, r, g as getTypography, a as i$1, _ as __decorate, n, b as i$2, c as b } from './index-1wpxQtrZ.js';
export { I as Icon } from './index-1wpxQtrZ.js';

/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const e=e$1(class extends i{constructor(t$1){if(super(t$1),t$1.type!==t.ATTRIBUTE||"class"!==t$1.name||t$1.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(t){return " "+Object.keys(t).filter(s=>t[s]).join(" ")+" "}update(s,[i]){if(void 0===this.st){this.st=new Set,void 0!==s.strings&&(this.nt=new Set(s.strings.join(" ").split(/\s/).filter(t=>""!==t)));for(const t in i)i[t]&&!this.nt?.has(t)&&this.st.add(t);return this.render(i)}const r=s.element.classList;for(const t of this.st)t in i||(r.remove(t),this.st.delete(t));for(const t in i){const s=!!i[t];s===this.st.has(t)||this.nt?.has(t)||(s?(r.add(t),this.st.add(t)):(r.remove(t),this.st.delete(t)));}return E}});

const styles = i$1 `
  :host {
    display: inline-block;
    pointer-events: none;
    --avatar-size: 2rem;
    --avatar-background-color: var(--color-primary);
    --avatar-text-color: var(--color-on-primary);
    --avatar-border-radius: var(--global-avatar-border-radius);
  }

  .avatar-container {
    display: flex;
    align-items: center;
    gap: var(--spacing-050);
    line-height: 0;
  }

  .avatar {
    border-radius: var(--avatar-border-radius);
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--avatar-text-color);
    width: var(--avatar-size);
    height: var(--avatar-size);
    ${r(getTypography('body-large-emphasized'))}
    background-color: var(--avatar-background-color);

    font-size: calc(var(--avatar-size) * 0.4);

    .image {
      width: 100%;
      height: 100%;
      overflow: hidden;
      border-radius: inherit;
    }
  }
`;

/**
 * @summary Icons are visual symbols used to represent ideas, objects, or actions.
 *
 * @cssprop --icon-color - Controls the color of the icon.
 * @cssprop --icon-size - Controls the size of the icon.
 */
class Avatar extends i$2 {
    constructor() {
        super(...arguments);
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
}
Avatar.styles = [styles];
__decorate([
    n({ type: String, reflect: true })
], Avatar.prototype, "name", void 0);
__decorate([
    n({ type: String, reflect: true })
], Avatar.prototype, "src", void 0);

export { Avatar };
//# sourceMappingURL=index.js.map
