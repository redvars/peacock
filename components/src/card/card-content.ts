import { LitElement, html, css } from 'lit';
import IndividualComponent from '../IndividualComponent.js';

/**
 * @label Card Content
 * @tag wc-card-content
 * @rawTag card-content
 * @summary A padded block inside a card. A card can hold several, next to edge-to-edge media.
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
