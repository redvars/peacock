import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './timeline-item.scss';
import IndividualComponent from '@/IndividualComponent.js';

/**
 * @label Timeline Item
 * @tag wc-timeline-item
 * @rawTag timeline-item
 *
 * @summary An item for use inside a timeline, with a dot/marker and description.
 *
 * @example
 * ```html
 * <wc-timeline-item description="Step completed">
 *   <span>Step title</span>
 *   <wc-icon slot="dot" name="check"></wc-icon>
 * </wc-timeline-item>
 * ```
 * @tags display
 */
@IndividualComponent
export class TimelineItem extends LitElement {
  static styles = [styles];

  @property({ type: Boolean, reflect: true }) loading = false;

  connectedCallback() {
    super.connectedCallback();
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'listitem');
    }
  }

  render() {
    return html`
      <div class="timeline-item">
        <div class="marker-column">
          <div class="connector connector--top"></div>
          <div class="marker">
            <div class="marker-dot">
              ${this.loading
                ? html`<wc-circular-progress
                    class="dot-spinner"
                    indeterminate
                    aria-label="Loading"
                  ></wc-circular-progress>`
                : html`<slot name="dot"></slot>`}
            </div>
          </div>
          <div class="connector connector--bottom"></div>
        </div>

        <div class="content">
          <div class="headline"><slot></slot></div>
          <div class="description">
            <slot name="content"></slot>
          </div>
        </div>
      </div>
    `;
  }
}
