import { html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import styles from './popover-content.scss';

/**
 * @label Popover Content
 * @tag wc-popover-content
 * @rawTag popover-content
 * @summary Content container for the wc-popover component.
 * @overview
 * <p>The panel of a <code>wc-popover</code>. The popover shows it in the browser's top layer, gives it
 * <code>role="dialog"</code> and names it from the popover's <code>label</code> or from the element in the
 * <code>heading</code> slot.</p>
 * @tags display
 *
 * @slot - The popover body.
 * @slot heading - A heading for the panel; it names the dialog when the popover has no `label`.
 *
 * @csspart container - The panel surface.
 * @csspart arrow - The arrow pointing at the trigger; shown when the popover has `arrow`.
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
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** Whether the popover content is visible. Set by the enclosing `wc-popover`. */
  @property({ type: Boolean, reflect: true }) open = false;

  /** Shows the arrow that points at the trigger. Set by the enclosing `wc-popover`. */
  @property({ type: Boolean, reflect: true }) arrow = false;

  // ── Queries ──────────────────────────────────────────────────────────────

  /** The arrow element, positioned by the popover's floating-ui arrow middleware. */
  @query('.arrow') arrowElement?: HTMLElement | null;

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    return html`
      <div
        class=${classMap({
          'popover-content': true,
          open: this.open,
        })}
        part="container"
      >
        <slot name="heading"></slot>
        <slot></slot>
        <wc-elevation class="elevation"></wc-elevation>
        <div class="arrow" part="arrow"></div>
      </div>
    `;
  }
}
