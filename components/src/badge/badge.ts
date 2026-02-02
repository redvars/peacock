import { html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './badge.scss';
import { observerSlotChangesWithCallback } from '../utils.js';

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
 * <p-badge>1</p-badge>
 * ```
 * @tags display
 */
export class Badge extends LitElement {
  static styles = [styles];

  @property({ type: String, reflect: true }) name: string = '';

  @property({ type: String, reflect: true }) src?: string;

  @state()
  slotHasContent = false;

  firstUpdated() {
    observerSlotChangesWithCallback(
      this.renderRoot.querySelector('slot'),
      hasContent => {
        this.slotHasContent = hasContent;
        this.requestUpdate();
      },
    );
  }

  render() {
    return html`<div
      class=${classMap({
        badge: true,
        'slot-has-content': this.slotHasContent,
      })}
    >
      <slot></slot>
    </div>`;
  }
}
