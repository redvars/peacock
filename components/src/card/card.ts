import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import IndividualComponent from '../IndividualComponent.js';
import styles from './card.scss';

type CardVariant = 'elevated' | 'filled' | 'outlined';
type CardElevation = 0 | 1 | 2 | 3 | 4 | 5;
/**
 * @label Card
 * @tag wc-card
 * @rawTag card
 * @summary A Material 3 inspired card surface for grouping related content.
 * @cssprop --card-padding - Inner padding for the card container. Defaults to 1rem.
 * @cssprop --card-shape - Corner radius for the card container. Defaults to a large radius.
 * @cssprop --card-gap - Gap between slotted children.
 *
 * @example
 * ```html
 * <wc-card variant="outlined">
 *   <h3>Title</h3>
 *   <p>Supportive text</p>
 * </wc-card>
 * ```
 */
@IndividualComponent
export class Card extends LitElement {
  static styles = [styles];

  @property({ type: String, reflect: true })
  variant: CardVariant = 'elevated';

  @property({ type: Number, reflect: true })
  elevation: CardElevation = 1;

  render() {
    return html`<div class="card"><slot></slot></div>`;
  }
}
