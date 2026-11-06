import { LitElement, html } from 'lit';
import styles from './timeline.scss';
import IndividualComponent from '@/IndividualComponent.js';
import { TimelineItem } from './timeline-item.js';

/**
 * @label Timeline
 * @tag wc-timeline
 * @rawTag timeline
 *
 * @summary A vertical timeline layout for a series of timeline items.
 * @overview
 * <p>The timeline is a list (<code>role="list"</code>) of <code>wc-timeline-item</code>s. Each
 * item takes its title in the default slot, its details in the <code>content</code> slot and its
 * marker icon in the <code>dot</code> slot.</p>
 *
 * @slot - The `wc-timeline-item`s.
 *
 * @example
 * ```html
 * <wc-timeline>
 *   <wc-timeline-item>
 *     <span>Task title</span>
 *     <span slot="content">Task completed</span>
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
