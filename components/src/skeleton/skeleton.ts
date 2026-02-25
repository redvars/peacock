import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './skeleton.scss';

/**
 * @label Skeleton
 *
 * @tag base-skeleton
 * @rawTag skeleton
 *
 * @summary Adds a skeleton effect to an element.
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
