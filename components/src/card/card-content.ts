import { LitElement, html, css } from 'lit';
import IndividualComponent from '../IndividualComponent.js';

/**
 * @label Card Content
 * @tag wc-card-content
 * @rawTag card-content
 * @parentRawTag 
 * 
 * @cssprop --card-content-padding - Inner padding for the card container. Defaults to 1rem.
 *
 * ```
 */
@IndividualComponent
export class CardContent extends LitElement {
  static styles = css`
      :host {
          padding-inline: 1rem;
          display: block;
      }
  `;

   render() {
    return html`<slot></slot>`;
   }
}