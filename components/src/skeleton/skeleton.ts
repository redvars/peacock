import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './skeleton.scss';

/**
 * @label Focus Ring
 *
 * @tag p-focus-ring
 * @rawTag focus-ring
 *
 * @summary Adds a focus ring to an element.
 *
 *
 * @tags display
 */
export class Skeleton extends LitElement {
  static styles = [styles];

  @property({ type: Boolean, reflect: true }) visible: boolean = false;

  render() {
    return html` <div class="skeleton"></div>`;
  }
}
