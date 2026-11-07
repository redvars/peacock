import { LitElement, html, css } from 'lit';
import IndividualComponent from '../IndividualComponent.js';

/**
 * @label Card Content
 * @tag wc-card-content
 * @rawTag card-content
 * @summary A padded block inside a card. A card can hold several, next to edge-to-edge media.
 *
 * @overview
 * <p>A card adds no padding of its own, so put text and actions in <code>wc-card-content</code> and
 * leave images and other media outside it to run to the card's edges. It is a block with 1rem of
 * padding on all sides, set with <code>--card-content-padding</code>, and no other behaviour.</p>
 *
 * @cssprop --card-content-padding - Padding on all sides. Defaults to 1rem.
 */
@IndividualComponent
export class CardContent extends LitElement {
  // ── Static ────────────────────────────────────────────────────────────────

  static styles = css`
    :host {
      display: block;
      padding: var(--card-content-padding, 1rem);
    }
  `;

  // ── Render ────────────────────────────────────────────────────────────────

  render() {
    return html`<slot></slot>`;
  }
}
