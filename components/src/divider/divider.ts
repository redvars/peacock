import { html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './divider.scss';
import { observerSlotChangesWithCallback } from '../utils.js';

/**
 * @label Divider
 * @tag p-divider
 * @rawTag divider
 *
 * @summary The divider component is used to visually separate content.
 * @overview
 *  - Dividers are used to separate content into clear groups, making it easier for users to scan and understand the information presented.
 *  - They can be oriented either vertically or horizontally, depending on the layout requirements.
 *
 * @cssprop --divider-color - Controls the color of the divider.
 * @cssprop --divider-padding - Controls the padding of the divider.
 *
 * @example
 * ```html
 * <p-divider style="width: 12rem;">or</p-divider>
 * ```
 * @tags display
 */
export class Divider extends LitElement {
  static styles = [styles];

  @property({ type: Boolean, reflect: true }) vertical = false;

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
        divider: true,
        vertical: this.vertical,
        'slot-has-content': this.slotHasContent,
      })}
    >
      <div class="line"></div>
      <div class="slot-container">
        <slot></slot>
      </div>
      <div class="line"></div>
    </div>`;
  }
}
