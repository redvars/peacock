import { html, LitElement, PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import { observerSlotChangesWithCallback } from '@/__internal/utils/observe-slot-change.js';
import { deprecate } from '@/__internal/utils/deprecate.js';

import styles from './divider.scss';
import IndividualComponent from '@/IndividualComponent.js';

export type DividerOrientation = 'horizontal' | 'vertical';

/**
 * @label Divider
 * @tag wc-divider
 * @rawTag divider
 *
 * @summary The divider component is used to visually separate content.
 * @overview
 *  - Dividers are used to separate content into clear groups, making it easier for users to scan and understand the information presented.
 *  - Set `orientation` to `horizontal` (the default) or `vertical`, depending on the layout.
 *  - The host is `role="separator"` with a matching `aria-orientation`.
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

  /**
   * @deprecated Use `orientation="vertical"`. Still works through 3.x.
   */
  @property({ type: Boolean }) vertical = false;

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
    if (changed.has('vertical') && this.vertical) {
      deprecate('wc-divider', '`vertical`', '`orientation="vertical"`');
      this.orientation = 'vertical';
    }
    if (changed.has('orientation') || changed.has('vertical')) {
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
