import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-Bdwyrvd6.js';

/**
 * @label Card Content
 * @tag wc-card-content
 * @rawTag card-content
 *
 * @cssprop --card-content-padding - Inner padding for the card container. Defaults to 1rem.
 *
 * ```
 */
let CardContent = class CardContent extends i$1 {
    render() {
        return b `<slot></slot>`;
    }
};
CardContent.styles = i `
      :host {
          padding-inline: 1rem;
          display: block;
      }
  `;
CardContent = __decorate([
    IndividualComponent
], CardContent);

export { CardContent };
//# sourceMappingURL=card-content.js.map
