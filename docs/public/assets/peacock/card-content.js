import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-Bdwyrvd6.js';

/**
 * @label Card Content
 * @tag wc-card-content
 * @rawTag card-content
 * @summary A padded block inside a card. A card can hold several, next to edge-to-edge media.
 *
 * @cssprop --card-content-padding - Padding on all sides. Defaults to 1rem.
 */
let CardContent = class CardContent extends i$1 {
    // ── Render ────────────────────────────────────────────────────────────────
    render() {
        return b `<slot></slot>`;
    }
};
// ── Static ────────────────────────────────────────────────────────────────
CardContent.styles = i `
    :host {
      display: block;
      padding: var(--card-content-padding, 1rem);
    }
  `;
CardContent = __decorate([
    IndividualComponent
], CardContent);

export { CardContent };
//# sourceMappingURL=card-content.js.map
