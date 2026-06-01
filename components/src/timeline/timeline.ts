import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './timeline.scss';
import IndividualComponent from '@/IndividualComponent.js';
import { TimelineItem } from './timeline-item.js';

/**
 * @label Timeline
 * @tag wc-timeline
 * @rawTag timeline
 *
 * @summary A vertical timeline layout for a series of timeline items.
 *
 * @example
 * ```html
 * <wc-timeline>
 *   <wc-timeline-item description="Task completed">
 *     <span>Task title</span>
 *     <wc-icon slot="dot" name="check"></wc-icon>
 *   </wc-timeline-item>
 * </wc-timeline>
 * ```
 * @tags display
 */
@IndividualComponent
export class Timeline extends LitElement {
  static styles = [styles];

  static Item = TimelineItem;

  @property({ type: String, reflect: true }) orientation: 'vertical' | 'horizontal' = 'vertical';

  connectedCallback() {
    super.connectedCallback();
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'list');
    }
  }

  render() {
    return html`<div class="timeline"><slot></slot></div>`;
  }
}
