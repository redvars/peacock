import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './cb-divider.scss';

/**
 * @label CB Divider
 * @tag wc-cb-divider
 * @rawTag cb-divider
 * @summary A divider line used within a condition builder to visually connect expressions with operator tags.
 * @tags condition-builder
 *
 * @example
 * ```html
 * <wc-cb-divider>
 *   <wc-tag color="green">and</wc-tag>
 * </wc-cb-divider>
 * ```
 */
@IndividualComponent
export class CbDivider extends LitElement {
  static styles = [styles];

  /** Whether to render the divider vertically instead of horizontally. */
  @property({ type: Boolean, reflect: true })
  vertical = false;

  /** Whether to render a connecting line at the start. */
  @property({ type: Boolean, reflect: true, attribute: 'connect-start' })
  connectStart = false;

  /** Whether to render a connecting line at the end. */
  @property({ type: Boolean, reflect: true, attribute: 'connect-end' })
  connectEnd = false;

  render() {
    const classes = {
      divider: true,
      'connect-start': this.connectStart,
      'connect-end': this.connectEnd,
      vertical: this.vertical,
    };

    return html`
      <div class=${classMap(classes)}>
        <div class="line line-start"></div>
        <div class="content">
          <slot></slot>
        </div>
        <div class="line line-end"></div>
      </div>
    `;
  }
}
