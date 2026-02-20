import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './badge.scss';

/**
 * @label Badge
 * @tag p-badge
 * @rawTag badge
 * @summary The badge component is used to display a small amount of information to the user.
 *
 * @cssprop --badge-color - Controls the color of the badge.
 *
 * @example
 * ```html
 * <p-badge value="1"></p-badge>
 * ```
 * @tags display
 */
export class Badge extends LitElement {
  static styles = [styles];

  /**
   * The value to display in the badge.
   */
  @property({ type: String }) value: string = '';

  render() {
    return html`<div
      class=${classMap({
        badge: true,
        'has-value': !!this.value,
      })}
    >
      ${this.value}
    </div>`;
  }
}
