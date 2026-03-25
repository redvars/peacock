import { html, LitElement } from 'lit';
import styles from './elevation.scss';

/**
 * @label Elevation
 * @tag wc-elevation
 * @rawTag elevation
 *
 * @summary Adds elevation to an element.
 * @overview
 *  - Elevation adds a shadow effect to an element to give it depth.
 *  - It can be used to create a sense of hierarchy or to draw attention to a particular element.
 *
 * @cssprop --elevation-level - Controls the elevation level of the shadow.
 * @cssprop --elevation-color - Controls the color of the shadow.
 *
 * @example
 * ```html
 *   <div style="position: relative; padding: var(--spacing-200);">
 *     <wc-elevation style='--elevation-level: 2; --elevation-container-shape: var(--shape-corner-extra-small);'></wc-elevation>
 *     Level 2
 *   </div>
 * ```
 * @tags display
 */
export class Elevation extends LitElement {
  static styles = [styles];

  override connectedCallback() {
    super.connectedCallback();
    // Needed for VoiceOver, which will create a "group" if the element is a
    // sibling to other content.
    this.setAttribute('aria-hidden', 'true');
  }

  render() {
    return html`<span class="shadow"></span>`;
  }
}
