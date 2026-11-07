import { html, LitElement } from 'lit';
import styles from './elevation.scss';
import IndividualComponent from '@/IndividualComponent.js';

/**
 * @label Elevation
 * @tag wc-elevation
 * @rawTag elevation
 *
 * @summary A shadow layer placed inside an element to lift it off the page, with a shadow depth set per level and per side.
 * @overview
 * <ul>
 * <li>Elevation adds a shadow effect to an element to give it depth.</li>
 * <li>It can be used to create a sense of hierarchy or to draw attention to a particular
 * element.</li>
 * <li>It fills its nearest positioned ancestor, so place it inside an element with
 * <code>position: relative</code>. It ignores pointer events.</li>
 * <li><code>--elevation-level</code> sets the level. <code>--elevation-level-block-start</code>,
 * <code>--elevation-level-block-end</code>, <code>--elevation-level-inline-start</code> and
 * <code>--elevation-level-inline-end</code> set the level of one side and override
 * <code>--elevation-level</code> for it; the inline sides follow the reading direction.</li>
 * <li>Match the shadow to the element's corners with
 * <code>--elevation-container-shape</code>.</li>
 * </ul>
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
@IndividualComponent
export class Elevation extends LitElement {
  static styles = [styles];

  render() {
    return html`
      <span class="shadow block-start"></span>
      <span class="shadow block-end"></span>
      <span class="shadow inline-start"></span>
      <span class="shadow inline-end"></span>
    `;
  }
}


