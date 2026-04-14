import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './popover-content.scss';

/**
 * @label Popover Content
 * @tag wc-popover-content
 * @rawTag popover-content
 * @summary Content container for the wc-popover component.
 * @childComponent true
 * @tags display
 *
 * @cssprop --popover-content-background - Background color of the popover content. Defaults to `var(--color-surface-container)`.
 * @cssprop --popover-content-padding - Padding of the popover content. Defaults to `var(--spacing-200)`.
 * @cssprop --popover-content-border-radius - Border radius of the popover content. Defaults to `var(--shape-corner-small)`.
 * @cssprop --popover-content-min-width - Minimum width of the popover content. Defaults to `10rem`.
 *
 * @example
 * ```html
 * <wc-popover-content>
 *   <p>Popover body text</p>
 * </wc-popover-content>
 * ```
 */
@IndividualComponent
export class PopoverContent extends LitElement {
  static styles = [styles];

  /**
   * Whether the popover content is visible.
   */
  @property({ type: Boolean, reflect: true }) open = false;

  render() {
    return html`
      <div
        class=${classMap({
          'popover-content': true,
          open: this.open,
        })}
        part="container"
      >
        <slot></slot>
        <wc-elevation class="elevation"></wc-elevation>
        <div class="arrow" part="arrow"></div>
      </div>
    `;
  }
}
