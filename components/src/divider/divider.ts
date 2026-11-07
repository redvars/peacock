import { html, LitElement, PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import { observerSlotChangesWithCallback } from '@/__internal/utils/observe-slot-change.js';

import styles from './divider.scss';
import IndividualComponent from '@/IndividualComponent.js';

export type DividerOrientation = 'horizontal' | 'vertical';

/**
 * @label Divider
 * @tag wc-divider
 * @rawTag divider
 *
 * @summary A horizontal or vertical line that separates groups of content, with an optional label such as "or".
 * @overview
 * <ul>
 * <li>Dividers are used to separate content into clear groups, making it easier for users to scan
 * and understand the information presented.</li>
 * <li>Set <code>orientation</code> to <code>horizontal</code> (the default) or
 * <code>vertical</code>, depending on the layout.</li>
 * <li>Content in the default slot, such as "or", shows in the middle of the line.</li>
 * <li>The host is <code>role="separator"</code> with a matching <code>aria-orientation</code>.</li>
 * </ul>
 *
 * @cssprop --divider-color - Controls the color of the divider.
 * @cssprop --divider-spacing - Controls the space around the divider.
 * @cssprop [--divider-line-thickness=1px] - Controls the thickness of the line.
 *
 * @example
 * ```html
 * <wc-divider style="width: 12rem;">or</wc-divider>
 * ```
 * @tags display
 */
@IndividualComponent
export class Divider extends LitElement {
  static styles = [styles];

  /** Direction of the line. */
  @property({ reflect: true }) orientation: DividerOrientation = 'horizontal';

  /** True when the default slot contains content, used to show the label variant. */
  @state()
  slotHasContent = false;

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  connectedCallback() {
    super.connectedCallback();
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'separator');
    }
  }

  protected willUpdate(changed: PropertyValues<this>) {
    if (changed.has('orientation')) {
      this.setAttribute('aria-orientation', this.orientation);
    }
  }

  firstUpdated() {
    observerSlotChangesWithCallback(
      this.renderRoot.querySelector('slot'),
      hasContent => {
        this.slotHasContent = hasContent;
      },
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  render() {
    return html`<div
      class=${classMap({
        divider: true,
        vertical: this.orientation === 'vertical',
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
